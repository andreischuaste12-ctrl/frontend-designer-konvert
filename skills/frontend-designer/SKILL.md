---
name: frontend-designer
description: Inspect an existing frontend, identify usability and visual design opportunities, research relevant interface references, and implement focused improvements in the project's existing stack. Use for UX/UI reviews, landing pages, responsive layouts, design systems, accessibility, and frontend polish.
---

# Frontend designer

Improve the product the user already has. First understand its users, purpose, current behavior, and technical constraints; then make a small set of evidence-based design decisions and implement them in the existing project.

Before any visual redesign or code change, use the first knowledge-base module: [Auditoria estética e compreensão do público](knowledge-base/01-auditoria-estetica-e-publico.md). Treat it as the required discovery and diagnosis phase. Preserve existing strengths, separate observed facts from assumptions, and connect every recommendation to a user task or a validation need.

If a supplied URL, screenshot, or design guide is the central source and the user wants it implemented, hand the implementation step to [`design-por-referencia-konvert`](../design-por-referencia-konvert/SKILL.md) after the audience and experience audit. Keep this skill as the lead for audits that do not require reference-driven implementation.

## Workflow

1. **Understand the project.** Read the README, agent instructions, package manifests, routes, existing design tokens, and the key page/component files. Identify the framework and the actual run, build, and test commands. Start the app and inspect the relevant flow when the environment supports it. Preserve the current stack and established conventions.
2. **Understand the audience and use context.** Identify likely user intentions, familiarity, task, and consumption context from available product evidence. Distinguish direct evidence, product-provided facts, interface clues, and hypotheses. Do not invent personas or demographic details. Ask only when an unknown would change the direction materially.
3. **Audit before proposing.** Follow one or more important user journeys and evaluate visual hierarchy, readability, composition, imagery, consistency, trust, action clarity, feedback, mobile behavior, accessibility, and motion. Name what is working and should be preserved as well as what needs improvement. Record each finding with location, observable evidence, likely user impact, confidence, and a concrete next step. Do not present an aesthetic preference or untested hypothesis as a user fact.
4. **Research relevant references.** Use the reference catalog below to find examples that match the product category, audience, and task. Prefer a few close examples over a large mood board. Record the source URL and the specific pattern worth learning from. If browsing is unavailable, say so and use general usability and accessibility principles without pretending to have viewed a site. Treat galleries as inspiration, not as evidence of usability or permission to copy.
5. **Choose a direction.** Translate the audit and references into a short design rationale: what to change, why it helps the user, and what visual principle guides it. Keep the product's brand, content, and business goal intact unless asked to revisit them. Favor clarity, consistency, readable type, useful spacing, strong hierarchy, and a visible primary action over decorative novelty.
6. **Implement the improvement.** Make the changes in the existing codebase. Reuse components and tokens where practical; avoid needless dependencies, broad rewrites, placeholder content, and unrelated refactors. Ensure links and controls work, forms provide useful validation and feedback, and empty, loading, and error states make sense for the flow.
7. **Check the result.** Run the app and the relevant existing checks. Inspect the changed flow at desktop and narrow mobile widths when a browser or preview is available. Check keyboard access, focus visibility, semantic structure, contrast, reduced motion, and responsive overflow. Fix regressions found. Report what changed, the checks actually run, and any visual checks that were unavailable.

## Design principles

- Make the next useful action easy to see and understand.
- Use plain language, meaningful labels, and predictable interaction patterns.
- Preserve user control: provide feedback, undo or confirmation for consequential actions, and clear recovery from errors.
- Design for keyboard, touch, screen readers, zoom, and reduced motion as part of the main experience.
- Use WCAG 2.2 AA as the accessibility target where applicable. Do not rely on color alone to communicate state.
- Respect the existing brand and real product content. Do not make up testimonials, metrics, customer logos, guarantees, or product capabilities.
- Keep animation purposeful, brief, and non-blocking. Honor `prefers-reduced-motion`.
- Do not copy a reference site's text, identity, illustrations, or distinctive composition. Explain the transferable interaction or visual idea and adapt it to this product.

## Reference catalog

Use the categorized [Catálogo de referências de design front-end](knowledge-base/02-catalogo-de-referencias.md) to choose sources for the product and question at hand. Record the specific pattern observed, why it may transfer, what must change for this product, and how the decision could be validated. Galleries and portfolios provide inspiration; they do not by themselves prove usability, accessibility, or business impact.

## Report format

For a review, provide:

1. The most important user journey and its primary action.
2. A short prioritized list of concrete findings, with screen/component and user impact.
3. Reference examples with URLs and the pattern adapted from each.
4. The implemented changes and any remaining opportunities.
5. Commands and viewport/accessibility checks actually completed, plus anything not verified.

For a direct implementation request, keep the report brief and focus on the user-visible changes and verification.
