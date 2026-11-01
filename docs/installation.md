# Install, verify, update, and remove

Requires Git. The scripts additionally require Node.js 20+ and Playwright Chromium. Agent skill discovery depends on the installed agent version; refresh its skills after installation.

## Fresh installation from a local checkout

From a reviewed checkout of this repository, run:

```bash
node scripts/install-skills.mjs --target ../my-project/.agents/skills
```

This command works in Bash and PowerShell. It validates the staged copy before installing, refuses to replace an existing skill, and removes only directories it created if a later step fails. Other skills in the destination remain untouched. It excludes dependencies, hidden files, runtime reports and caches, and rejects source symlinks. It never installs packages, edits the target project's `.gitignore`, or claims agent activation. Use `.claude/skills` for Claude Code.

For updates, back up the three existing skill directories and move them out of the destination before repeating the fresh installer. There is intentionally no force-overwrite option. Pin and record a reviewed commit for reproducibility; `main` remains the development version.

## Tooling diagnostics

In this source checkout:

```bash
npm run setup:tools
npm run doctor -- --browser
npm test
npm run check:browser
```

`setup:tools` installs the executor's pinned packages with lifecycle scripts disabled. The root package has no dependencies. The read-only `doctor` checks Node.js, skill structure, both Playwright and `@axe-core/playwright` versions, and, with `--browser`, an actual Chromium launch. Missing or incompatible packages stop the full browser check before its scenarios run. If no Chromium launches, run `npm run setup:browser` or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed browser. A system browser can differ from Playwright's pinned build.

The root npm commands are development conveniences and are not copied into target projects. For an installed skill, use `npm ci --ignore-scripts` in its `design-por-referencia-konvert` directory, followed by `npm run setup:browser` if needed. See the auditor's isolated preparation for read-only audits.

With Node.js 22.8+, `npm run check:coverage` measures the complete unit and browser suite in one run, after diagnosing packages and selecting a working browser. It retains the CI minimums of 80% lines, 85% branches and 87% functions. Browser paths are included in this measurement; a unit-only run is not the full tooling coverage gate.

## Current development version: all three skills

The third skill, `create-frontend-from-zero-konvert`, is not in the `v0.1.0` release. For a fresh installation from `main`, use the three-skill Bash command in the [README](../README.md#install-all-three-from-main), or clone `main` and run the local installer above in Bash or PowerShell. The verifier from current `main` requires all three skills; the verifier in the pinned `v0.1.0` release requires only its two skills. Back up local changes before updating installed folders.

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

Keep `verify-install.mjs` together with `skill-directory-contract.mjs` in the source clone: they share the section and supporting-link rules without external dependencies. This checks current structure and referenced files, not authenticity or completeness when both a file and its link have been removed. Run `node scripts/verify-install.mjs <skills-dir>` from a matching clone of this repository (for example `.agents/skills` or `.claude/skills` in the target project). The current development verifier checks all three skills exist with valid frontmatter; the v0.1.0 verifier checks the two released skills. It also checks relative links, browser scripts, the lockfile, the audit report validator, and the execution record validator. It proves structure, not that your agent activates the skill. Then confirm the behavior below.

Confirm that the installed folders contain SKILL.md and supporting files. Ask the agent: “Use audit-frontend-designer-konvert to audit this page without editing it.” It should inspect the product, audience, journeys, and interface read-only; preserve strengths; distinguish observations from hypotheses; and produce Markdown and JSON reports. For “audit and fix,” it should finish the audit, validate the report with `audit-frontend-designer-konvert/scripts/validate-report.mjs`, and propose a handoff before implementation. The executor only implements findings the user approves whose external dependency is not pending.

Then try a synthetic reference request: “Use design-por-referencia-konvert to apply this DESIGN.md to the sample page.” It should establish scope, respect project tokens, implement the reference, and report actual visual checks. These manual checks are useful examples, not measured activation accuracy.

Add `.audit/` to the target project's `.gitignore`. For a read-only audit, use the auditor's [isolated browser preparation](../skills/audit-frontend-designer-konvert/references/preparo-do-navegador.md); it can install the pinned tooling in a temporary directory outside the target checkout and use an existing system Chromium. For executor development, install tooling inside its own package with `npm ci` and `npm run setup:browser`. A system Chromium can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; results may differ from the pinned Playwright browser.

## Checks from the source clone

`node scripts/check-project.mjs` runs structural and unit checks from the repository root. `node scripts/check-project.mjs --browser` also runs the browser smoke suite, reusing a working system Chromium when present. Install the executor dependencies first; this check command does not install anything. These checks validate tooling, not the quality of agent decisions.

## Troubleshooting and removal

- Skill missing: check the configured skill directory and refresh the agent.
- Playwright missing: run `npm ci` inside the installed reference skill.
- Browser missing: run `npx playwright install chromium` there.
- URL blocked: prefer loopback or staging; review network flags in the skill before changing access.
- Comparison rejected: use identical viewports and schemes, and selectors that identify samples uniquely.

To uninstall, delete only the installed skill folders (`audit-frontend-designer-konvert`, `design-por-referencia-konvert`, and, if present, `create-frontend-from-zero-konvert`) from the agent's skills directory. Review or remove local `.audit/` output separately; it may contain private content.
