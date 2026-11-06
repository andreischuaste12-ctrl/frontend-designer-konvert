import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { clientHtml, renderPdf } from '../scripts/render-client-pdf.mjs';

const example = JSON.parse(await fs.readFile(new URL('../examples/audit-report.example.json', import.meta.url), 'utf8'));

test('client report explains evidence, rationale, improvement, verification and limitations', () => {
  const { html } = clientHtml(example);
  for (const expected of ['UX-001', 'O que foi observado', 'Por que isso importa', 'Como melhorar', 'Como verificar a melhoria', 'Precisa de validação', 'Limites da evidência', 'Estados não observados, bloqueados ou não aplicáveis']) assert.ok(html.includes(expected), expected);
  assert.ok(html.indexOf('UX-001') < html.indexOf('UX-003'));
  assert.ok(html.includes(example.findings[0].next_step));
  assert.ok(html.includes('Aprovado no relatório'));
  assert.ok(html.includes('Não aprovado para implementação no relatório'));
});

test('rejects invalid reports and escapes report content as text', () => {
  assert.throws(() => clientHtml({}), /Relatório inválido/);
  const report = structuredClone(example);
  report.project = '<img src=x onerror=alert(1)>';
  const { html } = clientHtml(report);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
  report.scope.tasks = [{ toString: null }];
  assert.doesNotThrow(() => clientHtml(report));
});

// Browser selection is verified with a stub `_common.mjs`, so no browser is launched here.
const ENV = 'PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH';

async function stubBrowserScripts(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'render-pdf-stub-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const scripts = path.join(dir, 'scripts');
  await fs.mkdir(scripts);
  await fs.writeFile(path.join(scripts, '_common.mjs'), `
    export const loadPlaywright = () => ({});
    export async function launch() {
      globalThis.__seenBrowserPath = process.env.${ENV};
      return { close: async () => {}, newPage: async () => ({ route: async () => {}, setContent: async () => {}, pdf: async () => Buffer.from('%PDF-stub') }) };
    }
  `);
  return scripts;
}

async function withEnv(value, task) {
  const previous = process.env[ENV];
  if (value === undefined) delete process.env[ENV]; else process.env[ENV] = value;
  delete globalThis.__seenBrowserPath;
  try { return await task(); }
  finally { if (previous === undefined) delete process.env[ENV]; else process.env[ENV] = previous; }
}

test('PDF rendering uses the browser discovered by the diagnostics and restores the environment', async (t) => {
  const browserScripts = await stubBrowserScripts(t);
  const out = path.join(path.dirname(browserScripts), 'a.pdf');
  const asked = [];
  await withEnv(undefined, async () => {
    await renderPdf({ input: example, out, browserScripts, prepare: async (dir) => { asked.push(dir); return { status: 'ready', executablePath: '/discovered/chromium' }; } });
    assert.equal(globalThis.__seenBrowserPath, '/discovered/chromium');
    assert.equal(process.env[ENV], undefined);
  });
  assert.deepEqual(asked, [path.dirname(browserScripts)]);
});

test('an explicit browser override wins and skips discovery; failed discovery falls back to the default launch', async (t) => {
  const browserScripts = await stubBrowserScripts(t);
  const dir = path.dirname(browserScripts);
  await withEnv('/explicit/chromium', async () => {
    await renderPdf({ input: example, out: path.join(dir, 'b.pdf'), browserScripts, prepare: () => { throw new Error('must not probe'); } });
    assert.equal(globalThis.__seenBrowserPath, '/explicit/chromium');
    assert.equal(process.env[ENV], '/explicit/chromium');
  });
  await withEnv(undefined, async () => {
    await renderPdf({ input: example, out: path.join(dir, 'c.pdf'), browserScripts, prepare: async () => ({ status: 'unavailable', reason: 'none' }) });
    assert.equal(globalThis.__seenBrowserPath, undefined);
  });
});
