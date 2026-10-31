export function validateSkillDirectories(skills) {
  const errors = [];
  for (const skill of skills) {
    if (!skill.directory.endsWith('-konvert')) errors.push(`${skill.directory}: skill directory must end with -konvert`);
    if (!skill.name || skill.name !== skill.directory) errors.push(`${skill.directory}: frontmatter name must match directory`);
  }
  return errors;
}
