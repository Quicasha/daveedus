/* Test harness: loads the app's plain <script>-style files into a vm context
   with just enough browser stubbed to let the TRAINING BRAIN run. No DOM is
   rendered - only the pure logic (units, progression, deload, waves, codes)
   is exercised. ui.js / boot.js / home.js are deliberately not loaded. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import url from 'node:url';

const root = path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..');

const FILES = [
  'js/exercises.js', 'js/i18n.js', 'js/util.js', 'js/state.js',
  'js/deload.js', 'js/workout.js', 'js/program.js', 'js/stats.js', 'js/data.js',
  'js/history.js', /* for the plate maths; its screen builders are never called here */
  'js/exercises-ui.js' /* the record tables (exStats, repMaxRows) that finishing a session reads */
];

export function makeApp(){
  const store = new Map();
  const noop = () => {};
  const nullEl = null;
  /* every timer the app arms is tracked, so a test can stop the clock instead of
     leaving a 4-second cloud-sync retry keeping the runner alive */
  const timers = new Set();
  const sandbox = {
    console, setInterval, clearInterval,
    setTimeout: (fn, ms, ...rest) => { const h = setTimeout(fn, ms, ...rest); timers.add(h); return h; },
    clearTimeout: h => { timers.delete(h); clearTimeout(h); },
    /* network: tests install ctx.__fetch to decide what GitHub "replies" */
    fetch: (...a) => (sandbox.__fetch
      ? sandbox.__fetch(...a)
      : Promise.reject(new Error('fetch called with no __fetch stub installed'))),
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    escape, unescape,
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      clear: () => store.clear()
    },
    indexedDB: { open(){ const r = {}; setTimeout(() => r.onerror && r.onerror(new Error('no idb'))); return r; } },
    document: {
      addEventListener: noop, removeEventListener: noop,
      getElementById: () => nullEl, querySelector: () => nullEl, querySelectorAll: () => [],
      visibilityState: 'visible',
      documentElement: { style: { setProperty: noop }, setAttribute: noop, dataset: {} },
      body: { appendChild: noop, classList: { add: noop, remove: noop } },
      createElement: () => ({ style: {}, classList: { add: noop, remove: noop }, setAttribute: noop, appendChild: noop, remove: noop, select: noop }),
      head: { appendChild: noop }
    },
    navigator: { userAgent: 'test', onLine: false },
    matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }),
    addEventListener: noop, removeEventListener: noop
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const f of FILES){
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  }
  /* top-level let/const in classic scripts are lexical bindings, invisible as
     context properties - bridge the ones tests need with LIVE accessors, so
     `app.S` always follows the current binding even if app code reassigns it */
  for (const name of ['S', 'V', 'EX_DB', 'T', 'LB_PER_KG']){
    vm.runInContext(
      `Object.defineProperty(globalThis, '${name}', { get: () => ${name}, set: v => { ${name} = v; }, configurable: true });`,
      ctx);
  }
  /* the data layer legitimately calls into the screen layer (a restore closes the
     sheet and goes home). ui.js is not loaded here, so those calls become no-ops
     and the logic underneath stays testable. */
  vm.runInContext(`
    closeModal = () => {}; openModal = () => {}; go = () => {};
    render = () => {}; toast = () => {}; undoToast = (m, r) => {};
    unlockAudio = () => {}; /* boot.js: the rest-timer sound needs a real tap */
  `, ctx);
  ctx.__stopTimers = () => { for (const h of timers) clearTimeout(h); timers.clear(); };
  return ctx;
}

/* a GitHub the app can talk to: remembers the files PUT to it, counts calls and
   can hold a request open so a test can act while an upload is in flight */
export function fakeGitHub(app, opts){
  const o = opts || {};
  const files = new Map();
  const state = { puts: 0, gets: 0, files, gate: null };
  app.S.ghRepo = 'me/daveedus-data';
  app.S.ghToken = 'ghp_test';
  app.navigator.onLine = true;
  state.hold = () => { let release; state.gate = new Promise(r => { release = r; }); return release; };
  app.__fetch = async (url, init) => {
    const opt = init || {};
    const name = String(url).split('/contents/')[1] || '';
    if (opt.method === 'PUT'){
      state.puts++;
      if (state.gate) await state.gate;
      if (o.failPut) return { ok: false, status: 500, json: async () => ({}) };
      const body = JSON.parse(opt.body);
      /* GitHub rejects a PUT whose sha is not the file's current one */
      const cur = files.get(name);
      if (cur && body.sha !== cur.sha) return { ok: false, status: 409, json: async () => ({}) };
      files.set(name, { text: Buffer.from(body.content, 'base64').toString('utf8'), sha: 'sha' + state.puts });
      return { ok: true, status: 200, json: async () => ({}) };
    }
    state.gets++;
    state.lastGetInit = opt;
    const f = files.get(name);
    if (!f) return { ok: false, status: 404, json: async () => ({}) };
    const raw = /raw/.test(((opt.headers || {}).Accept) || '');
    /* raw media type hands back the file itself; the default one, its metadata */
    return { ok: true, status: 200, json: async () => (raw ? JSON.parse(f.text) : { sha: f.sha }) };
  };
  state.read = name => { const f = files.get(name); return f ? JSON.parse(f.text) : null; };
  return state;
}

/* every app script as one string - for checks that scan the source itself
   (missing i18n keys, forbidden patterns) rather than running it */
export function readAppSource(){
  const ui = ['js/ui.js', 'js/home.js', 'js/settings.js', 'js/boot.js', 'js/exercises-ui.js'];
  return FILES.concat(ui)
    .map(f => fs.readFileSync(path.join(root, f), 'utf8'))
    .join('\n');
}

/* ---- tiny builders for history entries, shaped exactly like finishWorkout writes them ---- */
export const iso = daysAgo => new Date(Date.now() - daysAgo * 864e5).toISOString();
export const set = (weight, reps, f) => ({ weight, reps, warm: !!(f && f.warm), drop: !!(f && f.drop), fail: false });
export const exEntry = (k, sets, extra) => ({ k, name: k, targetSets: sets.length, targetReps: '5', note: '', ss: false, sets, ...extra });
export const workout = (daysAgo, exercises, extra) => ({
  id: 'h' + Math.random().toString(36).slice(2), tplId: null, name: 'T',
  date: iso(daysAgo), dur: 0, exercises, ...extra
});
