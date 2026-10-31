# Install, verify, update, and remove

Requires Git. The scripts additionally require Node.js 20+ and Playwright Chromium. Agent skill discovery depends on the installed agent version; refresh its skills after installation.

## Bash

From the target project's root, clone to a temporary directory and copy the two skills. For Codex use `.agents/skills`; for Claude Code replace that path with `.claude/skills`.

```bash
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
git clone --depth 1 https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git "$tmp_dir/repo"
mkdir -p .agents/skills
cp -R "$tmp_dir/repo/skills/frontend-designer" .agents/skills/
cp -R "$tmp_dir/repo/skills/design-por-referencia-konvert" .agents/skills/
```

## PowerShell

From the target project's root:

```powershell
$skillSource = Join-Path ([System.IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString())
try {
  git clone --depth 1 https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git $skillSource
  if ($LASTEXITCODE -ne 0) { throw 'Clone failed' }
  $skillsTarget = '.agents/skills' # Claude Code: '.claude/skills'
  New-Item -ItemType Directory -Force $skillsTarget | Out-Null
  Copy-Item -Recurse (Join-Path $skillSource 'skills/frontend-designer') $skillsTarget
  Copy-Item -Recurse (Join-Path $skillSource 'skills/design-por-referencia-konvert') $skillsTarget
} finally {
  if (Test-Path $skillSource) { Remove-Item -Recurse -Force $skillSource }
}
```

Use these commands for a fresh installation. Before updating an existing copy, back up any local modifications, remove only the two installed skill directories, and repeat installation from the desired commit or release. Record the source commit so later audits are reproducible. A clone without a tag follows the latest default branch.

## Verify

Confirm that both installed folders contain SKILL.md and supporting files. Ask the agent: “Use frontend-designer to audit this page without editing it.” It should identify the task and audience, inspect the current interface, preserve strengths, and distinguish observations from hypotheses.

Then try a synthetic reference request: “Use design-por-referencia-konvert to apply this DESIGN.md to the sample page.” It should establish scope, respect project tokens, implement the reference, and report actual visual checks. These manual checks are useful examples, not measured activation accuracy.

Add `.audit/` to the target project's `.gitignore`. Install the optional browser tooling inside the copied reference skill using `npm ci` and `npx playwright install chromium`. A system Chromium can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; results may differ from the pinned Playwright browser.

## Troubleshooting and removal

- Skill missing: check the configured skill directory and refresh the agent.
- Playwright missing: run `npm ci` inside the installed reference skill.
- Browser missing: run `npx playwright install chromium` there.
- URL blocked: prefer loopback or staging; review network flags in the skill before changing access.
- Comparison rejected: use identical viewports and schemes, and selectors that identify samples uniquely.

To uninstall, delete only `frontend-designer` and `design-por-referencia-konvert` from the agent's skills directory. Review or remove local `.audit/` output separately; it may contain private content.
