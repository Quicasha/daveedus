/* Max tests: a one-rep max attempted inside a workout. The rules pinned here:
   a max test is a MEASUREMENT - it counts for records (even on a deload pass)
   and never for training (trends, ghosts, waves, progression); a missed
   attempt is kept and never becomes a record; the suggested attempts come
   from what the lift shows now. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, iso, set, exEntry, workout } from './harness.mjs';

const plain = v => JSON.parse(JSON.stringify(v));
const finishable = app => {
  app.ACT_ICONS = new Proxy({}, { get: () => '' });
  app.confirm = () => true;
  app.__summary = null;
  app.showSummary = (...a) => { app.__summary = a; };
  return app;
};
const benchTpl = app => app.S.templates.find(tp => tp.ex[0] && tp.ex[0].k === 'bench-press');
/* three bench sessions of 120 x 5: est. 1RM 140 kg */
const benchHistory = (app, tpl) => [5, 10, 15].map(d =>
  workout(d, [exEntry('bench-press', [set(120, 5), set(120, 5)], { name: 'Bench Press' })], { tplId: tpl.id, name: tpl.name }));
const maxIdx = app => app.S.active.exercises.findIndex(e => e.max);
/* confirm every set that is next in line and already has its values */
const doWarmups = app => {
  for (;;){
    const xi = maxIdx(app), ex = app.S.active.exercises[xi];
    const si = ex.sets.findIndex(s => !s.done);
    if (si < 0 || !ex.sets[si].warm) return;
    app.toggleSet(xi, si);
  }
};
const attempt = (app, made, w) => {
  const xi = maxIdx(app), ex = app.S.active.exercises[xi];
  const si = ex.sets.findIndex(s => !s.done);
  if (w != null) ex.sets[si].w = String(w);
  app.markAttempt(xi, si, made);
  return ex.sets[si];
};

describe('one formula for a single', () => {
  test('a single IS its one-rep max - Epley only applies from two reps up', () => {
    const app = makeApp();
    assert.equal(app.e1rmOf(100, 1), 100);
    assert.equal(Math.round(app.e1rmOf(100, 5) * 100) / 100, 116.67);
    app.S.history = [workout(1, [exEntry('bench-press', [set(150, 1)])])];
    assert.equal(app.e1rmSeries('bench-press')[0].v, 150, 'a heavy training single is not inflated by 3%');
  });
});

describe('suggested attempts', () => {
  test('opener near 92%, a read near 97%, and a third that is a new best', () => {
    const app = makeApp();
    const tpl = benchTpl(app);
    app.S.history = benchHistory(app, tpl);
    app.startWorkout(tpl.id);
    app.addMaxCard(0);
    assert.deepEqual(plain(app.maxPlan(app.S.active.exercises[0])), [130, 135, 142.5]);
  });
  test('the third attempt is always one plate step above the estimate', () => {
    const app = makeApp();
    app.S.history = [3, 6, 9].map(d => workout(d, [exEntry('bench-press', [set(100, 1)])]));
    app.openMaxTest('bench-press');
    const plan = app.maxPlan(app.S.active.exercises[0]);
    assert.ok(plan[2] > 100, `third attempt ${plan[2]} must beat the 100 kg estimate`);
    assert.ok(plan[0] < plan[1] && plan[1] < plan[2]);
  });
  test('bodyweight lifts suggest the ADDED load', () => {
    const app = makeApp();
    app.S.history = [3, 6, 9].map(d => workout(d, [exEntry('pull-up', [set(20, 5)], { bw: 80 })]));
    app.S.weights = [{ id: 'w', date: iso(0), kg: 80 }];
    app.openMaxTest('pull-up');
    assert.deepEqual(plain(app.maxPlan(app.S.active.exercises[0])), [27.5, 32.5, 37.5]);
  });
  test('no estimate, no suggestion - the lifter types the weights', () => {
    const app = makeApp();
    app.S.history = [workout(3, [exEntry('bench-press', [set(100, 5)])])];
    app.openMaxTest('bench-press');
    assert.deepEqual(plain(app.maxPlan(app.S.active.exercises[0])), []);
  });
});

describe('where a max test starts', () => {
  test('from a workout card it sits right above that lift', () => {
    const app = makeApp();
    const tpl = benchTpl(app);
    app.startWorkout(tpl.id);
    const n = app.S.active.exercises.length;
    app.S.active.rest = { key: '2-0', at: Date.now() };
    app.addMaxCard(1);
    const exs = app.S.active.exercises;
    assert.equal(exs.length, n + 1);
    assert.equal(exs[1].max, true);
    assert.equal(exs[1].k, exs[2].k, 'same lift, directly above it');
    assert.equal(app.S.active.rest.key, '3-0', 'a running rest clock follows its exercise down');
    app.addMaxCard(2);
    assert.equal(app.S.active.exercises.length, n + 1, 'one max test per lift per session');
  });
  test('never splits a superset: it goes above the whole linked group', () => {
    const app = makeApp();
    const tpl = benchTpl(app);
    app.startWorkout(tpl.id);
    app.S.active.exercises[0].ss = true;               /* bench linked to the row */
    app.addMaxCard(1);
    assert.equal(app.S.active.exercises[0].max, true);
    assert.equal(!!app.S.active.exercises[0].ss, false);
    assert.equal(app.S.active.exercises[1].ss, true, 'the pair stays linked');
  });
  test('from the exercise screen with no workout running it opens a session of its own', () => {
    const app = makeApp();
    app.openMaxTest('back-squat');
    assert.equal(app.S.active.tplId, null);
    assert.equal(app.S.active.dl, 0);
    assert.equal(app.S.active.name, 'Max test');
    assert.equal(app.S.active.exercises.length, 1);
    assert.equal(app.S.active.exercises[0].max, true);
    assert.equal(app.S.active.exercises[0].rt, 240, 'full rest between attempts');
  });
  test('from the exercise screen during a workout it joins that workout', () => {
    const app = makeApp();
    const tpl = benchTpl(app);
    app.startWorkout(tpl.id);
    const n = app.S.active.exercises.length;
    app.openMaxTest('bench-press');
    assert.equal(app.S.active.exercises[0].max, true, 'above the bench card');
    app.openMaxTest('deadlift');
    assert.equal(app.S.active.exercises.length, n + 2);
    assert.equal(app.S.active.exercises[n + 1].k, 'deadlift', 'a lift not in the workout goes to the end');
  });
});

describe('a max test on the deload day', () => {
  const run = () => {
    const app = finishable(makeApp());
    const tpl = benchTpl(app);
    app.S.history = benchHistory(app, tpl);
    app.S.deloads.push({ s: Date.now(), e: 0, tpls: [tpl.id], done: [], pct: 0.6, vol: 1 });
    app.startWorkout(tpl.id);
    app.addMaxCard(0);
    app.autoWarmup(0);
    return { app, tpl };
  };
  test('the warm-up climbs to the opener at full weight, not the deload weight', () => {
    const { app } = run();
    const warm = app.S.active.exercises[0].sets.filter(s => s.warm).map(s => +s.w);
    assert.ok(warm.length >= 3);
    assert.ok(Math.max(...warm) >= 100 && Math.max(...warm) <= 130 * 0.9);
  });
  test('attempts log as made or missed, time-stamped, with no win/loss colour', () => {
    const { app } = run();
    doWarmups(app);
    const a1 = attempt(app, true);
    assert.equal(a1.w, '130'); assert.equal(a1.r, '1'); assert.equal(a1.cls, 'none');
    assert.ok(a1.at > 0);
    const a3 = (attempt(app, true), attempt(app, false));
    assert.equal(a3.w, '142.5'); assert.equal(a3.r, '0'); assert.equal(a3.fail, true);
    assert.equal(app.S.active.rest.tgt, 240);
  });
  test('tapping the lit button again takes the latest attempt back', () => {
    const { app } = run();
    doWarmups(app);
    const a1 = attempt(app, false, 150);
    const xi = maxIdx(app), si = app.S.active.exercises[xi].sets.indexOf(a1);
    app.markAttempt(xi, si, true);
    assert.equal(a1.done, true, 'the other button switches a miss to made');
    assert.equal(a1.r, '1'); assert.equal(a1.fail, false);
    app.markAttempt(xi, si, true);
    assert.equal(a1.done, false); assert.equal(a1.fail, false); assert.equal(a1.r, ''); assert.equal(a1.at, undefined);
  });
  test('finished: a deload session, and the attempts still count as records', () => {
    const { app, tpl } = run();
    doWarmups(app);
    attempt(app, true); attempt(app, true); attempt(app, false);
    app.finishWorkout();
    const h = app.S.history[0];
    assert.equal(h.dl, 1, 'the deload pass is still a deload pass');
    assert.ok(app.S.deloads[0].done.includes(tpl.id) || app.S.deloads[0].e > 0);
    const e = h.exercises.find(x => x.max);
    assert.equal(e.max, 1);
    const att = e.sets.filter(s => !s.warm);
    assert.deepEqual(plain(att.map(s => [s.weight, s.reps, s.fail])), [[130, 1, false], [135, 1, false], [142.5, 0, true]]);
    assert.ok(att.every(s => s.at > 0));
    assert.ok(e.sets.filter(s => s.warm).every(s => s.at === undefined), 'warm-ups carry no attempt time');
    const st = app.exStats('bench-press', 'Bench Press');
    assert.equal(st.best, 135, 'the made single is the best lift ever; the miss is not');
    assert.equal(st.e1rm, 140, 'the training estimate still leads until a test beats it');
    assert.deepEqual(plain(app.repMaxRows('bench-press', 'bench press').find(r => r.r === 1)).w, 135);
    const pr = app.prEvents()[0];
    assert.equal(pr.r, 1); assert.equal(pr.w, 135);
    assert.equal(app.__summary[3][0].txt.startsWith('135'), true, 'the finish screen names the new record');
  });
  test('the test is a measurement: trend, fatigue check and ghosts ignore it', () => {
    const { app } = run();
    doWarmups(app);
    attempt(app, true); attempt(app, false);
    app.finishWorkout();
    assert.equal(app.e1rmSeries('bench-press').length, 3, 'only the three training sessions');
    const t = app.maxTests('bench-press');
    assert.equal(t.length, 1);
    assert.equal(t[0].best, 130);
    assert.deepEqual(plain(t[0].attempts.map(a => [a.w, a.made])), [[130, true], [135, false]]);
  });
});

describe('a max test inside a normal workout', () => {
  test('next session ghosts the training sets, never the single, and brings no max card back', () => {
    const app = finishable(makeApp());
    const tpl = benchTpl(app);
    app.startWorkout(tpl.id);
    const b = app.S.active.exercises[0];
    b.sets.forEach(s => { s.w = '100'; s.r = '5'; });
    b.sets.forEach((s, si) => app.toggleSet(app.S.active.exercises.indexOf(b), si));
    app.openMaxTest('bench-press');
    attempt(app, true, 120);
    app.S.waves['bench-press'] = { base: 100, step: 2.5, idx: 1, startBest: 0, started: Date.now(), rounds: 0 };
    app.finishWorkout();
    assert.equal(app.S.waves['bench-press'].idx, 2, 'the training sets advance the wave once, the test does not add a second step');
    app.startWorkout(tpl.id);
    const nb = app.S.active.exercises.find(e => e.k === 'bench-press' && !e.max);
    assert.deepEqual(plain(nb.last.sets.map(s => s.reps)), [5, 5, 5, 5]);
    assert.equal(app.S.active.exercises.some(e => e.max), false);
    assert.equal(app.lastTopW('bench-press'), 100);
  });
  test('even when the test was logged BEFORE the training sets, ghosts and suggestions skip it', () => {
    const app = makeApp();
    const tpl = benchTpl(app);
    app.S.history = [workout(1, [
      exEntry('bench-press', [set(140, 1), set(145, 0)], { max: 1, adhoc: 1 }),
      exEntry('bench-press', [set(100, 5), set(100, 5)])
    ], { tplId: tpl.id, name: tpl.name })];
    app.startWorkout(tpl.id);
    const nb = app.S.active.exercises.find(e => e.k === 'bench-press');
    assert.deepEqual(plain(nb.last.sets.map(s => s.reps)), [5, 5]);
    assert.equal(app.S.active.exercises.some(e => e.ghost), false, 'no ghost card for the test');
    assert.equal(app.lastTopW('bench-press'), 100);
  });
  test('a max-only session never moves a wave', () => {
    const app = finishable(makeApp());
    app.S.waves['bench-press'] = { base: 100, step: 2.5, idx: 1, startBest: 0, started: Date.now(), rounds: 0 };
    app.openMaxTest('bench-press');
    attempt(app, true, 120);
    app.finishWorkout();
    assert.equal(app.S.waves['bench-press'].idx, 1);
  });
  test('unused attempts do not trigger the "unfinished sets" question', () => {
    const app = finishable(makeApp());
    let asked = 0;
    app.confirm = () => { asked++; return true; };
    app.openMaxTest('bench-press');
    attempt(app, true, 120);                            /* two planned attempts left untouched */
    app.finishWorkout();
    assert.equal(asked, 0);
    assert.equal(app.S.history[0].exercises[0].sets.length, 1);
  });
  test('a max card nobody touched is not remembered as a suggestion', () => {
    const app = finishable(makeApp());
    const tpl = benchTpl(app);
    app.startWorkout(tpl.id);
    app.addMaxCard(0);
    const b = app.S.active.exercises[1];
    b.sets[0].w = '100'; b.sets[0].r = '5';
    app.toggleSet(1, 0);
    app.finishWorkout();
    assert.equal((app.S.history[0].sug || []).length, 0);
  });
  test('an attempt with no weight and no suggestion is refused, and the row is left as it was', () => {
    const app = finishable(makeApp());
    app.openMaxTest('bench-press');
    const s = attempt(app, true);
    assert.equal(s.done, false); assert.equal(s.r, ''); assert.equal(s.fail, false);
  });
});

describe('a miss is kept, never counted', () => {
  const missed = () => workout(1, [exEntry('bench-press', [set(160, 0), set(150, 1)], { max: 1 })]);
  const fix = h => { h.exercises[0].sets[0].fail = true; h.exercises[0].sets[0].at = Date.now(); return h; };
  test('not a record, not a weekly set, not volume', () => {
    const app = makeApp();
    app.S.history = [fix(missed())];
    assert.equal(app.exStats('bench-press', 'Bench Press').best, 150);
    assert.equal(app.weeklyMuscleSets(1)[0].counts.chest, 1);
    assert.equal(app.woVolume(app.S.history[0].exercises), 150);
  });
  test('history shows it as a miss', () => {
    const app = makeApp();
    const s = fix(missed()).exercises[0].sets[0];
    const txt = app.fmtSet(s, 'bench-press', 0);
    assert.ok(txt.includes('✕') && !txt.includes('×0'), txt);
  });
  test('the CSV names attempts and misses', () => {
    const app = makeApp();
    app.S.history = [fix(missed())];
    const lines = app.buildSetsCSV().split('\r\n');
    const col = lines[0].split(',').indexOf('set_type');
    assert.deepEqual(lines.slice(1, 3).map(l => l.split(',')[col]), ['max_miss', 'max_attempt']);
  });
});

describe('where the lift is now', () => {
  test('a recent tested max lifts the goal bar; an old one does not', () => {
    const app = makeApp();
    app.S.history = [
      workout(2, [exEntry('bench-press', [set(160, 1)], { max: 1 })]),
      ...[5, 10, 15].map(d => workout(d, [exEntry('bench-press', [set(120, 5)])])),
      workout(200, [exEntry('bench-press', [set(180, 1)], { max: 1 })])
    ];
    assert.equal(app.currentE1rm('bench-press'), 160);
    app.S.history.shift();
    assert.equal(app.currentE1rm('bench-press'), 140);
  });
});
