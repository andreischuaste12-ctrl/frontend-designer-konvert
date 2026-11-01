import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectTooling, diagnose } from './doctor.mjs';

test('tooling inspection distinguishes missing, incompatible, ready, and incomplete dependencies', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'konvert-doctor-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const versions = { playwright: '1.2.3', '@axe-core/playwright': '4.5.6' };
  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ devDependencies: versions }));
  assert.equal((await inspectTooling(root)).ready, false);
  assert.ok((await inspectTooling(root)).packages.every((p) => p.status === 'missing'));
  for (const [name, version] of Object.entries(versions)) {
    const dir = path.join(root, 'node_modules', name);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name, version, main: 'index.cjs' }));
    await fs.writeFile(path.join(dir, 'index.cjs'), 'module.exports = {};');
  }
  assert.equal((await inspectTooling(root)).ready, true);
  await fs.writeFile(path.join(root, 'node_modules/playwright/package.json'), JSON.stringify({ version: '9.9.9' }));
  assert.equal((await inspectTooling(root)).packages[0].status, 'version_mismatch');
  await fs.writeFile(path.join(root, 'node_modules/@axe-core/playwright/package.json'), JSON.stringify({ version: versions['@axe-core/playwright'], main: 'missing.cjs' }));
  // A fresh module name avoids Node's resolution cache when simulating an incomplete install.
  await fs.rm(path.join(root, 'node_modules/@axe-core/playwright/index.cjs'));
  const result = await inspectTooling(root);
  assert.equal(result.ready, false);
  assert.equal(result.packages[1].status, 'unresolvable');
});

test('diagnostics report structure, dependency, and browser failures with only relevant next steps', async (t) => {
  const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const inspect = async () => ({ ready: true, packages: [] });
  const ready = await diagnose(source, { browser: true, inspect, prepare: async () => ({ status: 'ready', source: 'system', executablePath: '/private/browser' }) });
  assert.equal(ready.ready, true);
  assert.deepEqual(ready.nextSteps, []);
  assert.ok(!JSON.stringify(ready).includes('/private/browser'));
  const missingBrowser = await diagnose(source, { browser: true, inspect, prepare: async () => ({ status: 'unavailable', reason: 'No browser.' }) });
  assert.equal(missingBrowser.ready, false);
  assert.equal(missingBrowser.nextSteps.length, 1);
  assert.match(missingBrowser.nextSteps[0], /setup:browser/);
  const missingPackages = await diagnose(source, { browser: true, inspect: async () => ({ ready: false, packages: [] }), prepare: () => { throw new Error('must not launch'); } });
  assert.equal(missingPackages.browser.status, 'blocked');
  assert.deepEqual(missingPackages.nextSteps, ['Run npm run setup:tools to install pinned packages.']);
  const absent = await fs.mkdtemp(path.join(os.tmpdir(), 'doctor-structure-'));
  t.after(() => fs.rm(absent, { recursive: true, force: true }));
  const broken = await diagnose(absent, { inspect });
  assert.equal(broken.structure.ready, false);
  assert.equal(broken.browser.status, 'not_checked');
  assert.match(broken.nextSteps[0], /Restore/);
});
