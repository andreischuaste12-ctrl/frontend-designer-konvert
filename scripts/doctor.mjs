#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { verifyInstall } from './verify-install.mjs';
import { prepareBrowser } from '../skills/audit-frontend-designer-konvert/scripts/prepare-browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Verify local pinned packages before starting browser scenarios. No installs or network access. */
export async function inspectTooling(executor) {
  const manifest = JSON.parse(await fs.readFile(path.join(executor, 'package.json'), 'utf8'));
  const require = createRequire(path.join(executor, 'package.json'));
  const packages = [];
  for (const name of ['playwright', '@axe-core/playwright']) {
    const expected = manifest.devDependencies?.[name];
    let installed = null, status = 'missing';
    try {
      const pkg = JSON.parse(await fs.readFile(path.join(executor, 'node_modules', name, 'package.json'), 'utf8'));
      installed = pkg.version;
      status = typeof expected === 'string' && installed === expected ? 'ready' : 'version_mismatch';
      if (status === 'ready') { await fs.access(require.resolve(name)); }
    } catch (error) { if (installed) status = 'unresolvable'; else if (error.code !== 'ENOENT') status = 'invalid'; }
    packages.push({ name, expected: expected ?? null, installed, status });
  }
  return { ready: packages.every((p) => p.status === 'ready'), packages };
}

export async function diagnose(sourceRoot, { browser = false, inspect = inspectTooling, prepare = prepareBrowser } = {}) {
  const executor = path.join(sourceRoot, 'skills/design-por-referencia-konvert');
  const structureErrors = await verifyInstall(path.join(sourceRoot, 'skills'));
  const node = { version: process.versions.node, ready: Number(process.versions.node.split('.')[0]) >= 20 };
  const tooling = await inspect(executor);
  let browserCheck = { status: 'not_checked' };
  if (browser && tooling.ready) {
    const result = await prepare(executor);
    browserCheck = result.status === 'ready' ? { status: 'ready', source: result.source } : { status: 'unavailable', reason: result.reason };
  } else if (browser) browserCheck = { status: 'blocked', reason: 'Install pinned tooling first.' };
  const ready = node.ready && !structureErrors.length && tooling.ready && (!browser || browserCheck.status === 'ready');
  const nextSteps = [];
  if (!node.ready) nextSteps.push('Use Node.js 20+.');
  if (structureErrors.length) nextSteps.push('Restore missing or invalid skill files from a reviewed checkout.');
  if (!tooling.ready) nextSteps.push('Run npm run setup:tools to install pinned packages.');
  if (browser && tooling.ready && browserCheck.status !== 'ready') nextSteps.push('Run npm run setup:browser or configure PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, then repeat npm run doctor -- --browser.');
  return { ready, node, structure: { ready: !structureErrors.length, errors: structureErrors }, tooling, browser: browserCheck, nextSteps };
}

async function main() {
  const { values } = parseArgs({ options: { browser: { type: 'boolean' }, help: { type: 'boolean' } } });
  if (values.help) { console.log('Usage: node scripts/doctor.mjs [--browser]\nRead-only diagnostics; never installs dependencies.'); return; }
  const result = await diagnose(root, { browser: values.browser });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ready) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Diagnostics failed. Check the source installation and package manifests; filesystem details omitted.'); process.exitCode = 2; });
}
