#!/usr/bin/env node
// Scores graded audit runs against evaluations/audit-quality/cases.json.
// It never calls a model: a grader records which findings match which expected issue.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { redactText } from '../skills/design-por-referencia-konvert/scripts/_common.mjs';

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const CRITICAL = new Set(['P0', 'P1']);
const isId = (value) => typeof value === 'string' && value.trim().length > 0;
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const norm = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const DEFAULT_CASES_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../evaluations/audit-quality/cases.json');
const EXPOSED_AUDIT_RAW = await fs.readFile(DEFAULT_CASES_PATH, 'utf8');
const EXPOSED_AUDIT_DATA = JSON.parse(EXPOSED_AUDIT_RAW);

export function isExposedAuditCalibration(data, exposedData = EXPOSED_AUDIT_DATA) {
  if (!Array.isArray(data?.cases) || !Array.isArray(exposedData?.cases) || !exposedData.cases.length) return false;
  const ids = new Set(exposedData.cases.map((c) => norm(c?.id)));
  const fixtures = new Set(exposedData.cases.map((c) => norm(c?.fixture)));
  const briefs = new Set(exposedData.cases.map((c) => norm(c?.brief)));
  return data.cases.some((c) => ids.has(norm(c?.id)) || fixtures.has(norm(c?.fixture)) || briefs.has(norm(c?.brief)));
}

export function validateAuditProvenance(run, { isExposedCalibrationSet = true, data = null, exposedData = EXPOSED_AUDIT_DATA, casesRaw = '', exposedCasesRaw = EXPOSED_AUDIT_RAW, scorerRaw = '' } = {}) {
  const role = run?.datasetRole ?? 'calibration';
  if (!['calibration', 'held_out'].includes(role)) throw new Error('datasetRole must be calibration or held_out.');
  const candidateData = data ?? (casesRaw ? JSON.parse(casesRaw) : null);
  const exposed = isExposedCalibrationSet || Boolean(casesRaw && exposedCasesRaw && sha256(casesRaw) === sha256(exposedCasesRaw)) || isExposedAuditCalibration(candidateData, exposedData);
  if (role === 'held_out' && exposed) throw new Error('Exposed repository audit cases are calibration material and cannot be scored as held_out.');
  if (run?.fingerprints !== undefined) {
    const fp = run.fingerprints;
    if (!fp || typeof fp !== 'object' || !/^[a-f0-9]{64}$/i.test(fp.casesSha256 ?? '') || !/^[a-f0-9]{64}$/i.test(fp.scorerSha256 ?? '')) {
      throw new Error('fingerprints must record 64-hex casesSha256 and scorerSha256.');
    }
    if (casesRaw && fp.casesSha256.toLowerCase() !== sha256(casesRaw)) throw new Error('casesSha256 does not match the evaluated case file.');
    if (scorerRaw && fp.scorerSha256.toLowerCase() !== sha256(scorerRaw)) throw new Error('scorerSha256 does not match the evaluated scorer.');
  }
  return role;
}

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
  for (const key of ['requireCaseDetection', 'requireCaseCriticalDetection']) {
    if (targets[key] !== undefined && typeof targets[key] !== 'boolean') errors.push(`targets.${key} must be a boolean`);
  }
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
  const totals = { runs: 0, valid: 0, critical: 0, criticalFound: 0, expected: 0, expectedFound: 0, correctFindings: 0, findings: 0, decoySlots: 0, decoysFlagged: 0, preserveSlots: 0, preserveCovered: 0, matches: 0, priorityAgreed: 0, unsupportedClaims: 0, missed: 0, declaredGaps: 0 };
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
    // Optional: missed expected issues whose area and state the report's coverage marked not_observed or blocked.
    // They are declared gaps, not silent omissions; the grader checks the coverage row before listing them.
    const declaredGaps = run.declaredGaps ?? [];
    if (!Array.isArray(declaredGaps) || new Set(declaredGaps).size !== declaredGaps.length || declaredGaps.some((id) => !expected.has(id) || usedExpected.has(id))) throw new Error('declaredGaps must list unmatched expected IDs once.');

    // An invalid delivery cannot contribute accepted findings or preservation evidence.
    if (!run.reportValid) { usedExpected.clear(); usedFindings.clear(); }
    const critical = item.expected.filter((x) => CRITICAL.has(x.priority));
    const criticalFound = critical.filter((x) => usedExpected.has(x.id)).length;
    const agreed = (run.reportValid ? run.matches : []).filter((m) => Math.abs(PRIORITIES.indexOf(m.priority) - PRIORITIES.indexOf(expected.get(m.expected).priority)) <= 1).length;
    const delta = {
      runs: 1, valid: run.reportValid ? 1 : 0, critical: critical.length, criticalFound, expected: item.expected.length, expectedFound: usedExpected.size,
      correctFindings: usedFindings.size, findings: run.findingsTotal, decoySlots: decoyIds.size, decoysFlagged: run.decoysFlagged.length,
      preserveSlots: preserveIds.size, preserveCovered: run.reportValid ? run.preserveCovered.length : 0, matches: run.reportValid ? run.matches.length : 0, priorityAgreed: agreed, unsupportedClaims: run.unsupportedClaims,
      missed: item.expected.length - usedExpected.size, declaredGaps: run.reportValid ? declaredGaps.length : 0,
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
    // Misses split by the report's own coverage: a silent omission is a detection failure;
    // a declared gap is a coverage limit stated in the report. Reported, not gated, until a baseline exists.
    silentOmissions: t.missed - t.declaredGaps,
    declaredGaps: t.declaredGaps,
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
  for (const [id, stats] of Object.entries(perCase)) {
    if (t.requireCaseDetection && stats.expectedFound === 0) failures.push(`${id}: no expected issue detected across its repetitions`);
    if (t.requireCaseCriticalDetection && stats.critical > 0 && stats.criticalFound === 0) failures.push(`${id}: no critical issue detected across its repetitions`);
  }
  return { runs: totals.runs, overall, cases: cases_, failures, passed: failures.length === 0 };
}

async function main() {
  const { values: a } = parseArgs({ options: { results: { type: 'string' }, cases: { type: 'string' }, out: { type: 'string', default: '.audit/evaluations' }, help: { type: 'boolean' } } });
  if (!a.results || a.help) {
    console.log('Usage: node scripts/evaluate-audit.mjs --results <graded-runs.json> [--cases <cases.json>] [--out .audit/evaluations]');
    process.exitCode = a.help ? 0 : 1; return;
  }
  const selfPath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(selfPath), '..');
  const defaultCasesPath = path.join(root, 'evaluations/audit-quality/cases.json');
  const casesPath = a.cases ? path.resolve(a.cases) : defaultCasesPath;
  const [casesRaw, scorerRaw, runRaw] = await Promise.all([
    fs.readFile(casesPath, 'utf8'),
    fs.readFile(selfPath, 'utf8'),
    fs.readFile(a.results, 'utf8'),
  ]);
  const data = JSON.parse(casesRaw);
  const caseErrors = validateAuditCases(data);
  if (caseErrors.length) throw new Error('Invalid case file.');
  const run = JSON.parse(runRaw);
  if (!isId(run.model) || !isId(run.agentVersion) || !/^[a-f0-9]{7,40}$/i.test(run.sourceCommit ?? '') || !/^\d{4}-\d{2}-\d{2}/.test(run.executedAt ?? '') || !Number.isFinite(Date.parse(run.executedAt)) || !isId(run.grader)) throw new Error('Run metadata is required.');
  const datasetRole = validateAuditProvenance(run, { isExposedCalibrationSet: path.resolve(casesPath) === path.resolve(defaultCasesPath), data, casesRaw, scorerRaw });
  const report = {
    schemaVersion: 1, datasetRole, executedAt: new Date(run.executedAt).toISOString(), model: redactText(run.model, 100), agentVersion: redactText(run.agentVersion, 100),
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
