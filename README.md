# Frontend Design Skills

This repository contains three complementary skills for coding agents. It is a skills-and-tools repository, not a web application.

## Skills

### `audit-frontend-designer-konvert`

Use it as a read-only UX/UI design reviewer. It studies audience needs, user journeys, visual and interaction design, accessibility as experienced in the interface, and evidence-informed design psychology, then produces a structured Markdown and JSON report validated by `scripts/validate-report.mjs`. New reports use schema version 3 to distinguish observed evidence, inference, and hypothesis. It never edits the audited project; it writes only the report, a minimal execution record, and capture evidence to an ignored output directory.

Start with this skill when the request is to audit or evaluate an existing interface. It does not require a visual reference.

### `design-por-referencia-konvert`

Use it as the executor when implementing explicitly approved audit findings, adapting a supplied design guide, URL, screenshot, or visual direction, or making a directly requested, scoped refinement to an existing interface. It checks before/after captures and measured styles where the interface can be rendered.

Use this skill directly when a visual reference must be reproduced or the user names a concrete existing UI change, such as a typography, motion, or responsive fix. For “audit and fix” requests, start with `audit-frontend-designer-konvert`; pass its report to this executor only after the user approves findings. A finding is implementable only when it is approved and its `external_dependency.status` is not `pending`. Do not use a gallery example as proof of usability.

The auditor uses the executor's browser scripts for rendered evidence, so install both skills together. If Playwright/Chromium is missing, its [isolated browser preparation](skills/audit-frontend-designer-konvert/references/preparo-do-navegador.md) can set up a temporary copy of the pinned tools outside the audited project. It reports missing visual evidence only after that check fails; the audited source remains read-only.

The [capability map](docs/experience-capabilities.md) shows how visual evaluation, creation, and refinement are divided across the three skills and which browser interactions are not implemented. The [execution record](skills/audit-frontend-designer-konvert/references/registro-de-execucao.md) captures inspected states, decisions, blocked actions, and acceptance checks without retaining raw prompts or URLs. For report-driven implementation, a structural gate requires a passed, evidenced check for each independently approved finding; human review of the result remains necessary.

### `create-frontend-from-zero-konvert`

Use it to plan, implement, and verify a new frontend from a product brief, including original visual direction exploration when needed. It reuses the auditor's knowledge and the executor's browser tools when available. An existing interface requested as a visual reproduction, scoped refinement, or approved audit implementation remains the reference executor's responsibility. Creation quality and agent routing are not yet measured.

## Install all three from main

The third skill is **unreleased** and is not included in the `v0.1.0` installation below. For a fresh installation of the current development version, run the following from the target project root. Review and back up existing copies before updating them.

```bash
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
git clone --depth 1 --branch main --filter=blob:none --sparse \
  https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git "$tmp_dir/repo"
git -C "$tmp_dir/repo" sparse-checkout set skills scripts
mkdir -p .agents/skills
for name in audit-frontend-designer-konvert design-por-referencia-konvert create-frontend-from-zero-konvert; do
  if [ -e ".agents/skills/$name" ]; then echo "Existing skill: $name; back it up before updating."; exit 1; fi
done
cp -R "$tmp_dir/repo"/skills/* .agents/skills/
node "$tmp_dir/repo/scripts/verify-install.mjs" .agents/skills
```

The verifier checks the installed structure, not agent activation. Node.js 20+ is required for the tooling. See the [installation guide](docs/installation.md) for platform-specific instructions and browser setup.

## First audit

1. Install the current three-skill version from `main` using the command above; Node.js 20+ is required for validation and the browser tools. The older `v0.1.0` release below does not include isolated browser preparation.
2. In the project to inspect, ensure `.audit/` is ignored by Git or select a separate authorized output directory. Use synthetic data.
3. The installation commands verify the installed copies. The auditor checks its browser tools and can prepare an isolated runtime when needed; see the installation guide.
4. Ask: “Use audit-frontend-designer-konvert to audit this interface without editing the project.” Review the Markdown, JSON and captures in the authorized output directory before sharing. The verification command checks structure, not agent activation.

## Install the two released skills (v0.1.0)

The commands below install the `v0.1.0` release. To inspect unreleased work, use the `main` branch explicitly.

From the root of the project where you want to install the skills, run:

```bash
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
git clone --depth 1 --branch v0.1.0 --filter=blob:none --sparse \
  https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git \
  "$tmp_dir/repo"
git -C "$tmp_dir/repo" sparse-checkout set \
  skills/audit-frontend-designer-konvert \
  skills/design-por-referencia-konvert \
  scripts
mkdir -p .agents/skills
cp -R "$tmp_dir/repo"/skills/* .agents/skills/
node "$tmp_dir/repo/scripts/verify-install.mjs" .agents/skills
```

The expected result is `.agents/skills/audit-frontend-designer-konvert/SKILL.md` and `.agents/skills/design-por-referencia-konvert/SKILL.md`, each with its supporting knowledge base, references, and scripts. If your agent uses a different skills directory, copy the `skills` folders there. Refresh the agent if it does not detect the skills automatically.

The auditor includes a categorized [visual reference catalog](skills/audit-frontend-designer-konvert/knowledge-base/02-catalogo-de-referencias.md) and [UX/UI research index](skills/audit-frontend-designer-konvert/knowledge-base/05-estudos-ux-ui-psicologia.md). The executor has a [reference selection guide](skills/design-por-referencia-konvert/references/guia-de-referencias.md). The newly supplied sources and research summaries have not yet been independently verified.

See the [installation guide](docs/installation.md) for PowerShell, Claude Code paths, activation checks, updates, removal, and troubleshooting. Start with “Use audit-frontend-designer-konvert to audit this page without editing it” or “Use design-por-referencia-konvert to implement this approved audit report.”

## Privacy and safe use

- Keep generated audits in `.audit/`; the root `.gitignore` excludes this folder because captures and reports can contain page content, URLs, or third-party images.
- When installing into another repository, add `.audit/` to that repository's `.gitignore` (or direct output outside the checkout) before running capture tools.
- Use test or synthetic account data. Do not capture authenticated pages containing real customer information unless explicitly required and approved.
- Do not put credentials, private URLs, customer data, or session identifiers in committed files, screenshots, issue text, reports, or execution records.
- The audit scripts are intended for sites and local projects you are authorized to inspect. Review outputs before sharing them.

## Validate the reference tooling

The browser tools are maintained as a package inside the reference-driven skill, not at the repository root:

```bash
cd skills/design-por-referencia-konvert
npm ci
npm run setup:browser   # downloads the pinned Playwright Chromium
npm run check
npm test
```

From the repository root, run `node scripts/validate-repository.mjs` to check JavaScript/JSON syntax, the audit report and execution record contracts on synthetic examples, evaluation cases, skill metadata, knowledge-module links, relative Markdown links, and manifest/lockfile consistency. Run `node --test "scripts/*.test.mjs" "skills/audit-frontend-designer-konvert/tests/*.test.mjs"` for the scorers, handoff scope and acceptance checks, repository contract, install verifier, and report validator. After copying all three current skills into a project, `node scripts/verify-install.mjs <skills-dir>` checks their structure. The v0.1.0 verifier checks its two released skills.

The [evaluation guide](evaluations/README.md) covers routing, audit quality on synthetic projects (with planted issues, legitimate decoys, and preserve items), and a deterministic handoff scope check. The scorers are tested; no agent run has been recorded, so routing accuracy, audit quality, and handoff compliance remain unmeasured.

For a focused change, start with `--profile rapido`; use `tela` for up to three pages and `completo` for a site-wide pass. The capture defaults to blocking known analytics and tracking hosts to avoid adding synthetic visits to production data. Prefer localhost or staging. `--allow-private` opens access to private-network targets, `--allow-tracking` permits known trackers, and `--no-mask` reveals form fields in screenshots; use these only when the target and test data are safe. Use `--block-writes` to optionally reject methods other than GET/HEAD and all WebSockets; it can block first-party telemetry and POST-based reads, so inspect the resulting capture. Reports and screenshots can include rendered page content even when URLs and form values are redacted.

`npm test` includes browser smoke tests and fails without a Chromium that matches the pinned Playwright version. If you cannot download one, point `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` at an installed Chromium; results may differ slightly from the pinned build. The smoke test uses a synthetic page on loopback and the installed Playwright Chromium. GitHub Actions is configured for repository validation and root/auditor tests on Node 22, syntax and unit checks on Node 20, 22, and 24, and browser smoke tests on Node 22, each on Linux and Windows. Inspect the actual workflow results before relying on platform compatibility.

Use `node skills/design-por-referencia-konvert/scripts/compare.mjs --before .audit/before --after .audit/after --confirm-page-mapping --pixels` to produce style and pixel-difference reports after manually confirming page and route correspondence; ordinal route IDs cannot verify that correspondence. See [architecture and limitations](docs/architecture.md), [contributing](CONTRIBUTING.md), and [security and captured data](SECURITY.md).

Known limits: connections are pinned to the address validated by a local proxy, but WebRTC/UDP traffic does not use that proxy and the tools are not a sandbox for untrusted URLs; failed lookups block by default; `--allow-unresolved-dns` weakens this guard for trusted proxy environments; redirected subresources are blocked; HTTP mediation changes timing; and text redaction is best effort. Screenshots can expose visible page content. Treat missing resources as incomplete evidence and review artifacts before sharing.

## Repository layout

```text
skills/
├── audit-frontend-designer-konvert/
│   ├── SKILL.md
│   ├── examples/
│   ├── knowledge-base/
│   ├── references/
│   ├── scripts/        # validate-report.mjs
│   └── tests/
├── design-por-referencia-konvert/
    ├── SKILL.md
    ├── examples/
    ├── references/
    ├── scripts/
    └── tests/
└── create-frontend-from-zero-konvert/
    ├── SKILL.md
    ├── examples/
    └── references/

.github/workflows/skill-tools.yml
CHANGELOG.md
docs/
evaluations/
├── audit-quality/      # answer key for the auditor
├── fixtures/           # synthetic loja, saas, institucional projects
├── handoff/            # report + file mapping for the executor
└── routing-cases.json
scripts/
```

The research notes that informed the front-end design knowledge base are in [`docs/pesquisa-designer-front-end-moderno.md`](docs/pesquisa-designer-front-end-moderno.md).

## Author and license

Created by **Andrei Schuaste**. This repository is distributed under the MIT License. See [LICENSE](LICENSE) for the full terms.
