# Frontend Design Skills

This repository contains two complementary skills for coding agents. It is a skills-and-tools repository, not a web application.

## Skills

### `frontend-designer`

Use it to understand a product and its audience, audit the current experience and visual design, identify what works and what should improve, then implement focused usability and responsive-design improvements.

Start with this skill when the request is to audit, evaluate, or improve an existing interface. It does not require a visual reference.

### `design-por-referencia-konvert`

Use it when the task is to adapt a supplied design guide, URL, screenshot, or visual direction into an implementation, with rendered captures and measured styles to check fidelity.

Use this skill when a reference is central to the task. It complements `frontend-designer`: first understand the product and its users; then use the reference-conversion workflow for the implementation. Do not use a gallery example as proof of usability.

## Install both skills

From the root of the project where you want to install the skills, run:

```bash
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git \
  "$tmp_dir/repo"
git -C "$tmp_dir/repo" sparse-checkout set \
  skills/frontend-designer \
  skills/design-por-referencia-konvert
mkdir -p .agents/skills
cp -R "$tmp_dir/repo"/skills/* .agents/skills/
```

The expected result is `.agents/skills/frontend-designer/SKILL.md` and `.agents/skills/design-por-referencia-konvert/SKILL.md`, each with its supporting knowledge base, references, and scripts. If your agent uses a different skills directory, copy the `skills` folders there. Refresh the agent if it does not detect the skills automatically.

See the [installation guide](docs/installation.md) for PowerShell, Claude Code paths, activation checks, updates, removal, and troubleshooting. Start with “Use frontend-designer to audit this page without editing it” or “Use design-por-referencia-konvert to implement this DESIGN.md.”

## Privacy and safe use

- Keep generated audits in `.audit/`; the root `.gitignore` excludes this folder because captures and reports can contain page content, URLs, or third-party images.
- When installing into another repository, add `.audit/` to that repository's `.gitignore` (or direct output outside the checkout) before running capture tools.
- Use test or synthetic account data. Do not capture authenticated pages containing real customer information unless explicitly required and approved.
- Do not put credentials, private URLs, customer data, or session identifiers in committed files, screenshots, issue text, or reports.
- The audit scripts are intended for sites and local projects you are authorized to inspect. Review outputs before sharing them.

## Validate the reference tooling

The browser tools are maintained as a package inside the reference-driven skill, not at the repository root:

```bash
cd skills/design-por-referencia-konvert
npm ci
npm run check
npm test
```

From the repository root, run `node scripts/validate-repository.mjs` to check skill metadata and relative Markdown links, and `node --test scripts/evaluate-routing.test.mjs` to check the routing scorer. The [routing evaluation guide](evaluations/README.md) explains how to score observed agent decisions; no activation accuracy has yet been measured.

For a focused change, start with `--profile rapido`; use `tela` for up to three pages and `completo` for a site-wide pass. The capture defaults to blocking known analytics and tracking hosts to avoid adding synthetic visits to production data. Prefer localhost or staging. `--allow-private` opens access to private-network targets, `--allow-tracking` permits known trackers, and `--no-mask` reveals form fields in screenshots; use these only when the target and test data are safe. Reports and screenshots can include rendered page content even when URLs and form values are redacted.

The smoke test uses a synthetic page on loopback and the installed Playwright Chromium. GitHub Actions is configured for syntax and unit checks on Node 20, 22, and 24 on Linux and Windows, and browser smoke tests on Node 22 on both systems. Inspect the actual workflow results before relying on platform compatibility.

Use `node skills/design-por-referencia-konvert/scripts/compare.mjs --before .audit/before --after .audit/after --pixels` to produce style and pixel-difference reports from compatible captures. See [architecture and limitations](docs/architecture.md), [contributing](CONTRIBUTING.md), and [security and captured data](SECURITY.md).

## Repository layout

```text
skills/
├── frontend-designer/
│   ├── SKILL.md
│   └── knowledge-base/
└── design-por-referencia-konvert/
    ├── SKILL.md
    ├── examples/
    ├── references/
    ├── scripts/
    └── tests/

.github/workflows/skill-tools.yml
CHANGELOG.md
docs/
evaluations/
scripts/
```

The research notes that informed the front-end design knowledge base are in [`docs/pesquisa-designer-front-end-moderno.md`](docs/pesquisa-designer-front-end-moderno.md).

## Author and license

Created by **Andrei Schuaste**. This repository is distributed under the MIT License. See [LICENSE](LICENSE) for the full terms.
