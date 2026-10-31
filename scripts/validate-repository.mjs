#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { validateSkillDirectories, validateWorkflowTriggers } from './skill-directory-contract.mjs';
import { validateAuditReport, compareMarkdownIds } from '../skills/audit-frontend-designer-konvert/scripts/validate-report.mjs';
import { validateExecutionRecord } from '../skills/audit-frontend-designer-konvert/scripts/validate-execution-record.mjs';
import { validateAuditCases } from './evaluate-audit.mjs';
import { validateHandoffCase } from './check-handoff-scope.mjs';
import { checkKnowledge } from './check-knowledge-units.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let checked = 0;
let syntaxChecked = 0;
const jsonFiles = new Map();
const skillsRoot = path.join(root, 'skills');
const skillEntries = (await fs.readdir(skillsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
const skillNames = skillEntries.map((entry) => entry.name);
const skillMetadata = await Promise.all(skillEntries.map(async (entry) => {
  let name;
  try {
    const content = await fs.readFile(path.join(skillsRoot, entry.name, 'SKILL.md'), 'utf8');
    const front = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    name = front?.[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  } catch {}
  return { directory: entry.name, name };
}));
errors.push(...validateSkillDirectories(skillMetadata));
errors.push(...validateWorkflowTriggers(await fs.readFile(path.join(root, '.github/workflows/skill-tools.yml'), 'utf8'), skillNames, '.github/workflows/skill-tools.yml'));
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'coverage'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!entry.isFile()) continue;
    if (file.endsWith('.json')) {
      try { jsonFiles.set(file, JSON.parse(await fs.readFile(file, 'utf8'))); }
      catch { errors.push(`${path.relative(root, file)}: invalid JSON`); }
      continue;
    }
    if (file.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      syntaxChecked++;
      if (result.status !== 0) errors.push(`${path.relative(root, file)}: syntax check failed`);
      continue;
    }
    if (!file.endsWith('.md')) continue;
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
      if (name === 'create-frontend-from-zero-konvert') {
        for (const section of ['Fronteiras e colaboração', 'Fluxo', 'Definição de pronto', 'Referências e exemplos']) {
          if (!text.includes(`## ${section}`)) errors.push(`${relative}: missing ${section} section`);
        }
        for (const folder of ['references', 'examples']) {
          for (const file of await fs.readdir(path.join(dir, folder))) {
            if (file.endsWith('.md') && !text.includes(`](${folder}/${file})`)) errors.push(`${relative}: ${folder} file must be linked: ${file}`);
          }
        }
      }
      if (name === 'audit-frontend-designer-konvert') {
        for (const section of ['Fluxo', 'Princípios de design', 'Catálogo de referências', 'Formato do relatório']) {
          if (!text.includes(`## ${section}`)) errors.push(`${relative}: missing ${section} section`);
        }
        for (const module of await fs.readdir(path.join(dir, 'knowledge-base'))) {
          if (module.endsWith('.md') && !text.includes(`](knowledge-base/${module})`)) errors.push(`${relative}: knowledge module must be linked: ${module}`);
        }
      }
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
const tooling = path.join(root, 'skills/design-por-referencia-konvert');
const manifest = jsonFiles.get(path.join(tooling, 'package.json')) ?? {};
const lock = jsonFiles.get(path.join(tooling, 'package-lock.json')) ?? {};
const lockedManifest = lock.packages?.[''];
if (!lockedManifest || manifest.name !== lock.name || manifest.version !== lock.version || manifest.version !== lockedManifest.version ||
    !isDeepStrictEqual(manifest.devDependencies, lockedManifest.devDependencies) || !isDeepStrictEqual(manifest.engines, lockedManifest.engines)) errors.push('Tooling package manifest and lockfile are inconsistent.');
const rawRouting = jsonFiles.get(path.join(root, 'evaluations/routing-cases.json'));
if (!Array.isArray(rawRouting)) errors.push('Routing cases must be a JSON array.');
const routingCases = Array.isArray(rawRouting) ? rawRouting : [];
if (new Set(routingCases.map((c) => c?.id)).size !== routingCases.length) errors.push('Routing case IDs must be unique.');
for (const skill of skillNames) {
  const cases = routingCases.filter((c) => c?.skill === skill);
  if (cases.length !== 24) errors.push(`${skill}: requires exactly 24 routing cases.`);
  if (cases.filter((c) => c.shouldTrigger === true).length < 6 || cases.filter((c) => c.shouldTrigger === false).length < 6) errors.push(`${skill}: requires at least 6 positive and 6 negative routing cases.`);
}
if (routingCases.some((c) => !c || !c.id || typeof c.prompt !== 'string' || !c.prompt.trim() || typeof c.shouldTrigger !== 'boolean' || !skillNames.includes(c.skill))) errors.push('Invalid routing case.');
const capture = jsonFiles.get(path.join(tooling, 'examples/capture-index.example.json'));
if (!capture || capture.tool !== 'capture.mjs' || !Array.isArray(capture.widths) || !capture.widths.every((n) => Number.isInteger(n) && n > 0) || !Array.isArray(capture.pages) || !Array.isArray(capture.files) || !capture.files.every((f) => f && typeof f.file === 'string' && path.basename(f.file) === f.file && Number.isInteger(f.width) && ['light', 'dark'].includes(f.scheme))) errors.push('Invalid capture-index example shape.');
const images = jsonFiles.get(path.join(tooling, 'examples/image-manifest.example.json'));
if (!images || typeof images.url !== 'string' || !Number.isInteger(images.width) || !Array.isArray(images.items) || !images.items.every((i) => i && ['img', 'background'].includes(i.kind) && typeof i.src === 'string' && Array.isArray(i.rendered) && i.rendered.length === 2 && i.rendered.every((n) => Number.isFinite(n) && n >= 0) && Array.isArray(i.flags))) errors.push('Invalid image-manifest example shape.');
const auditDir = path.join(root, 'skills/audit-frontend-designer-konvert/examples');
const auditReport = jsonFiles.get(path.join(auditDir, 'audit-report.example.json'));
const auditCheck = validateAuditReport(auditReport);
errors.push(...auditCheck.errors.map((e) => `audit-report.example.json: ${e}`), ...auditCheck.warnings.map((w) => `audit-report.example.json: ${w}`));
if (!auditCheck.errors.length) errors.push(...compareMarkdownIds(auditCheck.report, await fs.readFile(path.join(auditDir, 'audit-report.example.md'), 'utf8')).map((e) => `audit-report.example.md: ${e}`));
const executionRecordCheck = validateExecutionRecord(jsonFiles.get(path.join(auditDir, 'execution-record.example.json')));
errors.push(...executionRecordCheck.errors.map((e) => `execution-record.example.json: ${e}`), ...executionRecordCheck.warnings.map((w) => `execution-record.example.json: ${w}`));
const auditCases = jsonFiles.get(path.join(root, 'evaluations/audit-quality/cases.json'));
errors.push(...validateAuditCases(auditCases).map((e) => `evaluations/audit-quality/cases.json: ${e}`));
for (const item of auditCases?.cases ?? []) {
  try { await fs.access(path.join(root, item.fixture, 'index.html')); } catch { errors.push(`evaluations/audit-quality/cases.json: fixture for ${item.id} is missing index.html`); }
}
for (const name of await fs.readdir(path.join(root, 'evaluations/handoff'))) {
  const handoff = jsonFiles.get(path.join(root, 'evaluations/handoff', name));
  if (!name.endsWith('.json') || name.endsWith('-report.json') || !handoff) continue;
  const { errors: handoffErrors } = validateHandoffCase(handoff, jsonFiles.get(path.resolve(root, handoff.report ?? '')));
  errors.push(...handoffErrors.map((e) => `evaluations/handoff/${name}: ${e}`));
  try { await fs.access(path.join(root, handoff.fixture)); } catch { errors.push(`evaluations/handoff/${name}: fixture is missing`); }
}
errors.push(...await checkKnowledge(root));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${checked} Markdown files, ${syntaxChecked} JavaScript modules, ${jsonFiles.size} JSON files, example shapes, audit report contract, evaluation cases, skill metadata, relative links, and tooling lockfile.`);
