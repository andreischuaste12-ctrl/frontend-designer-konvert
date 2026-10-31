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
