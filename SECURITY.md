# Security and captured data

Browser tools execute page JavaScript. Only inspect authorized targets, preferably local development or staging, with synthetic data. Known trackers and literal private-network targets are blocked by default, but DNS rebinding, arbitrary site telemetry, application side effects, Shadow DOM coverage, and authenticated sessions require separate consideration.

Keep `.audit/` outside version control. Masked fields do not hide names or messages elsewhere on a page. Review reports, PNGs, console messages, and copied assets before sharing. Do not commit environment files, authentication state, tokens, customer information, or licensed reference assets. The inventory does not read response bodies by default. Optional copies require known, unencoded responses up to 5 MB each, with a 60-image/50 MB buffering budget; local file copies share that budget. These limits do not impose a hard cap on Chromium's network downloads.

Report vulnerabilities through GitHub's private vulnerability reporting if enabled. Do not publish secrets or captured customer data in a public issue. A public report should contain only a synthetic reproduction and a description of impact. If data has already been exposed, remove access and rotate affected credentials through the relevant provider; a redaction patch does not invalidate an exposed credential or remove Git history.

Only the author's public name and authorized email should be added as personal attribution. Do not append agent session IDs, local machine identifiers, account details, or unnecessary coauthor metadata.
