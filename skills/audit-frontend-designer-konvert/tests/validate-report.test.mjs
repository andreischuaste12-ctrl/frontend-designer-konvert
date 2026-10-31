import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { validateAuditReport, implementableFindings, normalizeReport, compareMarkdownIds } from '../scripts/validate-report.mjs';

const exampleUrl = new URL('../examples/audit-report.example.json', import.meta.url);
const markdownUrl = new URL('../examples/audit-report.example.md', import.meta.url);
const script = fileURLToPath(new URL('../scripts/validate-report.mjs', import.meta.url));
const load = async () => JSON.parse(await fs.readFile(exampleUrl, 'utf8'));

test('the synthetic example satisfies the current contract and its Markdown mirrors the IDs', async () => {
  const example = await load();
  const { errors, warnings } = validateAuditReport(example);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.deepEqual(compareMarkdownIds(example, await fs.readFile(markdownUrl, 'utf8')), []);
});

test('only approved findings without a pending dependency are implementable', async () => {
  const example = await load();
  assert.deepEqual(implementableFindings(example).map((f) => f.id), ['UX-003']);
  const variants = [
    [{ approved_for_implementation: true, external_dependency: { status: 'not_applicable' } }, true],
    [{ approved_for_implementation: true, external_dependency: { status: 'resolved', detail: 'x', resolution: 'y' } }, true],
    [{ approved_for_implementation: true, external_dependency: { status: 'pending', detail: 'x' } }, false],
    [{ approved_for_implementation: false, external_dependency: { status: 'not_applicable' } }, false],
    [{ approved_for_implementation: 'true', external_dependency: { status: 'not_applicable' } }, false],
  ];
  for (const [patch, expected] of variants) {
    const report = { ...example, findings: [{ ...example.findings[2], ...patch }] };
    assert.equal(implementableFindings(report).length === 1, expected, JSON.stringify(patch));
  }
});

test('dependency states require the right supporting text', async () => {
  const example = await load();
  const withDependency = (dep) => validateAuditReport({ ...example, findings: [{ ...example.findings[2], external_dependency: dep }] }).errors;
  assert.match(withDependency({ status: 'resolved', detail: 'brand approval' }).join('\n'), /resolution must record/);
  assert.match(withDependency({ status: 'pending' }).join('\n'), /detail must describe/);
  assert.match(withDependency({ status: 'pending', detail: 'x', resolution: 'premature' }).join('\n'), /only allowed when status is resolved/);
  assert.match(withDependency({ status: 'done' }).join('\n'), /status must be one of/);
  assert.match(withDependency(undefined).join('\n'), /must be an object/);
  assert.deepEqual(withDependency({ status: 'not_applicable' }), []);
});

test('structural violations are reported, including the auditor never implementing', async () => {
  const example = await load();
  const broken = {
    ...example,
    handoff: { ...example.handoff, implementation_performed: true },
    findings: [
      { ...example.findings[0], id: 'UX-001', priority: 'P4', confidence: { level: 'certain' } },
      { ...example.findings[1], id: 'UX-001', preserve: 'tudo' },
    ],
  };
  const { errors } = validateAuditReport(broken);
  for (const pattern of [/priority must be one of/, /confidence needs level/, /preserve must be a list/, /IDs must be unique: UX-001/, /implementation_performed must be false/]) {
    assert.ok(errors.some((e) => pattern.test(e)), String(pattern));
  }
  assert.match(validateAuditReport({ ...example, schema_version: 3 }).errors.join('\n'), /schema_version must be 2/);
  assert.match(validateAuditReport([]).errors.join('\n'), /JSON object/);
});

test('schema_version 1 reports migrate conservatively: any described dependency stays pending', async () => {
  const example = await load();
  const legacy = {
    ...example,
    schema_version: 1,
    findings: example.findings.map(({ external_dependency, ...f }) => ({ ...f, requires_external_data_or_approval: external_dependency.status === 'not_applicable' ? false : external_dependency.detail })),
  };
  const { errors, warnings, report } = validateAuditReport(legacy);
  assert.deepEqual(errors, []);
  assert.match(warnings.join('\n'), /deprecated/);
  assert.deepEqual(report.findings.map((f) => f.external_dependency.status), ['pending', 'pending', 'pending']);
  assert.deepEqual(implementableFindings(legacy), [], 'a v1 dependency cannot be considered resolved');
  assert.equal(normalizeReport(example), example, 'current reports are returned unchanged');
  const mixed = { ...example, findings: [{ ...example.findings[0], requires_external_data_or_approval: false }] };
  assert.match(validateAuditReport(mixed).errors.join('\n'), /belongs to schema_version 1/);
});

test('likely private data is flagged before a report is shared', async () => {
  const example = await load();
  const leaky = { ...example, project: 'cliente pessoa@example.com', evidence_limits: ['Captura em https://loja.example.test/conta?token=abc', 'Arquivo em /home/pessoa/projeto/relatorio.md'] };
  const { errors, warnings } = validateAuditReport(leaky);
  assert.ok(errors.some((e) => /email address/.test(e)));
  assert.ok(errors.some((e) => /secret-like parameter/.test(e)));
  assert.ok(warnings.some((w) => /personal path/.test(w)), 'paths warn because routes can look similar');
});

test('Markdown and JSON must contain the same finding IDs', async () => {
  const example = await load();
  assert.deepEqual(compareMarkdownIds(example, '### UX-001 — a\n### UX-002 — b\n### UX-009 — extra\n'), ['Markdown is missing finding UX-003', 'Markdown has finding UX-009 that is not in the JSON']);
});

test('the CLI exits 0 for valid input, 1 for contract violations, and 2 for unreadable input', async (t) => {
  const run = promisify(execFile);
  const ok = await run(process.execPath, [script, fileURLToPath(exampleUrl), '--implementable']);
  const parsed = JSON.parse(ok.stdout);
  assert.deepEqual(parsed.implementable.map((f) => f.id), ['UX-003']);
  assert.deepEqual(parsed.blocked, [{ id: 'UX-001', reasons: ['not approved', 'external dependency pending'] }, { id: 'UX-002', reasons: ['not approved', 'external dependency pending'] }]);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-report-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const bad = path.join(dir, 'bad.json');
  await fs.writeFile(bad, JSON.stringify({ schema_version: 2 }));
  await assert.rejects(run(process.execPath, [script, bad]), (err) => err.code === 1);
  await fs.writeFile(bad, '{not json');
  await assert.rejects(run(process.execPath, [script, bad]), (err) => err.code === 2 && !err.stderr.includes(dir));
});
