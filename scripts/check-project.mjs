#!/usr/bin/env node
// One local entry point; browser checks are explicit and never install dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { prepareBrowser } from '../skills/audit-frontend-designer-konvert/scripts/prepare-browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER_TESTS = new Set(['scripts-smoke.test.mjs', 'network-guards.test.mjs']);

/** Discover every current unit test; browser-only tests are a separate explicit suite. */
export async function discoverTests(sourceRoot) {
  const unit = [], browser = [];
  for (const dir of ['scripts', 'skills/audit-frontend-designer-konvert/tests', 'skills/design-por-referencia-konvert/tests']) {
    for (const file of (await fs.readdir(path.join(sourceRoot, dir))).sort()) {
      if (!file.endsWith('.test.mjs')) continue;
      const target = dir.endsWith('design-por-referencia-konvert/tests') && BROWSER_TESTS.has(file) ? browser : unit;
      target.push(`${dir}/${file}`);
    }
  }
  return { unit, browser };
}

function runNode(args, cwd, env = process.env) {
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw Object.assign(new Error('Project check failed.'), { exitCode: result.status || 1 });
}

export async function checkProject(sourceRoot, { browser = false, run = runNode, prepare = prepareBrowser } = {}) {
  await run(['scripts/validate-repository.mjs'], sourceRoot);
  const tests = await discoverTests(sourceRoot);
  await run(['--test', ...tests.unit], sourceRoot);
  if (!browser) return;
  const executor = path.join(sourceRoot, 'skills/design-por-referencia-konvert');
  const prepared = await prepare(executor);
  if (prepared.status !== 'ready') {
    throw Object.assign(new Error('Browser checks require executor dependencies and a working Chromium. See docs/installation.md. No installation was attempted.'), { exitCode: 2 });
  }
  const env = { ...process.env };
  if (prepared.executablePath) env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = prepared.executablePath;
  await run(['--test', ...tests.browser], sourceRoot, env);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--browser')) {
    console.error('Usage: node scripts/check-project.mjs [--browser]'); process.exitCode = 2;
  } else {
    try { await checkProject(root, { browser: args.includes('--browser') }); }
    catch (error) { console.error(error.exitCode ? error.message : 'Project check could not run; filesystem details omitted.'); process.exitCode = error.exitCode || 1; }
  }
}
