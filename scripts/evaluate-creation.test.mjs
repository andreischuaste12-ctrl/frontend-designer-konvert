import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCreationCases, validateCreationProvenance, scoreCreation } from './evaluate-creation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await fs.readFile(path.join(root, 'evaluations/creation-quality/cases.json'), 'utf8'));

function perfectRuns() {
  const criteria = Object.fromEntries(data.dimensions.map((d) => [d, { status: 'passed', evidence: 'Capturas e estilos medidos em 320, 375 e 1440 px.' }]));
  return data.cases.flatMap((item) => [1, 2, 3].map((repetition) => ({
    caseId: item.id, repetition, deliveryValid: true, unsupportedClaims: 0, criteria: structuredClone(criteria),
  })));
}

test('the creation case file is valid and covers the three required scenarios', () => {
  assert.deepEqual(validateCreationCases(data), []);
  assert.deepEqual(data.cases.map((c) => c.id), ['service-landing', 'catalog-filters', 'dashboard-states']);
});

test('a complete graded creation run passes and blocked criteria require explicit reasons', () => {
  const scored = scoreCreation(data, perfectRuns());
  assert.equal(scored.passed, true);
  assert.equal(scored.overall.criterionPassRate, 1);
  const withBlocked = perfectRuns();
  withBlocked[0].criteria.keyboardUse = { status: 'blocked', reason: 'Sem ambiente interativo autorizado.' };
  assert.equal(scoreCreation(data, withBlocked).overall.blockedCriteria, 1);
  assert.throws(() => {
    const bad = perfectRuns();
    bad[0].criteria.keyboardUse = { status: 'passed', evidence: '' };
    scoreCreation(data, bad);
  }, /requires evidence/);
});

test('creation scorer rejects invalid deliveries, single-case collapse, and held_out claims on calibration cases', () => {
  const collapsed = perfectRuns();
  for (const run of collapsed.filter((r) => r.caseId === 'dashboard-states')) {
    run.criteria.functionalCompletion = { status: 'failed' };
    run.criteria.renderedResponsiveness = { status: 'failed' };
  }
  const result = scoreCreation(data, collapsed);
  assert.equal(result.passed, false);
  assert.ok(result.failures.some((f) => f.startsWith('dashboard-states:')));
  assert.throws(() => validateCreationProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: true }), /calibration material/);
  assert.equal(validateCreationProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: false }), 'held_out');
});
