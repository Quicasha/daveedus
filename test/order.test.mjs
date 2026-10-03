/* Program order: the lifter puts programs in the order they want and Home
   lists its program cards in exactly that order. The rules pinned here: a
   move swaps a program with its neighbour among the programs in use
   (archived ones keep their place), the ends do not move past the edge, and
   reordering never moves the main-program star. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { makeApp } from './harness.mjs';

/* screens render icons from ui.js (not loaded by the harness): each icon
   becomes its own name in brackets, so a test can see which buttons drew */
const withScreens = app => {
  app.ACT_ICONS = new Proxy({}, { get: (_, k) => `[${String(k)}]` });
  vm.runInContext(fs.readFileSync(new URL('../js/home.js', import.meta.url), 'utf8'), app, { filename: 'js/home.js' });
  return app;
};
/* the seeded Upper / Lower (A) and Abs (free), plus a rotation program PPL (B) */
const threePrograms = () => {
  const app = withScreens(makeApp());
  const A = app.S.folders.find(f => !f.free), Abs = app.S.folders.find(f => f.free);
  app.S.folders.push({ id: 'fB', name: 'PPL', open: true, pinned: true });
  app.S.templates.push({ id: 'tB', name: 'Push Day', folderId: 'fB', ex: [{ k: 'bench-press', s: 3, r: '5' }] });
  return { app, A, Abs, B: app.S.folders.find(f => f.id === 'fB') };
};
/* spread into this realm: arrays built inside the vm carry its prototypes */
const ids = app => [...app.S.folders.map(f => f.id)];

describe('moving a program', () => {
  test('Home lists the program cards in the new order', () => {
    const { app, A, Abs, B } = threePrograms();
    app.moveFolder(B.id, -1);
    app.moveFolder(B.id, -1);
    assert.deepEqual(ids(app), [B.id, A.id, Abs.id]);
    const home = app.htmlHome();
    assert.ok(home.indexOf(B.name) < home.indexOf(A.name), 'PPL now comes first on Home');
  });
  test('the star stays on the main program, wherever it moves', () => {
    const { app, A, B } = threePrograms();
    assert.equal(app.mainFolderId(), A.id);
    app.moveFolder(B.id, -1);
    app.moveFolder(B.id, -1);
    assert.equal(app.mainFolderId(), A.id, 'putting PPL first does not make it the main program');
    app.moveFolder(A.id, 1);
    assert.equal(app.mainFolderId(), A.id);
  });
  test('archived programs keep their place; a move skips over them', () => {
    const { app, A, Abs, B } = threePrograms();
    app.archiveFolder(Abs.id);
    app.moveFolder(B.id, -1);
    assert.deepEqual(ids(app), [B.id, Abs.id, A.id]);
  });
  test('the first cannot go up and the last cannot go down', () => {
    const { app, A, B } = threePrograms();
    const before = ids(app);
    app.moveFolder(A.id, -1);
    app.moveFolder(B.id, 1);
    assert.deepEqual(ids(app), before);
  });
});

describe('the reorder screen', () => {
  test('only the programs in use, each with up and down, and nothing else to tap', () => {
    const { app, A, Abs, B } = threePrograms();
    app.archiveFolder(Abs.id);
    app.V.progOrder = true;
    const h = app.htmlProgram();
    assert.ok(h.includes(app.T.orderHint));
    assert.ok(h.includes(`moveFolder('${A.id}',1)`) && h.includes(`moveFolder('${B.id}',-1)`));
    assert.match(h, new RegExp(`disabled onclick="moveFolder\\('${A.id}',-1\\)"`), 'the first has no way up');
    assert.match(h, new RegExp(`disabled onclick="moveFolder\\('${B.id}',1\\)"`), 'the last has no way down');
    assert.ok(!h.includes(Abs.name), 'archived programs are not in the way');
    for (const fn of ['archiveFolder(', 'delFolder(', 'togglePin(', 'openSplit(', 'Archive ('])
      assert.ok(!h.includes(fn), `no ${fn} while reordering`);
    assert.ok(h.includes('setProgOrder(0)'), 'a Done button ends it');
  });
  test('the program just moved is the highlighted one', () => {
    const { app, B } = threePrograms();
    app.V.progOrder = true;
    app.moveFolder(B.id, -1);
    assert.match(app.htmlProgram(), /class="tplbtn ordrow next"[^>]*>\s*<div class="tinfo"><div class="tname">PPL</);
  });
  test('Done goes back to the normal list', () => {
    const { app } = threePrograms();
    app.setProgOrder(1);
    assert.equal(app.V.progOrder, true);
    app.setProgOrder(0);
    assert.equal(app.V.progOrder, false);
    assert.ok(app.htmlProgram().includes('archiveFolder('));
  });
});
