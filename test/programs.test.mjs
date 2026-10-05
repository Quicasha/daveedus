/* Several programs: what crosses the line between one program and the next,
   and what must not. The rule pinned here: the CHANGE readers - the trend
   arrow, the goal date, the stall watch and the deload advisor's performance
   check - compare a lift only inside the program it is trained in now, because
   a new program brings new rep ranges, order and fatigue and its first session
   is not a verdict on the last one. LEVEL readers - where the lift is now, the
   wave base, max-test suggestions, records - keep every program. A program's
   own statistics never borrow another program's sessions by name, and a
   deload never waits on workouts that went to the archive.
   Born from a real case: a lifter archived Upper / Lower, started a new
   program, had a quieter first session, and the advisor called the bench
   "stalled" by lining that session up against the old program. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, set, exEntry, workout } from './harness.mjs';

/* two programs, each with one upper workout that benches */
const twoPrograms = () => {
  const app = makeApp();
  app.S.folders = [
    { id: 'fOld', name: 'Upper / Lower', open: true, pinned: true },
    { id: 'fNew', name: 'Pre-Military', open: true, pinned: true }
  ];
  app.S.templates = [
    { id: 'tOld', name: 'Upper A', folderId: 'fOld', ex: [{ k: 'bench-press', s: 4, r: '4-6' }] },
    { id: 'tNew', name: 'Upper 1', folderId: 'fNew', ex: [{ k: 'bench-press', s: 4, r: '4-6' }] }
  ];
  app.S.mainFolder = 'fNew';
  app.S.trackedLifts = ['bench-press'];
  app.S.deloads = []; app.S.dlEvery = 0; app.S.dlaSnooze = 0;
  app.S.history = [];
  return app;
};
/* one bench session, `daysAgo` back, in workout `tplId`: four sets of w x r */
const bench = (daysAgo, w, r, tplId, name) =>
  workout(daysAgo, [exEntry('bench-press', [set(w, r), set(w, r), set(w, r), set(w, r)])], { tplId, name: name || 'T' });
const setHistory = (app, sessions) => {
  app.S.history = sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
};
/* seven weekly Upper A sessions: climbing, then four weeks level at 110 x 5 */
const oldBlock = () => [49, 42, 35, 28, 21, 14, 7].map((d, i) => bench(d, [100, 105, 110, 110, 110, 110, 110][i], 5, 'tOld'));

describe('the deload advisor', () => {
  test("a new program's first session is not lined up against the old program", () => {
    const app = twoPrograms();
    setHistory(app, [...oldBlock(), bench(1, 105, 6, 'tNew')]);
    assert.equal(app.dlAdvice(), null, 'no "stalled" verdict from one session in a new program');
  });
  test('inside one program the same plateau still speaks', () => {
    const app = twoPrograms();
    setHistory(app, [...oldBlock(), bench(1, 105, 6, 'tOld')]);
    const adv = app.dlAdvice();
    assert.ok(adv, 'seven weeks and a flat bench in the same program');
    assert.equal(adv.why, app.T.dlaFlat);
  });
  test('the calendar backstop still counts every week of training, whatever the program', () => {
    const app = twoPrograms();
    const old = [63, 56, 49, 42, 35, 28, 21, 14, 7].map(d => bench(d, 100, 5, 'tOld'));
    setHistory(app, [...old, bench(1, 100, 5, 'tNew')]);
    const adv = app.dlAdvice();
    assert.ok(adv && adv.why === app.T.dlaTime, 'nine weeks without a deload is nine weeks');
  });
});

describe('the stall watch', () => {
  test('it starts over with the new program and speaks again once that one stalls', () => {
    const app = twoPrograms();
    const old = [70, 63, 56, 49, 42, 35, 28, 21].map((d, i) => bench(d, [100, 105, 110, 110, 110, 110, 110, 110][i], 5, 'tOld'));
    setHistory(app, old.slice());
    assert.ok(app.stallInfo('bench-press'), 'stalled inside the old program');
    setHistory(app, [...old, bench(14, 110, 5, 'tNew')]);
    assert.equal(app.stallInfo('bench-press'), null, 'one session into the new program');
    setHistory(app, [...old, ...[14, 12, 10, 8].map(d => bench(d, 110, 5, 'tNew'))]);
    assert.equal(app.trendFor('bench-press'), 'flat', 'four sessions are enough for a direction');
    assert.equal(app.stallInfo('bench-press'), null, 'but a new program gets six before it can be called stalled');
    setHistory(app, [...old, ...[14, 12, 10, 8, 6, 4].map(d => bench(d, 110, 5, 'tNew'))]);
    assert.ok(app.stallInfo('bench-press'), 'six level sessions in the new program');
  });
});

describe('the trend arrow', () => {
  test('a rep-range switch in the new program does not read as a fall', () => {
    const app = twoPrograms();
    const old = [70, 63, 56, 49, 42, 35].map((d, i) => bench(d, [100, 102.5, 105, 107.5, 110, 112.5][i], 5, 'tOld'));
    /* the new program benches for 8s: a lower estimate, level from day one */
    const fresh = [21, 14, 7, 1].map(d => bench(d, 95, 8, 'tNew'));
    setHistory(app, [...old, ...fresh]);
    assert.equal(app.trendFor('bench-press'), 'flat');
    setHistory(app, [...old, ...fresh.slice(1)]);
    assert.equal(app.trendFor('bench-press'), null, 'three sessions are too few for a direction');
  });
  test('without programs every workout is one block', () => {
    const app = twoPrograms();
    app.S.folders = [];
    app.S.templates.forEach(tp => { tp.folderId = null; });
    /* alternating two loose workouts: three sessions each, six together */
    setHistory(app, [42, 35, 28, 21, 14, 7].map((d, i) => bench(d, 100 + i * 2.5, 5, i % 2 ? 'tOld' : 'tNew')));
    assert.equal(app.trendFor('bench-press'), 'up');
  });
  test('a session outside any workout does not hide the rest', () => {
    const app = twoPrograms();
    setHistory(app, [...[42, 35, 28, 21, 14].map((d, i) => bench(d, 100 + i * 2.5, 5, 'tOld')), bench(7, 112.5, 5, null)]);
    assert.equal(app.trendFor('bench-press'), 'up');
  });
});

describe('where the lift is now', () => {
  test('keeps every program: strength does not reset with a new plan', () => {
    const app = twoPrograms();
    setHistory(app, [bench(20, 120, 3, 'tOld'), bench(2, 100, 5, 'tNew')]);
    assert.equal(Math.round(app.currentE1rm('bench-press') * 10) / 10, 132, '120 x 3 from the old program');
  });
});

describe("a program's own numbers", () => {
  test('a workout with the same name in another program is not borrowed', () => {
    const app = twoPrograms();
    app.S.templates.find(tp => tp.id === 'tNew').name = 'Upper A';
    setHistory(app, [bench(30, 100, 5, 'tOld', 'Upper A'), bench(23, 100, 5, 'tOld', 'Upper A'), bench(2, 100, 5, 'tNew', 'Upper A')]);
    assert.equal(app.folderProgStats('fNew').n, 1);
    assert.equal(app.folderProgStats('fOld').n, 2);
    assert.equal(app.tplSessions('tNew').length, 1);
  });
  test('a session whose workout was deleted still finds its namesake', () => {
    const app = twoPrograms();
    setHistory(app, [bench(9, 100, 5, 'gone', 'Upper A'), bench(2, 100, 5, 'tOld', 'Upper A')]);
    assert.equal(app.tplSessions('tOld').length, 2);
    assert.equal(app.folderProgStats('fOld').n, 2);
  });
});

describe('a deload and the archive', () => {
  test('archiving the program a deload still waits on ends it, and Undo brings it back', () => {
    const app = twoPrograms();
    app.undoToast = (msg, restore) => { app.__undo = restore; };
    setHistory(app, [bench(3, 100, 5, 'tOld')]);
    app.S.deloads = [{ s: Date.now() - 864e5, e: 0, tpls: ['tOld'], done: [], pct: 0.6, vol: 1 }];
    assert.ok(app.dlActive(), 'running, Upper A still due');
    app.archiveFolder('fOld');
    assert.equal(app.dlActive(), null, 'nothing left to do in programs still in use');
    app.__undo();
    assert.ok(app.dlActive(), 'Undo reopens the deload the archive closed');
    assert.deepEqual([...app.dlRemaining(app.dlActive())], ['tOld']);
  });
});
