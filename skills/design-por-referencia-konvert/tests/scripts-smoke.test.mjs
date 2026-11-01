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

describe('browser CLI regression scenarios', { concurrency: false, timeout: 180000 }, () => {
  let server, url, out, revised = false, posts = 0;
  before(async () => {
    server = createServer((req, res) => {
      if (req.method === 'POST') { posts++; req.resume(); res.writeHead(204); res.end(); return; }
      if (req.url.startsWith('/missing.png')) { res.writeHead(404); res.end(); return; }
      if (req.url.startsWith('/pixel.png')) { res.writeHead(200, { 'content-type': 'image/png', 'content-length': pixel.length }); res.end(pixel); return; }
      if (req.url.startsWith('/broken')) { req.socket.destroy(); return; }
      if (req.url.startsWith('/opacity')) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(`<html><body style="background:#fff"><section style="opacity:${req.url.includes('after') ? 1 : 0.4}"><p id="opacity-sample" style="color:#aaa">Stable sample</p></section></body></html>`); return;
      }
      if (req.url.startsWith('/rich-fields')) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<html><body style="margin:0;background:#fff"><div contenteditable="true" style="position:absolute;left:20px;top:20px;width:200px;height:40px">SYNTHETIC_RICH_VALUE</div><div role="textbox" tabindex="0" style="position:absolute;left:20px;top:100px;width:200px;height:40px">SYNTHETIC_CUSTOM_VALUE</div><input value="SYNTHETIC_NATIVE_VALUE" style="position:absolute;left:20px;top:180px;width:200px;height:40px"></body></html>'); return;
      }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>owner@example.invalid</title><style>:root{--surface:#fff}.dark{--surface:#111}[data-theme="dark"]{--surface:#000}body{font:16px Arial;color:#111;background:${revised ? '#ddd' : '#fff'}}#overflow{width:700px;height:8px}.low-contrast{color:#999;background:#eee}#tiny{width:20px;height:20px;min-height:0;padding:0}#faded{opacity:.5}button{min-height:44px}input{height:24px}</style><h1>Local fixture</h1><nav class="primary-nav"><a href="/one" style="font-size:15px">Nav one</a></nav><footer class="site-footer"><a href="/two" style="font-size:12px">Footer two</a></footer><button id="icon-only" aria-label="Cart" style="background:#abc;font-size:37px;color:#010203"><svg width="20" height="20"></svg></button><button id="unnamed-icon" style="font-size:39px"><svg width="20" height="20"></svg></button><section style="color:#aaa;background:#fff;font:15px Arial"><p id="gradient-sample" style="background-image:linear-gradient(#fff,#fff)">Gradient sample</p><p id="solid-sample">Solid sample</p></section><section style="color:#aaa;background:#fff;font:17px Arial"><p style="opacity:.5">Faded sample</p><p id="opaque-sample">Opaque sample</p></section><div id="overflow"></div><p class="low-contrast">Low contrast fixture</p><button id="tiny">X</button><img src="/missing.png"><p id="faded">contact owner@example.invalid</p><label for="private-field">Private field</label><input id="private-field" type="text" value="synthetic-field-value"><textarea>synthetic-textarea-value</textarea><button>Continue owner@example.invalid</button><img alt="Sample pixel" src="/pixel.png?signature=fixture-value"><img alt="" src="https://www.google-analytics.com/g/collect?value=synthetic"><script>fetch('/track', {method:'POST', body:'synthetic-event'}).catch(() => {});</script></html>`);
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
    assert.ok(styles.elements.some((e) => e.selector.includes('icon-only') && e.category === 'button' && e.text === 'Cart' && e.contrastStatus === 'indeterminado'));
    assert.ok(styles.elements.some((e) => e.selector.includes('gradient-sample') && e.contrastStatus === 'indeterminado'));
    assert.ok(styles.elements.some((e) => e.selector.includes('solid-sample') && e.contrastStatus === 'falha'));
    assert.ok(styles.elements.some((e) => e.selector.includes('opaque-sample') && e.contrastStatus === 'falha'));
    assert.ok(styles.elements.some((e) => e.selector.includes('unnamed-icon') && e.text === ''));
    assert.ok(!styles.summaries.typeScale.some((e) => /37px|39px/.test(e.value)));
    assert.ok(!styles.summaries.textColors.some((e) => e.value.toLowerCase() === '#010203'));
    assert.equal(styles.meta.axeRequested, false);
    assert.ok(!(await readdir(path.join(out, 'styles'))).includes('a11y-findings.json'));
  });

  test('optional automated accessibility summary omits page text and HTML', async () => {
    await run('extract-styles', ['--url', url, '--width', '375', '--axe', '--out', path.join(out, 'axe')]);
    const report = await json(path.join(out, 'axe/a11y-findings.json'));
    assert.ok(report.violations.some((v) => v.id === 'image-alt' && v.nodeCount > 0));
    assert.doesNotMatch(JSON.stringify(report), /owner@example|synthetic-field|<img|#private-field/);
    assert.ok(report.violations.every((v) => Object.keys(v).sort().join(',') === 'id,impact,nodeCount'));
    assert.equal((await json(path.join(out, 'axe/computed-styles.json'))).meta.axeRequested, true);
  });

  test('optional axe selectors go only to a private ignored file', async () => {
    const repo = path.join(out, 'axe-repo'), privateDir = path.join(repo, '.audit', 'private'), report = path.join(repo, '.audit', 'axe');
    await mkdir(privateDir, { recursive: true });
    await execFileAsync('git', ['init', '-q', repo]);
    await writeFile(path.join(repo, '.gitignore'), '.audit/\n');
    const details = path.join(privateDir, 'axe-details.json');
    await run('extract-styles', ['--url', url, '--width', '375', '--axe', '--axe-details', details, '--out', report]);
    const privateReport = await json(details);
    const imageAlt = privateReport.violations.find((v) => v.id === 'image-alt');
    assert.ok(imageAlt && imageAlt.targets.length > 0 && imageAlt.targets.every((t) => Array.isArray(t) && t.every((s) => typeof s === 'string')));
    assert.doesNotMatch(JSON.stringify(privateReport), /<img|synthetic-field-value|owner@example/);
    const shared = await json(path.join(report, 'a11y-findings.json'));
    assert.ok(shared.violations.every((v) => Object.keys(v).sort().join(',') === 'id,impact,nodeCount'));
    assert.equal((await json(path.join(report, 'computed-styles.json'))).meta.axeDetailsRequested, true);
    await assert.rejects(run('extract-styles', ['--url', url, '--axe', '--axe-details', path.join(repo, 'tracked.json'), '--out', path.join(report, 'again')]), (error) => error.code === 1 && !error.stderr.includes('tracked.json'));
    await assert.rejects(run('extract-styles', ['--url', url, '--axe-details', path.join(privateDir, 'no-axe.json'), '--out', path.join(report, 'no-axe')]), (error) => error.code === 1 && /exige --axe/.test(error.stderr));
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
    await assert.rejects(run('compare', ['--before', a, '--after', a, '--pixels', '--out', path.join(out, 'no-mapping')]), (error) => error.code === 1 && /confirm-page-mapping/.test(error.stderr));
    await run('compare', ['--before', path.join(out, 'compare-styles'), '--after', path.join(out, 'compare-styles'), '--out', path.join(out, 'same-styles')]);
    const styles = await json(path.join(out, 'same-styles/comparison.json'));
    assert.ok(styles.styles.entries.length > 0 && styles.styles.entries.every((e) => e.status === 'unchanged'));
    assert.equal(styles.styles.pageMapping, 'unverified');
    await run('compare', ['--confirm-page-mapping', '--before', a, '--after', a, '--pixels', '--out', path.join(out, 'same')]);
    const same = await json(path.join(out, 'same/comparison.json'));
    assert.ok(same.pixels.length > 0 && same.pixels.every((p) => p.status === 'compared' && p.differentPercent === 0));
    revised = true;
    await run('capture', ['--url', url, '--widths', '375', '--max-controls', '0', '--max-tiles', '1', '--out', b]);
    await run('compare', ['--confirm-page-mapping', '--before', a, '--after', b, '--pixels', '--out', path.join(out, 'diff')]);
    const diff = await json(path.join(out, 'diff/comparison.json'));
    assert.ok(diff.pixels.some((p) => p.differentPercent > 0 && p.diffFile));
    assert.ok(diff.pixels.some((p) => p.status === 'missing'));
    await mkdir(path.join(out, 'mismatch'));
    await writeFile(path.join(out, 'mismatch/pixel.png'), pixel);
    const full = (await json(path.join(a, 'capture-index.json'))).files.find((f) => f.state === 'full' && f.width === 375);
    await writeFile(path.join(out, 'mismatch/capture-index.json'), JSON.stringify({ files: [{ ...full, file: 'pixel.png' }] }));
    await run('compare', ['--confirm-page-mapping', '--before', a, '--after', path.join(out, 'mismatch'), '--pixels', '--out', path.join(out, 'mismatch-result')]);
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
    assert.equal(report.images.filter((i) => i.refs.length === 1).length, 1);
    assert.ok(report.images.every((i) => /^image-\d{4}\.png$/.test(i.path)));
    assert.doesNotMatch(JSON.stringify(report), /assets\/|hero\.png/);
    assert.ok(report.images.every((i) => i.flags.includes('referência-ambígua')));
  });

  test('masked captures cover rich and custom textboxes in full images and control crops', async () => {
    const destination = path.join(out, 'rich-fields');
    await run('capture', ['--url', new URL('/rich-fields', url).href, '--widths', '375', '--control-widths', '375', '--max-controls', '3', '--max-tiles', '1', '--out', destination]);
    const index = await json(path.join(destination, 'capture-index.json'));
    assert.equal(index.captureStatus, 'complete');
    assert.equal(index.pages[0].controls.length, 3);
    assert.doesNotMatch(JSON.stringify(index), /SYNTHETIC_(RICH|CUSTOM|NATIVE)_VALUE/);
    const { chromium } = await import('playwright');
    const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {});
    try {
      const page = await browser.newPage();
      await page.route('**/*', (route) => route.abort());
      for (const file of index.files.filter((f) => f.state === 'full' || f.state.endsWith('-focus') || f.state.endsWith('-hover'))) {
        const encoded = (await readFile(path.join(destination, file.file))).toString('base64');
        const result = await page.evaluate(async ({ encoded, full }) => {
          const img = new Image(); img.src = `data:image/png;base64,${encoded}`; await img.decode();
          const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
          const pink = (x, y) => { const p = ctx.getImageData(x, y, 1, 1).data; return p[0] === 255 && p[1] === 0 && p[2] === 255; };
          if (full) return [30, 110, 190].every((y) => pink(30, y));
          const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
          let masked = 0;
          for (let i = 0; i < pixels.length; i += 4) if (pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255) masked++;
          return masked >= 200 * 40;
        }, { encoded, full: file.state === 'full' });
        assert.equal(result, true, file.state);
      }
    } finally { await browser.close(); }
  });

  test('capture writes a diagnostic index but fails the CLI for failed or partial collection', async () => {
    for (const [name, routes, status] of [['failed', '/broken', 'failed'], ['partial', '/,/broken', 'partial']]) {
      const destination = path.join(out, name);
      await assert.rejects(run('capture', ['--url', new URL('/', url).href, '--routes', routes, '--widths', '375', '--max-controls', '0', '--max-tiles', '1', '--timeout', '3000', '--out', destination]), (e) => e.code === 3);
      const index = await json(path.join(destination, 'capture-index.json'));
      assert.equal(index.captureStatus, status);
      assert.ok(index.pages.some((p) => p.error));
      assert.equal(index.files.length === 0, status === 'failed');
    }
  });

  test('a real ancestor-opacity change changes the style comparison and contrast certainty', async () => {
    for (const state of ['before', 'after']) await run('extract-styles', ['--url', new URL(`/opacity?${state}`, url).href, '--width', '375', '--out', path.join(out, `opacity-${state}`)]);
    const before = await json(path.join(out, 'opacity-before/computed-styles.json'));
    const after = await json(path.join(out, 'opacity-after/computed-styles.json'));
    assert.equal(before.elements[0].ancestorOpacityProduct, 0.4);
    assert.equal(after.elements[0].ancestorOpacityProduct, 1);
    assert.equal(before.elements[0].contrastStatus, 'indeterminado');
    assert.equal(after.elements[0].contrastStatus, 'falha');
    await run('compare', ['--before', path.join(out, 'opacity-before'), '--after', path.join(out, 'opacity-after'), '--out', path.join(out, 'opacity-comparison')]);
    const comparison = await json(path.join(out, 'opacity-comparison/comparison.json'));
    const sample = comparison.styles.entries.find((e) => e.element.includes('opacity-sample'));
    assert.equal(sample.status, 'changed');
    assert.ok(sample.changes.some((c) => c.field === 'ancestorOpacityProduct'));
    assert.ok(sample.changes.some((c) => c.field === 'contrastStatus'));
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
