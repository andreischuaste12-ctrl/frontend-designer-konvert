import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAuditCases, scoreAudit, validateAuditProvenance } from './evaluate-audit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await fs.readFile(path.join(root, 'evaluations/audit-quality/cases.json'), 'utf8'));

function perfectRuns() {
  return data.cases.flatMap((item) => [1, 2, 3].map((repetition) => ({
    caseId: item.id, repetition, reportValid: true, findingsTotal: item.expected.length, unsupportedClaims: 0,
    matches: item.expected.map((e, i) => ({ expected: e.id, finding: `F-${String(i + 1).padStart(3, '0')}`, priority: e.priority })),
    validExtra: [], decoysFlagged: [], preserveCovered: item.preserve.map((p) => p.id),
  })));
}

test('the case file is valid and every fixture referenced exists', async () => {
  assert.deepEqual(validateAuditCases(data), []);
  for (const item of data.cases) await fs.access(path.join(root, item.fixture, 'index.html'));
});

test('a perfect graded run passes every target', () => {
  const score = scoreAudit(data, perfectRuns());
  assert.equal(score.passed, true, score.failures.join('; '));
  assert.equal(score.overall.criticalRecall, 1);
  assert.equal(score.cases.loja.detectionRate.E1, 1);
});

test('missed critical issues, flagged decoys, and unsupported claims fail with explicit reasons', () => {
  const runs = perfectRuns().map((run) => ({
    ...run,
    matches: run.matches.filter((m) => !['P0', 'P1'].includes(m.priority)),
    findingsTotal: run.findingsTotal + 2,
    decoysFlagged: data.cases.find((item) => item.id === run.caseId).decoys.map((item) => item.id),
    unsupportedClaims: 1,
  }));
  const score = scoreAudit(data, runs);
  assert.equal(score.passed, false);
  for (const pattern of [/criticalRecall/, /decoyFlagRate/, /unsupportedClaims/]) assert.ok(score.failures.some((f) => pattern.test(f)), String(pattern));
  assert.equal(score.cases.loja.detectionRate.E1, 0);
});

test('priority disagreement beyond one level counts against agreement', () => {
  const runs = perfectRuns().map((run) => ({ ...run, matches: run.matches.map((m) => ({ ...m, priority: 'P3' })) }));
  const score = scoreAudit(data, runs);
  assert.ok(score.overall.priorityAgreement < 1);
});

test('inconsistent grading is rejected instead of scored', () => {
  const base = perfectRuns();
  const variants = [
    base.slice(0, -1),
    base.map((r, i) => i === 0 ? { ...r, matches: [...r.matches, r.matches[0]] } : r),
    base.map((r, i) => i === 0 ? { ...r, matches: [{ expected: 'E99', finding: 'X-001', priority: 'P1' }] } : r),
    base.map((r, i) => i === 0 ? { ...r, findingsTotal: 0 } : r),
    base.map((r, i) => i === 0 ? { ...r, decoysFlagged: ['D9'] } : r),
    base.map((r, i) => i === 0 ? { ...r, repetition: 2 } : r),
    base.map((r, i) => i === 0 ? { ...r, validExtra: [r.matches[0].finding] } : r),
  ];
  for (const runs of variants) assert.throws(() => scoreAudit(data, runs));
});

test('misses are split into declared coverage gaps and silent omissions', () => {
  const runs = perfectRuns();
  const first = runs[0];
  const item = data.cases.find((c) => c.id === first.caseId);
  const [kept, ...dropped] = first.matches;
  runs[0] = { ...first, matches: [kept], findingsTotal: 1, declaredGaps: [dropped[0].expected] };
  const score = scoreAudit(data, runs);
  assert.equal(score.overall.declaredGaps, 1);
  assert.equal(score.overall.silentOmissions, item.expected.length - 2, 'every other miss in that run is silent');
  assert.equal(scoreAudit(data, perfectRuns()).overall.silentOmissions, 0);
  assert.throws(() => scoreAudit(data, [{ ...runs[0], declaredGaps: [kept.expected] }, ...runs.slice(1)]), /declaredGaps/, 'a matched issue cannot also be a gap');
  assert.throws(() => scoreAudit(data, [{ ...runs[0], declaredGaps: ['NOPE'] }, ...runs.slice(1)]), /declaredGaps/);
});

test('invalid reports fail delivery and cannot earn findings or preserve credit', () => {
  const runs = perfectRuns();
  runs[0].reportValid = false;
  const result = scoreAudit(data, runs);
  assert.equal(result.passed, false);
  assert.ok(result.failures.some((f) => f.includes('reportValidRate')));
  assert.ok(result.overall.overallRecall < 1);
  assert.ok(result.overall.precision < 1);
  assert.ok(result.overall.preserveCoverage < 1);
  assert.equal(result.overall.priorityAgreement, 1, 'invalid deliveries do not skew priorityAgreement denominator');
});

test('one collapsed case cannot hide behind perfect results in other cases', () => {
  const runs = perfectRuns();
  for (const run of runs.filter((r) => r.caseId === 'react-preview')) {
    run.matches = []; run.findingsTotal = 0;
  }
  const result = scoreAudit(data, runs);
  assert.ok(result.overall.overallRecall >= data.targets.overallRecall);
  assert.equal(result.cases['react-preview'].overallRecall, 0);
  assert.equal(result.passed, false);
  assert.ok(result.failures.some((f) => f.startsWith('react-preview:')));
  const criticalOnly = perfectRuns();
  for (const run of criticalOnly.filter((r) => r.caseId === 'react-preview')) run.matches = run.matches.filter((m) => m.priority !== 'P1' && m.priority !== 'P0');
  assert.ok(scoreAudit(data, criticalOnly).failures.some((f) => f === 'react-preview: no critical issue detected across its repetitions'));
  assert.ok(validateAuditCases({ ...data, targets: { ...data.targets, requireCaseDetection: 'yes' } }).some((e) => e.includes('requireCaseDetection')));
  assert.throws(() => validateAuditProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: true }), /calibration material/);
  assert.equal(validateAuditProvenance({ datasetRole: 'held_out' }, { isExposedCalibrationSet: false }), 'held_out');
});
