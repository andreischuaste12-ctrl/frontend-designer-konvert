#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { ensureDir, fail, launch, loadPlaywright, redactText } from './_common.mjs';

const FIELDS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'background', 'padding', 'borderRadius', 'boxShadow', 'rect.x', 'rect.y', 'rect.w', 'rect.h'];
class ComparisonError extends Error {}
export function compareStyles(before, after) {
  for (const sample of [before, after]) {
    if (!Number.isInteger(sample.meta?.width) || sample.meta.width <= 0 || !['light', 'dark'].includes(sample.meta?.scheme) || !Array.isArray(sample.elements)) throw new ComparisonError('Invalid measured-style capture.');
  }
  if (before.meta?.width !== after.meta?.width || before.meta?.scheme !== after.meta?.scheme) {
    throw new ComparisonError('Style captures must use the same viewport width and color scheme.');
  }
  const key = (item) => `${item.category}:${item.selector}`;
  const index = (items) => {
    const map = new Map();
    for (const item of items) {
      const id = key(item);
      if (map.has(id)) throw new ComparisonError('Ambiguous element identifiers; narrow the capture selectors before comparison.');
      map.set(id, item);
    }
    return map;
  };
  const left = index(before.elements ?? []);
  const right = index(after.elements ?? []);
  const entries = [];
  for (const id of new Set([...left.keys(), ...right.keys()])) {
    const a = left.get(id), b = right.get(id);
    const value = (item, field) => field.split('.').reduce((v, k) => v?.[k], item);
    const changes = a && b ? FIELDS.filter((field) => JSON.stringify(value(a, field)) !== JSON.stringify(value(b, field))).map((field) => {
      const x = value(a, field) ?? null, y = value(b, field) ?? null;
      const result = { field, before: x, after: y };
      const one = String(x).match(/^(-?\d+(?:\.\d+)?)(px)?$/), two = String(y).match(/^(-?\d+(?:\.\d+)?)(px)?$/);
      if (one && two && one[2] === two[2]) result.delta = { amount: Number((Number(two[1]) - Number(one[1])).toFixed(4)), unit: one[2] ?? (field.startsWith('rect.') ? 'px' : 'number') };
      return result;
    }) : [];
    entries.push({ element: id, status: !a ? 'added' : !b ? 'removed' : changes.length ? 'changed' : 'unchanged', changes });
  }
  return { width: before.meta?.width, scheme: before.meta?.scheme, entries };
}

async function locate(dir, file, subdir) {
  for (const candidate of [path.join(dir, file), path.join(dir, subdir, file)]) {
    try { await fs.access(candidate); return candidate; } catch { /* next location */ }
  }
  return null;
}
const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
function sanitize(value) {
  if (typeof value === 'string') return redactText(value, 1000);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v)]));
  return value;
}

async function comparePixels(leftFile, rightFile, out, threshold) {
  const left = await readJson(leftFile), right = await readJson(rightFile);
  const id = (item) => JSON.stringify([item.route, item.width, item.scheme, item.state]);
  const index = (files) => {
    const map = new Map();
    for (const file of files) {
      if (map.has(id(file))) throw new ComparisonError('Duplicate screenshot identities.');
      map.set(id(file), file);
    }
    return map;
  };
  const a = index(left.files), b = index(right.files);
  const results = [];
  const browser = await launch(loadPlaywright());
  try {
    const page = await browser.newPage();
    // Only embedded local PNG data is loaded; no target-site JavaScript or network.
    await page.route('**/*', (route) => route.abort());
    for (const key of new Set([...a.keys(), ...b.keys()])) {
      const first = a.get(key), second = b.get(key);
      const label = `pair-${String(results.length + 1).padStart(3, '0')}`;
      if (!first || !second) { results.push({ pair: label, status: 'missing', width: (first ?? second).width }); continue; }
      async function imageData(base, entry) {
        if (path.basename(entry.file) !== entry.file || !entry.file.endsWith('.png')) throw new ComparisonError('Unsafe screenshot filename in capture index.');
        const file = path.join(path.dirname(base), entry.file);
        const relative = path.relative(await fs.realpath(path.dirname(base)), await fs.realpath(file));
        if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new ComparisonError('Screenshot escapes capture directory.');
        if ((await fs.stat(file)).size > 20 * 1024 * 1024) throw new ComparisonError('Screenshot exceeds the 20 MB input limit.');
        const png = await fs.readFile(file);
        if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.readUInt32BE(16) * png.readUInt32BE(20) > 20000000) throw new ComparisonError('PNG input is invalid or exceeds the decoded pixel limit.');
        return `data:image/png;base64,${png.toString('base64')}`;
      }
      const result = await page.evaluate(async ({ a, b, threshold }) => {
        async function decode(src) { const img = new Image(); img.src = src; await img.decode(); return img; }
        const x = await decode(a), y = await decode(b);
        if (x.width !== y.width || x.height !== y.height) return { status: 'dimension-mismatch', before: [x.width, x.height], after: [y.width, y.height] };
        const pixels = x.width * x.height;
        if (pixels > 20000000) return { status: 'pixel-limit' };
        const canvas = document.createElement('canvas'); canvas.width = x.width; canvas.height = x.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(x, 0, 0); const one = ctx.getImageData(0, 0, x.width, x.height);
        ctx.clearRect(0, 0, x.width, x.height); ctx.drawImage(y, 0, 0); const two = ctx.getImageData(0, 0, x.width, x.height);
        let different = 0;
        for (let i = 0; i < one.data.length; i += 4) {
          const changed = [0, 1, 2, 3].some((channel) => Math.abs(one.data[i + channel] - two.data[i + channel]) > threshold);
          if (changed) different++;
          one.data[i] = changed ? 255 : 240; one.data[i + 1] = changed ? 0 : 240; one.data[i + 2] = changed ? 100 : 240; one.data[i + 3] = 255;
        }
        ctx.putImageData(one, 0, 0);
        return { status: 'compared', differentPixels: different, totalPixels: pixels, differentPercent: Number((100 * different / pixels).toFixed(4)), png: different ? canvas.toDataURL('image/png').split(',')[1] : null };
      }, { a: await imageData(leftFile, first), b: await imageData(rightFile, second), threshold });
      if (result.png) { await fs.writeFile(path.join(out, `${label}-diff.png`), Buffer.from(result.png, 'base64')); delete result.png; result.diffFile = `${label}-diff.png`; }
      else delete result.png;
      results.push({ pair: label, route: first.route, width: first.width, scheme: first.scheme, state: first.state, ...result });
    }
  } finally { await browser.close(); }
  return results;
}

async function main() {
  const { values: a } = parseArgs({ options: {
    before: { type: 'string' }, after: { type: 'string' }, out: { type: 'string', default: '.audit/comparison' },
    pixels: { type: 'boolean', default: false }, threshold: { type: 'string', default: '24' }, help: { type: 'boolean', default: false },
  } });
  if (a.help || !a.before || !a.after) {
    console.log('Usage: node compare.mjs --before <audit-dir> --after <audit-dir> [--pixels] [--threshold 0..255] [--out .audit/comparison]');
    process.exitCode = a.help ? 0 : 1; return;
  }
  const threshold = Number(a.threshold);
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255) throw new ComparisonError('Threshold must be an integer from 0 to 255.');
  const report = { schemaVersion: 1, styles: null, pixels: null, limitations: [
    'Style matching uses category and selector, not semantic role inference. Unmatched elements need human review.',
    'Pixel differences reflect rendering conditions, not UX quality or accessibility compliance.',
  ] };
  const left = await locate(a.before, 'computed-styles.json', 'styles'), right = await locate(a.after, 'computed-styles.json', 'styles');
  if (!!left !== !!right) throw new ComparisonError('Style data must exist on both sides.');
  if (left) report.styles = compareStyles(await readJson(left), await readJson(right));
  const out = await ensureDir(path.resolve(a.out));
  if (a.pixels) {
    const x = await locate(a.before, 'capture-index.json', 'screenshots'), y = await locate(a.after, 'capture-index.json', 'screenshots');
    if (!x || !y) throw new ComparisonError('Pixel comparison requires capture-index.json on both sides.');
    report.pixels = await comparePixels(x, y, out, threshold);
    report.pixelChannelThreshold = threshold;
  }
  if (!report.styles && !report.pixels) throw new ComparisonError('No comparable artifacts found. Supply style captures or enable --pixels.');
  const safe = sanitize(report);
  await fs.writeFile(path.join(out, 'comparison.json'), JSON.stringify(safe, null, 2));
  const escape = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
  const rows = safe.styles?.entries.filter((e) => e.status !== 'unchanged').map((e) => `| ${escape(e.element)} | ${e.status} | ${e.changes.map((c) => escape(`${c.field}: ${JSON.stringify(c.before)} → ${JSON.stringify(c.after)}`)).join('; ')} |`).join('\n') ?? '';
  const pixels = safe.pixels?.map((p) => `- ${p.pair}: ${p.status}${p.differentPercent !== undefined ? ` · ${p.differentPercent}% different` : ''}${p.diffFile ? ` · ${p.diffFile}` : ''}`).join('\n') ?? 'Not requested.';
  await fs.writeFile(path.join(out, 'comparison.md'), `# Render comparison\n\n${report.limitations.join('\n\n')}\n\n## Style samples\n\n| Element | Status | Differences |\n|---|---|---|\n${rows}\n\n## Pixels\n\n${pixels}\n`);
  console.log('Comparison written: comparison.json and comparison.md');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((err) => fail(err instanceof ComparisonError ? `Comparison failed: ${err.message}` : 'Comparison failed. Check input files, matching viewports, unique selectors, and screenshot limits. Input paths and values were omitted for privacy.'));
}
