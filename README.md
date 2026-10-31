# Frontend Designer

A skill for evaluating and improving frontend interfaces with a focus on visual design, clarity, usability, and real-world context. Before proposing a redesign or changing code, it guides the agent to understand the project, identify its audience and primary task, audit what already works, and document opportunities while separating evidence from assumptions.

## What the skill includes

- Aesthetic audits tied to comprehension, readability, trust, and task completion.
- Audience and usage-context analysis without inventing personas.
- An organized reference catalog for ecommerce, landing pages, product flows, visual direction, components, typography, usability, and accessibility.
- Guidance for proposing, implementing, and verifying improvements within the existing stack.

## Activation trigger

Use the `frontend-designer` skill when a task asks you to analyze or audit a website or frontend application, assess its visual design or usability, understand its audience, research references, improve a landing page, review a user journey, or implement visual and responsive improvements.

Requests that should activate the skill include:

- “Audit this page's experience and visual design before changing the code.”
- “Analyze who uses this site and suggest usability improvements.”
- “Compare this landing page with relevant references and implement the highest-priority improvements.”
- “Review this interface on desktop and mobile while preserving what already works.”

## Download and install

Use Git and Bash to clone only the skill folder into this project's skills directory:

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/andreischuaste12-ctrl/frontend-designer-konvert.git \
  /tmp/frontend-designer-konvert
git -C /tmp/frontend-designer-konvert sparse-checkout set skills/frontend-designer
mkdir -p .agents/skills
cp -R /tmp/frontend-designer-konvert/skills/frontend-designer .agents/skills/
```

The expected result is `.agents/skills/frontend-designer/SKILL.md` alongside its `knowledge-base` folder. If your agent uses a different skills directory, copy `skills/frontend-designer` to the location it recognizes. Restart or refresh the agent if it does not detect the skill automatically.

## Structure

```text
skills/frontend-designer/
├── SKILL.md
└── knowledge-base/
    ├── 01-auditoria-estetica-e-publico.md
    └── 02-catalogo-de-referencias.md
```

## Author and license

Created by **Andrei Schuaste**. This project is distributed under the MIT License. See [LICENSE](LICENSE) for the full terms.
