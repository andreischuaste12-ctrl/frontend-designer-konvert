import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const inventory = fileURLToPath(new URL('../scripts/image-manifest.mjs', import.meta.url));
const capture = fileURLToPath(new URL('../scripts/capture.mjs', import.meta.url));
const run = (script, args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
// Fixtures are retained deliberately; callers may set SKILL_TEST_TMPDIR to an isolated workspace.
const fixture = () => mkdtempSync(path.join(process.env.SKILL_TEST_TMPDIR || os.tmpdir(), 'design-inventory-'));

test('static inventory excludes synthetic sensitive files while retaining interface references', () => {
  const base = fixture();
  const project = path.join(base, 'project');
  const output = path.join(base, 'output');
  mkdirSync(project);
  writeFileSync(path.join(project, 'sample.png'), Buffer.from([137, 80, 78, 71]));
  writeFileSync(path.join(project, 'index.html'), '<img src="sample.png" alt="sample">');
  writeFileSync(path.join(project, 'service-account.json'), '{"image":"sample.png"}');
  writeFileSync(path.join(project, 'credentials.js'), 'const image = "sample.png";');
  writeFileSync(path.join(project, 'catalog.json'), '{"image":"sample.png"}');
  const result = run(inventory, ['--root', project, '--out', output]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(readFileSync(path.join(output, 'images-static.json'), 'utf8'));
  assert.equal(report.total, 1);
  assert.equal(report.images[0].refs.length, 1);
});

test('missing root and invalid render widths fail before output creation', () => {
  const base = fixture();
  const missingOutput = path.join(base, 'missing-output');
  let result = run(inventory, ['--root', path.join(base, 'missing'), '--out', missingOutput]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Raiz/);
  assert.equal(existsSync(missingOutput), false);
  for (const width of ['0', 'abc', '375.5', '4001']) {
    const output = path.join(base, `output-${width}`);
    result = run(inventory, ['--url', 'http://localhost:3000', '--width', width, '--out', output]);
    assert.equal(result.status, 1, width);
    assert.match(result.stderr, /--width/);
    assert.equal(existsSync(output), false);
  }
});

test('an accessible empty directory produces a valid empty inventory', () => {
  const base = fixture();
  const project = path.join(base, 'empty');
  const output = path.join(base, 'output');
  mkdirSync(project);
  const result = run(inventory, ['--root', project, '--out', output]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(readFileSync(path.join(output, 'images-static.json'), 'utf8'));
  assert.equal(report.total, 0);
});

test('capture rejects partial invalid lists and fractional widths before output creation', () => {
  const base = fixture();
  for (const [flag, value] of [['--widths', '375,abc'], ['--widths', '375.5'], ['--control-widths', '375,0'], ['--schemes', 'light,drak']]) {
    const output = path.join(base, `output-${flag.slice(2)}`);
    const result = run(capture, ['--url', 'http://localhost:3000', flag, value, '--out', output]);
    assert.equal(result.status, 1, `${flag} ${value}`);
    assert.match(result.stderr, new RegExp(flag));
    assert.equal(existsSync(output), false);
  }
});
