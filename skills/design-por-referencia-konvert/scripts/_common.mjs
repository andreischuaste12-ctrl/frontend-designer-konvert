// Utilitários compartilhados pelos scripts de captura e inspeção.
// Os scripts navegam com GET e não clicam nem enviam formulários, mas executam JS da página.
import { createRequire } from 'node:module';
import { isIP } from 'node:net';
import { realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    return await pw.chromium.launch(executablePath ? { executablePath } : {});
  } catch (err) {
    return fail(
      `Não foi possível iniciar o Chromium: ${String(err.message).split('\n')[0]}\n` +
        'Rode `npx playwright install chromium` (este script não instala nada).',
      2,
    );
  }
}

const TRACKER_HOSTS = [
  'google-analytics.com', 'googletagmanager.com', 'doubleclick.net', 'googleadservices.com',
  'connect.facebook.net', 'analytics.tiktok.com', 'clarity.ms', 'hotjar.com', 'bat.bing.com',
  'segment.io', 'segment.com',
];
const METADATA_HOSTS = new Set(['metadata', 'metadata.google.internal', 'metadata.goog', '100.100.100.200']);

function isTrackerUrl(u) {
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'facebook.com' || host.endsWith('.facebook.com')) return u.pathname === '/tr' || u.pathname.startsWith('/tr/');
  return TRACKER_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function isLoopback(host) {
  const value = host.replace(/^\[|\]$/g, '').toLowerCase();
  return value === 'localhost' || value.endsWith('.localhost') || value.startsWith('127.') ||
    value === '::1' || value.startsWith('::ffff:127.');
}

function isPrivateIp(host) {
  const unwrapped = host.replace(/^\[|\]$/g, '').toLowerCase();
  const mapped = unwrapped.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIp(mapped[1]);
  if (isIP(unwrapped) === 4) {
    const [a, b] = unwrapped.split('.').map(Number);
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || a === 0;
  }
  if (isIP(unwrapped) === 6) {
    if (unwrapped === '::1') return false;
    return unwrapped.startsWith('fc') || unwrapped.startsWith('fd') || unwrapped.startsWith('fe8') ||
      unwrapped.startsWith('fe9') || unwrapped.startsWith('fea') || unwrapped.startsWith('feb') ||
      unwrapped.startsWith('::ffff:10.') || unwrapped.startsWith('::ffff:192.168.') ||
      /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(unwrapped);
  }
  return false;
}

function isLinkLocalIp(host) {
  const value = host.replace(/^\[|\]$/g, '').toLowerCase();
  return value.startsWith('169.254.') || value.startsWith('fe8') || value.startsWith('fe9') ||
    value.startsWith('fea') || value.startsWith('feb') || value.startsWith('::ffff:169.254.');
}

export function targetBlockReason(raw, { allowFile = false, allowPrivate = false, root = process.cwd() } = {}) {
  let u;
  try { u = new URL(raw); } catch { return 'invalid URL'; }
  if (u.protocol === 'file:') {
    if (!allowFile) return 'file URLs require --allow-file';
    try {
      const realRoot = realpathSync(root);
      const realTarget = realpathSync(fileURLToPath(u));
      const rel = path.relative(realRoot, realTarget);
      if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) return 'file URL is outside the project root';
    } catch { return 'file URL must resolve to an existing file inside the project root'; }
    return null;
  }
  if (u.protocol === 'data:' || u.protocol === 'blob:' || u.protocol === 'about:') return null;
  if (!['http:', 'https:'].includes(u.protocol)) return 'unsupported URL protocol';
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (METADATA_HOSTS.has(host) || host.endsWith('.metadata.google.internal')) return 'cloud metadata endpoints are blocked';
  if (isLinkLocalIp(host)) return 'link-local network targets are blocked';
  if ((host === '169.254.169.254' || host === '100.100.100.200') || (isPrivateIp(host) && !isLoopback(host) && !allowPrivate)) {
    return 'private network targets require --allow-private';
  }
  return null;
}

export async function installRequestGuards(context, { allowFile = false, allowPrivate = false, allowTracking = false, trackingBlocked = new Set(), blockedTargets = new Set() } = {}) {
  await context.route('**/*', async (route) => {
    const raw = route.request().url();
    let u;
    try { u = new URL(raw); } catch { await route.abort('blockedbyclient'); return; }
    const tracker = isTrackerUrl(u);
    if (tracker && !allowTracking) {
      trackingBlocked.add(u.hostname.toLowerCase());
      await route.abort('blockedbyclient');
      return;
    }
    const reason = targetBlockReason(raw, { allowFile, allowPrivate });
    if (reason) {
      blockedTargets.add(u.hostname || u.protocol);
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });
}

export function checkUrl(raw, { allowFile = false, allowPrivate = false } = {}) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return fail('URL inválida. O valor informado foi omitido da mensagem por privacidade.');
  }
  const reason = targetBlockReason(u.href, { allowFile, allowPrivate });
  if (reason) return fail(`URL recusada: ${reason}. O valor informado foi omitido por privacidade.`);
  return u;
}

// Outputs can be shared or committed accidentally. Strip URL userinfo, query strings,
// fragments, and local file paths before writing URLs into reports or logs.
export function redactUrl(raw) {
  try {
    const u = new URL(String(raw));
    if (u.protocol === 'file:') return 'file://[local-path-redacted]';
    if (u.protocol === 'data:') return 'data:[content-redacted]';
    u.username = '';
    u.password = '';
    u.search = '';
    u.hash = '';
    return `${u.origin}${u.pathname === '/' ? '/' : '/[path-redacted]'}`;
  } catch {
    return '[URL omitted]';
  }
}

export function redactText(raw, limit = 300) {
  return String(raw)
    .replace(/https?:\/\/[^\s"'<>)}\]]+/gi, (url) => redactUrl(url.replace(/[.,;:!?]+$/, '')))
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email redacted]')
    .replace(/(?:\/(?:home|Users|workspace|tmp)\/)[^\s"'<>]+/g, '[local-path-redacted]')
    .replace(/[A-Z]:\\Users\\[^\s"'<>]+/gi, '[local-path-redacted]')
    .replace(/\b(email|e-?mail|full[_-]?name|name|username|user[_-]?id|customer[_-]?id|account[_-]?id|session(?:[_-]?id)?|token|access[_-]?key|api[_-]?key|secret|password|authorization|signature)\s*[:=]\s*[^\s,;&]+/gi, '$1=[redacted]')
    .slice(0, limit);
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
  const fileName = path.basename(u.pathname, path.extname(u.pathname));
  const rawPath = u.protocol === 'file:' ? (fileName.toLowerCase() === 'index' ? 'home' : fileName) : u.pathname;
  const raw = (rawPath + (u.search ? '-q' : '')).replace(/^\/+|\/+$/g, '');
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
