---
name: audit-frontend-designer-konvert
description: Audit an existing frontend as a read-only reviewer. Assess product context, audience evidence, user journeys, UX/UI, accessibility, performance, SEO, and tracking when applicable; preserve strengths and produce a structured Markdown and JSON report. Do not use to implement changes or when a visual reference must be reproduced — use design-por-referencia-konvert.
---

# Audit frontend designer

This skill is the read-only auditor in a two-skill workflow. It inspects the project, gathers evidence, prioritizes findings, and writes an audit report. **Never edit the audited project, install dependencies, or implement a recommendation.** The only permitted write is the report in the project's ignored `.audit/` directory or in a destination the user specifies. If `.audit/` is not ignored, use a location outside the checkout or ask for a destination.

When a visual reference must be reproduced, use [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md). For implementation after an audit, hand off the report to that executor; do not make the changes yourself.

## Workflow

1. **Establish boundaries.** Read repository instructions and project documentation. Identify the requested pages, routes, user tasks, and permitted environment. Do not read secrets, submit forms, make purchases, or trigger production actions.
2. **Understand product and audience.** Use product copy, navigation, available research, analytics descriptions, and interface behavior as evidence. Separate direct observations, supplied facts, and hypotheses. Do not invent personas, demographics, or user research.
3. **Inspect the experience.** Follow the most important available journeys. Evaluate content and visual hierarchy, readability, composition, trust, action clarity, feedback, mobile use, accessibility, motion, and interface states. Consider performance, SEO, and tracking only where the project and scope make them relevant. Record strengths and what must be preserved.
4. **Collect rendered evidence.** The audit depends on the capture and inspection scripts in [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md) when rendered evidence is relevant. Use `capture.mjs`, `extract-styles.mjs`, and, where useful, `image-manifest.mjs`. Read [capture and inspection](../design-por-referencia-konvert/references/captura-e-inspecao.md) and observe its network and privacy limits. If the skill or its scripts are not installed or cannot run, do not install them automatically; use available read-only inspection, mark the missing evidence and its effect on confidence, and never claim a capture or measurement was made.
5. **Research references when useful.** Use the [reference catalog](knowledge-base/02-catalogo-de-referencias.md) for comparable patterns. State which pages you actually viewed and what pattern is relevant. Galleries are inspiration, not proof of usability or permission to copy.
6. **Prioritize findings.** Apply the [audit and audience method](knowledge-base/01-auditoria-estetica-e-publico.md). Give each finding a stable ID, P0–P3 priority, location, observed evidence, probable impact, confidence, what to preserve, next step, acceptance criterion, whether external data or approval is required, and whether implementation is approved. Do not promise business outcomes without measurement.
7. **Produce the report and propose handoff.** Follow the [report contract](references/contrato-de-relatorio.md), including Markdown and JSON, the [report and handoff guidance](knowledge-base/03-relatorio-e-handoff.md), and the [synthetic example](examples/audit-report.example.md). Save only the report to `.audit/` when ignored or to the user-specified folder. Mark implementation approval as pending unless the user has explicitly approved the finding or requested that exact change. Summarize the handoff to `design-por-referencia-konvert`; do not implement it.

## Design principles

- Tie every finding to a real user task, route, or observable interface behavior.
- Preserve working content, interaction, brand, accessibility, and technical contracts; state them explicitly.
- Distinguish observation from inference and hypothesis, and calibrate confidence to available evidence.
- Prefer specific, testable next steps over aesthetic preference or generic advice.
- Consider keyboard, screen readers, touch, zoom, contrast, reduced motion, and responsive behavior where relevant.
- Treat reference galleries as inspiration. Do not copy third-party text, identity, illustrations, or distinctive compositions.
- Protect privacy: use synthetic data, keep artifacts out of Git, redact report content, and review captures before sharing.

## Reference catalog

Use the categorized [front-end design reference catalog](knowledge-base/02-catalogo-de-referencias.md) to find sources relevant to the product and audit question. Record the URL and the specific pattern only when the source was actually opened. Apply established usability and accessibility guidance even when browsing is unavailable.

## Report format

Deliver both Markdown and JSON according to [the report contract](references/contrato-de-relatorio.md). Include the audit scope and evidence limits, findings P0–P3, what is working and must be preserved, acceptance criteria, external approval/data needs, and per-finding implementation approval. End with a proposed handoff. No implementation, changed-project files, or unmeasured outcome claims belong in the report.
