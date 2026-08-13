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
    ex: d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0, alts:(e.alts||[]), pnote:e.pnote||'', ...(e.rt?{rt:e.rt}:{}), ...(e.x2?{x2:1}:{}), ...(e.base?{base:e.base}:{}), ...(e.dp?{dp:e.dp}:{}) })) };
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
    goals:S.goals, dlEvery:S.dlEvery } };
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
        const type = s.warm ? 'warmup' : s.drop ? 'dropset' : s.fail ? 'failure' : 'work';
        const total = bw ? s.weight + (e.bw||0) : s.weight*(e.x2?2:1) + (e.mb||0);
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
function importTplPayload(d, folderId){
  const tpl = { id:uid(), name:String(d.name||t('tplDefaultName')).slice(0,60),
                folderId:folderId||null, ex:[] };
  for(const e of (d.ex||[])){
    let k = e.k;
    if(!exInfo(k)){
      /* unknown exercise (friend's custom one) - register it locally */
      const existing = allExercises().find(x=>x.n.toLowerCase()===String(e.n||'').toLowerCase());
      if(existing) k = existing.id;
      else if(e.n){
        const info = { id:'custom-'+uid(), n:String(e.n).slice(0,60), g:'other', e:'other' };
        if(e.m==='t') info.m = 't';
        S.customEx.push(info);
        k = info.id;
      } else continue;
    }
    const alts = Array.isArray(e.alts) ? e.alts.filter(a=>exInfo(a) && a!==k) : [];
    const rt = (typeof e.rt==='number' && e.rt>=15 && e.rt<=1800) ? Math.round(e.rt/15)*15 : 0;
    const base = (typeof e.base==='number' && e.base>0 && e.base<=500) ? Math.round(e.base*10)/10 : 0;
    const dp = (typeof e.dp==='number' && e.dp>0 && e.dp<=10) ? Math.round(e.dp*1000)/1000 : 0;
    tpl.ex.push({ id:uid(), k, s:Math.max(1,Math.min(12,e.s|0||3)), r:normReps(e.r, isTimeEx(k)?600:50), ss:!!e.ss, alts, pnote:String(e.pnote||'').slice(0,200), ...(rt?{rt}:{}), ...(e.x2?{x2:true}:{}), ...(base?{base}:{}), ...(dp?{dp}:{}) });
  }
  S.templates.push(tpl);
  return tpl;
}
/* replace all data from a bak payload (backup code or cloud backup.json);
   this device's cloud-sync setup survives - backup payloads never carry it */
function applyBak(d){
  if(!Array.isArray(d.s.folders)){ /* backup from pre-split version */
    const fid = uid();
    d.s.folders = [{ id:fid, name:'Upper / Lower', open:true }];
    d.s.templates.forEach(tp=>{ if(!tp.folderId) tp.folderId=fid; });
  }
  d.s.folders.forEach(f=>{ if(typeof f.pinned==='undefined') f.pinned=true; });
  if(!Array.isArray(d.s.trackedLifts)) delete d.s.trackedLifts; /* keep the [] default */
  if(!Array.isArray(d.s.deloads)) delete d.s.deloads;
  if(!d.s.mbase || typeof d.s.mbase!=='object' || Array.isArray(d.s.mbase)) delete d.s.mbase;
  if(!d.s.goals || typeof d.s.goals!=='object' || Array.isArray(d.s.goals)) delete d.s.goals;
  if(typeof d.s.dlEvery!=='number') delete d.s.dlEvery;
  if(typeof d.s.mainFolder!=='string') delete d.s.mainFolder;
  if(typeof d.s.restTarget!=='number' || !(d.s.restTarget>=15 && d.s.restTarget<=1800)) delete d.s.restTarget;
  if(typeof d.s.restSound!=='boolean') delete d.s.restSound;
  if(!SKIN_META[d.s.skin]) delete d.s.skin;
  const gh = { ghRepo:S.ghRepo, ghToken:S.ghToken, ghLast:S.ghLast, ghDirty:S.ghDirty };
  S = Object.assign(defaultState(), d.s, { active:null, onboarded:1 }, gh);
  save(); scheduleCloudSync(); applyTheme(); closeModal();
  go('home');
  toast(t('bakDone'));
}
function doImport(){
  const code = $('#import-code').value;
  const d = decodeShare(code);
  if(!d || !d.t){ toast(t('codeBad')); return; }
  if(d.t==='tpl' && Array.isArray(d.ex)){
    const tpl = importTplPayload(d, null);
    save(); closeModal();
    go('program');
    toast(t('tplImported',{n:tpl.name}));
  }else if(d.t==='folder' && Array.isArray(d.tpls)){
    const f = { id:uid(), name:String(d.name||t('folderDefault')).slice(0,60), open:true };
    S.folders.push(f);
    d.tpls.forEach(x=>importTplPayload(x, f.id));
    save(); closeModal();
    go('program');
    toast(t('folderImported',{n:f.name}));
  }else if(d.t==='bak' && d.s && Array.isArray(d.s.templates)){
    if(!confirm(t('bakConfirm'))) return;
    applyBak(d);
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
let ghTimer = null, ghBusy = false;
function ghOn(){ return !!(S.ghToken && S.ghRepo); }
function ghHdr(){ return { 'Authorization':'Bearer '+S.ghToken, 'Accept':'application/vnd.github+json' }; }
function scheduleCloudSync(){
  if(!ghOn()) return;
  if(!S.ghDirty){ S.ghDirty = 1; save(); }
  clearTimeout(ghTimer);
  ghTimer = setTimeout(cloudSync, 4000);
}
async function ghPut(path, content){
  const api = 'https://api.github.com/repos/'+S.ghRepo+'/contents/'+path;
  let sha = null;
  const g = await fetch(api, { headers:ghHdr() });
  if(g.status===200) sha = (await g.json()).sha;
  else if(g.status!==404) throw new Error('HTTP '+g.status);
  const body = { message:'daveedus sync '+new Date().toISOString(),
    content: btoa(unescape(encodeURIComponent(content))) };
  if(sha) body.sha = sha;
  const p = await fetch(api, { method:'PUT', headers:ghHdr(), body:JSON.stringify(body) });
  if(!p.ok) throw new Error('HTTP '+p.status);
}
async function cloudSync(){
  if(!ghOn() || ghBusy || !navigator.onLine) { updateGhStatus(); return; }
  ghBusy = true; V.gh = 'sync'; updateGhStatus();
  try{
    const payload = bakPayload();
    /* two files, same data: JSON for machines, a ready-to-paste DVD1 code for
       disaster recovery - open the repo on any device, copy, Load backup code */
    await ghPut(GH_FILE, JSON.stringify(payload, null, 1));
    await ghPut('backup-code.txt', encodeShare(payload));
    S.ghDirty = 0; S.ghLast = Date.now(); save();
    V.gh = 'ok';
  }catch(e){ V.gh = 'err'; }
  ghBusy = false;
  updateGhStatus();
}
/* one-time connect: verify the repo is reachable with this token, then sync */
async function ghConnect(){
  const repo = ($('#gh-repo')||{}).value, tok = ($('#gh-token')||{}).value;
  if(!repo || !repo.trim() || !tok || !tok.trim()){ toast(t('ghBad')); return; }
  const btn = $('#gh-connect'); if(btn) btn.disabled = true;
  try{
    const r = await fetch('https://api.github.com/repos/'+repo.trim(),
      { headers:{ 'Authorization':'Bearer '+tok.trim(), 'Accept':'application/vnd.github+json' } });
    if(!r.ok) throw new Error('HTTP '+r.status);
    const meta = await r.json();
    if(!meta.private && !confirm(t('ghPublicWarn'))){ if(btn) btn.disabled=false; return; }
    S.ghRepo = repo.trim(); S.ghToken = tok.trim(); S.ghDirty = 1;
    save(); render();
    toast(t('ghOkToast'));
    cloudSync();
  }catch(e){
    if(btn) btn.disabled = false;
    toast(t('ghBad'));
  }
}
/* new phone / reinstall: pull the latest cloud backup and restore it in one tap */
async function ghRestore(){
  if(!ghOn()) return;
  if(!confirm(t('ghRestoreConfirm'))) return;
  try{
    const r = await fetch('https://api.github.com/repos/'+S.ghRepo+'/contents/'+GH_FILE,
      { headers:{ 'Authorization':'Bearer '+S.ghToken, 'Accept':'application/vnd.github.raw+json' } });
    if(!r.ok) throw new Error('HTTP '+r.status);
    const d = await r.json();
    if(!d || d.t!=='bak' || !d.s || !Array.isArray(d.s.templates)) throw new Error('bad payload');
    applyBak(d);
  }catch(e){ toast(t('ghRestoreFail')); }
}
function ghDisconnect(){
  if(!confirm(t('ghOffConfirm'))) return;
  S.ghToken = ''; S.ghRepo = ''; S.ghDirty = 0;
  save(); render();
}
function updateGhStatus(){
  const el = $('#gh-status');
  if(!el) return;
  if(V.gh==='sync'){ el.textContent = t('ghSyncing'); el.style.color = 'var(--dim)'; return; }
  if(V.gh==='err' || S.ghDirty){ el.textContent = t('ghErr'); el.style.color = 'var(--orange)'; return; }
  if(S.ghLast){
    const d = new Date(S.ghLast);
    const today = new Date().toDateString()===d.toDateString();
    el.textContent = t('ghLastSync')+' '+(today
      ? d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})
      : fmtDate(d.toISOString()));
    el.style.color = 'var(--green)';
  }else{ el.textContent = t('ghNever'); el.style.color = 'var(--dim)'; }
}
window.addEventListener('online', ()=>{ if(S.ghDirty) scheduleCloudSync(); });

