import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { scoreRouting } from './evaluate-routing.mjs';

const cases = [
  { id: 'audit-positive', skill: 'audit-frontend-designer-konvert', shouldTrigger: true },
  { id: 'audit-negative', skill: 'audit-frontend-designer-konvert', shouldTrigger: false },
  { id: 'reference-positive', skill: 'design-por-referencia-konvert', shouldTrigger: true },
];
test('records false positives and false negatives separately by skill', () => {
  const report = scoreRouting(cases, [
    { id: 'audit-positive', triggered: true }, { id: 'audit-negative', triggered: true }, { id: 'reference-positive', triggered: false },
  ]);
  assert.equal(report.correct, 1);
  assert.equal(report.skills['audit-frontend-designer-konvert'].falsePositive, 1);
  assert.equal(report.skills['audit-frontend-designer-konvert'].accuracy, 0.5);
  assert.equal(report.skills['design-por-referencia-konvert'].falseNegative, 1);
});
test('cannot produce an accuracy from partial, duplicated, or unknown decisions', () => {
  assert.throws(() => scoreRouting(cases, []), /Every case/);
  assert.throws(() => scoreRouting(cases, [{ id: 'unknown', triggered: true }]), /Unknown/);
  assert.throws(() => scoreRouting(cases, [{ id: 'audit-positive', triggered: true }, { id: 'audit-positive', triggered: false }]), /duplicate/);
});

test('routes audit-and-fix through read-only audit before approved handoff', () => {
  const routingCases = JSON.parse(fs.readFileSync(new URL('../evaluations/routing-cases.json', import.meta.url), 'utf8'));
  for (const id of ['audit-06', 'audit-pt-06']) {
    const item = routingCases.find((entry) => entry.id === id);
    assert.equal(item.skill, 'audit-frontend-designer-konvert');
    assert.equal(item.shouldTrigger, true);
    assert.deepEqual(item.expectedFlow, ['audit-frontend-designer-konvert', 'design-por-referencia-konvert']);
    assert.equal(item.handoffRequiresUserApproval, true);
  }
});

test('routes direct visual reproduction straight to the executor', () => {
  const routingCases = JSON.parse(fs.readFileSync(new URL('../evaluations/routing-cases.json', import.meta.url), 'utf8'));
  for (const id of ['reference-02', 'reference-pt-02']) {
    const item = routingCases.find((entry) => entry.id === id);
    assert.equal(item.skill, 'design-por-referencia-konvert');
    assert.equal(item.shouldTrigger, true);
    assert.deepEqual(item.expectedFlow, ['design-por-referencia-konvert']);
  }
});
