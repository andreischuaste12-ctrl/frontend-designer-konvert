// Utilitários compartilhados pelos scripts de captura e inspeção.
// Somente leitura em relação ao alvo: só navegação GET; nada é clicado, enviado ou instalado.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

export function fail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

// Procura o Playwright primeiro a partir do diretório atual (projeto auditado),
// depois a partir da pasta do script (instalação global ou NODE_PATH).
export function loadPlaywright() {
  const bases = [path.join(process.cwd(), 'noop.js'), import.meta.url];
  for (const base of bases) {
    try {
      return createRequire(base)('playwright');
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err;
    }
  }
  return fail(
    'Playwright não encontrado. Instale no projeto (npm i -D playwright) ou globalmente e rode ' +
      '`npx playwright install chromium`. Este script não instala nada.',
    2,
  );
}

export async function launch(pw) {
  try {
    return await pw.chromium.launch();
  } catch (err) {
    return fail(
      `Não foi possível iniciar o Chromium: ${String(err.message).split('\n')[0]}\n` +
        'Rode `npx playwright install chromium` (este script não instala nada).',
      2,
    );
  }
}

export function checkUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return fail(`URL inválida: ${raw}`);
  }
  if (!['http:', 'https:', 'file:'].includes(u.protocol)) {
    return fail(`Protocolo não permitido: ${u.protocol} (use http, https ou file)`);
  }
  return u;
}

export function resolveRoutes(base, csv) {
  const list = String(csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return [base];
  return list.map((r) => new URL(r, base));
}

export function routeSlug(u) {
  const raw = (u.pathname + (u.search ? '-q' : '')).replace(/^\/+|\/+$/g, '');
  const s = raw.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return s ? s.slice(0, 60) : 'home';
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function intList(csv, { min = 1, max = 100000 } = {}) {
  return String(csv)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= min && n <= max);
}

// Executado dentro da página antes de qualquer script dela (addInitScript).
// Registra LCP e CLS em window.__audit. Valores de laboratório: indicativos, não de campo.
export function metricsInit() {
  window.__audit = { lcp: null, cls: 0 };
  try {
    new PerformanceObserver((list) => {
      const e = list.getEntries().at(-1);
      if (e) {
        window.__audit.lcp = {
          time: Math.round(e.startTime),
          size: e.size,
          url: e.url || null,
          tag: e.element ? e.element.tagName : null,
        };
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__audit.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {
    /* navegador sem suporte: métricas ficam nulas */
  }
}

const FREEZE_CSS =
  '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';

async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(innerHeight * 0.8));
    let y = 0;
    for (let i = 0; i < 60; i++) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
      if (y + innerHeight >= document.documentElement.scrollHeight) break;
      y += step;
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
}

// Carrega a página e a deixa estável: fontes prontas, animações congeladas,
// rolagem completa para disparar lazy loading. Retorna a resposta HTTP da navegação.
export async function preparePage(page, url, timeout) {
  const resp = await page.goto(url, { waitUntil: 'load', timeout });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.addStyleTag({ content: FREEZE_CSS }).catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await autoScroll(page);
  return resp;
}
