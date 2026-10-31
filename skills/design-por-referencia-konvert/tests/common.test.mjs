import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText, redactUrl, resolveRoutes, routeSlug, intList, targetBlockReason } from '../scripts/_common.mjs';
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
  assert.match(targetBlockReason('file:///etc/passwd', { allowFile: true }), /outside the project root/);
});
