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

test('reports a missing audit report validator', async () => {
  const dir = await installCopy();
  try {
    await fs.rm(path.join(dir, 'audit-frontend-designer-konvert/scripts/validate-report.mjs'));
    assert.ok((await verifyInstall(dir)).includes('audit-frontend-designer-konvert: missing scripts/validate-report.mjs'));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('reports a missing execution record validator', async () => {
  const dir = await installCopy();
  try {
    await fs.rm(path.join(dir, 'audit-frontend-designer-konvert/scripts/validate-execution-record.mjs'));
    assert.ok((await verifyInstall(dir)).includes('audit-frontend-designer-konvert: missing scripts/validate-execution-record.mjs'));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('reports a missing browser preflight', async () => {
  const dir = await installCopy();
  try {
    await fs.rm(path.join(dir, 'audit-frontend-designer-konvert/scripts/prepare-browser.mjs'));
    assert.ok((await verifyInstall(dir)).includes('audit-frontend-designer-konvert: missing scripts/prepare-browser.mjs'));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('reports a missing creation skill', async () => {
  const dir = await installCopy();
  try {
    await fs.rm(path.join(dir, 'create-frontend-from-zero-konvert'), { recursive: true });
    assert.ok((await verifyInstall(dir)).includes('create-frontend-from-zero-konvert: SKILL.md not found'));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('installed skill sections and discoverable support files obey the repository contract', async () => {
  const dir = await installCopy();
  try {
    const entry = path.join(dir, 'design-por-referencia-konvert/SKILL.md');
    const text = await fs.readFile(entry, 'utf8');
    await fs.writeFile(entry, text.replace('## Fluxo', '## Removed heading').replace('[modelo de DESIGN.md](references/modelo-design-md.md)', 'modelo de DESIGN.md'));
    const errors = await verifyInstall(dir);
    assert.ok(errors.some((e) => e.includes('missing Fluxo section')));
    assert.ok(errors.some((e) => e.includes('supporting file must be linked: references/modelo-design-md.md')));
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
