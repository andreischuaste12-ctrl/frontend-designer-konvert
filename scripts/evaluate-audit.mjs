#!/usr/bin/env node
// Scores graded audit runs against evaluations/audit-quality/cases.json.
// It never calls a model: a grader records which findings match which expected issue.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { redactText } from '../skills/design-por-referencia-konvert/scripts/_common.mjs';

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const CRITICAL = new Set(['P0', 'P1']);
const isId = (value) => typeof value === 'string' && value.trim().length > 0;

/** Returns a list of problems in the case file; empty means usable. */
export function validateAuditCases(data) {
  const errors = [];
  if (!data || data.schemaVersion !== 1 || !Array.isArray(data.cases) || !data.cases.length) return ['cases file needs schemaVersion 1 and a non-empty cases list'];
  if (!Number.isInteger(data.minRepetitions) || data.minRepetitions < 1) errors.push('minRepetitions must be a positive integer');
  const targets = data.targets ?? {};
  for (const key of ['reportValidRate', 'criticalRecall', 'overallRecall', 'precision', 'decoyFlagRate', 'preserveCoverage', 'priorityAgreement']) {
    if (typeof targets[key] !== 'number' || targets[key] < 0 || targets[key] > 1) errors.push(`targets.${key} must be between 0 and 1`);
  }
  if (!Number.isInteger(targets.unsupportedClaims) || targets.unsupportedClaims < 0) errors.push('targets.unsupportedClaims must be a non-negative integer');
  const caseIds = new Set();
  for (const item of data.cases) {
    if (!isId(item?.id) || caseIds.has(item.id)) { errors.push('case IDs must be unique non-empty strings'); continue; }
    caseIds.add(item.id);
    if (!isId(item.fixture) || !isId(item.brief)) errors.push(`${item.id}: fixture and brief are required`);
    for (const group of ['expected', 'decoys', 'preserve']) {
      const list = item[group];
      if (!Array.isArray(list) || !list.length) { errors.push(`${item.id}: ${group} must be a non-empty list`); continue; }
      const ids = list.map((x) => x?.id);
      if (ids.some((id) => !isId(id)) || new Set(ids).size !== ids.length) errors.push(`${item.id}: ${group} IDs must be unique`);
      if (list.some((x) => !isId(x?.summary))) errors.push(`${item.id}: every ${group} entry needs a summary`);
    }
    if (Array.isArray(item.expected) && item.expected.some((x) => !PRIORITIES.includes(x?.priority) || !isId(x?.evidence))) errors.push(`${item.id}: expected issues need a priority and evidence`);
  }
  return errors;
}

function ratio(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

/** Validates graded runs and computes micro-averaged metrics; throws on inconsistent grading. */
export function scoreAudit(data, runs) {
  const cases = new Map(data.cases.map((c) => [c.id, c]));
  if (!Array.isArray(runs) || !runs.length) throw new Error('At least one graded run is required.');
  const seen = new Set();
  const totals = { runs: 0, valid: 0, critical: 0, criticalFound: 0, expected: 0, expectedFound: 0, correctFindings: 0, findings: 0, decoySlots: 0, decoysFlagged: 0, preserveSlots: 0, preserveCovered: 0, matches: 0, priorityAgreed: 0, unsupportedClaims: 0 };
  const perCase = {};
  for (const run of runs) {
    const item = cases.get(run?.caseId);
    if (!item) throw new Error('Run references an unknown case.');
    const key = `${run.caseId}#${run.repetition}`;
    if (!Number.isInteger(run.repetition) || run.repetition < 1 || seen.has(key)) throw new Error('Repetitions must be unique positive integers per case.');
    seen.add(key);
    if (typeof run.reportValid !== 'boolean' || !Number.isInteger(run.findingsTotal) || run.findingsTotal < 0 || !Number.isInteger(run.unsupportedClaims) || run.unsupportedClaims < 0) throw new Error('Run needs reportValid, findingsTotal, and unsupportedClaims.');
    for (const field of ['matches', 'validExtra', 'decoysFlagged', 'preserveCovered']) if (!Array.isArray(run[field])) throw new Error(`Run needs a ${field} list (use [] when empty).`);
    const expected = new Map(item.expected.map((x) => [x.id, x]));
    const usedExpected = new Set();
    const usedFindings = new Set();
    for (const match of run.matches) {
      if (!expected.has(match?.expected) || usedExpected.has(match.expected)) throw new Error('Each expected issue can be matched once and must exist.');
      if (!isId(match.finding) || usedFindings.has(match.finding)) throw new Error('Each finding can be counted once.');
      if (!PRIORITIES.includes(match.priority)) throw new Error('Matches must record the priority the agent assigned.');
      usedExpected.add(match.expected);
      usedFindings.add(match.finding);
    }
    for (const finding of run.validExtra) {
      if (!isId(finding) || usedFindings.has(finding)) throw new Error('validExtra findings must be unique and not already matched.');
      usedFindings.add(finding);
    }
    if (usedFindings.size > run.findingsTotal) throw new Error('Matched and valid findings cannot exceed findingsTotal.');
    const decoyIds = new Set(item.decoys.map((x) => x.id));
    const preserveIds = new Set(item.preserve.map((x) => x.id));
    if (new Set(run.decoysFlagged).size !== run.decoysFlagged.length || run.decoysFlagged.some((id) => !decoyIds.has(id))) throw new Error('decoysFlagged must list known decoy IDs once.');
    if (new Set(run.preserveCovered).size !== run.preserveCovered.length || run.preserveCovered.some((id) => !preserveIds.has(id))) throw new Error('preserveCovered must list known preserve IDs once.');

    const critical = item.expected.filter((x) => CRITICAL.has(x.priority));
    const criticalFound = critical.filter((x) => usedExpected.has(x.id)).length;
    const agreed = run.matches.filter((m) => Math.abs(PRIORITIES.indexOf(m.priority) - PRIORITIES.indexOf(expected.get(m.expected).priority)) <= 1).length;
    const delta = {
      runs: 1, valid: run.reportValid ? 1 : 0, critical: critical.length, criticalFound, expected: item.expected.length, expectedFound: usedExpected.size,
      correctFindings: usedFindings.size, findings: run.findingsTotal, decoySlots: decoyIds.size, decoysFlagged: run.decoysFlagged.length,
      preserveSlots: preserveIds.size, preserveCovered: run.preserveCovered.length, matches: run.matches.length, priorityAgreed: agreed, unsupportedClaims: run.unsupportedClaims,
    };
    const caseStats = perCase[item.id] ??= { ...Object.fromEntries(Object.keys(totals).map((k) => [k, 0])), detection: Object.fromEntries(item.expected.map((x) => [x.id, 0])) };
    for (const [k, v] of Object.entries(delta)) { totals[k] += v; caseStats[k] += v; }
    for (const id of usedExpected) caseStats.detection[id]++;
  }
  for (const item of data.cases) {
    const count = perCase[item.id]?.runs ?? 0;
    if (count < data.minRepetitions) throw new Error(`Every case needs at least ${data.minRepetitions} graded repetitions.`);
  }
  const metrics = (t) => ({
    reportValidRate: ratio(t.valid, t.runs),
    criticalRecall: ratio(t.criticalFound, t.critical),
    overallRecall: ratio(t.expectedFound, t.expected),
    precision: ratio(t.correctFindings, t.findings),
    decoyFlagRate: ratio(t.decoysFlagged, t.decoySlots),
    preserveCoverage: ratio(t.preserveCovered, t.preserveSlots),
    priorityAgreement: ratio(t.priorityAgreed, t.matches),
    unsupportedClaims: t.unsupportedClaims,
  });
  const overall = metrics(totals);
  const t = data.targets;
  const failures = [];
  for (const key of ['reportValidRate', 'criticalRecall', 'overallRecall', 'precision', 'preserveCoverage', 'priorityAgreement']) if (overall[key] < t[key]) failures.push(`${key} ${overall[key].toFixed(2)} < ${t[key]}`);
  if (overall.decoyFlagRate > t.decoyFlagRate) failures.push(`decoyFlagRate ${overall.decoyFlagRate.toFixed(2)} > ${t.decoyFlagRate}`);
  if (overall.unsupportedClaims > t.unsupportedClaims) failures.push(`unsupportedClaims ${overall.unsupportedClaims} > ${t.unsupportedClaims}`);
  const cases_ = Object.fromEntries(Object.entries(perCase).map(([id, s]) => [id, {
    runs: s.runs, ...metrics(s),
    detectionRate: Object.fromEntries(Object.entries(s.detection).map(([eid, n]) => [eid, ratio(n, s.runs)])),
  }]));
  return { runs: totals.runs, overall, cases: cases_, failures, passed: failures.length === 0 };
}

async function main() {
  const { values: a } = parseArgs({ options: { results: { type: 'string' }, out: { type: 'string', default: '.audit/evaluations' }, help: { type: 'boolean' } } });
  if (!a.results || a.help) {
    console.log('Usage: node scripts/evaluate-audit.mjs --results <graded-runs.json> [--out .audit/evaluations]');
    process.exitCode = a.help ? 0 : 1; return;
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const data = JSON.parse(await fs.readFile(path.join(root, 'evaluations/audit-quality/cases.json'), 'utf8'));
  const caseErrors = validateAuditCases(data);
  if (caseErrors.length) throw new Error('Invalid case file.');
  const run = JSON.parse(await fs.readFile(a.results, 'utf8'));
  if (!isId(run.model) || !isId(run.agentVersion) || !/^[a-f0-9]{7,40}$/i.test(run.sourceCommit ?? '') || !/^\d{4}-\d{2}-\d{2}/.test(run.executedAt ?? '') || !Number.isFinite(Date.parse(run.executedAt)) || !isId(run.grader)) throw new Error('Run metadata is required.');
  const report = {
    schemaVersion: 1, executedAt: new Date(run.executedAt).toISOString(), model: redactText(run.model, 100), agentVersion: redactText(run.agentVersion, 100),
    sourceCommit: run.sourceCommit, grader: redactText(run.grader, 100), ...scoreAudit(data, run.runs),
  };
  await fs.mkdir(a.out, { recursive: true });
  await fs.writeFile(path.join(a.out, 'audit-quality-score.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Audit evaluation failed. Provide a complete, consistently graded run; input paths and content were omitted.'); process.exitCode = 2; });
}
