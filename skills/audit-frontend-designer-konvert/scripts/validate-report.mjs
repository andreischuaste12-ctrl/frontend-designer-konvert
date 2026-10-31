#!/usr/bin/env node
// Validates an audit report against the report contract and lists the findings the
// executor may implement. Zero dependencies; it reads files and never writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const CURRENT_SCHEMA_VERSION = 2;
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const CONFIDENCE = ['high', 'medium', 'low'];
const DEPENDENCY_STATUS = ['not_applicable', 'pending', 'resolved'];
const ID_PATTERN = /^[A-Za-z][A-Za-z0-9]*-\d{3,}$/;
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
    schema_version: CURRENT_SCHEMA_VERSION,
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

function scanPrivate(value, where, errors, warnings) {
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

function validateFinding(finding, index, errors) {
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
}

/** Returns { errors, warnings, report } where report is normalized to the current schema. */
export function validateAuditReport(input) {
  const errors = [];
  const warnings = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: ['report must be a JSON object'], warnings, report: input };
  if (input.schema_version === 1) warnings.push('schema_version 1 is deprecated: described dependencies are treated as pending; migrate to external_dependency');
  else if (input.schema_version !== CURRENT_SCHEMA_VERSION) errors.push(`schema_version must be ${CURRENT_SCHEMA_VERSION} (or legacy 1)`);
  const report = normalizeReport(input);
  if (!isText(report.report_id)) errors.push('report_id must be a non-empty string');
  if (!isText(report.project)) errors.push('project must be a non-empty string');
  if (!report.scope || typeof report.scope !== 'object' || Array.isArray(report.scope) || !Object.keys(report.scope).length) errors.push('scope must be a non-empty object');
  if (!isTextList(report.evidence_limits)) errors.push('evidence_limits must be a list of strings (use an empty list only when nothing was unavailable)');
  if (!isTextList(report.preserve)) errors.push('preserve must be a list of strings');
  if (!Array.isArray(report.findings)) errors.push('findings must be a list');
  else {
    report.findings.forEach((finding, i) => validateFinding(finding, i, errors));
    const ids = report.findings.map((f) => f?.id).filter(Boolean);
    const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    if (duplicates.length) errors.push(`finding IDs must be unique: ${duplicates.join(', ')}`);
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

/** Checks that the Markdown report renders exactly the JSON finding IDs as `### ID` headings. */
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
    const priority = section.match(/\*\*Prioridade:\*\*\s*(P[0-3])/i)?.[1];
    const approval = section.match(/\*\*Aprovado para implementação:\*\*\s*(true|false)/i)?.[1]?.toLowerCase();
    if (priority !== finding.priority) errors.push(`Markdown priority differs or is missing for ${finding.id}`);
    if (approval !== String(finding.approved_for_implementation)) errors.push(`Markdown approval differs or is missing for ${finding.id}`);
    for (const [label, field] of [['Local', 'location'], ['Evidência observada', 'evidence_observed'], ['Impacto provável', 'probable_impact'], ['Próximo passo', 'next_step'], ['Critério de aceite', 'acceptance_criteria']]) {
      const line = section.split('\n').find((v) => v.startsWith(`- **${label}:**`));
      const value = line?.slice(`- **${label}:**`.length).trim();
      if (value !== finding[field]) errors.push(`Markdown ${field} differs or is missing for ${finding.id}`);
    }
    const dependency = section.match(/\*\*Dependência externa:\*\*\s*(pendente|resolvida|não aplicável)/i)?.[1]?.toLowerCase();
    const expected = { pending: 'pendente', resolved: 'resolvida', not_applicable: 'não aplicável' }[finding.external_dependency?.status];
    if (dependency !== expected) errors.push(`Markdown dependency differs or is missing for ${finding.id}`);
  }
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
    console.log(`Valid report: ${report.findings.length} finding(s); implementable: ${ready.map((f) => f.id).join(', ') || 'none'}.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
