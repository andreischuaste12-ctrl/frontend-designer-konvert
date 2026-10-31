import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSuccessfulRun, verifyMatrixJobs, releaseNotes } from './release-readiness.mjs';
const sha = 'a'.repeat(40);
const run = { id: 123, run_number: 1, head_sha: sha, head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success' };
const jobs = [{ name: 'coverage', status: 'completed', conclusion: 'success' }];
for (const os of ['ubuntu-latest', 'windows-latest']) {
  for (const name of [`repository (${os})`, `smoke (${os})`, ...['20', '22', '24'].map((n) => `validate (${n}, ${os})`)]) jobs.push({ name, status: 'completed', conclusion: 'success' });
}
test('requires successful main push for exact commit', () => {
  assert.equal(selectSuccessfulRun({ workflow_runs: [run] }, sha), 123);
  assert.throws(() => selectSuccessfulRun({ workflow_runs: [{ ...run, head_sha: 'b'.repeat(40) }] }, sha));
  assert.throws(() => selectSuccessfulRun({ workflow_runs: [{ ...run, event: 'pull_request' }] }, sha));
  assert.throws(() => selectSuccessfulRun({ workflow_runs: [{ ...run, conclusion: 'failure' }] }, sha));
  assert.throws(() => selectSuccessfulRun({ workflow_runs: [run, { ...run, run_number: 2, conclusion: 'failure' }] }, sha));
  assert.throws(() => selectSuccessfulRun({ workflow_runs: [run, { ...run, run_number: 2, status: 'in_progress', conclusion: null }] }, sha));
});
test('requires every distinct matrix job to have completed successfully', () => {
  assert.equal(verifyMatrixJobs({ jobs }), true);
  assert.throws(() => verifyMatrixJobs({ jobs: jobs.slice(1) }));
  assert.throws(() => verifyMatrixJobs({ jobs: [ ...jobs.slice(0, -1), { ...jobs.at(-1), conclusion: 'skipped' } ] }));
  assert.throws(() => verifyMatrixJobs({ jobs: [ ...jobs, jobs[0] ] }));
});
test('requires the matching stable release section and does not include Unreleased', () => {
  const log = '# Changelog\n\n## Unreleased\n\n- private draft\n\n## 0.2.0 — 2026-10-31\n\n- public note\n\n## 0.1.0\n\n- older\n';
  assert.equal(releaseNotes(log, 'v0.2.0'), '- public note\n');
  assert.throws(() => releaseNotes(log, 'v0.3.0'));
  assert.throws(() => releaseNotes(log, 'v0.2.0-rc1'));
});
