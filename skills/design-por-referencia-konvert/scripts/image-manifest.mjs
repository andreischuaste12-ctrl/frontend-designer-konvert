#!/usr/bin/env node
// Inventário de imagens, somente leitura.
//  --root <dir>: varre o projeto (formato, dimensões, peso, onde é referenciada, alt estático).
//  --url <url>:  mede no render (tamanho natural x renderizado, alt, lazy, LCP, bytes, formato) e salva
//                cópias locais para o agente abrir. Pode usar os dois ao mesmo tempo.
// Nunca lê .env, chaves ou credenciais. Não segue links simbólicos.
import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadPlaywright, launch, checkUrl, ensureDir, metricsInit, preparePage, fail } from './_common.mjs';

const HELP = `Uso: node image-manifest.mjs [--root <dir>] [--url <url>] [opções]

  --root <dir>   Varre o projeto em busca de imagens e das suas referências.
  --url <url>    Mede as imagens no render.
  --width <px>   Largura do viewport no modo --url (padrão: 1440). Rode também com 375.
  --out <dir>    Saída (padrão: .audit/images).
  --skip <lista> Pastas extras a ignorar, separadas por vírgula.
  --no-save      No modo --url, não salvar cópias das imagens.
  --timeout <ms> Timeout de navegação (padrão: 30000).

Saída: images-static.json/.md e/ou images-rendered.json/.md, e imagens-revisao.md (roteiro de revisão visual).`;

const { values: a } = parseArgs({
  options: {
    root: { type: 'string' },
    url: { type: 'string' },
    width: { type: 'string', default: '1440' },
    out: { type: 'string', default: '.audit/images' },
    skip: { type: 'string', default: '' },
    'no-save': { type: 'boolean', default: false },
    timeout: { type: 'string', default: '30000' },
    help: { type: 'boolean', default: false },
  },
});
if (a.help || (!a.root && !a.url)) {
  console.log(HELP);
  process.exit(a.help ? 0 : 1);
}

const outDir = await ensureDir(path.resolve(a.out));
const kb = (n) => (n == null ? 'n/d' : n >= 1048576 ? `${(n / 1048576).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`);
const RASTER = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp']);
const review = []; // itens para revisão visual: { id, where, facts }

// ---------------------------------------------------------------- estático
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.ico', '.bmp']);
const TEXT_EXT = new Set([
  '.html', '.htm', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.svelte',
  '.astro', '.php', '.liquid', '.twig', '.njk', '.hbs', '.ejs', '.md', '.mdx', '.json',
]);
const MARKUP_EXT = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.php', '.liquid', '.twig', '.njk', '.hbs', '.ejs', '.md', '.mdx']);
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.output', '.cache', '.turbo', '.parcel-cache',
  'coverage', '.audit', 'vendor', '.svelte-kit', '.vercel', '.netlify', '__pycache__',
  ...String(a.skip).split(',').map((s) => s.trim()).filter(Boolean),
]);
const isSecretName = (n) => /^\.env/i.test(n) || /\.(pem|key|p12|pfx)$/i.test(n) || /^id_(rsa|ed25519)/.test(n);

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    if (e.isSymbolicLink() || isSecretName(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) await walk(p, files);
    } else if (e.isFile()) {
      files.push(p);
    }
  }
  return files;
}

function dims(buf, ext) {
  try {
    if (ext === '.png') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (ext === '.gif') return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (ext === '.bmp') return { width: buf.readInt32LE(18), height: Math.abs(buf.readInt32LE(22)) };
    if (ext === '.webp') {
      const kind = buf.toString('ascii', 12, 16);
      if (kind === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (kind === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      if (kind === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        if (marker === 0xff) { i += 1; continue; }
        if ((marker >= 0xc0 && marker <= 0xcf) && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (ext === '.avif') {
      const idx = buf.subarray(0, 8192).indexOf('ispe');
      if (idx > 0) return { width: buf.readUInt32BE(idx + 8), height: buf.readUInt32BE(idx + 12) };
    }
    if (ext === '.svg') {
      const t = buf.subarray(0, 4096).toString('utf8');
      const num = (v) => (v ? parseFloat(v) : null);
      const w = num(t.match(/\swidth\s*=\s*["']([\d.]+)/i)?.[1]);
      const h = num(t.match(/\sheight\s*=\s*["']([\d.]+)/i)?.[1]);
      if (w && h) return { width: w, height: h };
      const vb = t.match(/viewBox\s*=\s*["']\s*[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
      if (vb) return { width: parseFloat(vb[1]), height: parseFloat(vb[2]) };
    }
  } catch {
    /* arquivo truncado ou formato fora do padrão */
  }
  return { width: null, height: null };
}

async function scanStatic(rootArg) {
  const root = path.resolve(rootArg);
  const all = await walk(root);
  const rel = (f) => path.relative(root, f).split(path.sep).join('/');
  const images = [];
  const byBase = new Map();
  for (const f of all.filter((x) => IMG_EXT.has(path.extname(x).toLowerCase()))) {
    const ext = path.extname(f).toLowerCase();
    const st = await fs.stat(f);
    let d = { width: null, height: null };
    if (st.size <= 25 * 1024 * 1024) d = dims(await fs.readFile(f), ext);
    const item = { path: rel(f), format: ext.slice(1), bytes: st.size, ...d, refs: [], alt: [], flags: [] };
    images.push(item);
    const key = path.basename(f).toLowerCase();
    if (!byBase.has(key)) byBase.set(key, []);
    byBase.get(key).push(item);
  }

  const TOKEN = /[A-Za-z0-9_@%.\/\\-]+\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp)(?![A-Za-z0-9])/gi;
  const lookup = (token) => {
    let base = token.split(/[\\/]/).pop();
    try { base = decodeURIComponent(base); } catch { /* mantém */ }
    return byBase.get(base.toLowerCase()) ?? [];
  };
  for (const f of all.filter((x) => TEXT_EXT.has(path.extname(x).toLowerCase()))) {
    const st = await fs.stat(f);
    if (st.size > 1024 * 1024) continue;
    const text = await fs.readFile(f, 'utf8');
    const nl = [];
    for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) nl.push(i);
    const lineOf = (idx) => {
      let lo = 0, hi = nl.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < idx) lo = mid + 1; else hi = mid; }
      return lo + 1;
    };
    for (const m of text.matchAll(TOKEN)) {
      for (const item of lookup(m[0])) {
        if (item.refs.length < 6 && !item.refs.some((r) => r.file === rel(f) && r.line === lineOf(m.index))) {
          item.refs.push({ file: rel(f), line: lineOf(m.index) });
        }
        item.refCount = (item.refCount ?? 0) + 1;
      }
    }
    if (MARKUP_EXT.has(path.extname(f).toLowerCase())) {
      for (const tag of text.matchAll(/<img\b[^>]*>/gis)) {
        const altM = tag[0].match(/\balt\s*=\s*("([^"]*)"|'([^']*)'|\{[^}]*\})/i);
        const alt = !altM ? 'ausente' : altM[1].startsWith('{') ? 'dinâmico' : (altM[2] ?? altM[3]) === '' ? 'vazio' : 'presente';
        for (const tok of tag[0].matchAll(TOKEN)) {
          for (const item of lookup(tok[0])) {
            if (item.alt.length < 6) item.alt.push({ file: rel(f), line: lineOf(tag.index), alt });
          }
        }
      }
    }
  }

  const stems = new Set(images.filter((i) => ['webp', 'avif'].includes(i.format)).map((i) => i.path.replace(/\.[^.]+$/, '')));
  for (const i of images) {
    const raster = RASTER.has(i.format);
    if (raster && i.bytes > 200 * 1024) i.flags.push('peso>200KB');
    if (['png', 'jpg', 'jpeg', 'gif'].includes(i.format) && i.bytes > 50 * 1024 && !stems.has(i.path.replace(/\.[^.]+$/, ''))) i.flags.push('sem-webp/avif-irmão');
    if (raster && i.width && i.width > 2560) i.flags.push('largura>2560');
    if (!i.refCount) i.flags.push('sem-referência (hipótese: pode ser caminho dinâmico)');
    if (i.alt.some((x) => x.alt === 'ausente')) i.flags.push('alt-ausente');
  }
  images.sort((x, y) => y.bytes - x.bytes);
  return { root, total: images.length, totalBytes: images.reduce((s, i) => s + i.bytes, 0), images };
}

if (a.root) {
  const res = await scanStatic(a.root);
  await fs.writeFile(path.join(outDir, 'images-static.json'), JSON.stringify(res, null, 2), 'utf8');
  const rows = res.images
    .map((i) => `| ${i.path} | ${i.format} | ${i.width ?? '?'}×${i.height ?? '?'} | ${kb(i.bytes)} | ${i.refs.map((r) => `${r.file}:${r.line}`).slice(0, 3).join('<br>') || '—'} | ${[...new Set(i.alt.map((x) => x.alt))].join(', ') || '—'} | ${i.flags.join('; ') || '—'} |`)
    .join('\n');
  await fs.writeFile(
    path.join(outDir, 'images-static.md'),
    `# Imagens no projeto (estático)\n\nRaiz: ${res.root} · ${res.total} imagens · ${kb(res.totalBytes)}\n\n| Arquivo | Formato | Dimensões | Peso | Referências | alt | Alertas |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows}\n`,
    'utf8',
  );
  res.images.forEach((i, n) =>
    review.push({
      id: `S${n + 1}`,
      where: i.path,
      facts: `${i.format} ${i.width ?? '?'}×${i.height ?? '?'} ${kb(i.bytes)}; refs: ${i.refs.map((r) => `${r.file}:${r.line}`).slice(0, 2).join(', ') || 'nenhuma'}; alerts: ${i.flags.join('; ') || 'nenhum'}`,
    }),
  );
  console.log(`Estático: ${res.total} imagens, ${kb(res.totalBytes)} → images-static.json/.md`);
}

// ---------------------------------------------------------------- renderizado
if (a.url) {
  const url = checkUrl(a.url);
  const width = Number(a.width) || 1440;
  const timeout = Number(a.timeout) || 30000;
  const pw = loadPlaywright();
  const browser = await launch(pw);
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', bypassCSP: true });
  await ctx.addInitScript(metricsInit);
  const page = await ctx.newPage();

  const net = new Map();
  const pending = [];
  page.on('response', (r) => {
    const ct = (r.headers()['content-type'] || '').split(';')[0];
    if (r.request().resourceType() !== 'image' && !ct.startsWith('image/')) return;
    pending.push(
      (async () => {
        let body = null;
        try { body = await r.body(); } catch { /* corpo indisponível (ex.: redirect) */ }
        net.set(r.url(), {
          status: r.status(),
          contentType: ct,
          bytes: body ? body.length : Number(r.headers()['content-length']) || null,
          body: body && body.length <= 5 * 1024 * 1024 ? body : null,
        });
      })(),
    );
  });

  try {
    await preparePage(page, url.href, timeout);
  } catch (err) {
    await browser.close();
    fail(`Falha ao abrir ${url.href}: ${String(err.message).split('\n')[0]}`, 3);
  }
  await Promise.allSettled(pending);

  const dom = await page.evaluate(() => {
    const out = [];
    const vh = innerHeight;
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY) };
    };
    document.querySelectorAll('img').forEach((el) => {
      const r = box(el);
      out.push({
        kind: 'img', src: el.currentSrc || el.src, natural: [el.naturalWidth, el.naturalHeight], rendered: [r.w, r.h], y: r.y,
        alt: el.hasAttribute('alt') ? el.getAttribute('alt') : null, loading: el.getAttribute('loading'),
        fetchpriority: el.getAttribute('fetchpriority'), decoding: el.getAttribute('decoding'),
        srcset: el.hasAttribute('srcset'), sizes: el.getAttribute('sizes'), picture: !!el.closest('picture'),
        widthAttr: el.getAttribute('width'), heightAttr: el.getAttribute('height'),
        broken: el.complete && el.naturalWidth === 0, hidden: r.w === 0 || r.h === 0,
        decorative: el.getAttribute('role') === 'presentation' || el.getAttribute('aria-hidden') === 'true',
        firstScreen: r.y < vh,
      });
    });
    const seen = new Set();
    document.querySelectorAll('body *').forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none') return;
      for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        const src = new URL(m[1], location.href).href;
        const r = box(el);
        const key = `${src}|${r.x}|${r.y}`;
        if (seen.has(key) || r.w === 0 || r.h === 0) continue;
        seen.add(key);
        out.push({ kind: 'background', src, natural: null, rendered: [r.w, r.h], y: r.y, alt: null, firstScreen: r.y < vh, hidden: false, element: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') });
      }
    });
    return { items: out, lcp: window.__audit?.lcp ?? null, cls: Number((window.__audit?.cls ?? 0).toFixed(4)), vh: innerHeight };
  });
  await browser.close();

  const fmtOf = (n, src) => (n?.contentType?.split('/')[1] ?? src.split('?')[0].split('.').pop()).replace('svg+xml', 'svg').replace('jpeg', 'jpg').toLowerCase();
  const items = dom.items.map((it) => {
    const n = net.get(it.src) ?? null;
    const format = fmtOf(n, it.src);
    const flags = [];
    const dataUri = it.src.startsWith('data:');
    if (it.broken) flags.push('quebrada');
    if (it.kind === 'img' && it.alt === null && !it.decorative) flags.push('alt-ausente');
    if (it.natural && it.rendered[0] > 0 && RASTER.has(format)) {
      const ratio = it.natural[0] / it.rendered[0];
      if (ratio > 2) flags.push(`natural ${ratio.toFixed(1)}× o renderizado (DPR 1)`);
      if (ratio < 1) flags.push(`natural ${ratio.toFixed(2)}× o renderizado (pode borrar)`);
    }
    if (n?.bytes && RASTER.has(format) && n.bytes > 200 * 1024) flags.push('peso>200KB');
    if (['png', 'jpg', 'gif'].includes(format) && n?.bytes > 100 * 1024) flags.push('considerar WebP/AVIF');
    const isLcp = !!dom.lcp?.url && dom.lcp.url === it.src;
    if (isLcp) {
      flags.push('é o elemento LCP');
      if (it.loading === 'lazy') flags.push('LCP com loading=lazy');
      if (it.kind === 'img' && it.fetchpriority !== 'high') flags.push('LCP sem fetchpriority=high (hipótese)');
    }
    if (it.kind === 'img' && !it.firstScreen && it.loading !== 'lazy' && it.y > dom.vh * 2) flags.push('abaixo da dobra sem lazy');
    if (it.kind === 'img' && (!it.widthAttr || !it.heightAttr) && !it.hidden) flags.push('sem width/height (risco de CLS, hipótese)');
    return { ...it, format, bytes: dataUri ? null : n?.bytes ?? null, status: n?.status ?? null, isLcp, dataUri, flags, _body: n?.body ?? null };
  });

  let saved = 0;
  if (!a['no-save']) {
    const dir = await ensureDir(path.join(outDir, 'files'));
    const done = new Map();
    for (const it of items) {
      if (!it._body || it.dataUri) continue;
      if (!done.has(it.src)) {
        if (saved >= 60) break;
        saved += 1;
        let base = decodeURIComponent(it.src.split('?')[0].split('/').pop() || 'imagem').replace(/[^\w.-]+/g, '_').slice(0, 60);
        if (!/\.[a-z0-9]{2,5}$/i.test(base)) base += `.${it.format}`;
        const file = `${String(saved).padStart(2, '0')}-${base}`;
        await fs.writeFile(path.join(dir, file), it._body);
        done.set(it.src, `files/${file}`);
      }
      it.savedAs = done.get(it.src);
    }
  }
  const clean = items.map(({ _body, ...rest }) => rest);
  await fs.writeFile(path.join(outDir, 'images-rendered.json'), JSON.stringify({ url: url.href, width, lcp: dom.lcp, cls: dom.cls, items: clean }, null, 2), 'utf8');
  const rows = clean
    .map((i) => `| ${i.kind} | ${i.src.startsWith('data:') ? 'data-uri' : i.src.slice(0, 90)} | ${i.format} | ${i.natural ? i.natural.join('×') : '—'} | ${i.rendered.join('×')} | ${kb(i.bytes)} | ${i.kind === 'img' ? (i.alt === null ? 'AUSENTE' : i.alt === '' ? 'vazio' : 'ok') : '—'} | ${i.loading ?? '—'} | ${i.flags.join('; ') || '—'} |`)
    .join('\n');
  await fs.writeFile(
    path.join(outDir, 'images-rendered.md'),
    `# Imagens no render\n\nMedido em ${url.href}, viewport ${width}px (DPR 1), ${new Date().toISOString()}. LCP: ${dom.lcp ? `${dom.lcp.time}ms ${dom.lcp.tag} ${dom.lcp.url ?? ''}` : 'n/d'} · CLS: ${dom.cls} (laboratório, indicativo).\n\n| Tipo | Origem | Formato | Natural | Renderizado | Peso | alt | loading | Alertas |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n`,
    'utf8',
  );
  clean.forEach((i, n) =>
    review.push({
      id: `R${n + 1}`,
      where: i.savedAs ? `${path.join(outDir, i.savedAs)} (origem: ${i.src.slice(0, 80)})` : i.src.slice(0, 120),
      facts: `${i.kind} ${i.format} natural ${i.natural ? i.natural.join('×') : '—'} renderizada ${i.rendered.join('×')} ${kb(i.bytes)}; alt: ${i.kind === 'img' ? (i.alt === null ? 'AUSENTE' : JSON.stringify(i.alt)) : '—'}; alerts: ${i.flags.join('; ') || 'nenhum'}`,
    }),
  );
  console.log(`Render (${width}px): ${clean.length} imagens, ${saved} cópias salvas → images-rendered.json/.md`);
}

// Roteiro de revisão visual: o agente abre cada imagem (lotes de 8) e preenche o resumo no arquivo.
const batches = [];
for (let i = 0; i < review.length; i += 8) batches.push(review.slice(i, i + 8));
const guide = batches
  .map(
    (b, n) =>
      `## Lote ${n + 1} (${b.length})\n\n` +
      b.map((r) => `### ${r.id} — ${r.where}\n- Fatos medidos: ${r.facts}\n- Resumo visual: _(preencher após abrir a imagem: assunto, recorte, qualidade, nitidez, texto embutido, consistência de estilo, adequação ao papel na página)_\n`).join('\n'),
  )
  .join('\n');
await fs.writeFile(
  path.join(outDir, 'imagens-revisao.md'),
  `# Revisão visual de imagens\n\nAbra cada imagem com a ferramenta de visualização, em lotes de até 8, e preencha o resumo logo após cada lote. SVG pode não abrir no visualizador: use as fatias de captura da página. Nada abaixo foi visto até ser preenchido.\n\n${guide || '_sem imagens_'}`,
  'utf8',
);
console.log(`Roteiro de revisão: ${review.length} itens em ${batches.length} lotes → imagens-revisao.md (em ${outDir})`);
