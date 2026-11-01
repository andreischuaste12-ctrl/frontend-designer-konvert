#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { redactText } from '../skills/design-por-referencia-konvert/scripts/_common.mjs';

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
  for (const decision of decisions) {
    if (!expected.has(decision.id) || seen.has(decision.id) || typeof decision.triggered !== 'boolean') throw new Error('Unknown, duplicate, or invalid decision.');
    seen.add(decision.id);
    const item = expected.get(decision.id);
    const stats = skills[item.skill] ??= { total: 0, correct: 0, falsePositive: 0, falseNegative: 0 };
    stats.total++;
    if (item.shouldTrigger === decision.triggered) stats.correct++;
    else if (decision.triggered) stats.falsePositive++;
    else stats.falseNegative++;
  }
  if (seen.size !== expected.size) throw new Error('Every case requires exactly one recorded decision.');
  for (const stats of Object.values(skills)) stats.accuracy = stats.correct / stats.total;
  return { total: decisions.length, correct: Object.values(skills).reduce((sum, s) => sum + s.correct, 0), skills };
}

async function main() {
  const { values: a } = parseArgs({ options: { results: { type: 'string' }, out: { type: 'string', default: '.audit/evaluations' }, help: { type: 'boolean' } } });
  if (!a.results || a.help) {
    console.log('Usage: node scripts/evaluate-routing.mjs --results <recorded-decisions.json> [--out .audit/evaluations]');
    process.exitCode = a.help ? 0 : 1; return;
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const cases = JSON.parse(await fs.readFile(path.join(root, 'evaluations/routing-cases.json'), 'utf8'));
  const run = JSON.parse(await fs.readFile(a.results, 'utf8'));
  if (typeof run.model !== 'string' || !run.model.trim() || typeof run.agentVersion !== 'string' || !run.agentVersion.trim() || !/^[a-f0-9]{7,40}$/i.test(run.sourceCommit ?? '') || !/^\d{4}-\d{2}-\d{2}/.test(run.executedAt ?? '') || !Number.isFinite(Date.parse(run.executedAt)) || !Array.isArray(run.decisions)) throw new Error('Run metadata and decisions are required.');
  const report = { schemaVersion: 1, executedAt: new Date(run.executedAt).toISOString(), model: redactText(run.model, 100), agentVersion: redactText(run.agentVersion, 100), sourceCommit: run.sourceCommit, ...scoreRouting(cases, run.decisions) };
  await fs.mkdir(a.out, { recursive: true });
  await fs.writeFile(path.join(a.out, 'routing-score.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (Object.values(report.skills).some((s) => s.accuracy < 0.9)) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => { console.error('Routing evaluation failed. Provide a complete, valid run; input paths and content were omitted.'); process.exitCode = 2; });
}
