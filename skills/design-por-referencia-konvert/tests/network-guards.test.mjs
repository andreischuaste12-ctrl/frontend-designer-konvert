import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInspectionContext, installRequestGuards, launch, loadPlaywright, preparePage } from '../scripts/_common.mjs';

async function fixture(t, responder = () => false) {
  let upgrades = 0;
  let workerRequests = 0;
  const sockets = new Set();
  const requests = [];
  const server = createServer((req, res) => {
    requests.push(req.url);
    if (responder(req, res)) return;
    if (req.url === '/worker.js') {
      workerRequests++;
      res.writeHead(200, { 'content-type': 'text/javascript' });
      res.end("self.addEventListener('install', () => self.skipWaiting());");
    } else { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><title>Synthetic network fixture</title>'); }
  });
  server.on('connection', (socket) => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
  server.on('upgrade', (req, socket) => {
    upgrades++;
    const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
    socket.on('data', (frame) => { if ((frame[0] & 15) === 8) socket.end(Buffer.from([0x88, 0])); });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await launch(loadPlaywright());
  t.after(async () => {
    await browser.close();
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => server.close(resolve));
  });
  return { browser, url: `http://127.0.0.1:${server.address().port}`, upgrades: () => upgrades, workerRequests: () => workerRequests, requests };
}

test('WebSocket connections reach loopback only when write blocking is disabled', { timeout: 20000 }, async (t) => {
  const f = await fixture(t);
  for (const blockWrites of [false, true]) {
    const methods = new Set();
    const ctx = await createInspectionContext(f.browser);
    await installRequestGuards(ctx, { blockWrites, blockedWriteMethods: methods });
    const page = await ctx.newPage(); const diagnostics = [];
    page.on('console', (message) => diagnostics.push(message.text()));
    await page.goto(f.url);
    const before = f.upgrades();
    const result = await page.evaluate((url) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
      const socket = new WebSocket(url.replace('http:', 'ws:') + '/socket');
      const done = (value) => { clearTimeout(timer); resolve(value); };
      socket.onopen = () => { done('opened'); socket.close(); };
      socket.onclose = () => done('closed'); socket.onerror = () => done('error');
    }), f.url);
    assert.equal(f.upgrades() - before, blockWrites ? 0 : 1, JSON.stringify({ result, diagnostics }));
    assert.equal(result === 'opened', !blockWrites);
    assert.equal(methods.has('WEBSOCKET'), blockWrites);
    await ctx.close();
  }
});

test('redirects cannot contact a forbidden destination from navigation, img, or fetch', { timeout: 20000 }, async (t) => {
  const f = await fixture(t, (req, res) => {
    if (req.url.startsWith('/redirect-')) {
      res.writeHead(302, { location: `http://${req.headers.host.replace('127.0.0.1', '0.0.0.0')}/secret` }); res.end(); return true;
    }
    if (req.url === '/resources') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(`<img src="/redirect-img" onerror="window.imageBlocked=true"><script>fetch('/redirect-fetch').then(()=>window.fetchResult='received').catch(()=>window.fetchResult='blocked')</script>`); return true;
    }
    return false;
  });
  for (const resource of ['navigation', 'subresources']) {
    const ctx = await createInspectionContext(f.browser);
    const blockedTargets = new Set(); await installRequestGuards(ctx, { blockedTargets });
    const page = await ctx.newPage(); const forbiddenRequests = [];
    page.on('request', (request) => { if (new URL(request.url()).hostname === '0.0.0.0') forbiddenRequests.push(request.url()); });
    if (resource === 'navigation') await assert.rejects(preparePage(page, `${f.url}/redirect-main`, 5000));
    else { await page.goto(`${f.url}/resources`); await page.waitForFunction(() => window.imageBlocked && window.fetchResult === 'blocked'); }
    assert.ok(blockedTargets.has('0.0.0.0'));
    assert.equal(forbiddenRequests.length, 0, 'the browser must never receive the forbidden Location');
    assert.equal(f.requests.includes('/secret'), false);
    await ctx.close();
  }
});

test('approved main redirects retain the final URL and relative asset base; loops are bounded', { timeout: 20000 }, async (t) => {
  const f = await fixture(t, (req, res) => {
    const redirects = { '/start': '/middle', '/middle': '/folder/final', '/loop': '/loop', '/redirect-img': '/folder/pixel.svg' };
    if (redirects[req.url]) { res.writeHead(302, { location: redirects[req.url] }); res.end(); return true; }
    if (req.url === '/folder/final') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<img src="pixel.svg"><title>Final</title>'); return true; }
    if (req.url === '/folder/pixel.svg') { res.writeHead(200, { 'content-type': 'image/svg+xml' }); res.end('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'); return true; }
    return false;
  });
  const ctx = await createInspectionContext(f.browser); await installRequestGuards(ctx);
  const page = await ctx.newPage(); await preparePage(page, `${f.url}/start`, 5000);
  assert.equal(page.url(), `${f.url}/folder/final`);
  assert.ok(f.requests.includes('/folder/pixel.svg'));
  await assert.rejects(preparePage(page, `${f.url}/loop`, 5000), /redirect limit|timeout/i);
  assert.ok(f.requests.filter((url) => url === '/loop').length <= 21);
  await ctx.close();
});

test('inspection contexts block service-worker registration, with a working control', { timeout: 20000 }, async (t) => {
  const f = await fixture(t);
  for (const blocked of [false, true]) {
    const ctx = blocked ? await createInspectionContext(f.browser) : await f.browser.newContext({ serviceWorkers: 'allow' });
    const page = await ctx.newPage(); await page.goto(f.url);
    const before = f.workerRequests();
    const registered = await page.evaluate(async () => {
      try { return Boolean(await navigator.serviceWorker.register('/worker.js')); } catch { return false; }
    });
    assert.equal(registered, !blocked);
    assert.equal(f.workerRequests() - before, blocked ? 0 : 1);
    if (blocked) assert.equal(ctx.serviceWorkers().length, 0);
    await ctx.close();
  }
});

test('capture disables animations natively when CSP rejects injected CSS', { timeout: 20000 }, async (t) => {
  const f = await fixture(t, (_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': "default-src 'none'; style-src 'nonce-synthetic'" });
    res.end(`<style nonce="synthetic">body{margin:0;background:white}@keyframes move{to{transform:translateX(1000px)}}#moving{width:10px;height:10px;background:red;animation:move 1000s linear -500s infinite}</style><div id="moving"></div>`);
    return true;
  });
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'konvert-csp-'));
  t.after(() => fs.rm(out, { recursive: true, force: true }));
  const script = fileURLToPath(new URL('../scripts/capture.mjs', import.meta.url));
  await promisify(execFile)(process.execPath, [script, '--url', f.url, '--widths', '375', '--max-controls', '0', '--max-tiles', '1', '--out', out]);
  const png = await fs.readFile(path.join(out, 'route-01__375__full.png'));
  const page = await f.browser.newPage();
  const pixel = await page.evaluate(async (data) => {
    const image = new Image(); image.src = data; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
    return [...ctx.getImageData(1, 1, 1, 1).data];
  }, `data:image/png;base64,${png.toString('base64')}`);
  assert.deepEqual(pixel, [255, 0, 0, 255], 'infinite animation must be cancelled to its initial position for capture');
});
