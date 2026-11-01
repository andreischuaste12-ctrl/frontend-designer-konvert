#!/usr/bin/env node
// Prepares calibration workspaces. It never executes an agent or invents a graded result.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { installSkills } from './install-skills.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = {
  audit: { cases: 'evaluations/audit-quality/cases.json', scorer: 'scripts/evaluate-audit.mjs' },
  creation: { cases: 'evaluations/creation-quality/cases.json', scorer: 'scripts/evaluate-creation.mjs' },
};
const hash = (value) => createHash('sha256').update(value).digest('hex');
const inside = (base, file) => { const rel = path.relative(base, file); return !rel || (!path.isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${path.sep}`)); };
const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

export async function fingerprintTree(directory) {
  const entries = [];
  async function walk(dir) {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (['.git', '.audit', 'node_modules'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) entries.push({ file: path.relative(directory, file).split(path.sep).join('/'), sha256: hash(await fs.readFile(file)) });
      else throw new Error('Evaluation inputs must contain only regular files and directories.');
    }
  }
  await walk(directory);
  return { sha256: hash(JSON.stringify(entries)), files: entries };
}

export async function prepareEvaluation({ kind, caseId, out, repetition = 1, sourceRoot = root }) {
  if (!TYPES[kind] || !Number.isSafeInteger(repetition) || repetition < 1 || !out) throw new Error('Choose audit or creation, an output directory, and a positive repetition.');
  const type = TYPES[kind];
  const casesRaw = await fs.readFile(path.join(sourceRoot, type.cases), 'utf8');
  const scorerRaw = await fs.readFile(path.join(sourceRoot, type.scorer), 'utf8');
  const scorerSupportRaw = await fs.readFile(path.join(sourceRoot, 'scripts/evaluation-provenance.mjs'), 'utf8');
  const cases = JSON.parse(casesRaw), item = cases.cases.find((c) => c.id === caseId);
  if (!item) throw new Error('Unknown evaluation case. Use --list.');
  const destination = path.resolve(out);
  // Require an existing parent so its real path can be checked before creating any files.
  const parent = await fs.realpath(path.dirname(destination));
  if (inside(await fs.realpath(sourceRoot), path.join(parent, path.basename(destination)))) throw new Error('Prepare evaluations outside the source repository.');
  const sourceCommit = git(sourceRoot, ['rev-parse', 'HEAD']);
  const sourceDirty = Boolean(git(sourceRoot, ['status', '--porcelain=v1', '--untracked-files=normal']));
  await fs.mkdir(destination, { mode: 0o700 }); // Never replace an existing run, including a symlink.
  try {
    const workspace = path.join(destination, 'workspace'), operator = path.join(destination, 'operator');
    await fs.mkdir(operator, { mode: 0o700 });
    if (kind === 'audit') {
      const fixture = await fs.realpath(path.join(sourceRoot, item.fixture));
      if (!inside(await fs.realpath(path.join(sourceRoot, 'evaluations/fixtures')), fixture)) throw new Error('Fixture escapes the evaluation fixture directory.');
      await fingerprintTree(fixture); // Reject links before copying any fixture content.
      await fs.cp(fixture, workspace, { recursive: true, force: false, errorOnExist: true,
        filter: (file) => !['node_modules', '.git', '.audit'].includes(path.basename(file)) });
    } else await fs.mkdir(workspace);
    await fs.writeFile(path.join(workspace, '.gitignore'), '.audit/\nnode_modules/\n', { flag: 'wx' });
    await installSkills(path.join(workspace, '.agents/skills'), { source: path.join(sourceRoot, 'skills') });
    git(workspace, ['init', '-q']);
    git(workspace, ['add', '--all']);
    git(workspace, ['-c', 'user.name=Evaluation fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Prepare synthetic evaluation workspace']);
    const candidate = await fingerprintTree(path.join(workspace, '.agents/skills'));
    const baseline = await fingerprintTree(workspace);
    const metadata = {
      schemaVersion: 1, status: 'prepared', datasetRole: 'calibration', kind, caseId, repetition,
      sourceCommit, sourceDirty, candidateSkillsSha256: candidate.sha256, baselineTreeSha256: baseline.sha256,
      fingerprints: { casesSha256: hash(casesRaw), scorerSha256: hash(scorerRaw), scorerSupportSha256: hash(scorerSupportRaw) },
      minimumRepetitions: cases.minRepetitions,
      limitation: 'Prepared inputs only. No agent execution, independent evaluation, or quality score has been recorded. Restrict the executing agent to workspace; operator contains grading material.',
    };
    // All grading information and frozen scoring inputs stay outside the agent workspace.
    await fs.writeFile(path.join(operator, 'manifest.json'), JSON.stringify(metadata, null, 2));
    await fs.writeFile(path.join(operator, 'baseline-files.json'), JSON.stringify(baseline.files, null, 2));
    await fs.writeFile(path.join(operator, 'cases.json'), casesRaw);
    await fs.writeFile(path.join(operator, 'scorer.mjs'), scorerRaw);
    await fs.writeFile(path.join(operator, 'evaluation-provenance.mjs'), scorerSupportRaw);
    const prompt = kind === 'audit' ? item.brief : [item.brief, '\nTarefas:', ...item.requiredTasks.map((s) => `- ${s}`), '\nRestrições:', ...item.constraints.map((s) => `- ${s}`), `\nLarguras a verificar: ${item.viewports.join(', ')} px.`, `Estados a verificar: ${item.requiredStates.join(', ')}.`].join('\n');
    await fs.writeFile(path.join(operator, 'prompt.md'), prompt + '\n');
    const run = kind === 'audit'
      ? { caseId, repetition, reportValid: null, findingsTotal: null, matches: [], validExtra: [], decoysFlagged: [], preserveCovered: [], unsupportedClaims: null, declaredGaps: [] }
      : { caseId, repetition, deliveryValid: null, unsupportedClaims: null, criteria: Object.fromEntries(cases.dimensions.map((d) => [d, { status: 'not_run', evidence: null, reason: null }])) };
    await fs.writeFile(path.join(operator, 'grading-template.json'), JSON.stringify({
      status: 'not_run', datasetRole: 'calibration', model: null, agentVersion: null, sourceCommit, sourceDirty,
      candidateSkillsSha256: candidate.sha256, executedAt: null, grader: null, fingerprints: metadata.fingerprints, runs: [run],
    }, null, 2));
    return metadata;
  } catch (error) {
    await fs.rm(destination, { recursive: true, force: true });
    throw error;
  }
}

async function main() {
  const { values } = parseArgs({ options: { kind: { type: 'string' }, case: { type: 'string' }, out: { type: 'string' }, repetition: { type: 'string', default: '1' }, list: { type: 'boolean' }, help: { type: 'boolean' } } });
  if (values.help) { console.log('Usage: node scripts/prepare-evaluation.mjs --kind audit|creation --case <id> --out <new-directory-outside-repo> [--repetition 1]\nUse --list to see case IDs. Prepares calibration inputs only; never runs an agent.'); return; }
  if (values.list) {
    for (const [kind, type] of Object.entries(TYPES)) {
      const data = JSON.parse(await fs.readFile(path.join(root, type.cases), 'utf8'));
      console.log(JSON.stringify({ kind, minimumRepetitions: data.minRepetitions, caseIds: data.cases.map((c) => c.id) }));
    }
    return;
  }
  const result = await prepareEvaluation({ kind: values.kind, caseId: values.case, out: values.out, repetition: Number(values.repetition) });
  console.log(JSON.stringify(result, null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Evaluation preparation failed. Choose a listed case and a new directory outside the repository with an existing parent. Existing runs are never replaced; input paths and contents omitted.'); process.exitCode = 2; });
}
