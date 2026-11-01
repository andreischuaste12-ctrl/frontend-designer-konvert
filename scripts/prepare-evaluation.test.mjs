import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareEvaluation, fingerprintTree } from './prepare-evaluation.mjs';
import { scoreCreation } from './evaluate-creation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'konvert-evaluation-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test('audit preparation separates the answer key, freezes candidate fingerprints, and commits a clean workspace', async (t) => {
  const dir = await fixture(t), out = path.join(dir, 'audit');
  const manifest = await prepareEvaluation({ kind: 'audit', caseId: 'loja', out });
  const workspace = path.join(out, 'workspace');
  assert.equal(manifest.status, 'prepared');
  assert.equal(manifest.datasetRole, 'calibration');
  assert.match(manifest.candidateSkillsSha256, /^[a-f0-9]{64}$/);
  assert.equal((await fingerprintTree(path.join(workspace, '.agents/skills'))).sha256, manifest.candidateSkillsSha256);
  assert.equal((await fingerprintTree(workspace)).sha256, manifest.baselineTreeSha256);
  assert.equal(execFileSync('git', ['status', '--porcelain'], { cwd: workspace, encoding: 'utf8' }), '');
  await assert.rejects(fs.access(path.join(workspace, 'evaluations')));
  await assert.rejects(fs.access(path.join(workspace, 'operator')));
  const prompt = await fs.readFile(path.join(out, 'operator/prompt.md'), 'utf8');
  assert.ok(prompt.includes('Audite a página de produto'));
  assert.ok(!prompt.includes('expected') && !prompt.includes('decoys'));
  const cases = JSON.parse(await fs.readFile(path.join(out, 'operator/cases.json'), 'utf8'));
  assert.ok(cases.cases[0].expected.length > 0);
  const template = JSON.parse(await fs.readFile(path.join(out, 'operator/grading-template.json'), 'utf8'));
  assert.equal(template.runs[0].reportValid, null);
  assert.equal(template.executedAt, null);
  await fs.writeFile(path.join(workspace, 'index.html'), 'changed');
  assert.notEqual((await fingerprintTree(workspace)).sha256, manifest.baselineTreeSha256);
  // The operator's frozen baseline survives edits in the agent workspace.
  assert.equal(JSON.parse(await fs.readFile(path.join(out, 'operator/manifest.json'), 'utf8')).baselineTreeSha256, manifest.baselineTreeSha256);
});

test('creation preparation starts empty with explicit requirements and unscorable not-run criteria', async (t) => {
  const dir = await fixture(t), out = path.join(dir, 'creation');
  const manifest = await prepareEvaluation({ kind: 'creation', caseId: 'dashboard-states', repetition: 2, out });
  assert.equal(manifest.repetition, 2);
  await assert.rejects(fs.access(path.join(out, 'workspace/index.html')));
  const prompt = await fs.readFile(path.join(out, 'operator/prompt.md'), 'utf8');
  assert.ok(prompt.includes('320, 375, 1440'));
  assert.ok(prompt.includes('Tarefas:') && prompt.includes('Restrições:'));
  const template = JSON.parse(await fs.readFile(path.join(out, 'operator/grading-template.json'), 'utf8'));
  assert.ok(Object.values(template.runs[0].criteria).every((c) => c.status === 'not_run'));
  const data = JSON.parse(await fs.readFile(path.join(root, 'evaluations/creation-quality/cases.json'), 'utf8'));
  assert.throws(() => scoreCreation(data, template.runs), /deliveryValid/);
});

test('preparation refuses unknown cases, invalid repetitions, repository paths, and existing runs', async (t) => {
  const dir = await fixture(t), out = path.join(dir, 'run');
  await fs.mkdir(out);
  await fs.writeFile(path.join(out, 'keep'), 'existing result');
  await assert.rejects(prepareEvaluation({ kind: 'audit', caseId: 'loja', out }), { code: 'EEXIST' });
  assert.equal(await fs.readFile(path.join(out, 'keep'), 'utf8'), 'existing result');
  await assert.rejects(prepareEvaluation({ kind: 'audit', caseId: 'unknown', out: path.join(dir, 'new') }), /Unknown/);
  await assert.rejects(prepareEvaluation({ kind: 'audit', caseId: 'loja', out: path.join(root, '.audit-new') }), /outside/);
  await assert.rejects(prepareEvaluation({ kind: 'audit', caseId: 'loja', out, repetition: 0 }), /positive/);
});

test('tree fingerprints are deterministic, ignore runtime artifacts, and reject source symlinks', async (t) => {
  const dir = await fixture(t);
  await fs.writeFile(path.join(dir, 'a.txt'), 'source');
  const before = await fingerprintTree(dir);
  await fs.mkdir(path.join(dir, 'node_modules'));
  await fs.writeFile(path.join(dir, 'node_modules/cache'), 'ignored');
  assert.deepEqual(await fingerprintTree(dir), before);
  try { await fs.symlink(path.join(dir, 'a.txt'), path.join(dir, 'link.txt')); }
  catch (error) { if (error.code === 'EPERM') { t.skip('Symlinks unavailable on this host.'); return; } throw error; }
  await assert.rejects(fingerprintTree(dir), /regular files/);
});
