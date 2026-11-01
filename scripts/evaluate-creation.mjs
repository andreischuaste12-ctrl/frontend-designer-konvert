#!/usr/bin/env node
// Scores graded frontend-creation runs against evaluations/creation-quality/cases.json.
// Never calls a model: a grader records per-dimension outcomes and evidence from clean runs.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { redactText } from '../skills/design-por-referencia-konvert/scripts/_common.mjs';
import { containsExposedCases, candidateProvenance } from './evaluation-provenance.mjs';

const REQUIRED_DIMENSIONS = [
  'functionalCompletion',
  'briefAdherence',
  'contentAccuracy',
  'renderedResponsiveness',
  'keyboardUse',
  'visualCoherence',
];
const isId = (value) => typeof value === 'string' && value.trim().length > 0;
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const norm = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const DEFAULT_CASES_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../evaluations/creation-quality/cases.json');
const EXPOSED_CREATION_RAW = await fs.readFile(DEFAULT_CASES_PATH, 'utf8');
const EXPOSED_CREATION_DATA = JSON.parse(EXPOSED_CREATION_RAW);

export function validateCreationCases(data) {
  const errors = [];
  if (!data || data.schemaVersion !== 1 || !Array.isArray(data.cases) || data.cases.length < 3) {
    return ['creation cases file needs schemaVersion 1 and at least 3 cases'];
  }
  if (!Number.isInteger(data.minRepetitions) || data.minRepetitions < 1) errors.push('minRepetitions must be a positive integer');
  if (!Array.isArray(data.dimensions) || JSON.stringify(data.dimensions) !== JSON.stringify(REQUIRED_DIMENSIONS)) {
    errors.push('dimensions must list the 6 required creation rubric dimensions in order');
  }
  const targets = data.targets ?? {};
  for (const key of ['deliveryValidRate', 'criterionPassRate']) {
    if (typeof targets[key] !== 'number' || targets[key] < 0 || targets[key] > 1) errors.push(`targets.${key} must be between 0 and 1`);
  }
  for (const key of ['maxBlockedCriteria', 'unsupportedClaims']) {
    if (!Number.isInteger(targets[key]) || targets[key] < 0) errors.push(`targets.${key} must be a non-negative integer`);
  }
  if (targets.requireCasePass !== undefined && typeof targets.requireCasePass !== 'boolean') errors.push('targets.requireCasePass must be a boolean');
  const ids = new Set();
  for (const item of data.cases) {
    if (!isId(item?.id) || ids.has(item.id)) { errors.push('case IDs must be unique non-empty strings'); continue; }
    ids.add(item.id);
    if (!isId(item.title) || !isId(item.brief)) errors.push(`${item.id}: title and brief are required`);
    if (!Array.isArray(item.viewports) || !item.viewports.length || item.viewports.some((v) => !Number.isInteger(v) || v <= 0)) errors.push(`${item.id}: viewports must list positive integers`);
    for (const group of ['requiredStates', 'requiredTasks', 'constraints', 'legitimateChoices']) {
      if (!Array.isArray(item[group]) || !item[group].length || item[group].some((x) => !isId(x))) errors.push(`${item.id}: ${group} must be a non-empty list of strings`);
    }
  }
  return errors;
}

export function isExposedCreationCalibration(data, exposedData = EXPOSED_CREATION_DATA) {
  if (!Array.isArray(data?.cases) || !Array.isArray(exposedData?.cases) || !exposedData.cases.length) return false;
  const ids = new Set(exposedData.cases.map((c) => norm(c?.id)));
  const titles = new Set(exposedData.cases.map((c) => norm(c?.title)));
  const briefs = new Set(exposedData.cases.map((c) => norm(c?.brief)));
  return data.cases.some((c) => ids.has(norm(c?.id)) || titles.has(norm(c?.title)) || briefs.has(norm(c?.brief)));
}

export function validateCreationProvenance(run, { isExposedCalibrationSet = true, data = null, exposedData = EXPOSED_CREATION_DATA, casesRaw = '', exposedCasesRaw = EXPOSED_CREATION_RAW, scorerRaw = '' } = {}) {
  const role = run?.datasetRole ?? 'calibration';
  if (!['calibration', 'held_out'].includes(role)) throw new Error('datasetRole must be calibration or held_out.');
  const candidateData = data ?? (casesRaw ? JSON.parse(casesRaw) : null);
  const exposed = isExposedCalibrationSet || Boolean(casesRaw && exposedCasesRaw && sha256(casesRaw) === sha256(exposedCasesRaw)) || isExposedCreationCalibration(candidateData, exposedData);
  if (role === 'held_out' && exposed) throw new Error('Exposed repository creation cases are calibration material and cannot be scored as held_out.');
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

const ratio = (num, den) => (den ? num / den : 0);
const blankStats = () => ({ runs: 0, valid: 0, criteriaTotal: 0, criteriaPassed: 0, criteriaFailed: 0, criteriaBlocked: 0, unsupportedClaims: 0, dimensionPassed: Object.fromEntries(REQUIRED_DIMENSIONS.map((d) => [d, 0])) });

export function scoreCreation(data, runs) {
  const cases = new Map(data.cases.map((c) => [c.id, c]));
  if (!Array.isArray(runs) || !runs.length) throw new Error('At least one graded creation run is required.');
  const seen = new Set();
  const totals = blankStats();
  const perCase = {};
  for (const run of runs) {
    const item = cases.get(run?.caseId);
    if (!item) throw new Error('Run references an unknown creation case.');
    const key = `${run.caseId}#${run.repetition}`;
    if (!Number.isInteger(run.repetition) || run.repetition < 1 || seen.has(key)) throw new Error('Repetitions must be unique positive integers per case.');
    seen.add(key);
    if (typeof run.deliveryValid !== 'boolean' || !Number.isInteger(run.unsupportedClaims) || run.unsupportedClaims < 0 || !run.criteria || typeof run.criteria !== 'object') {
      throw new Error('Run needs deliveryValid, unsupportedClaims, and criteria.');
    }
    const caseStats = perCase[item.id] ??= blankStats();
    let passed = 0, failed = 0, blocked = 0;
    for (const dim of REQUIRED_DIMENSIONS) {
      const entry = run.criteria[dim];
      if (!entry || !['passed', 'failed', 'blocked'].includes(entry.status)) throw new Error(`Criterion ${dim} must record status passed, failed, or blocked.`);
      if (entry.status === 'passed' && !isId(entry.evidence)) throw new Error(`Criterion ${dim} requires evidence when passed.`);
      if (entry.status === 'blocked' && !isId(entry.reason)) throw new Error(`Criterion ${dim} requires reason when blocked.`);
      if (entry.status === 'blocked') blocked++;
      else if (!run.deliveryValid) failed++;
      else if (entry.status === 'passed') { passed++; totals.dimensionPassed[dim]++; caseStats.dimensionPassed[dim]++; }
      else failed++;
    }
    const delta = { runs: 1, valid: run.deliveryValid ? 1 : 0, criteriaTotal: REQUIRED_DIMENSIONS.length, criteriaPassed: passed, criteriaFailed: failed, criteriaBlocked: blocked, unsupportedClaims: run.unsupportedClaims };
    for (const [k, v] of Object.entries(delta)) { totals[k] += v; caseStats[k] += v; }
  }
  for (const item of data.cases) {
    if ((perCase[item.id]?.runs ?? 0) < data.minRepetitions) throw new Error(`Every creation case needs at least ${data.minRepetitions} graded repetitions.`);
  }
  const summarize = (s) => ({
    deliveryValidRate: ratio(s.valid, s.runs),
    // Blocked checks remain unverified and must not inflate the delivery score.
    criterionPassRate: ratio(s.criteriaPassed, s.criteriaTotal),
    verifiedCriterionPassRate: ratio(s.criteriaPassed, s.criteriaTotal - s.criteriaBlocked),
    evaluatedCriterionPassRate: ratio(s.criteriaPassed, s.criteriaTotal - s.criteriaBlocked),
    verificationCoverage: ratio(s.criteriaTotal - s.criteriaBlocked, s.criteriaTotal),
    dimensionPassRates: Object.fromEntries(REQUIRED_DIMENSIONS.map((d) => [d, ratio(s.dimensionPassed[d], s.runs)])),
    blockedCriteria: s.criteriaBlocked,
    failedCriteria: s.criteriaFailed,
    unsupportedClaims: s.unsupportedClaims,
  });
  const overall = summarize(totals);
  const t = data.targets;
  const maxBlocked = t.maxBlockedCriteria ?? 0;
  const failures = [];
  if (overall.deliveryValidRate < t.deliveryValidRate) failures.push(`deliveryValidRate ${overall.deliveryValidRate.toFixed(2)} < ${t.deliveryValidRate}`);
  if (overall.criterionPassRate < t.criterionPassRate) failures.push(`criterionPassRate ${overall.criterionPassRate.toFixed(2)} < ${t.criterionPassRate}`);
  if (overall.blockedCriteria > maxBlocked) failures.push(`blockedCriteria ${overall.blockedCriteria} > ${maxBlocked}`);
  if (overall.unsupportedClaims > t.unsupportedClaims) failures.push(`unsupportedClaims ${overall.unsupportedClaims} > ${t.unsupportedClaims}`);
  for (const dim of REQUIRED_DIMENSIONS) {
    if (overall.dimensionPassRates[dim] < t.criterionPassRate) failures.push(`dimension ${dim} passRate ${overall.dimensionPassRates[dim].toFixed(2)} < ${t.criterionPassRate}`);
  }
  const casesOut = {};
  for (const [id, stats] of Object.entries(perCase)) {
    casesOut[id] = { runs: stats.runs, ...summarize(stats) };
    if (t.requireCasePass && casesOut[id].criterionPassRate < t.criterionPassRate) {
      failures.push(`${id}: criterionPassRate ${casesOut[id].criterionPassRate.toFixed(2)} < ${t.criterionPassRate}`);
    }
    if (t.requireCasePass && casesOut[id].blockedCriteria > maxBlocked) {
      failures.push(`${id}: blockedCriteria ${casesOut[id].blockedCriteria} > ${maxBlocked}`);
    }
  }
  return { runs: totals.runs, overall, cases: casesOut, failures, passed: failures.length === 0 };
}

async function main() {
  const { values: a } = parseArgs({ options: { results: { type: 'string' }, cases: { type: 'string' }, out: { type: 'string', default: '.audit/evaluations' }, help: { type: 'boolean' } } });
  if (!a.results || a.help) {
    console.log('Usage: node scripts/evaluate-creation.mjs --results <graded-creation-runs.json> [--cases <cases.json>] [--out .audit/evaluations]');
    process.exitCode = a.help ? 0 : 1; return;
  }
  const selfPath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(selfPath), '..');
  const defaultCasesPath = path.join(root, 'evaluations/creation-quality/cases.json');
  const casesPath = a.cases ? path.resolve(a.cases) : defaultCasesPath;
  const [casesRaw, exposedCasesRaw, scorerRaw, runRaw] = await Promise.all([
    fs.readFile(casesPath, 'utf8'),
    fs.readFile(defaultCasesPath, 'utf8'),
    fs.readFile(selfPath, 'utf8'),
    fs.readFile(a.results, 'utf8'),
  ]);
  const data = JSON.parse(casesRaw);
  const exposedData = JSON.parse(exposedCasesRaw);
  if (validateCreationCases(data).length) throw new Error('Invalid creation case file.');
  const run = JSON.parse(runRaw);
  if (!isId(run.model) || !isId(run.agentVersion) || !/^[a-f0-9]{7,40}$/i.test(run.sourceCommit ?? '') || !/^\d{4}-\d{2}-\d{2}/.test(run.executedAt ?? '') || !Number.isFinite(Date.parse(run.executedAt)) || !isId(run.grader)) throw new Error('Run metadata is required.');
  const datasetRole = validateCreationProvenance(run, { isExposedCalibrationSet: containsExposedCases(data, exposedData), data, exposedData, casesRaw, exposedCasesRaw, scorerRaw });
  const report = {
    schemaVersion: 1, datasetRole, executedAt: new Date(run.executedAt).toISOString(), model: redactText(run.model, 100), agentVersion: redactText(run.agentVersion, 100),
    sourceCommit: run.sourceCommit, ...candidateProvenance(run, await fs.readFile(new URL('./evaluation-provenance.mjs', import.meta.url), 'utf8')), grader: redactText(run.grader, 100), ...scoreCreation(data, run.runs),
  };
  await fs.mkdir(a.out, { recursive: true });
  await fs.writeFile(path.join(a.out, 'creation-quality-score.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Creation evaluation failed. Provide a complete, consistently graded run; input paths and content were omitted.'); process.exitCode = 2; });
}
