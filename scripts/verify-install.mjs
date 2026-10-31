#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_SKILLS = ['audit-frontend-designer-konvert', 'design-por-referencia-konvert', 'create-frontend-from-zero-konvert'];
const TOOLING_FILES = [
  'package.json',
  'package-lock.json',
  'scripts/_common.mjs',
  'scripts/_network.mjs',
  'scripts/_pinning.mjs',
  'scripts/capture.mjs',
  'scripts/extract-styles.mjs',
  'scripts/image-manifest.mjs',
  'scripts/compare.mjs',
  'scripts/detect-stack.mjs',
];

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

async function walkMarkdown(dir, files = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkMarkdown(file, files);
    else if (entry.isFile() && file.endsWith('.md')) files.push(file);
  }
  return files;
}

/** Returns a list of problems found in an installed skills directory; empty means structurally valid. */
export async function verifyInstall(skillsDir) {
  const errors = [];
  for (const skill of REQUIRED_SKILLS) {
    const dir = path.join(skillsDir, skill);
    const skillFile = path.join(dir, 'SKILL.md');
    if (!(await exists(skillFile))) { errors.push(`${skill}: SKILL.md not found`); continue; }
    const text = await fs.readFile(skillFile, 'utf8');
    const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const name = front.match(/^name:\s*(.+)$/m)?.[1].trim();
    const description = front.match(/^description:\s*(.+)$/m)?.[1].trim();
    if (name !== skill) errors.push(`${skill}: frontmatter name must match directory`);
    if (!description || description.length > 1024) errors.push(`${skill}: description must contain 1–1024 characters`);
    for (const file of await walkMarkdown(dir)) {
      const prose = (await fs.readFile(file, 'utf8')).replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').replace(/`[^`\n]+`/g, '');
      for (const match of prose.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
        const target = match[1].replace(/^<|>$/g, '').split('#')[0];
        if (!target || /^(?:[a-z]+:|\/)/i.test(target)) continue;
        if (!(await exists(path.resolve(path.dirname(file), decodeURIComponent(target))))) {
          errors.push(`${skill}: ${path.relative(dir, file)} has a missing relative link ${target}`);
        }
      }
    }
  }
  if (!(await exists(path.join(skillsDir, 'audit-frontend-designer-konvert/scripts/validate-report.mjs')))) {
    errors.push('audit-frontend-designer-konvert: missing scripts/validate-report.mjs');
  }
  // The audit skill links into the executor, so both must be installed side by side.
  const executor = path.join(skillsDir, 'design-por-referencia-konvert');
  for (const file of TOOLING_FILES) {
    if (!(await exists(path.join(executor, file)))) errors.push(`design-por-referencia-konvert: missing ${file}`);
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node scripts/verify-install.mjs <skills-dir>');
    process.exit(2);
  }
  const errors = await verifyInstall(path.resolve(target));
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`All three skills are structurally valid in ${path.basename(path.resolve(target))}. This does not prove agent activation.`);
}
