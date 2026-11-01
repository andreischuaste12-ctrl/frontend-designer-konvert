// Synthetic CLI contract tests only. Their generated perfect grades are not agent-performance evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exec = promisify(execFile);
async function run(script, args = []) {
  try { return { code: 0, ...await exec(process.execPath, [path.join(root, 'scripts', `${script}.mjs`), ...args], { cwd: root, timeout: 60000, maxBuffer: 2 * 1024 * 1024 }) }; }
  catch (error) { if (typeof error.code !== 'number') throw error; return { code: error.code, stdout: error.stdout, stderr: error.stderr }; }
}
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'konvert-cli-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test('installed-skills and evaluation commands support help, success, and safe failure through their public CLI', async (t) => {
  const dir = await fixture(t);
  for (const script of ['doctor', 'install-skills', 'prepare-evaluation', 'check-knowledge-units']) {
    assert.equal((await run(script, ['--help'])).code, 0);
  }
  const target = path.join(dir, 'skills');
  assert.equal((await run('install-skills', ['--target', target])).code, 0);
  assert.equal((await run('install-skills', ['--target', target])).code, 1);
  assert.equal((await run('install-skills')).code, 2);
  const listed = await run('prepare-evaluation', ['--list']);
  assert.equal(listed.code, 0);
  assert.ok(listed.stdout.includes('loja') && !listed.stdout.includes('expected'));
  assert.equal((await run('prepare-evaluation', ['--kind', 'creation', '--case', 'catalog-filters', '--out', path.join(dir, 'run')])).code, 0);
  const failed = await run('prepare-evaluation', ['--kind', 'unknown', '--out', dir]);
  assert.equal(failed.code, 2);
  assert.ok(!failed.stderr.includes(dir));
  const doctor = await run('doctor');
  assert.ok([0, 1].includes(doctor.code)); // Unit CI intentionally has no browser packages installed.
  assert.equal(JSON.parse(doctor.stdout).browser.status, 'not_checked');
});

test('knowledge CLI emits a complete, prioritized review queue while leaving source statuses intact', async () => {
  const summary = await run('check-knowledge-units');
  const review = await run('check-knowledge-units', ['--review']);
  assert.equal(summary.code, 0);
  assert.equal(review.code, 0);
  const result = JSON.parse(review.stdout);
  assert.deepEqual(result.summary, JSON.parse(summary.stdout));
  assert.equal(result.queue.length, result.summary.totalUnique);
  assert.ok(result.queue.every((item) => item.file && item.action));
  assert.equal(result.queue[0].priority, 'P0');
});

test('audit and creation scorer CLIs retain provenance, reject copied held-out claims and distinguish failed from invalid grades', async (t) => {
  const dir = await fixture(t);
  for (const kind of ['audit', 'creation']) {
    const script = `evaluate-${kind}`;
    const casesRaw = await fs.readFile(path.join(root, `evaluations/${kind}-quality/cases.json`), 'utf8');
    const scorerRaw = await fs.readFile(path.join(root, `scripts/${script}.mjs`), 'utf8');
    const data = JSON.parse(casesRaw);
    const fp = (value) => createHash('sha256').update(value).digest('hex');
    const runs = data.cases.flatMap((item) => [1, 2, 3].map((repetition) => kind === 'audit' ? {
      caseId: item.id, repetition, reportValid: true, findingsTotal: item.expected.length, unsupportedClaims: 0,
      matches: item.expected.map((e, i) => ({ expected: e.id, finding: `F-${i}`, priority: e.priority })),
      validExtra: [], decoysFlagged: [], preserveCovered: item.preserve.map((p) => p.id),
    } : {
      caseId: item.id, repetition, deliveryValid: true, unsupportedClaims: 0,
      criteria: Object.fromEntries(data.dimensions.map((d) => [d, { status: 'passed', evidence: 'Synthetic scorer contract input.' }])),
    }));
    const metadata = { datasetRole: 'calibration', model: 'synthetic-scorer-test', agentVersion: 'test', sourceCommit: 'a'.repeat(40), sourceDirty: true,
      candidateSkillsSha256: 'b'.repeat(64), executedAt: '2026-11-01', grader: 'synthetic scorer test',
      fingerprints: { casesSha256: fp(casesRaw), scorerSha256: fp(scorerRaw) }, runs };
    const results = path.join(dir, `${kind}-input.json`), cases = path.join(dir, `${kind}-cases.json`), out = path.join(dir, `${kind}-out`);
    await fs.writeFile(results, JSON.stringify(metadata));
    await fs.writeFile(cases, casesRaw);
    const args = ['--results', results, '--cases', cases, '--out', out];
    const perfect = await run(script, args);
    assert.equal(perfect.code, 0, perfect.stderr);
    const report = JSON.parse(perfect.stdout);
    assert.equal(report.passed, true);
    assert.equal(report.sourceDirty, true);
    assert.equal(report.candidateSkillsSha256, metadata.candidateSkillsSha256);
    assert.deepEqual(report.fingerprints, metadata.fingerprints);
    await fs.writeFile(results, JSON.stringify({ ...metadata, datasetRole: 'held_out' }));
    assert.equal((await run(script, args)).code, 2);
    await fs.writeFile(results, JSON.stringify({ ...metadata, model: null }));
    assert.equal((await run(script, args)).code, 2);
    const failedRuns = structuredClone(runs);
    for (const item of failedRuns) item.unsupportedClaims = 1;
    await fs.writeFile(results, JSON.stringify({ ...metadata, runs: failedRuns }));
    const failed = await run(script, args);
    assert.equal(failed.code, 1);
    assert.equal(JSON.parse(failed.stdout).passed, false);
    assert.equal((await run(script, ['--help'])).code, 0);
    assert.equal((await run(script)).code, 1);
  }
});

test('routing CLI scores recorded decisions, preserves candidate identity, and rejects copied calibration claims', async (t) => {
  const dir = await fixture(t), file = path.join(dir, 'routing.json'), copied = path.join(dir, 'cases.json');
  const cases = JSON.parse(await fs.readFile(path.join(root, 'evaluations/routing-cases.json'), 'utf8'));
  await fs.writeFile(copied, JSON.stringify(cases));
  const metadata = { model: 'synthetic-test', agentVersion: 'test', sourceCommit: 'a'.repeat(40), executedAt: '2026-11-01', datasetRole: 'calibration',
    decisions: cases.map((c) => ({ id: c.id, triggered: c.shouldTrigger })) };
  const args = ['--results', file, '--cases', copied, '--out', path.join(dir, 'out')];
  await fs.writeFile(file, JSON.stringify(metadata));
  const good = await run('evaluate-routing', args);
  assert.equal(good.code, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).correct, cases.length);
  await fs.writeFile(file, JSON.stringify({ ...metadata, datasetRole: 'held_out' }));
  assert.equal((await run('evaluate-routing', args)).code, 2);
  await fs.writeFile(file, JSON.stringify({ ...metadata, decisions: metadata.decisions.map((d) => ({ ...d, triggered: !d.triggered })) }));
  assert.equal((await run('evaluate-routing', args)).code, 1);
  assert.equal((await run('evaluate-routing', ['--help'])).code, 0);
  assert.equal((await run('evaluate-routing')).code, 1);
});
