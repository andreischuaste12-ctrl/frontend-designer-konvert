import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreRouting } from './evaluate-routing.mjs';

const cases = [
  { id: 'audit-positive', skill: 'frontend-designer', shouldTrigger: true },
  { id: 'audit-negative', skill: 'frontend-designer', shouldTrigger: false },
  { id: 'reference-positive', skill: 'design-por-referencia-konvert', shouldTrigger: true },
];
test('records false positives and false negatives separately by skill', () => {
  const report = scoreRouting(cases, [
    { id: 'audit-positive', triggered: true }, { id: 'audit-negative', triggered: true }, { id: 'reference-positive', triggered: false },
  ]);
  assert.equal(report.correct, 1);
  assert.equal(report.skills['frontend-designer'].falsePositive, 1);
  assert.equal(report.skills['frontend-designer'].accuracy, 0.5);
  assert.equal(report.skills['design-por-referencia-konvert'].falseNegative, 1);
});
test('cannot produce an accuracy from partial, duplicated, or unknown decisions', () => {
  assert.throws(() => scoreRouting(cases, []), /Every case/);
  assert.throws(() => scoreRouting(cases, [{ id: 'unknown', triggered: true }]), /Unknown/);
  assert.throws(() => scoreRouting(cases, [{ id: 'audit-positive', triggered: true }, { id: 'audit-positive', triggered: false }]), /duplicate/);
});
