#!/usr/bin/env node
// Captura capturas de tela de rotas em várias larguras, fatiadas em tiles e com recortes de
// controles em foco/hover. Somente navegação GET: não clica, não envia formulários, não aceita
// banners de consentimento. Campos de texto são mascarados por padrão.
import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  loadPlaywright,
  launch,
  checkUrl,
  resolveRoutes,
  routeSlug,
  ensureDir,
  intList,
  metricsInit,
  preparePage,
  fail,
} from './_common.mjs';

const HELP = `Uso: node capture.mjs --url <url> [opções]

  --url <url>              Página ou base do site (http, https ou file). Obrigatório.
  --routes </a,/b>         Rotas relativas à URL (padrão: só a URL).
  --out <dir>              Saída (padrão: .audit/screenshots). Mantenha fora do Git.
  --widths <lista>         Larguras em px (padrão: 320,375,768,1024,1440).
  --schemes <lista>        light,dark (padrão: light).
  --tile-height <px>       Altura de cada fatia (padrão: 900; sobreposição de 100).
  --max-tiles <n>          Máximo de fatias por rota/largura (padrão: 12).
  --max-controls <n>       Controles (CTAs) para foco/hover (padrão: 6).
  --control-widths <lista> Larguras que recebem recortes de controles (padrão: 375,1440).
  --no-mask                Não mascarar campos de texto (use só com dados fictícios).
  --timeout <ms>           Timeout de navegação (padrão: 30000).

Saída: rota__largura__estado.png + capture-index.json (metadados e evidências).`;

const { values: a } = parseArgs({
  options: {
    url: { type: 'string' },
    routes: { type: 'string', default: '' },
    out: { type: 'string', default: '.audit/screenshots' },
    widths: { type: 'string', default: '320,375,768,1024,1440' },
    schemes: { type: 'string', default: 'light' },
    'tile-height': { type: 'string', default: '900' },
    'max-tiles': { type: 'string', default: '12' },
    'max-controls': { type: 'string', default: '6' },
    'control-widths': { type: 'string', default: '375,1440' },
    'no-mask': { type: 'boolean', default: false },
    timeout: { type: 'string', default: '30000' },
    help: { type: 'boolean', default: false },
  },
});

if (a.help || !a.url) {
  console.log(HELP);
  process.exit(a.help ? 0 : 1);
}

const base = checkUrl(a.url);
const routes = resolveRoutes(base, a.routes);
const widths = intList(a.widths, { min: 200, max: 4000 });
const schemes = String(a.schemes).split(',').map((s) => s.trim()).filter((s) => s === 'light' || s === 'dark');
const controlWidths = intList(a['control-widths'], { min: 200, max: 4000 });
const tileHeight = Math.max(300, Number(a['tile-height']) || 900);
const maxTiles = Math.max(1, Number(a['max-tiles']) || 12);
const maxControls = Math.max(0, Number(a['max-controls']) || 0);
const timeout = Number(a.timeout) || 30000;
if (!widths.length || !schemes.length) fail('--widths ou --schemes sem valores válidos.');

const OVERLAP = 100;
const CONTROL_SEL = 'a[href], button, [role="button"], input[type="submit"], input[type="button"], summary';
const MASK_SEL =
  'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea';

const outDir = await ensureDir(path.resolve(a.out));
const pw = loadPlaywright();
const browser = await launch(pw);

const index = {
  tool: 'capture.mjs',
  startedAt: new Date().toISOString(),
  base: base.href,
  widths,
  schemes,
  notes: [
    'Animações e transições congeladas via CSS injetado; rolagem completa feita antes da captura (lazy loading).',
    'Banners de consentimento não são clicados: se cobrirem a página, aparecem nas capturas.',
    'LCP/CLS são medidas de laboratório (indicativas). Candidatos a overflow incluem elementos fora da tela de propósito.',
    'Campos de texto mascarados, salvo --no-mask.',
  ],
  pages: [],
  files: [],
};

async function shootAround(page, el, file, mask) {
  await el.scrollIntoViewIfNeeded({ timeout: 2000 });
  const box = await el.boundingBox();
  if (!box) return false;
  const vp = page.viewportSize();
  const pad = 24;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  const width = Math.min(vp.width - x, box.width + pad * 2);
  const height = Math.min(vp.height - y, box.height + pad * 2);
  if (width <= 0 || height <= 0) return false;
  await page.screenshot({ path: file, clip: { x, y, width, height }, mask });
  return true;
}

async function captureRoute(ctx, route, width, scheme) {
  const slug = routeSlug(route);
  const sfx = scheme === 'light' ? '' : `-${scheme}`;
  const name = (state) => `${slug}__${width}__${state}${sfx}.png`;
  const record = (file, state) => index.files.push({ file, route: route.pathname, width, scheme, state });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${String(e.message).slice(0, 300)}`));
  page.on('requestfailed', (r) =>
    failedRequests.push({ url: r.url().slice(0, 200), reason: r.failure()?.errorText ?? null }),
  );

  const info = { route: route.href, slug, width, scheme };
  try {
    const resp = await preparePage(page, route.href, timeout);
    info.status = resp ? resp.status() : null;
    info.finalUrl = page.url();
    const m = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang || null,
      viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null,
      docHeight: document.documentElement.scrollHeight,
      docWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      lcp: window.__audit?.lcp ?? null,
      cls: Number((window.__audit?.cls ?? 0).toFixed(4)),
    }));
    Object.assign(info, m);
    info.horizontalOverflow = m.docWidth > m.innerWidth + 1;
    if (info.horizontalOverflow) {
      info.overflowCandidates = await page.evaluate(() => {
        const w = window.innerWidth;
        const out = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.right > w + 1) {
            out.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              class: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
            if (out.length >= 8) break;
          }
        }
        return out;
      });
    }

    const mask = a['no-mask'] ? [] : [page.locator(MASK_SEL)];

    // Página inteira (pode falhar em páginas muito altas; as fatias cobrem esse caso).
    try {
      const f = name('full');
      await page.screenshot({ path: path.join(outDir, f), fullPage: true, mask });
      record(f, 'full');
    } catch (err) {
      info.fullPageError = String(err.message).split('\n')[0];
    }

    // Fatias com sobreposição: detalhes legíveis mesmo se o visualizador reduzir imagens grandes.
    const step = tileHeight - OVERLAP;
    let tiles = 0;
    for (let y = 0; y < m.docHeight && tiles < maxTiles; y += step) {
      const h = Math.min(tileHeight, m.docHeight - y);
      if (h <= OVERLAP && tiles > 0) break;
      tiles += 1;
      const f = name(`tile-${String(tiles).padStart(2, '0')}`);
      await page.screenshot({
        path: path.join(outDir, f),
        fullPage: true,
        clip: { x: 0, y, width: m.innerWidth, height: h },
        mask,
      });
      record(f, `tile-${tiles}`);
    }
    info.tiles = tiles;
    info.tilesTruncated = tiles >= maxTiles && (tiles - 1) * step + tileHeight < m.docHeight;

    // Recortes de controles: foco (teclado) e hover. Nunca clica.
    if (maxControls > 0 && controlWidths.includes(width)) {
      const picks = await page.evaluate(
        ({ sel, n }) => {
          const cand = [];
          [...document.querySelectorAll(sel)].forEach((el, i) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            if (r.width < 24 || r.height < 16 || s.visibility === 'hidden' || s.display === 'none') return;
            const label = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40);
            cand.push({ i, label, score: (r.top + scrollY < innerHeight * 1.5 ? 1e6 : 0) + r.width * r.height });
          });
          return cand.sort((x, y2) => y2.score - x.score).slice(0, n).sort((x, y2) => x.i - y2.i);
        },
        { sel: CONTROL_SEL, n: maxControls },
      );
      info.controls = [];
      let n = 0;
      for (const p of picks) {
        n += 1;
        const el = page.locator(CONTROL_SEL).nth(p.i);
        const entry = { n, label: p.label, files: [] };
        try {
          await page.mouse.move(0, 0);
          await page.keyboard.press('Shift'); // marca modalidade de teclado para :focus-visible
          await el.focus({ timeout: 2000 });
          const ff = name(`ctrl-${n}-focus`);
          if (await shootAround(page, el, path.join(outDir, ff), mask)) {
            entry.files.push(ff);
            record(ff, `ctrl-${n}-focus`);
          }
          await el.evaluate((node) => node.blur());
          await el.hover({ timeout: 2000 });
          const fh = name(`ctrl-${n}-hover`);
          if (await shootAround(page, el, path.join(outDir, fh), mask)) {
            entry.files.push(fh);
            record(fh, `ctrl-${n}-hover`);
          }
        } catch (err) {
          entry.error = String(err.message).split('\n')[0];
        }
        info.controls.push(entry);
      }
    }
  } catch (err) {
    info.error = String(err.message).split('\n')[0];
  } finally {
    info.consoleErrors = consoleErrors.slice(0, 10);
    info.failedRequests = failedRequests.slice(0, 10);
    await page.close();
  }
  return info;
}

for (const scheme of schemes) {
  for (const width of widths) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: scheme,
      reducedMotion: 'reduce',
      bypassCSP: true, // permite injetar o CSS que congela animações
    });
    await ctx.addInitScript(metricsInit);
    for (const route of routes) {
      const info = await captureRoute(ctx, route, width, scheme);
      index.pages.push(info);
      const status = info.error
        ? `ERRO ${info.error}`
        : `status ${info.status} · ${info.tiles ?? 0} fatias · overflow ${info.horizontalOverflow ? 'SIM' : 'não'}` +
          ` · LCP ${info.lcp?.time ?? 'n/d'}ms · CLS ${info.cls}`;
      console.log(`${info.slug} ${width}px ${scheme}: ${status}`);
    }
    await ctx.close();
  }
}
await browser.close();

index.finishedAt = new Date().toISOString();
await fs.writeFile(path.join(outDir, 'capture-index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log(`\n${index.files.length} arquivos de captura + capture-index.json em ${outDir}`);
console.log('Lembrete: mantenha esta pasta fora do Git (ex.: .audit/ no .gitignore) e não publique as capturas.');
