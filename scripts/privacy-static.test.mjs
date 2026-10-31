import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../skills/design-por-referencia-konvert/scripts/image-manifest.mjs', import.meta.url));
test('static image artifacts never expose source file or folder names', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'static-privacy-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'project'), out = path.join(dir, 'out');
  await fs.mkdir(path.join(root, 'private-person'), { recursive: true });
  await fs.writeFile(path.join(root, 'private-person', 'synthetic@example.invalid.png'), 'synthetic');
  await fs.writeFile(path.join(root, 'private-person', 'synthetic-source.html'), '<img src="synthetic@example.invalid.png">');
  await promisify(execFile)(process.execPath, [script, '--root', root, '--out', out]);
  for (const name of ['images-static.json', 'images-static.md', 'imagens-revisao.md']) {
    const text = await fs.readFile(path.join(out, name), 'utf8');
    assert.doesNotMatch(text, /synthetic@example\.invalid|private-person|synthetic-source|\.invalid\.png/);
    assert.match(text, /image-0001\.png/);
  }
});

test('optional source map requires a new ignored file outside report output', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'static-map-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'project'), out = path.join(root, '.audit', 'images'), maps = path.join(root, '.audit', 'private');
  await fs.mkdir(maps, { recursive: true });
  await promisify(execFile)('git', ['init', '-q', root]);
  await fs.writeFile(path.join(root, '.gitignore'), '.audit/\n');
  await fs.writeFile(path.join(root, 'synthetic@example.invalid.png'), 'synthetic');
  await fs.writeFile(path.join(root, 'index.html'), '<img src="synthetic@example.invalid.png">');
  const map = path.join(maps, 'map.json'), run = promisify(execFile);
  await run(process.execPath, [script, '--root', root, '--out', out, '--source-map', map]);
  const mapping = JSON.parse(await fs.readFile(map, 'utf8'));
  assert.equal(mapping['image-0001.png'], 'synthetic@example.invalid.png');
  assert.equal(mapping['source-0001'], 'index.html');
  if (process.platform !== 'win32') assert.equal((await fs.stat(map)).mode & 0o077, 0);
  for (const name of ['images-static.json', 'images-static.md', 'imagens-revisao.md']) assert.doesNotMatch(await fs.readFile(path.join(out, name), 'utf8'), /synthetic@example\.invalid|index\.html/);
  await assert.rejects(run(process.execPath, [script, '--root', root, '--out', out, '--source-map', map]), (e) => e.code === 1 && !e.stderr.includes(map));
  await assert.rejects(run(process.execPath, [script, '--root', root, '--out', out, '--source-map', path.join(root, 'not-ignored.json')]), (e) => e.code === 1);
  await assert.rejects(run(process.execPath, [script, '--root', root, '--out', out, '--source-map', path.join(out, 'map.json')]), (e) => e.code === 1);
});
