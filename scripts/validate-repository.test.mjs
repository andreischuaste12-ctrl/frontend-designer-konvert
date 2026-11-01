import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSkillDirectories, validateWorkflowTriggers, workflowTriggerPaths, validateSkillContent } from './skill-directory-contract.mjs';

test('accepts skill directories ending in -konvert with matching frontmatter names', () => {
  assert.deepEqual(validateSkillDirectories([
    { directory: 'audit-frontend-designer-konvert', name: 'audit-frontend-designer-konvert' },
    { directory: 'design-por-referencia-konvert', name: 'design-por-referencia-konvert' },
  ]), []);
});

test('rejects skill directory names without -konvert and frontmatter mismatches', () => {
  assert.deepEqual(validateSkillDirectories([
    { directory: 'wrong-name', name: 'another-name' },
    { directory: 'design-por-referencia-konvert', name: 'different-name' },
  ]), [
    'wrong-name: skill directory must end with -konvert',
    'wrong-name: frontmatter name must match directory',
    'design-por-referencia-konvert: frontmatter name must match directory',
  ]);
});

const workflow = (paths) => `name: x\n\non:\n  push:\n    paths:\n${paths}  pull_request:\n    paths:\n${paths}  workflow_dispatch:\n\npermissions:\n  contents: read\n`;
test('every skill directory must trigger CI on push and pull_request', () => {
  const both = "      - '**/*.md'\n      - 'skills/a-konvert/**'\n      - 'skills/b-konvert/**'\n";
  assert.deepEqual(workflowTriggerPaths(workflow(both)).push, ['**/*.md', 'skills/a-konvert/**', 'skills/b-konvert/**']);
  assert.deepEqual(validateWorkflowTriggers(workflow(both), ['a-konvert', 'b-konvert']), []);
  const missing = "      - '**/*.md'\n      - 'skills/a-konvert/**'\n";
  assert.deepEqual(validateWorkflowTriggers(workflow(missing), ['a-konvert', 'b-konvert']), [
    'workflow: push paths must include skills/b-konvert/**',
    'workflow: pull_request paths must include skills/b-konvert/**',
  ]);
  assert.deepEqual(validateWorkflowTriggers('on:\n  workflow_dispatch:\n', ['a-konvert']), ['workflow: missing push trigger', 'workflow: missing pull_request trigger']);
});


test('every skill must link its supporting Markdown; a code sample is not navigation', () => {
  for (const name of ['audit-frontend-designer-konvert', 'design-por-referencia-konvert', 'create-frontend-from-zero-konvert']) {
    assert.ok(validateSkillContent(name, '```md\n[x](references/a.md)\n```', ['references/a.md']).some((e) => e.includes('supporting file')));
    assert.ok(!validateSkillContent(name, '[x](references/a.md#example)', ['references/a.md']).some((e) => e.includes('supporting file')));
    assert.ok(validateSkillContent(name, '', []).some((e) => e.includes('section')));
  }
});
