#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

export const REQUIRED = ['Contexto', 'Estados', 'Quando se aplica', 'Exceções', 'Evidência a coletar', 'Método', 'Prioridade padrão', 'Recomendação', 'Critério de aceite', 'Preservar', 'Dependência externa', 'Métrica a monitorar', 'Fonte'];
const methods = new Set(['automático', 'inspeção', 'hipótese']);
const states = new Set(['normal', 'carregando', 'erro', 'sucesso', 'vazio', 'recuperação']);
const idPattern = /UXK-(?:CHK|FRM|NAV|ERR|DSH|GEN)-\d{3}/g;
export function checkUnits(markdown, file = 'input') {
  const errors = [], ids = [];
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
    if (source && !/não verificada/i.test(source) && !/verificado em \d{4}-\d{2}-\d{2}/i.test(source)) errors.push(`${file}: ${id} source needs verification status`);
  }
  if (new Set(ids).size !== ids.length) errors.push(`${file}: duplicate unit ID`);
  return { ids, errors };
}
export function checkCoverageMap(markdown, knownIds) {
  const errors = [];
  for (const line of markdown.split('\n').filter(l => l.startsWith('|'))) {
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    const journeyRow = /^(?:Checkout and payment|Forms and sign-up|Mobile navigation, search and listings|Errors, empty states and recovery|Tables and dashboards)$/.test(cells[0]);
    for (const [index, cell] of cells.entries()) {
      if (journeyRow && index > 0 && cell !== '—' && !/^(?:orientação|verificação|teste)\s*:/i.test(cell)) errors.push('coverage map: invalid journey cell');
      if (!/^(?:orientação|verificação|teste)(?=\s|:|$)/i.test(cell)) continue;
      if (!/^(?:orientação|verificação|teste)\s*:/i.test(cell)) errors.push('coverage map: invalid cell label');
      const ids = cell.match(idPattern) ?? [];
      if (!ids.length) errors.push('coverage map: cell cites no unit');
      for (const id of ids) if (!knownIds.has(id)) errors.push(`coverage map: unknown unit ${id}`);
    }
  }
  return errors;
}
export async function checkKnowledge(root) {
  const dir = path.join(root, 'skills/audit-frontend-designer-konvert/knowledge-base');
  const errors = [], known = new Set();
  for (const name of (await fs.readdir(dir)).filter(n => n.endsWith('.md'))) {
    const result = checkUnits(await fs.readFile(path.join(dir, name), 'utf8'), `knowledge-base/${name}`);
    errors.push(...result.errors);
    for (const id of result.ids) { if (known.has(id)) errors.push(`duplicate unit ID across files: ${id}`); known.add(id); }
  }
  errors.push(...checkCoverageMap(await fs.readFile(path.join(root, 'docs/coverage-map.md'), 'utf8'), known));
  return errors;
}
