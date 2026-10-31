import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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
    res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>owner@example.invalid</title><style>:root{--surface:#fff}.dark{--surface:#111}[data-theme="dark"]{--surface:#000}body{font:16px Arial;color:#111;background:#fff}#faded{opacity:.5}button{min-height:44px}input{height:24px}</style><h1>Local fixture</h1><p id="faded">contact owner@example.invalid</p><label for="private-field">Private field</label><input id="private-field" type="text" value="synthetic-field-value"><textarea>synthetic-textarea-value</textarea><button>Continue owner@example.invalid</button><img alt="Sample pixel" src="/pixel.png?signature=fixture-value"><img alt="" src="https://www.google-analytics.com/g/collect?value=synthetic"></html>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());

  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/account/customer-name?access_token=fixture-secret#fixture-fragment`;
  const out = await mkdtemp(path.join(os.tmpdir(), 'design-reference-smoke-'));
  t.after(() => rm(out, { recursive: true, force: true }));

  await assert.rejects(
    execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', `file://${path.join(out, 'private.html')}`], { cwd: root }),
    (error) => error.code === 1 && /URL recusada: file URLs require --allow-file/i.test(error.stderr),
    'file URLs must require an explicit opt-in',
  );

  await execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', url, '--profile', 'rapido', '--widths', '375', '--control-widths', '375', '--max-controls', '1', '--out', path.join(out, 'capture')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/extract-styles.mjs'), '--url', url, '--width', '375', '--out', path.join(out, 'styles')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--url', url, '--width', '375', '--out', path.join(out, 'images')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--url', url, '--width', '375', '--save-images', '--out', path.join(out, 'images-saved')], { cwd: root });

  const captureIndex = await readFile(path.join(out, 'capture/capture-index.json'), 'utf8');
  const stylesJson = await readFile(path.join(out, 'styles/computed-styles.json'), 'utf8');
  const artifacts = [
    captureIndex,
    stylesJson,
    await readFile(path.join(out, 'styles/styles-summary.md'), 'utf8'),
    await readFile(path.join(out, 'styles/aria-snapshot.yml'), 'utf8').catch(() => ''),
    await readFile(path.join(out, 'images/images-rendered.json'), 'utf8'),
    await readFile(path.join(out, 'images/images-rendered.md'), 'utf8'),
  ].join('\n');
  assert.doesNotMatch(artifacts, /fixture-secret|fixture-fragment|fixture-value|customer-name|owner@example\.invalid|synthetic-field-value|synthetic-textarea-value/);
  assert.match(artifacts, /\[email redacted\]/);
  assert.match(artifacts, /google-analytics\.com/);
  const stylesData = JSON.parse(stylesJson);
  assert.ok(stylesData.rootVars.some((variable) => variable.name === '--surface' && variable.at === '.dark'));
  assert.ok(stylesData.rootVars.some((variable) => variable.name === '--surface' && variable.at === '[data-theme="dark"]'));
  assert.ok(stylesData.elements.some((element) => element.text.startsWith('contact ') && element.contrastStatus === 'indeterminado'));
  assert.doesNotMatch(captureIndex, /ERR_BLOCKED_BY_CLIENT/);
  assert.equal((await readdir(path.join(out, 'images'))).includes('files'), false, 'images are not copied unless explicitly requested');
  const copied = await readdir(path.join(out, 'images-saved/files'));
  assert.ok(copied.length > 0, 'explicit image saving should create review copies');
  assert.ok(copied.every((name) => /^image-\d+\.[a-z0-9]+$/i.test(name)), 'saved filenames must not reveal source names');

  const project = path.join(out, 'static-project');
  await mkdir(path.join(project, 'assets', 'a'), { recursive: true });
  await mkdir(path.join(project, 'assets', 'b'), { recursive: true });
  await writeFile(path.join(project, 'assets', 'a', 'hero.png'), pixel);
  await writeFile(path.join(project, 'assets', 'b', 'hero.png'), pixel);
  await writeFile(path.join(project, 'index.html'), '<img src="assets/a/hero.png"><img src="hero.png">');
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--root', project, '--out', path.join(out, 'static')], { cwd: root });
  const staticManifest = JSON.parse(await readFile(path.join(out, 'static/images-static.json'), 'utf8'));
  const exactImage = staticManifest.images.find((image) => image.path === 'assets/a/hero.png');
  assert.equal(exactImage.refs.length, 1, 'an exact relative reference should resolve to one matching image');
  assert.ok(staticManifest.images.every((image) => image.flags.includes('referência-ambígua')), 'an ambiguous basename should be flagged instead of misattributed');
});
