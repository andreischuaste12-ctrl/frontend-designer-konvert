#!/usr/bin/env node
// Render validated, already-reviewed report data locally; no target site or remote assets are loaded.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { validateAuditReport } from './validate-report.mjs';
import { prepareBrowser } from './prepare-browser.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const list = (values, empty) => values?.length ? `<ul>${values.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>` : `<p>${esc(empty)}</p>`;
const label = { problem: 'Problema observado', opportunity: 'Oportunidade', needs_validation: 'Precisa de validação' };
const confidence = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const state = { observed: 'Observado', not_observed: 'Não observado', blocked: 'Bloqueado', not_applicable: 'Não se aplica' };
const text = (name, value) => value ? `<div class="item"><h3>${esc(name)}</h3><p>${esc(value)}</p></div>` : '';

export function clientHtml(input) {
  const { errors, warnings, report } = validateAuditReport(input);
  if (input?.schema_version !== 3) errors.push('O PDF requer um relatório schema_version 3.');
  if (errors.length) throw new Error(`Relatório inválido: ${errors.join('; ')}`);
  const findings = [...report.findings].sort((a, b) => a.priority.localeCompare(b.priority));
  const sections = findings.map((f) => {
    const dep = f.external_dependency;
    const decision = dep.status === 'pending' ? `Pendente: ${dep.detail}` : dep.status === 'resolved' ? `Resolvida: ${dep.detail} ${dep.resolution}` : 'Nenhuma dependência externa informada.';
    return `<section class="finding"><div class="meta"><span>${esc(f.id)}</span><span>${esc(f.priority)}</span><span>${esc(label[f.finding_kind])}</span></div><h2>${esc(f.location)}</h2>
      ${text('O que foi observado', f.evidence_observed)}
      ${text('Por que isso importa', [f.inference, f.probable_impact].filter(Boolean).join(' '))}
      ${text('O que ainda precisa ser validado', f.hypothesis)}
      ${text('Como melhorar', f.next_step)}
      ${text('Como verificar a melhoria', f.acceptance_criteria)}
      ${text('Evidência e confiança', `${f.evidence.source} · estado ${f.evidence.state} · ${f.evidence.viewport}. Confiança ${confidence[f.confidence.level]}: ${f.confidence.reason}`)}
      ${text('Decisões e dependências', decision)}
      ${text('O que preservar', f.preserve.join('; '))}</section>`;
  }).join('');
  const scopeLabels = { tasks: 'Tarefas', viewports: 'Tamanhos de tela', dimensions: 'Dimensões', routes: 'Páginas', states: 'Estados' };
  const scope = Object.entries(report.scope).map(([key, value]) => `${scopeLabels[key] ?? key}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : value}`);
  const gaps = (report.coverage || []).filter((row) => row.result !== 'observed').map((row) => `${row.area} · ${row.task} · ${row.state} · ${row.viewport}: ${state[row.result]} — ${row.reason}`);
  const priorities = findings.slice(0, 3).map((f) => `${f.priority} · ${f.id} — ${label[f.finding_kind]} em ${f.location}`);
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Auditoria de experiência</title><style>
  @page{size:A4;margin:18mm 16mm 20mm}*{box-sizing:border-box}body{font:10.5pt/1.5 Arial,sans-serif;color:#182738}h1{font-size:27pt;line-height:1.12;margin:0 0 10pt}h2{font-size:16pt;line-height:1.25;margin:0 0 12pt}h3{font-size:10pt;color:#284d70;margin:12pt 0 3pt}p{margin:0 0 7pt;overflow-wrap:anywhere}ul{padding-left:18pt;margin:4pt 0 14pt}li{margin:0 0 5pt;overflow-wrap:anywhere}.cover{border-top:8pt solid #315f83;padding-top:24pt;margin-bottom:26pt}.eyebrow,.meta{font-size:9pt;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#315f83}.muted{color:#536678}.summary{padding:16pt;background:#eef4f6;border-radius:5pt;margin-bottom:20pt}.finding{break-before:page}.meta{display:flex;gap:12pt;margin-bottom:9pt}.item{break-inside:avoid}.closing{break-before:page}.note{font-size:9pt;color:#536678}
  </style></head><body><header class="cover"><p class="eyebrow">Auditoria de experiência e interface</p><h1>${esc(report.project)}</h1><p class="muted">Relatório ${esc(report.report_id)} · Recomendações para decisão</p></header>
  <section class="summary"><h2>Prioridades para decisão</h2>${list(priorities, 'Nenhum achado foi registrado no escopo examinado.')}</section>
  <section><h2>Escopo da análise</h2>${list(scope, 'Escopo não informado.')}<h3>Limites da evidência</h3>${list(report.evidence_limits, 'Nenhuma limitação adicional foi registrada.')}
  <h3>O que funciona e deve ser preservado</h3>${list(report.preserve, 'Nenhum item de preservação registrado.')}</section>
  ${sections}<section class="closing"><h2>Cobertura e próximos passos</h2><h3>Estados não observados, bloqueados ou não aplicáveis</h3>${list(gaps, 'Nenhuma lacuna de cobertura foi registrada.')}
  <h3>Próximo passo</h3><p>Revise as recomendações e decida quais devem avançar. A implementação depende de aprovação e da resolução de eventuais dependências.</p><p class="note">Os efeitos esperados são hipóteses quando não foram medidos. Esta auditoria não constitui certificação de acessibilidade.</p></section></body></html>`;
  return { html, warnings };
}

const BROWSER_ENV = 'PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH';

// Use the same browser discovery as `doctor` and `check-project`; an explicit environment override always wins.
async function withDiscoveredBrowser(browserScripts, prepare, task) {
  const previous = process.env[BROWSER_ENV];
  if (previous === undefined) {
    const prepared = await prepare(path.dirname(path.resolve(browserScripts)));
    if (prepared.status === 'ready' && prepared.executablePath) process.env[BROWSER_ENV] = prepared.executablePath;
  }
  try { return await task(); }
  finally { if (previous === undefined) delete process.env[BROWSER_ENV]; }
}

export async function renderPdf({ input, out, browserScripts, prepare = prepareBrowser }) {
  const { html, warnings } = clientHtml(input);
  const common = await import(pathToFileURL(path.resolve(browserScripts, '_common.mjs')).href);
  await withDiscoveredBrowser(browserScripts, prepare, () => writePdf({ common, html, out }));
  return { warnings };
}

async function writePdf({ common, html, out }) {
  const browser = await common.launch(common.loadPlaywright());
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route('**/*', (route) => route.abort());
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, tagged: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font:9px Arial;color:#64748b;width:100%;text-align:center">Auditoria de experiência · <span class="pageNumber"></span> / <span class="totalPages"></span></div>', margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' } });
    await fs.writeFile(out, pdf, { flag: 'wx', mode: 0o600 });
  } finally { await browser.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values, positionals } = parseArgs({ options: { out: { type: 'string' }, 'browser-scripts': { type: 'string' } }, allowPositionals: true, strict: true });
    if (positionals.length !== 1 || !values.out || !values['browser-scripts'] || !values.out.toLowerCase().endsWith('.pdf')) throw new Error('Uso: node render-client-pdf.mjs <audit-report.json> --out <novo-arquivo.pdf> --browser-scripts <scripts-da-executora>');
    const input = JSON.parse(await fs.readFile(positionals[0], 'utf8'));
    const result = await renderPdf({ input, out: values.out, browserScripts: values['browser-scripts'] });
    for (const warning of result.warnings) console.error(`Aviso: ${warning}`);
    console.log('PDF gerado. Revise o conteúdo, a paginação e a privacidade antes de compartilhar.');
  } catch (error) { console.error(`Não foi possível gerar o PDF: ${error.message}`); process.exitCode = 1; }
}
