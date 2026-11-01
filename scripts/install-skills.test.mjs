import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installSkills } from './install-skills.mjs';
import { REQUIRED_SKILLS, verifyInstall } from './verify-install.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skills');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'konvert-installer-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

test('fresh installation copies all skills without dependencies and passes the installed contract', async (t) => {
  const dir = await fixture(t), target = path.join(dir, 'project/.agents/skills');
  const result = await installSkills(target);
  assert.deepEqual(result.installed, REQUIRED_SKILLS);
  assert.deepEqual(await verifyInstall(target), []);
  assert.equal(result.activationVerified, false);
  await assert.rejects(fs.access(path.join(target, REQUIRED_SKILLS[1], 'node_modules')));
});

test('a conflicting skill is preserved and earlier reservations are rolled back', async (t) => {
  const dir = await fixture(t), target = path.join(dir, 'skills');
  const existing = path.join(target, REQUIRED_SKILLS[1]);
  await fs.mkdir(existing, { recursive: true });
  await fs.writeFile(path.join(existing, 'keep.txt'), 'local work');
  await assert.rejects(installSkills(target), /already exists/);
  assert.equal(await fs.readFile(path.join(existing, 'keep.txt'), 'utf8'), 'local work');
  await assert.rejects(fs.access(path.join(target, REQUIRED_SKILLS[0])));
  assert.deepEqual(await fs.readdir(target), [REQUIRED_SKILLS[1]]);
});

test('verification failures leave no partially installed skills or overwritten unrelated files', async (t) => {
  const target = await fixture(t);
  await fs.writeFile(path.join(target, 'unrelated.md'), 'preserve');
  let attempts = 0;
  await assert.rejects(installSkills(target, { verify: async () => ++attempts === 1 ? [] : ['failure'] }), /rolled back/);
  assert.deepEqual(await fs.readdir(target), ['unrelated.md']);
  await assert.rejects(installSkills(path.join(source, 'nested')), /outside/);
});

test('symlinked source entries are rejected before touching the destination', async (t) => {
  const dir = await fixture(t), stagedSource = path.join(dir, 'source'), target = path.join(dir, 'target');
  await fs.mkdir(path.join(stagedSource, REQUIRED_SKILLS[0]), { recursive: true });
  await fs.mkdir(path.join(dir, 'outside'));
  try { await fs.symlink(path.join(dir, 'outside'), path.join(stagedSource, REQUIRED_SKILLS[0], 'linked'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (error.code === 'EPERM') { t.skip('Symlinks unavailable on this host.'); return; } throw error; }
  await assert.rejects(installSkills(target, { source: stagedSource }), /symbolic links/);
  await assert.rejects(fs.access(target));
});
