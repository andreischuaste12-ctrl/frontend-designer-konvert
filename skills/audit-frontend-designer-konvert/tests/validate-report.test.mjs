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
  // Coverage rows cite UX-001 and UX-002; these variants keep a single finding, so drop it.
  const { coverage, ...example } = await load();
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
  const { coverage, ...example } = await load();
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
  const keyed = validateAuditReport({ ...example, scope: { 'synthetic@example.invalid': 'synthetic' } });
  assert.ok(keyed.errors.some((e) => /email address/.test(e)));
  assert.ok(keyed.errors.every((e) => !e.includes('synthetic@example.invalid')));
});

test('Markdown and JSON must contain the same finding IDs', async () => {
  const example = await load();
  const errors = compareMarkdownIds(example, '### UX-001 — a\n### UX-002 — b\n### UX-009 — extra\n');
  assert.ok(errors.includes('Markdown is missing finding UX-003'));
  assert.ok(errors.includes('Markdown has finding UX-009 that is not in the JSON'));
  const md = await fs.readFile(markdownUrl, 'utf8');
  assert.match(compareMarkdownIds(example, md.replace('**Prioridade:** P1', '**Prioridade:** P3')).join('\n'), /priority differs/);
  assert.match(compareMarkdownIds(example, md + '\n### UX-001 — duplicado\n').join('\n'), /duplicate/);
  assert.deepEqual(implementableFindings({ findings: [{ id: 'UX-001', approved_for_implementation: true }] }), []);
  const multiline = structuredClone(example);
  multiline.findings[0].location = multiline.findings[0].location.replace(', ', ',\n');
  const formatted = md.replace('- **Local:** página de produto fictícia, painel de preço e compra', '- **Local:** página de produto fictícia,\n  painel de preço e compra');
  assert.deepEqual(compareMarkdownIds(multiline, formatted), []);
});

test('the CLI exits 0 for valid input, 1 for contract violations, and 2 for unreadable input', async (t) => {
  const run = promisify(execFile);
  const summary = await run(process.execPath, [script, fileURLToPath(exampleUrl)]);
  assert.match(summary.stdout, /eligible in report \(requires independent --approved-ids\)/);
  assert.doesNotMatch(summary.stdout, /implementable:/);
  const withoutApproval = await run(process.execPath, [script, fileURLToPath(exampleUrl), '--implementable']);
  assert.deepEqual(JSON.parse(withoutApproval.stdout).implementable, []);
  const blocked = await run(process.execPath, [script, fileURLToPath(exampleUrl), '--implementable', '--approved-ids', 'UX-001']);
  assert.deepEqual(JSON.parse(blocked.stdout).implementable, []);
  await assert.rejects(run(process.execPath, [script, fileURLToPath(exampleUrl), '--implementable', '--approved-ids', 'UX-999']), (err) => err.code === 1);
  const ok = await run(process.execPath, [script, fileURLToPath(exampleUrl), '--implementable', '--approved-ids', 'UX-003']);
  const parsed = JSON.parse(ok.stdout);
  assert.deepEqual(parsed.implementable.map((f) => f.id), ['UX-003']);
  assert.deepEqual(parsed.blocked.map((f) => f.id), ['UX-001', 'UX-002']);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-report-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const bad = path.join(dir, 'bad.json');
  const leakyMd = path.join(dir, 'leaky.md');
  await fs.writeFile(leakyMd, (await fs.readFile(markdownUrl, 'utf8')) + '\nsynthetic@example.invalid\n');
  await assert.rejects(run(process.execPath, [script, fileURLToPath(exampleUrl), '--markdown', leakyMd]), (err) => err.code === 1 && !err.stderr.includes('synthetic@example.invalid'));
  await fs.writeFile(bad, JSON.stringify({ schema_version: 2 }));
  await assert.rejects(run(process.execPath, [script, bad]), (err) => err.code === 1);
  await fs.writeFile(bad, '{not json');
  await assert.rejects(run(process.execPath, [script, bad]), (err) => err.code === 2 && !err.stderr.includes(dir));
});

test('optional stack metadata validates levels and retains compatibility with existing reports', async () => {
  const report = await load();
  delete report.stack;
  assert.deepEqual(validateAuditReport(report).errors, []);
  for (const level of ['signal', 'likely', 'confirmed']) {
    report.stack = { name: 'Synthetic stack', level, reason: 'Synthetic local evidence.' };
    assert.deepEqual(validateAuditReport(report).errors, []);
  }
  for (const stack of [null, [], {}, { name: 'x', level: 'certain', reason: 'x' }, { name: 'x', level: 'signal', reason: '' }]) {
    report.stack = stack;
    assert.ok(validateAuditReport(report).errors.some(error => error.includes('stack')));
  }
});

test('coverage is optional, proportional and explains every result that was not observed', async () => {
  const example = await load();
  const { coverage, ...withoutCoverage } = example;
  assert.ok(coverage.length > 0);
  assert.deepEqual(validateAuditReport(withoutCoverage).errors, [], 'reports without coverage stay valid under schema_version 2');
  const check = (rows) => validateAuditReport({ ...example, coverage: rows }).errors;
  const observed = { area: 'Checkout sintético', task: 'Pagar', state: 'normal', viewport: '1440 px', result: 'observed', evidence: 'Captura sintética.' };
  assert.deepEqual(check([observed]), []);
  assert.ok(check([]).some((e) => /non-empty list/.test(e)));
  assert.ok(check([{ ...observed, evidence: undefined }]).some((e) => /evidence must say what was observed/.test(e)));
  assert.ok(check([{ ...observed, result: 'not_observed' }]).some((e) => /reason must explain/.test(e)));
  assert.deepEqual(check([{ ...observed, result: 'blocked', reason: 'Formulário sintético indisponível no ambiente.' }]), []);
  assert.ok(check([{ ...observed, state: 'quebrado' }]).some((e) => /state must be one of/.test(e)));
  assert.ok(check([{ ...observed, result: 'skipped' }]).some((e) => /result must be one of/.test(e)));
  assert.ok(check([{ ...observed, findings: ['UX-999'] }]).some((e) => /unknown finding UX-999/.test(e)));
  assert.ok(check([{ ...observed, result: 'not_applicable', reason: 'Sem pagamento.', findings: ['UX-001'] }]).some((e) => /require result observed/.test(e)));
  assert.ok(check([observed, { ...observed, area: ' checkout sintético ' }]).some((e) => /repeats area/.test(e)));
  assert.deepEqual(check([observed, { ...observed, viewport: '375 px', result: 'not_observed', reason: 'Mobile fora do tempo disponível.' }]), [], 'desktop observed and mobile not observed is an explicit gap, not an error');
});

test('Markdown must mirror coverage, preserve lists and confidence', async () => {
  const example = await load();
  const md = await fs.readFile(markdownUrl, 'utf8');
  assert.deepEqual(compareMarkdownIds(example, md), []);
  assert.match(compareMarkdownIds(example, md.replace('| bloqueado |', '| observado |')).join('\n'), /coverage is missing or differs for página de produto \/ adicionar ao carrinho \/ erro/);
  assert.match(compareMarkdownIds(example, md.replace(/## Cobertura[\s\S]*?(?=## Achados)/, '')).join('\n'), /missing the Cobertura section/);
  const { coverage, ...withoutCoverage } = example;
  assert.match(compareMarkdownIds(withoutCoverage, md).join('\n'), /Cobertura section but the JSON has no coverage/);
  assert.match(compareMarkdownIds(example, md.replace('Texto do botão, nome acessível', 'Texto do botão')).join('\n'), /preserve list differs or is missing "Nome acessível" for UX-003/);
  assert.match(compareMarkdownIds(example, md.replace('**Confiança:** baixa', '**Confiança:** alta')).join('\n'), /confidence level differs or is missing for UX-002/);
  assert.match(compareMarkdownIds(example, md.replace('- Cálculos existentes de preço e checkout.', '')).join('\n'), /"O que preservar" is missing/);
});
