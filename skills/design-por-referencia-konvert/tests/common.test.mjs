import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText, redactUrl, resolveRoutes, routeSlug, intList, targetBlockReason, installRequestGuards, resolvedBlockReason } from '../scripts/_common.mjs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

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

test('redactText removes whole authorization/cookie values and standalone JWTs', () => {
  const examples = [
    'Authorization: Bearer synthetic-bearer-value',
    'Proxy-Authorization: Basic c3ludGhldGljOnN5bnRoZXRpYw==',
    'Bearer synthetic-bearer-value',
    'Cookie: sid=synthetic-cookie; account=synthetic-account',
    'Set-Cookie: sid=synthetic-cookie; Expires=Thu, 01 Jan 2037 00:00:00 GMT',
    'eyJhbGciOiJub25lIn0.eyJzdWIiOiJzeW50aGV0aWMifQ.c3ludGhldGlj',
    'password="synthetic secret with spaces"',
  ];
  for (const example of examples) {
    const safe = redactText(example, 1000);
    assert.doesNotMatch(safe, /synthetic|c3ludGhldGlj|eyJ|Expires=/i);
    assert.match(safe, /redacted/);
  }
});

test('redactText hides Windows/WSL paths and Brazilian identifiers/phones', () => {
  for (const value of ['C:\\Projetos\\synthetic shop\\file.txt', 'D:\\dev\\synthetic\\file.txt', '/mnt/c/synthetic/file.txt', '/root/synthetic/file.txt', '/var/synthetic/file.txt', '000.000.000-00', '00.000.000/0000-00', '00000000000', '00000000000000', '+55 (11) 90000-0000', '(11) 4000-0000', '+5511900000000', '90000-0000', '4000-0000']) {
    const safe = redactText(value, 1000);
    assert.notEqual(safe, value);
    assert.doesNotMatch(safe, /synthetic|0000|4000/);
    assert.match(safe, /redacted/);
  }
});

test('WebSocket diagnostics redact URL credentials, paths, and query values', () => {
  const value = redactText('wss://synthetic-user:synthetic-password@example.test/private?token=synthetic-token');
  assert.doesNotMatch(value, /synthetic|private|token=/);
  assert.match(value, /wss:\/\/example.test/);
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
  const root = fileURLToPath(new URL('..', import.meta.url));
  const projectFile = pathToFileURL(path.join(root, 'package.json')).href;
  assert.equal(targetBlockReason(projectFile), 'file URLs require --allow-file');
  assert.equal(targetBlockReason(projectFile, { allowFile: true, root }), null);
  assert.match(targetBlockReason(pathToFileURL(process.execPath).href, { allowFile: true, root }), /outside the project root/);
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
      fetch: async () => ({ status: () => 200, headers: () => ({}), dispose: async () => {} }),
      fulfill: async () => { result = 'continued'; },
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

test('redirect destinations are checked before being sent to the browser', async () => {
  for (const location of ['http://169.254.169.254/', 'http://[64:ff9b::a9fe:a9fe]/', 'https://google-analytics.com/g/collect', 'file:///etc/passwd', 'javascript:alert(1)', 'http://192.0.2.1/', 'http://127.0.0.1/asset']) {
    let handler, aborted = false, fetches = 0, fulfilled = false, fetchOptions;
    const blockedRedirects = new Set();
    await installRequestGuards({ route: async (_pattern, fn) => { handler = fn; }, routeWebSocket: async () => {} }, { blockedRedirects });
    await handler({
      request: () => ({ url: () => 'http://127.0.0.1/resource', method: () => 'GET', isNavigationRequest: () => false }),
      fetch: async (options) => { fetches++; fetchOptions = options; return { status: () => 302, headers: () => ({ location }), dispose: async () => {} }; },
      abort: async () => { aborted = true; }, fulfill: async () => { fulfilled = true; },
    });
    assert.ok(aborted && !fulfilled, location);
    assert.equal(fetches, 1, 'never follow a redirect inside the API request');
    assert.equal(fetchOptions.maxRedirects, 0);
    assert.equal(blockedRedirects.size, 1);
  }
});

test('local-network permission restoration is scoped to loopback main origins only', async () => {
  for (const [raw, main, expected] of [['https://example.test/', true, 0], ['http://localhost:3000/', true, 1], ['http://127.0.0.1:3000/', false, 0]]) {
    let handler, fulfilled = false, aborted = false;
    const grants = [];
    const frame = { page: () => ({ mainFrame: () => main ? frame : {} }) };
    await installRequestGuards({
      route: async (_pattern, fn) => { handler = fn; }, routeWebSocket: async () => {},
      grantPermissions: async (permissions, options) => { grants.push({ permissions, options }); },
    });
    await handler({
      request: () => ({ url: () => raw, method: () => 'GET', isNavigationRequest: () => true, frame: () => frame }),
      fetch: async () => ({ status: () => 200, headers: () => ({}), dispose: async () => {} }),
      fulfill: async () => { fulfilled = true; }, abort: async () => { aborted = true; },
    });
    assert.equal(grants.length, expected);
    assert.ok(fulfilled && !aborted);
    if (expected) assert.deepEqual(grants[0], { permissions: ['local-network-access'], options: { origin: new URL(raw).origin } });
  }
});

test('resolved hostnames inherit the literal-IP policy, and lookup failures stay non-blocking', async () => {
  const lookupFor = (addresses) => async () => addresses.map((address) => ({ address, family: address.includes(':') ? 6 : 4 }));
  assert.match(await resolvedBlockReason('metadata-alias.example.test', { lookup: lookupFor(['169.254.169.254']) }) ?? '', /metadata.*resolved address/);
  assert.match(await resolvedBlockReason('internal.example.test', { lookup: lookupFor(['93.184.216.34', '10.0.0.5']) }) ?? '', /allow-private/);
  assert.equal(await resolvedBlockReason('internal.example.test', { allowPrivate: true, lookup: lookupFor(['10.0.0.5']) }), null);
  assert.match(await resolvedBlockReason('mapped.example.test', { allowPrivate: true, lookup: lookupFor(['::ffff:169.254.169.254']) }) ?? '', /metadata/);
  assert.match(await resolvedBlockReason('mapped.example.test', { lookup: lookupFor(['::ffff:10.0.0.5']) }) ?? '', /allow-private/, 'dotted mapped tails from the resolver are normalized');
  assert.match(await resolvedBlockReason('odd.example.test', { lookup: lookupFor(['not-an-address']) }) ?? '', /unexpected resolver output/);
  assert.match(await resolvedBlockReason('link-local.example.test', { allowPrivate: true, lookup: lookupFor(['fe80::1%eth0']) }) ?? '', /blocked/);
  assert.equal(await resolvedBlockReason('public.example.test', { lookup: lookupFor(['93.184.216.34', '2606:4700:4700::1111']) }), null);
  assert.equal(await resolvedBlockReason('localhost', { lookup: lookupFor(['127.0.0.1', '::1']) }), null);
  assert.equal(await resolvedBlockReason('unresolvable.example.test', { lookup: async () => { throw new Error('ENOTFOUND'); } }), null);
  let calls = 0;
  assert.equal(await resolvedBlockReason('10.0.0.5', { lookup: async () => { calls++; return []; } }), null);
  assert.equal(calls, 0, 'literal addresses are classified without DNS');
});

test('request and WebSocket guards block names that resolve to forbidden addresses, resolving each host once', async () => {
  let calls = 0;
  const lookup = async (host) => { calls++; return [{ address: host.startsWith('internal') ? '192.168.1.10' : '93.184.216.34', family: 4 }]; };
  async function inspect(url, options = {}) {
    let handler, socketHandler, result;
    const blockedTargets = new Set();
    await installRequestGuards({ route: async (_pattern, fn) => { handler = fn; }, routeWebSocket: async (_pattern, fn) => { socketHandler = fn; } }, { ...options, blockedTargets, lookup });
    if (/^wss?:/.test(url)) await socketHandler({ url: () => url, close: async () => { result = 'blocked'; }, connectToServer: () => { result = 'connected'; } });
    else {
      await handler({
        request: () => ({ url: () => url, method: () => 'GET' }),
        fetch: async () => ({ status: () => 200, headers: () => ({}), dispose: async () => {} }),
        fulfill: async () => { result = 'continued'; }, abort: async () => { result = 'blocked'; }, continue: async () => { result = 'continued'; },
      });
      await handler({
        request: () => ({ url: () => `${url}second`, method: () => 'GET' }),
        fetch: async () => ({ status: () => 200, headers: () => ({}), dispose: async () => {} }),
        fulfill: async () => {}, abort: async () => {}, continue: async () => {},
      });
    }
    return { result, blockedTargets: [...blockedTargets] };
  }
  calls = 0;
  assert.deepEqual(await inspect('http://internal.example.test/'), { result: 'blocked', blockedTargets: ['internal.example.test'] });
  assert.equal(calls, 1, 'the same host is resolved once per guarded context');
  assert.equal((await inspect('http://internal.example.test/', { allowPrivate: true })).result, 'continued');
  assert.equal((await inspect('http://public.example.test/')).result, 'continued');
  assert.equal((await inspect('ws://internal.example.test/socket')).result, 'blocked');
  assert.equal((await inspect('wss://public.example.test/socket')).result, 'connected');
});
