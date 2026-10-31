import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyInstall } from './verify-install.mjs';

const repoSkills = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skills');

async function installCopy() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'verify-install-'));
  await fs.cp(repoSkills, dir, { recursive: true, filter: (src) => !src.includes('node_modules') });
  return dir;
}

test('accepts a complete installation', async () => {
  const dir = await installCopy();
  try { assert.deepEqual(await verifyInstall(dir), []); }
  finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('reports a missing skill, a missing script, and a broken relative link', async () => {
  const dir = await installCopy();
  try {
    await fs.rm(path.join(dir, 'audit-frontend-designer-konvert'), { recursive: true });
    await fs.rm(path.join(dir, 'design-por-referencia-konvert/scripts/compare.mjs'));
    const errors = await verifyInstall(dir);
    assert.ok(errors.includes('audit-frontend-designer-konvert: SKILL.md not found'));
    assert.ok(errors.includes('design-por-referencia-konvert: missing scripts/compare.mjs'));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('reports a relative link that resolves to nothing', async () => {
  const dir = await installCopy();
  try {
    const skill = path.join(dir, 'design-por-referencia-konvert/SKILL.md');
    await fs.appendFile(skill, '\n[broken](references/nao-existe.md)\n');
    const errors = await verifyInstall(dir);
    assert.ok(errors.some((e) => e.includes('missing relative link references/nao-existe.md')));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
