#!/usr/bin/env node
// One local entry point; browser checks are explicit and never install dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { prepareBrowser } from '../skills/audit-frontend-designer-konvert/scripts/prepare-browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const executor = path.join(root, 'skills/design-por-referencia-konvert');
const browser = process.argv.slice(2).includes('--browser');
if (process.argv.slice(2).some((arg) => arg !== '--browser')) {
  console.error('Usage: node scripts/check-project.mjs [--browser]'); process.exit(2);
}
function run(args, cwd = root, env = process.env) {
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
run(['scripts/validate-repository.mjs']);
const tests = [];
for (const dir of ['scripts', 'skills/audit-frontend-designer-konvert/tests']) {
  for (const file of (await fs.readdir(path.join(root, dir))).sort()) if (file.endsWith('.test.mjs')) tests.push(`${dir}/${file}`);
}
for (const file of ['common', 'compare', 'pinning']) tests.push(`skills/design-por-referencia-konvert/tests/${file}.test.mjs`);
run(['--test', ...tests]);
if (browser) {
  const prepared = await prepareBrowser(executor);
  if (prepared.status !== 'ready') {
    console.error('Browser checks require the executor dependencies and a working Chromium. See docs/installation.md. No installation was attempted.');
    process.exit(2);
  }
  const env = { ...process.env };
  if (prepared.executablePath) env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = prepared.executablePath;
  run(['--test', 'tests/scripts-smoke.test.mjs', 'tests/network-guards.test.mjs'], executor, env);
}
