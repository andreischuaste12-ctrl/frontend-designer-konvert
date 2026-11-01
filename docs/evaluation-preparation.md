# Prepare an observed skill evaluation

The preparation command creates an external workspace with the current three skills and a synthetic brief. It also freezes input fingerprints and creates an incomplete grading template. It does not call a model, grade itself, or create a passing result. Repository cases remain calibration material, including when copied elsewhere.

## Choose and prepare a case

From the repository, list the supported audit and creation cases:

```bash
npm run evaluation:prepare -- --list
```

Choose a new output directory outside this repository, with an existing parent. For example, after creating a sibling `evaluation-runs` directory:

```bash
node scripts/prepare-evaluation.mjs --kind audit --case loja --out ../evaluation-runs/loja-1
node scripts/prepare-evaluation.mjs --kind creation --case service-landing --out ../evaluation-runs/landing-1
```

Each command creates:

```text
run/
  workspace/                 # Only this directory belongs in the executing agent's environment.
    .agents/skills/           # Installed and structurally verified candidate.
    .audit/                  # Ignored output; created by the executing agent as needed.
  operator/                  # Keep outside the agent's accessible environment.
    prompt.md                # Send this exact task in a new, clean agent session.
    manifest.json            # Calibration role, source revision, dirty flag, input hashes.
    baseline-files.json      # Relative filenames and SHA-256 hashes before execution.
    cases.json               # Frozen case definitions and grading information.
    scorer.mjs               # Frozen scorer source for provenance, not a standalone runner.
    evaluation-provenance.mjs # Frozen scorer support module; fingerprint checked when supplied.
    grading-template.json    # Null metadata/outcomes; rejected by scorers until actually graded.
```

An audit workspace contains only the selected fixture and installed skills. A creation workspace starts without an application. Both have a Git baseline and ignore `.audit/` and `node_modules/`. Existing runs are never overwritten. If preparation fails after creating a run, its new directory is removed.

## Execute in a clean environment

Give a new agent access only to `workspace` and send the contents of `operator/prompt.md`. Use a separate environment or filesystem access boundary: sibling directories alone are **not** a sandbox. Never let the agent inspect the case definitions, scorer, or operator's grading. Do not execute in a development chat that already read those materials.

Serve audit fixtures on loopback when appropriate. The React/Tailwind fixture requires its documented dependency setup; preparation does not install target-project dependencies. Keep outputs private and use synthetic data. Capture states and interactions that actually occurred; report blocked checks honestly.

The manifest records the base Git commit and whether the source was dirty at preparation. `candidateSkillsSha256` identifies the exact installed skill tree; it must accompany a dirty-source result because the base commit alone does not identify that candidate. Prefer a reviewed clean source commit for published comparisons. The operator owns the frozen inputs and should keep them unavailable to the executing agent.

The scorers retain candidate and input fingerprints in their output and require a candidate fingerprint when `sourceDirty` is true. They recognize exposed calibration briefs or fixtures even after copying or reformatting the case file; moving a file does not make it a reserved dataset. These checks support provenance and cannot authenticate a grader's statements.

## Grade observed outputs

An independent reviewer fills the template after execution, recording the actual model, agent version, execution date, grader role, valid delivery, unsupported claims, and evidence. Do not replace nulls with assumed success. Keep fingerprints unchanged; compare them to the actual scorer and case file used. `scorer.mjs` is an archival copy; run the matching repository scorer, which requires its supporting modules.

Prepare and execute each case at least three times (`--repetition 1`, `2`, `3`), using the same candidate and configuration. Merge the observed entries into one results file only after all required cases and repetitions have been graded. A single prepared case is deliberately insufficient for a full score.

```bash
node scripts/evaluate-audit.mjs --results ../evaluation-runs/audit-graded.json --cases ../evaluation-runs/loja-1/operator/cases.json
node scripts/evaluate-creation.mjs --results ../evaluation-runs/creation-graded.json --cases ../evaluation-runs/landing-1/operator/cases.json
```

Creation scoring counts blocked criteria in the total denominator: an unverified requirement cannot improve the pass rate. `evaluatedCriterionPassRate` separately describes the checks that were evaluated, and `verificationCoverage` reports the share actually evaluated. Blocked and failed counts remain visible. Results from before this scoring correction are not directly comparable.

The existing `verifiedCriterionPassRate` field remains available as an alias for the evaluated-only rate. The current case set additionally requires zero blocked criteria and enforces pass rates per dimension; a high aggregate cannot hide an unverified requirement or a collapsed dimension.

Routing and handoff preparation remain manual; use the [evaluation protocol](../evaluations/README.md). A separate evaluator must create new reserved cases before making an independent held-out claim. No new observed skill-performance result is established by workspace preparation or green tooling tests.
