# Synthetic frontend audit

> Fictional example. No real website, customer, account, or user study was used. This report does not authorize implementation.

## Report context

- Report ID: `SYNTH-001`
- Project: fictional product detail page
- Scope: compare product options and add one item to cart; mobile and desktop visual review
- Evidence limits: synthetic product brief and rendered example only; no representative user research

## Findings

### UX-001 — Delivery cost is absent before cart

- **Priority:** P1
- **Location:** fictional product detail page, price and purchase panel
- **Observed evidence:** In the synthetic flow, delivery cost appears only after adding the item to the cart.
- **Probable impact:** Shoppers may postpone a decision or encounter an unexpected cost; this effect is a hypothesis, not a measured outcome.
- **Confidence:** medium — the sequence is visible in the supplied synthetic flow; user impact is a hypothesis.
- **Preserve:** Existing shipping rules, total-price calculation, checkout contract, and purchase action.
- **Next step:** Ask the product owner for approved shipping-estimate rules, then show an estimate near the price if authorized.
- **Acceptance criteria:** The product page states how delivery cost is determined before cart, using the approved shipping rules; keyboard and mobile checks pass.
- **Requires external data or approval:** Yes — product owner must confirm shipping rules.
- **Approved for implementation:** false

### UX-002 — Internal option codes need explanation

- **Priority:** P2
- **Location:** fictional product detail page, option selector
- **Observed evidence:** The option labels contain internal paper codes without an explanation in the synthetic brief.
- **Probable impact:** First-time shoppers may not compare options confidently; comprehension is untested.
- **Confidence:** low — code labels are observed, but shopper comprehension was not tested.
- **Preserve:** Available options, product data values, and selection behavior.
- **Next step:** Request approved plain-language attributes and validate comprehension with representative shoppers.
- **Acceptance criteria:** Every option exposes an approved, understandable attribute without changing the underlying product value.
- **Requires external data or approval:** Yes — approved attribute names and user validation.
- **Approved for implementation:** false

## What to preserve

- Current product data and selection behavior.
- Existing price and checkout calculations.
- Purchase control and its accessible name.

## Proposed handoff

After the user approves individual findings and any required external inputs are available, pass this report to `design-por-referencia-konvert`. Implement only findings marked approved, preserve the items above, and verify each acceptance criterion. No implementation has been performed.
