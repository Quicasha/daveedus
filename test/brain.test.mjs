/* The training brain, under test: every rule that decides what tomorrow's
   workout asks of you. If a change to progression code breaks a rule, one of
   these screams. Run: node --test */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, fakeGitHub, readAppSource, iso, set, exEntry, workout } from './harness.mjs';

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

/* the colour of a finished set: cumulative work through this set against the
   previous session through the same set - not set against set */
describe('set verdict', () => {
  /* today's sets carry display-unit strings, last time's carry kg numbers,
     exactly as the live session and history hold them */
  const today = (...rows) => rows.map(([w, r, f]) => ({ w: String(w), r: String(r), done: true, warm: !!(f && f.warm), drop: !!(f && f.drop) }));
  const last = (rows, extra) => Object.assign({ sets: rows.map(([w, r, f]) => set(w, r, f)) }, extra || {});
  const lift = (k, sets, prev, extra) => Object.assign({ k, sets, last: prev }, extra || {});

  test('THE case: a heavier first set keeps a shorter second one green', () => {
    const app = makeApp();
    /* went up 5 kg, lost a rep on set 2: 945 kg of work is LESS than last
       time's 1000, but the top set is clearly stronger - that is progress */
    const ex = lift('bench-press', today([105, 5], [105, 4]), last([[100, 5], [100, 5]]));
    assert.equal(app.setVerdict(ex, 0, 105, 5), 'win');
    assert.equal(app.setVerdict(ex, 1, 105, 4), 'win');
  });
  test('the owner’s exact case: pushed set 1, dropped back for set 2 and lost a rep', () => {
    const app = makeApp();
    /* set-against-set called 100x4 a loss against last time's 100x5 - the red
       that made going heavier feel like a mistake. Cumulatively the top set is
       stronger, so the session is ahead. */
    const ex = lift('bench-press', today([105, 5], [100, 4]), last([[100, 5], [100, 5]]));
    assert.equal(app.setVerdict(ex, 1, 100, 4), 'win');
  });
  test('more work at a lighter weight is also a win', () => {
    const app = makeApp();
    const ex = lift('bench-press', today([90, 8]), last([[100, 5]]));
    assert.equal(app.setVerdict(ex, 0, 90, 8), 'win', '720 kg moved beats 500, even if the top set is lighter');
  });
  test('the same work at the same strength is even', () => {
    const app = makeApp();
    const same = lift('bench-press', today([100, 5], [100, 5]), last([[100, 5], [100, 5]]));
    assert.equal(app.setVerdict(same, 1, 100, 5), 'even');
  });
  test('same weight, a rep short on set 2: less work at the same strength is honestly red', () => {
    const app = makeApp();
    const behind = lift('bench-press', today([100, 5], [100, 4]), last([[100, 5], [100, 5]]));
    assert.equal(app.setVerdict(behind, 0, 100, 5), 'even');
    assert.equal(app.setVerdict(behind, 1, 100, 4), 'loss');
  });
  test('a set last time never had gets no colour', () => {
    const app = makeApp();
    const ex = lift('bench-press', today([100, 5], [100, 5], [100, 5]), last([[100, 5], [100, 5]]));
    assert.equal(app.setVerdict(ex, 2, 100, 5), 'none');
    assert.equal(app.setVerdict(lift('bench-press', today([100, 5]), null), 0, 100, 5), 'none');
  });
  test('warmups and drops are skipped when lining sets up', () => {
    const app = makeApp();
    const ex = lift('bench-press',
      today([60, 10, { warm: true }], [100, 5], [80, 10, { drop: true }], [100, 5]),
      last([[100, 5], [100, 4]]));
    assert.equal(app.setVerdict(ex, 3, 100, 5), 'win', 'second work set beat last time by one rep');
  });
  test('bodyweight with nothing added: more reps is more work', () => {
    const app = makeApp();
    const ex = lift('pull-up', today([0, 9]), last([[0, 8]], { bw: 73 }), { bw: 73 });
    assert.equal(app.setVerdict(ex, 0, 0, 9), 'win');
  });
  test('time-based work compares seconds, not kilos', () => {
    const app = makeApp();
    const ex = lift('plank', today([0, 70]), last([[0, 60]]));
    assert.equal(app.setVerdict(ex, 0, 0, 70), 'win');
    assert.equal(app.setVerdict(lift('plank', today([0, 50]), last([[0, 60]])), 0, 0, 50), 'loss');
  });
  test('a machine whose base went up counts the whole load', () => {
    const app = makeApp();
    /* same plates as last time, but the sled itself is heavier now */
    const ex = lift('leg-press', today([100, 10]), last([[100, 10]], { mb: 25 }), { base: 30 });
    assert.equal(app.setVerdict(ex, 0, 100, 10), 'win');
  });
});

/* the +2.5 kg offer: the rule that decides when the app dares suggest more
   weight. Getting this wrong either stalls the lifter or pushes into a break. */
describe('double progression', () => {
  const lift = extra => Object.assign({
    k: 'bench-press', dp: 2.5, targetReps: '4-6',
    sets: [{ done: false, w: '', warm: false, drop: false }],
    last: { sameTpl: true, date: iso(3), sets: [set(100, 6), set(100, 6), set(100, 6)] }
  }, extra || {});
  const seed = app => { app.S.history = [workout(3, [exEntry('bench-press', [set(100, 6)])])]; };

  test('offered when every working set hit the top of the range', () => {
    const app = makeApp(); seed(app);
    assert.equal(app.dpDue(lift()), true);
  });
  test('withheld when one set fell short', () => {
    const app = makeApp(); seed(app);
    assert.equal(app.dpDue(lift({ last: { sameTpl: true, date: iso(3), sets: [set(100, 6), set(100, 5)] } })), false);
  });
  test('warmups and drop sets do not get a vote', () => {
    const app = makeApp(); seed(app);
    const last = { sameTpl: true, date: iso(3), sets: [set(60, 10, { warm: true }), set(100, 6), set(80, 12, { drop: true })] };
    assert.equal(app.dpDue(lift({ last })), true);
  });
  test('silent once the lifter is already typing or lifting', () => {
    const app = makeApp(); seed(app);
    assert.equal(app.dpDue(lift({ sets: [{ done: true, w: '100', warm: false, drop: false }] })), false);
    assert.equal(app.dpDue(lift({ sets: [{ done: false, w: '105', warm: false, drop: false }] })), false);
  });
  test('silent on values borrowed from another workout', () => {
    const app = makeApp(); seed(app);
    assert.equal(app.dpDue(lift({ last: { sameTpl: false, date: iso(3), sets: [set(100, 6)] } })), false);
  });
  test('silent right after a layoff - the comeback eases down, it does not add', () => {
    const app = makeApp();
    app.S.history = [workout(40, [exEntry('bench-press', [set(100, 6)])])];
    assert.equal(app.dpDue(lift({ last: { sameTpl: true, date: iso(40), sets: [set(100, 6)] } })), false);
  });
  test('the wave owns the lift while it runs', () => {
    const app = makeApp(); seed(app);
    app.S.waves['bench-press'] = { base: 100, step: 2.5, idx: 0, startBest: 0, started: 0, rounds: 0 };
    assert.equal(app.dpDue(lift()), false);
  });
  test('applyDp fills the empty sets with last time plus the step', () => {
    const app = makeApp(); seed(app);
    app.S.active = { tplId: null, name: 'T', startedAt: new Date().toISOString(), rest: null, dl: 0,
      exercises: [lift({ id: 'x1', name: 'Bench Press', baseK: 'bench-press', targetSets: 3, stash: {}, alts: [],
        sets: [{ done: false, w: '', r: '', warm: false, drop: false }, { done: false, w: '', r: '', warm: false, drop: false }] })] };
    app.applyDp(0);
    assert.equal(app.S.active.exercises[0].sets[0].w, '102.5');
    assert.equal(app.S.active.exercises[0].sets[1].w, '102.5');
  });
});

describe('plate calculator', () => {
  test('turning every plate off falls back to a sane set instead of an empty bar', () => {
    const app = makeApp();
    app.S.plates.kg = [];
    const ps = app.plateSet();
    assert.ok(ps.length > 0, 'an empty plate list must not leave the calculator with nothing');
    assert.deepEqual(ps, ps.slice().sort((a, b) => b - a), 'plates come biggest first');
  });
  test('the bar options follow the unit', () => {
    const app = makeApp();
    assert.deepEqual(plain(app.plateBars()), [20, 15, 10]);
    app.S.unit = 'lb';
    assert.deepEqual(plain(app.plateBars()), [45, 35, 25]);
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

describe('weekly sets per muscle', () => {
  test('buckets by calendar week, counts work sets only, maps through the exercise DB', () => {
    const app = makeApp();
    /* Monday of the current week, so "1.5 days after Monday" is always THIS week */
    const mon = new Date(); mon.setHours(0, 0, 0, 0);
    mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
    const daysAgo = ms => (Date.now() - ms) / 864e5;
    const thisWk = daysAgo(mon.getTime() + 0.2 * 864e5);
    const lastWk = daysAgo(mon.getTime() - 6.5 * 864e5);
    app.S.history = [
      workout(thisWk, [
        exEntry('bench-press', [set(100, 5), set(100, 5), set(60, 10, { warm: true })]), /* chest 2 */
        exEntry('barbell-row', [set(80, 8)])                                             /* back 1 */
      ]),
      workout(lastWk, [exEntry('bench-press', [set(95, 5)])]),                           /* chest 1, week -1 */
      workout(lastWk, [exEntry('no-such-lift', [set(10, 10)])], { arch: 1 })             /* archived - out */
    ];
    const weeks = app.weeklyMuscleSets(2);
    assert.equal(weeks[0].counts.chest, 2);       /* warmup not counted */
    assert.equal(weeks[0].counts.back, 1);
    assert.equal(weeks[1].counts.chest, 1);
    assert.equal(weeks[1].counts.other, undefined); /* archived session never lands */
  });
});

/* The cloud copy is the disaster recovery AND what the journal reads, so these
   guard two promises: nothing logged is ever marked synced without going up,
   and the token never travels. */
describe('cloud sync', () => {
  const settle = () => new Promise(r => setImmediate(r));

  test('a successful push writes both files and clears the pending flag', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.S.history = [workout(1, [exEntry('bench-press', [set(100, 5)])])];
    app.scheduleCloudSync();
    await app.cloudSync();
    const up = gh.read('backup.json');
    assert.equal(up.t, 'bak');
    assert.equal(up.s.history.length, 1);
    assert.ok(gh.files.has('backup-code.txt'));
    assert.equal(app.S.ghDirty, 0);
    assert.ok(app.S.ghLast > 0);
    app.__stopTimers();
  });

  test('a workout finished DURING an upload stays pending', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.scheduleCloudSync();               /* checkpoint 1 */
    const release = gh.hold();             /* freeze the PUT mid-flight */
    const flight = app.cloudSync();
    await settle();
    app.S.history = [workout(0, [exEntry('back-squat', [set(140, 3)])])];
    app.scheduleCloudSync();               /* checkpoint 2 lands while uploading */
    release();
    await flight;
    assert.equal(app.S.ghDirty, 1, 'the workout logged mid-upload must still be pending');
    app.__stopTimers();
  });

  test('a dropped connection keeps the data pending instead of losing it', async () => {
    const app = makeApp();
    fakeGitHub(app, { failPut: true });
    app.scheduleCloudSync();
    await app.cloudSync();
    assert.equal(app.S.ghDirty, 1);
    assert.equal(app.V.gh, 'err');
    app.__stopTimers();
  });

  test('offline does nothing at all - no request, flag untouched', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.navigator.onLine = false;
    app.scheduleCloudSync();
    await app.cloudSync();
    assert.equal(gh.puts, 0);
    assert.equal(app.S.ghDirty, 1);
    app.__stopTimers();
  });

  test('the sha read bypasses the cache - a stale one is a rejected write', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.scheduleCloudSync();
    await app.cloudSync();
    assert.equal(gh.lastGetInit.cache, 'no-store');
    app.__stopTimers();
  });

  test('two pushes in a row both land (fresh sha each time)', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.scheduleCloudSync();
    await app.cloudSync();
    app.S.history = [workout(0, [exEntry('deadlift', [set(180, 1)])])];
    app.scheduleCloudSync();
    await app.cloudSync();
    assert.equal(gh.read('backup.json').s.history.length, 1);
    assert.equal(app.S.ghDirty, 0);
    app.__stopTimers();
  });

  test('the GitHub token never travels in a backup payload', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.scheduleCloudSync();
    await app.cloudSync();
    const raw = JSON.stringify(gh.read('backup.json'));
    assert.ok(!raw.includes('ghp_test'), 'token leaked into the cloud payload');
    assert.equal(gh.read('backup.json').s.ghToken, undefined);
    app.__stopTimers();
  });

  test('backup.json keeps the shape the journal reads', async () => {
    const app = makeApp();
    const gh = fakeGitHub(app);
    app.S.weights = [{ id: 'w1', date: iso(0), kg: 73.3 }];
    app.scheduleCloudSync();
    await app.cloudSync();
    const s = gh.read('backup.json').s;
    for (const field of ['history', 'weights', 'templates', 'folders', 'unit', 'customEx']){
      assert.ok(s[field] !== undefined, `backup.json lost the "${field}" field`);
    }
    assert.equal(s.weights[0].kg, 73.3);
    app.__stopTimers();
  });
});

/* per-workout progress: the same lift can climb in one workout and stall in
   another, and only a template-scoped view can tell you which. */
describe('per-workout progress', () => {
  const twoTemplates = app => {
    const fid = app.S.folders[0].id;
    app.S.templates = [
      { id: 'tA', name: 'Upper A', folderId: fid, ex: [{ id: 'e1', k: 'bench-press', s: 3, r: '5' }] },
      { id: 'tB', name: 'Upper B', folderId: fid, ex: [{ id: 'e2', k: 'bench-press', s: 3, r: '5' }] }
    ];
  };
  const sess = (tplId, name, daysAgo, w, extra) =>
    Object.assign(workout(daysAgo, [exEntry('bench-press', [set(w, 5), set(w, 5)])], extra), { tplId, name });

  test('sessions are scoped to one template, archived and deload passes left out', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [
      sess('tA', 'Upper A', 1, 100),
      sess('tB', 'Upper B', 3, 90),
      sess('tA', 'Upper A', 5, 95),
      sess('tA', 'Upper A', 7, 200, { arch: 1 }),
      sess('tA', 'Upper A', 9, 60, { dl: 1 })
    ];
    assert.equal(app.tplSessions('tA').length, 2);
    assert.equal(app.tplSessions('tB').length, 1);
    assert.equal(app.tplSessions('tA', true).length, 3, 'deload passes are available when asked for');
  });

  test('a re-created workout keeps its history through the name', () => {
    /* delete a workout, build it again: new id, same name - the log must follow */
    const app = makeApp(); twoTemplates(app);
    app.S.history = [sess('OLD-ID', 'Upper A', 4, 100)];
    assert.equal(app.tplSessions('tA').length, 1);
  });

  test('the headline numbers describe the workout, not the lifetime', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [sess('tA', 'Upper A', 0, 100), sess('tA', 'Upper A', 6, 90), sess('tB', 'Upper B', 1, 200)];
    const st = app.tplProgStats('tA');
    assert.equal(st.n, 2);
    assert.equal(st.avgGap, 6, 'six days between the two sessions');
    assert.equal(Math.round(st.avgVol), Math.round((100 * 10 + 90 * 10) / 2));
  });

  test('one session is a count, not a cadence', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [sess('tA', 'Upper A', 2, 100)];
    assert.equal(app.tplProgStats('tA').avgGap, null);
  });

  test('a workout never done reports nothing rather than breaking', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [];
    const st = app.tplProgStats('tA');
    assert.equal(st.n, 0);
    assert.equal(st.last, null);
    assert.deepEqual(plain(app.tplVolSeries('tA')), []);
    assert.deepEqual(plain(app.tplExRows('tA')).map(r => r.n), [0]);
  });

  test('the volume series runs oldest to newest, in display units', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [sess('tA', 'Upper A', 1, 110), sess('tA', 'Upper A', 8, 100)];
    const v = app.tplVolSeries('tA');
    assert.equal(v.length, 2);
    assert.equal(v[0].w, 1000, 'oldest first');
    assert.equal(v[1].w, 1100);
    app.S.unit = 'lb';
    assert.ok(app.tplVolSeries('tA')[0].w > 2000, 'volume follows the display unit');
  });

  test('THE point: one lift, climbing in Upper A and flat in Upper B', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [
      sess('tA', 'Upper A', 1, 115), sess('tA', 'Upper A', 8, 110),
      sess('tA', 'Upper A', 15, 105), sess('tA', 'Upper A', 22, 100),
      sess('tB', 'Upper B', 2, 90), sess('tB', 'Upper B', 9, 90),
      sess('tB', 'Upper B', 16, 90), sess('tB', 'Upper B', 23, 90)
    ];
    const a = app.tplExRows('tA').find(r => r.k === 'bench-press');
    const b = app.tplExRows('tB').find(r => r.k === 'bench-press');
    assert.equal(a.trend, 'up');
    assert.equal(b.trend, 'flat');
    assert.ok(a.now > a.first, 'Upper A moved');
    assert.equal(b.now, b.first, 'Upper B did not');
    /* and the lifetime view cannot separate them - which is why this exists */
    assert.equal(app.e1rmSeries('bench-press').length, 8);
  });

  test('a lift logged but not planned is shown and flagged as extra', () => {
    const app = makeApp(); twoTemplates(app);
    app.S.history = [Object.assign(workout(1, [
      exEntry('bench-press', [set(100, 5)]),
      exEntry('cable-fly', [set(20, 12)])
    ]), { tplId: 'tA', name: 'Upper A' })];
    const rows = app.tplExRows('tA');
    assert.equal(rows.find(r => r.k === 'bench-press').planned, true);
    assert.equal(rows.find(r => r.k === 'cable-fly').planned, false);
  });

  test('time-based work is measured in seconds, not in estimated kilos', () => {
    const app = makeApp();
    app.S.templates = [{ id: 'tP', name: 'Core', folderId: app.S.folders[0].id, ex: [{ id: 'e1', k: 'plank', s: 2, r: '60' }] }];
    app.S.history = [
      Object.assign(workout(1, [exEntry('plank', [set(0, 75)])]), { tplId: 'tP', name: 'Core' }),
      Object.assign(workout(8, [exEntry('plank', [set(0, 60)])]), { tplId: 'tP', name: 'Core' })
    ];
    const r = app.tplExRows('tP')[0];
    assert.equal(r.tm, true);
    assert.equal(r.first, 60);
    assert.equal(r.now, 75, 'a 0 kg hold still has progress - the clock');
  });

  test('two programs, one lift: the per-week rate says which block moved it faster', () => {
    const app = makeApp();
    const fA = app.S.folders[0].id, fB = app.S.folders[1].id;
    app.S.templates = [
      { id: 'tA', name: 'Old plan', folderId: fA, ex: [] },
      { id: 'tB', name: 'New plan', folderId: fB, ex: [] }
    ];
    /* old plan: 100 -> 105 over 10 weeks; new plan: 105 -> 110 over 4 weeks */
    app.S.history = [
      sess('tB', 'New plan', 0, 110), sess('tB', 'New plan', 28, 105),
      sess('tA', 'Old plan', 35, 105), sess('tA', 'Old plan', 105, 100)
    ];
    const a = app.folderLifts(fA)['bench-press'], b = app.folderLifts(fB)['bench-press'];
    assert.equal(Math.round(a.pct), 5);
    assert.equal(Math.round(b.pct), 5, 'same total gain...');
    assert.ok(b.perWeek > a.perWeek * 2, '...but the new plan earned it in less than half the time');
    assert.equal(app.folderLifts(fA)['plank'], undefined, 'time work has no e1RM to compare');
  });

  test('a program sums up its own workouts and nobody else’s', () => {
    const app = makeApp();
    const fid = app.S.folders[0].id, other = app.S.folders[1].id;
    app.S.templates = [
      { id: 'tA', name: 'Upper A', folderId: fid, ex: [] },
      { id: 'tZ', name: 'Abs', folderId: other, ex: [] }
    ];
    app.S.history = [
      sess('tA', 'Upper A', 1, 100), sess('tA', 'Upper A', 15, 100),
      sess('tZ', 'Abs', 3, 50)
    ];
    const st = app.folderProgStats(fid);
    assert.equal(st.n, 2);
    assert.equal(app.folderProgStats(other).n, 1);
    assert.equal(st.perWeek, 1, 'two sessions across two weeks');
  });
});

describe('volume', () => {
  test('warmups are out, drop sets and machine base are in, pairs count twice', () => {
    const app = makeApp();
    const exs = [
      exEntry('bench-press', [set(60, 10, { warm: true }), set(100, 5)]),           /* 500 */
      exEntry('incline-db-press', [set(30, 10)], { x2: 1 }),                        /* 600 */
      exEntry('leg-press', [set(100, 10)], { mb: 25 }),                             /* 1250 */
      exEntry('cable-crunch', [set(40, 10), set(20, 10, { drop: true })])           /* 600 */
    ];
    assert.equal(app.woVolume(exs), 500 + 600 + 1250 + 600);
  });

  test('a weighted plank contributes no kg-seconds to the volume number', () => {
    const app = makeApp();
    assert.equal(app.woVolume([exEntry('plank', [set(10, 60)])]), 0);
  });

  test('the CSV export and the in-app volume agree to the kilo', () => {
    /* the summary, the charts and the exported column must never tell three
       different stories about the same session */
    const app = makeApp();
    app.S.history = [workout(1, [
      exEntry('bench-press', [set(60, 10, { warm: true }), set(100, 5), set(100, 4)]),
      exEntry('pull-up', [set(10, 8), set(0, 10)], { bw: 73.3 }),
      exEntry('incline-db-press', [set(30, 10)], { x2: 1 }),
      exEntry('leg-press', [set(120, 8)], { mb: 25 })
    ])];
    const lines = app.buildSetsCSV().split('\r\n');
    const head = lines[0].split(',');
    const vCol = head.indexOf('volume_kg'), tCol = head.indexOf('set_type');
    /* the CSV keeps one row per set and labels warmups, so the comparable total
       is the work rows - the same ones woVolume counts */
    const csvTotal = lines.slice(1).filter(Boolean)
      .map(r => r.split(','))
      .filter(c => c[tCol] !== 'warmup')
      .reduce((a, c) => a + (parseFloat(c[vCol]) || 0), 0);
    assert.equal(Math.round(csvTotal), Math.round(app.woVolume(app.S.history[0].exercises)));
  });
});

describe('edge cases', () => {
  test('a session where every set is a warmup counts as zero volume, not NaN', () => {
    const app = makeApp();
    const w = workout(0, [exEntry('bench-press', [set(60, 10, { warm: true })])]);
    assert.equal(app.woVolume(w.exercises), 0);
    assert.equal(app.e1rmSeries('bench-press').length, 0);
  });

  test('an exercise with an empty set list does not break the totals', () => {
    const app = makeApp();
    const w = workout(0, [exEntry('bench-press', []), exEntry('barbell-row', [set(80, 8)])]);
    assert.equal(app.woVolume(w.exercises), 640);
    app.S.history = [w];
    assert.equal(app.weeklyMuscleSets(1)[0].counts.back, 1);
  });

  test('a 0 kg set is honest work: counted as a set, worth no volume', () => {
    const app = makeApp();
    const w = workout(0, [exEntry('ab-wheel', [set(0, 8)])]);
    assert.equal(app.woVolume(w.exercises), 0);
    app.S.history = [w];
    assert.equal(app.weeklyMuscleSets(1)[0].counts.core, 1);
    assert.equal(app.e1rmSeries('ab-wheel').length, 0); /* no load, no 1RM estimate */
  });

  test('a bodyweight set with no added load still carries the lifter', () => {
    const app = makeApp();
    const w = workout(0, [exEntry('pull-up', [set(0, 10)], { bw: 73.3 })]);
    app.S.history = [w];
    assert.equal(Math.round(app.woVolume(w.exercises)), 733,
      'ten pull-ups move the lifter, not zero kilos');
    assert.ok(app.e1rmSeries('pull-up')[0].v > 73);
  });

  test('a big session (40 exercises) stays finite and fast', () => {
    const app = makeApp();
    const many = Array.from({ length: 40 }, () => exEntry('bench-press', [set(100, 5), set(100, 5)]));
    const t0 = Date.now();
    const v = app.woVolume(many);
    assert.equal(v, 40 * 2 * 500);
    assert.ok(Date.now() - t0 < 200);
  });

  test('an ancient backup with none of the newer fields hydrates', () => {
    const app = makeApp();
    /* the shape v1 wrote: no folders, no waves, no plates, no mig13, no ts */
    const s = app.hydrate({
      unit: 'kg',
      templates: [{ id: 'old1', name: 'Full body', ex: [{ k: 'bench-press', s: 3, r: '5' }] }],
      history: [{ id: 'h1', name: 'Full body', date: iso(3), exercises: [{ k: 'bench-press', name: 'Bench Press', sets: [set(100, 5)] }] }]
    });
    assert.ok(s, 'an old backup must never hydrate to null');
    assert.equal(s.templates.length, 1);
    assert.equal(s.history.length, 1);
    assert.equal(s.folders.length, 1, 'flat-era templates get one program to live in');
    assert.equal(s.templates[0].folderId, s.folders[0].id);
    assert.deepEqual(plain(s.waves), {});
    assert.ok(Array.isArray(s.plates.kg) && s.plates.kg.length);
    assert.equal(s.lang, undefined, 'the retired language flag is dropped');
  });

  test('a backup restored from another device does not drag its sync setup along', () => {
    const app = makeApp();
    app.S.ghRepo = 'me/mine'; app.S.ghToken = 'ghp_mine';
    app.applyBak({ t: 'bak', s: { history: [], templates: [], folders: [], ghRepo: 'them/theirs', ghToken: 'ghp_theirs' } });
    assert.equal(app.S.ghRepo, 'me/mine', 'this device keeps its own repo');
    assert.equal(app.S.ghToken, 'ghp_mine');
  });

  test('two devices on the same day: the later push wins, nothing is corrupted', async () => {
    const a = makeApp(), b = makeApp();
    const ghA = fakeGitHub(a);
    a.S.history = [workout(0, [exEntry('bench-press', [set(100, 5)])])];
    a.scheduleCloudSync();
    await a.cloudSync();
    /* device B shares the same repo but has its own (older) log */
    b.__fetch = a.__fetch; b.S.ghRepo = a.S.ghRepo; b.S.ghToken = a.S.ghToken; b.navigator.onLine = true;
    b.S.history = [workout(0, [exEntry('back-squat', [set(140, 3)])])];
    b.scheduleCloudSync();
    await b.cloudSync();
    const up = ghA.read('backup.json');
    assert.equal(up.s.history.length, 1);
    assert.equal(up.s.history[0].exercises[0].k, 'back-squat', 'last writer wins - a whole-state snapshot has no merge');
    assert.equal(b.S.ghDirty, 0);
    a.__stopTimers(); b.__stopTimers();
  });
});

describe('i18n', () => {
  test('t() fills placeholders and falls back to the key itself', () => {
    const app = makeApp();
    assert.equal(app.t('tabHistory'), 'History');
    assert.equal(app.t('daysAgo', { n: 3 }), '3 days ago');
    assert.equal(app.t('no-such-key'), 'no-such-key');
  });
  test('every string the code asks for actually exists in the dictionary', () => {
    /* catches a t('key') left behind by a removed feature - it would render
       the raw key to the user instead of a sentence */
    const app = makeApp();
    const src = readAppSource();
    /* only whole literal keys - t('g_'+group) and friends build theirs at
       runtime, so the quote is followed by "+" rather than "," or ")" */
    const used = new Set();
    for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z][\w]*)'\s*[,)]/g)) used.add(m[1]);
    const missing = [...used].filter(k => app.T[k] == null).sort();
    assert.deepEqual(missing, [], 'strings referenced but not defined: ' + missing.join(', '));
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
