# Knowledge-unit editorial standard

Units are inspection prompts, not evidence that a problem exists. Author skill content in Portuguese; repository documentation stays in English. Keep agent-facing material inside the installed skill. A unit addresses one problem and has one independently testable acceptance criterion. IDs are globally unique `UXK-<journey>-NNN`: CHK checkout, FRM forms, NAV navigation, ERR errors and recovery, DSH dashboards, GEN transversal, UTL web tools and data transformation. Stack-specific units use the hundreds digit for the stack: 1xx Shopify, 2xx VTEX IO, 3xx WordPress/WooCommerce, 4xx React/Next.js, 5xx static HTML, and must name the stack in `Contexto`.

## Format

Use a level-three heading `### UXK-CHK-001 — Title` followed by the exact fields `Contexto`, `Estados`, `Quando se aplica`, `Exceções`, `Evidência a coletar`, `Método`, `Prioridade padrão`, `Recomendação`, `Critério de aceite`, `Preservar`, `Dependência externa`, `Métrica a monitorar`, and `Fonte`, formatted as `- **Field:** value`. Allowed states are `normal`, `carregando`, `erro`, `sucesso`, `vazio`, `recuperação`; methods are `automático`, `inspeção`, `hipótese`; priorities P0–P3.

## Writing rules (enforced by `scripts/check-knowledge-units.mjs`)

- **Specific text.** `Quando se aplica`, `Exceções`, `Evidência a coletar`, `Recomendação`, `Critério de aceite`, `Preservar`, and `Métrica a monitorar` must not repeat another unit's text. Template sentences that fit every unit give the agent nothing.
- **Observable acceptance criterion.** The criterion states what is seen or measured to pass (for example "in 375 px the total is visible before the pay button"), not the recommendation reworded as "the interface should…". A criterion that mostly reuses the recommendation's words is rejected.
- **Method.** `automático` only when a tool in this repository measures the criterion (`extract-styles --axe`, `rect` sizes, the capture's `horizontalOverflow` or HTTP status). `hipótese` needs testing with people and can never default to P0.
- **Priority.** P0 blocks a critical task (pay, submit, sign in) or risks financial or data loss; P1 is high friction in a critical flow or a WCAG A/AA failure that affects the task; P2 is moderate friction or off the critical path; P3 is refinement. Defaults describe the typical case and are adjusted with a reason in the report.
- **No universal numbers across platforms.** When a rule differs by platform or conformance level, state each value with its source and level (for example WCAG 2.5.8 AA 24×24 CSS px and 2.5.5 AAA 44×44 CSS px), and say what was not verified.
- **Commercial context.** Units touching pricing, delivery, payment or installments are marked `[comercial]` and start with a `pendente` dependency. Only an authorized owner can resolve actual commercial rules.
- **Sources.** Mark sources not opened as `não verificada`. A verified source states what was read, a commit (`@abcdef1`) or URL, `verificado em AAAA-MM-DD`, and the reviewer; record it only when the claim itself was checked, since availability is not verification. Units written from an agent's reading stay marked "pendente de revisão humana" until a person reviews them.
- **Evidence.** Collect synthetic evidence in an authorized environment, with no real transactions or personal data. Monitoring metrics are suggestions, never invented outcomes.

## Coverage map

The [coverage map](coverage-map.md) reports guidance with existing unit IDs: `orientação` when any cited unit is unverified, `verificação` only when every cited unit has a verified source, `teste` only with an evaluation case. Stack cells must cite units that name that stack; state cells must cite units that list that state; `não se aplica` is limited to the journey × stack table. Labels do not prove that agents, users or stacks were evaluated.

Run `node scripts/validate-repository.mjs` and the root tests before requesting review. Structural checks cannot validate evidence, accessibility, quality, or source truth.

Run `npm run knowledge:review` to generate the current review queue without editing sources. It sorts by task priority, then provenance (invalid/conflicting/stale before unverified editorial guidance and recorded sources awaiting independent review). Each entry names the existing source file and the next review action. A queue entry is work to do, not a completed review; only an actual independent reviewer can establish independent review.
