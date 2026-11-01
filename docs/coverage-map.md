# Coverage map

The map records **guidance**, not validated behavior, accessibility conformance, platform integration, or an agent score. Every non-empty cell cites existing knowledge units, and `scripts/check-knowledge-units.mjs` enforces the rules below.

For current counts, run `node scripts/check-knowledge-units.mjs`. Do not infer current totals from historical changelog entries. A recorded source consultation can still be pending human review; the inventory reports that separately. No cell demonstrates agent efficacy or an integration test unless a corresponding execution was actually recorded.

## Cell labels

| Label | Meaning | Enforced rule |
| --- | --- | --- |
| `orientação: IDs` | Guidance exists, but at least one cited unit relies on an unverified editorial heuristic. | Every cited unit exists. |
| `verificação: IDs` | Every cited unit has a source read at a recorded commit and an observable acceptance criterion. | Every cited unit has `verificado em AAAA-MM-DD` in `Fonte`. |
| `teste: IDs` | The units are also exercised by an evaluation case. | Reserved; not claimed yet. |
| `—` | Known gap. | — |
| `não se aplica` | The journey does not exist for that stack (for example, storefront themes have no dashboards). | Only allowed in the journey × stack table. |

In the journey × stack table, a cited unit must name that stack in its `Contexto`; generic units cannot fill stack cells. In the journey × state table, a cited unit must list that state in `Estados`.

## Journey × stack

| Journey | Shopify | VTEX IO | WordPress/Woo | React/Next + Tailwind | HTML |
| --- | --- | --- | --- | --- | --- |
| Checkout and payment | verificação: UXK-CHK-101 | verificação: UXK-CHK-201 | verificação: UXK-CHK-301 | verificação: UXK-CHK-401 | não se aplica |
| Forms and sign-up | verificação: UXK-FRM-101 | verificação: UXK-FRM-201 | verificação: UXK-FRM-301 | verificação: UXK-FRM-401 | verificação: UXK-FRM-501 |
| Mobile navigation, search and listings | verificação: UXK-NAV-101 | verificação: UXK-NAV-201 | verificação: UXK-NAV-301 | verificação: UXK-NAV-401 | verificação: UXK-NAV-501 |
| Errors, empty states and recovery | verificação: UXK-ERR-101 | verificação: UXK-ERR-201 | verificação: UXK-ERR-301 | verificação: UXK-ERR-401 | orientação: UXK-ERR-501 |
| Tables and dashboards | não se aplica | não se aplica | não se aplica | verificação: UXK-DSH-401 | não se aplica |

## Journey × state

| Journey | Normal | Loading | Error | Success | Empty | Recovery |
| --- | --- | --- | --- | --- | --- | --- |
| Checkout and payment | verificação: UXK-CHK-004 | verificação: UXK-CHK-005 | verificação: UXK-CHK-006 | verificação: UXK-CHK-007 | verificação: UXK-CHK-008 | verificação: UXK-CHK-009 |
| Forms and sign-up | verificação: UXK-FRM-003 | verificação: UXK-FRM-004 | verificação: UXK-FRM-005 | verificação: UXK-FRM-006 | verificação: UXK-FRM-007 | verificação: UXK-FRM-008 |
| Mobile navigation, search and listings | verificação: UXK-NAV-005, UXK-NAV-054 | verificação: UXK-NAV-006 | orientação: UXK-NAV-007 | orientação: UXK-NAV-008 | orientação: UXK-NAV-009 | orientação: UXK-NAV-010 |
| Errors, empty states and recovery | verificação: UXK-ERR-002 | orientação: UXK-ERR-003 | verificação: UXK-ERR-004 | orientação: UXK-ERR-005 | orientação: UXK-ERR-006 | verificação: UXK-ERR-007 |
| Tables and dashboards | verificação: UXK-DSH-002, UXK-DSH-051 | orientação: UXK-DSH-003 | orientação: UXK-DSH-004 | verificação: UXK-DSH-005 | orientação: UXK-DSH-006 | orientação: UXK-DSH-007 |

Cells labelled `orientação` are the next verification targets: they need a primary source or a moderated test before they can be promoted.
