#!/usr/bin/env node
// Read-only, bounded marker detection; signals are hypotheses, never execution instructions.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export async function detectStacks(directory) {
  const root = await fs.realpath(directory);
  async function marker(relative, kind = 'any') {
    try {
      const item = path.join(root, relative);
      const entry = await fs.lstat(item);
      if (entry.isSymbolicLink()) return false;
      const real = await fs.realpath(item), rel = path.relative(root, real);
      if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) return false;
      return kind === 'file' ? entry.isFile() : kind === 'directory' ? entry.isDirectory() : true;
    } catch { return false; }
  }
  async function json(relative) {
    try {
      if (!await marker(relative, 'file')) return null;
      const file = path.join(root, relative);
      if ((await fs.stat(file)).size > 1024 * 1024) return null;
      return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch { return null; }
  }
  const pkg = await json('package.json');
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies, ...pkg?.peerDependencies };
  const manifest = await json('manifest.json');
  const results = [];
  const add = (stack, signals) => { if (signals.length) results.push({ stack, confidence: 'possible', signals }); };
  const signals = async (checks) => (await Promise.all(checks.map(async ([label, test]) => await test() ? label : null))).filter(Boolean);
  add('Shopify theme', await signals([
    ['layout/theme.liquid', () => marker('layout/theme.liquid', 'file')],
    ['config/settings_schema.json', () => marker('config/settings_schema.json', 'file')],
    ['shopify.theme.toml', () => marker('shopify.theme.toml', 'file')],
  ]));
  add('VTEX IO', await signals([
    ['manifest.json builders', async () => Boolean(manifest?.builders && typeof manifest.builders === 'object' && !Array.isArray(manifest.builders) && ['store', 'react', 'styles'].some((key) => key in manifest.builders))],
    ['store directory', async () => Boolean(manifest?.builders?.store && await marker('store', 'directory'))],
  ]));
  add('WordPress block theme', await signals([
    ['theme.json and style.css', async () => await marker('theme.json', 'file') && await marker('style.css', 'file')],
    ['wp-content/themes', () => marker('wp-content/themes', 'directory')],
  ]));
  add('WooCommerce', await signals([
    ['woocommerce template directory', () => marker('woocommerce', 'directory')],
    ['WooCommerce plugin directory', () => marker('wp-content/plugins/woocommerce', 'directory')],
  ]));
  add('Next.js', await signals([['next dependency', async () => typeof deps.next === 'string']]));
  add('React', await signals([['react dependency', async () => typeof deps.react === 'string']]));
  add('Tailwind CSS', await signals([
    ['tailwindcss dependency', async () => typeof deps.tailwindcss === 'string'],
    ['tailwind config', async () => (await Promise.all(['tailwind.config.js','tailwind.config.cjs','tailwind.config.mjs','tailwind.config.ts'].map((p) => marker(p, 'file')))).some(Boolean)],
  ]));
  add('HTML entry', await signals([['index.html', () => marker('index.html', 'file')]]));
  return { schemaVersion: 1, results, limitations: ['Markers are hints, not proof; inspect the project and its own documentation before deciding.', 'Only known marker paths and bounded public manifests are read; no commands or network requests are executed.'] };
}
export async function main(argv = process.argv.slice(2)) {
  try {
    const { values } = parseArgs({ args: argv, options: { root: { type: 'string', default: '.' }, help: { type: 'boolean' } } });
    if (values.help) { console.log('Usage: node detect-stack.mjs [--root <project>]'); return; }
    console.log(JSON.stringify(await detectStacks(values.root), null, 2));
  } catch { console.error('Stack detection failed; verify the project directory. Path and contents omitted.'); process.exitCode = 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
