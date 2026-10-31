import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSkillDirectories } from './skill-directory-contract.mjs';

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
