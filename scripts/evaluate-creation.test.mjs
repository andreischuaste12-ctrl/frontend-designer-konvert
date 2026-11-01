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

test('a complete graded creation run passes and blocked criteria fail the gate while preserving denominators', () => {
  const scored = scoreCreation(data, perfectRuns());
  assert.equal(scored.passed, true);
  assert.equal(scored.overall.criterionPassRate, 1);
  const mostlyBlocked = perfectRuns().map((run) => ({
    ...run,
    criteria: Object.fromEntries(data.dimensions.map((d) => [
      d,
      d === 'visualCoherence'
        ? { status: 'passed', evidence: 'Coerente visualmente.' }
        : { status: 'blocked', reason: 'Sem ambiente interativo autorizado.' },
    ])),
  }));
  const blockedResult = scoreCreation(data, mostlyBlocked);
  assert.equal(blockedResult.passed, false);
  assert.equal(blockedResult.overall.blockedCriteria, 45);
  assert.equal(Number(blockedResult.overall.criterionPassRate.toFixed(4)), Number((9 / 54).toFixed(4)));
  assert.ok(blockedResult.failures.some((f) => f.includes('blockedCriteria 45 > 0')));
  assert.ok(blockedResult.failures.some((f) => f.includes('dimension functionalCompletion passRate 0.00 < 0.85')));
  assert.throws(() => {
    const bad = perfectRuns();
    bad[0].criteria.keyboardUse = { status: 'passed', evidence: '' };
    scoreCreation(data, bad);
  }, /requires evidence/);
});

test('creation scorer rejects invalid deliveries, single-case collapse, and copied calibration cases claimed as held_out', () => {
  const collapsed = perfectRuns();
  for (const run of collapsed.filter((r) => r.caseId === 'dashboard-states')) {
    run.criteria.functionalCompletion = { status: 'failed' };
    run.criteria.renderedResponsiveness = { status: 'failed' };
  }
  const result = scoreCreation(data, collapsed);
  assert.equal(result.passed, false);
  assert.ok(result.failures.some((f) => f.startsWith('dashboard-states:')));
  assert.throws(() => validateCreationProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: true }), /calibration material/);
  assert.throws(() => validateCreationProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: false, data: structuredClone(data), exposedData: data }), /calibration material/);
  assert.equal(validateCreationProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: false, data: { cases: [{ id: 'reserved-01', title: 'New reserved case', brief: 'Unique brief' }] }, exposedData: data }), 'held_out');
  assert.throws(() => validateCreationProvenance({ fingerprints: { casesSha256: 'bad', scorerSha256: 'bad' } }), /64-hex/);
});

test('blocked criteria cannot turn a mostly unverified delivery into a passing score', () => {
  const runs = perfectRuns();
  for (const run of runs) {
    for (const dim of data.dimensions.slice(1)) run.criteria[dim] = { status: 'blocked', reason: 'Synthetic unavailable evidence.' };
  }
  const result = scoreCreation(data, runs);
  assert.equal(result.passed, false);
  assert.equal(result.overall.criterionPassRate, 1 / 6);
  assert.equal(result.overall.evaluatedCriterionPassRate, 1);
  assert.ok(Math.abs(result.overall.verificationCoverage - 1 / 6) < 1e-12);
  assert.equal(result.overall.blockedCriteria, 45);
  assert.ok(result.failures.some((f) => f.startsWith('criterionPassRate')));
  assert.ok(result.failures.some((f) => f.startsWith('blockedCriteria')));
  assert.ok(result.failures.some((f) => f.startsWith('dimension keyboardUse')));
});

test('creation validation rejects malformed rubrics and incomplete or inconsistent grades', () => {
  assert.ok(validateCreationCases(null).length);
  const rubricVariants = [
    { minRepetitions: 0 }, { dimensions: [] },
    { targets: { ...data.targets, deliveryValidRate: -1, criterionPassRate: 2, unsupportedClaims: -1, requireCasePass: 'yes' } },
    { cases: [...data.cases, data.cases[0]] },
    { cases: data.cases.map((c) => ({ ...c, title: '', brief: '', viewports: [0], requiredStates: [], requiredTasks: [], constraints: [], legitimateChoices: [] })) },
  ];
  for (const patch of rubricVariants) assert.ok(validateCreationCases({ ...data, ...patch }).length);
  const good = perfectRuns();
  const gradeVariants = [
    [], [{ ...good[0], caseId: 'unknown' }], [good[0], good[0]],
    good.slice(1), good.map((r, i) => i ? r : { ...r, repetition: 0 }),
    good.map((r, i) => i ? r : { ...r, unsupportedClaims: -1 }),
    good.map((r, i) => i ? r : { ...r, criteria: null }),
    good.map((r, i) => i ? r : { ...r, criteria: { ...r.criteria, keyboardUse: { status: 'not_run' } } }),
    good.map((r, i) => i ? r : { ...r, criteria: { ...r.criteria, keyboardUse: { status: 'blocked' } } }),
  ];
  for (const runs of gradeVariants) assert.throws(() => scoreCreation(data, runs));
  const invalid = perfectRuns();
  invalid[0].deliveryValid = false;
  invalid[0].criteria.keyboardUse = { status: 'blocked', reason: 'Not observed.' };
  invalid[1].unsupportedClaims = 1;
  const result = scoreCreation(data, invalid);
  assert.equal(result.passed, false);
  assert.equal(result.overall.blockedCriteria, 1);
  assert.ok(result.overall.failedCriteria >= 5);
});
