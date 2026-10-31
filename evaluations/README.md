# Skill routing evaluations

`routing-cases.json` contains 12 positive/negative cases per skill, including nearby requests that should go to the other skill. These test **lead skill selection**, not automatic helper use during a handoff.

The scorer is executable. Agent activation itself must be observed in real runs; the scorer does not call a model or fabricate responses. No activation accuracy is claimed until such a run is recorded. Keep evaluation runs under `.audit/` and use synthetic projects.

## Record a run

Use the same agent configuration, available skills, and source commit for every case. Start a clean context per case, present the prompt without its expected label, and record whether the candidate skill became the lead. Do not derive `triggered` from the labels in this dataset. Record an unexpected result as observed.

The input JSON has this structure; `decisions` must contain exactly one boolean observation for every case ID:

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

The scorer writes `routing-score.json`, counts false positives and false negatives per skill, and exits 1 if either skill is below the 90% target. It exits 2 for invalid/incomplete runs. A scored run is a routing benchmark, not proof of implementation quality or generalization beyond these prompts.
