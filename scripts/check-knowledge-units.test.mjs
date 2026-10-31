import test from 'node:test';
import assert from 'node:assert/strict';
import { checkUnits, checkCoverageMap, REQUIRED } from './check-knowledge-units.mjs';
const values = { Contexto: 'interface web', Estados: 'normal, erro', Método: 'inspeção', 'Prioridade padrão': 'P2', 'Dependência externa': 'não aplicável', Fonte: 'não verificada' };
const unit = (overrides = {}) => '### UXK-CHK-001 — Exemplo\n' + REQUIRED.map(k => `- **${k}:** ${Object.hasOwn(overrides, k) ? overrides[k] : values[k] ?? 'valor sintético'}`).join('\n') + '\n';
test('accepts complete units and rejects missing, invalid, or duplicate fields and IDs', () => {
  assert.deepEqual(checkUnits(unit()).errors, []);
  assert.ok(checkUnits(unit({ Contexto: '' })).errors.length);
  assert.ok(checkUnits(unit({ Método: 'inventado' })).errors.length);
  assert.ok(checkUnits(unit({ Método: 'hipótese', 'Prioridade padrão': 'P0' })).errors.length);
  assert.ok(checkUnits(unit({ Contexto: '[comercial]', 'Dependência externa': 'não aplicável' })).errors.length);
  assert.ok(checkUnits(unit() + unit()).errors.length);
  assert.ok(checkUnits(unit({ Estados: 'desconhecido' })).errors.length);
  assert.ok(checkUnits(unit({ Fonte: 'alegação sem verificação' })).errors.length);
  assert.ok(checkUnits(unit().replace('UXK-CHK-001', 'UXK-BAD-001')).errors.length);
});
test('coverage references existing IDs rather than inventing evidence', () => {
  const known = new Set(['UXK-CHK-001']);
  assert.deepEqual(checkCoverageMap('| checkout | orientação: UXK-CHK-001 |', known), []);
  assert.ok(checkCoverageMap('| checkout | orientação: sem unidade |', known).length);
  assert.ok(checkCoverageMap('| checkout | teste: UXK-CHK-002 |', known).length);
  assert.ok(checkCoverageMap('| checkout | orientação UXK-CHK-001 |', known).length);
  assert.ok(checkCoverageMap('| Checkout and payment | covered |', known).length);
});
