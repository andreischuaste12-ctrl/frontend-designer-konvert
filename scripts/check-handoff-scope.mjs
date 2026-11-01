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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.audit', '.git', 'node_modules']);
const toPosix = (p) => p.split(path.sep).join('/');

/** Returns { report, errors } after checking the case against its report. */
export function validateHandoffCase(handoff, rawReport) {
  const errors = [];
  if (!handoff || handoff.schemaVersion !== 1 || typeof handoff.id !== 'string') return { errors: ['case needs schemaVersion 1 and an id'] };
  const { errors: reportErrors, report } = validateAuditReport(rawReport);
  errors.push(...reportErrors.map((e) => `report: ${e}`));
  if (reportErrors.length) return { errors };
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
  const ready = implementableFindings(report).map((f) => f.id).sort();
  if (JSON.stringify(ready) !== JSON.stringify([...(handoff.expectedImplementable ?? [])].sort())) errors.push(`expectedImplementable does not match the report (${ready.join(', ') || 'none'})`);
  return { errors, report };
}

export async function hashTree(dir, base = dir, out = new Map()) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
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
export function checkScope(handoff, report, changed, approvedIds = handoff.expectedImplementable ?? []) {
  if (!Array.isArray(approvedIds) || approvedIds.some((id) => typeof id !== 'string' || !report.findings.some((f) => f.id === id))) {
    throw new Error('approved IDs must be known finding IDs');
  }
  const approved = new Set(approvedIds);
  const ready = new Set(implementableFindings(report).filter((f) => approved.has(f.id)).map((f) => f.id));
  const allowed = new Map();
  const forbidden = new Map((handoff.protectedPaths ?? []).map((p) => [p, 'protected']));
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

async function main() {
  const { values: a } = parseArgs({ options: { case: { type: 'string' }, before: { type: 'string' }, after: { type: 'string' }, 'approved-ids': { type: 'string' }, help: { type: 'boolean' } } });
  if (!a.case || !a.after || a.help) {
    console.log('Usage: node scripts/check-handoff-scope.mjs --case evaluations/handoff/<case>.json --after <executed-copy> [--before <pristine-copy>] [--approved-ids <id,id>]');
    process.exitCode = a.help ? 0 : 2; return;
  }
  const handoff = JSON.parse(await fs.readFile(a.case, 'utf8'));
  const rawReport = JSON.parse(await fs.readFile(path.resolve(root, handoff.report), 'utf8'));
  const { errors, report } = validateHandoffCase(handoff, rawReport);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 2; return; }
  const before = await hashTree(path.resolve(a.before ?? path.resolve(root, handoff.fixture)));
  const after = await hashTree(path.resolve(a.after));
  const result = { case: handoff.id, ...checkScope(handoff, report, changedFiles(before, after), a['approved-ids'] === undefined ? undefined : a['approved-ids'].split(',').map((s) => s.trim()).filter(Boolean)) };
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Handoff scope check failed to run. Check the case and directories; paths were omitted.'); process.exitCode = 2; });
}
