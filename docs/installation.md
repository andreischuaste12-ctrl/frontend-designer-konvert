# Install, verify, update, and remove

Requires Git. The scripts additionally require Node.js 20+ and Playwright Chromium. Agent skill discovery depends on the installed agent version; refresh its skills after installation.

## Current development version: all three skills

The third skill, `create-frontend-from-zero-konvert`, is not in the `v0.1.0` release. For a fresh installation from `main`, use the three-skill Bash command in the [README](../README.md#install-all-three-from-main). For PowerShell, use the released instructions below with `--branch main` and add a third `Copy-Item` for `skills/create-frontend-from-zero-konvert` before running the verifier. The verifier from current `main` requires all three skills; the verifier in the pinned `v0.1.0` release requires only its two skills. Back up local changes before updating installed folders.

## Bash — released v0.1.0

From the target project's root, clone to a temporary directory and copy the two skills. For Codex use `.agents/skills`; for Claude Code replace that path with `.claude/skills`.

```bash
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
git clone --depth 1 --branch v0.1.0 https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git "$tmp_dir/repo"
mkdir -p .agents/skills
cp -R "$tmp_dir/repo/skills/audit-frontend-designer-konvert" .agents/skills/
cp -R "$tmp_dir/repo/skills/design-por-referencia-konvert" .agents/skills/
node "$tmp_dir/repo/scripts/verify-install.mjs" .agents/skills
```

## PowerShell — released v0.1.0

From the target project's root:

```powershell
$skillSource = Join-Path ([System.IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString())
try {
  git clone --depth 1 --branch v0.1.0 https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git $skillSource
  if ($LASTEXITCODE -ne 0) { throw 'Clone failed' }
  $skillsTarget = '.agents/skills' # Claude Code: '.claude/skills'
  New-Item -ItemType Directory -Force $skillsTarget | Out-Null
  Copy-Item -Recurse (Join-Path $skillSource 'skills/audit-frontend-designer-konvert') $skillsTarget
  Copy-Item -Recurse (Join-Path $skillSource 'skills/design-por-referencia-konvert') $skillsTarget
  node (Join-Path $skillSource 'scripts/verify-install.mjs') $skillsTarget
  if ($LASTEXITCODE -ne 0) { throw 'Installation verification failed' }
} finally {
  if (Test-Path $skillSource) { Remove-Item -Recurse -Force $skillSource }
}
```

Use these commands for a fresh installation. Before updating an existing copy, back up any local modifications, remove only the two installed skill directories, and repeat installation from the desired commit or release. Record the source commit so later audits are reproducible. The examples pin the v0.1.0 tag; substitute an explicitly chosen later release or main when updating. A clone without a tag follows the latest default branch.

## Verify

Run `node scripts/verify-install.mjs <skills-dir>` from a matching clone of this repository (for example `.agents/skills` or `.claude/skills` in the target project). The current development verifier checks all three skills exist with valid frontmatter; the v0.1.0 verifier checks the two released skills. It also checks relative links, browser scripts, the lockfile, and the audit report validator. It proves structure, not that your agent activates the skill. Then confirm the behavior below.

Confirm that the installed folders contain SKILL.md and supporting files. Ask the agent: “Use audit-frontend-designer-konvert to audit this page without editing it.” It should inspect the product, audience, journeys, and interface read-only; preserve strengths; distinguish observations from hypotheses; and produce Markdown and JSON reports. For “audit and fix,” it should finish the audit, validate the report with `audit-frontend-designer-konvert/scripts/validate-report.mjs`, and propose a handoff before implementation. The executor only implements findings the user approves whose external dependency is not pending.

Then try a synthetic reference request: “Use design-por-referencia-konvert to apply this DESIGN.md to the sample page.” It should establish scope, respect project tokens, implement the reference, and report actual visual checks. These manual checks are useful examples, not measured activation accuracy.

Add `.audit/` to the target project's `.gitignore`. Install the optional browser tooling inside the copied reference skill using `npm ci` and `npm run setup:browser`. A system Chromium can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; results may differ from the pinned Playwright browser.

## Troubleshooting and removal

- Skill missing: check the configured skill directory and refresh the agent.
- Playwright missing: run `npm ci` inside the installed reference skill.
- Browser missing: run `npx playwright install chromium` there.
- URL blocked: prefer loopback or staging; review network flags in the skill before changing access.
- Comparison rejected: use identical viewports and schemes, and selectors that identify samples uniquely.

To uninstall, delete only the installed skill folders (`audit-frontend-designer-konvert`, `design-por-referencia-konvert`, and, if present, `create-frontend-from-zero-konvert`) from the agent's skills directory. Review or remove local `.audit/` output separately; it may contain private content.
