# design-por-referencia-konvert

A coding-agent skill for adapting a visual reference (a `DESIGN.md`, URL, screenshot, or written direction) into a working interface. Decisions stay traceable, and fidelity is checked in the rendered result with viewport captures, measured styles, and an image inventory.

## Contents

| File | Purpose |
| --- | --- |
| `SKILL.md` | Precedence, seven-step workflow, visual evidence, and limitations. |
| `references/contrato-de-entrada.md` | Reference source, fidelity level, scope, protected elements, and acceptance criteria. |
| `references/papeis-e-tokens.md` | Visual roles, evidence labels, and mapping to the target project. |
| `references/captura-e-inspecao.md` | Rendering, screenshots, inspection, and style measurement. |
| `references/inventario-de-imagens.md` | Image manifest, findings, and visual-review guide. |
| `references/validacao.md` | Fidelity, accessibility, responsive, state, image, and integration checklist. |
| `references/modelo-design-md.md` | Optional `DESIGN.md` template. |
| `scripts/capture.mjs` | Route, viewport, and color-scheme screenshots, including tiles and focus/hover crops. |
| `scripts/extract-styles.mjs` | Computed styles, CSS variables, fonts, type scale, estimated contrast, and target sizes. |
| `scripts/image-manifest.mjs` | Static and rendered image inventory plus a visual-review guide. |
| `scripts/_common.mjs` | Shared script utilities. |
| `scripts/compare.mjs` | Measured-style differences and optional PNG comparison with diff images. |
| `evals/evals-visao.proposta.json` | Proposed manual evaluation scenarios; not an executable test suite. |
| `tests/` | Unit tests and local smoke tests for the three scripts. |
| `package.json` and `package-lock.json` | Minimal runtime, pinned Playwright dependency, and reproducible checks. |

## Requirements and validation

Node.js 20 or later and Playwright Chromium are required. Dependencies are pinned in the lockfile. Run these commands from this folder:

```bash
npm ci
npx playwright install chromium
npm run check
npm test
```

The scripts do not install dependencies, click, or submit forms. Chromium does execute the target site's JavaScript, so use only authorized targets and prefer synthetic data. Credentials, query strings, and URL fragments are removed from reported URLs; error messages are also sanitized. Output is written under `.audit/`, which the repository root `.gitignore` excludes.

Use `capture.mjs --profile rapido|tela|completo` to size the capture to the task. Individual flags such as `--widths` and `--max-controls` override profile defaults. Known metadata endpoints, tracker hosts, and literal private-network targets are blocked by default. `--allow-tracking` permits known trackers; `--allow-private` permits private-network targets; and `--no-mask` reveals form fields in screenshots. Prefer localhost or staging and synthetic data. The network guard does not validate the final IP after DNS resolution and is not a sandbox for untrusted URLs.

Images are not copied by default. Use `--save-images` only when local review copies are needed; do not commit or redistribute them without checking their rights. Screenshots and reports can contain rendered page content, so review them before sharing.

`--block-writes` optionally rejects HTTP methods other than GET/HEAD in all three browser-inspection scripts. It can block first-party POST telemetry, but also GraphQL reads and CORS preflights. The default preserves these requests; prefer staging. Reports record `blockWrites` and `blockedWriteMethods`. IPv4-mapped IPv6 literals use the embedded IPv4 policy, so alternate address spellings do not bypass metadata/private-IP rules; unspecified addresses are always blocked. DNS rebinding remains outside this guard's guarantees.

## Examples

Run commands from the target project's root; `<skill>` is the path to this skill folder:

```bash
node <skill>/scripts/capture.mjs --url http://localhost:3000 --profile rapido --routes /,/product
node <skill>/scripts/extract-styles.mjs --url http://localhost:3000 --width 1440
node <skill>/scripts/image-manifest.mjs --root . --url http://localhost:3000
node <skill>/scripts/compare.mjs --before .audit/before --after .audit/after --pixels
# Add --save-images to explicitly create local review copies.
```

## Installation

Copy this folder, including `references/`, `scripts/`, `tests/`, and `examples/`, to your agent's skills directory. `evals-visao.proposta.json` is a proposal, not a runner.

| Tool | Project-level path | User-level path |
| --- | --- | --- |
| Claude Code | `.claude/skills/design-por-referencia-konvert/` | `~/.claude/skills/design-por-referencia-konvert/` |
| Codex | `.agents/skills/design-por-referencia-konvert/` | `~/.agents/skills/design-por-referencia-konvert/` |

Refresh or restart the agent if it does not detect the skill. When installing it in another project, add `.audit/` to that project's `.gitignore` before running the scripts.

## When to use

Use this skill for requests such as:

- “Apply this folder's `DESIGN.md` to the product page.”
- “Make the checkout feel like this site: <URL>.”
- “Recreate the hierarchy and mood of this screenshot while preserving our tokens.”

Use `frontend-designer` for an audit without a visual reference. This skill is not intended for animation as the primary goal or for fixing responsive issues without a reference.

## License

MIT. See the repository's `LICENSE` file.
