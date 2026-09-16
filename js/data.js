/* ============================================================
   Data in and out: DVD1 share/backup codes (base64url JSON), template and
   folder import with validation, full-state restore (applyBak), CSV export,
   and GitHub cloud sync (push after checkpoints + one-tap restore).
   The GitHub token never enters backup payloads.
   ============================================================ */
'use strict';

/* ======================= SHARE CODES ======================= */
function encodeShare(obj){
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return 'DVD1.' + b64;
}
function decodeShare(code){
  try{
    let b64 = code.trim().replace(/^DVD1\./,'').replace(/-/g,'+').replace(/_/g,'/');
    while(b64.length % 4) b64 += '=';
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  }catch(e){ return null; }
}
function shareTpl(id){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  const payload = { t:'tpl', name:d.name,
    ex: d.ex.map(e=>{ lvlSyncBack(e); return { k:e.k, n:e.n||exName(e.k), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0, alts:(e.alts||[]), pnote:e.pnote||'', ...(e.rt?{rt:e.rt}:{}), ...(e.x2?{x2:1}:{}), ...(e.base?{base:e.base}:{}), ...(e.dp?{dp:e.dp}:{}), ...(lvlsOf(e)?{ lvls:e.lvls.map(v=>({ k:v.k, n:v.n||exName(v.k), s:v.s, r:v.r, m:(exInfo(v.k)||{}).m||0 })), lvl:e.lvl||0 }:{}) }; }) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('tplShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('tplShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">${ACT_ICONS.copy} ${t('copy')}</button>`);
}
/* full-data payload for backup codes AND cloud sync - the GitHub token itself is
   deliberately NOT here: backup codes get pasted around, the token must never travel */
function bakPayload(){
  return { t:'bak', s:{ unit:S.unit, theme:S.theme, skin:S.skin, keepAwake:S.keepAwake, plates:S.plates,
    restTarget:S.restTarget, restSound:S.restSound,
    folders:S.folders, customEx:S.customEx, templates:S.templates, history:S.history, weights:S.weights,
    trackedLifts:S.trackedLifts, deloads:S.deloads, mainFolder:S.mainFolder, mbase:S.mbase,
    goals:S.goals, dlEvery:S.dlEvery, waves:S.waves,
    /* the quiet bookkeeping too, so a restore does not re-nag every snoozed card */
    lastActive:S.lastActive, lastBackup:S.lastBackup, bakSnooze:S.bakSnooze,
    stallSnooze:S.stallSnooze, dlSnooze:S.dlSnooze, dlaSnooze:S.dlaSnooze, a2hsOff:S.a2hsOff } };
}
function copyBackup(){
  S.lastBackup = Date.now();
  save();
  copyText(encodeShare(bakPayload()));
}

/* ---- CSV export (tidy data for analysis: one row = one set, kg, ISO dates) ---- */
function csvEsc(v){
  v = (v==null) ? '' : String(v);
  return /[",\n\r]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v;
}
function csvBuild(rows){
  return rows.map(r=>r.map(csvEsc).join(',')).join('\r\n');
}
function buildSetsCSV(){
  const u = unitL(); /* export in the user's display unit; column names carry it */
  const rows = [['date','workout_name','deload','archived','duration_sec',
    'exercise','exercise_key','muscle_group','equipment','exercise_position','completion_order',
    'set_number','set_type','is_time_exercise','is_dumbbell_pair','weight_'+u,'reps_or_seconds',
    'bodyweight_'+u,'machine_base_'+u,'total_'+u,'volume_'+u,'note']];
  for(let i=S.history.length-1; i>=0; i--){ /* oldest first - chronological for analysis */
    const w = S.history[i];
    w.exercises.forEach((e,ei)=>{
      const info = exInfo(e.k);
      const tm = isTimeEx(e.k), bw = isBwEx(e.k);
      e.sets.forEach((s,si)=>{
        const type = s.warm ? 'warmup'
                   : e.max ? (s.reps>0 ? 'max_attempt' : 'max_miss')
                   : s.drop ? 'dropset' : s.fail ? 'failure' : 'work';
        /* THE total-load formula, same as woVolume / sessionE1rm: paired dumbbells
           doubled, machine base and (on bodyweight lifts) the body weight added */
        const total = s.weight*(e.x2?2:1) + (bw ? (e.bw||0) : 0) + (e.mb||0);
        rows.push([w.date, w.name, w.dl?1:0, w.arch?1:0, w.dur||'',
          e.name, e.k||'', info?info.g:'', info?info.e:'', ei+1, e.order||'',
          si+1, type, tm?1:0, e.x2?1:0, kg2u(s.weight), s.reps,
          (bw && e.bw!=null)?kg2u(e.bw):'', e.mb?kg2u(e.mb):'', kg2u(total),
          tm?'':Math.round(kg2u(total)*s.reps*100)/100, e.note||'']);
      });
    });
  }
  return csvBuild(rows);
}
function buildBwCSV(){
  const rows = [['date','weight_'+unitL()]];
  for(let i=S.weights.length-1; i>=0; i--) rows.push([S.weights[i].date, kg2u(S.weights[i].kg)]);
  return csvBuild(rows);
}
/* iPhone PWA: prefer the share sheet (save to Files/AirDrop); fall back to a download link */
async function exportCSV(kind){
  const sets = kind==='sets';
  if(sets ? !S.history.length : !S.weights.length){ toast(t('csvEmpty')); return; }
  const name = 'daveedus-' + (sets?'sets':'bodyweight') + '-' + new Date().toISOString().slice(0,10) + '.csv';
  const text = '﻿' + (sets ? buildSetsCSV() : buildBwCSV()); /* BOM so Excel reads UTF-8 */
  const blob = new Blob([text], { type:'text/csv;charset=utf-8' });
  try{
    const file = new File([blob], name, { type:'text/csv' });
    if(navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ files:[file] });
      return;
    }
  }catch(e){ if(e && e.name==='AbortError') return; /* user closed the sheet */ }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}
/* nag when there is real data but no recent backup (localStorage is fragile on iOS) */
function needBackupReminder(){
  if(ghOn()) return false; /* cloud sync already backs up every checkpoint - no nagging */
  if(S.history.length < 5) return false;
  const D = 24*3600*1000;
  return (Date.now()-(S.lastBackup||0) > 21*D) && (Date.now()-(S.bakSnooze||0) > 7*D);
}
function openImportModal(kind){
  const hint = kind==='bak' ? t('bakHint') : t('tplImportHint');
  openModal(`<h3>${t('tplImportTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${hint}</div>
    <textarea class="codebox" id="import-code" placeholder="DVD1...."></textarea>
    <button class="btn primary" style="margin-top:12px" onclick="doImport()">${t('tplImportBtn')}</button>`);
  setTimeout(()=>{ const i=$('#import-code'); if(i) i.focus(); }, 50);
}
/* resolve a shared exercise key: known id as-is, otherwise match by name or
   register the friend's custom exercise locally; null = unusable entry */
function importExKey(k, n, m){
  if(exInfo(k)) return k;
  const existing = allExercises().find(x=>x.n.toLowerCase()===String(n||'').toLowerCase());
  if(existing) return existing.id;
  if(!n) return null;
  const info = { id:'custom-'+uid(), n:String(n).slice(0,60), g:'other', e:'other' };
  if(m==='t') info.m = 't';
  S.customEx.push(info);
  return info.id;
}
function importTplPayload(d, folderId){
  const tpl = { id:uid(), name:String(d.name||t('tplDefaultName')).slice(0,60),
                folderId:folderId||null, ex:[] };
  for(const e of (d.ex||[])){
    const k = importExKey(e.k, e.n, e.m);
    if(!k) continue;
    const alts = Array.isArray(e.alts) ? e.alts.filter(a=>exInfo(a) && a!==k) : [];
    const rt = (typeof e.rt==='number' && e.rt>=15 && e.rt<=1800) ? Math.round(e.rt/15)*15 : 0;
    /* a machine base belongs to a machine - on a bodyweight or timed lift it would
       count twice (base plus body) everywhere totals are summed */
    const base = (typeof e.base==='number' && e.base>0 && e.base<=500 && !isBwEx(k) && !isTimeEx(k)) ? Math.round(e.base*10)/10 : 0;
    const dp = (typeof e.dp==='number' && e.dp>0 && e.dp<=10) ? Math.round(e.dp*1000)/1000 : 0;
    const entry = { id:uid(), k, s:Math.max(1,Math.min(12,e.s|0||3)), r:normReps(e.r, isTimeEx(k)?600:50), ss:!!e.ss, alts, pnote:String(e.pnote||'').slice(0,200), ...(rt?{rt}:{}), ...(e.x2?{x2:true}:{}), ...(base?{base}:{}), ...(dp?{dp}:{}) };
    /* progression ladder: validate each level, keep the sender's current rung */
    if(Array.isArray(e.lvls) && e.lvls.length>1){
      const lvls = [];
      for(const v of (e.lvls||[])){
        if(!v || typeof v!=='object') continue;
        const vk = importExKey(v.k, v.n, v.m);
        if(!vk) continue;
        const lbl = (v.n && exName(vk)!==v.n) ? String(v.n).slice(0,60) : '';
        lvls.push({ k:vk, s:Math.max(1,Math.min(12,v.s|0||3)), r:normReps(v.r, isTimeEx(vk)?600:50), ...(lbl?{n:lbl}:{}) });
      }
      if(lvls.length>1){
        const li = Math.max(0, Math.min(lvls.length-1, e.lvl|0));
        entry.lvls = lvls; entry.lvl = li; entry.lvlN = 0;
        entry.k = lvls[li].k; entry.s = lvls[li].s; entry.r = lvls[li].r; /* mirror the current level */
        if(lvls[li].n) entry.n = lvls[li].n;
      }
    }
    tpl.ex.push(entry);
  }
  S.templates.push(tpl);
  return tpl;
}
/* replace all data from a bak payload (backup code or cloud backup.json);
   this device's cloud-sync setup survives - backup payloads never carry it.
   fromCloud: the data IS the cloud copy, so the device is in sync afterwards -
   nothing pending, nothing pushed back (that push made an empty commit). A
   backup CODE is different: the cloud still holds the old data, so it syncs. */
function applyBak(d, fromCloud){
  /* everything below is validation-tolerant: hydrate() repairs/validates every
     field (arrays filtered, objects checked), so a malformed backup can neither
     throw here nor brick the app; only the pre-folder migration is done first */
  if(!Array.isArray(d.s.folders) && Array.isArray(d.s.templates)){ /* backup from pre-split version */
    const fid = uid();
    d.s.folders = [{ id:fid, name:'Upper / Lower', open:true }];
    d.s.templates.forEach(tp=>{ if(tp && !tp.folderId) tp.folderId=fid; });
  }
  const gh = { ghRepo:S.ghRepo, ghToken:S.ghToken, ghLast:S.ghLast, ghDirty:S.ghDirty };
  if(fromCloud){ gh.ghDirty = 0; gh.ghLast = Date.now(); }
  const next = hydrate(Object.assign({}, d.s, { active:null, onboarded:1 }, gh));
  if(!next){ toast(t('codeBad')); return; }
  /* the state being replaced is parked, not destroyed - a wrong restore is undoable by hand */
  try{ localStorage.setItem(LS_KEY+'.bad', JSON.stringify(S)); }catch(e){}
  S = next;
  save();
  if(!fromCloud) scheduleCloudSync();
  else updateGhStatus();
  applyTheme(); closeModal();
  go('home');
  toast(t('bakDone'));
}
function doImport(){
  try{ doImportInner(); }catch(e){ toast(t('codeBad')); } /* a hostile payload gets a toast, never a stuck modal */
}
function doImportInner(){
  const code = $('#import-code').value;
  const d = decodeShare(code);
  if(!d || !d.t){ toast(t('codeBad')); return; }
  if(d.t==='tpl' && Array.isArray(d.ex)){
    const tpl = importTplPayload(d, null);
    save(); closeModal();
    go('program');
    toast(t('tplImported',{n:tpl.name}));
  }else if(d.t==='folder' && Array.isArray(d.tpls)){
    const f = { id:uid(), name:String(d.name||t('folderDefault')).slice(0,60), open:true, ...(d.free?{free:true}:{}) };
    S.folders.push(f);
    d.tpls.forEach(x=>importTplPayload(x, f.id));
    save(); closeModal();
    go('program');
    toast(t('folderImported',{n:f.name}));
  }else if(d.t==='bak' && d.s && typeof d.s==='object'){
    ask(t(S.active ? 'bakConfirmActive' : 'bakConfirm'), t('bakRestoreOk'), ()=>applyBak(d), { danger:true });
  }else{
    toast(t('codeBad'));
  }
}

/* ======================= cloud sync (GitHub) =======================
   Optional: pushes bakPayload() as backup.json to the user's own PRIVATE repo
   via the Contents API after meaningful checkpoints (finished workout, body
   weight log, template edits, imports). The token is entered by the user, lives
   only in this device's storage and is excluded from backup codes. */
const GH_FILE = 'backup.json';
/* ghSeq counts checkpoints. cloudSync remembers the value its payload was built
   from, so a workout finished WHILE an upload is in flight cannot be marked
   synced by that upload - see the dirty check at the end of cloudSync. */
let ghTimer = null, ghBusy = false, ghSeq = 0;
function ghOn(){ return !!(S.ghToken && S.ghRepo); }
function ghHdr(){ return { 'Authorization':'Bearer '+S.ghToken, 'Accept':'application/vnd.github+json' }; }
/* mark: this state must reach the cloud (bumps the checkpoint counter) */
function ghMark(){
  ghSeq++;
  if(!S.ghDirty){ S.ghDirty = 1; save(); }
}
function scheduleCloudSync(){
  if(!ghOn()) return;
  ghMark();
  clearTimeout(ghTimer);
  ghTimer = setTimeout(cloudSync, 4000);
}
/* the sha git - and so the Contents API - reports for a file holding exactly this
   text. Equal shas mean the cloud already has this snapshot. null when the
   browser has no WebCrypto (an insecure context): then we simply upload. */
async function gitBlobSha(text){
  try{
    const enc = new TextEncoder();
    const body = enc.encode(text), head = enc.encode('blob '+body.length+'\0');
    const buf = new Uint8Array(head.length + body.length);
    buf.set(head); buf.set(body, head.length);
    const h = await crypto.subtle.digest('SHA-1', buf);
    return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){ return null; }
}
/* upload one file; false = the cloud already held exactly this, no commit made */
async function ghPut(path, content){
  const api = 'https://api.github.com/repos/'+S.ghRepo+'/contents/'+path;
  let sha = null;
  /* GitHub sends authenticated API responses as private/max-age=60: a cached
     reply here hands back a stale sha, and the PUT that follows is rejected as
     a conflict. Two syncs inside a minute (finish a workout, log body weight)
     is completely normal, so this read must always hit the network. */
  const g = await fetch(api, { headers:ghHdr(), cache:'no-store' });
  if(g.status===200) sha = (await g.json()).sha;
  else if(g.status!==404) throw new Error('HTTP '+g.status);
  /* a sync with nothing new used to make an empty commit - after a restore,
     a retry, a Sync now tap. The repo should only move when the data does. */
  if(sha && sha === await gitBlobSha(content)) return false;
  const body = { message:'daveedus sync '+new Date().toISOString(),
    content: btoa(unescape(encodeURIComponent(content))) };
  if(sha) body.sha = sha;
  const p = await fetch(api, { method:'PUT', headers:ghHdr(), body:JSON.stringify(body) });
  if(!p.ok) throw new Error('HTTP '+p.status);
  return true;
}
/* force = the lifter chose to replace the cloud backup with this device's data */
async function cloudSync(force){
  if(!ghOn() || ghBusy || !navigator.onLine) { updateGhStatus(); return; }
  ghBusy = true; V.gh = 'sync'; updateGhStatus();
  const seq = ghSeq;   /* the checkpoint the payload below actually carries */
  let ok = false;
  try{
    /* A device that has never synced with this repo must not replace a backup
       that is already there - a fresh device holding nothing once emptied the
       cloud copy. Ask instead (once per session): restore it here, or
       replace it on purpose. Unknown (network trouble) counts as "do not". */
    if(!S.ghLast && force!==true){
      const has = await ghHasBackup(S.ghRepo, S.ghToken);
      if(has !== false){
        ghBusy = false;
        V.gh = 'err'; updateGhStatus();
        if(has === true && !V.ghConflictAsked){
          V.ghConflictAsked = true;
          ask(t('ghConflict'), t('ghRestoreOk'), ()=>ghRestore(true),
            { alt:{ label:t('ghConflictUpload'), fn:()=>cloudSync(true) } });
        }
        return;
      }
    }
    const payload = bakPayload();
    /* two files, same data: JSON for machines, a ready-to-paste DVD1 code for
       disaster recovery - open the repo on any device, copy, Load backup code */
    await ghPut(GH_FILE, JSON.stringify(payload, null, 1));
    await ghPut('backup-code.txt', encodeShare(payload));
    ok = true;
    /* Clearing the flag unconditionally used to lose a workout: anything logged
       during these two round trips is not in `payload`, yet the flag said clean
       and the pill said "synced" - so the cloud (and the journal reading it)
       silently kept yesterday's data until some later checkpoint. */
    if(seq === ghSeq) S.ghDirty = 0;
    S.ghLast = Date.now(); save();
    V.gh = 'ok';
  }catch(e){ V.gh = 'err'; }
  ghBusy = false;
  /* chase our own tail ONLY after a successful push - a failed one waits for the
     next checkpoint instead of hammering a dead network every few seconds */
  if(ok && S.ghDirty){ clearTimeout(ghTimer); ghTimer = setTimeout(cloudSync, 1500); }
  updateGhStatus();
}
/* one-time connect: verify the repo is reachable with this token - and NOTHING
   else. Connecting must never upload: people connect on a fresh phone to GET
   their data back, and an immediate push would overwrite the cloud copy with
   whatever this device happens to hold (an empty log), making Restore useless.
   The first push happens after the next finished workout, or on Sync now. */
async function ghConnect(){
  const repo = ($('#gh-repo')||{}).value, tok = ($('#gh-token')||{}).value;
  if(!repo || !repo.trim() || !tok || !tok.trim()){ toast(t('ghBad')); return; }
  const btn = $('#gh-connect'); if(btn) btn.disabled = true;
  try{
    const rep = repo.trim(), tk = tok.trim();
    const r = await fetch('https://api.github.com/repos/'+rep,
      { headers:{ 'Authorization':'Bearer '+tk, 'Accept':'application/vnd.github+json' } });
    if(!r.ok) throw new Error('HTTP '+r.status);
    const meta = await r.json();
    if(!meta.private){
      if(btn) btn.disabled = false;
      ask(t('ghPublicWarn'), t('ghPublicOk'), ()=>ghFinishConnect(rep, tk).catch(()=>toast(t('ghBad'))), { danger:true });
      return;
    }
    await ghFinishConnect(rep, tk);
  }catch(e){
    if(btn) btn.disabled = false;
    toast(t('ghBad'));
  }
}
/* a backup already up there is the reason most people connect - offer it, and
   upload nothing. An EMPTY repo is the opposite case: this device holds the only
   copy, so push it. The check runs with the repo and token just typed - it once
   ran before they were stored, asked GitHub about "repos//", always heard "no
   backup", and uploaded the new device's data over the real one. */
async function ghFinishConnect(rep, tk){
  const has = await ghHasBackup(rep, tk);
  if(has === null) throw new Error('backup check failed'); /* unknown is not "empty" */
  S.ghRepo = rep; S.ghToken = tk; S.ghDirty = has ? 0 : 1;
  save(); render();
  toast(t('ghOkToast'));
  if(has) ask(t(S.active ? 'bakConfirmActive' : 'ghFoundRestore'), t('ghRestoreOk'), ()=>ghRestore(true), { danger:true });
  else cloudSync(true);
}
/* does the repo already hold a backup? true / false, or null when GitHub could
   not be asked (offline, token refused) - callers must never read null as "no" */
async function ghHasBackup(repo, token){
  try{
    const r = await fetch('https://api.github.com/repos/'+repo+'/contents/'+GH_FILE,
      { headers:{ 'Authorization':'Bearer '+token, 'Accept':'application/vnd.github+json' }, cache:'no-store' });
    return r.status === 200 ? true : r.status === 404 ? false : null;
  }catch(e){ return null; }
}
/* new phone / reinstall: pull the latest cloud backup and restore it in one tap.
   skipAsk = the caller already asked (the connect flow) */
async function ghRestore(skipAsk){
  if(!ghOn() || V.ghRestoring) return;
  if(!skipAsk){
    ask(t(S.active ? 'bakConfirmActive' : 'ghRestoreConfirm'), t('ghRestoreOk'), ()=>ghRestore(true), { danger:true });
    return;
  }
  V.ghRestoring = true;
  toast(t('ghRestoring')); /* a download takes a moment - never let a tap look like nothing */
  try{
    if(!navigator.onLine) throw new Error('offline');
    const r = await fetch('https://api.github.com/repos/'+S.ghRepo+'/contents/'+GH_FILE,
      { headers:{ 'Authorization':'Bearer '+S.ghToken, 'Accept':'application/vnd.github.raw+json' },
        cache:'no-store' }); /* never restore a minute-old cached copy */
    if(!r.ok) throw new Error(r.status===404 ? 'none' : (r.status===401 || r.status===403) ? 'auth' : 'HTTP '+r.status);
    let d = null;
    try{ d = await r.json(); }catch(e){}
    if(!d || d.t!=='bak' || !d.s || typeof d.s!=='object') throw new Error('bad');
    applyBak(d, true);
  }catch(e){
    const m = e && e.message;
    const why = m==='none' ? t('ghWhyNone') : m==='auth' ? t('ghWhyAuth')
              : m==='offline' ? t('ghWhyOffline') : m==='bad' ? t('ghWhyBad') : (m || '?');
    toast(t('ghRestoreFail', { why }));
  }
  V.ghRestoring = false;
}
function ghDisconnect(){
  ask(t('ghOffConfirm'), t('ghOff'), ()=>{
    S.ghToken = ''; S.ghRepo = ''; S.ghDirty = 0; S.ghLast = 0;
    V.ghConflictAsked = false;
    save(); render();
  }, { danger:true });
}
/* quiet cloud pill for the Home hero row: pending / syncing / synced HH:MM.
   Tap = push now. Nothing renders when sync is not set up. */
function syncPillHtml(){
  if(!ghOn()) return '';
  let cls = 'ok', txt;
  if(V.gh==='sync'){ cls = 'busy'; txt = t('ghSyncing'); }
  else if(S.ghDirty || V.gh==='err'){ cls = 'dirty'; txt = t('syncPending'); }
  else if(S.ghLast){
    const d = new Date(S.ghLast);
    const today = new Date().toDateString()===d.toDateString();
    txt = t('syncedAt',{t: today ? fmtClock(S.ghLast) : fmtDate(d.toISOString())});
  }else txt = t('ghNever');
  return `<button class="syncpill ${cls}" id="home-sync" onclick="syncNowTap()">${txt}</button>`;
}
function syncNowTap(){
  if(!ghOn() || ghBusy) return;
  ghMark(); /* an explicit tap is a checkpoint too - it must not ride an in-flight payload */
  V.ghConflictAsked = false; /* an explicit tap may ask again */
  return cloudSync();
}
/* backgrounding: the debounced push may never get its 4 seconds - try NOW,
   best effort; if the request dies with the page, ghDirty stays set and the
   next open retries from boot */
function flushCloudSync(){
  if(!ghOn() || !S.ghDirty || ghBusy || !navigator.onLine) return;
  clearTimeout(ghTimer);
  cloudSync();
}
function updateGhStatus(){
  /* the Home pill mirrors the Settings line - refresh it wherever it is up */
  const hp = $('#home-sync');
  if(hp) hp.outerHTML = syncPillHtml();
  const el = $('#gh-status');
  if(!el) return;
  if(V.gh==='sync'){ el.textContent = t('ghSyncing'); el.style.color = 'var(--dim)'; return; }
  if(V.gh==='err' || S.ghDirty){ el.textContent = t('ghErr'); el.style.color = 'var(--orange)'; return; }
  if(S.ghLast){
    const d = new Date(S.ghLast);
    const today = new Date().toDateString()===d.toDateString();
    el.textContent = t('ghLastSync')+' '+(today ? fmtClock(S.ghLast) : fmtDate(d.toISOString()));
    el.style.color = 'var(--green)';
  }else{ el.textContent = t('ghNever'); el.style.color = 'var(--dim)'; }
}
window.addEventListener('online', ()=>{ if(S.ghDirty) scheduleCloudSync(); });

