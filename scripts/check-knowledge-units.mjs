#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

export const REQUIRED = ['Contexto', 'Estados', 'Quando se aplica', 'Exceções', 'Evidência a coletar', 'Método', 'Prioridade padrão', 'Recomendação', 'Critério de aceite', 'Preservar', 'Dependência externa', 'Métrica a monitorar', 'Fonte'];
/** Free-text fields that must be written for the specific problem, never copied between units. */
export const SPECIFIC_FIELDS = ['Quando se aplica', 'Exceções', 'Evidência a coletar', 'Recomendação', 'Critério de aceite', 'Preservar', 'Métrica a monitorar'];
const methods = new Set(['automático', 'inspeção', 'hipótese']);
const states = new Set(['normal', 'carregando', 'erro', 'sucesso', 'vazio', 'recuperação']);
const idPattern = /UXK-(?:CHK|FRM|NAV|ERR|DSH|GEN)-\d{3}/g;
const JOURNEYS = /^(?:Checkout and payment|Forms and sign-up|Mobile navigation, search and listings|Errors, empty states and recovery|Tables and dashboards)$/;
const STACK_COLUMNS = new Map([['Shopify', /\bShopify\b/], ['VTEX IO', /\bVTEX\b/], ['WordPress/Woo', /\bWordPress\b|\bWooCommerce\b/], ['React/Next + Tailwind', /\bReact\b|\bNext\.js\b|\bTailwind\b/], ['HTML', /\bHTML\b/]]);
const STATE_COLUMNS = new Map([['Normal', 'normal'], ['Loading', 'carregando'], ['Error', 'erro'], ['Success', 'sucesso'], ['Empty', 'vazio'], ['Recovery', 'recuperação']]);
const LABEL = /^(orientação|verificação|teste)\s*:/i;

const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const words = (value) => new Set(normalize(value).split(' ').filter((w) => w.length > 2));
/** Jaccard overlap and containment of content words; containment catches a criterion that wraps the recommendation in boilerplate. */
function overlap(a, b) {
  const x = words(a), y = words(b);
  if (!x.size || !y.size) return { jaccard: 0, containment: 0 };
  let shared = 0;
  for (const w of x) if (y.has(w)) shared++;
  return { jaccard: shared / new Set([...x, ...y]).size, containment: Math.min(x.size, y.size) >= 3 ? shared / Math.min(x.size, y.size) : 0 };
}
export const isVerifiedSource = (source) => /verificado em \d{4}-\d{2}-\d{2}/i.test(source ?? '') && /@[0-9a-f]{7,40}\b|https?:\/\//i.test(source ?? '');

export function checkUnits(markdown, file = 'input') {
  const errors = [], ids = [], units = new Map();
  const heads = [...markdown.matchAll(/^###\s+(UXK-(?:CHK|FRM|NAV|ERR|DSH|GEN)-\d{3})(?=\s|$).*$/gm)];
  const candidateHeads = [...markdown.matchAll(/^###\s+UXK-.*$/gm)];
  if (candidateHeads.length !== heads.length) errors.push(`${file}: invalid unit heading`);
  for (const [i, head] of heads.entries()) {
    const id = head[1]; ids.push(id);
    const section = markdown.slice(head.index, heads[i + 1]?.index ?? markdown.length).split(/^##\s/m)[0];
    const fields = new Map();
    for (const match of section.matchAll(/^- \*\*([^*]+):\*\*\s*(.*?)\s*$/gm)) {
      if (fields.has(match[1])) errors.push(`${file}: ${id} duplicate field ${match[1]}`);
      fields.set(match[1], match[2]);
    }
    units.set(id, fields);
    for (const label of REQUIRED) if (!fields.get(label)) errors.push(`${file}: ${id} missing ${label}`);
    const method = fields.get('Método'), priority = fields.get('Prioridade padrão');
    if (method && !methods.has(method)) errors.push(`${file}: ${id} invalid method`);
    if (priority && !/^P[0-3]$/.test(priority)) errors.push(`${file}: ${id} invalid priority`);
    if (method === 'hipótese' && priority === 'P0') errors.push(`${file}: ${id} hypothesis cannot be P0`);
    const listed = (fields.get('Estados') ?? '').split(',').map(s => s.trim());
    if (!listed.length || listed.some(s => !states.has(s))) errors.push(`${file}: ${id} invalid states`);
    const dependency = fields.get('Dependência externa') ?? '';
    if (!/^(?:pendente|resolvida|não aplicável)(?:\s|$|\s*—)/i.test(dependency)) errors.push(`${file}: ${id} invalid dependency`);
    if (/\[comercial\]/i.test(fields.get('Contexto') ?? '') && !/^pendente(?:\s|$|\s*—)/i.test(dependency)) errors.push(`${file}: ${id} commercial dependency must be pending`);
    const source = fields.get('Fonte') ?? '';
    if (source && !/não verificada/i.test(source) && !isVerifiedSource(source)) errors.push(`${file}: ${id} source needs "não verificada" or a verification date with a commit or URL`);
    const recommendation = fields.get('Recomendação'), criterion = fields.get('Critério de aceite');
    const { jaccard, containment } = overlap(recommendation, criterion);
    if (recommendation && criterion && (jaccard >= 0.6 || containment >= 0.8)) errors.push(`${file}: ${id} acceptance criterion restates the recommendation; describe an observable pass condition`);
  }
  if (new Set(ids).size !== ids.length) errors.push(`${file}: duplicate unit ID`);
  return { ids, errors, units };
}

/** Rejects template text copied across units, which passes field checks but gives the agent no specific guidance. */
export function checkSpecificity(units) {
  const errors = [];
  for (const field of SPECIFIC_FIELDS) {
    const seen = new Map();
    for (const [id, fields] of units) {
      const value = normalize(fields?.get(field));
      if (!value) continue;
      if (seen.has(value)) errors.push(`${id} repeats "${field}" from ${seen.get(value)}; write it for this problem`);
      else seen.set(value, id);
    }
  }
  return errors;
}

export function checkCoverageMap(markdown, known) {
  const units = known instanceof Map ? known : new Map([...known].map((id) => [id, null]));
  const errors = [];
  let header = null;
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) { header = null; continue; }
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells[0] === 'Journey') { header = cells; continue; }
    const journeyRow = JOURNEYS.test(cells[0]);
    const stackTable = Boolean(header && STACK_COLUMNS.has(header[1]));
    for (const [index, cell] of cells.entries()) {
      if (journeyRow && index > 0 && cell !== '—' && !LABEL.test(cell) && !(stackTable && cell === 'não se aplica')) errors.push(`coverage map: invalid journey cell "${cell}"`);
      if (!/^(?:orientação|verificação|teste)(?=\s|:|$)/i.test(cell)) continue;
      if (!LABEL.test(cell)) errors.push('coverage map: invalid cell label');
      const label = cell.match(LABEL)?.[1]?.toLowerCase();
      const ids = cell.match(idPattern) ?? [];
      if (!ids.length) errors.push('coverage map: cell cites no unit');
      if (label === 'teste') errors.push('coverage map: "teste" requires an evaluation case and is not claimed yet');
      const column = header?.[index];
      for (const id of ids) {
        if (!units.has(id)) { errors.push(`coverage map: unknown unit ${id}`); continue; }
        const fields = units.get(id);
        if (!fields || !journeyRow) continue;
        if (label === 'verificação' && !isVerifiedSource(fields.get('Fonte'))) errors.push(`coverage map: ${id} is cited as verificação but its source is not verified`);
        if (stackTable && STACK_COLUMNS.has(column) && !STACK_COLUMNS.get(column).test(fields.get('Contexto') ?? '')) errors.push(`coverage map: ${id} does not name ${column} in Contexto`);
        if (STATE_COLUMNS.has(column) && !(fields.get('Estados') ?? '').split(',').map((s) => s.trim()).includes(STATE_COLUMNS.get(column))) errors.push(`coverage map: ${id} does not list state ${STATE_COLUMNS.get(column)}`);
      }
    }
  }
  return errors;
}

export async function checkKnowledge(root) {
  const dir = path.join(root, 'skills/audit-frontend-designer-konvert/knowledge-base');
  const errors = [], known = new Map();
  for (const name of (await fs.readdir(dir)).filter(n => n.endsWith('.md')).sort()) {
    const result = checkUnits(await fs.readFile(path.join(dir, name), 'utf8'), `knowledge-base/${name}`);
    errors.push(...result.errors);
    for (const [id, fields] of result.units) { if (known.has(id)) errors.push(`duplicate unit ID across files: ${id}`); known.set(id, fields); }
  }
  errors.push(...checkSpecificity(known).map((e) => `knowledge-base: ${e}`));
  errors.push(...checkCoverageMap(await fs.readFile(path.join(root, 'docs/coverage-map.md'), 'utf8'), known));
  return errors;
}
