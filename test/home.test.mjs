/* Home split cards: a row says each thing once. The row planned for today
   carries the TODAY chip, so its weekday tag (MO, TU...) would only repeat it -
   and on a phone the repeat squeezed the workout's own name down to "Lo...". */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { makeApp } from './harness.mjs';

const withHome = app => {
  app.ACT_ICONS = new Proxy({}, { get: (_, k) => `[${String(k)}]` });
  vm.runInContext(fs.readFileSync(new URL('../js/home.js', import.meta.url), 'utf8'), app, { filename: 'js/home.js' });
  return app;
};
/* the seeded Upper / Lower with a weekday on every workout, today's among them */
const planned = () => {
  const app = withHome(makeApp());
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const tpls = app.S.templates.filter(tp => tp.folderId === app.mainFolderId());
  tpls.forEach((tp, i) => { tp.wd = ((today - 1 + i) % 7) + 1; });
  return { app, today, todayTpl: tpls[0], other: tpls[1] };
};
/* the html of one workout's row on Home */
const rowOf = (html, name) => {
  const i = html.indexOf(`<span class="spn">${name}</span>`);
  return html.slice(i, html.indexOf('</button>', i));
};

describe('the weekday plan on Home', () => {
  test("today's row shows TODAY and not its weekday again", () => {
    const { app, today, todayTpl } = planned();
    const row = rowOf(app.htmlHome(), todayTpl.name);
    assert.ok(row.includes(app.T.todayBadge));
    assert.ok(!row.includes(app.T['wd' + today]), 'the weekday tag is left out');
  });
  test('every other planned row keeps its weekday', () => {
    const { app, other } = planned();
    assert.ok(rowOf(app.htmlHome(), other.name).includes(app.T['wd' + other.wd]));
  });
});
