# Skill evaluations

Three evaluations answer different questions. None of them calls a model: an agent run is observed, recorded, and then scored by a script. No result has been recorded yet, so no routing accuracy, audit quality, or handoff compliance is claimed.

| Evaluation | Question | Scored by | Deterministic? |
| --- | --- | --- | --- |
| Routing | Does the right skill lead for a prompt? | `scripts/evaluate-routing.mjs` | Scoring yes; decisions observed |
| Audit quality | Does the auditor find the issues that matter, without inventing problems or evidence? | `scripts/evaluate-audit.mjs` | Scoring yes; matching graded by a person |
| Handoff scope | Does the executor change only what was approved and unblocked? | `scripts/check-handoff-scope.mjs` | Yes, at file level |

Use the same agent configuration, installed skills, and source commit for every case in a run. Keep run artifacts under `.audit/` and record the source commit; scores from different case sets are not comparable.

## Reference availability

The optional `Reference availability` workflow checks public catalog and study links with HTTP HEAD and records each check time in the job summary. A successful response does not verify the content, publication details, or scientific claims. A 403 or 429 means restricted, not definitively broken; connection errors and unsupported network environments are inconclusive. It never deletes or changes links. The checker refuses to run when a proxy is configured because it cannot safely enforce its connection policy through a proxy.

## Routing

`routing-cases.json` contains 24 cases per skill: 12 in English and 12 in Brazilian Portuguese, balanced between positive and negative examples, including nearby requests that belong to the other skill. They test **lead skill selection**, not helper use during a handoff.

Start a clean context per case, present the prompt without its expected label, and record whether the candidate skill became the lead. Do not derive `triggered` from the labels. The input JSON must contain exactly one boolean observation for every case ID:

```json
{
  "model": "actual-model-used",
  "agentVersion": "actual-agent-version",
  "sourceCommit": "actual-source-commit",
  "executedAt": "actual-run-date",
  "decisions": [{ "id": "audit-01", "triggered": true }]
}
```

The example is intentionally incomplete and will be rejected. Avoid account IDs, machine paths, session IDs, and personal data in metadata.

```bash
node scripts/evaluate-routing.mjs --results .audit/routing-run.json
```

The scorer writes `routing-score.json`, counts false positives and false negatives per skill, and exits 1 if either skill is below 90%. It exits 2 for invalid or incomplete runs.

## Audit quality

`audit-quality/cases.json` describes six synthetic projects in `fixtures/`: a product page (`loja`), a SaaS pricing page (`saas`), an accounting firm homepage (`institucional`), and three static previews with Shopify, WordPress, and React/Tailwind marker files. The marker fixtures are not functioning platform installations and do not prove platform integration. Each case lists:

- `expected`: issues planted in the fixture, with the priority and the evidence a good audit should cite;
- `decoys`: legitimate design choices that a weak audit tends to flag as problems;
- `preserve`: contracts and content the report should protect.

The fixtures contain no hints, but the case file is the answer key. **The audited agent must never see `evaluations/`.**

1. Copy one fixture to an empty directory outside this repository and initialize Git there with `.audit/` ignored.
2. Install both skills in that directory, start a clean agent context, and send only the case `brief`. Serve the fixture on loopback (for example `python3 -m http.server 8000 --bind 127.0.0.1`) if rendered evidence is wanted.
3. Collect `audit-report.json` and `audit-report.md`, then run the auditor's `validate-report.mjs` with `--markdown`; record whether it passed.
4. Grade against the case file, deciding each match before reading the next finding:
   - match a finding to an expected issue only if it identifies the same problem in the same place (one finding per issue);
   - list as `validExtra` findings that describe a real, evidenced problem not in the key;
   - list in `decoysFlagged` every decoy reported as a problem;
   - list in `preserveCovered` the preserve items present in the report;
   - count in `unsupportedClaims` statements of measurements, captures, or user research that did not happen.
5. Repeat at least three times per case (`minRepetitions`); model output varies between runs.

```json
{
  "model": "actual-model-used",
  "agentVersion": "actual-agent-version",
  "sourceCommit": "actual-source-commit",
  "executedAt": "actual-run-date",
  "grader": "role of the person who graded",
  "runs": [{
    "caseId": "loja", "repetition": 1, "reportValid": true, "findingsTotal": 8,
    "matches": [{ "expected": "E1", "finding": "UX-001", "priority": "P1" }],
    "validExtra": [], "decoysFlagged": [], "preserveCovered": ["P1"], "unsupportedClaims": 0
  }]
}
```

```bash
node scripts/evaluate-audit.mjs --results .audit/audit-quality-run.json
```

The scorer micro-averages critical recall (P0–P1), overall recall, precision, decoy flag rate, preserve coverage, and priority agreement (within one level), reports per-issue detection rates, and exits 1 when any target in `cases.json` is missed. It exits 2 for inconsistent grading, such as a finding counted twice or fewer repetitions than required. The key covers what the fixtures were built to contain; an auditor can find other valid problems, which is why `validExtra` exists.

## Handoff scope

`handoff/loja.json` pairs the `loja` fixture with `handoff/loja-report.json`, a report whose findings cover every state: approved without a dependency, approved with a resolved dependency, approved but blocked by a pending dependency, and not approved. Each finding is mapped to disjoint files, and `js/cart.js` (tracking and checkout) is protected.

1. Copy the fixture to an empty directory outside the repository, initialize Git with `.audit/` ignored, copy `handoff/loja-report.json` to `.audit/audit-report.json` there, install both skills, and give the agent only the case `brief`.
2. After the executor finishes, run:

```bash
node scripts/check-handoff-scope.mjs --case evaluations/handoff/loja.json --after <executed-copy>
```

It hashes the pristine fixture and the executed copy, then exits 0 only if every changed file belongs to an implementable finding (`LOJA-001`, `LOJA-002`) and each of those findings changed something. Changes to protected files, to files of blocked findings, or to unmapped files are violations (exit 1). The check is file-level: it proves scope discipline, not that the change satisfies the acceptance criteria. Verify those with the executor's before/after captures and `compare.mjs`.
