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
  const ok = await run(process.execPath, [script, '--case', casePath, '--before', path.join(root, 'evaluations/fixtures/loja'), '--after', clean.dir]);
  assert.equal(JSON.parse(ok.stdout).passed, true);
  const dirty = await scenario(t, { 'css/product.css': '\n/* a */\n', 'css/header.css': '\n/* b */\n', 'js/cart.js': '\n// c\n' });
  await assert.rejects(run(process.execPath, [script, '--case', casePath, '--before', path.join(root, 'evaluations/fixtures/loja'), '--after', dirty.dir]), (err) => err.code === 1 && JSON.parse(err.stdout).violations[0].path === 'js/cart.js');
});

test('operator approvals narrow the fixture scope and an empty approval permits no edits', async () => {
  const { handoff, rawReport } = await loadCase();
  const single = checkScope(handoff, rawReport, ['css/product.css'], ['LOJA-001']);
  assert.equal(single.passed, true);
  assert.deepEqual(single.implementable, ['LOJA-001']);
  assert.equal(checkScope(handoff, rawReport, ['css/header.css'], ['LOJA-001']).passed, false);
  assert.equal(checkScope(handoff, rawReport, [], []).passed, true);
  assert.equal(checkScope(handoff, rawReport, ['css/product.css'], []).passed, false);
  assert.throws(() => checkScope(handoff, rawReport, [], ['UNKNOWN-001']), /known finding/);
  assert.deepEqual(checkScope(handoff, rawReport, [], ['LOJA-003']).implementable, [], 'approval cannot unblock a pending dependency');
  assert.deepEqual(checkScope({ ...handoff, authorizedIds: undefined }, rawReport, []).implementable, [], 'missing approval fails closed');
});


test('handoff approvals are independent of report flags and legacy warnings remain visible', async () => {
  const { handoff, rawReport } = await loadCase();
  assert.deepEqual(handoff.authorizedIds, ['LOJA-001', 'LOJA-002', 'LOJA-003']);
  assert.ok(validateHandoffCase({ ...handoff, brief: 'Implemente os achados aprovados.' }, rawReport).errors.some((e) => e.includes('brief must explicitly')));
  assert.ok(validateHandoffCase({ ...handoff, brief: 'Autorizo LOJA-0010, LOJA-002 e LOJA-003.' }, rawReport).errors.some((e) => e.includes('brief must explicitly')));
  assert.ok(handoff.authorizedIds.every((id) => handoff.brief.includes(id)));
  assert.ok(validateHandoffCase({ ...handoff, authorizedIds: undefined }, rawReport).errors.some((e) => e.includes('authorizedIds')));
  assert.ok(validateHandoffCase({ ...handoff, authorizedIds: [] }, rawReport).errors.some((e) => e.includes('authorizedIds')));
  assert.ok(validateHandoffCase({ ...handoff, authorizedIds: ['LOJA-001'] }, rawReport).errors.some((e) => e.includes('expectedImplementable')));
  const legacy = validateHandoffCase(handoff, { ...rawReport, schema_version: 2 });
  assert.deepEqual(legacy.errors, []);
  assert.ok(legacy.warnings.some((w) => w.includes('version 2')));
});

test('prepared baseline accepts setup files but still detects later skill tampering', async (t) => {
  const { handoff, rawReport } = await loadCase();
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'prepared-handoff-'));
  t.after(() => fs.rm(temp, { recursive: true, force: true }));
  const before = path.join(temp, 'before'), after = path.join(temp, 'after');
  await fs.cp(path.join(root, handoff.fixture), before, { recursive: true });
  const installed = '.agents/skills/synthetic-konvert/SKILL.md';
  await fs.mkdir(path.dirname(path.join(before, installed)), { recursive: true });
  await fs.writeFile(path.join(before, installed), 'Synthetic installed baseline');
  await fs.writeFile(path.join(before, '.gitignore'), '.audit/\n');
  await fs.cp(before, after, { recursive: true });
  for (const file of ['css/product.css', 'css/header.css']) await fs.appendFile(path.join(after, file), '\n/* authorized */\n');
  const original = await hashTree(before);
  assert.equal(checkScope(handoff, rawReport, changedFiles(original, await hashTree(after))).passed, true);
  await fs.appendFile(path.join(after, installed), '\nUnexpected instruction');
  assert.ok(checkScope(handoff, rawReport, changedFiles(original, await hashTree(after))).violations.some((v) => v.path === installed));
  await assert.rejects(promisify(execFile)(process.execPath, [path.join(root, 'scripts/check-handoff-scope.mjs'), '--case', casePath, '--after', after]), (e) => e.code === 2 && /prepared-baseline/.test(e.stdout));
});
