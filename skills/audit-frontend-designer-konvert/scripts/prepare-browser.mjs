#!/usr/bin/env node
// Prepare the executor's read-only browser tools without writing to the audited project.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const exists = async (file) => fs.access(file).then(() => true, () => false);
const EXECUTABLES = process.platform === 'win32'
  ? ['chrome.exe', 'msedge.exe']
  : ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable'];

export async function stageBrowserTools(executorDir, parent = os.tmpdir()) {
  const source = path.resolve(executorDir);
  const destinationParent = path.resolve(parent);
  const relativeToProject = path.relative(await fs.realpath(process.cwd()), await fs.realpath(destinationParent));
  if (!relativeToProject || (!relativeToProject.startsWith('..') && !path.isAbsolute(relativeToProject))) throw new Error('The isolated runtime must be outside the audited project.');
  for (const name of ['package.json', 'package-lock.json', 'scripts/_common.mjs', 'scripts/_network.mjs', 'scripts/_pinning.mjs', 'scripts/capture.mjs', 'scripts/extract-styles.mjs', 'scripts/image-manifest.mjs']) {
    if (!(await exists(path.join(source, name)))) throw new Error('The installed executor skill is incomplete.');
  }
  const staged = await fs.mkdtemp(path.join(destinationParent, 'konvert-browser-'));
  try {
    await fs.copyFile(path.join(source, 'package.json'), path.join(staged, 'package.json'));
    await fs.copyFile(path.join(source, 'package-lock.json'), path.join(staged, 'package-lock.json'));
    await fs.cp(path.join(source, 'scripts'), path.join(staged, 'scripts'), { recursive: true });
    return staged;
  } catch (error) {
    await fs.rm(staged, { recursive: true, force: true });
    throw error;
  }
}

function candidates() {
  const out = [];
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) out.push(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH);
  const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
  for (const dir of dirs) for (const name of EXECUTABLES) out.push(path.join(dir, name));
  if (process.platform === 'darwin') out.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  if (process.platform === 'win32') for (const prefix of [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']].filter(Boolean)) {
    out.push(path.join(prefix, 'Google/Chrome/Application/chrome.exe'), path.join(prefix, 'Microsoft/Edge/Application/msedge.exe'));
  }
  return [...new Set(out)];
}

async function probe(dir, browserCacheDir) {
  if (!(await exists(path.join(dir, 'node_modules/playwright/package.json')))) return null;
  let pw;
  const previousCache = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (browserCacheDir) process.env.PLAYWRIGHT_BROWSERS_PATH = browserCacheDir;
  try {
    try { pw = createRequire(path.join(dir, 'package.json'))('playwright'); }
    catch { return null; }
    const managed = pw.chromium.executablePath();
    for (const executablePath of [managed, ...candidates()]) {
      if (!(await exists(executablePath))) continue;
      try {
        const browser = await pw.chromium.launch({ executablePath, headless: true, timeout: 15000 });
        await browser.close();
        return { source: executablePath === managed ? 'playwright' : 'system', executablePath: executablePath === managed ? null : executablePath };
      } catch { /* try the next executable without claiming a working browser */ }
    }
    return null;
  } finally {
    if (browserCacheDir) {
      if (previousCache === undefined) delete process.env.PLAYWRIGHT_BROWSERS_PATH;
      else process.env.PLAYWRIGHT_BROWSERS_PATH = previousCache;
    }
  }
}

function run(cmd, args, cwd, overrides = {}) {
  const result = spawnSync(cmd, args, { cwd, stdio: 'ignore', timeout: 180000, env: { ...process.env, ...overrides } });
  return !result.error && result.status === 0;
}

/** Returns a working scripts directory or a bounded, actionable failure without editing the target. */
export async function prepareBrowser(executorDir, { install = false, parent = os.tmpdir() } = {}) {
  const source = path.resolve(executorDir);
  if (!(await exists(path.join(source, 'scripts/capture.mjs')))) return { status: 'unavailable', reason: 'Executor browser scripts are missing.' };
  const existing = await probe(source);
  if (existing) return { status: 'ready', scriptsDir: path.join(source, 'scripts'), isolated: false, ...existing };
  if (!install) return { status: 'unavailable', reason: 'No working Playwright/Chromium pair. Retry with --install to prepare an isolated copy outside the audited project.' };

  let staged;
  try {
    staged = await stageBrowserTools(source, parent);
    const browserCacheDir = path.join(staged, 'browser-cache');
    const npmCacheDir = path.join(staged, 'npm-cache');
    const npmArgs = ['ci', '--ignore-scripts', '--no-audit', '--no-fund'];
    const npmOk = process.platform === 'win32'
      ? run('cmd.exe', ['/d', '/s', '/c', 'npm', ...npmArgs], staged, { npm_config_cache: npmCacheDir })
      : run('npm', npmArgs, staged, { npm_config_cache: npmCacheDir });
    if (!npmOk) throw new Error('Dependency installation failed in the isolated runtime.');
    let browser = await probe(staged, browserCacheDir);
    if (!browser) {
      const cli = path.join(staged, 'node_modules/playwright/cli.js');
      if (!(await exists(cli)) || !run(process.execPath, [cli, 'install', 'chromium'], staged, { PLAYWRIGHT_BROWSERS_PATH: browserCacheDir })) throw new Error('Chromium download failed and no working system browser was found.');
      browser = await probe(staged, browserCacheDir);
    }
    if (!browser) throw new Error('Chromium could not launch in the isolated runtime.');
    return { status: 'ready', scriptsDir: path.join(staged, 'scripts'), isolated: true, cleanupDir: staged, ...(browser.source === 'playwright' ? { browserCacheDir } : {}), ...browser };
  } catch (error) {
    if (staged) await fs.rm(staged, { recursive: true, force: true });
    const safeReasons = new Set([
      'The isolated runtime must be outside the audited project.',
      'The installed executor skill is incomplete.',
      'Dependency installation failed in the isolated runtime.',
      'Chromium download failed and no working system browser was found.',
      'Chromium could not launch in the isolated runtime.',
    ]);
    return { status: 'unavailable', reason: safeReasons.has(error.message) ? error.message : 'Isolated browser preparation failed; filesystem details omitted.' };
  }
}

async function main() {
  const { values } = parseArgs({ options: { executor: { type: 'string' }, install: { type: 'boolean' }, help: { type: 'boolean' } } });
  if (values.help || !values.executor) {
    console.log('Usage: node prepare-browser.mjs --executor <installed-executor-skill-dir> [--install]');
    process.exitCode = values.help ? 0 : 2; return;
  }
  const result = await prepareBrowser(values.executor, { install: values.install });
  console.log(JSON.stringify(result));
  if (result.status !== 'ready') process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
