# Audit report contract

Every completed UX/UI design audit produces a Markdown report and a JSON report with matching finding IDs and equivalent content. Cover audience needs, journeys, visual design, interaction, and design psychology. The Markdown is for review; JSON is the structured handoff input for `design-por-referencia-konvert`.

## Required report fields

The top-level report contains:

- `schema_version`: integer schema version (`1` for this contract).
- `report_id`: stable, non-identifying report ID.
- `project`: short project label; do not include private URLs, personal paths, account IDs, or customer data.
- `scope`: routes, tasks, viewports, states, and audit dimensions covered.
- `evidence_limits`: unavailable tools, data, or checks and their effect on confidence.
- `preserve`: project-wide strengths and contracts to keep intact.
- `findings`: array of findings with the fields below.
- `handoff`: proposed next skill and a concise summary; this does not authorize unapproved changes.

## Required finding fields

Each finding must contain:

| Field | Required value |
| --- | --- |
| `id` | Stable, unique identifier within the report, such as `UX-001`. |
| `priority` | One of `P0`, `P1`, `P2`, `P3`. |
| `location` | Route/component/element/viewport or relative source path; say `unknown` if unavailable. |
| `evidence_observed` | Direct evidence and its source. Label inference or hypothesis clearly. |
| `probable_impact` | Likely effect on a user's understanding, perception, confidence, effort, or ability to complete a task. Mark untested psychological effects as hypotheses. |
| `confidence` | `high`, `medium`, or `low`, with a short reason. |
| `preserve` | Behavior, content, component, brand, integration, or contract not to change for this finding. |
| `next_step` | Concrete proposed action. A recommendation alone is not approval. |
| `acceptance_criteria` | Observable condition for a successful change. |
| `requires_external_data_or_approval` | `false` or a description of the required input/approval and its owner. |
| `approved_for_implementation` | Boolean. Defaults to `false`; set `true` only when the user explicitly approves this finding or its exact change. |

The P0–P3 meanings and evidence rules are defined in [report and handoff guidance](../knowledge-base/03-relatorio-e-handoff.md). An external dependency must be resolved before implementation even if approval is otherwise recorded.

## Markdown rendering

Include report context and evidence limits, then a section per finding with all required fields, followed by project-wide preserve items and the proposed handoff. Keep Markdown IDs and values aligned with JSON. Keep findings strictly about UX/UI and design psychology. Do not include source code edits or describe recommendations as completed work.

## Example

See the synthetic [Markdown report](../examples/audit-report.example.md) and its matching [JSON report](../examples/audit-report.example.json). Both use fictional product details and contain no real research or measured user outcomes.
