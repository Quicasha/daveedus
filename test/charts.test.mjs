/* Line-chart value labels: a chart of up to 10 points writes each value above
   its dot. Two neighbours at the same height must never run into each other -
   a real "Abs" page once showed 7300 next to 7301 as one number, 73007301. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, iso } from './harness.mjs';

/* every value label of a rendered chart: { x, y, anchor, text } */
const valueLabels = svg => [...svg.matchAll(/<text x="([^"]+)" y="([^"]+)" fill="var\(--text\)"[^>]*text-anchor="(\w+)">([^<]*)<\/text>/g)]
  .map(m => ({ x: +m[1], y: +m[2], anchor: m[3], text: m[4] }));
/* a label's horizontal extent: 6.5 px per character at the chart's 11 px bold */
const span = l => {
  const w = l.text.length * 6.5;
  return l.anchor === 'start' ? [l.x, l.x + w] : l.anchor === 'end' ? [l.x - w, l.x] : [l.x - w / 2, l.x + w / 2];
};
/* two labels collide when their extents cross AND they sit within a text height */
const collide = (a, b) => {
  const [a0, a1] = span(a), [b0, b1] = span(b);
  return a0 < b1 && b0 < a1 && Math.abs(a.y - b.y) < 11;
};
const pts = vals => vals.map((w, i) => ({ d: iso(vals.length - i), w }));
const noCollisions = labels => {
  for (let i = 0; i < labels.length; i++)
    for (let j = i + 1; j < labels.length; j++)
      assert.ok(!collide(labels[i], labels[j]), `labels ${labels[i].text} and ${labels[j].text} overlap`);
};

describe('line chart value labels', () => {
  test('ten near-flat sessions: neighbours never overlap, the newest keeps its label', () => {
    const app = makeApp();
    const svg = app.lineChartSVG(pts([7250, 7260, 7280, 7270, 7290, 7320, 7310, 7290, 7300, 7301]), 'kg', 'kg', 0);
    const labels = valueLabels(svg);
    assert.ok(labels.some(l => l.text === '7301'), 'the newest session is labelled');
    noCollisions(labels);
  });
  test('a flat ten-point line keeps both ends and thins the middle', () => {
    const app = makeApp();
    const labels = valueLabels(app.lineChartSVG(pts(Array(10).fill(12500)), 'kg', 'kg', 0));
    assert.equal(labels[0].anchor, 'start');
    assert.equal(labels[labels.length - 1].anchor, 'end');
    assert.ok(labels.length >= 3 && labels.length < 10, `thinned to ${labels.length} labels`);
    noCollisions(labels);
  });
  test('five spread points keep every label', () => {
    const app = makeApp();
    const labels = valueLabels(app.lineChartSVG(pts([100, 110, 120, 130, 140]), 'kg', 'kg', 0));
    assert.deepEqual(labels.map(l => l.text), ['100', '110', '120', '130', '140']);
    noCollisions(labels);
  });
});
