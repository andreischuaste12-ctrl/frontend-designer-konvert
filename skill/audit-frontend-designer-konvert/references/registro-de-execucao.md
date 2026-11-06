# Execution record and acceptance gate

Each skill records only what it actually inspected, decided, could not do, and verified. Save `execution-record.json` in the target project's ignored `.audit/` directory or another authorized private location. The record is for review, not telemetry. Do not store the original prompt, credentials, account identifiers, raw URLs, customer content, screenshots, or absolute personal paths in it. Keep screenshots and other evidence separate, access-controlled, and reviewed before sharing.

The record has `schema_version: 1`, the selected `skill`, the source repository `source_commit` (or `unavailable` if it cannot be determined), `scope.tasks` and `scope.areas`, plus lists named `inspections`, `decisions`, `blocked_actions`, `verification`, and `limitations`. An inspection records area, state, viewport, `observed`/`blocked`/`not_observed`, and evidence or the reason for a gap. A decision records its basis. A verification records a `criterion_id`, `passed`/`failed`/`blocked`/`not_run`, and evidence or reason. See the synthetic [example](../examples/execution-record.example.json).

For the auditor, record a failed browser preflight as a limitation and mark affected visual inspections `blocked` or `not_observed`; do not write temporary runtime paths into the record. A successful preflight alone is not evidence that a page or state was inspected.

Validate the record before delivery:

```bash
node .agents/skills/audit-frontend-designer-konvert/scripts/validate-execution-record.mjs .audit/execution-record.json
```

For an executor run based on an approved audit report, also gate each independently authorized finding ID:

```bash
node .agents/skills/audit-frontend-designer-konvert/scripts/validate-execution-record.mjs .audit/execution-record.json --report .audit/audit-report.json --approved-ids UX-003
```

The second command requires a `passed` verification entry with evidence for each supplied implementable ID, and a `blocked` entry with a reason for any supplied ID that remains blocked in the report (such as a pending external dependency); at least one supplied ID must be implementable. It rejects IDs absent from the report, blocked findings marked `passed` or omitted, and verification entries for unapproved findings. The agent must confirm the IDs against the user's authorization; this script cannot authenticate it. This is a structural gate: a human still reviews the before/after render, the acceptance criteria, and whether the evidence is genuine. A failure or blocked check stays visible in the record; fix the product or report the limit rather than claiming a pass.

The Git commit identifies the version of the skills and knowledge base used. Per-file knowledge versions and model compatibility claims are deferred until observed agent runs show a need. Evaluation metadata separately records model, agent version, source commit, and run date. No agent result is implied by this example or by CI.
