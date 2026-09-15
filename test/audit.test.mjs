/* Session bookkeeping and data hygiene: the bugs the v2.25 audit found, each
   pinned by the exact sequence that used to go wrong. The training brain
   itself lives in brain.test.mjs. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, fakeGitHub, iso, set, exEntry, workout } from './harness.mjs';

const plain = v => JSON.parse(JSON.stringify(v));

/* the finish summary renders icons from ui.js and the PR check reads the
   record table from exercises-ui.js - neither screen file is loaded here, so
   the two names resolve to the smallest stand-ins that let a finish complete */
const finishable = app => {
  app.ACT_ICONS = new Proxy({}, { get: () => '' });
  app.confirm = () => true;
  if (typeof app.exStats !== 'function') app.exStats = () => ({ best: 0, bestTime: 0 });
  return app;
};
const ladderSlot = app => {
  for (const tp of app.S.templates){
    const e = tp.ex.find(x => Array.isArray(x.lvls) && x.lvls.length > 1);
    if (e) return { tpl: tp, slot: e };
  }
  throw new Error('the seeded programs must carry at least one ladder');
};

describe('finish, continue, finish', () => {
  test('a resumed session is judged once - the ladder streak rolls back with it', () => {
    const app = finishable(makeApp());
    const { tpl, slot } = ladderSlot(app);
    const lvl0 = slot.lvl || 0;
    app.startWorkout(tpl.id);
    const ex = app.S.active.exercises.find(e => e.teId === slot.id);
    const top = app.repsParse(ex.targetReps).hi;
    ex.sets.forEach(s => { s.done = true; s.w = '0'; s.r = String(top); });
    app.finishWorkout();
    assert.equal(slot.lvlN, 1, 'one clean session, one streak point');
    assert.equal(slot.lvl, lvl0);
    assert.equal(app.S.lastActive.lvls.length, 1, 'the ladder is snapshotted for Continue');
    app.continueWorkout();
    assert.equal(slot.lvlN, 0, 'Continue undoes the streak point');
    assert.equal(app.S.history.length, 0);
    app.finishWorkout();
    assert.equal(slot.lvlN, 1, 'finishing again counts the same session once, not twice');
    assert.equal(slot.lvl, lvl0, 'no level-up off a single real session');
  });

  test('a clean session at the last streak point levels up, and Continue puts the rung back', () => {
    const app = finishable(makeApp());
    const { tpl, slot } = ladderSlot(app);
    slot.lvlN = 1;                                     /* one clean session already banked */
    const k0 = slot.k, lvl0 = slot.lvl || 0;
    app.startWorkout(tpl.id);
    const ex = app.S.active.exercises.find(e => e.teId === slot.id);
    const top = app.repsParse(ex.targetReps).hi;
    ex.sets.forEach(s => { s.done = true; s.w = '0'; s.r = String(top); });
    app.finishWorkout();
    assert.equal(slot.lvl, lvl0 + 1);
    assert.notEqual(slot.k, k0);
    app.continueWorkout();
    assert.equal(slot.lvl, lvl0, 'the rung is restored');
    assert.equal(slot.k, k0, 'and so is the mirrored movement');
    assert.equal(slot.lvlN, 1, 'and the streak it had before');
  });
});

describe('deload pass', () => {
  test('half sets are the pass\'s plan, never the template\'s', () => {
    const app = makeApp();
    const tpl = app.S.templates[0];
    app.S.deloads.push({ s: Date.now(), e: 0, tpls: [tpl.id], done: [], pct: 0.6, vol: 0.5 });
    const s0 = tpl.ex[0].s, r0 = tpl.ex[0].r;
    app.startWorkout(tpl.id);
    const ex = app.S.active.exercises[0];
    assert.equal(ex.targetSets, Math.ceil(s0 * 0.5), 'the session plans half the sets');
    app.wtSets(0, 1);                                  /* the lifter adds one set today */
    assert.equal(ex.targetSets, Math.ceil(s0 * 0.5) + 1);
    assert.equal(tpl.ex[0].s, s0, 'the template keeps its full set count');
    app.wtReps(0, 'hi', 1);
    assert.notEqual(tpl.ex[0].r, r0, 'rep-range edits still reach the template');
  });
  test('Continue reopens a deload record only while it is still the newest', () => {
    const app = finishable(makeApp());
    const tpl = app.S.templates[0];
    app.S.deloads.push({ s: 1000, e: 0, tpls: [tpl.id], done: [], pct: 0.6, vol: 1 });
    app.startWorkout(tpl.id);
    app.S.active.exercises[0].sets[0].done = true;
    app.S.active.exercises[0].sets[0].w = '50';
    app.S.active.exercises[0].sets[0].r = '5';
    app.finishWorkout();
    assert.ok(app.S.deloads[0].e > 0, 'the only workout got its pass - the cycle closed');
    /* a new cycle starts before the lifter taps Continue */
    app.S.deloads.push({ s: Date.now(), e: 0, tpls: [tpl.id], done: [], pct: 0.6, vol: 1 });
    app.continueWorkout();
    assert.ok(app.S.deloads[0].e > 0, 'the older record stays closed');
    assert.deepEqual(plain(app.S.deloads[0].done), [], 'but its pass is handed back');
  });
});

describe('hydrate hardening', () => {
  test('plates must be positive numbers, and an emptied list falls back to the default set', () => {
    const app = makeApp();
    const s = app.hydrate({ plates: { kg: [0, 20, -5, 'x', 250], lb: [] } });
    assert.deepEqual(plain(s.plates.kg), [20]);
    assert.deepEqual(plain(s.plates.lb), [45, 35, 25, 10, 5, 2.5]);
  });
  test('a history entry without a real date is dropped; a nameless one is kept', () => {
    const app = makeApp();
    const s = app.hydrate({ history: [
      { exercises: [], date: 'not a date' },
      { exercises: [] },
      { exercises: [{ sets: [] }], date: iso(1), name: 7 }
    ] });
    assert.equal(s.history.length, 1);
    assert.equal(s.history[0].name, '');
    assert.equal(s.history[0].exercises[0].k, '', 'a keyless exercise is repaired, not rejected');
  });
  test('body weights, template names and slots are validated before render can read them', () => {
    const app = makeApp();
    const s = app.hydrate({
      weights: [{ kg: 'x' }, null, { kg: 80, date: iso(0) }],
      templates: [{ ex: [null, { k: 'bench-press' }, { s: 3 }] }],
      lastActive: { id: 'x', act: { exercises: [{ k: 'bench-press' }] } }
    });
    assert.equal(s.weights.length, 1);
    assert.equal(s.templates[0].name, '');
    assert.equal(s.templates[0].ex.length, 1);
    assert.equal(s.lastActive, null, 'a resume snapshot with set-less exercises is unusable');
  });
});

describe('calendar arithmetic', () => {
  test('weekly buckets start on a local-midnight Monday and span seven calendar days', () => {
    const app = makeApp();
    /* 60 weeks crosses at least one DST change in any zone that has them;
       fixed 7*24h spans used to leave a bucket starting on Sunday 23:00 */
    for (const w of app.weeklyMuscleSets(60)){
      const s = new Date(w.s), e = new Date(w.e);
      assert.equal(s.getDay(), 1); assert.equal(s.getHours(), 0);
      assert.equal(e.getDay(), 1); assert.equal(e.getHours(), 0);
      assert.equal(e.getDate(), new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7).getDate());
    }
  });
  test('a chart range defaults to the device\'s own calendar date', () => {
    const app = makeApp();
    assert.equal(app.localYmd(new Date(2026, 0, 5, 0, 30)), '2026-01-05');
    assert.equal(app.localYmd(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
  });
});

describe('one scale for total load', () => {
  test('the CSV total counts body weight AND machine base, exactly like the app', () => {
    const app = makeApp();
    app.S.history = [workout(1, [exEntry('pull-up', [set(10, 8)], { bw: 70, mb: 5 })])];
    const lines = app.buildSetsCSV().split('\r\n');
    const head = lines[0].split(',');
    const row = lines[1].split(',');
    assert.equal(parseFloat(row[head.indexOf('total_kg')]), 85);
    assert.equal(parseFloat(row[head.indexOf('volume_kg')]), app.woVolume(app.S.history[0].exercises));
  });
  test('an imported machine base lands on machines only', () => {
    const app = makeApp();
    const tpl = app.importTplPayload({ name: 'x', ex: [
      { k: 'pull-up', s: 3, r: '8', base: 20 },
      { k: 'plank', s: 3, r: '60', base: 20 },
      { k: 'leg-press', s: 3, r: '8', base: 20 }
    ] }, null);
    assert.equal(tpl.ex[0].base, undefined);
    assert.equal(tpl.ex[1].base, undefined);
    assert.equal(tpl.ex[2].base, 20);
  });
});

describe('session bookkeeping', () => {
  test('a same-lift addition for today never edits the template slot', () => {
    const app = makeApp();
    const tpl = app.S.templates[0];
    app.startWorkout(tpl.id);
    const k = tpl.ex[0].k, note0 = tpl.ex[0].pnote;
    app.S.active.exercises.push({ id: 'dup', k, baseK: k, name: k, adhoc: true, sets: [], alts: [], targetSets: 3, targetReps: '8' });
    const xi = app.S.active.exercises.length - 1;
    assert.equal(app.tplEntryFor(app.S.active.exercises[xi]), null);
    assert.ok(app.tplEntryFor(app.S.active.exercises[0]), 'the planned slot still resolves');
    app.setPnote(xi, 'today only');
    app.toggleX2(xi);
    assert.equal(tpl.ex[0].pnote, note0);
    assert.equal(tpl.ex[0].x2, undefined);
  });
  test('a superset never links to a ghost suggestion', () => {
    const app = makeApp();
    const tpl = app.S.templates[0];
    app.startWorkout(tpl.id);
    app.S.active.exercises.push({ id: 'g', k: 'db-curl', name: 'x', ghost: true, sets: [], alts: [] });
    const last = app.S.active.exercises.length - 2;
    app.toggleWoSS(last);
    assert.equal(!!app.S.active.exercises[last].ss, false);
  });
  test('undoing a removal puts the rest clock back on the exercise it belonged to', () => {
    const app = makeApp();
    const tpl = app.S.templates[0];
    app.startWorkout(tpl.id);
    const n = app.S.active.exercises.length;
    app.S.active.rest = { key: '3-0', start: Date.now(), tgt: 90 };
    let undo = null;
    app.undoToast = (m, fn) => { undo = fn; };
    app.removeWorkoutEx(1);
    assert.equal(app.S.active.rest.key, '2-0', 'the clock follows its exercise up one slot');
    undo();
    assert.equal(app.S.active.exercises.length, n);
    assert.equal(app.S.active.rest.key, '3-0', 'and back down when the exercise returns');
  });
});

describe('cloud follows every edit', () => {
  const dirtyAfter = (app, fn) => { app.S.ghDirty = 0; fn(); const d = app.S.ghDirty; app.__stopTimers(); return d; };
  test('deleting, archiving and editing history marks the snapshot dirty', () => {
    const app = makeApp();
    fakeGitHub(app);
    app.S.history = [workout(1, [exEntry('bench-press', [set(100, 5), set(100, 5)])])];
    const id = app.S.history[0].id;
    assert.equal(dirtyAfter(app, () => app.toggleArch(id)), 1);
    assert.equal(dirtyAfter(app, () => app.editHistSet(id, 0, 0, 'reps', '6')), 1);
    assert.equal(dirtyAfter(app, () => app.delHistSet(id, 0, 1)), 1);
    assert.equal(dirtyAfter(app, () => app.delHist(id)), 1);
  });
  test('program edits and tracked lifts mark it too', () => {
    const app = makeApp();
    fakeGitHub(app);
    const { tpl, slot } = ladderSlot(app);
    const i = tpl.ex.indexOf(slot);
    assert.equal(dirtyAfter(app, () => app.setTplLvl(tpl.id, i, 1)), 1);
    assert.equal(dirtyAfter(app, () => app.trackRemove('bench-press')), 1);
    assert.equal(dirtyAfter(app, () => app.delTplEx(tpl.id, i)), 1);
    assert.equal(dirtyAfter(app, () => app.delTpl(tpl.id)), 1);
  });
});
