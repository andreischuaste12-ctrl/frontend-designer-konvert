#!/usr/bin/env node
// Validates an audit report against the report contract and lists the findings the
// executor may implement. Zero dependencies; it reads files and never writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const CURRENT_SCHEMA_VERSION = 3;
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const CONFIDENCE = ['high', 'medium', 'low'];
const FINDING_KINDS = ['problem', 'opportunity', 'needs_validation'];
const EVIDENCE_TYPES = ['rendered_capture', 'interaction', 'dom', 'source_code', 'provided_material'];
const DEPENDENCY_STATUS = ['not_applicable', 'pending', 'resolved'];
const ID_PATTERN = /^[A-Za-z][A-Za-z0-9]*-\d{3,}$/;
// Coverage records what was actually inspected; states follow the knowledge units.
export const COVERAGE_STATES = ['normal', 'carregando', 'erro', 'sucesso', 'vazio', 'recuperação'];
export const COVERAGE_RESULTS = { observed: 'observado', not_observed: 'não observado', not_applicable: 'não se aplica', blocked: 'bloqueado' };
const CONFIDENCE_LABELS = { high: 'alta', medium: 'média', low: 'baixa' };
// Reports are shared; flag values that look like emails, credentials, or personal paths.
// Paths are warnings because a route such as /home/... can be legitimate.
const PRIVATE_PATTERNS = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, 'email address', 'error'],
  [/\b(?:Bearer\s+[A-Za-z0-9._~+/-]{12,}|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,})/, 'credential-like token', 'error'],
  [/[?&](?:token|access_token|session|sid|key|api_key)=/i, 'URL query with a secret-like parameter', 'error'],
  [/(?:^|[\s"'(])\/(?:home|Users|root)\/[^\s"')]+/, 'absolute personal path', 'warning'],
  [/\b[A-Z]:\\(?:Users|Documents and Settings)\\/i, 'absolute personal path', 'warning'],
];

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isTextList = (value) => Array.isArray(value) && value.every(isText);

/**
 * Converts a schema_version 1 report to version 2 semantics without mutating the input.
 * Version 1 had no way to record a resolved dependency, so any described dependency is pending.
 */
export function normalizeReport(report) {
  if (!report || typeof report !== 'object' || report.schema_version !== 1 || !Array.isArray(report.findings)) return report;
  return {
    ...report,
    schema_version: 2,
    findings: report.findings.map((finding) => {
      if (!finding || typeof finding !== 'object') return finding;
      const { requires_external_data_or_approval: legacy, ...rest } = finding;
      return {
        ...rest,
        external_dependency: legacy === false
          ? { status: 'not_applicable' }
          : { status: 'pending', detail: typeof legacy === 'string' ? legacy : '' },
      };
    }),
  };
}

export function scanPrivate(value, where, errors, warnings) {
  if (typeof value === 'string') {
    for (const [pattern, label, severity] of PRIVATE_PATTERNS) {
      if (pattern.test(value)) (severity === 'error' ? errors : warnings).push(`${where}: possible ${label}; redact before sharing`);
    }
  } else if (Array.isArray(value)) value.forEach((item, i) => scanPrivate(item, `${where}[${i}]`, errors, warnings));
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) {
    scanPrivate(key, `${where}.[key]`, errors, warnings);
    scanPrivate(item, `${where}.[field]`, errors, warnings);
  }
}

function validateDependency(dep, where, errors) {
  if (!dep || typeof dep !== 'object' || Array.isArray(dep)) { errors.push(`${where}.external_dependency must be an object`); return; }
  if (!DEPENDENCY_STATUS.includes(dep.status)) { errors.push(`${where}.external_dependency.status must be one of ${DEPENDENCY_STATUS.join(', ')}`); return; }
  if (dep.status !== 'not_applicable' && !isText(dep.detail)) errors.push(`${where}.external_dependency.detail must describe the data or approval and who owns it`);
  if (dep.status === 'resolved' && !isText(dep.resolution)) errors.push(`${where}.external_dependency.resolution must record the decision and who made it`);
  if (dep.status !== 'resolved' && dep.resolution !== undefined) errors.push(`${where}.external_dependency.resolution is only allowed when status is resolved`);
}

function validateFinding(finding, index, errors, schemaVersion) {
  const where = `findings[${index}]`;
  if (!finding || typeof finding !== 'object' || Array.isArray(finding)) { errors.push(`${where} must be an object`); return; }
  if (!isText(finding.id) || !ID_PATTERN.test(finding.id)) errors.push(`${where}.id must look like UX-001`);
  if (!PRIORITIES.includes(finding.priority)) errors.push(`${where}.priority must be one of ${PRIORITIES.join(', ')}`);
  for (const field of ['location', 'evidence_observed', 'probable_impact', 'next_step', 'acceptance_criteria']) {
    if (!isText(finding[field])) errors.push(`${where}.${field} must be a non-empty string`);
  }
  if (!CONFIDENCE.includes(finding.confidence?.level) || !isText(finding.confidence?.reason)) errors.push(`${where}.confidence needs level (${CONFIDENCE.join(', ')}) and reason`);
  if (!isTextList(finding.preserve)) errors.push(`${where}.preserve must be a list of strings`);
  if (typeof finding.approved_for_implementation !== 'boolean') errors.push(`${where}.approved_for_implementation must be a boolean`);
  if ('requires_external_data_or_approval' in finding) errors.push(`${where}.requires_external_data_or_approval belongs to schema_version 1; use external_dependency`);
  validateDependency(finding.external_dependency, where, errors);
  if (schemaVersion === CURRENT_SCHEMA_VERSION) {
    if (!FINDING_KINDS.includes(finding.finding_kind)) errors.push(`${where}.finding_kind must be one of ${FINDING_KINDS.join(', ')}`);
    if (finding.finding_kind === 'needs_validation' && finding.approved_for_implementation === true) errors.push(`${where}.needs_validation cannot be approved for implementation before validation`);
    const evidence = finding.evidence;
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence) || !EVIDENCE_TYPES.includes(evidence.type) || !isText(evidence.source) || !isText(evidence.state) || !isText(evidence.viewport)) {
      errors.push(`${where}.evidence needs type, source, state and viewport`);
    }
    for (const field of ['inference', 'hypothesis']) {
      if (!Object.hasOwn(finding, field) || (finding[field] !== null && !isText(finding[field]))) errors.push(`${where}.${field} must be null or a non-empty string`);
    }
  }
}

/**
 * Optional coverage matrix: one row per area, task, state and viewport actually in scope.
 * It is proportional to the scope, never the whole catalogue; gaps stay explicit.
 */
function validateCoverage(coverage, findingIds, errors) {
  if (coverage === undefined) return;
  if (!Array.isArray(coverage) || !coverage.length) { errors.push('coverage must be a non-empty list when present'); return; }
  const keys = new Set();
  coverage.forEach((row, i) => {
    const where = `coverage[${i}]`;
    if (!row || typeof row !== 'object' || Array.isArray(row)) { errors.push(`${where} must be an object`); return; }
    for (const field of ['area', 'task', 'viewport']) if (!isText(row[field])) errors.push(`${where}.${field} must be a non-empty string`);
    if (!COVERAGE_STATES.includes(row.state)) errors.push(`${where}.state must be one of ${COVERAGE_STATES.join(', ')}`);
    if (!Object.hasOwn(COVERAGE_RESULTS, row.result)) errors.push(`${where}.result must be one of ${Object.keys(COVERAGE_RESULTS).join(', ')}`);
    if (row.stack !== undefined && !isText(row.stack)) errors.push(`${where}.stack must be a non-empty string when present`);
    if (row.result === 'observed' && !isText(row.evidence)) errors.push(`${where}.evidence must say what was observed (capture, interaction or file) when result is observed`);
    if (row.result && row.result !== 'observed' && !isText(row.reason)) errors.push(`${where}.reason must explain why it was ${row.result.replace('_', ' ')}`);
    if (row.findings !== undefined) {
      if (!isTextList(row.findings)) errors.push(`${where}.findings must be a list of finding IDs`);
      else for (const id of row.findings) if (!findingIds.has(id)) errors.push(`${where}.findings cites unknown finding ${id}`);
      if (row.result !== 'observed' && row.findings?.length) errors.push(`${where}.findings require result observed`);
    }
    const key = [row.area, row.task, row.state, row.viewport].map((v) => String(v ?? '').trim().toLowerCase()).join('|');
    if (keys.has(key)) errors.push(`${where} repeats area, task, state and viewport of an earlier row`);
    keys.add(key);
  });
}

/** Returns { errors, warnings, report } where report is normalized to the current schema. */
export function validateAuditReport(input) {
  const errors = [];
  const warnings = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: ['report must be a JSON object'], warnings, report: input };
  if (input.schema_version === 1) warnings.push('schema_version 1 is deprecated: described dependencies are treated as pending; migrate to external_dependency');
  else if (input.schema_version === 2) warnings.push('schema_version 2 is supported for existing reports; new reports should use version 3 with structured evidence');
  else if (input.schema_version !== CURRENT_SCHEMA_VERSION) errors.push(`schema_version must be ${CURRENT_SCHEMA_VERSION} (or legacy 1 or 2)`);
  const report = normalizeReport(input);
  if (!isText(report.report_id)) errors.push('report_id must be a non-empty string');
  if (!isText(report.project)) errors.push('project must be a non-empty string');
  if (report.stack !== undefined) {
    const stack = report.stack;
    if (!stack || typeof stack !== 'object' || Array.isArray(stack) || !isText(stack.name) || !['signal', 'likely', 'confirmed'].includes(stack.level) || !isText(stack.reason)) errors.push('stack needs name, level (signal, likely, confirmed) and reason');
  }
  if (!report.scope || typeof report.scope !== 'object' || Array.isArray(report.scope) || !Object.keys(report.scope).length) errors.push('scope must be a non-empty object');
  if (!isTextList(report.evidence_limits)) errors.push('evidence_limits must be a list of strings (use an empty list only when nothing was unavailable)');
  if (!isTextList(report.preserve)) errors.push('preserve must be a list of strings');
  if (!Array.isArray(report.findings)) errors.push('findings must be a list');
  else {
    report.findings.forEach((finding, i) => validateFinding(finding, i, errors, input.schema_version));
    const ids = report.findings.map((f) => f?.id).filter(Boolean);
    const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    if (duplicates.length) errors.push(`finding IDs must be unique: ${duplicates.join(', ')}`);
  }
  validateCoverage(report.coverage, new Set((Array.isArray(report.findings) ? report.findings : []).map((f) => f?.id).filter(Boolean)), errors);
  if (input.schema_version === CURRENT_SCHEMA_VERSION) {
    if (!Array.isArray(report.coverage) || !report.coverage.length) errors.push('schema_version 3 requires a coverage matrix');
    for (const finding of Array.isArray(report.findings) ? report.findings : []) {
      if (!finding?.id) continue;
      const rows = (Array.isArray(report.coverage) ? report.coverage : []).filter((row) => row?.result === 'observed' && Array.isArray(row.findings) && row.findings.includes(finding.id));
      if (!rows.length) { errors.push(`${finding.id} needs at least one observed coverage row citing its ID`); continue; }
      if (!rows.some((row) => row.state === finding.evidence?.state && (row.viewport === finding.evidence?.viewport || row.viewport === 'todos' || finding.evidence?.viewport === 'todos'))) {
        errors.push(`${finding.id} evidence state and viewport must match an observed coverage row`);
      }
    }
  }
  const handoff = report.handoff;
  if (!handoff || typeof handoff !== 'object') errors.push('handoff must be an object');
  else {
    if (handoff.proposed_skill !== 'design-por-referencia-konvert') errors.push('handoff.proposed_skill must be design-por-referencia-konvert');
    if (!isText(handoff.summary)) errors.push('handoff.summary must be a non-empty string');
    if (handoff.implementation_performed !== false) errors.push('handoff.implementation_performed must be false: the auditor never implements');
  }
  scanPrivate(input, 'report', errors, warnings);
  return { errors, warnings, report };
}

/** A finding is implementable only when explicitly approved and not blocked by a pending dependency. */
export function implementableFindings(report) {
  if (validateAuditReport(report).errors.length) return [];
  const normalized = normalizeReport(report);
  return (normalized?.findings ?? []).filter((f) => f?.approved_for_implementation === true && ['not_applicable', 'resolved'].includes(f.external_dependency?.status));
}

const plain = (value) => String(value ?? '').replace(/\\([\\`*_{}\[\]()#+.!|>\-])/g, '$1').toLowerCase().replace(/[.;:]+(?=\s|$)/g, '').replace(/\s+/g, ' ').trim();
const sectionOf = (markdown, heading) => {
  const match = String(markdown).match(new RegExp(`^##\\s+${heading}\\s*$`, 'm'));
  if (!match) return null;
  const rest = String(markdown).slice(match.index + match[0].length);
  return rest.split(/^##\s/m)[0];
};

/** Compares the coverage table of the Markdown with the JSON coverage rows. */
function compareCoverage(report, markdown, errors) {
  const section = sectionOf(markdown, 'Cobertura');
  const rows = Array.isArray(report?.coverage) ? report.coverage : null;
  if (!rows) { if (section !== null) errors.push('Markdown has a Cobertura section but the JSON has no coverage'); return; }
  if (section === null) { errors.push('Markdown is missing the Cobertura section for the JSON coverage'); return; }
  const labels = Object.fromEntries(Object.entries(COVERAGE_RESULTS).map(([key, label]) => [label, key]));
  const tableRows = section.split('\n').filter((line) => line.trim().startsWith('|')).map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
  const body = tableRows.filter((cells, i) => i > 0 && !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));
  const tuple = (area, task, state, viewport, result) => [area, task, state, viewport, result].map(plain).join('|');
  const fromMarkdown = body.map((cells) => tuple(cells[0], cells[1], cells[2], cells[3], labels[plain(cells[5])] ?? cells[5]));
  const fromJson = rows.map((row) => tuple(row.area, row.task, row.state, row.viewport, row.result));
  for (const item of fromJson) if (!fromMarkdown.includes(item)) errors.push(`Markdown coverage is missing or differs for ${item.split('|').slice(0, 4).join(' / ')}`);
  for (const item of fromMarkdown) if (!fromJson.includes(item)) errors.push(`Markdown coverage has a row not in the JSON: ${item.split('|').slice(0, 4).join(' / ')}`);
}

/**
 * Checks that the Markdown report renders the JSON: finding IDs as `### ID` headings, their
 * fields, preserve lists, confidence and the optional coverage table.
 */
export function compareMarkdownIds(report, markdown) {
  const errors = [];
  const jsonIds = new Set((report?.findings ?? []).map((f) => f?.id).filter(Boolean));
  const headings = [...String(markdown).matchAll(/^###\s+([A-Za-z][A-Za-z0-9]*-\d{3,})\b[^\n]*\n?/gm)];
  const mdIds = new Set(headings.map((m) => m[1]));
  if (mdIds.size !== headings.length) errors.push('Markdown contains duplicate finding IDs');
  for (const id of jsonIds) if (!mdIds.has(id)) errors.push(`Markdown is missing finding ${id}`);
  for (const id of mdIds) if (!jsonIds.has(id)) errors.push(`Markdown has finding ${id} that is not in the JSON`);
  for (let i = 0; i < headings.length; i++) {
    const finding = report?.findings?.find((f) => f?.id === headings[i][1]);
    if (!finding) continue;
    const section = String(markdown).slice(headings[i].index, headings[i + 1]?.index ?? undefined).split(/^##\s/m)[0];
    const priority = section.match(/^\s*-\s+\*\*Prioridade:\*\*\s*(P[0-3])\s*$/im)?.[1];
    const approval = section.match(/^\s*-\s+\*\*Aprovado para implementação:\*\*\s*(true|false)\s*$/im)?.[1]?.toLowerCase();
    if (priority !== finding.priority) errors.push(`Markdown priority differs or is missing for ${finding.id}`);
    if (approval !== String(finding.approved_for_implementation)) errors.push(`Markdown approval differs or is missing for ${finding.id}`);
    if (report?.schema_version === CURRENT_SCHEMA_VERSION) {
      const kindLabels = { problem: 'problema', opportunity: 'oportunidade', needs_validation: 'a validar' };
      const evidenceLabels = { rendered_capture: 'captura', interaction: 'interação', dom: 'DOM', source_code: 'código', provided_material: 'material fornecido' };
      if (plain(section.match(/^\s*-\s+\*\*Classe:\*\*\s*(.*)$/im)?.[1]) !== plain(kindLabels[finding.finding_kind])) errors.push(`Markdown finding_kind differs or is missing for ${finding.id}`);
      const source = plain(section.match(/^\s*-\s+\*\*Fonte da evidência:\*\*\s*(.*)$/im)?.[1]);
      const expectedSource = plain(`${evidenceLabels[finding.evidence?.type]} — ${finding.evidence?.source}; estado ${finding.evidence?.state}; viewport ${finding.evidence?.viewport}`);
      if (source !== expectedSource) errors.push(`Markdown evidence source differs or is missing for ${finding.id}`);
      for (const [label, field] of [['Inferência', 'inference'], ['Hipótese', 'hypothesis']]) {
        const value = plain(section.match(new RegExp(`^\\s*-\\s+\\*\\*${label}:\\*\\*\\s*(.*)$`, 'im'))?.[1]);
        if (value !== plain(finding[field] ?? 'nenhuma')) errors.push(`Markdown ${field} differs or is missing for ${finding.id}`);
      }
    }
    for (const [label, field] of [['Local', 'location'], ['Evidência observada', 'evidence_observed'], ['Impacto provável', 'probable_impact'], ['Próximo passo', 'next_step'], ['Critério de aceite', 'acceptance_criteria']]) {
      const lines = section.split('\n');
      const prefix = new RegExp(`^\\s*-\\s+\\*\\*${label}:\\*\\*\\s*(.*)$`, 'i');
      const index = lines.findIndex((v) => prefix.test(v));
      const parts = index < 0 ? [] : [lines[index].match(prefix)[1]];
      for (let j = index + 1; index >= 0 && j < lines.length; j++) {
        if (/^\s*-\s+\*\*[^*]+:\*\*/.test(lines[j]) || /^\s*#{2,}\s/.test(lines[j])) break;
        parts.push(lines[j]);
      }
      const normalize = (value) => String(value ?? '').replace(/\\([\\`*_{}\[\]()#+.!|>\-])/g, '$1').replace(/\s+/g, ' ').trim();
      if (index < 0 || normalize(parts.join(' ')) !== normalize(finding[field])) errors.push(`Markdown ${field} differs or is missing for ${finding.id}`);
    }
    // The executor reads the JSON while the person approves from the Markdown: preserve and confidence must agree.
    const preserveLine = plain(section.match(/^\s*-\s+\*\*Preservar:\*\*\s*(.*)$/im)?.[1]);
    for (const item of finding.preserve ?? []) if (!preserveLine.includes(plain(item))) errors.push(`Markdown preserve list differs or is missing "${item}" for ${finding.id}`);
    const confidence = section.match(/^\s*-\s+\*\*Confiança:\*\*\s*(alta|média|baixa)\b\s*[—-]?\s*(.*)$/im);
    if (confidence?.[1]?.toLowerCase() !== CONFIDENCE_LABELS[finding.confidence?.level]) errors.push(`Markdown confidence level differs or is missing for ${finding.id}`);
    else if (!plain(confidence[2]).includes(plain(finding.confidence?.reason))) errors.push(`Markdown confidence reason differs for ${finding.id}`);
    const dependency = section.match(/^\s*-\s+\*\*Dependência externa:\*\*\s*(pendente|resolvida|não aplicável)\b/im)?.[1]?.toLowerCase();
    const expected = { pending: 'pendente', resolved: 'resolvida', not_applicable: 'não aplicável' }[finding.external_dependency?.status];
    if (dependency !== expected) errors.push(`Markdown dependency differs or is missing for ${finding.id}`);
  }
  const globalPreserve = sectionOf(markdown, 'O que preservar');
  if (globalPreserve === null) errors.push('Markdown is missing the "O que preservar" section');
  else for (const item of report?.preserve ?? []) if (!plain(globalPreserve).includes(plain(item))) errors.push(`Markdown "O que preservar" is missing "${item}"`);
  compareCoverage(report, markdown, errors);
  return errors;
}

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { markdown: { type: 'string' }, implementable: { type: 'boolean' }, 'approved-ids': { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || positionals.length !== 1) {
    console.log('Usage: node validate-report.mjs <audit-report.json> [--markdown audit-report.md] [--implementable --approved-ids UX-001,UX-002]');
    process.exitCode = values.help ? 0 : 2;
    return;
  }
  let input;
  try { input = JSON.parse(await fs.readFile(positionals[0], 'utf8')); }
  catch { console.error('Could not read the report as JSON. The path and content were omitted.'); process.exitCode = 2; return; }
  const { errors, warnings, report } = validateAuditReport(input);
  if (values.markdown) {
    try {
      const markdown = await fs.readFile(values.markdown, 'utf8');
      errors.push(...compareMarkdownIds(report, markdown));
      scanPrivate(markdown, 'markdown', errors, warnings);
    }
    catch { errors.push('Could not read the Markdown report.'); }
  }
  for (const warning of warnings) console.error(`warning: ${warning}`);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; return; }
  const eligible = implementableFindings(report);
  const approvals = new Set((values['approved-ids'] ?? '').split(',').map((v) => v.trim()).filter(Boolean));
  if ([...approvals].some((id) => !report.findings.some((f) => f.id === id))) { console.error('Unknown finding ID in approved-ids.'); process.exitCode = 1; return; }
  const ready = values.implementable ? eligible.filter((f) => approvals.has(f.id)) : eligible;
  if (values.implementable) {
    console.log(JSON.stringify({
      report_id: report.report_id,
      approval_note: 'Approved IDs are supplied by the operator and must be verified against the user request; this tool does not authenticate approval.',
      preserve: report.preserve,
      implementable: ready.map(({ id, priority, location, next_step, acceptance_criteria, preserve, external_dependency }) => ({ id, priority, location, next_step, acceptance_criteria, preserve, external_dependency })),
      blocked: report.findings.filter((f) => !ready.includes(f)).map((f) => ({
        id: f.id,
        reasons: [!f.approved_for_implementation && 'not approved in report', !approvals.has(f.id) && 'no independently supplied approval', f.external_dependency?.status === 'pending' && 'external dependency pending'].filter(Boolean),
      })),
    }, null, 2));
  } else {
    console.log(`Valid report: ${report.findings.length} finding(s); eligible in report (requires independent --approved-ids): ${ready.map((f) => f.id).join(', ') || 'none'}.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
