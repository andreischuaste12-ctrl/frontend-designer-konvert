import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { containsExposedCases, candidateProvenance } from './evaluation-provenance.mjs';
import { validateAuditProvenance } from './evaluate-audit.mjs';
import { validateCreationProvenance } from './evaluate-creation.mjs';
import { validateRoutingProvenance } from './evaluate-routing.mjs';

test('copied calibration cases remain exposed after reformatting, renaming, or selecting a subset', () => {
  const calibration = { cases: [{ id: 'known', brief: 'Audit this page.', fixture: 'fixtures/known' }, { id: 'other', brief: 'Build a page.' }] };
  assert.equal(containsExposedCases({ cases: [{ id: 'renamed', brief: 'Audit  this\npage.' }] }, calibration), true);
  assert.equal(containsExposedCases({ cases: [{ brief: 'Changed prompt.', fixture: 'fixtures/known' }] }, calibration), true);
  assert.equal(containsExposedCases({ cases: [{ brief: 'Entirely new independent brief.' }] }, calibration), false);
});

test('all scorers reject altered input fingerprints and malformed provenance without rejecting legacy calibration runs', () => {
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  for (const validate of [validateAuditProvenance, validateCreationProvenance, validateRoutingProvenance]) {
    assert.equal(validate(null), 'calibration');
    assert.throws(() => validate({ datasetRole: 'unknown' }), /datasetRole/);
    assert.throws(() => validate({ datasetRole: 'held_out' }), /calibration/);
    assert.equal(validate({ datasetRole: 'held_out' }, { isExposedCalibrationSet: false }), 'held_out');
    for (const fingerprints of [null, 'invalid', {}, { casesSha256: 'a'.repeat(64) }, { casesSha256: 'bad', scorerSha256: 'b'.repeat(64) }]) {
      assert.throws(() => validate({ fingerprints }), /fingerprints/);
    }
    const casesRaw = JSON.stringify({ cases: [] });
    const fingerprints = { casesSha256: hash(casesRaw).toUpperCase(), scorerSha256: hash('scorer').toUpperCase() };
    assert.equal(validate({ fingerprints }, { casesRaw, scorerRaw: 'scorer' }), 'calibration');
    assert.throws(() => validate({ fingerprints }, { casesRaw: JSON.stringify({ cases: [], changed: true }) }), /casesSha256/);
    assert.throws(() => validate({ fingerprints }, { scorerRaw: 'changed' }), /scorerSha256/);
  }
});

test('score metadata requires an exact candidate fingerprint for dirty sources and preserves only known fields', () => {
  assert.throws(() => candidateProvenance({ sourceDirty: true }), /fingerprint/);
  assert.throws(() => candidateProvenance({ sourceDirty: 'yes' }), /boolean/);
  assert.throws(() => candidateProvenance({ candidateSkillsSha256: 'invalid' }), /SHA-256/);
  assert.throws(() => candidateProvenance({ fingerprints: { scorerSupportSha256: 'invalid' } }), /Scorer support/);
  const supportHash = createHash('sha256').update('source').digest('hex');
  const withSupport = { fingerprints: { casesSha256: 'a'.repeat(64), scorerSha256: 'b'.repeat(64), scorerSupportSha256: supportHash } };
  assert.throws(() => candidateProvenance(withSupport, 'different source'), /does not match/);
  assert.equal(candidateProvenance(withSupport, 'source').fingerprints.scorerSupportSha256, supportHash);
  assert.deepEqual(candidateProvenance({}), { sourceDirty: null, candidateSkillsSha256: null, fingerprints: null });
  const h = 'A'.repeat(64);
  assert.deepEqual(candidateProvenance({ sourceDirty: true, candidateSkillsSha256: h, fingerprints: { casesSha256: h, scorerSha256: h, private: 'omit' } }), {
    sourceDirty: true, candidateSkillsSha256: h.toLowerCase(), fingerprints: { casesSha256: h.toLowerCase(), scorerSha256: h.toLowerCase() },
  });
});
