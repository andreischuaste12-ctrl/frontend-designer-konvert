import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAuditCases, scoreAudit } from './evaluate-audit.mjs';

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
