#!/usr/bin/env node
// Extrai valores MEDIDOS do render: estilos computados, variáveis CSS, @font-face, fontes carregadas,
// escala tipográfica, paleta, contraste estimado, alvos de toque e estrutura (títulos/landmarks).
// Somente leitura: navegação GET, nenhuma interação com a página.
import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadPlaywright, launch, checkUrl, installRequestGuards, createInspectionContext, targetBlockReason, ensureDir, metricsInit, preparePage, redactUrl, redactText, fail, writePrivateArtifact } from './_common.mjs';

const HELP = `Uso: node extract-styles.mjs --url <url> [opções]

  --url <url>        Página (http ou https). Obrigatório.
  --allow-file       Permite uma URL file:// local explicitamente.
  --allow-private    Permite alvos/subrecursos em IPs privados (metadata continua bloqueado).
  --allow-tracking   Permite requests de analytics; bloqueados por padrão.
  --allow-unresolved-dns Permite falhas de DNS local (reduz proteção; use apenas com proxy confiável).
  --block-writes     Bloqueia métodos além de GET/HEAD e WebSockets (opt-in).
  --out <dir>        Saída (padrão: .audit/styles).
  --width <px>       Largura do viewport (padrão: 1440). Rode também com 375.
  --scheme <s>       light | dark (padrão: light).
  --max-per <n>      Exemplos por categoria (padrão: 12).
  --selectors <css>  Seletores extras, separados por vírgula (categoria "custom").
  --axe              Executa verificação automática opcional; saída resumida sem HTML ou seletores.
  --axe-details <arquivo> Com --axe, grava seletores dos elementos com falha em arquivo privado novo,
                     ignorado pelo Git e fora da saída de relatórios; não compartilhe.
  --timeout <ms>     Timeout de navegação (padrão: 30000).

Aviso: falhas e timeouts de DNS são bloqueados por padrão; --allow-unresolved-dns permite prosseguir sem validação de IP. Cada conexão é fixada no endereço validado por um proxy local; não é uma sandbox de rede.
Saída: computed-styles.json, styles-summary.md, aria-snapshot.yml (quando suportado).`;

const { values: a } = parseArgs({
  options: {
    url: { type: 'string' },
    'allow-file': { type: 'boolean', default: false },
    'allow-private': { type: 'boolean', default: false },
    'allow-tracking': { type: 'boolean', default: false },
    'allow-unresolved-dns': { type: 'boolean', default: false },
    'block-writes': { type: 'boolean', default: false },
    out: { type: 'string', default: '.audit/styles' },
    width: { type: 'string', default: '1440' },
    scheme: { type: 'string', default: 'light' },
    'max-per': { type: 'string', default: '12' },
    selectors: { type: 'string', default: '' },
    axe: { type: 'boolean', default: false },
    'axe-details': { type: 'string' },
    timeout: { type: 'string', default: '30000' },
    help: { type: 'boolean', default: false },
  },
});
if (a.help || !a.url) {
  console.log(HELP);
  process.exit(a.help ? 0 : 1);
}

if (a['axe-details'] && !a.axe) fail('--axe-details exige --axe.');
const url = checkUrl(a.url, { allowFile: a['allow-file'], allowPrivate: a['allow-private'] });
const width = Number(a.width) || 1440;
const scheme = a.scheme === 'dark' ? 'dark' : 'light';
const maxPer = Math.max(1, Number(a['max-per']) || 12);
const timeout = Number(a.timeout) || 30000;
const outDir = await ensureDir(path.resolve(a.out));

const pw = loadPlaywright();
const browser = await launch(pw);
const ctx = await createInspectionContext(browser, {
  viewport: { width, height: 900 },
  colorScheme: scheme,
  reducedMotion: 'reduce',
});
const trackingBlocked = new Set();
const blockedTargets = new Set();
const blockedWriteMethods = new Set();
const blockedRedirects = new Set();
await installRequestGuards(ctx, {
  allowFile: a['allow-file'], allowPrivate: a['allow-private'], allowTracking: a['allow-tracking'], allowUnresolvedDns: a['allow-unresolved-dns'],
  trackingBlocked, blockedTargets, blockWrites: a['block-writes'], blockedWriteMethods, blockedRedirects,
});
await ctx.addInitScript(metricsInit);
const page = await ctx.newPage();

let resp;
try {
  resp = await preparePage(page, url.href, timeout);
  const finalBlock = targetBlockReason(page.url(), { allowFile: a['allow-file'], allowPrivate: a['allow-private'] });
  if (finalBlock) throw new Error(`Navegação final bloqueada: ${finalBlock}`);
} catch (err) {
  await browser.close();
  fail(`Falha ao abrir ${redactUrl(url.href)}: ${redactText(String(err.message).split('\n')[0])}`, 3);
}

const data = await page.evaluate(
  ({ extra, maxPer: MAX }) => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    const ctx2 = cv.getContext('2d', { willReadFrequently: true });

    // Converte qualquer cor CSS em [r,g,b,a]; null se o navegador não entender.
    const parse = (css) => {
      if (!css) return null;
      const m = css.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
      if (m) {
        const al = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
        return [+m[1], +m[2], +m[3], al];
      }
      if (css === 'transparent') return [0, 0, 0, 0];
      ctx2.fillStyle = '#010203';
      ctx2.fillStyle = css;
      if (ctx2.fillStyle === '#010203') return null;
      ctx2.clearRect(0, 0, 1, 1);
      ctx2.fillRect(0, 0, 1, 1);
      const d = ctx2.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const hex = (c) =>
      c
        ? '#' +
          [c[0], c[1], c[2]].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') +
          (c[3] < 1 ? Math.round(c[3] * 255).toString(16).padStart(2, '0') : '')
        : null;
    const lin = (v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const ratio = (f, b) => {
      const [hi, lo] = [lum(f), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const over = (fg, bg) => [
      fg[0] * fg[3] + bg[0] * (1 - fg[3]),
      fg[1] * fg[3] + bg[1] * (1 - fg[3]),
      fg[2] * fg[3] + bg[2] * (1 - fg[3]),
      1,
    ];
    // Fundo efetivo: compõe camadas de trás para frente. Imagem/gradiente no caminho = indeterminado.
    const bgOf = (el) => {
      const layers = [];
      let uncertain = false;
      for (let n = el; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.backgroundImage !== 'none') uncertain = true;
        const c = parse(s.backgroundColor);
        if (c && c[3] > 0) layers.push(c);
        if (c && c[3] >= 1) break;
      }
      let base = [255, 255, 255, 1];
      for (const c of layers.reverse()) base = over(c, base);
      return { color: base, uncertain };
    };
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const ancestorOpacityOf = (el) => {
      let product = 1;
      for (let node = el; node; node = node.parentElement) {
        product *= Number.parseFloat(getComputedStyle(node).opacity);
      }
      return product;
    };
    const nodeHint = (el) => {
      let s = el.tagName.toLowerCase();
      if (el.id) s += '#' + el.id;
      const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
      if (c.length) s += '.' + c.join('.');
      return s;
    };
    const hint = (el) => {
      const own = nodeHint(el);
      if (el.id || own.includes('.')) return own.slice(0, 80);
      for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
        const anc = nodeHint(p);
        if (p.id || anc.includes('.') || /^(header|nav|main|section|article|aside|footer|form|fieldset|dialog|table)$/.test(anc)) {
          return `${anc} ${own}`.slice(0, 80);
        }
      }
      return own.slice(0, 80);
    };
    const CUSTOM_FIELDS = '[contenteditable]:not([contenteditable="false" i]), [role~="textbox" i], [role~="searchbox" i], [role~="combobox" i], [role~="spinbutton" i]';
    const EDITABLE_SEL = `input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select, ${CUSTOM_FIELDS}`;
    const hasEditableRole = (node) => (node.getAttribute?.('role') || '').toLowerCase().split(/\s+/).some((role) => ['textbox', 'searchbox', 'combobox', 'spinbutton'].includes(role));
    const isEditable = (el) => /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable || hasEditableRole(el) || Boolean(el.closest?.(EDITABLE_SEL));
    // Sampling hint only, not a full accessible-name computation. Never read field values.
    const labelHint = (el) => [
      el.getAttribute('aria-label'), el.innerText, el.getAttribute('title'),
      el.querySelector('img[alt]')?.getAttribute('alt'),
    ].map((value) => (value || '').trim().replace(/\s+/g, ' ')).find(Boolean) || '';
    const safeText = (el, max = 40) => {
      if (isEditable(el)) {
        const type = el.tagName === 'INPUT' ? ` ${el.type || 'text'}` : '';
        return `[${el.tagName.toLowerCase()}${type}]`;
      }
      return labelHint(el).slice(0, max);
    };
    const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);

    const cats = {
      h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', p: 'p', li: 'li', a: 'a[href]',
      button: 'button, [role="button"], input[type="submit"], input[type="button"]',
      input: EDITABLE_SEL,
      label: 'label', small: 'small, figcaption, caption',
    };
    if (extra) cats.custom = extra;

    const typeScale = new Map();
    const textColors = new Map();
    const backgrounds = new Map();
    const radii = new Map();
    const shadows = new Map();
    const elements = [];
    const truncatedCategories = {};
    let scanned = 0;

    for (const [cat, sel] of Object.entries(cats)) {
      const seen = new Map();
      const usedSelectors = new Map();
      let list = [];
      try {
        const candidates = [...document.querySelectorAll(sel)].filter(visible);
        list = candidates.slice(0, 400);
        if (candidates.length > 400) truncatedCategories[cat] = candidates.length - 400;
      } catch {
        continue; // seletor extra inválido
      }
      for (const el of list) {
        if (!labelHint(el) && !['button', 'a', 'input'].includes(cat) && !isEditable(el)) continue;
        scanned += 1;
        const s = getComputedStyle(el);
        const fg = parse(s.color);
        const bg = bgOf(el);
        const ancestorOpacityProduct = Number(ancestorOpacityOf(el).toFixed(6));
        const opacityUncertain = ancestorOpacityProduct < 0.999;
        const fgOpaque = fg ? (fg[3] < 1 ? over(fg, bg.color) : fg) : null;
        const hasRenderedText = !isEditable(el) && Boolean((el.innerText || '').trim());
        const sig = [s.fontSize, s.fontWeight, s.lineHeight, s.fontFamily, s.color, hex(bg.color), bg.uncertain, ancestorOpacityProduct, hasRenderedText, s.borderRadius].join('|');
        // Controls without rendered text and editable fields stay inspectable but do not describe typography.
        if (hasRenderedText) {
          bump(typeScale, `${s.fontSize} / ${s.fontWeight} / ${s.lineHeight}`);
          bump(textColors, hex(fgOpaque) ?? s.color);
        }
        bump(backgrounds, hex(bg.color) + (bg.uncertain ? ' (imagem/gradiente no caminho)' : ''));
        if (s.borderRadius !== '0px') bump(radii, s.borderRadius);
        if (s.boxShadow !== 'none') bump(shadows, s.boxShadow.slice(0, 90));
        if (seen.has(sig)) {
          seen.get(sig).count += 1;
          continue;
        }
        const px = parseFloat(s.fontSize);
        const bold = parseInt(s.fontWeight, 10) >= 700;
        const large = px >= 24 || (px >= 18.66 && bold);
        const required = large ? 3 : 4.5;
        const cr = fgOpaque ? ratio(fgOpaque, bg.color) : null;
        const contrastStatus = cr === null || !hasRenderedText ? 'indeterminado' : bg.uncertain || opacityUncertain ? 'indeterminado' : cr >= required ? 'ok' : 'falha';
        const r = el.getBoundingClientRect();
        const baseSelector = hint(el);
        const occurrence = (usedSelectors.get(baseSelector) || 0) + 1;
        usedSelectors.set(baseSelector, occurrence);
        const entry = {
          category: cat,
          selector: occurrence === 1 ? baseSelector : `${baseSelector} [${occurrence}]`,
          text: safeText(el),
          rect: { x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
          fontFamily: s.fontFamily.slice(0, 90),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
          textTransform: s.textTransform,
          color: hex(fgOpaque) ?? s.color,
          background: hex(bg.color),
          backgroundIndeterminate: bg.uncertain,
          contrast: contrastStatus === 'indeterminado' ? null : Number(cr.toFixed(2)),
          contrastRequired: required,
          contrastStatus,
          contrastOpacityIndeterminate: opacityUncertain,
          opacity: Number.parseFloat(s.opacity),
          ancestorOpacityProduct,
          padding: s.padding,
          borderRadius: s.borderRadius,
          boxShadow: s.boxShadow === 'none' ? null : s.boxShadow.slice(0, 90),
          count: 1,
        };
        seen.set(sig, entry);
      }
      elements.push(...[...seen.values()].slice(0, MAX));
    }

    // Variáveis CSS e @font-face das folhas acessíveis (cross-origin é ignorado e contado).
    const rootVars = [];
    const fontFaces = [];
    let blockedSheets = 0;
    const walk = (rules, at) => {
      for (const rule of rules) {
        const selectors = rule.selectorText?.split(',').map((s) => s.trim()).filter((s) => /^(?::root(?:\.dark)?|html(?:\.dark)?|\.dark|\[data-(?:theme|color-scheme)(?:=[^\]]+)?\])$/i.test(s)) ?? [];
        if (rule.type === CSSRule.STYLE_RULE && selectors.length) {
          for (const prop of rule.style) {
            if (prop.startsWith('--')) for (const selector of selectors) rootVars.push({ name: prop, value: rule.style.getPropertyValue(prop).trim().slice(0, 100), at: selector, condition: at || null });
          }
        } else if (rule.type === CSSRule.FONT_FACE_RULE) {
          fontFaces.push({
            family: rule.style.getPropertyValue('font-family'),
            weight: rule.style.getPropertyValue('font-weight') || null,
            style: rule.style.getPropertyValue('font-style') || null,
            display: rule.style.getPropertyValue('font-display') || null,
            src: rule.style.getPropertyValue('src').slice(0, 120),
          });
        } else if (rule.cssRules) {
          walk(rule.cssRules, rule.conditionText ? `@media ${rule.conditionText}` : rule.constructor.name);
        }
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules, null);
      } catch {
        blockedSheets += 1;
      }
    }
    const rootStyle = getComputedStyle(document.documentElement);
    for (const v of rootVars) if (v.at === ':root' || v.at === 'html') v.resolved = rootStyle.getPropertyValue(v.name).trim().slice(0, 100);
    const loadedFonts = [...document.fonts].map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));

    // Alvos interativos (WCAG 2.5.8: mínimo 24×24 CSS px, com exceções como links em linha).
    const targets = [];
    const allInteractive = [...document.querySelectorAll(`a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, summary, ${CUSTOM_FIELDS}`)].filter(visible);
    const interactiveTotal = allInteractive.length;
    const interactiveTruncated = Math.max(0, interactiveTotal - 400);
    for (const el of allInteractive.slice(0, 400)) {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (r.width < 44 || r.height < 44) {
        targets.push({
          selector: hint(el),
          text: safeText(el, 30),
          w: Math.round(r.width),
          h: Math.round(r.height),
          lt24: r.width < 24 || r.height < 24,
          inline: s.display === 'inline',
        });
      }
    }
    targets.sort((x, y) => Number(y.lt24 && !y.inline) - Number(x.lt24 && !x.inline) || x.w * x.h - y.w * y.h);

    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).slice(0, 80).map((h) => ({
      level: Number(h.tagName[1]),
      text: safeText(h, 60),
    }));
    const count = (s) => document.querySelectorAll(s).length;
    const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.getAttribute('content') ?? null;
    const top = (map, n = 15) => [...map.entries()].sort((x, y) => y[1] - x[1]).slice(0, n).map(([value, uses]) => ({ value, uses }));

    return {
      page: {
        title: document.title,
        lang: document.documentElement.lang || null,
        description: meta('description'),
        viewportMeta: meta('viewport'),
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        h1Count: count('h1'),
        landmarks: { header: count('header'), nav: count('nav'), main: count('main'), footer: count('footer'), aside: count('aside') },
        scanned,
        lcp: window.__audit?.lcp ?? null,
        cls: Number((window.__audit?.cls ?? 0).toFixed(4)),
      },
      rootVars,
      fontFaces,
      loadedFonts,
      blockedSheets,
      truncatedCategories,
      interactiveTruncated,
      summaries: {
        typeScale: top(typeScale),
        textColors: top(textColors),
        backgrounds: top(backgrounds),
        radii: top(radii),
        shadows: top(shadows),
      },
      interactiveTotal,
      targets: targets.slice(0, 60),
      headings,
      elements,
    };
  },
  { extra: a.selectors, maxPer },
);

let axeReport = null, axeDetails = null;
if (a.axe) {
  try {
    const { AxeBuilder } = await import('@axe-core/playwright');
    const result = await new AxeBuilder({ page }).analyze();
    const summarize = (rows) => rows.map((rule) => ({
      id: /^[a-z0-9-]+$/.test(rule.id) ? rule.id : 'unknown',
      impact: ['minor', 'moderate', 'serious', 'critical'].includes(rule.impact) ? rule.impact : null,
      nodeCount: Array.isArray(rule.nodes) ? rule.nodes.length : 0,
    }));
    axeReport = { tool: 'axe-core', generatedAt: new Date().toISOString(), violations: summarize(result.violations), incomplete: summarize(result.incomplete), limitations: 'Automated checks are partial and do not certify accessibility compliance; node content and selectors are omitted for privacy.' };
    if (a['axe-details']) {
      // Selectors locate the failing elements so the finding is actionable; HTML snippets stay out.
      const selector = (part) => String(Array.isArray(part) ? part.join(' >>> ') : part).slice(0, 300);
      const locate = (rows) => rows.map((rule) => ({
        id: /^[a-z0-9-]+$/.test(rule.id) ? rule.id : 'unknown',
        impact: ['minor', 'moderate', 'serious', 'critical'].includes(rule.impact) ? rule.impact : null,
        targets: (Array.isArray(rule.nodes) ? rule.nodes : []).slice(0, 50).map((node) => (Array.isArray(node.target) ? node.target : []).map(selector)),
      }));
      axeDetails = { tool: 'axe-core', private: true, note: 'Seletores podem revelar a estrutura interna da página; mantenha este arquivo local e não o compartilhe.', violations: locate(result.violations), incomplete: locate(result.incomplete) };
    }
  } catch {
    await browser.close();
    fail('Verificação axe indisponível. Instale as dependências fixadas e confira a página; detalhes e conteúdo foram omitidos.', 3);
  }
}
let aria = null;
try {
  await page.evaluate(() => {
    const sel = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select, [contenteditable]:not([contenteditable="false" i]), [role~="textbox" i], [role~="searchbox" i], [role~="combobox" i], [role~="spinbutton" i]';
    for (const el of document.querySelectorAll(sel)) {
      if (el.tagName === 'SELECT') {
        for (const opt of el.querySelectorAll('option')) opt.textContent = '[value redacted]';
      } else if ('value' in el) {
        try { el.value = ''; } catch {}
      }
      if (el.isContentEditable || el.matches('[contenteditable]:not([contenteditable="false" i]), [role~="textbox" i], [role~="searchbox" i], [role~="combobox" i], [role~="spinbutton" i]')) {
        el.textContent = '[value redacted]';
      }
    }
  });
  aria = redactText(await page.locator('body').ariaSnapshot(), 100000).replace(
    /^(\s*-\s*(?:textbox|searchbox|combobox|spinbutton)\b[^:\n]*:\s*).+$/gim,
    '$1[value redacted]',
  );
  await fs.writeFile(path.join(outDir, 'aria-snapshot.yml'), aria, 'utf8');
} catch {
  /* versão do Playwright sem ariaSnapshot */
}
await browser.close();

function redactValues(value) {
  if (typeof value === 'string') return redactText(value, 100000);
  if (Array.isArray(value)) return value.map(redactValues);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, redactValues(child)]));
  return value;
}
const safeData = redactValues(data);
Object.assign(data, safeData);
const meta = {
  tool: 'extract-styles.mjs', url: redactUrl(url.href), status: resp ? resp.status() : null, width, scheme,
  serviceWorkersBlocked: true, axeRequested: a.axe, axeDetailsRequested: Boolean(a['axe-details']), trackingAllowed: a['allow-tracking'], allowUnresolvedDns: a['allow-unresolved-dns'], blockWrites: a['block-writes'], blockedWriteMethods: [...blockedWriteMethods].sort(), blockedRedirects: [...blockedRedirects].sort(), trackingBlocked: [...trackingBlocked].sort(), blockedTargets: [...blockedTargets].sort(),
  at: new Date().toISOString(),
};
await fs.writeFile(path.join(outDir, 'computed-styles.json'), JSON.stringify({ meta, ...safeData }, null, 2), 'utf8');
if (axeReport) await fs.writeFile(path.join(outDir, 'a11y-findings.json'), JSON.stringify(axeReport, null, 2), 'utf8');
if (axeDetails) {
  try { await writePrivateArtifact({ repoHint: path.dirname(path.resolve(a['axe-details'])), outputDir: outDir, requested: a['axe-details'], data: axeDetails }); }
  catch { fail('Arquivo privado do axe recusado: use arquivo novo em diretório existente de um repositório Git, ignorado pelo Git e fora da saída de relatórios. Caminho omitido.'); }
  console.log('Seletores do axe gravados em arquivo privado; revise localmente e não compartilhe.');
}

const fails = safeData.elements.filter((e) => e.contrastStatus === 'falha');
const indet = safeData.elements.filter((e) => e.contrastStatus === 'indeterminado');
const smallNow = safeData.targets.filter((t) => t.lt24 && !t.inline);
const list = (rows, fmt) => (rows.length ? rows.map(fmt).join('\n') : '_nenhum_');
const md = `# Estilos medidos

Origem: **medido** no render (Chromium, ${width}px, ${scheme}) em ${meta.at}. URL: ${meta.url} (status ${meta.status}).
Analytics bloqueados: ${meta.trackingBlocked.join(', ') || (meta.trackingAllowed ? 'bloqueio desativado pelo usuário' : 'nenhum observado')} · alvos privados bloqueados: ${meta.blockedTargets.join(', ') || 'nenhum observado'}.
Métodos bloqueados: ${meta.blockedWriteMethods.join(', ') || 'nenhum'} · block-writes: ${meta.blockWrites}.
Redirects recusados: ${meta.blockedRedirects.join(', ') || 'nenhum'}.
HTTP mediado sem redirects automáticos; recursos redirecionados podem estar ausentes. Métricas são indicativas.
Contraste é estimativa (fundo composto; imagem/gradiente = indeterminado) e não substitui avaliação de acessibilidade.

## Página
- title: ${data.page.title || '_vazio_'} · lang: ${data.page.lang ?? '_ausente_'} · h1: ${data.page.h1Count}
- description: ${data.page.description ?? '_ausente_'}
- viewport meta: ${data.page.viewportMeta ?? '_ausente_'}
- landmarks: ${JSON.stringify(data.page.landmarks)}
- LCP (lab): ${data.page.lcp ? `${data.page.lcp.time}ms (${data.page.lcp.tag}${data.page.lcp.url ? ' ' + data.page.lcp.url : ''})` : 'n/d'} · CLS (lab): ${data.page.cls}
- Amostragem limitada a 400 elementos por categoria e 400 interativos; excedentes: ${JSON.stringify(data.truncatedCategories)} / ${data.interactiveTruncated}. Contraste com opacidade de elemento/ancestral ou fundo incerto fica indeterminado.

## Variáveis CSS de tema (${data.rootVars.length}; folhas cross-origin ignoradas: ${data.blockedSheets})
Inclui seletores :root, html, .dark, [data-theme] e [data-color-scheme] quando presentes nas folhas acessíveis.
${list(data.rootVars.slice(0, 80), (v) => `- \`${v.name}\`: ${v.value} _(${v.at}${v.condition ? ` · ${v.condition}` : ''})_`)}

## @font-face (${data.fontFaces.length}) e fontes carregadas
${list(data.fontFaces, (f) => `- ${f.family} · ${f.weight ?? '-'} · ${f.style ?? '-'} · display: ${f.display ?? '-'}`)}
Carregadas: ${data.loadedFonts.length ? data.loadedFonts.map((f) => `${f.family} ${f.weight} (${f.status})`).join('; ') : '_nenhuma via FontFace_'}

## Escala tipográfica (tamanho / peso / altura de linha)
${list(data.summaries.typeScale, (r) => `- ${r.value} — ${r.uses}×`)}

## Cores de texto
${list(data.summaries.textColors, (r) => `- ${r.value} — ${r.uses}×`)}

## Fundos efetivos
${list(data.summaries.backgrounds, (r) => `- ${r.value} — ${r.uses}×`)}

## Raios e sombras
${list(data.summaries.radii, (r) => `- raio ${r.value} — ${r.uses}×`)}
${list(data.summaries.shadows, (r) => `- sombra ${r.value} — ${r.uses}×`)}

## Contraste: falhas (${fails.length}) e indeterminados (${indet.length})
${list(fails.slice(0, 25), (e) => `- ${e.selector} "${e.text}" · ${e.color} sobre ${e.background} = ${e.contrast}:1 (mín. ${e.contrastRequired}:1)`)}

## Alvos menores que 44×44 (${data.targets.length} de ${data.interactiveTotal} interativos) — sem 24×24, fora links em linha: ${smallNow.length}
${list(data.targets.slice(0, 30), (t) => `- ${t.selector} "${t.text}" ${t.w}×${t.h}${t.lt24 ? ' · <24' : ''}${t.inline ? ' · em linha (possível exceção)' : ''}`)}

## Títulos
${list(safeData.headings.slice(0, 40), (h) => `- ${'  '.repeat(h.level - 1)}h${h.level} ${h.text}`)}
`;
await fs.writeFile(path.join(outDir, 'styles-summary.md'), md, 'utf8');
console.log(`OK: ${data.elements.length} exemplos · ${data.rootVars.length} variáveis CSS · ${fails.length} falhas de contraste · ${smallNow.length} alvos <24px`);
console.log(`Arquivos gravados: computed-styles.json, styles-summary.md${aria ? ', aria-snapshot.yml' : ''}`);
