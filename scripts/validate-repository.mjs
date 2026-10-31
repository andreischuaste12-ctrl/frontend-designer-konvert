#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let checked = 0;
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'coverage'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!entry.isFile() || !file.endsWith('.md')) continue;
    const text = await fs.readFile(file, 'utf8');
    const relative = path.relative(root, file);
    checked++;
    if (entry.name === 'SKILL.md') {
      const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const name = front?.[1].match(/^name:\s*(.+)$/m)?.[1].trim();
      const description = front?.[1].match(/^description:\s*(.+)$/m)?.[1].trim();
      if (name !== path.basename(dir)) errors.push(`${relative}: name must match directory`);
      if (!description || description.length > 1024) errors.push(`${relative}: description must contain 1–1024 characters`);
      if (text.split('\n').length > 500) errors.push(`${relative}: exceeds 500 lines`);
    }
    // Check authored Markdown links, excluding code examples and remote URLs.
    const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').replace(/`[^`\n]+`/g, '');
    for (const match of prose.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1].replace(/^<|>$/g, '').split('#')[0];
      if (!target || /^(?:[a-z]+:|\/)/i.test(target)) continue;
      try { await fs.access(path.resolve(dir, decodeURIComponent(target))); }
      catch { errors.push(`${relative}: missing relative link ${target}`); }
    }
  }
}
await walk(root);
const routingCases = JSON.parse(await fs.readFile(path.join(root, 'evaluations/routing-cases.json'), 'utf8'));
if (new Set(routingCases.map((c) => c.id)).size !== routingCases.length) errors.push('Routing case IDs must be unique.');
for (const skill of ['frontend-designer', 'design-por-referencia-konvert']) {
  const cases = routingCases.filter((c) => c.skill === skill);
  if (cases.filter((c) => c.shouldTrigger === true).length < 6 || cases.filter((c) => c.shouldTrigger === false).length < 6) errors.push(`${skill}: requires at least 6 positive and 6 negative routing cases.`);
}
if (routingCases.some((c) => !c.id || typeof c.prompt !== 'string' || !c.prompt.trim() || typeof c.shouldTrigger !== 'boolean' || !['frontend-designer', 'design-por-referencia-konvert'].includes(c.skill))) errors.push('Invalid routing case.');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${checked} Markdown files, skill metadata, and relative links.`);
