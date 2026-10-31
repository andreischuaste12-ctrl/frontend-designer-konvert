# Changelog

Notable changes to the repository are recorded here. The automation package version is tracked separately in `skills/design-por-referencia-konvert/package.json`.

## Unreleased

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
