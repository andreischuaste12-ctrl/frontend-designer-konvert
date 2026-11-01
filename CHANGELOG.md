# Changelog

Notable changes to the repository are recorded here. The automation package version is tracked separately in `skills/design-por-referencia-konvert/package.json`.

## Unreleased

- Exclude nested editable-control text when sampling outer headings, paragraphs, labels, and interactive wrappers in `extract-styles.mjs` and `capture.mjs`, preserve full criterion denominators and enforce `maxBlockedCriteria: 0` plus per-dimension pass rates in `evaluate-creation.mjs`, detect copied or subsetted calibration cases by content before allowing `held_out` in all evaluators, and validate the full `comparison.json` structure in `check-handoff-scope.mjs`.

### Tooling and evaluation improvements

- Add a cross-platform fresh installer for all three skills, with staged structural validation, no overwrites, cache exclusion, symlink rejection, and rollback of directories created by a failed install.
- Add dependency-free root npm commands and a read-only doctor for Node.js, installed skill structure, pinned Playwright/axe packages, and optional browser launch. Full browser checks reject missing or incompatible packages before running scenarios.
- Add external audit/creation calibration workspace preparation with clean Git baselines, private operator material, frozen case/scorer/candidate fingerprints, and incomplete grading templates. No model run or independent performance result is claimed.
- Add a prioritized knowledge-source review queue without changing source verification or human-review status.
- Fix creation scores that excluded blocked criteria from the pass-rate denominator. Blocked checks now reduce the overall pass rate; evaluated-only rate and verification coverage are reported separately. Earlier scores are not directly comparable.
- Keep copied or reformatted exposed cases classified as calibration in all three scorers, preserve input/candidate fingerprints in results, and require a candidate fingerprint for dirty-source evaluations.
- Measure unit and browser coverage together through `npm run check:coverage` (Node.js 22.8+), selecting a verified browser and retaining the existing 80%/85%/87% minimums.
- Simplify the development quick start and document installation, diagnostics, source review, and observed evaluation preparation. CI also watches the root manifests and diagnoses smoke-test prerequisites.

- Redact rich/custom editable fields and selects in `extract-styles.mjs` (`aria-snapshot.yml`, `computed-styles.json`, `styles-summary.md`), emit `null` contrast when `contrastStatus` is `indeterminado`, sync `capture-index.example.json` with `captureStatus`, and reject incomplete capture indexes in `compare.mjs --pixels`.
- Protect `.audit/audit-report.json` and `.audit/audit-report.md` from modification during handoff, verify behavioral acceptance (`--execution-record`, `--comparison`) in `check-handoff-scope.mjs`, enforce knowledge-provenance states and study metadata in `check-knowledge-units.mjs`, enforce `datasetRole`/`fingerprints` in routing and audit scorers, and add `evaluations/creation-quality/cases.json` + `scripts/evaluate-creation.mjs`.
- Mask rich/custom editable fields and selects in screenshots and control crops; reject internal temporary directories with double-dot-prefixed names.
- Return a failing exit code and capture status for partial or empty browser collection, preserving its diagnostic index.
- Compare sampled opacity, contrast certainty and sample counts, with an explicit limit on the meaning of unchanged.
- Require an explicitly prepared baseline for handoff scope evaluation so setup files do not cause false violations while later skill edits remain detectable.
- Classify exposed cases as calibration material and document independent reserved evaluation and claim-level knowledge provenance without claiming new runs or reviews.


- Align execution-record acceptance with intersected handoff approvals so authorized findings blocked by pending external dependencies are recorded as `blocked` rather than rejected or marked `passed`.
- Disambiguate extracted style selectors by semantic/classed container and occurrence so `compare.mjs` does not fail on unclassed links or paragraphs across sections, and include form controls in focus crops without reading field values.
- Make proxy socket tracking idempotent, close CONNECT tunnels symmetrically when upstream closes, and abort plain-HTTP forwarding if the client disconnects during DNS resolution.
- Account for planted `.muted` low-contrast text in preview evaluation keys, render the initial empty-result state in the React/Tailwind fixture, and add secondary `likely` stack signals for React and Next.js.
- Handle incoming proxy socket errors before DNS/TCP waits, clamp connection timeout bounds, and add a process-isolated regression covering CONNECT and plain HTTP resets.
- Exclude controls without rendered text from typography/color summaries while retaining them for inspection.
- Supply independent handoff IDs in the synthetic brief, validate its authorization set, migrate the prescribed report to schema v3, and expose legacy warnings.
- Exclude invalid audit deliveries from accepted-evidence credit and reject total detection collapse per case; keep existing percentage targets pending a measured baseline.
- Add direct-refinement negatives and validate routing flow metadata, align installed skill checks with repository content rules, discover executor tests dynamically, and run the local entry point in CI. No real agent evaluations or source reviews are claimed.


- Correct visual sampling of icon controls and distinguish uncertain backgrounds/opacity from solid-background contrast observations; icon labels are hints, not rendered text contrast measurements.
- Retry TCP setup against other addresses from the same fully validated DNS answer, within a bounded time budget, without replaying HTTP data or relaxing network policy.
- Intersect handoff eligibility with operator-supplied IDs, validate supporting Markdown links for all skills, and move the unexecuted vision proposal to `evaluations/vision-proposal.json`.
- Add a unified local check command, a computed knowledge inventory, and an evidence-first evaluation plan. No blind agent runs or new source reviews are claimed.


### Added

- Add original visual-inspection guidance to the auditor, scoped UI-refinement guidance to the executor, and direction exploration to the creation skill; route directly requested existing-interface refinements to the executor without bypassing audit-report approval.
- Add original Tailwind system guidance for confirmed projects, shared between the executor and creation skill, without adding another skill or importing external material.
- Add original Next.js interface guidance to the executor and creation skill, scoped to router, rendering, UI states, assets, and verification.
- Add original guidance for interface motion, safe browser-flow checks, measured UI performance, and task-based content/navigation structure without importing external recipes or tooling.
- Add schema v3 audit findings with structured evidence and explicit observation/inference/hypothesis separation, plus a privacy-conscious execution record and structural acceptance gate. Preserve v1/v2 report compatibility and keep agent evaluation outcomes unmeasured until blind runs are recorded.
- Allow the read-only auditor to prepare Playwright/Chromium in an isolated temporary runtime, and require v3 findings to link to observed coverage at the matching state and viewport.

- Add frontend security and localization guidance to the creation skill, with conditional checks in its delivery criteria.

- Add an optional `coverage` matrix to the audit report (page or flow, task, state, viewport, optional stack, result `observed`/`not_observed`/`not_applicable`/`blocked`, evidence or reason, linked findings), validated and mirrored in a Markdown `## Cobertura` table. It stays proportional to the scope, keeps `schema_version: 2` reports without it valid, and lets the audit scorer split misses into `silentOmissions` and `declaredGaps`.
- Add `create-frontend-from-zero-konvert` for planning, building and verifying a new frontend, with collaboration guidance and 24 unmeasured routing cases.
- Expand `create-frontend-from-zero-konvert` with discovery and brief, stack choice, visual foundations with verified WCAG 2.2 limits, a component and state inventory that uses the auditor's knowledge units as acceptance criteria, content/SEO/performance and measurement rules (Core Web Vitals thresholds read from `web-vitals` source), a definition of done with a delivery-report template, and synthetic e-commerce brief and delivery-report examples. Repository validation now requires its sections and reference links, and every `UXK-…` ID cited in skills or docs must exist.
- Add structured UX knowledge units, a coverage map, editorial and automated checks, journey/state guidance and a runnable synthetic React/Tailwind evaluation fixture. Sources and real agent performance remain unverified.
- Add stack-specific inspection guidance and optional report stack metadata; require project inspection before editing platform-specific files.

- Add product-specific UX guidance, synthetic stack-marker evaluation fixtures, safe local stack detection and an opt-in accessibility summary without DOM snippets.
- Add a reference availability workflow, a DNS pinning investigation, release-readiness checks and contributor automation; accessibility, platform integration and agent quality still require real-world validation.
- Add 20 stack-specific knowledge units (Shopify, VTEX IO, WordPress/WooCommerce, React/Next.js, static HTML) written from reference themes and official documentation read at recorded commits.
- Add `extract-styles --axe-details <file>`, which writes failing-element selectors only to a new Git-ignored private file outside the report output.

### Security

- Pin every inspection connection to the validated address: contexts route `route.fetch()` and browser sockets through a local proxy that resolves once, validates every answer and connects to that address, closing the DNS rebinding gap documented in ADR 0001. WebRTC/UDP remains outside the proxy.
- Require the latest completed successful CI run and its full matrix for the exact main commit before creating a release; GitHub branch protection and live workflow behavior require separate verification.

### Breaking

- Stack detector `confidence` now returns `signal` or `likely` instead of `possible`; these are marker counts, not proof or calibrated probabilities.

- DNS resolution failures and timeouts now block requests by default; `--allow-unresolved-dns` explicitly restores the weaker proxy-compatible behavior.

### Changed

- The report validator now also requires the Markdown to mirror each finding's `preserve` list and confidence, and the global `O que preservar` section, because the person approves from the Markdown while the executor reads the JSON.
- CI now triggers on every file of `create-frontend-from-zero-konvert`, and repository validation requires every skill directory in the push and pull_request path filters.
- The auditor's knowledge units no longer use HTTP status or indexing as acceptance criteria (UXK-ERR-051, UXK-ERR-401, UXK-ERR-501): technical SEO is outside the UX audit scope and stays in the creation skill's SEO reference.
- The routing scorer documentation now says it fails when any skill in the run is below 90%.

- Update CI actions to `actions/checkout` v7.0.1 and `actions/setup-node` v7.1.0 (pinned by SHA), removing the Node.js 20 runtime deprecation warning.
- Update the React/Tailwind fixture to React and React DOM 19.3.1, Vite 8.3.5 and Autoprefixer 10.6.2; Tailwind stays on v3 because a major upgrade changes rendered defaults and the audit answer key.
- Dependabot groups `react`/`react-dom` and build tooling, ignores Tailwind majors in the fixture, checks the fixture monthly and groups action updates.

- Allow an explicitly requested private source map only in a new Git-ignored file outside report output; anonymized reports remain the default.
- Clarify comparison mapping, normalize Markdown fields and label report eligibility without implying user authorization.
- Rewrite all knowledge units with problem-specific applicability, exceptions, evidence, observable acceptance criteria and justified method and priority; 55 of 82 units cite WCAG 2.2 or official sources read at a recorded commit, and the rest are marked as unverified editorial heuristics. Four duplicate units were removed (UXK-CHK-055, UXK-FRM-051, UXK-FRM-052, UXK-DSH-052).
- The knowledge validator now rejects text copied between units, acceptance criteria that restate the recommendation, verified sources without a commit or URL, stack cells citing units that do not name the stack, state cells citing units without that state, and `verificação` cells citing unverified units.
- The coverage map now distinguishes `orientação`, `verificação` and `não se aplica`, and fills stack cells only with stack-specific units.
- Stack adapters name verified token, template and command locations for each stack.
- Coverage is gated in CI (lines 80%, branches 85%, functions 87%) and includes the skill unit tests; the release gate also requires the `fixture-react` job; Dependabot covers the React fixture.
- The reference checker retries with a one-byte GET when a server refuses HEAD and fails the weekly job on 404 or 410.

## 0.1.0 — 2026-10-31

- Label ambiguous local-number patterns as redacted ambiguous numbers instead of asserting they are phone numbers; the conservative privacy default may still hide order codes or year ranges.
- Pseudonymize all static image and source paths; do not persist a reverse mapping. Screenshot pixels and unstructured text still require manual privacy review.
- Check report Markdown for private-data signals, duplicate IDs, and matching critical fields; require independently supplied approved IDs for CLI handoff.
- Detect symlink changes in file-level handoff checks, require explicit page mapping for comparisons, retry failed DNS lookups, and reject blocked WebSockets before DNS.

- Expand the visual reference catalog and add a provisional index of 20 user-supplied UX/UI studies and a reference selection guide; original sources require verification.

- **Breaking (report schema 2):** replace `requires_external_data_or_approval` with `external_dependency` (`not_applicable`, `pending`, or `resolved`, with `detail` and `resolution`). A finding is implementable only when approved and not pending. Version 1 reports are still read, with any described dependency treated as pending.
- Add `audit-frontend-designer-konvert/scripts/validate-report.mjs` (zero dependencies) and tests: contract checks, unique IDs, Markdown/JSON ID mirroring, private-data signals, and `--implementable` output for the executor. Repository validation and `verify-install.mjs` now use it.
- Clarify the auditor's write rule: only the report and capture evidence, only in the authorized ignored output directory.
- Resolve hostnames before each guarded request and WebSocket and apply the IP policy to every returned address (normalizing dotted IPv4-mapped forms); the address is not pinned, and a failed lookup does not block.
- Add audit-quality evaluation: three synthetic fixtures (`loja`, `saas`, `institucional`) with planted issues, legitimate decoys, preserve items, and a scorer for graded runs (`scripts/evaluate-audit.mjs`).
- Add a deterministic handoff scope check (`scripts/check-handoff-scope.mjs`) with a report covering approved, resolved, pending, and unapproved findings.
- Add the knowledge module `04-principios-por-problema.md`: what to observe, evidence, limits, and validation per design problem.
- CI: run on changes to any audit skill file, run repository and auditor tests on Linux and Windows, and rename the workflow.

- Add `scripts/verify-install.mjs` and tests to check that installed skills are structurally discoverable; CI now runs every root test.
- Add `npm run setup:browser`, document the Chromium prerequisite for `npm test`, and mention `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` in the launch error.
- Unify skill-facing language: the audit skill body, report contract and synthetic example are now in Portuguese like the rest of the skill content; descriptions and repository docs stay in English.
- Clarify that `evals-visao.proposta.json` is an unexecuted proposal.
- Narrow the audit skill to UX/UI and evidence-informed design psychology, with findings limited to experience and interface design.
- Rename the read-only audit skill to `audit-frontend-designer-konvert` and define an approval-gated report handoff to the reference implementation executor.
- Add a Markdown and JSON audit report contract with synthetic examples, clarify before/after capture and style comparison, and validate that every skill directory ends in `-konvert` with matching metadata.
- Update installation, architecture, and routing guidance for auditor-first “audit and fix” requests and direct visual-reference implementation; routing accuracy remains unmeasured.
- Prevent Chromium from following unchecked HTTP redirects; validate/restart GET main-navigation hops and block redirected subresources/non-GET navigation with explicit reporting.
- Redact common authorization/cookie/JWT formats, Windows/WSL/Unix paths, Brazilian identifiers/phones, and static project-root paths; retain best-effort/manual-review limits.
- Use native screenshot animation/caret controls under CSP, add redirect/CSP regressions, split script smoke scenarios, and validate JSON syntax and example shapes.
- Report effective Playwright/browser versions and executable source without full filesystem paths.
- Classify literal IPs by CIDR, including compatible/translated IPv6, NAT64, 6to4, reserved and benchmark ranges; explicitly deny ambiguous local-use NAT64 and Teredo.
- Route WebSockets through target/tracker guards, reject them with write blocking, and disable service workers in shared inspection contexts; add independent browser controls and regression tests.
- Pin CI actions to verified upstream commits, add job timeouts/concurrency and ignore-file triggers, and validate all JavaScript modules, knowledge links, and tooling lockfile consistency.
- Fix the IPv4-mapped IPv6 policy bypass, including metadata aliases and unspecified addresses; cover alternate spellings with regression tests.
- Add opt-in HTTP method blocking to all browser-inspection scripts without changing default POST-based rendering behavior.
- Expand routing evaluation cases to 48 balanced English/Portuguese prompts; accuracy remains unmeasured until a real run is recorded.
- Add measured-style and optional pixel comparison, including generated diff images, explicit unmatched samples, and incompatible-capture handling.
- Avoid image response buffering by default and cap optional copy buffering by image count and byte budget.
- Add detector regression scenarios, comparison tests, Linux/Windows CI configuration, skill metadata and Markdown link validation.
- Add routing cases and a scorer for externally observed agent decisions; activation accuracy remains unmeasured.
- Add implementation guidance, installation/update/removal instructions, contributor and security documentation, and LF editor settings.
- Document both complementary skills and their handoff.
- Add privacy-focused ignore rules, URL and report redaction, and opt-in image copying.
- Add pinned script dependencies, automated checks, synthetic examples, and GitHub Actions validation.
