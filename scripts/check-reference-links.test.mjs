import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizedUrl, collectUrls, publicIPv4, checkReference, exitCodeFor } from './check-reference-links.mjs';
test('normalizes public HTTPS links and refuses credentials, loopback and nonstandard ports', () => {
  assert.equal(normalizedUrl('https://example.invalid/path?token=x#frag'), 'https://example.invalid/path');
  for (const input of ['http://example.invalid/', 'https://u:p@example.invalid/', 'https://localhost/', 'https://127.0.0.1/', 'https://example.invalid:8443/']) assert.equal(normalizedUrl(input), null);
  assert.deepEqual(collectUrls('[a](https://example.invalid/a?utm=x) [b](https://example.invalid/a)'), ['https://example.invalid/a']);
});
test('refuses internal and mixed DNS answers before a request', async () => {
  assert.equal(publicIPv4([{ address: '127.0.0.1' }]), null);
  assert.equal(publicIPv4([{ address: '8.8.8.8' }, { address: '10.0.0.1' }]), null);
  assert.equal(publicIPv4([{ address: '2606:4700:4700::1111' }]), null);
  let calls = 0;
  const result = await checkReference('https://example.invalid/', { lookup: async () => [{ address: '10.0.0.1' }], request: async () => { calls++; } });
  assert.equal(result.status, 'inconclusive'); assert.equal(calls, 0);
});
test('classifies HTTP outcomes and rechecks redirects before following them', async () => {
  const lookup = async (host) => [{ address: host === 'private.invalid' ? '10.0.0.1' : '8.8.8.8' }];
  let calls = 0;
  const request = async () => { calls++; return { status: 302, location: 'https://private.invalid/' }; };
  assert.equal((await checkReference('https://example.invalid/', { lookup, request })).status, 'inconclusive');
  assert.equal(calls, 1);
  for (const [code, expected] of [[200,'available'],[404,'unavailable'],[403,'restricted'],[500,'inconclusive']]) assert.equal((await checkReference('https://example.invalid/', { lookup, request: async () => ({ status: code }) })).status, expected);
});
test('retries with GET when HEAD is refused and fails only for definitive 404/410', async () => {
  const lookup = async () => [{ address: '8.8.8.8' }];
  const methods = [];
  const request = async (_url, _address, _timeout, method) => { methods.push(method); return { status: method === 'HEAD' ? 405 : 200 }; };
  assert.equal((await checkReference('https://example.invalid/', { lookup, request })).status, 'available');
  assert.deepEqual(methods, ['HEAD', 'GET']);
  assert.equal((await checkReference('https://example.invalid/', { lookup, request: async () => ({ status: 410 }) })).status, 'unavailable');
  assert.equal(exitCodeFor([{ status: 'available' }, { status: 'restricted' }, { status: 'inconclusive' }]), 0);
  assert.equal(exitCodeFor([{ status: 'available' }, { status: 'unavailable' }]), 1);
});
