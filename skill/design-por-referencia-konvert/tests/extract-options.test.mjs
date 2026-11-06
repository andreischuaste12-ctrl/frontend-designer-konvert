import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/extract-styles.mjs', import.meta.url));

test('invalid viewport and scheme are rejected before browser launch', () => {
  for (const [option, value, message] of [
    ['--width', '0', /--width/],
    ['--width', '375.5', /--width/],
    ['--width', 'not-a-number', /--width/],
    ['--scheme', 'drak', /--scheme/],
  ]) {
    const result = spawnSync(process.execPath, [script, '--url', 'http://localhost:3000', option, value], { encoding: 'utf8' });
    assert.equal(result.status, 1, `${option} ${value}`);
    assert.match(result.stderr, message);
  }
});
