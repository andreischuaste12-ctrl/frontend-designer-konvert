import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBrowser, stageBrowserTools } from '../scripts/prepare-browser.mjs';

const executor = fileURLToPath(new URL('../../design-por-referencia-konvert/', import.meta.url));

test('isolated browser staging copies only tooling outside the audited checkout', async (t) => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-browser-test-'));
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  const before = await fs.readdir(executor);
  const staged = await stageBrowserTools(executor, parent);
  assert.ok(staged.startsWith(parent + path.sep));
  assert.deepEqual((await fs.readdir(staged)).sort(), ['package-lock.json', 'package.json', 'scripts']);
  assert.deepEqual(await fs.readdir(executor), before);
  assert.ok(await fs.stat(path.join(staged, 'scripts/capture.mjs')));
});

test('browser preparation reports missing tools without installing or touching the target', async (t) => {
  const empty = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-browser-empty-'));
  t.after(() => fs.rm(empty, { recursive: true, force: true }));
  const result = await prepareBrowser(empty);
  assert.equal(result.status, 'unavailable');
  assert.deepEqual(await fs.readdir(empty), []);
});

test('isolated runtime cannot be staged inside the current audited checkout', async () => {
  await assert.rejects(stageBrowserTools(executor, process.cwd()), /outside the audited project/);
});

test('a temporary path symlinked into the audited checkout is rejected', { skip: process.platform === 'win32' }, async (t) => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-browser-alias-'));
  t.after(() => fs.rm(parent, { recursive: true, force: true }));
  const alias = path.join(parent, 'inside');
  await fs.symlink(process.cwd(), alias, 'dir');
  await assert.rejects(stageBrowserTools(executor, alias), /outside the audited project/);
});

test('failed isolated preparation exposes no personal path and does not install in the checkout', async (t) => {
  const source = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-browser-source-'));
  t.after(() => fs.rm(source, { recursive: true, force: true }));
  for (const name of ['package.json', 'package-lock.json']) await fs.copyFile(path.join(executor, name), path.join(source, name));
  await fs.cp(path.join(executor, 'scripts'), path.join(source, 'scripts'), { recursive: true });
  const blocked = await prepareBrowser(source, { install: true, parent: process.cwd() });
  assert.equal(blocked.status, 'unavailable');
  assert.match(blocked.reason, /outside the audited project/);
  const missingParent = path.join(source, 'does-not-exist');
  const unavailable = await prepareBrowser(source, { install: true, parent: missingParent });
  assert.equal(unavailable.status, 'unavailable');
  assert.equal(unavailable.reason, 'Isolated browser preparation failed; filesystem details omitted.');
  assert.ok(!unavailable.reason.includes(missingParent));
  assert.deepEqual((await fs.readdir(source)).sort(), ['package-lock.json', 'package.json', 'scripts']);
});
