# Evidence before expansion

Tooling tests demonstrate behavior of scripts and contracts. They do not measure agent routing, audit quality, creation quality, or user outcomes. All those outcomes remain unmeasured until independently executed runs are recorded. Do not publish a new stable release on the strength of green tooling checks alone.

## First baseline

Use the protocol in [evaluations](../evaluations/README.md): 72 routing prompts and seven audit fixtures, with at least three repetitions per audit fixture (21 reports). Freeze source commit, installed skills, model, configuration, and case revision. Keep the agent away from answer keys and use a clean session for each run. A session that read the labels or planted issues cannot produce a blind result for those cases.

Report denominators, per-case results, repetition variation, critical and overall recall, precision, false positives, unsupported claims, preserve coverage, declared gaps, silent omissions, and report validity. Include the weakest scenario; aggregate passing scores are not proof that every scenario is usable. Keep existing thresholds until a baseline and grading consistency justify changing them.

Grade a representative sample independently twice, before reconciling disagreements. Record the rubric version and the reason for reconciliation. Valid extra findings require reproducible evidence. Publish only sanitized aggregates, configuration identifiers, source commit, and limitations; raw sessions and captures stay private.

## Workflow and creation observations

Evaluate workflow separately from lead-skill routing. For audit-and-fix requests, record stage order, whether the audit changed source files, which IDs the operator independently approved, dependency blocks, files changed, and before/after acceptance evidence. For direct refinement, check that an unnecessary audit was not imposed. Require zero changes outside the independently approved scope; a file-level scope pass does not prove the requested behavior works.

For creation, use at least three clean briefs: a service landing page, a catalog with filters, and a dashboard with loading, empty, error, and recovery states. Define required content, tasks, viewports, constraints, and legitimate visual choices before running the agent. Grade functional completion, brief adherence, content accuracy, rendered responsiveness, keyboard use, and visual coherence separately. Save evidence per criterion and report blocked checks. These are evaluation requirements, not completed runs.

Do not label every `href="#"`, button without an inline handler, or target below 24 pixels as an automatic defect. Framework event delegation, navigation conventions, target spacing exceptions, and contextual behavior require inspection. Capture and style JSON are signals; artifact presence alone cannot prove acceptance, contrast conformance, or successful interaction.

## Knowledge and distribution

Run `node scripts/check-knowledge-units.mjs` for current totals. A recorded source consultation, a technical execution, and an observed user outcome are different claims. Preserve historical changelog counts as history. Do not promote editorial guidance to verified source consultation by merely inserting a date. Record the supporting source section, consultation date, review status, and scope of the claim when an actual review occurs.

After observed failures have been addressed and rerun, prepare a versioned release containing all three skills. Until then, `main` is a moving development version and `v0.1.0` retains its original two-skill contents. Pin a reviewed commit for reproducible development installs; never refer to an unpublished tag as available.
