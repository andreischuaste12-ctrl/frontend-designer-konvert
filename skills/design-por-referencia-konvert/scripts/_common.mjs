// Utilitários compartilhados pelos scripts de captura e inspeção.
// Os scripts navegam com GET e não clicam nem enviam formulários, mas executam JS da página.
import { createRequire } from 'node:module';
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { networkHost, ipBlockReason } from './_network.mjs';
import { realpathSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function fail(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

// Prefere a dependência fixada da skill; usa a do projeto apenas como fallback.
const playwrightVersions = new WeakMap();
export function loadPlaywright() {
  const bases = [import.meta.url, path.join(process.cwd(), 'noop.js')];
  for (const base of bases) {
    try {
      const require = createRequire(base);
      const pw = require('playwright');
      let version = 'unknown';
      try { version = require('playwright/package.json').version; } catch { /* optional runtime diagnostic */ }
      playwrightVersions.set(pw, /^\d+\.\d+\.\d+(?:[-.\w]*)$/.test(version) ? version : 'unknown');
      return pw;
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
  const source = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? 'system-provided executable' : 'Playwright-managed executable';
  console.log(`Playwright ${playwrightVersions.get(pw) ?? 'unknown'}; ${source}.`);
  try {
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    const browser = await pw.chromium.launch(executablePath ? { executablePath } : {});
    console.log(`Chromium ${redactText(browser.version(), 60)}.`);
    return browser;
  } catch (err) {
    return fail(
      `Não foi possível iniciar o Chromium: ${redactText(String(err.message).split('\n')[0])}\n` +
        'Rode `npx playwright install chromium` (este script não instala nada) ou aponte PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH para um Chromium já instalado.',
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
  const host = networkHost(u.hostname);
  if (host === 'facebook.com' || host.endsWith('.facebook.com')) return u.pathname === '/tr' || u.pathname.startsWith('/tr/');
  return TRACKER_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
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
  const host = networkHost(u.hostname);
  if (METADATA_HOSTS.has(host) || host.endsWith('.metadata.google.internal')) return 'cloud metadata endpoints are blocked';
  return ipBlockReason(host, allowPrivate);
}

// Applies the literal-IP policy to every address a hostname resolves to. This closes
// static names that point at internal ranges (for example wildcard DNS services), but
// the browser resolves the name again, so a TTL-0 rebinding race remains possible.
// A failed lookup is not a block: proxies may resolve names this host cannot.
export async function resolvedBlockReason(hostname, { allowPrivate = false, lookup = dnsLookup, timeout = 2000, onFailure = () => {} } = {}) {
  const host = networkHost(hostname);
  if (!host || isIP(host)) return null;
  let addresses;
  let timer;
  try {
    addresses = await Promise.race([
      lookup(host, { all: true, verbatim: true }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('DNS timeout')), timeout); }),
    ]);
    if (!Array.isArray(addresses) || !addresses.length) { onFailure(); return null; }
  } catch { onFailure(); return null; }
  finally { clearTimeout(timer); }
  for (const entry of Array.isArray(addresses) ? addresses : []) {
    const raw = String(entry?.address ?? '').split('%')[0];
    const family = isIP(raw);
    if (!family) return 'unexpected resolver output is blocked';
    // Resolvers may return dotted IPv4 tails (::ffff:10.0.0.5); the classifier expects URL-normalized hex.
    const address = family === 6 ? networkHost(new URL(`http://[${raw}]/`).hostname) : raw;
    const reason = ipBlockReason(address, allowPrivate);
    if (reason) return `${reason} (resolved address)`;
  }
  return null;
}

export function createInspectionContext(browser, options = {}) {
  return browser.newContext({ ...options, serviceWorkers: 'block' });
}

const pendingNavigations = new WeakMap();
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export async function installRequestGuards(context, { allowFile = false, allowPrivate = false, allowTracking = false, blockWrites = false, trackingBlocked = new Set(), blockedTargets = new Set(), blockedWriteMethods = new Set(), blockedRedirects = new Set(), lookup = dnsLookup } = {}) {
  if (typeof context.routeWebSocket !== 'function') fail('Playwright with browser-context WebSocket routing is required. Install the pinned skill dependencies.', 2);
  const resolvedReasons = new Map();
  const resolvedReason = (u) => {
    if (!['http:', 'https:'].includes(u.protocol)) return Promise.resolve(null);
    const host = networkHost(u.hostname);
    if (!resolvedReasons.has(host)) {
      let failed = false;
      const pending = resolvedBlockReason(host, { allowPrivate, lookup, onFailure: () => { failed = true; } }).then((reason) => {
        if (failed) resolvedReasons.delete(host);
        return reason;
      });
      resolvedReasons.set(host, pending);
    }
    return resolvedReasons.get(host);
  };
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
    const reason = targetBlockReason(raw, { allowFile, allowPrivate }) || await resolvedReason(u);
    if (reason) {
      blockedTargets.add(u.hostname || u.protocol);
      await route.abort('blockedbyclient');
      return;
    }
    const method = route.request().method();
    if (blockWrites && !['GET', 'HEAD'].includes(method)) {
      blockedWriteMethods.add(method);
      await route.abort('blockedbyclient');
      return;
    }
    if (!['http:', 'https:'].includes(u.protocol)) { await route.continue(); return; }
    let response;
    try {
      // Fulfilled responses have no native remote address. Restore the browser's
      // ordinary local-page access only for an explicitly visited loopback origin.
      const host = networkHost(u.hostname);
      const loopback = host === 'localhost' || host.endsWith('.localhost') || /^127(?:\.\d+){3}$/.test(host) || host === '::1';
      if (loopback && route.request().isNavigationRequest?.() && context.grantPermissions) {
        const frame = route.request().frame();
        if (frame === frame.page().mainFrame()) await context.grantPermissions(['local-network-access'], { origin: u.origin }).catch(() => {});
      }
      // Chromium skips route handlers on later redirect hops. Never give it a 3xx.
      response = await route.fetch({ maxRedirects: 0, timeout: 30000 });
      const location = response.headers().location;
      if (REDIRECT_STATUSES.has(response.status()) && location) {
        let next;
        try { next = new URL(location, raw); } catch { /* rejected below */ }
        const invalid = !next || !['http:', 'https:'].includes(next.protocol) || targetBlockReason(next.href, { allowFile, allowPrivate });
        const tracker = next && isTrackerUrl(next) && !allowTracking;
        if (invalid) blockedTargets.add(next?.hostname || 'invalid-redirect');
        if (tracker) trackingBlocked.add(next.hostname.toLowerCase());
        const request = route.request();
        const frame = request.isNavigationRequest() ? request.frame() : null;
        // Restart only GET main navigation; never replay POST or subresources.
        if (!invalid && !tracker && frame && frame === frame.page().mainFrame() && method === 'GET') {
          pendingNavigations.set(frame.page(), next.href);
          await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Guarded navigation</title>' });
          return;
        } else blockedRedirects.add(next?.hostname || 'invalid-redirect');
        await route.abort('blockedbyclient');
        return;
      }
      await route.fulfill({ response });
    } catch {
      await route.abort('failed').catch(() => {});
    } finally {
      if (response) await response.dispose();
    }
  });
  await context.routeWebSocket('**/*', async (socket) => {
    let u;
    try { u = new URL(socket.url()); }
    catch { await socket.close({ code: 1008, reason: 'Audit network guard' }); return; }
    u.protocol = u.protocol === 'wss:' ? 'https:' : 'http:';
    const tracker = isTrackerUrl(u);
    if (tracker && !allowTracking) trackingBlocked.add(u.hostname.toLowerCase());
    if (blockWrites) blockedWriteMethods.add('WEBSOCKET');
    if ((tracker && !allowTracking) || blockWrites) {
      await socket.close({ code: 1008, reason: 'Audit network guard' });
      return;
    }
    const reason = targetBlockReason(u.href, { allowFile, allowPrivate }) || await resolvedReason(u);
    if (reason) blockedTargets.add(u.hostname || u.protocol);
    if (reason) {
      await socket.close({ code: 1008, reason: 'Audit network guard' });
      return;
    }
    socket.connectToServer();
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
    .replace(/\b(authorization|proxy-authorization|set-cookie|cookie)\b["']?\s*[:=]\s*(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\r\n]*)/gi, '$1=[redacted]')
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+\/-]+=*/gi, '$1 [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, '[JWT redacted]')
    .replace(/(?:https?|wss?):\/\/[^\s"'<>)}\]]+/gi, (url) => redactUrl(url.replace(/[.,;:!?]+$/, '')))
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email redacted]')
    .replace(/\b[A-Z]:[\\/][^\r\n"'<>|]*/gi, '[local-path-redacted]')
    .replace(/(?:\/(?:home|Users|workspace|tmp|mnt|root|var|opt|srv|private|etc|data|Volumes|run)\/)[^\r\n"'<>]*/g, '[local-path-redacted]')
    .replace(/(?<!\d)(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14}|\d{11})(?!\d)/g, '[personal-id-or-phone redacted]')
    .replace(/(?<!\w)(?:\+?55[\s.-]*)?(?:\(\d{2}\)|\d{2})[\s.-]*9?\d{4}[\s.-]\d{4}(?!\d)/g, '[phone redacted]')
    .replace(/(?<!\w)\+?55\d{10,11}(?!\d)/g, '[phone redacted]')
    // A local telephone, an order code, and a year range can share this shape.
    // Keep the strict privacy default without claiming every match is a phone.
    .replace(/(?<!\d)\d{4,5}-\d{4}(?!\d)/g, '[ambiguous number redacted]')
    .replace(/\b(email|e-?mail|full[_-]?name|name|username|user[_-]?id|customer[_-]?id|account[_-]?id|session(?:[_-]?id)?|token|access[_-]?key|api[_-]?key|secret|password|signature)\s*[:=]\s*(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;&]+)/gi, '$1=[redacted]')
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
  let resp, current = url;
  const deadline = Date.now() + timeout;
  for (let hop = 0; ; hop++) {
    if (hop > 20 || Date.now() >= deadline) throw new Error('Navigation redirect limit or timeout exceeded.');
    pendingNavigations.delete(page);
    try {
      resp = await page.goto(current, { waitUntil: 'load', timeout: Math.max(1, deadline - Date.now()) });
      const next = pendingNavigations.get(page);
      if (next) { pendingNavigations.delete(page); current = next; continue; }
      break;
    } catch (err) {
      const next = pendingNavigations.get(page);
      pendingNavigations.delete(page);
      if (!next) throw err;
      current = next;
    }
  }
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.addStyleTag({ content: FREEZE_CSS }).catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await autoScroll(page);
  return resp;
}
