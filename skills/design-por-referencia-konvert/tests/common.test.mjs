import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText, redactUrl, resolveRoutes, routeSlug, intList } from '../scripts/_common.mjs';

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
  const safe = redactText('owner@example.invalid token=sample name=customer-name https://example.test/a?email=owner%40example.invalid /home/andrei/private.log');
  assert.doesNotMatch(safe, /owner@example\.invalid|sample|customer-name|email=|\/home\/andrei/i);
  assert.match(safe, /\[email redacted\]/);
});

test('route helpers normalize paths and filter invalid widths', () => {
  assert.equal(routeSlug(new URL('https://example.test/products/new-item')), 'products-new-item');
  assert.deepEqual(intList('320, 375, nope, 5000', { min: 200, max: 4000 }), [320, 375]);
  assert.deepEqual(resolveRoutes(new URL('https://example.test/shop/'), '/,item').map((u) => u.pathname), ['/','/shop/item']);
});
