import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p1sAAAAASUVORK5CYII=', 'base64');

test('all three scripts run locally and redact sensitive URL data in their reports', async (t) => {
  const server = createServer((req, res) => {
    if (req.url.startsWith('/pixel.png')) {
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' });
      res.end(pixel);
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>owner@example.invalid</title><style>body{font:16px Arial;color:#111;background:#fff}button{min-height:44px}</style><h1>Local fixture</h1><p>contact owner@example.invalid</p><button>Continue owner@example.invalid</button><img alt="Sample pixel" src="/pixel.png?signature=fixture-value"></html>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());

  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/account/customer-name?access_token=fixture-secret#fixture-fragment`;
  const out = await mkdtemp(path.join(os.tmpdir(), 'design-reference-smoke-'));
  t.after(() => rm(out, { recursive: true, force: true }));

  await assert.rejects(
    execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', `file://${path.join(out, 'private.html')}`], { cwd: root }),
    (error) => error.code === 1 && /file:\/\/.*desativadas por padrão/i.test(error.stderr),
    'file URLs must require an explicit opt-in',
  );

  await execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', url, '--widths', '375', '--control-widths', '375', '--max-controls', '1', '--out', path.join(out, 'capture')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/extract-styles.mjs'), '--url', url, '--width', '375', '--out', path.join(out, 'styles')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--url', url, '--width', '375', '--out', path.join(out, 'images')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--url', url, '--width', '375', '--save-images', '--out', path.join(out, 'images-saved')], { cwd: root });

  const artifacts = [
    await readFile(path.join(out, 'capture/capture-index.json'), 'utf8'),
    await readFile(path.join(out, 'styles/computed-styles.json'), 'utf8'),
    await readFile(path.join(out, 'styles/styles-summary.md'), 'utf8'),
    await readFile(path.join(out, 'images/images-rendered.json'), 'utf8'),
    await readFile(path.join(out, 'images/images-rendered.md'), 'utf8'),
  ].join('\n');
  assert.doesNotMatch(artifacts, /fixture-secret|fixture-fragment|fixture-value|customer-name|owner@example\.invalid/);
  assert.match(artifacts, /\[email redacted\]/);
  assert.equal((await readdir(path.join(out, 'images'))).includes('files'), false, 'images are not copied unless explicitly requested');
  const copied = await readdir(path.join(out, 'images-saved/files'));
  assert.ok(copied.length > 0, 'explicit image saving should create review copies');
  assert.ok(copied.every((name) => /^image-\d+\.[a-z0-9]+$/i.test(name)), 'saved filenames must not reveal source names');
});
