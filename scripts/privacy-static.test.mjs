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
