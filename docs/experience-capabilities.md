# Interface capabilities and boundaries

The three skills divide interface work by the requested outcome. These guides are original instructions for this repository; they do not install or call an external command pack.

| Requested outcome | Lead skill | Current support |
| --- | --- | --- |
| Understand audience, journeys, and visible design problems | `audit-frontend-designer-konvert` | Read-only evidence and a structured report. |
| Review visual hierarchy, content clarity, states, and interaction quality | `audit-frontend-designer-konvert` | Task-based inspection; observed behavior is distinguished from hypotheses. |
| Build a new interface from a brief | `create-frontend-from-zero-konvert` | Product discovery, original direction, implementation, and rendered checks. |
| Compare directions before a new build | `create-frontend-from-zero-konvert` | Written options and, when useful, local visual prototypes; no generated mock is treated as a working interface. |
| Implement an approved audit finding | `design-por-referencia-konvert` | Report validation, approval and dependency gates, before/after comparison. |
| Adapt a supplied visual reference | `design-por-referencia-konvert` | Extract visual roles and compare implementation against the source. |
| Refine typography, color, composition, motion, copy, onboarding, or responsive behavior in an existing UI | `design-por-referencia-konvert` | Direct scoped instruction, preservation of existing contracts, rendered verification. |
| Compare alternatives for an existing component or page | `design-por-referencia-konvert` | Separate local alternatives reviewed with capture and measured-style scripts. |
| Describe the existing visual system | `design-por-referencia-konvert` | Read code and render, distinguish measured from declared values, write a design document only when requested. |
| Diagnose and improve interface performance | `design-por-referencia-konvert` for existing UI; `create-frontend-from-zero-konvert` for new UI | Measure the specific route and condition before claiming a cause or gain. |
| Evolve Tailwind tokens, themes, and shared components | `design-por-referencia-konvert` for an existing system; `create-frontend-from-zero-konvert` for a new interface | Confirm the installed version, generated CSS, component behavior, and a consuming app. |
| Implement UI work in an existing Next.js app | `design-por-referencia-konvert`; `create-frontend-from-zero-konvert` for a new interface | Identify the target router and version, preserve client/server boundaries, and verify route states and rendered assets. |
| Design page structure and navigation for a new site | `create-frontend-from-zero-konvert` | Map supplied content to tasks, labels, routes, and reachable states; leave unknown inventory and migration rules explicit. |
| Verify interactive UI flows | `design-por-referencia-konvert` for an existing UI; `create-frontend-from-zero-konvert` for a new build | Reuse an authorized test environment and the target project's browser runner; capture scripts do not click or submit. |
| Implement or refine interface motion | `design-por-referencia-konvert` for an existing UI; `create-frontend-from-zero-konvert` for a new build | Define state transitions, interruption and reduced-motion behavior; inspect the running interaction. |

The browser tools capture and compare pages; they do not supply an interactive element picker, variant overlay, automatic source application, or a background editing hook. Native Android and iOS design are outside the scope of these frontend web skills. None of the guides proves agent routing accuracy or user outcomes; evaluation runs remain unmeasured.

No transition library, animation recipe, static scanner, CSS asset, or browser-test runner is bundled by these additions. The agent must verify capabilities already present in the target project before claiming a functional test or performance result.

General API engineering, cache architecture, authentication, deployment, and framework upgrades are separate tasks. A frontend request alone does not authorize those changes.
