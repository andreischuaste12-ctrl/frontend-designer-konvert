import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateExecutionRecord, validateAcceptance } from '../skills/audit-frontend-designer-konvert/scripts/validate-execution-record.mjs';

const recordUrl = new URL('../skills/audit-frontend-designer-konvert/examples/execution-record.example.json', import.meta.url);
const reportUrl = new URL('../skills/audit-frontend-designer-konvert/examples/audit-report.example.json', import.meta.url);
const load = async (url) => JSON.parse(await fs.readFile(url, 'utf8'));

test('synthetic execution record and approved finding satisfy the structural gate', async () => {
  const record = await load(recordUrl);
  const report = await load(reportUrl);
  assert.deepEqual(validateExecutionRecord(record), { errors: [], warnings: [] });
  assert.deepEqual(validateAcceptance(record, report, ['UX-003']), []);
});

test('record rejects unneeded private data and unsupported fields', async () => {
  const record = await load(recordUrl);
  record.prompt = 'a private prompt';
  record.scope.areas = ['https://private.example.test/account'];
  record.decisions[0].basis = 'person@example.test';
  const { errors } = validateExecutionRecord(record);
  assert.ok(errors.some((e) => /unsupported field/.test(e)));
  assert.ok(errors.some((e) => /raw URL/.test(e)));
  assert.ok(errors.some((e) => /email address/.test(e)));
  assert.ok(errors.every((e) => !e.includes('person@example.test')));
});

test('acceptance gate rejects missing, blocked and unapproved findings', async () => {
  const record = await load(recordUrl);
  const report = await load(reportUrl);
  assert.ok(validateAcceptance(record, report, []).some((e) => /approved-ids/.test(e)));
  assert.ok(validateAcceptance(record, report, ['UX-001']).some((e) => /not implementable/.test(e)));
  assert.ok(validateAcceptance(record, report, ['UX-999']).some((e) => /absent/.test(e)));
  record.verification[0].status = 'not_run';
  record.verification[0].reason = 'No browser available';
  assert.ok(validateAcceptance(record, report, ['UX-003']).some((e) => /lacks a passed/.test(e)));
  record.verification[0].criterion_id = 'UX-001';
  assert.ok(validateAcceptance(record, report, ['UX-003']).some((e) => /unapproved/.test(e)));
  const mixed = await load(recordUrl);
  mixed.verification.push({ criterion_id: 'UX-001', status: 'blocked', reason: 'Pending shipping rules from product owner' });
  assert.deepEqual(validateAcceptance(mixed, report, ['UX-003', 'UX-001']), []);
  mixed.verification[1].status = 'passed';
  mixed.verification[1].evidence = 'Claimed pass despite pending dependency';
  assert.ok(validateAcceptance(mixed, report, ['UX-003', 'UX-001']).some((e) => /UX-001 is not implementable/.test(e)));
});
