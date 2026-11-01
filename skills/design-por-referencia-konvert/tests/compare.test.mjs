import test from 'node:test';
import assert from 'node:assert/strict';
import { compareStyles } from '../scripts/compare.mjs';

const sample = (elements, width = 375) => ({ meta: { width, scheme: 'light' }, elements });
const heading = { category: 'h1', selector: 'h1', color: '#111', fontSize: '32px' };
test('style comparison distinguishes unchanged, changed, added, and removed samples', () => {
  const before = sample([heading, { category: 'p', selector: 'p.old', color: '#000' }]);
  const after = sample([{ ...heading, color: '#222' }, { category: 'p', selector: 'p.new', color: '#333' }]);
  const result = compareStyles(before, after);
  assert.deepEqual(result.entries.map((e) => e.status), ['changed', 'removed', 'added']);
  assert.deepEqual(result.entries[0].changes, [{ field: 'color', before: '#111', after: '#222' }]);
  assert.equal(compareStyles(sample([heading]), sample([heading])).entries[0].status, 'unchanged');
});
test('comparison refuses mismatched viewports and ambiguous sample identifiers', () => {
  assert.throws(() => compareStyles({}, {}), /Invalid/);
  assert.throws(() => compareStyles(sample([heading]), sample([heading], 1440)), /same viewport/);
  assert.throws(() => compareStyles(sample([heading, heading]), sample([heading])), /Ambiguous/);
});
test('numeric measurements include a signed delta without inventing color deltas', () => {
  const result = compareStyles(sample([{ ...heading, rect: { w: 100 } }]), sample([{ ...heading, fontSize: '40px', rect: { w: 120 } }]));
  assert.deepEqual(result.entries[0].changes.find((c) => c.field === 'fontSize').delta, { amount: 8, unit: 'px' });
  assert.deepEqual(result.entries[0].changes.find((c) => c.field === 'rect.w').delta, { amount: 20, unit: 'px' });
});
test('different page URLs require explicit mapping confirmation', () => {
  const a = { ...sample([heading]), meta: { width: 375, scheme: 'light', url: 'https://example.invalid/a' } };
  const b = { ...sample([heading]), meta: { width: 375, scheme: 'light', url: 'https://example.invalid/b' } };
  assert.throws(() => compareStyles(a, b), /confirmed page mapping/);
  assert.equal(compareStyles(a, b, { confirmPageMapping: true }).pageMapping, 'operator-confirmed');
  assert.equal(compareStyles(a, a).pageMapping, 'unverified');
});

test('opacity, contrast certainty and sample membership are changes even with identical typography', () => {
  const before = sample([{ ...heading, opacity: 0.4, ancestorOpacityProduct: 0.4, contrastStatus: 'indeterminado', contrastOpacityIndeterminate: true, count: 2 }]);
  const after = sample([{ ...heading, opacity: 1, ancestorOpacityProduct: 1, contrastStatus: 'falha', contrastOpacityIndeterminate: false, count: 1 }]);
  const result = compareStyles(before, after);
  assert.equal(result.entries[0].status, 'changed');
  for (const field of ['opacity', 'ancestorOpacityProduct', 'contrastStatus', 'contrastOpacityIndeterminate', 'count']) assert.ok(result.entries[0].changes.some((c) => c.field === field));
  assert.ok(result.limitation.includes('sampled fields'));
});
