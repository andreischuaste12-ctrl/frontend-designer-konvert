# Changelog

Notable changes to the repository are recorded here. The automation package version is tracked separately in `skills/design-por-referencia-konvert/package.json`.

## Unreleased

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
