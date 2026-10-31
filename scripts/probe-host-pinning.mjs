#!/usr/bin/env node
// Opt-in local-only experiment; it does not validate or protect public targets.
import { createServer } from 'node:http';
import { loadPlaywright } from '../skills/design-por-referencia-konvert/scripts/_common.mjs';

const server = createServer((_req, res) => res.end('synthetic'));
try {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '::', resolve); });
  const url = `http://localhost:${server.address().port}/`;
  const pw = loadPlaywright();
  async function probe(rule, mediated) {
    const browser = await pw.chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: rule ? ['--host-resolver-rules=MAP localhost ~NOTFOUND'] : [] });
    try {
      const context = await browser.newContext();
      if (mediated) await context.route('**/*', async (route) => {
        try { const response = await route.fetch({ maxRedirects: 0, timeout: 3000 }); await route.fulfill({ response }); await response.dispose(); }
        catch { await route.abort(); }
      });
      const page = await context.newPage();
      try { return (await page.goto(url, { timeout: 5000 }))?.status() === 200; } catch { return false; }
    } finally { await browser.close(); }
  }
  const control = await probe(false, false), ruleDirect = await probe(true, false), ruleMediated = await probe(true, true);
  console.log(JSON.stringify({ control, ruleDirect, ruleMediated, finding: control && !ruleDirect && ruleMediated ? 'browser-rule-does-not-cover-mediated-fetch' : 'inconclusive', note: 'Loopback-only experiment; not a DNS rebinding or sandbox guarantee.' }, null, 2));
} catch { console.error('Pinning probe could not run; check local Chromium and dual-stack loopback. Details omitted.'); process.exitCode = 2; }
finally { server.closeAllConnections?.(); if (server.listening) await new Promise((resolve) => server.close(resolve)); }
