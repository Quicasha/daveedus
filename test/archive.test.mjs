/* Program archive: an old program moves out of the way without losing a thing.
   The rules pinned here: an archived program leaves the Programs list and
   Home, never anchors the main-program role (weekday plan, deload), keeps its
   workouts, history and comparison column, and comes back with one tap -
   without taking the star from the program that holds it now. */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { makeApp } from './harness.mjs';

const plain = v => JSON.parse(JSON.stringify(v));
/* screens render icons from ui.js (not loaded by the harness): each icon
   becomes its own name in brackets, so a test can see which buttons drew */
const withScreens = app => {
  app.ACT_ICONS = new Proxy({}, { get: (_, k) => `[${String(k)}]` });
  vm.runInContext(fs.readFileSync(new URL('../js/home.js', import.meta.url), 'utf8'), app, { filename: 'js/home.js' });
  return app;
};
/* the seeded Upper / Lower (A) plus a second rotation program PPL (B) */
const twoPrograms = () => {
  const app = withScreens(makeApp());
  const A = app.S.folders.find(f => !f.free);
  app.S.folders.push({ id: 'fB', name: 'PPL', open: true, pinned: true });
  app.S.templates.push({ id: 'tB', name: 'Push Day', folderId: 'fB', ex: [{ k: 'bench-press', s: 3, r: '5' }] });
  return { app, A, B: app.S.folders.find(f => f.id === 'fB') };
};
const undoable = app => { app.undoToast = (msg, restore) => { app.__undo = restore; }; return app; };

describe('archiving a program', () => {
  test('it leaves Home and the main role, and coming back never steals the star', () => {
    const { app, A, B } = twoPrograms();
    assert.equal(app.mainFolderId(), A.id, 'the first program is main before');
    app.archiveFolder(A.id);
    assert.ok(A.arch);
    assert.deepEqual(app.activeFolders().map(f => f.id), app.S.folders.filter(f => f !== A).map(f => f.id));
    assert.equal(app.mainFolderId(), B.id, 'the weekday plan and deload move to the program still in use');
    const home = app.htmlHome();
    assert.ok(!home.includes(A.name), 'not on Home');
    assert.ok(home.includes('Push Day'));
    app.restoreFolder(A.id);
    assert.ok(!A.arch);
    assert.equal(app.mainFolderId(), B.id, 'restoring an old program leaves the star where it is');
    assert.ok(app.htmlHome().includes(A.name), 'back on Home, pinned as before');
  });
  test('Undo puts the program and the starred choice back exactly', () => {
    const { app, A, B } = twoPrograms();
    undoable(app);
    app.S.mainFolder = A.id;
    app.archiveFolder(A.id);
    assert.equal(app.S.mainFolder, B.id);
    app.__undo();
    assert.ok(!A.arch);
    assert.equal(app.S.mainFolder, A.id);
  });
  test('archiving a program that is not main changes nothing about the star', () => {
    const { app, A, B } = twoPrograms();
    undoable(app);
    app.archiveFolder(B.id);
    assert.equal(app.S.mainFolder, null);
    assert.equal(app.mainFolderId(), A.id);
    app.__undo();
    assert.ok(!B.arch);
    assert.equal(app.S.mainFolder, null);
  });
  test('workouts and the comparison keep the archived program', () => {
    const { app, A } = twoPrograms();
    const tpls = app.S.templates.filter(tp => tp.folderId === A.id).length;
    app.archiveFolder(A.id);
    assert.equal(app.S.templates.filter(tp => tp.folderId === A.id).length, tpls, 'its workouts stay in it');
    assert.ok(app.S.folders.includes(A), 'the program itself is kept');
  });
});

describe('the Programs screen', () => {
  test('archived programs wait in a closed Archive fold at the bottom', () => {
    const { app, A } = twoPrograms();
    app.archiveFolder(A.id);
    const closed = app.htmlProgram();
    assert.ok(!closed.includes(A.name), 'not in the main list, and the fold starts closed');
    assert.ok(closed.includes('Archive (1)'));
    assert.ok(closed.includes("archiveFolder('fB')"), 'programs in use carry the archive button');
    app.V.progArch = true;
    const open = app.htmlProgram();
    assert.ok(open.includes(A.name));
    assert.ok(open.includes(`restoreFolder('${A.id}')`), 'an archived row offers Restore');
    assert.ok(!open.includes(`togglePin('${A.id}')`), 'pinning an archived program means nothing');
  });
  test('no archive, no fold', () => {
    const { app } = twoPrograms();
    assert.ok(!app.htmlProgram().includes('Archive ('));
  });
  test('an archived program opens for viewing and says how to bring it back', () => {
    const { app, A } = twoPrograms();
    app.archiveFolder(A.id);
    app.V.viewFolder = A.id;
    const view = app.htmlSplitView();
    assert.ok(view.includes(app.T.folderArchNote));
    assert.ok(view.includes(`restoreFolder('${A.id}')`));
    assert.ok(!view.includes(`archiveFolder('${A.id}')`));
    app.V.viewFolder = 'fB';
    assert.ok(app.htmlSplitView().includes("archiveFolder('fB')"));
  });
  test("a workout's program picker hides archived programs, except its own", () => {
    const { app, A } = twoPrograms();
    app.archiveFolder(A.id);
    app.V.editTpl = 'tB';
    assert.ok(!app.htmlTplEdit().includes(`value="${A.id}"`));
    app.V.editTpl = app.S.templates.find(tp => tp.folderId === A.id).id;
    assert.match(app.htmlTplEdit(), new RegExp(`value="${A.id}" selected`));
  });
});

describe('where the flag travels', () => {
  test('a backup keeps it', () => {
    const { app, A } = twoPrograms();
    app.archiveFolder(A.id);
    const next = app.hydrate(plain(app.bakPayload().s));
    assert.ok(next.folders.find(f => f.id === A.id).arch);
  });
});
