import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText, redactUrl, resolveRoutes, routeSlug, intList, targetBlockReason, installRequestGuards } from '../scripts/_common.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

test('redactUrl removes credentials, query strings, and fragments', () => {
  assert.equal(
    redactUrl('https://person:password@example.test/account?access_token=sample#private'),
    'https://example.test/[path-redacted]',
  );
  assert.equal(redactUrl('https://example.test/'), 'https://example.test/');
});

test('redactUrl hides local file paths and data URI contents', () => {
  assert.equal(redactUrl('file:///home/private/customer.html'), 'file://[local-path-redacted]');
  assert.equal(redactUrl('data:image/png;base64,private'), 'data:[content-redacted]');
});

test('redactText removes email addresses, secrets, and query values', () => {
  const safe = redactText('owner@example.invalid token=sample name=customer-name https://example.test/a?email=owner%40example.invalid /home/example-user/private.log');
  assert.doesNotMatch(safe, /owner@example\.invalid|sample|customer-name|email=|\/home\/example-user/i);
  assert.match(safe, /\[email redacted\]/);
});

test('route helpers normalize paths and filter invalid widths', () => {
  assert.equal(routeSlug(new URL('https://example.test/products/new-item')), 'products-new-item');
  assert.equal(routeSlug(new URL('file:///tmp/private-project/index.html')), 'home');
  assert.equal(routeSlug(new URL('file:///tmp/private-project/about-us.html')), 'about-us');
  assert.deepEqual(intList('320, 375, nope, 5000', { min: 200, max: 4000 }), [320, 375]);
  assert.deepEqual(resolveRoutes(new URL('https://example.test/shop/'), '/,item').map((u) => u.pathname), ['/','/shop/item']);
});

test('URL policy blocks cloud metadata and private networks unless explicitly allowed', () => {
  assert.match(targetBlockReason('http://169.254.169.254/latest/meta-data'), /blocked/);
  assert.match(targetBlockReason('http://metadata.google.internal/'), /metadata/);
  assert.match(targetBlockReason('http://192.168.1.20/'), /allow-private/);
  assert.equal(targetBlockReason('http://192.168.1.20/', { allowPrivate: true }), null);
  assert.equal(targetBlockReason('http://localhost:3000/'), null);
  assert.equal(targetBlockReason('http://127.0.0.2:3000/'), null);
  assert.equal(targetBlockReason('http://[::ffff:127.0.0.1]:3000/'), null);
});

test('file URLs require opt-in and must resolve inside the working project', () => {
  const projectFile = pathToFileURL(path.join(process.cwd(), 'package.json')).href;
  assert.equal(targetBlockReason(projectFile), 'file URLs require --allow-file');
  assert.equal(targetBlockReason(projectFile, { allowFile: true }), null);
  assert.match(targetBlockReason(pathToFileURL(process.execPath).href, { allowFile: true }), /outside the project root/);
});

test('mapped IPv6 cannot bypass private, metadata, or unspecified-address rules', () => {
  for (const address of ['::ffff:a9fe:a9fe', '::ffff:169.254.169.254', '0:0:0:0:0:ffff:a9fe:a9fe', '::ffff:6464:64c8']) {
    for (const allowPrivate of [false, true]) {
      assert.match(targetBlockReason(`http://[${address}]/`, { allowPrivate }) ?? '', /blocked/, address);
    }
  }
  for (const address of ['::ffff:a00:5', '::ffff:10.0.0.5', '::ffff:c0a8:101', '::ffff:ac10:1', '::ffff:6440:1']) {
    assert.match(targetBlockReason(`http://[${address}]/`) ?? '', /allow-private/, address);
    assert.equal(targetBlockReason(`http://[${address}]/`, { allowPrivate: true }), null, address);
  }
  for (const address of ['::', '0:0:0:0:0:0:0:0', '::ffff:0:0']) {
    for (const allowPrivate of [false, true]) assert.match(targetBlockReason(`http://[${address}]/`, { allowPrivate }) ?? '', /blocked/, address);
  }
});

test('normalization preserves loopback and public targets and blocks metadata DNS aliases', () => {
  for (const address of ['::1', '::ffff:7f00:1', '::ffff:127.0.0.2', '::ffff:808:808', '2606:4700:4700::1111']) {
    assert.equal(targetBlockReason(`http://[${address}]/`), null, address);
  }
  assert.match(targetBlockReason('http://metadata.google.internal./') ?? '', /metadata/);
  assert.match(targetBlockReason('http://0.0.0.0/', { allowPrivate: true }) ?? '', /blocked/);
});

test('request guards enforce mapped-target and optional method policies before continuing', async () => {
  async function inspect(url, method, options = {}) {
    let handler, result;
    const blockedWriteMethods = new Set();
    await installRequestGuards({ route: async (_pattern, fn) => { handler = fn; }, routeWebSocket: async () => {} }, { ...options, blockedWriteMethods });
    await handler({
      request: () => ({ url: () => url, method: () => method }),
      abort: async () => { result = 'blocked'; }, continue: async () => { result = 'continued'; },
    });
    return { result, methods: [...blockedWriteMethods] };
  }
  assert.equal((await inspect('http://[::ffff:a9fe:a9fe]/', 'GET', { allowPrivate: true })).result, 'blocked');
  assert.equal((await inspect('https://www.google-analytics.com./g/collect', 'GET')).result, 'blocked');
  assert.equal((await inspect('http://localhost:3000/graphql', 'POST')).result, 'continued');
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.deepEqual(await inspect('http://localhost:3000/track', method, { blockWrites: true }), { result: 'blocked', methods: [method] });
  }
  for (const method of ['GET', 'HEAD']) assert.equal((await inspect('http://localhost:3000/', method, { blockWrites: true })).result, 'continued');
});

test('transition forms inherit the embedded IPv4 classification', () => {
  for (const address of ['169.254.169.254', '100.100.100.200', '10.0.0.5', '172.16.0.1', '192.168.1.1', '100.64.0.1', '192.0.0.1', '198.18.0.1', '224.0.0.1', '255.255.255.255', '8.8.8.8']) {
    const octets = address.split('.').map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16), low = ((octets[2] << 8) | octets[3]).toString(16);
    const forms = [`::${high}:${low}`, `::ffff:${high}:${low}`, `::ffff:0:${high}:${low}`, `64:ff9b::${high}:${low}`, `2002:${high}:${low}::1`];
    for (const allowPrivate of [false, true]) {
      const expected = targetBlockReason(`http://${address}/`, { allowPrivate });
      for (const host of forms) assert.equal(targetBlockReason(`http://[${host}]/`, { allowPrivate }), expected, `${host}, allowPrivate=${allowPrivate}`);
    }
  }
});

test('non-public ranges and ambiguous translation prefixes are explicitly classified', () => {
  for (const host of ['[fec0::1]', '[fc00::1]', '[2001:2::1]', '192.0.0.1', '198.18.0.1', '198.19.255.255']) {
    assert.match(targetBlockReason(`http://${host}/`) ?? '', /allow-private/, host);
    assert.equal(targetBlockReason(`http://${host}/`, { allowPrivate: true }), null, host);
  }
  for (const host of ['[fd00:ec2::254]', '[fe80::1]', '[ff02::1]', '[2001::1]', '[2001:20::1]', '[3fff::1]', '[4000::1]', '[5f00::1]', '[64:ff9b:1::a9fe:a9fe]', '[64:ff9b:1::808:808]', '224.0.0.1', '240.0.0.1', '255.255.255.255', '192.0.2.1']) {
    for (const allowPrivate of [false, true]) assert.match(targetBlockReason(`http://${host}/`, { allowPrivate }) ?? '', /blocked/, host);
  }
  for (const host of ['[2606:4700:4700::1111]', '[64:ff9b::808:808]', '[::ffff:808:808]', '8.8.8.8', '127.0.0.1', '[::1]']) {
    assert.equal(targetBlockReason(`http://${host}/`), null, host);
  }
});

test('WebSocket guards apply target and tracker policy before connecting', async () => {
  async function inspect(url, options = {}) {
    let handler, result;
    const blockedTargets = new Set(), trackingBlocked = new Set(), blockedWriteMethods = new Set();
    await installRequestGuards({ route: async () => {}, routeWebSocket: async (_pattern, fn) => { handler = fn; } }, { ...options, blockedTargets, trackingBlocked, blockedWriteMethods });
    await handler({ url: () => url, close: async () => { result = 'blocked'; }, connectToServer: () => { result = 'connected'; } });
    return { result, blockedTargets, trackingBlocked, blockedWriteMethods };
  }
  for (const protocol of ['ws', 'wss']) {
    const metadata = await inspect(`${protocol}://[64:ff9b::a9fe:a9fe]/`, { allowPrivate: true });
    assert.equal(metadata.result, 'blocked'); assert.equal(metadata.blockedTargets.size, 1);
    assert.equal((await inspect(`${protocol}://192.168.1.1/`)).result, 'blocked');
    assert.equal((await inspect(`${protocol}://192.168.1.1/`, { allowPrivate: true })).result, 'connected');
    const tracker = await inspect(`${protocol}://www.google-analytics.com./socket`);
    assert.equal(tracker.result, 'blocked'); assert.equal(tracker.trackingBlocked.size, 1);
    assert.equal((await inspect(`${protocol}://www.google-analytics.com/socket`, { allowTracking: true })).result, 'connected');
  }
  const writes = await inspect('ws://localhost:3000/socket', { blockWrites: true });
  assert.equal(writes.result, 'blocked'); assert.ok(writes.blockedWriteMethods.has('WEBSOCKET'));
});
