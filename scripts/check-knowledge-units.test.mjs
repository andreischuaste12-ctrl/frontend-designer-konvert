import test from 'node:test';
import assert from 'node:assert/strict';
import { checkUnits, checkCoverageMap, checkSpecificity, isVerifiedSource, REQUIRED } from './check-knowledge-units.mjs';

const values = {
  Contexto: 'interface web · todas as stacks',
  Estados: 'normal, erro',
  'Quando se aplica': 'formulário sintético com campo de e-mail',
  'Exceções': 'campo único de busca',
  'Evidência a coletar': 'captura sintética em 375 px',
  Método: 'inspeção',
  'Prioridade padrão': 'P2',
  'Recomendação': 'Mostrar rótulo visível fora do placeholder.',
  'Critério de aceite': 'Com o campo preenchido, o texto identificador continua na tela e o axe não acusa violação.',
  Preservar: 'nomes de campos sintéticos',
  'Dependência externa': 'não aplicável',
  'Métrica a monitorar': 'erros sintéticos por campo',
  Fonte: 'não verificada',
};
const unit = (overrides = {}, id = 'UXK-CHK-001') => `### ${id} — Exemplo\n` + REQUIRED.map(k => `- **${k}:** ${Object.hasOwn(overrides, k) ? overrides[k] : values[k]}`).join('\n') + '\n';
const verified = 'WCAG 2.2 SC 3.3.2 — github.com/w3c/wcag@9b94e18 · verificado em 2026-10-31 · revisão: sintética';

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

test('a verified source needs a date and a commit or URL', () => {
  assert.equal(isVerifiedSource(verified), true);
  assert.equal(isVerifiedSource('WCAG · verificado em 2026-10-31'), false);
  assert.ok(checkUnits(unit({ Fonte: 'WCAG · verificado em 2026-10-31' })).errors.some((e) => /commit or URL/.test(e)));
  assert.deepEqual(checkUnits(unit({ Fonte: verified })).errors, []);
});

test('rejects an acceptance criterion that only restates the recommendation', () => {
  const restated = unit({ 'Recomendação': 'Revisar resumo e condições aprovadas.', 'Critério de aceite': 'No estado normal, a interface deve revisar resumo e condições aprovadas.' });
  assert.ok(checkUnits(restated).errors.some((e) => /restates the recommendation/.test(e)));
});

test('rejects template text copied between units', () => {
  const { units } = checkUnits(unit() + unit({}, 'UXK-CHK-002'));
  const errors = checkSpecificity(units);
  assert.ok(errors.some((e) => /UXK-CHK-002 repeats "Exceções" from UXK-CHK-001/.test(e)));
  const distinct = checkUnits(unit() + unit(Object.fromEntries(['Quando se aplica', 'Exceções', 'Evidência a coletar', 'Recomendação', 'Critério de aceite', 'Preservar', 'Métrica a monitorar'].map((k) => [k, `${values[k]} diferente`])), 'UXK-CHK-002'));
  assert.deepEqual(checkSpecificity(distinct.units), []);
});

test('coverage references existing IDs rather than inventing evidence', () => {
  const known = new Set(['UXK-CHK-001']);
  assert.deepEqual(checkCoverageMap('| checkout | orientação: UXK-CHK-001 |', known), []);
  assert.ok(checkCoverageMap('| checkout | orientação: sem unidade |', known).length);
  assert.ok(checkCoverageMap('| checkout | orientação: UXK-CHK-002 |', known).length);
  assert.ok(checkCoverageMap('| checkout | orientação UXK-CHK-001 |', known).length);
  assert.ok(checkCoverageMap('| Checkout and payment | covered |', known).length);
  assert.ok(checkCoverageMap('| checkout | teste: UXK-CHK-001 |', known).some((e) => /not claimed yet/.test(e)));
});

test('stack cells need a unit for that stack, state cells need the state, verification needs a verified source', () => {
  const generic = checkUnits(unit({ Fonte: verified })).units;
  const shopify = checkUnits(unit({ Contexto: 'checkout · Shopify', Fonte: verified }, 'UXK-CHK-101')).units;
  const known = new Map([...generic, ...shopify]);
  const stackHeader = '| Journey | Shopify | VTEX IO |\n| --- | --- | --- |\n';
  assert.deepEqual(checkCoverageMap(stackHeader + '| Checkout and payment | verificação: UXK-CHK-101 | não se aplica |', known), []);
  assert.ok(checkCoverageMap(stackHeader + '| Checkout and payment | verificação: UXK-CHK-001 | — |', known).some((e) => /does not name Shopify/.test(e)));
  const stateHeader = '| Journey | Normal | Loading |\n| --- | --- | --- |\n';
  assert.deepEqual(checkCoverageMap(stateHeader + '| Checkout and payment | verificação: UXK-CHK-001 | — |', known), []);
  assert.ok(checkCoverageMap(stateHeader + '| Checkout and payment | — | verificação: UXK-CHK-001 |', known).some((e) => /does not list state carregando/.test(e)));
  assert.ok(checkCoverageMap(stateHeader + '| Checkout and payment | não se aplica | — |', known).some((e) => /invalid journey cell/.test(e)));
  const unverified = checkUnits(unit()).units;
  assert.ok(checkCoverageMap(stateHeader + '| Checkout and payment | verificação: UXK-CHK-001 | — |', unverified).some((e) => /source is not verified/.test(e)));
  assert.deepEqual(checkCoverageMap(stateHeader + '| Checkout and payment | orientação: UXK-CHK-001 | — |', unverified), []);
});
