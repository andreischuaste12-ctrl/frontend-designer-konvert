#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function selectSuccessfulRun(data, sha) {
  if (!/^[a-f0-9]{40}$/i.test(sha) || !Array.isArray(data?.workflow_runs)) throw new Error('Invalid run input.');
  const candidates = data.workflow_runs.filter((r) => r.head_sha === sha && r.head_branch === 'main' && r.event === 'push');
  if (candidates.some((r) => !Number.isSafeInteger(r.run_number) || r.run_number < 1)) throw new Error('Invalid run number.');
  candidates.sort((a, b) => b.run_number - a.run_number);
  const run = candidates[0];
  if (!run || run.status !== 'completed' || run.conclusion !== 'success' || !Number.isSafeInteger(run.id) || run.id < 1) throw new Error('Latest main push run for this exact commit is not successful.');
  return run.id;
}
export function verifyMatrixJobs(data) {
  if (!Array.isArray(data?.jobs)) throw new Error('Invalid jobs input.');
  const expected = [['coverage']];
  for (const os of ['ubuntu-latest', 'windows-latest']) {
    expected.push([`repository (${os})`], [`smoke (${os})`]);
    for (const node of ['20', '22', '24']) expected.push([`validate (${node}, ${os})`, `validate (${os}, ${node})`]);
  }
  for (const alternatives of expected) {
    const matches = data.jobs.filter((j) => alternatives.includes(j.name));
    if (matches.length !== 1 || matches[0].status !== 'completed' || matches[0].conclusion !== 'success') throw new Error('Required matrix job missing, duplicated, incomplete or unsuccessful.');
  }
  return true;
}
export function releaseNotes(changelog, tag) {
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) throw new Error('Tag must be a stable semantic version.');
  const version = tag.slice(1).replaceAll('.', '\\.');
  const match = String(changelog).match(new RegExp(`^## (?:\\[)?${version}(?:\\])?(?:\\s+[^\\n]*)?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  const notes = match?.[1]?.trim();
  if (!notes) throw new Error('Matching nonempty changelog section not found.');
  return notes + '\n';
}
async function main() {
  const [mode, file, value] = process.argv.slice(2);
  try {
    const content = await fs.readFile(file, 'utf8');
    if (mode === 'runs') console.log(selectSuccessfulRun(JSON.parse(content), value));
    else if (mode === 'jobs') { verifyMatrixJobs(JSON.parse(content)); console.log('Required CI matrix passed.'); }
    else if (mode === 'notes') process.stdout.write(releaseNotes(content, value));
    else throw new Error('Unknown mode.');
  } catch { console.error('Release readiness check failed; input and paths omitted.'); process.exitCode = 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
