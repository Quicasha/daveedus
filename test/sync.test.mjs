/* Cloud sync between devices, and the questions the app asks. Pinned here:
   - every question is the app's own sheet: a browser that swallows
     window.confirm (answering Cancel without showing anything) once turned
     Restore, Finish and Cancel into silent no-ops;
   - a device that has never synced must not replace a backup already in the
     cloud - connecting a fresh device once emptied the cloud copy;
   - a restore leaves the device in sync, and an unchanged snapshot makes no
     commit, so the repo only moves when training data does. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeApp, fakeGitHub, readAppSource, blobSha, set, exEntry, workout } from './harness.mjs';

const settle = async (n = 20) => { for (let i = 0; i < n; i++) await new Promise(r => setImmediate(r)); };
const sessions = n => Array.from({ length: n }, (_, i) => workout(i + 1, [exEntry('bench-press', [set(100, 5)])]));
/* the phone: three workouts, already synced to the cloud */
const phoneWithBackup = async () => {
  const phone = makeApp();
  const gh = fakeGitHub(phone);
  phone.S.history = sessions(3);
  phone.scheduleCloudSync();
  await phone.cloudSync();
  phone.__stopTimers();
  return { phone, gh };
};
/* a second device typing the repo and token into Settings */
const typeCredentials = (app, gh) => {
  app.S.ghRepo = ''; app.S.ghToken = '';
  const inputs = { '#gh-repo': { value: gh.repo }, '#gh-token': { value: gh.token } };
  app.document.querySelector = sel => inputs[sel] || null;
};

describe('questions', () => {
  test('the app never depends on a native browser dialog', () => {
    const code = readAppSource()
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    const hits = code.match(/(^|[^\w.$])(confirm|alert|prompt)\s*\(/g) || [];
    assert.deepEqual(hits, [], 'window.confirm can answer Cancel without showing anything');
  });
  test('Finish with sets left asks in the app; Back keeps the workout going', () => {
    const app = makeApp();
    app.ACT_ICONS = new Proxy({}, { get: () => '' });
    app.startWorkout(app.S.templates[0].id);
    const ex = app.S.active.exercises[0];
    ex.sets[0].w = '100'; ex.sets[0].r = '5';
    app.toggleSet(0, 0);
    app.__askAnswer = false;
    app.finishWorkout();
    assert.equal(app.__asks.length, 1);
    assert.ok(app.S.active, 'still training');
    assert.equal(app.S.history.length, 0);
    app.__askAnswer = true;
    app.finishWorkout();
    assert.equal(app.S.active, null);
    assert.equal(app.S.history.length, 1);
  });
  test('Cancel workout asks too; Back keeps it', () => {
    const app = makeApp();
    app.startWorkout(app.S.templates[0].id);
    app.__askAnswer = false;
    app.cancelWorkout();
    assert.ok(app.S.active);
    app.__askAnswer = true;
    app.cancelWorkout();
    assert.equal(app.S.active, null);
  });
});

describe('restore from the cloud', () => {
  test('shows what the cloud holds before anything is replaced; Back changes nothing', async () => {
    const { gh } = await phoneWithBackup();
    const laptop = makeApp();
    fakeGitHub(laptop, { files: gh.files });
    laptop.S.history = sessions(1);
    laptop.__askAnswer = false;
    await laptop.ghRestore();
    assert.equal(laptop.__asks.length, 1);
    assert.match(laptop.__asks[0], /me\/daveedus-data/, 'the question names the repo');
    assert.match(laptop.__asks[0], /\b3 workouts\b/, 'and how much it holds');
    assert.equal(laptop.S.history.length, 1, 'Back leaves this device exactly as it was');
  });
  test('a backup without a single workout says so before it can empty this device', async () => {
    const empty = makeApp();
    const gh = fakeGitHub(empty);
    empty.scheduleCloudSync();
    await empty.cloudSync();                          /* an empty device pushed its empty state */
    empty.__stopTimers();
    const laptop = makeApp();
    fakeGitHub(laptop, { files: gh.files });
    laptop.__askAnswer = false;
    await laptop.ghRestore();
    assert.match(laptop.__asks[0], /no workouts/i);
    assert.match(laptop.__asks[0], /right repo/i);
  });
  test('yes brings the other device\'s workouts, and nothing is pushed back', async () => {
    const { gh } = await phoneWithBackup();
    const laptop = makeApp();
    const lgh = fakeGitHub(laptop, { files: gh.files });
    const puts = gh.puts + lgh.puts;
    let pushes = 0;
    laptop.scheduleCloudSync = () => { pushes++; };
    const toasts = [];
    laptop.toast = m => toasts.push(m);
    await laptop.ghRestore();
    await settle();
    assert.equal(laptop.S.history.length, 3);
    assert.match(toasts[toasts.length - 1], /3 workouts/, 'the confirmation says what arrived');
    assert.equal(laptop.S.ghDirty, 0, 'the device now holds exactly what the cloud holds');
    assert.ok(laptop.S.ghLast > 0, 'and counts as synced');
    assert.equal(pushes, 0, 'a restore does not upload the same data straight back');
    assert.equal(lgh.puts, puts - gh.puts);
    laptop.__stopTimers();
  });
  test('a failed download says why instead of doing nothing', async () => {
    const laptop = makeApp();
    fakeGitHub(laptop);                               /* empty repo: no backup.json */
    const toasts = [];
    laptop.toast = m => toasts.push(m);
    await laptop.ghRestore(true);
    assert.equal(toasts.length, 2, 'one while downloading, one with the reason');
    assert.match(toasts[1], /no backup/i);
  });
});

describe('a second device joining', () => {
  test('connecting to a repo that already has a backup never uploads over it', async () => {
    const { gh } = await phoneWithBackup();
    const laptop = makeApp();
    fakeGitHub(laptop, { files: gh.files });
    typeCredentials(laptop, gh);
    laptop.__askAnswer = false;                       /* not now */
    const before = gh.files.get('backup.json').sha;
    await laptop.ghConnect();
    await settle();
    await laptop.cloudSync();
    assert.equal(laptop.S.ghRepo, gh.repo);
    assert.equal(laptop.__asks.length >= 1, true, 'the backup is offered');
    assert.equal(gh.files.get('backup.json').sha, before, 'the phone\'s backup is untouched');
    assert.equal(JSON.parse(gh.files.get('backup.json').text).s.history.length, 3);
    laptop.__stopTimers();
  });
  test('connecting and accepting restores the backup', async () => {
    const { gh } = await phoneWithBackup();
    const laptop = makeApp();
    fakeGitHub(laptop, { files: gh.files });
    typeCredentials(laptop, gh);
    await laptop.ghConnect();
    await settle();
    assert.equal(laptop.S.history.length, 3);
    laptop.__stopTimers();
  });
  test('connecting to a repo that holds another app\'s files asks first; Back does not connect', async () => {
    const files = new Map([
      ['README.md', { text: '# data', sha: 'r' }],
      ['data/state.json', { text: '{}', sha: 's' }]
    ]);
    const laptop = makeApp();
    const gh = fakeGitHub(laptop, { files });
    laptop.S.history = sessions(2);
    typeCredentials(laptop, gh);
    laptop.__askAnswer = false;
    await laptop.ghConnect();
    await settle();
    assert.equal(laptop.__asks.length, 1);
    assert.match(laptop.__asks[0], /me\/daveedus-data/);
    assert.match(laptop.__asks[0], /\bdata\b/, 'it names what is already there');
    assert.equal(laptop.S.ghRepo, '', 'not connected');
    assert.equal(files.has('backup.json'), false, 'and nothing uploaded');
    laptop.__stopTimers();
  });
  test('the sync fields opt out of browser autofill - two apps share one origin', () => {
    const src = readAppSource();
    assert.match(src, /id="gh-repo"[^>]*autocomplete="off"/);
    assert.match(src, /id="gh-token"[^>]*autocomplete="new-password"/);
  });
  test('connecting to an EMPTY repo uploads this device - it holds the only copy', async () => {
    const laptop = makeApp();
    const gh = fakeGitHub(laptop);
    laptop.S.history = sessions(2);
    typeCredentials(laptop, gh);
    await laptop.ghConnect();
    await settle();
    assert.equal(JSON.parse(gh.files.get('backup.json').text).s.history.length, 2);
    laptop.__stopTimers();
  });
  test('a device that never synced asks before replacing a backup that is already there', async () => {
    const { gh } = await phoneWithBackup();
    const laptop = makeApp();
    fakeGitHub(laptop, { files: gh.files });          /* connected earlier, never synced */
    laptop.S.history = sessions(1);
    laptop.__askAnswer = false;
    const before = gh.files.get('backup.json').sha;
    laptop.scheduleCloudSync();
    await laptop.cloudSync();
    assert.equal(gh.files.get('backup.json').sha, before);
    assert.equal(laptop.__asks.length, 1);
    assert.equal(laptop.S.ghDirty, 1, 'still pending - nothing was lost on this device either');
    laptop.__askAnswer = 'alt';                       /* "replace it with this device" */
    laptop.__asks.length = 0;
    await laptop.syncNowTap();
    await settle();
    assert.equal(JSON.parse(gh.files.get('backup.json').text).s.history.length, 1, 'an explicit choice is honoured');
    laptop.__stopTimers();
  });
});

describe('the repo only moves when the data does', () => {
  test('the app computes the same blob sha git does', async () => {
    const app = makeApp();
    assert.equal(await app.gitBlobSha('hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a');
    const text = JSON.stringify({ t: 'bak', s: { name: 'Ąžuolas ✓' } });
    assert.equal(await app.gitBlobSha(text), blobSha(text));
  });
  test('syncing an unchanged snapshot makes no commit', async () => {
    const { phone, gh } = await phoneWithBackup();
    const puts = gh.puts;
    phone.scheduleCloudSync();
    await phone.cloudSync();
    assert.equal(gh.puts, puts, 'same data, no upload');
    assert.equal(phone.S.ghDirty, 0);
    assert.equal(phone.V.gh, 'ok');
    phone.S.weights = [{ id: 'w', date: new Date().toISOString(), kg: 80 }];
    phone.scheduleCloudSync();
    await phone.cloudSync();
    assert.equal(gh.puts, puts + 2, 'new data, both files');
    phone.__stopTimers();
  });
  test('changing the skin is not a data change and starts no sync', () => {
    const app = makeApp();
    fakeGitHub(app);
    app.S.ghDirty = 0;
    app.setSkin('zaza');
    assert.equal(app.S.ghDirty, 0);
    app.__stopTimers();
  });
});
