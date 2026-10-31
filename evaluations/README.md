# Skill routing evaluations

`routing-cases.json` contains 24 cases per skill: 12 in English and 12 in Brazilian Portuguese, balanced between positive and negative examples. These include nearby requests that should go to the other skill and test **lead skill selection**, not automatic helper use during a handoff. The separate visual-evaluation proposal inside the reference skill describes manual workflow scenarios, not a second routing benchmark.

The scorer is executable. Agent activation itself must be observed in real runs; the scorer does not call a model or fabricate responses. No activation accuracy is claimed until such a run is recorded. Keep evaluation runs under `.audit/` and use synthetic projects.

## Record a run

Use the same agent configuration, available skills, and source commit for every case. Start a clean context per case, present the prompt without its expected label, and record whether the candidate skill became the lead. Do not derive `triggered` from the labels in this dataset. Record an unexpected result as observed.

When the dataset changes, record a new complete run. Scores from different case sets are not directly comparable; the source commit identifies the evaluated dataset.

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
