#!/usr/bin/env node
// Checks public reference URLs without credentials, redirects to private networks, or stored cookies.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { ipBlockReason } from '../skills/design-por-referencia-konvert/scripts/_network.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function normalizedUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || isIP(u.hostname.replace(/^\[|\]$/g, '')) || u.hostname === 'localhost' || u.hostname.endsWith('.localhost')) return null;
    u.search = ''; u.hash = '';
    return u.href;
  } catch { return null; }
}
export function collectUrls(text) {
  return [...new Set([...String(text).matchAll(/https:\/\/[^\s<>"'\])]+/gi)].map((m) => normalizedUrl(m[0].replace(/[.,;:]+$/, ''))).filter(Boolean))].sort();
}
export function publicIPv4(addresses) {
  const v4 = Array.isArray(addresses) ? addresses.filter((entry) => isIP(entry?.address) === 4) : [];
  if (!v4.length || v4.some(({ address }) => address.startsWith('127.') || ipBlockReason(address, false))) return null;
  return v4[0].address;
}
async function withTimeout(promise, ms) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); })]); }
  finally { clearTimeout(timer); }
}
function pinnedHead(url, address, timeout) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = httpsRequest(u, { method: 'HEAD', family: 4, servername: u.hostname, timeout, lookup: (_host, _options, callback) => callback(null, address, 4), headers: { 'User-Agent': 'Konvert-Reference-Check/1.0' } }, (res) => {
      const status = res.statusCode, location = res.headers.location;
      res.resume(); resolve({ status, location });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject); req.end();
  });
}
export async function checkReference(raw, { lookup = dnsLookup, request = pinnedHead, timeout = 5000 } = {}) {
  let url = normalizedUrl(raw);
  if (!url) return { status: 'inconclusive', reason: 'unsupported URL' };
  for (let hop = 0; hop <= 3; hop++) {
    let addresses;
    try { addresses = await withTimeout(lookup(new URL(url).hostname, { all: true, verbatim: true }), timeout); }
    catch { return { status: 'inconclusive', reason: 'DNS unavailable or timed out' }; }
    const address = publicIPv4(addresses);
    if (!address) return { status: 'inconclusive', reason: 'no exclusively public IPv4 answer' };
    let response;
    try { response = await request(url, address, timeout); }
    catch { return { status: 'inconclusive', reason: 'connection or TLS failed' }; }
    if (response.status >= 200 && response.status < 300) return { status: 'available', httpStatus: response.status };
    if ([301,302,303,307,308].includes(response.status) && response.location) {
      try { url = normalizedUrl(new URL(response.location, url).href); } catch { url = null; }
      if (!url) return { status: 'inconclusive', reason: 'unsupported redirect' };
      continue;
    }
    if ([404, 410].includes(response.status)) return { status: 'unavailable', httpStatus: response.status };
    if ([401, 403, 429].includes(response.status)) return { status: 'restricted', httpStatus: response.status };
    return { status: 'inconclusive', httpStatus: response.status };
  }
  return { status: 'inconclusive', reason: 'redirect limit' };
}
async function main() {
  // Direct pinned connections cannot safely honor an HTTP proxy; do not bypass one.
  if (process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy) throw new Error('Proxy configuration is unsupported; no requests made.');
  const files = ['skills/audit-frontend-designer-konvert/knowledge-base/02-catalogo-de-referencias.md', 'skills/audit-frontend-designer-konvert/knowledge-base/05-estudos-ux-ui-psicologia.md'];
  const urls = collectUrls((await Promise.all(files.map((file) => fs.readFile(path.join(root, file), 'utf8')))).join('\n'));
  const results = [];
  // Bounded workers avoid a burst of requests to external sites.
  let next = 0;
  await Promise.all(Array.from({ length: 3 }, async () => { while (next < urls.length) { const index = next++; results[index] = { url: urls[index], checkedAt: new Date().toISOString(), ...await checkReference(urls[index]) }; } }));
  console.log('# Reference availability (HTTP HEAD)\n\nA response is not a content or scientific verification. Restricted and inconclusive sources require manual review; no links are deleted.\n\n| Source | Checked at (UTC) | Status | HTTP |\n| --- | --- | --- | --- |');
  for (const item of results) console.log(`| ${item.url} | ${item.checkedAt} | ${item.status} | ${item.httpStatus ?? '—'} |`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message === 'Proxy configuration is unsupported; no requests made.' ? error.message : 'Reference check failed; details omitted.'); process.exitCode = 1; });
}
