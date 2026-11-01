export function validateSkillDirectories(skills) {
  const errors = [];
  for (const skill of skills) {
    if (!skill.directory.endsWith('-konvert')) errors.push(`${skill.directory}: skill directory must end with -konvert`);
    if (!skill.name || skill.name !== skill.directory) errors.push(`${skill.directory}: frontmatter name must match directory`);
  }
  return errors;
}

/**
 * Lists the `paths` filters of the push and pull_request triggers in a workflow file.
 * Minimal reader for this repository's block-style YAML; returns null for a missing event.
 */
export function workflowTriggerPaths(text) {
  const result = { push: null, pull_request: null };
  let event = null, inPaths = false;
  for (const line of String(text).split(/\r?\n/)) {
    if (/^\S/.test(line)) { event = null; inPaths = false; continue; }
    const eventMatch = line.match(/^ {2}(push|pull_request):\s*$/);
    if (eventMatch) { event = eventMatch[1]; result[event] = []; inPaths = false; continue; }
    if (/^ {2}\S/.test(line)) { event = null; inPaths = false; continue; }
    if (event && /^ {4}paths:\s*$/.test(line)) { inPaths = true; continue; }
    if (event && /^ {4}\S/.test(line)) { inPaths = false; continue; }
    const item = inPaths && line.match(/^ {6}- ['"]?([^'"]+)['"]?\s*$/);
    if (item) result[event].push(item[1]);
  }
  return result;
}

/** Every skill directory must trigger CI on push and pull_request, so non-Markdown changes are tested too. */
export function validateWorkflowTriggers(text, skillDirectories, file = 'workflow') {
  const errors = [];
  const triggers = workflowTriggerPaths(text);
  for (const event of ['push', 'pull_request']) {
    const paths = triggers[event];
    if (!paths) { errors.push(`${file}: missing ${event} trigger`); continue; }
    if (!paths.length) continue; // no filter: every change triggers the workflow
    for (const directory of skillDirectories) {
      if (!paths.includes(`skills/${directory}/**`)) errors.push(`${file}: ${event} paths must include skills/${directory}/**`);
    }
  }
  return errors;
}

/** Every installed reference must be discoverable from its skill entry point. */
export function validateSkillContent(name, text, files) {
  const sections = {
    'audit-frontend-designer-konvert': ['Fluxo', 'Princípios de design', 'Catálogo de referências', 'Formato do relatório'],
    'design-por-referencia-konvert': ['Ordem de precedência', 'Fluxo', 'Evidência visual e privacidade', 'Limites'],
    'create-frontend-from-zero-konvert': ['Fronteiras e colaboração', 'Fluxo', 'Definição de pronto', 'Referências e exemplos'],
  };
  const errors = [];
  for (const section of sections[name] ?? []) if (!text.includes(`## ${section}`)) errors.push(`missing ${section} section`);
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').replace(/`[^`\n]+`/g, '');
  const links = new Set([...prose.matchAll(/\]\(([^\s)]+)\)/g)].map((m) => m[1].split('#')[0]));
  for (const file of files) if (!links.has(file)) errors.push(`supporting file must be linked: ${file}`);
  return errors;
}
