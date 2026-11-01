#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { redactText } from '../skills/design-por-referencia-konvert/scripts/_common.mjs';
import { containsExposedCases, candidateProvenance } from './evaluation-provenance.mjs';

const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const norm = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const DEFAULT_CASES_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../evaluations/routing-cases.json');
const EXPOSED_ROUTING_RAW = await fs.readFile(DEFAULT_CASES_PATH, 'utf8');
const EXPOSED_ROUTING_CASES = JSON.parse(EXPOSED_ROUTING_RAW);

export function isExposedRoutingCalibration(cases, exposedCases = EXPOSED_ROUTING_CASES) {
  if (!Array.isArray(cases) || !Array.isArray(exposedCases) || !exposedCases.length) return false;
  const ids = new Set(exposedCases.map((c) => norm(c?.id)));
  const prompts = new Set(exposedCases.map((c) => norm(c?.prompt)));
  return cases.some((c) => ids.has(norm(c?.id)) || prompts.has(norm(c?.prompt)));
}

export function validateRoutingProvenance(run, { isExposedCalibrationSet = true, cases = null, exposedCases = EXPOSED_ROUTING_CASES, casesRaw = '', exposedCasesRaw = EXPOSED_ROUTING_RAW, scorerRaw = '' } = {}) {
  const role = run?.datasetRole ?? 'calibration';
  if (!['calibration', 'held_out'].includes(role)) throw new Error('datasetRole must be calibration or held_out.');
  const candidateCases = cases ?? (casesRaw ? JSON.parse(casesRaw) : null);
  const exposed = isExposedCalibrationSet || Boolean(casesRaw && exposedCasesRaw && sha256(casesRaw) === sha256(exposedCasesRaw)) || isExposedRoutingCalibration(candidateCases, exposedCases);
  if (role === 'held_out' && exposed) throw new Error('Exposed repository routing cases are calibration material and cannot be scored as held_out.');
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

/** Sequence metadata is validated here, but scoring still measures lead selection only. */
export function validateRoutingMetadata(cases, skillNames) {
  const errors = [];
  for (const item of cases) {
    if (!item || typeof item !== 'object') continue;
    const flow = item.expectedFlow;
    if (flow !== undefined && (!Array.isArray(flow) || !flow.length || flow.some((skill) => !skillNames.includes(skill)) || new Set(flow).size !== flow.length)) {
      errors.push(`${item.id}: expectedFlow must list known skills once in stage order`);
    }
    if (item.handoffRequiresUserApproval !== undefined && typeof item.handoffRequiresUserApproval !== 'boolean') errors.push(`${item.id}: handoffRequiresUserApproval must be a boolean`);
    if (item.handoffRequiresUserApproval === true && (!Array.isArray(flow) || !flow.includes('design-por-referencia-konvert') || flow.length < 2)) errors.push(`${item.id}: approval handoff needs a multi-stage flow including the executor`);
    if (Array.isArray(flow) && item.shouldTrigger === true && flow[0] !== item.skill) errors.push(`${item.id}: expectedFlow must start with the lead skill`);
  }
  return errors;
}

export function scoreRouting(cases, decisions) {
  const expected = new Map(cases.map((c) => [c.id, c]));
  if (expected.size !== cases.length) throw new Error('Duplicate evaluation case ID.');
  const seen = new Set();
  const skills = {};
  const workflow = { flowChecked: 0, flowMatched: 0, approvalGateChecked: 0, approvalGateRespected: 0 };
  for (const decision of decisions) {
    if (!expected.has(decision.id) || seen.has(decision.id) || typeof decision.triggered !== 'boolean') throw new Error('Unknown, duplicate, or invalid decision.');
    seen.add(decision.id);
    const item = expected.get(decision.id);
    const stats = skills[item.skill] ??= { total: 0, correct: 0, falsePositive: 0, falseNegative: 0 };
    stats.total++;
    if (item.shouldTrigger === decision.triggered) stats.correct++;
    else if (decision.triggered) stats.falsePositive++;
    else if (!decision.triggered) stats.falseNegative++;
    if (decision.observedFlow !== undefined) {
      if (!Array.isArray(decision.observedFlow) || decision.observedFlow.some((s) => typeof s !== 'string' || !s)) throw new Error('observedFlow must be a list of skill names.');
      if (Array.isArray(item.expectedFlow)) {
        workflow.flowChecked++;
        if (JSON.stringify(decision.observedFlow) === JSON.stringify(item.expectedFlow)) workflow.flowMatched++;
      }
    }
    if (decision.waitedForApproval !== undefined) {
      if (typeof decision.waitedForApproval !== 'boolean') throw new Error('waitedForApproval must be a boolean.');
      if (item.handoffRequiresUserApproval === true) {
        workflow.approvalGateChecked++;
        if (decision.waitedForApproval === true) workflow.approvalGateRespected++;
      }
    }
  }
  if (seen.size !== expected.size) throw new Error('Every case requires exactly one recorded decision.');
  for (const stats of Object.values(skills)) stats.accuracy = stats.correct / stats.total;
  return {
    total: decisions.length,
    correct: Object.values(skills).reduce((sum, s) => sum + s.correct, 0),
    skills,
    ...(workflow.flowChecked || workflow.approvalGateChecked ? { workflow } : {}),
  };
}

async function main() {
  const { values: a } = parseArgs({ options: { results: { type: 'string' }, cases: { type: 'string' }, out: { type: 'string', default: '.audit/evaluations' }, help: { type: 'boolean' } } });
  if (!a.results || a.help) {
    console.log('Usage: node scripts/evaluate-routing.mjs --results <recorded-decisions.json> [--cases <cases.json>] [--out .audit/evaluations]');
    process.exitCode = a.help ? 0 : 1; return;
  }
  const selfPath = fileURLToPath(import.meta.url);
  const root = path.resolve(path.dirname(selfPath), '..');
  const defaultCasesPath = path.join(root, 'evaluations/routing-cases.json');
  const casesPath = a.cases ? path.resolve(a.cases) : defaultCasesPath;
  const [casesRaw, scorerRaw, runRaw] = await Promise.all([
    fs.readFile(casesPath, 'utf8'),
    fs.readFile(selfPath, 'utf8'),
    fs.readFile(a.results, 'utf8'),
  ]);
  const cases = JSON.parse(casesRaw);
  const run = JSON.parse(runRaw);
  if (typeof run.model !== 'string' || !run.model.trim() || typeof run.agentVersion !== 'string' || !run.agentVersion.trim() || !/^[a-f0-9]{7,40}$/i.test(run.sourceCommit ?? '') || !/^\d{4}-\d{2}-\d{2}/.test(run.executedAt ?? '') || !Number.isFinite(Date.parse(run.executedAt)) || !Array.isArray(run.decisions)) throw new Error('Run metadata and decisions are required.');
  const datasetRole = validateRoutingProvenance(run, { isExposedCalibrationSet: containsExposedCases(cases, EXPOSED_ROUTING_CASES), cases, casesRaw, scorerRaw });
  const scored = scoreRouting(cases, run.decisions);
  const report = { schemaVersion: 1, datasetRole, executedAt: new Date(run.executedAt).toISOString(), model: redactText(run.model, 100), agentVersion: redactText(run.agentVersion, 100), sourceCommit: run.sourceCommit, ...candidateProvenance(run, await fs.readFile(new URL('./evaluation-provenance.mjs', import.meta.url), 'utf8')), ...scored };
  await fs.mkdir(a.out, { recursive: true });
  await fs.writeFile(path.join(a.out, 'routing-score.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (Object.values(report.skills).some((s) => s.accuracy < 0.9) || (report.workflow && (report.workflow.flowMatched < report.workflow.flowChecked || report.workflow.approvalGateRespected < report.workflow.approvalGateChecked))) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Routing evaluation failed. Provide a complete, valid run; input paths and content were omitted.'); process.exitCode = 2; });
}
