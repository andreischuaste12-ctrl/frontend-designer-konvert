# Changelog

Notable changes to the repository are recorded here. The automation package version is tracked separately in `skills/design-por-referencia-konvert/package.json`.

## Unreleased

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
