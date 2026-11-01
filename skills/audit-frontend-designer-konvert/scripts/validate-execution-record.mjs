#!/usr/bin/env node
// Validates a minimal, privacy-conscious account of what a skill actually did.
// This structural gate cannot authenticate approval or prove that evidence is true.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { scanPrivate, validateAuditReport, implementableFindings } from './validate-report.mjs';

const SKILLS = ['audit-frontend-designer-konvert', 'design-por-referencia-konvert', 'create-frontend-from-zero-konvert'];
const RESULTS = ['observed', 'blocked', 'not_observed'];
const VERDICTS = ['passed', 'failed', 'blocked', 'not_run'];
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isList = (value) => Array.isArray(value) && value.every(isText);
const allowed = (value, keys, where, errors) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of Object.keys(value)) if (!keys.includes(key)) errors.push(`${where} contains an unsupported field; keep raw prompts, URLs and credentials out of the record`);
  }
};

export function validateExecutionRecord(record) {
  const errors = [], warnings = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { errors: ['record must be an object'], warnings };
  allowed(record, ['schema_version', 'skill', 'source_commit', 'scope', 'inspections', 'decisions', 'blocked_actions', 'verification', 'limitations'], 'record', errors);
  if (record.schema_version !== 1) errors.push('schema_version must be 1');
  if (!SKILLS.includes(record.skill)) errors.push('skill must name one of the three installed skills');
  if (!/^(?:[a-f0-9]{7,40}|unavailable)$/i.test(record.source_commit ?? '')) errors.push('source_commit must be a Git hash or unavailable');
  if (!record.scope || typeof record.scope !== 'object' || Array.isArray(record.scope)) errors.push('scope must be an object');
  else {
    allowed(record.scope, ['tasks', 'areas'], 'scope', errors);
    if (!isList(record.scope.tasks) || !record.scope.tasks.length || !isList(record.scope.areas)) errors.push('scope needs non-empty tasks and a list of areas');
  }
  for (const name of ['inspections', 'decisions', 'blocked_actions', 'verification', 'limitations']) if (!Array.isArray(record[name])) errors.push(`${name} must be a list`);
  for (const [i, row] of (Array.isArray(record.inspections) ? record.inspections : []).entries()) {
    const where = `inspections[${i}]`;
    allowed(row, ['area', 'state', 'viewport', 'result', 'evidence', 'reason'], where, errors);
    if (!isText(row?.area) || !isText(row?.state) || !isText(row?.viewport) || !RESULTS.includes(row?.result)) errors.push(`${where} needs area, state, viewport and result`);
    if (row?.result === 'observed' ? !isText(row.evidence) : !isText(row?.reason)) errors.push(`${where} needs evidence when observed or a reason otherwise`);
  }
  for (const [i, row] of (Array.isArray(record.decisions) ? record.decisions : []).entries()) {
    allowed(row, ['decision', 'basis'], `decisions[${i}]`, errors);
    if (!isText(row?.decision) || !isText(row?.basis)) errors.push(`decisions[${i}] needs decision and basis`);
  }
  if (Array.isArray(record.blocked_actions) && !isList(record.blocked_actions)) errors.push('blocked_actions must contain brief strings');
  if (Array.isArray(record.limitations) && !isList(record.limitations)) errors.push('limitations must contain brief strings');
  const seen = new Set();
  for (const [i, row] of (Array.isArray(record.verification) ? record.verification : []).entries()) {
    const where = `verification[${i}]`;
    allowed(row, ['criterion_id', 'status', 'evidence', 'reason'], where, errors);
    if (!isText(row?.criterion_id) || !VERDICTS.includes(row?.status)) errors.push(`${where} needs criterion_id and status`);
    if (row?.status === 'passed' ? !isText(row.evidence) : !isText(row?.reason)) errors.push(`${where} needs evidence when passed or a reason otherwise`);
    if (seen.has(row?.criterion_id)) errors.push(`${where} repeats criterion_id`);
    seen.add(row?.criterion_id);
  }
  scanPrivate(record, 'record', errors, warnings);
  if (/https?:\/\//i.test(JSON.stringify(record))) errors.push('record contains a raw URL; use a sanitized area label instead');
  return { errors, warnings };
}

export function validateAcceptance(record, report, approvedIds) {
  const errors = [];
  if (record?.skill !== 'design-por-referencia-konvert') errors.push('report acceptance gate requires the executor skill');
  if (!approvedIds.length || new Set(approvedIds).size !== approvedIds.length) errors.push('approved-ids must contain distinct IDs supplied by the user');
  const reportCheck = validateAuditReport(report);
  errors.push(...reportCheck.errors.map((error) => `report: ${error}`));
  if (errors.length) return errors;
  const approved = new Set(approvedIds);
  const reportIds = new Set(report.findings.map((finding) => finding.id));
  for (const id of approved) if (!reportIds.has(id)) errors.push(`approved ID ${id} is absent from the report`);
  const ready = new Set(implementableFindings(report).map((finding) => finding.id));
  const checks = Array.isArray(record?.verification) ? record.verification : [];
  for (const id of approved) {
    const result = checks.find((row) => row?.criterion_id === id);
    if (!ready.has(id)) {
      if (!result || result.status !== 'blocked' || !isText(result.reason)) errors.push(`${id} is not implementable and must be recorded as blocked`);
      continue;
    }
    if (!result || result.status !== 'passed' || !isText(result.evidence)) errors.push(`${id} lacks a passed acceptance check with evidence`);
  }
  if (![...approved].some((id) => ready.has(id))) errors.push('at least one approved finding must be implementable');
  for (const row of checks) if (reportIds.has(row?.criterion_id) && !approved.has(row.criterion_id)) errors.push(`${row.criterion_id} was checked as an unapproved finding`);
  return errors;
}

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { report: { type: 'string' }, 'approved-ids': { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || positionals.length !== 1 || Boolean(values.report) !== Boolean(values['approved-ids'])) {
    console.log('Usage: node scripts/validate-execution-record.mjs <record.json> [--report audit-report.json --approved-ids UX-001,UX-002]');
    process.exitCode = values.help ? 0 : 2; return;
  }
  let record, report;
  try {
    record = JSON.parse(await fs.readFile(positionals[0], 'utf8'));
    if (values.report) report = JSON.parse(await fs.readFile(values.report, 'utf8'));
  } catch { console.error('Could not read JSON input; paths and contents were omitted.'); process.exitCode = 2; return; }
  const { errors, warnings } = validateExecutionRecord(record);
  if (report) errors.push(...validateAcceptance(record, report, values['approved-ids'].split(',').map((id) => id.trim()).filter(Boolean)));
  for (const warning of warnings) console.error(`warning: ${warning}`);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; return; }
  console.log('Execution record is structurally valid; evidence and user approval still require human review.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
