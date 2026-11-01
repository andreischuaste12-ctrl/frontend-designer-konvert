#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { REQUIRED_SKILLS, verifyInstall } from './verify-install.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDED = new Set(['node_modules', 'coverage', 'test-results', 'playwright-report']);
const inside = (base, file) => {
  const relative = path.relative(base, file);
  return !relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
};

/** Copy reviewed skill content only; runtime caches and symlinks are never installed. */
async function copySkill(source, destination) {
  if (!(await fs.lstat(source)).isDirectory()) throw new Error('Skill sources must be directories without symbolic links.');
  await fs.mkdir(destination, { recursive: true });
  for (const entry of await fs.readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || EXCLUDED.has(entry.name) || entry.name.endsWith('.log')) continue;
    if (entry.isSymbolicLink()) throw new Error('Skill sources must not contain symbolic links.');
    if (entry.isDirectory()) await copySkill(path.join(source, entry.name), path.join(destination, entry.name));
    else if (entry.isFile()) await fs.copyFile(path.join(source, entry.name), path.join(destination, entry.name), fs.constants.COPYFILE_EXCL);
    else throw new Error('Unsupported entry in skill sources.');
  }
}

/** Fresh installs reserve all destinations first and roll back only directories created by this call. */
export async function installSkills(target, { source = path.join(root, 'skills'), verify = verifyInstall } = {}) {
  const sourceReal = await fs.realpath(source);
  const destination = path.resolve(target);
  // Resolve the closest existing ancestor to catch paths routed back into the sources by a symlink.
  let ancestor = destination;
  const suffix = [];
  while (true) {
    try { ancestor = await fs.realpath(ancestor); break; }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      suffix.unshift(path.basename(ancestor)); ancestor = parent;
    }
  }
  const resolvedDestination = path.join(ancestor, ...suffix);
  if (inside(sourceReal, resolvedDestination)) throw new Error('Install outside the source skills directory.');
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), 'konvert-install-'));
  const reserved = [];
  try {
    for (const name of REQUIRED_SKILLS) await copySkill(path.join(sourceReal, name), path.join(staging, name));
    if ((await verify(staging)).length) throw new Error('Source skills failed structural validation; nothing was installed.');
    await fs.mkdir(destination, { recursive: true });
    for (const name of REQUIRED_SKILLS) {
      const dir = path.join(destination, name);
      try { await fs.mkdir(dir); }
      catch (error) {
        if (error.code === 'EEXIST') throw new Error('A skill destination already exists. Back up existing skills and choose an empty destination.');
        throw error;
      }
      reserved.push(dir);
    }
    for (const name of REQUIRED_SKILLS) await copySkill(path.join(staging, name), path.join(destination, name));
    if ((await verify(destination)).length) throw new Error('Installed structure failed validation; this installation was rolled back.');
    return { installed: [...REQUIRED_SKILLS], dependenciesInstalled: false, activationVerified: false };
  } catch (error) {
    for (const dir of reserved.reverse()) await fs.rm(dir, { recursive: true, force: true });
    throw error;
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

async function main() {
  const { values } = parseArgs({ options: { target: { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help || !values.target) {
    console.log('Usage: node scripts/install-skills.mjs --target <project/.agents/skills>');
    process.exitCode = values.help ? 0 : 2; return;
  }
  await installSkills(values.target);
  console.log('Installed and structurally verified all three skills. Existing skills are never overwritten. Refresh your agent to check activation.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { console.error('Installation failed. Use a new destination, check source structure and permissions, and back up existing skills. No existing skills were replaced.'); process.exitCode = 1; });
}
