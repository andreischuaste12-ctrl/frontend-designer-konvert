import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p1sAAAAASUVORK5CYII=', 'base64');

test('capture, styles, images, and comparison run locally and redact sensitive URL data in their reports', async (t) => {
  let revised = false;
  let posts = 0;
  const server = createServer((req, res) => {
    if (req.method === 'POST') { posts++; req.resume(); res.writeHead(204); res.end(); return; }
    if (req.url.startsWith('/missing.png')) { res.writeHead(404); res.end(); return; }
    if (req.url.startsWith('/pixel.png')) {
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store', 'content-length': pixel.length });
      res.end(pixel);
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>owner@example.invalid</title><style>:root{--surface:#fff}.dark{--surface:#111}[data-theme="dark"]{--surface:#000}body{font:16px Arial;color:#111;background:${revised ? '#ddd' : '#fff'}}#overflow{width:700px;height:8px}.low-contrast{color:#999;background:#eee}#tiny{width:20px;height:20px;min-height:0;padding:0}#faded{opacity:.5}button{min-height:44px}input{height:24px}</style><h1>Local fixture</h1><div id="overflow"></div><p class="low-contrast">Low contrast fixture</p><button id="tiny">X</button><img src="/missing.png"><p id="faded">contact owner@example.invalid</p><label for="private-field">Private field</label><input id="private-field" type="text" value="synthetic-field-value"><textarea>synthetic-textarea-value</textarea><button>Continue owner@example.invalid</button><img alt="Sample pixel" src="/pixel.png?signature=fixture-value"><img alt="" src="https://www.google-analytics.com/g/collect?value=synthetic"><script>fetch('/track', {method:'POST', body:'synthetic-event'}).catch(() => {});</script></html>`);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());

  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/account/customer-name?access_token=fixture-secret#fixture-fragment`;
  const out = await mkdtemp(path.join(os.tmpdir(), 'design-reference-smoke-'));
  t.after(() => rm(out, { recursive: true, force: true }));

  await assert.rejects(
    execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', pathToFileURL(path.join(out, 'private.html')).href], { cwd: root }),
    (error) => error.code === 1 && /URL recusada: file URLs require --allow-file/i.test(error.stderr),
    'file URLs must require an explicit opt-in',
  );

  await execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', url, '--profile', 'rapido', '--widths', '375,1440', '--max-tiles', '1', '--control-widths', '375', '--max-controls', '1', '--out', path.join(out, 'capture')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/extract-styles.mjs'), '--url', url, '--width', '375', '--out', path.join(out, 'styles')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--url', url, '--width', '375', '--out', path.join(out, 'images')], { cwd: root });
  await execFileAsync(process.execPath, [path.join(root, 'scripts/image-manifest.mjs'), '--url', url, '--width', '375', '--save-images', '--out', path.join(out, 'images-saved')], { cwd: root });

  assert.ok(posts > 0, 'default mode must preserve POST-based reads');
  const beforeBlockedRun = posts;
  await execFileAsync(process.execPath, [path.join(root, 'scripts/extract-styles.mjs'), '--url', url, '--block-writes', '--out', path.join(out, 'blocked-writes')], { cwd: root });
  assert.equal(posts, beforeBlockedRun, 'opt-in method guard must prevent the same-origin POST');
  const blockedReport = JSON.parse(await readFile(path.join(out, 'blocked-writes/computed-styles.json'), 'utf8'));
  assert.equal(blockedReport.meta.blockWrites, true);
  assert.deepEqual(blockedReport.meta.blockedWriteMethods, ['POST']);
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
  const pages = JSON.parse(captureIndex).pages;
  assert.equal(pages.find((p) => p.width === 375).horizontalOverflow, true);
  assert.equal(pages.find((p) => p.width === 1440).horizontalOverflow, false);
  assert.ok(stylesData.elements.some((e) => e.contrastStatus === 'falha'));
  assert.ok(stylesData.targets.some((e) => e.selector.includes('tiny') && e.lt24));
  const imagesData = JSON.parse(await readFile(path.join(out, 'images/images-rendered.json'), 'utf8'));
  assert.ok(imagesData.items.some((i) => i.flags.includes('quebrada') && i.flags.includes('alt-ausente')));
  const compareScript = path.join(root, 'scripts/compare.mjs');
  await execFileAsync(process.execPath, [compareScript, '--before', path.join(out, 'styles'), '--after', path.join(out, 'styles'), '--out', path.join(out, 'same-styles')], { cwd: root });
  const sameStyles = JSON.parse(await readFile(path.join(out, 'same-styles/comparison.json'), 'utf8'));
  assert.ok(sameStyles.styles.entries.length > 0 && sameStyles.styles.entries.every((e) => e.status === 'unchanged'));
  await execFileAsync(process.execPath, [compareScript, '--before', path.join(out, 'capture'), '--after', path.join(out, 'capture'), '--pixels', '--out', path.join(out, 'same')], { cwd: root });
  const same = JSON.parse(await readFile(path.join(out, 'same/comparison.json'), 'utf8'));
  assert.ok(same.pixels.length > 0 && same.pixels.every((p) => p.status === 'compared' && p.differentPercent === 0));
  revised = true;
  await execFileAsync(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', url, '--widths', '375', '--max-controls', '0', '--max-tiles', '1', '--out', path.join(out, 'revised')], { cwd: root });
  await execFileAsync(process.execPath, [compareScript, '--before', path.join(out, 'capture'), '--after', path.join(out, 'revised'), '--pixels', '--out', path.join(out, 'diff')], { cwd: root });
  const diff = JSON.parse(await readFile(path.join(out, 'diff/comparison.json'), 'utf8'));
  assert.ok(diff.pixels.some((p) => p.differentPercent > 0 && p.diffFile));
  assert.ok(diff.pixels.some((p) => p.status === 'missing'), 'missing viewports must be reported explicitly');
  await mkdir(path.join(out, 'mismatch'));
  await writeFile(path.join(out, 'mismatch/pixel.png'), pixel);
  const full = JSON.parse(captureIndex).files.find((f) => f.state === 'full' && f.width === 375);
  await writeFile(path.join(out, 'mismatch/capture-index.json'), JSON.stringify({ files: [{ ...full, file: 'pixel.png' }] }));
  await execFileAsync(process.execPath, [compareScript, '--before', path.join(out, 'capture'), '--after', path.join(out, 'mismatch'), '--pixels', '--out', path.join(out, 'mismatch-result')], { cwd: root });
  const mismatch = JSON.parse(await readFile(path.join(out, 'mismatch-result/comparison.json'), 'utf8'));
  assert.ok(mismatch.pixels.some((p) => p.status === 'dimension-mismatch' && p.differentPercent === undefined));
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
