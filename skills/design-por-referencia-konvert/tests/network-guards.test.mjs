import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { createInspectionContext, installRequestGuards, launch, loadPlaywright } from '../scripts/_common.mjs';

async function fixture(t) {
  let upgrades = 0;
  let workerRequests = 0;
  const sockets = new Set();
  const server = createServer((req, res) => {
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
  return { browser, url: `http://127.0.0.1:${server.address().port}`, upgrades: () => upgrades, workerRequests: () => workerRequests };
}

test('WebSocket connections reach loopback only when write blocking is disabled', { timeout: 20000 }, async (t) => {
  const f = await fixture(t);
  for (const blockWrites of [false, true]) {
    const methods = new Set();
    const ctx = await createInspectionContext(f.browser);
    await installRequestGuards(ctx, { blockWrites, blockedWriteMethods: methods });
    const page = await ctx.newPage(); await page.goto(f.url);
    const before = f.upgrades();
    const result = await page.evaluate((url) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket timeout')), 5000);
      const socket = new WebSocket(url.replace('http:', 'ws:') + '/socket');
      const done = (value) => { clearTimeout(timer); resolve(value); };
      socket.onopen = () => { done('opened'); socket.close(); };
      socket.onclose = () => done('closed'); socket.onerror = () => done('error');
    }), f.url);
    assert.equal(f.upgrades() - before, blockWrites ? 0 : 1);
    assert.equal(result === 'opened', !blockWrites);
    assert.equal(methods.has('WEBSOCKET'), blockWrites);
    await ctx.close();
  }
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
