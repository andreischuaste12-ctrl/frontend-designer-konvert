import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { detectStacks } from '../skills/design-por-referencia-konvert/scripts/detect-stack.mjs';

test('detects stack markers without returning manifest contents or project paths', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'stack-fixture-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'layout')); await fs.writeFile(path.join(dir, 'layout/theme.liquid'), 'synthetic');
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'synthetic-private-name', dependencies: { react: '1', next: '1', tailwindcss: '1' } }));
  await fs.writeFile(path.join(dir, 'manifest.json'), JSON.stringify({ builders: { store: '0.x' } }));
  const data = await detectStacks(dir), names = data.results.map((x) => x.stack);
  for (const name of ['Shopify theme', 'VTEX IO', 'Next.js', 'React', 'Tailwind CSS']) assert.ok(names.includes(name), name);
  assert.doesNotMatch(JSON.stringify(data), /synthetic-private-name|stack-fixture|0\.x/);
});

test('recognizes WordPress, WooCommerce and static HTML without exposing contents', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'stack-fixture-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'woocommerce')); await fs.writeFile(path.join(dir, 'theme.json'), '{}');
  await fs.writeFile(path.join(dir, 'style.css'), 'synthetic'); await fs.writeFile(path.join(dir, 'index.html'), 'synthetic');
  await fs.writeFile(path.join(dir, 'manifest.json'), '{"builders":null}');
  const names = (await detectStacks(dir)).results.map((x) => x.stack);
  for (const name of ['WordPress block theme', 'WooCommerce', 'HTML entry']) assert.ok(names.includes(name), name);
  assert.ok(!names.includes('VTEX IO'));
});


test('reports signal for one marker and likely for two without confirming a platform', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'stack-level-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.mkdir(path.join(dir, 'layout'));
  await fs.writeFile(path.join(dir, 'layout/theme.liquid'), 'synthetic');
  let shopify = (await detectStacks(dir)).results.find(x => x.stack === 'Shopify theme');
  assert.equal(shopify.confidence, 'signal');
  await fs.mkdir(path.join(dir, 'config'));
  await fs.writeFile(path.join(dir, 'config/settings_schema.json'), '[]');
  shopify = (await detectStacks(dir)).results.find(x => x.stack === 'Shopify theme');
  assert.equal(shopify.confidence, 'likely');
  assert.notEqual(shopify.confidence, 'confirmed');
});
