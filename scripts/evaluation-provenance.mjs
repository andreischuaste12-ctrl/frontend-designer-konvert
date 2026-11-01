// Metadata checks preserve evidence identity; they cannot authenticate a grader or a model run.
import { createHash } from 'node:crypto';

export function containsExposedCases(candidate, calibration) {
  const normalize = (value) => String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  const known = Array.isArray(calibration) ? calibration : calibration.cases;
  const items = Array.isArray(candidate) ? candidate : candidate.cases;
  const briefs = new Set(known.map((item) => normalize(item.brief ?? item.prompt)));
  const fixtures = new Set(known.map((item) => item.fixture).filter(Boolean));
  return items.some((item) => briefs.has(normalize(item.brief ?? item.prompt)) || (item.fixture && fixtures.has(item.fixture)));
}

export function candidateProvenance(run, scorerSupportRaw = '') {
  const validHash = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
  if (run.sourceDirty !== undefined && typeof run.sourceDirty !== 'boolean') throw new Error('sourceDirty must be a boolean when supplied.');
  if (run.candidateSkillsSha256 !== undefined && !validHash(run.candidateSkillsSha256)) throw new Error('Candidate skills need a SHA-256 fingerprint.');
  if (run.sourceDirty === true && !validHash(run.candidateSkillsSha256)) throw new Error('A dirty source commit requires the exact candidate skills fingerprint.');
  const support = run.fingerprints?.scorerSupportSha256;
  if (support !== undefined && !validHash(support)) throw new Error('Scorer support needs a SHA-256 fingerprint.');
  if (support && scorerSupportRaw && support.toLowerCase() !== createHash('sha256').update(scorerSupportRaw).digest('hex')) throw new Error('Scorer support fingerprint does not match.');
  return {
    sourceDirty: run.sourceDirty ?? null,
    candidateSkillsSha256: run.candidateSkillsSha256?.toLowerCase() ?? null,
    fingerprints: run.fingerprints ? { casesSha256: run.fingerprints.casesSha256.toLowerCase(), scorerSha256: run.fingerprints.scorerSha256.toLowerCase(), ...(support ? { scorerSupportSha256: support.toLowerCase() } : {}) } : null,
  };
}
