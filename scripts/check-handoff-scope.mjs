#!/usr/bin/env node
// Deterministic handoff check: after an executor run, verifies that only files mapped to
// implementable findings changed and that each implementable finding changed something.
// File-level granularity: cases must map findings to disjoint files.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { validateAuditReport, implementableFindings } from '../skills/audit-frontend-designer-konvert/scripts/validate-report.mjs';
import { validateExecutionRecord, validateAcceptance } from '../skills/audit-frontend-designer-konvert/scripts/validate-execution-record.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules']);
const PROTECTED_AUDIT_FILES = new Set(['audit-report.json', 'audit-report.md']);
const toPosix = (p) => p.split(path.sep).join('/');

/** Returns { report, errors } after checking the case against its report. */
export function validateHandoffCase(handoff, rawReport) {
  const errors = [];
  if (!handoff || handoff.schemaVersion !== 1 || typeof handoff.id !== 'string') return { errors: ['case needs schemaVersion 1 and an id'] };
  const { errors: reportErrors, warnings, report } = validateAuditReport(rawReport);
  errors.push(...reportErrors.map((e) => `report: ${e}`));
  if (reportErrors.length) return { errors, warnings };
  const paths = handoff.findingPaths ?? {};
  const owner = new Map();
  for (const finding of report.findings) {
    const list = paths[finding.id];
    if (!Array.isArray(list) || !list.length || list.some((p) => typeof p !== 'string' || !p || path.isAbsolute(p) || p.split('/').includes('..'))) {
      errors.push(`findingPaths.${finding.id} must list relative paths`);
      continue;
    }
    for (const p of list) {
      if (owner.has(p)) errors.push(`${p} is mapped to ${owner.get(p)} and ${finding.id}; file-level checks need disjoint paths`);
      owner.set(p, finding.id);
    }
  }
  for (const id of Object.keys(paths)) if (!report.findings.some((f) => f.id === id)) errors.push(`findingPaths.${id} is not a finding in the report`);
  const protectedPaths = handoff.protectedPaths ?? [];
  if (!Array.isArray(protectedPaths)) errors.push('protectedPaths must be a list');
  else for (const p of protectedPaths) if (owner.has(p)) errors.push(`${p} cannot be both protected and mapped to ${owner.get(p)}`);
  const authorized = handoff.authorizedIds;
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!Array.isArray(authorized) || !authorized.length || new Set(authorized).size !== authorized.length || authorized.some((id) => typeof id !== 'string' || !report.findings.some((f) => f.id === id))) {
    errors.push('authorizedIds must list independently authorized finding IDs once');
  }
  if (typeof handoff.brief !== 'string' || !handoff.brief.trim() || (Array.isArray(authorized) && authorized.some((id) => typeof id === 'string' && !new RegExp(`(?<![A-Za-z0-9-])${escapeRegExp(id)}(?![A-Za-z0-9-])`).test(handoff.brief)))) {
    errors.push('brief must explicitly mention each independently authorized ID');
  }
  const approved = new Set(Array.isArray(authorized) ? authorized : []);
  const ready = implementableFindings(report).filter((f) => approved.has(f.id)).map((f) => f.id).sort();
  if (JSON.stringify(ready) !== JSON.stringify([...(handoff.expectedImplementable ?? [])].sort())) errors.push(`expectedImplementable does not match the report (${ready.join(', ') || 'none'})`);
  return { errors, warnings, report };
}

export async function hashTree(dir, base = dir, out = new Map()) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.name === '.audit' && entry.isDirectory()) {
      for (const auditEntry of await fs.readdir(file, { withFileTypes: true })) {
        if (!PROTECTED_AUDIT_FILES.has(auditEntry.name)) continue;
        const auditFile = path.join(file, auditEntry.name);
        if (auditEntry.isSymbolicLink()) out.set(toPosix(path.relative(base, auditFile)), `symlink:${createHash('sha256').update(await fs.readlink(auditFile)).digest('hex')}`);
        else if (auditEntry.isFile()) out.set(toPosix(path.relative(base, auditFile)), `file:${createHash('sha256').update(await fs.readFile(auditFile)).digest('hex')}`);
      }
      continue;
    }
    if (entry.isDirectory()) await hashTree(file, base, out);
    else if (entry.isSymbolicLink()) out.set(toPosix(path.relative(base, file)), `symlink:${createHash('sha256').update(await fs.readlink(file)).digest('hex')}`);
    else if (entry.isFile()) out.set(toPosix(path.relative(base, file)), `file:${createHash('sha256').update(await fs.readFile(file)).digest('hex')}`);
  }
  return out;
}

export function changedFiles(before, after) {
  const changed = new Set();
  for (const [file, hash] of after) if (before.get(file) !== hash) changed.add(file);
  for (const file of before.keys()) if (!after.has(file)) changed.add(file);
  return [...changed].sort();
}

/** Classifies changed files against the case; pass only with no violations and every implementable finding touched. */
export function checkScope(handoff, report, changed, approvedIds = handoff.authorizedIds ?? []) {
  if (!Array.isArray(approvedIds) || approvedIds.some((id) => typeof id !== 'string' || !report.findings.some((f) => f.id === id))) {
    throw new Error('approved IDs must be known finding IDs');
  }
  const approved = new Set(approvedIds);
  const ready = new Set(implementableFindings(report).filter((f) => approved.has(f.id)).map((f) => f.id));
  const allowed = new Map();
  const forbidden = new Map([
    ['.audit/audit-report.json', 'protected'],
    ['.audit/audit-report.md', 'protected'],
    ...(handoff.protectedPaths ?? []).map((p) => [p, 'protected']),
  ]);
  for (const finding of report.findings) {
    for (const p of handoff.findingPaths[finding.id]) {
      if (ready.has(finding.id)) allowed.set(p, finding.id);
      else forbidden.set(p, `${finding.id} is not implementable`);
    }
  }
  const violations = changed.filter((p) => !allowed.has(p)).map((p) => ({ path: p, reason: forbidden.get(p) ?? 'outside the approved scope' }));
  const touched = new Set(changed.filter((p) => allowed.has(p)).map((p) => allowed.get(p)));
  const notImplemented = [...ready].filter((id) => !touched.has(id)).sort();
  return { changed, implementable: [...ready].sort(), violations, notImplemented, passed: !violations.length && !notImplemented.length };
}

const STYLE_FIELDS = new Set([
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color',
  'background', 'padding', 'borderRadius', 'boxShadow', 'opacity', 'ancestorOpacityProduct',
  'contrast', 'contrastRequired', 'contrastStatus', 'backgroundIndeterminate',
  'contrastOpacityIndeterminate', 'count', 'rect.x', 'rect.y', 'rect.w', 'rect.h',
]);

export function validateComparisonArtifact(comparison) {
  const errors = [];
  if (!comparison || typeof comparison !== 'object' || comparison.schemaVersion !== 1 || (!comparison.styles && !comparison.pixels)) {
    return ['comparison: must be a valid schemaVersion 1 comparison report'];
  }
  if (comparison.styles != null) {
    const s = comparison.styles;
    if (!Number.isInteger(s.width) || s.width <= 0 || !['light', 'dark'].includes(s.scheme) || !Array.isArray(s.entries) || !s.entries.length) {
      errors.push('comparison.styles: requires positive width, scheme (light|dark), and non-empty entries');
    } else {
      for (const [i, e] of s.entries.entries()) {
        if (!e || typeof e.element !== 'string' || !/^[a-z0-9_-]+:.+/i.test(e.element) || !['added', 'removed', 'changed', 'unchanged'].includes(e.status) || !Array.isArray(e.changes)) {
          errors.push(`comparison.styles.entries[${i}]: requires category:selector element, valid status, and changes list`);
          continue;
        }
        if (e.status === 'changed') {
          if (!e.changes.length || e.changes.some((c) => !c || !STYLE_FIELDS.has(c.field) || !('before' in c) || !('after' in c) || JSON.stringify(c.before) === JSON.stringify(c.after))) {
            errors.push(`comparison.styles.entries[${i}]: changed entry requires non-empty field diffs`);
          }
        } else if (e.changes.length > 0) {
          errors.push(`comparison.styles.entries[${i}]: non-changed entry must have empty changes`);
        }
      }
    }
  }
  if (comparison.pixels != null) {
    if (!Array.isArray(comparison.pixels) || !comparison.pixels.length) {
      errors.push('comparison.pixels: must be a non-empty list');
    } else {
      for (const [i, p] of comparison.pixels.entries()) {
        if (!p || !/^pair-\d+$/.test(p.pair ?? '') || typeof p.route !== 'string' || !p.route.trim() || !Number.isInteger(p.width) || p.width <= 0 || !['light', 'dark'].includes(p.scheme) || typeof p.state !== 'string' || !p.state.trim() || !['compared', 'dimension-mismatch', 'pixel-limit', 'missing'].includes(p.status)) {
          errors.push(`comparison.pixels[${i}]: requires pair, route, width, scheme, state, and status`);
          continue;
        }
        if (p.status === 'compared' && (!Number.isInteger(p.differentPixels) || p.differentPixels < 0 || !Number.isInteger(p.totalPixels) || p.totalPixels <= 0 || p.differentPixels > p.totalPixels || typeof p.differentPercent !== 'number')) {
          errors.push(`comparison.pixels[${i}]: compared entry requires valid pixel counts`);
        }
      }
    }
  }
  return errors;
}

/** Verifies execution-record acceptance and render comparison artifacts against the approved handoff scope. */
export function verifyHandoffBehavior({ report, approvedIds, executionRecord, comparison }) {
  const errors = [];
  if (executionRecord !== undefined) {
    const check = validateExecutionRecord(executionRecord);
    errors.push(...check.errors.map((e) => `executionRecord: ${e}`));
    if (!check.errors.length) errors.push(...validateAcceptance(executionRecord, report, approvedIds).map((e) => `acceptance: ${e}`));
  }
  if (comparison !== undefined) {
    const compErrors = validateComparisonArtifact(comparison);
    errors.push(...compErrors);
    if (!compErrors.length) {
      const styleChanged = Array.isArray(comparison.styles?.entries) && comparison.styles.entries.some((e) => e.status === 'changed' && e.changes.length > 0);
      const pixelChanged = Array.isArray(comparison.pixels) && comparison.pixels.some((p) => p.status === 'compared' && p.differentPixels > 0);
      const pixelFailed = Array.isArray(comparison.pixels) && comparison.pixels.some((p) => ['dimension-mismatch', 'pixel-limit', 'missing'].includes(p.status));
      if (pixelFailed) errors.push('comparison: pixel comparison contains missing or incompatible pairs');
      if (!styleChanged && !pixelChanged) errors.push('comparison: no rendered style or pixel change was observed');
    }
  }
  return { errors, passed: errors.length === 0 };
}

async function main() {
  const { values: a } = parseArgs({ options: { case: { type: 'string' }, before: { type: 'string' }, after: { type: 'string' }, 'approved-ids': { type: 'string' }, 'execution-record': { type: 'string' }, comparison: { type: 'string' }, help: { type: 'boolean' } } });
  if (!a.case || !a.before || !a.after || a.help) {
    console.log('Usage: node scripts/check-handoff-scope.mjs --case evaluations/handoff/<case>.json --after <executed-copy> --before <prepared-baseline> [--approved-ids <id,id>] [--execution-record <file>] [--comparison <file>]');
    process.exitCode = a.help ? 0 : 2; return;
  }
  const handoff = JSON.parse(await fs.readFile(a.case, 'utf8'));
  const rawReport = JSON.parse(await fs.readFile(path.resolve(root, handoff.report), 'utf8'));
  const { errors, warnings, report } = validateHandoffCase(handoff, rawReport);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 2; return; }
  for (const warning of warnings ?? []) console.error(`Warning: ${warning}`);
  const before = await hashTree(path.resolve(a.before));
  const after = await hashTree(path.resolve(a.after));
  const approvedIds = a['approved-ids'] === undefined ? undefined : a['approved-ids'].split(',').map((s) => s.trim()).filter(Boolean);
  const scope = checkScope(handoff, report, changedFiles(before, after), approvedIds);
  const result = { case: handoff.id, ...scope };
  if (a['execution-record'] || a.comparison) {
    const executionRecord = a['execution-record'] ? JSON.parse(await fs.readFile(path.resolve(a['execution-record']), 'utf8')) : undefined;
    const comparison = a.comparison ? JSON.parse(await fs.readFile(path.resolve(a.comparison), 'utf8')) : undefined;
    result.behavior = verifyHandoffBehavior({ report, approvedIds: approvedIds ?? handoff.authorizedIds ?? [], executionRecord, comparison });
    result.passed = result.passed && result.behavior.passed;
  }
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Handoff scope check failed to run. Check the case and directories; paths were omitted.'); process.exitCode = 2; });
}
