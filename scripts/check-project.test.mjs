import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkProject, discoverTests } from './check-project.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'check-project-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const dir of ['scripts', 'skills/audit-frontend-designer-konvert/tests', 'skills/design-por-referencia-konvert/tests']) {
    await fs.mkdir(path.join(root, dir), { recursive: true });
    await fs.writeFile(path.join(root, dir, 'new-regression.test.mjs'), '');
  }
  for (const name of ['scripts-smoke.test.mjs', 'network-guards.test.mjs']) await fs.writeFile(path.join(root, 'skills/design-por-referencia-konvert/tests', name), '');
  return root;
}

test('new executor tests are discovered without editing the runner and browser tests stay separate', async (t) => {
  const root = await fixture(t);
  const tests = await discoverTests(root);
  assert.equal(tests.unit.length, 3);
  assert.equal(tests.browser.length, 2);
  const calls = [];
  await checkProject(root, { run: async (...args) => calls.push(args), prepare: () => { throw new Error('unit checks must not prepare a browser'); } });
  assert.equal(calls.length, 2);
  assert.ok(calls[1][0].some((p) => p.endsWith('design-por-referencia-konvert/tests/new-regression.test.mjs')));
  assert.ok(!calls[1][0].some((p) => p.includes('scripts-smoke')));
});

test('failed prerequisites stop browser checks; successful preflight wires the browser only to that suite', async (t) => {
  const root = await fixture(t);
  const calls = [];
  const run = async (...args) => calls.push(args);
  await assert.rejects(checkProject(root, { browser: true, run, prepare: async () => ({ status: 'unavailable' }) }), (error) => error.exitCode === 2);
  assert.equal(calls.length, 2);
  calls.length = 0;
  await checkProject(root, { browser: true, run, prepare: async () => ({ status: 'ready', executablePath: 'synthetic-browser' }) });
  assert.equal(calls.length, 3);
  assert.equal(calls[2][2].PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, 'synthetic-browser');
  assert.equal(calls[1][2], undefined);
  let attempts = 0;
  await assert.rejects(checkProject(root, { run: async () => { attempts++; throw new Error('check failed'); } }));
  assert.equal(attempts, 1);
});
