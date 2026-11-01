# Contributing

Keep changes focused on a reproducible user problem. Explain the affected skill, expected behavior, observed result, and validation. Use synthetic examples and do not include customer data, credentials, or third-party captures without redistribution rights.

## Local checks

```bash
npm run setup:tools
npm run doctor -- --browser
npm test
npm run check:browser
```

If Chromium is unavailable, use `npm run setup:browser` or configure a system browser and repeat the diagnostic. Root unit checks need no installed packages; the full browser suite requires both pinned tooling packages. Use `npm run knowledge:review` for source review work and the [evaluation preparation guide](docs/evaluation-preparation.md) for clean agent workspaces. Prepared templates and green tooling checks are never performance results.

Add regression tests for changed detector, comparison, privacy, report-contract, or scoring behavior. A change to the report schema needs a new `schema_version`, a migration rule in `validate-report.mjs`, and updates to the example, the evaluation report, and both skills' contract documents.

Evaluation fixtures must not reveal their answer key: no comments, file names, or text that point to the planted issues. Change `evaluations/audit-quality/cases.json` and the fixture together, and record a new run afterwards. Documentation-only changes need repository validation. Browser tests use loopback fixtures, not production sites. CI checks Linux and Windows; a configured job is not evidence that a particular run passed.

## Skill quality

The frontmatter name must match the directory. Descriptions must fit within 1,024 characters; keep each SKILL.md under 500 lines and move detail to linked modules. Keep relative links valid. State what was measured, inferred, assumed, and not verified. Do not claim a model activation accuracy without actual recorded evaluation decisions.

Language convention: repository-level files (README, docs, CHANGELOG, CONTRIBUTING) and each skill's frontmatter `description` are in English, which keeps discovery metadata uniform. Everything the agent reads while running a skill (SKILL.md body, `knowledge-base/`, `references/`, `examples/`) is in Portuguese. JSON report keys stay in English because they form the schema. Avoid breaking installed skill names or moving scripts without a migration path.

## Release checks

Review privacy and compatibility changes, update CHANGELOG.md, run the required checks, and inspect the CI results for the intended commit. Record breaking changes and migration instructions before tagging a release. Package versions describe the tooling; a repository release must state which skills and scripts it contains. Do not claim Windows compatibility from a Linux-only local run.
