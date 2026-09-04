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
  'js/deload.js', 'js/workout.js', 'js/program.js', 'js/stats.js', 'js/data.js'
];

export function makeApp(){
  const store = new Map();
  const noop = () => {};
  const nullEl = null;
  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
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
  for (const name of ['S', 'V', 'EX_DB', 'T', 'T_EN', 'T_LT', 'LB_PER_KG']){
    vm.runInContext(
      `Object.defineProperty(globalThis, '${name}', { get: () => ${name}, set: v => { ${name} = v; }, configurable: true });`,
      ctx);
  }
  return ctx;
}

/* ---- tiny builders for history entries, shaped exactly like finishWorkout writes them ---- */
export const iso = daysAgo => new Date(Date.now() - daysAgo * 864e5).toISOString();
export const set = (weight, reps, f) => ({ weight, reps, warm: !!(f && f.warm), drop: !!(f && f.drop), fail: false });
export const exEntry = (k, sets, extra) => ({ k, name: k, targetSets: sets.length, targetReps: '5', note: '', ss: false, sets, ...extra });
export const workout = (daysAgo, exercises, extra) => ({
  id: 'h' + Math.random().toString(36).slice(2), tplId: null, name: 'T',
  date: iso(daysAgo), dur: 0, exercises, ...extra
});
