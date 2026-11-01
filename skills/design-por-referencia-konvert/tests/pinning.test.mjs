import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { resolvePinnedAddress, resolvePinnedAddresses, startPinningProxy, PinningBlocked } from '../scripts/_pinning.mjs';
import { targetBlockReason } from '../scripts/_common.mjs';

const targetCheck = (raw) => targetBlockReason(raw);
const answers = (...list) => async () => list.map((address) => ({ address, family: net.isIP(address) }));

test('resolution returns the single validated address or blocks the name', async () => {
  assert.equal(await resolvePinnedAddress('93.184.216.34', { targetCheck }), '93.184.216.34');
  await assert.rejects(resolvePinnedAddress('10.0.0.5', { targetCheck }), PinningBlocked);
  assert.equal(await resolvePinnedAddress('10.0.0.5', { allowPrivate: true, targetCheck: (raw) => targetBlockReason(raw, { allowPrivate: true }) }), '10.0.0.5');
  await assert.rejects(resolvePinnedAddress('metadata.google.internal', { targetCheck, lookup: answers('93.184.216.34') }), PinningBlocked);
  assert.equal(await resolvePinnedAddress('public.example.invalid', { targetCheck, lookup: answers('93.184.216.34', '2606:2800:220:1:248:1893:25c8:1946') }), '93.184.216.34');
  await assert.rejects(resolvePinnedAddress('mixed.example.invalid', { targetCheck, lookup: answers('93.184.216.34', '169.254.169.254') }), /resolved address/);
  await assert.rejects(resolvePinnedAddress('mapped.example.invalid', { targetCheck, lookup: answers('::ffff:10.0.0.5') }), PinningBlocked);
  await assert.rejects(resolvePinnedAddress('missing.example.invalid', { targetCheck, lookup: async () => { throw new Error('ENOTFOUND'); } }), /DNS resolution failed/);
  await assert.rejects(resolvePinnedAddress('slow.example.invalid', { targetCheck, timeout: 10, lookup: () => new Promise(() => {}) }), /DNS resolution failed/);
  assert.equal(await resolvePinnedAddress('missing.example.invalid', { targetCheck, allowUnresolvedDns: true, lookup: async () => { throw new Error('ENOTFOUND'); } }), 'missing.example.invalid');
});

async function echoServer(t) {
  const server = net.createServer((socket) => socket.on('data', (data) => socket.end(`echo:${data}`)));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return server.address().port;
}

function connectThrough(proxyUrl, target) {
  const proxy = new URL(proxyUrl);
  return new Promise((resolve, reject) => {
    const req = http.request({ host: proxy.hostname, port: proxy.port, method: 'CONNECT', path: target });
    req.on('connect', (res, socket) => {
      if (res.statusCode !== 200) { socket.destroy(); resolve({ status: res.statusCode }); return; }
      let body = '';
      socket.on('data', (chunk) => { body += chunk; });
      socket.on('end', () => resolve({ status: 200, body }));
      socket.write('ping');
    });
    req.on('error', reject);
    req.end();
  });
}

test('the proxy connects to the address it validated, and a rebinding answer is refused', async (t) => {
  const port = await echoServer(t);
  let calls = 0;
  const blocked = [];
  // First answer is loopback (allowed for local development); the next one rebinds to metadata.
  const lookup = async (host) => {
    if (host !== 'rebind.example.invalid') throw new Error('ENOTFOUND');
    calls++;
    return [{ address: calls === 1 ? '127.0.0.1' : '169.254.169.254', family: 4 }];
  };
  const proxy = await startPinningProxy({ lookup, targetCheck, onBlocked: (host, reason) => blocked.push([host, reason]) });
  t.after(() => proxy.close());
  // The name only exists in the injected resolver, so a successful tunnel proves the socket
  // went to the validated 127.0.0.1 and was not resolved again elsewhere.
  assert.deepEqual(await connectThrough(proxy.server, `rebind.example.invalid:${port}`), { status: 200, body: 'echo:ping' });
  assert.deepEqual(await connectThrough(proxy.server, `rebind.example.invalid:${port}`), { status: 403 });
  assert.equal(calls, 2);
  assert.equal(blocked.length, 1);
  assert.equal(blocked[0][0], 'rebind.example.invalid');
  assert.match(blocked[0][1], /resolved address/);
  assert.deepEqual(await connectThrough(proxy.server, `unknown.example.invalid:${port}`), { status: 403 });
  assert.deepEqual(await connectThrough(proxy.server, 'not-a-target'), { status: 400 });
});

test('absolute-form HTTP is forwarded to the validated address and refused otherwise', async (t) => {
  const origin = http.createServer((req, res) => res.end(`origin:${req.headers.host}:${req.url}`));
  await new Promise((resolve) => origin.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => origin.close(resolve)));
  const lookup = async (host) => {
    if (host === 'plain.example.invalid') return [{ address: '127.0.0.2', family: 4 }, { address: '127.0.0.1', family: 4 }];
    if (host === 'private.example.invalid') return [{ address: '10.0.0.5', family: 4 }];
    throw new Error('ENOTFOUND');
  };
  const proxy = await startPinningProxy({ lookup, targetCheck });
  t.after(() => proxy.close());
  const proxyUrl = new URL(proxy.server);
  const get = (target) => new Promise((resolve, reject) => {
    const req = http.request({ host: proxyUrl.hostname, port: proxyUrl.port, path: target, headers: { host: new URL(target).host } }, (res) => {
      let body = ''; res.on('data', (c) => { body += c; }); res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject); req.end();
  });
  const port = origin.address().port;
  assert.deepEqual(await get(`http://plain.example.invalid:${port}/path?x=1`), { status: 200, body: `origin:plain.example.invalid:${port}:/path?x=1` });
  await assert.rejects(get(`http://private.example.invalid:${port}/`), /socket hang up|ECONNRESET/, 'a refused request gets no HTTP response that could pass for the origin');
});


test('all fallback addresses come from one fully validated answer set', async () => {
  assert.deepEqual(await resolvePinnedAddresses('dual.example.invalid', { lookup: answers('127.0.0.2', '127.0.0.1', '127.0.0.1'), targetCheck }), ['127.0.0.2', '127.0.0.1']);
  await assert.rejects(resolvePinnedAddresses('mixed.example.invalid', { lookup: answers('127.0.0.1', '169.254.169.254'), targetCheck }), PinningBlocked);
});

test('CONNECT falls back after a refused TCP connection without another DNS lookup', async (t) => {
  const port = await echoServer(t);
  let calls = 0;
  const proxy = await startPinningProxy({ targetCheck, lookup: async () => { calls++; return [{ address: '127.0.0.2' }, { address: '127.0.0.1' }]; } });
  t.after(() => proxy.close());
  assert.deepEqual(await connectThrough(proxy.server, `dual.example.invalid:${port}`), { status: 200, body: 'echo:ping' });
  assert.equal(calls, 1);
});
