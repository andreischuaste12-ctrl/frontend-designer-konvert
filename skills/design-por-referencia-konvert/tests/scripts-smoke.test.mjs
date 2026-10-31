import { describe, test, before, after } from 'node:test';
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
const run = (script, args) => execFileAsync(process.execPath, [path.join(root, 'scripts', script + '.mjs'), ...args], { cwd: root, timeout: 45000 });
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));

describe('browser CLI regression scenarios', { concurrency: false, timeout: 120000 }, () => {
  let server, url, out, revised = false, posts = 0;
  before(async () => {
    server = createServer((req, res) => {
      if (req.method === 'POST') { posts++; req.resume(); res.writeHead(204); res.end(); return; }
      if (req.url.startsWith('/missing.png')) { res.writeHead(404); res.end(); return; }
      if (req.url.startsWith('/pixel.png')) { res.writeHead(200, { 'content-type': 'image/png', 'content-length': pixel.length }); res.end(pixel); return; }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>owner@example.invalid</title><style>:root{--surface:#fff}.dark{--surface:#111}[data-theme="dark"]{--surface:#000}body{font:16px Arial;color:#111;background:${revised ? '#ddd' : '#fff'}}#overflow{width:700px;height:8px}.low-contrast{color:#999;background:#eee}#tiny{width:20px;height:20px;min-height:0;padding:0}#faded{opacity:.5}button{min-height:44px}input{height:24px}</style><h1>Local fixture</h1><div id="overflow"></div><p class="low-contrast">Low contrast fixture</p><button id="tiny">X</button><img src="/missing.png"><p id="faded">contact owner@example.invalid</p><label for="private-field">Private field</label><input id="private-field" type="text" value="synthetic-field-value"><textarea>synthetic-textarea-value</textarea><button>Continue owner@example.invalid</button><img alt="Sample pixel" src="/pixel.png?signature=fixture-value"><img alt="" src="https://www.google-analytics.com/g/collect?value=synthetic"><script>fetch('/track', {method:'POST', body:'synthetic-event'}).catch(() => {});</script></html>`);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${server.address().port}/account/customer-name?access_token=fixture-secret#fixture-fragment`;
    out = await mkdtemp(path.join(os.tmpdir(), 'design-reference-smoke-'));
  });
  after(async () => {
    if (server) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
    if (out) await rm(out, { recursive: true, force: true });
  });

  test('capture rejects file URLs without opt-in and detects viewport-specific overflow', async () => {
    await assert.rejects(run('capture', ['--url', pathToFileURL(path.join(out, 'private.html')).href]), (e) => e.code === 1 && /file URLs require --allow-file/.test(e.stderr));
    await run('capture', ['--url', url, '--profile', 'rapido', '--widths', '375,1440', '--max-tiles', '1', '--control-widths', '375', '--max-controls', '1', '--out', path.join(out, 'capture')]);
    const index = await json(path.join(out, 'capture/capture-index.json'));
    assert.equal(index.pages.find((p) => p.width === 375).horizontalOverflow, true);
    assert.equal(index.pages.find((p) => p.width === 1440).horizontalOverflow, false);
    assert.doesNotMatch(JSON.stringify(index), /ERR_BLOCKED_BY_CLIENT/);
  });

  test('styles report theme tokens, contrast failures, opacity uncertainty, and small targets', async () => {
    await run('extract-styles', ['--url', url, '--width', '375', '--out', path.join(out, 'styles')]);
    const styles = await json(path.join(out, 'styles/computed-styles.json'));
    for (const at of ['.dark', '[data-theme="dark"]']) assert.ok(styles.rootVars.some((v) => v.name === '--surface' && v.at === at));
    assert.ok(styles.elements.some((e) => e.text.startsWith('contact ') && e.contrastStatus === 'indeterminado'));
    assert.ok(styles.elements.some((e) => e.contrastStatus === 'falha'));
    assert.ok(styles.targets.some((e) => e.selector.includes('tiny') && e.lt24));
  });

  test('write blocking prevents a same-origin POST while preserving default POST-based reads', async () => {
    const beforeDefault = posts;
    await run('extract-styles', ['--url', url, '--out', path.join(out, 'post-default')]);
    assert.ok(posts > beforeDefault);
    const beforeBlocked = posts;
    await run('extract-styles', ['--url', url, '--block-writes', '--out', path.join(out, 'post-blocked')]);
    assert.equal(posts, beforeBlocked);
    const report = await json(path.join(out, 'post-blocked/computed-styles.json'));
    assert.equal(report.meta.blockWrites, true);
    assert.deepEqual(report.meta.blockedWriteMethods, ['POST']);
  });

  test('image inventory detects missing images/alt and requires explicit copying', async () => {
    await run('image-manifest', ['--url', url, '--width', '375', '--out', path.join(out, 'images')]);
    const report = await json(path.join(out, 'images/images-rendered.json'));
    assert.ok(report.items.some((i) => i.flags.includes('quebrada') && i.flags.includes('alt-ausente')));
    assert.equal((await readdir(path.join(out, 'images'))).includes('files'), false);
    await run('image-manifest', ['--url', url, '--width', '375', '--save-images', '--out', path.join(out, 'images-saved')]);
    const copied = await readdir(path.join(out, 'images-saved/files'));
    assert.ok(copied.length > 0 && copied.every((file) => /^image-\d+\.[a-z0-9]+$/i.test(file)));
  });

  test('comparison detects equality, visual changes, missing pairs, and dimension mismatches', async () => {
    const a = path.join(out, 'compare-a'), b = path.join(out, 'compare-b');
    revised = false;
    await run('capture', ['--url', url, '--widths', '375,1440', '--max-controls', '0', '--max-tiles', '1', '--out', a]);
    await run('extract-styles', ['--url', url, '--out', path.join(out, 'compare-styles')]);
    await run('compare', ['--before', path.join(out, 'compare-styles'), '--after', path.join(out, 'compare-styles'), '--out', path.join(out, 'same-styles')]);
    const styles = await json(path.join(out, 'same-styles/comparison.json'));
    assert.ok(styles.styles.entries.length > 0 && styles.styles.entries.every((e) => e.status === 'unchanged'));
    await run('compare', ['--before', a, '--after', a, '--pixels', '--out', path.join(out, 'same')]);
    const same = await json(path.join(out, 'same/comparison.json'));
    assert.ok(same.pixels.length > 0 && same.pixels.every((p) => p.status === 'compared' && p.differentPercent === 0));
    revised = true;
    await run('capture', ['--url', url, '--widths', '375', '--max-controls', '0', '--max-tiles', '1', '--out', b]);
    await run('compare', ['--before', a, '--after', b, '--pixels', '--out', path.join(out, 'diff')]);
    const diff = await json(path.join(out, 'diff/comparison.json'));
    assert.ok(diff.pixels.some((p) => p.differentPercent > 0 && p.diffFile));
    assert.ok(diff.pixels.some((p) => p.status === 'missing'));
    await mkdir(path.join(out, 'mismatch'));
    await writeFile(path.join(out, 'mismatch/pixel.png'), pixel);
    const full = (await json(path.join(a, 'capture-index.json'))).files.find((f) => f.state === 'full' && f.width === 375);
    await writeFile(path.join(out, 'mismatch/capture-index.json'), JSON.stringify({ files: [{ ...full, file: 'pixel.png' }] }));
    await run('compare', ['--before', a, '--after', path.join(out, 'mismatch'), '--pixels', '--out', path.join(out, 'mismatch-result')]);
    const mismatch = await json(path.join(out, 'mismatch-result/comparison.json'));
    assert.ok(mismatch.pixels.some((p) => p.status === 'dimension-mismatch' && p.differentPercent === undefined));
    revised = false;
  });

  test('static image references are disambiguated and machine root paths are omitted', async () => {
    const project = path.join(out, 'static-project');
    for (const folder of ['a', 'b']) { await mkdir(path.join(project, 'assets', folder), { recursive: true }); await writeFile(path.join(project, 'assets', folder, 'hero.png'), pixel); }
    await writeFile(path.join(project, 'index.html'), '<img src="assets/a/hero.png"><img src="hero.png">');
    await run('image-manifest', ['--root', project, '--out', path.join(out, 'static')]);
    const report = await json(path.join(out, 'static/images-static.json'));
    assert.equal(report.root, '[project-root-redacted]');
    assert.equal(report.images.find((i) => i.path === 'assets/a/hero.png').refs.length, 1);
    assert.ok(report.images.every((i) => i.flags.includes('referência-ambígua')));
  });

  test('all generated text artifacts omit synthetic secrets, personal fields, and source query data', async () => {
    let inspected = 0;
    async function scan(dir) {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) await scan(file);
        else if (/\.(json|md|ya?ml|txt)$/.test(entry.name)) {
          inspected++;
          assert.doesNotMatch(await readFile(file, 'utf8'), /fixture-secret|fixture-fragment|fixture-value|customer-name|owner@example\.invalid|synthetic-field-value|synthetic-textarea-value/, path.relative(out, file));
        }
      }
    }
    await scan(out);
    assert.ok(inspected > 0);
  });
});
