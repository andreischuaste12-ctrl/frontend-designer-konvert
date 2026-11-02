import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { clientHtml } from '../scripts/render-client-pdf.mjs';

const example = JSON.parse(await fs.readFile(new URL('../examples/audit-report.example.json', import.meta.url), 'utf8'));

test('client report explains evidence, rationale, improvement, verification and limitations', () => {
  const { html } = clientHtml(example);
  for (const expected of ['UX-001', 'O que foi observado', 'Por que isso importa', 'Como melhorar', 'Como verificar a melhoria', 'Precisa de validação', 'Limites da evidência', 'Estados não observados, bloqueados ou não aplicáveis']) assert.ok(html.includes(expected), expected);
  assert.ok(html.indexOf('UX-001') < html.indexOf('UX-003'));
  assert.ok(html.includes(example.findings[0].next_step));
});

test('rejects invalid reports and escapes report content as text', () => {
  assert.throws(() => clientHtml({}), /Relatório inválido/);
  const report = structuredClone(example);
  report.project = '<img src=x onerror=alert(1)>';
  const { html } = clientHtml(report);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
});
