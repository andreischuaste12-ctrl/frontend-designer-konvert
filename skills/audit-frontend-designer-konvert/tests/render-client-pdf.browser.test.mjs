import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPdf } from '../scripts/render-client-pdf.mjs';

// Real Chromium end to end. The browser-test runner supplies a verified browser; the path override is
// removed below so this also covers discovery without any manual environment configuration.
const here = path.dirname(fileURLToPath(import.meta.url));
const browserScripts = path.resolve(here, '../../design-por-referencia-konvert/scripts');
const example = JSON.parse(await fs.readFile(path.join(here, '../examples/audit-report.example.json'), 'utf8'));

test('renders a real PDF from the example report and refuses to overwrite it', { timeout: 120000 }, async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'render-pdf-e2e-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const out = path.join(dir, 'audit-report-client.pdf');
  const previous = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  delete process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  t.after(() => { if (previous !== undefined) process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = previous; });

  await renderPdf({ input: example, out, browserScripts });
  const first = await fs.readFile(out);
  assert.equal(first.subarray(0, 5).toString('latin1'), '%PDF-');
  assert.ok(first.includes('%%EOF'), 'PDF is complete');
  assert.ok(first.length > 5000, 'PDF has rendered content');
  assert.ok(/\/Count \d+/.test(first.toString('latin1')), 'PDF has a page tree');
  assert.equal(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, undefined, 'discovery does not leak into the environment');

  await assert.rejects(renderPdf({ input: example, out, browserScripts }), { code: 'EEXIST' });
  assert.deepEqual(await fs.readFile(out), first, 'the existing PDF is untouched');
});
