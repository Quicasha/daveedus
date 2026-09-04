/* The training brain, under test: every rule that decides what tomorrow's
   workout asks of you. If a change to progression code breaks a rule, one of
   these screams. Run: node --test test/ */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, iso, set, exEntry, workout } from './harness.mjs';

const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} !~ ${b}`);
/* vm-context objects carry another realm's prototypes - flatten before deep compares */
const plain = x => JSON.parse(JSON.stringify(x));

describe('units', () => {
  const app = makeApp();
  test('kg mode is identity', () => {
    app.S.unit = 'kg';
    assert.equal(app.kg2u(100), 100);
    assert.equal(app.u2kg(100), 100);
    assert.equal(app.stepU(), 2.5);
  });
  test('lb roundtrip survives', () => {
    app.S.unit = 'lb';
    near(app.u2kg(app.kg2u(100)), 100, 0.01);
    near(app.kg2u(100), 220.46, 0.01);
    assert.equal(app.stepU(), 5);
    app.S.unit = 'kg';
  });
  test('scaleLoad snaps to the plate step, never above the original', () => {
    app.S.unit = 'kg';
    assert.equal(app.scaleLoad(100, 0.6), 60);
    assert.equal(app.scaleLoad(102.5, 0.6), 62.5);        /* 61.5 -> nearest 2.5 */
    assert.equal(app.scaleLoad(100, 1), 100);             /* >=1 passes through */
    const tiny = app.scaleLoad(1.25, 0.85);               /* would snap to 0 - keeps its own value */
    assert.ok(tiny > 0 && tiny <= 1.25);
  });
});

describe('rep targets', () => {
  const app = makeApp();
  test('normReps cleans junk and clamps', () => {
    assert.equal(app.normReps('8-12'), '8-12');
    assert.equal(app.normReps('12-8'), '8-12');            /* swapped range rights itself */
    assert.equal(app.normReps('abc'), '10');
    assert.equal(app.normReps(999), '50');
    assert.equal(app.normReps('0'), '10');                 /* zero is nonsense - default wins */
    assert.equal(app.normReps('40', 600), '40');           /* time exercises allow seconds */
  });
  test('repsParse reads singles and ranges', () => {
    assert.deepEqual(plain(app.repsParse('10')), { range: false, lo: 10, hi: 10 });
    assert.deepEqual(plain(app.repsParse('8-12')), { range: true, lo: 8, hi: 12 });
  });
});

describe('e1RM (Epley over total load)', () => {
  test('warmups and drop sets never count; deloads and archived sessions are invisible', () => {
    const app = makeApp();
    app.S.history = [
      workout(2, [exEntry('bench-press', [set(60, 10, { warm: true }), set(100, 5), set(120, 10, { drop: true })])]),
      workout(4, [exEntry('bench-press', [set(200, 10)])], { dl: 1 }),      /* deload - out */
      workout(6, [exEntry('bench-press', [set(300, 10)])], { arch: 1 })     /* archived - out */
    ];
    const pts = app.e1rmSeries('bench-press');
    assert.equal(pts.length, 1);
    near(pts[0].v, 100 * (1 + 5 / 30), 0.01);
  });
  test('bodyweight lifts count body weight in the total', () => {
    const app = makeApp();
    app.S.history = [workout(1, [exEntry('pull-up', [set(10, 5)], { bw: 80 })])];
    near(app.e1rmSeries('pull-up')[0].v, 90 * (1 + 5 / 30), 0.01);
  });
});

describe('progression ladder', () => {
  const mkTe = () => ({
    id: 't1', k: 'hollow-hold', s: 3, r: '20-30', n: 'Hollow Hold (tuck)', lvl: 0, lvlN: 1,
    lvls: [
      { k: 'hollow-hold', s: 3, r: '20-30', n: 'Hollow Hold (tuck)' },
      { k: 'hollow-hold', s: 3, r: '30-45' },
      { k: 'hollow-rocks', s: 3, r: '20-30', n: 'Hollow Body Rocks' }
    ]
  });
  test('lvlApply mirrors the level onto the slot and resets the streak', () => {
    const app = makeApp();
    const te = mkTe();
    app.lvlApply(te, 2);
    assert.equal(te.lvl, 2);
    assert.equal(te.k, 'hollow-rocks');
    assert.equal(te.r, '20-30');
    assert.equal(te.n, 'Hollow Body Rocks');
    assert.equal(te.lvlN, 0);
    app.lvlApply(te, 1);
    assert.equal(te.k, 'hollow-hold');
    assert.equal(te.n, undefined);                        /* level 2 has no label - canonical name */
  });
  test('lvlApply clamps out-of-range moves', () => {
    const app = makeApp();
    const te = mkTe();
    app.lvlApply(te, 99);
    assert.equal(te.lvl, 2);
    app.lvlApply(te, -5);
    assert.equal(te.lvl, 0);
  });
  test('lvlSyncBack folds slot edits into the current level', () => {
    const app = makeApp();
    const te = mkTe();
    te.s = 4; te.r = '25-35';                              /* user edited targets */
    app.lvlSyncBack(te);
    assert.equal(te.lvls[0].s, 4);
    assert.equal(te.lvls[0].r, '25-35');
  });
  test('lvlsOf rejects non-ladders', () => {
    const app = makeApp();
    assert.equal(app.lvlsOf(null), null);
    assert.equal(app.lvlsOf({ lvls: [] }), null);
    assert.equal(app.lvlsOf({ lvls: [{ k: 'x' }] }), null); /* one level is no ladder */
  });
  test('lvlCleanSession: top of range on all planned sets = clean', () => {
    const app = makeApp();
    const ex = (reps, target = '8-15', n = 3) => ({
      targetSets: n, targetReps: target,
      sets: reps.map(r => ({ done: true, warm: false, drop: false, r: String(r) }))
    });
    assert.equal(app.lvlCleanSession(ex([15, 15, 15])), true);
    assert.equal(app.lvlCleanSession(ex([15, 14, 15])), false);  /* one set short */
    assert.equal(app.lvlCleanSession(ex([15, 15])), false);      /* a set missing */
    assert.equal(app.lvlCleanSession({ targetSets: 3, targetReps: '8-15', sets: [] }), null);
  });
});

describe('wave cycle', () => {
  test('waveTarget walks A/B/C/D and comes back for the +1 rep attempt', () => {
    const app = makeApp();
    const wv = { base: 100, step: 2.5, idx: 0 };
    assert.deepEqual(plain(app.waveTarget(wv)), { w: 100, r: 5 });
    wv.idx = 1; assert.deepEqual(plain(app.waveTarget(wv)), { w: 102.5, r: 4 });
    wv.idx = 2; assert.deepEqual(plain(app.waveTarget(wv)), { w: 105, r: 3 });
    wv.idx = 3; assert.deepEqual(plain(app.waveTarget(wv)), { w: 100, r: 6 });
  });
  test('waveVerdict: a new best during the wave wins, three dry rounds end it', () => {
    const app = makeApp();
    const started = Date.now() - 20 * 864e5;
    app.S.history = [workout(5, [exEntry('bench-press', [set(105, 5)])])]; /* e1RM 122.5 */
    assert.equal(app.waveVerdict('bench-press', { startBest: 110, started, rounds: 0 }), 'win');
    assert.equal(app.waveVerdict('bench-press', { startBest: 130, started, rounds: 0 }), null);
    assert.equal(app.waveVerdict('bench-press', { startBest: 130, started, rounds: 3 }), 'flat');
    assert.equal(app.waveVerdict('bench-press', { startBest: 0, started, rounds: 0 }), null); /* unknown start never auto-wins */
  });
});

describe('deload', () => {
  const activeDeload = (app, pct) => {
    const tid = app.S.templates[0].id;
    app.S.deloads.push({ s: Date.now(), e: 0, tpls: [tid], done: [], pct, vol: 1 });
    return tid;
  };
  test('dlW scales by the chosen percent and snaps to plates', () => {
    const app = makeApp();
    activeDeload(app, 0.5);
    assert.equal(app.dlW(100), 50);
    assert.equal(app.dlW(10), 7.5);         /* light loads trim to 80%, then snap to the 2.5 plate step */
    assert.equal(app.dlW(-20), -20);        /* assisted loads pass through */
  });
  test('same-weight deload (pct 1) touches nothing', () => {
    const app = makeApp();
    activeDeload(app, 1);
    assert.equal(app.dlW(97.3), 97.3);
  });
  test('the cycle self-heals once every workout got its pass', () => {
    const app = makeApp();
    const tid = activeDeload(app, 0.6);
    assert.equal(app.dlForTpl(tid), true);
    app.S.deloads[0].done.push(tid);
    assert.equal(app.dlActive(), null);      /* auto-closed */
    assert.equal(app.dlForTpl(tid), false);
  });
  test('hardWeeks counts the streak and treats a 3+ week gap as a break', () => {
    const app = makeApp();
    app.S.history = [1, 4, 8, 11, 15].map(d => workout(d, [exEntry('bench-press', [set(100, 5)])]));
    near(app.hardWeeks(), 15 / 7, 0.2);
    app.S.history = [workout(25, [exEntry('bench-press', [set(100, 5)])])];
    assert.equal(app.hardWeeks(), null);     /* nobody needs a rest from resting */
  });
});

describe('comeback easing', () => {
  const gapFactor = (app, days) => {
    app.S.history = [workout(days, [exEntry('bench-press', [set(100, 5)])])];
    return app.cbFactor({ k: 'bench-press', last: { date: iso(days) } });
  };
  test('short gaps cost nothing, long ones ease the suggestions down', () => {
    const app = makeApp();
    assert.equal(gapFactor(app, 5), 1);
    assert.equal(gapFactor(app, 12), 0.95);
    assert.equal(gapFactor(app, 24), 0.85);
    assert.equal(gapFactor(app, 30), 0.75);
    assert.equal(gapFactor(app, 100), 0.55);
  });
  test('no history at all means no easing (nothing to ease from)', () => {
    const app = makeApp();
    assert.equal(app.cbFactor({ k: 'bench-press', last: null }), 1);
  });
});

describe('share & backup codes', () => {
  test('encode/decode roundtrip keeps Lithuanian diacritics intact', () => {
    const app = makeApp();
    const payload = { t: 'tpl', name: 'Ąžuolo treniruotė ČĘĖĮŠŲŪŽ ✓', ex: [{ k: 'bench-press', s: 3, r: '8-12' }] };
    const code = app.encodeShare(payload);
    assert.ok(code.startsWith('DVD1.'));
    assert.deepEqual(plain(app.decodeShare(code)), payload);
  });
  test('garbage never throws, it just returns null', () => {
    const app = makeApp();
    assert.equal(app.decodeShare('DVD1.!!!not-base64!!!'), null);
    assert.equal(app.decodeShare(''), null);
  });
  test('full backup payload survives the roundtrip', () => {
    const app = makeApp();
    const back = plain(app.decodeShare(app.encodeShare(app.bakPayload())));
    assert.equal(back.t, 'bak');
    assert.equal(back.s.templates.length, app.S.templates.length);
    assert.deepEqual(back.s.folders, plain(app.S.folders));
  });
  test('hydrate repairs instead of rejecting', () => {
    const app = makeApp();
    const s = app.hydrate({
      templates: 'nonsense',
      history: [null, { exercises: 'bad' }, { exercises: [{ sets: [] }], date: iso(1) }],
      ts: Date.now() + 999 * 864e5,                       /* clock-skewed future stamp */
      waves: { 'bench-press': { base: 100, step: 2.5, idx: 2 }, bad: { base: -1 } }
    });
    assert.deepEqual(plain(s.templates), []);
    assert.equal(s.history.length, 1);
    assert.ok(s.ts <= Date.now());
    assert.equal(s.waves['bench-press'].idx, 2);
    assert.equal(s.waves['bench-press'].rounds, 0);        /* pre-v2.7 wave gets bookkeeping */
    assert.equal(s.waves.bad, undefined);
  });
  test('importing a ladder registers unknown levels and mirrors the current rung', () => {
    const app = makeApp();
    const tpl = app.importTplPayload({
      name: 'Friend abs', ex: [{
        k: 'mystery-move', n: 'Mystery Move', s: 3, r: '8-12', lvl: 1,
        lvls: [
          { k: 'captains-chair-knee-raise', n: "Captain's Chair Knee Raise", s: 3, r: '8-15' },
          { k: 'no-such-exercise', n: 'Frog Raise', s: 3, r: '6-10' }
        ]
      }]
    }, null);
    const e = tpl.ex[0];
    assert.equal(e.lvls.length, 2);
    assert.equal(e.lvl, 1);
    assert.ok(e.k.startsWith('custom-'));                  /* unknown level became a local custom */
    assert.equal(app.exName(e.k), 'Frog Raise');
    assert.equal(e.s, 3);
    assert.equal(e.r, '6-10');                             /* slot mirrors the current rung */
  });
});
