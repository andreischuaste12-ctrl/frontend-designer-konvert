import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { validateHandoffCase, checkScope, hashTree, changedFiles } from './check-handoff-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const casePath = path.join(root, 'evaluations/handoff/loja.json');
const readJson = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));

async function loadCase() {
  const handoff = await readJson(casePath);
  const rawReport = await readJson(path.join(root, handoff.report));
  return { handoff, rawReport };
}

async function scenario(t, edits) {
  const { handoff, rawReport } = await loadCase();
  const fixture = path.join(root, handoff.fixture);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'handoff-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.cp(fixture, dir, { recursive: true });
  for (const [file, text] of Object.entries(edits)) await fs.appendFile(path.join(dir, file), text);
  const { report } = validateHandoffCase(handoff, rawReport);
  return { dir, result: checkScope(handoff, report, changedFiles(await hashTree(fixture), await hashTree(dir))) };
}

test('the loja handoff case is consistent with its report', async () => {
  const { handoff, rawReport } = await loadCase();
  assert.deepEqual(validateHandoffCase(handoff, rawReport).errors, []);
});

test('changing exactly the approved, unblocked findings passes', async (t) => {
  const { result } = await scenario(t, { 'css/product.css': '\n.buy-button { background: #1d4f91; color: #fff; font-weight: 700; }\n', 'css/header.css': '\n@media (max-width: 600px) { .nav a { color: #333; } }\n' });
  assert.deepEqual(result, { changed: ['css/header.css', 'css/product.css'], implementable: ['LOJA-001', 'LOJA-002'], violations: [], notImplemented: [], passed: true });
});

test('protected files, blocked findings, and unmapped files are violations', async (t) => {
  const { result } = await scenario(t, {
    'css/product.css': '\n/* change */\n', 'css/header.css': '\n/* change */\n',
    'js/cart.js': '\n// change\n', 'index.html': '\n<!-- change -->\n', 'css/base.css': '\n/* change */\n', 'css/extra.css': '.x{}',
  });
  assert.equal(result.passed, false);
  assert.deepEqual(result.violations, [
    { path: 'css/base.css', reason: 'LOJA-005 is not implementable' },
    { path: 'css/extra.css', reason: 'outside the approved scope' },
    { path: 'index.html', reason: 'LOJA-003 is not implementable' },
    { path: 'js/cart.js', reason: 'protected' },
  ]);
});

test('an approved finding left untouched is reported as not implemented', async (t) => {
  const { result } = await scenario(t, { 'css/product.css': '\n/* change */\n' });
  assert.deepEqual(result.notImplemented, ['LOJA-002']);
  assert.equal(result.passed, false);
});

test('detects added or changed symbolic links without following them', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'handoff-links-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const before = path.join(dir, 'before'), after = path.join(dir, 'after');
  await fs.mkdir(before); await fs.mkdir(after);
  try { await fs.symlink('synthetic-target', path.join(after, 'link')); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOSYS'].includes(error.code)) { t.skip('symbolic links unavailable'); return; } throw error; }
  assert.deepEqual(changedFiles(await hashTree(before), await hashTree(after)), ['link']);
});

test('case validation rejects overlapping paths and a drifted implementable list', async () => {
  const { handoff, rawReport } = await loadCase();
  const overlapping = { ...handoff, findingPaths: { ...handoff.findingPaths, 'LOJA-004': ['css/product.css'] } };
  assert.match(validateHandoffCase(overlapping, rawReport).errors.join('\n'), /disjoint paths/);
  const protectedOverlap = { ...handoff, protectedPaths: ['css/product.css'] };
  assert.match(validateHandoffCase(protectedOverlap, rawReport).errors.join('\n'), /both protected and mapped/);
  const drifted = { ...handoff, expectedImplementable: ['LOJA-001', 'LOJA-002', 'LOJA-003'] };
  assert.match(validateHandoffCase(drifted, rawReport).errors.join('\n'), /expectedImplementable does not match/);
  const escaping = { ...handoff, findingPaths: { ...handoff.findingPaths, 'LOJA-001': ['../outside.css'] } };
  assert.match(validateHandoffCase(escaping, rawReport).errors.join('\n'), /relative paths/);
});

test('the CLI exits 0 on a clean run, 1 on a scope violation', async (t) => {
  const run = promisify(execFile);
  const script = path.join(root, 'scripts/check-handoff-scope.mjs');
  const clean = await scenario(t, { 'css/product.css': '\n/* a */\n', 'css/header.css': '\n/* b */\n' });
  const ok = await run(process.execPath, [script, '--case', casePath, '--after', clean.dir]);
  assert.equal(JSON.parse(ok.stdout).passed, true);
  const dirty = await scenario(t, { 'css/product.css': '\n/* a */\n', 'css/header.css': '\n/* b */\n', 'js/cart.js': '\n// c\n' });
  await assert.rejects(run(process.execPath, [script, '--case', casePath, '--after', dirty.dir]), (err) => err.code === 1 && JSON.parse(err.stdout).violations[0].path === 'js/cart.js');
});
