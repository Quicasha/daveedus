/* ============================================================
   Persistent state: the S object and everything that guards it.
   defaultState() is the schema, hydrate() validates/migrates any raw blob
   (localStorage, IndexedDB mirror, backup codes, cloud restore - they all
   funnel through it), save() writes localStorage + debounced IndexedDB;
   saveSoon() debounces the per-keystroke paths and backgrounding flushes.
   V holds per-session view state and is never persisted.
   All weights are stored in KG everywhere; unit conversion (kg2u/u2kg/wu),
   the plate step (stepU/stepKg/scaleLoad) and exercise lookups live here too.
   ============================================================ */
'use strict';

/* ======================= state ======================= */
const LS_KEY = 'daveedus.v1';
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-3);

function seedTemplates(fid){
  const tex = (k,s,r,alts,pn,rt,ss) => ({ id:uid(), k, s, r,
    ...(alts && alts.length ? { alts } : {}), ...(pn ? { pnote:pn } : {}), ...(rt ? { rt } : {}),
    ...(ss ? { ss:true } : {}) }); /* ss links the exercise to the NEXT one as a superset */
  return [
    { id:uid(), name:'Upper A', folderId:fid, ex:[
      tex('bench-press',4,'4-6',['smith-bench-press','db-bench-press'],'1 RIR, last set 0 RIR. Rest 3-5 min',240),
      tex('barbell-row',3,'6-8',['chest-supported-row','seated-cable-row'],'1 RIR, last set to failure. Rest 2-3 min',180),
      tex('incline-db-press',3,'8-10',['smith-incline-press','incline-bench-press'],'Last set to failure. Rest 2 min',120),
      tex('close-grip-lat-pulldown',3,'10-12',['neutral-grip-lat-pulldown','pull-up'],'Last set to failure. Rest 1.5 min',90),
      tex('cable-lateral-raise',3,'12-15',['lateral-raise','machine-lateral-raise'],'To failure. Rest 1 min',60),
      tex('triceps-pushdown',2,'10-12',['rope-pushdown','overhead-triceps-ext'],'To failure. Rest 1 min',60) ]},
    { id:uid(), name:'Lower A', folderId:fid, ex:[
      tex('back-squat',4,'4-6',['hack-squat','leg-press'],'1-2 RIR, never to failure. Rest 3-5 min',240),
      tex('romanian-deadlift',3,'6-8',['db-romanian-deadlift','seated-leg-curl'],'1 RIR. Rest 2-3 min',180),
      tex('leg-press',2,'10-12',['hack-squat','smith-squat'],'To failure. Rest 2 min',120),
      tex('lying-leg-curl',2,'10-12',['seated-leg-curl','nordic-curl'],'To failure. Rest 1.5 min',90),
      tex('seated-calf-raise',2,'10-15',['standing-calf-raise','calf-press'],'To failure. Rest 1 min',60),
      tex('incline-db-curl',3,'8-12',['db-curl','preacher-curl'],'To failure. Rest 1 min',60) ]},
    { id:uid(), name:'Upper B', folderId:fid, ex:[
      tex('paused-bench-press',3,'3-5',['close-grip-bench','smith-bench-press'],'1 RIR. Rest 3 min',180),
      tex('chest-dip',3,'6-8',['machine-dip','close-grip-bench'],'Last set to failure. Rest 2-3 min',180),
      tex('pull-up',3,'6-8',['close-grip-lat-pulldown','lat-pulldown'],'Last set to failure. Rest 2-3 min',180),
      tex('lateral-raise',4,'12-20',['cable-lateral-raise','machine-lateral-raise'],'To failure. Rest 1 min',60),
      tex('face-pull',2,'15-20',['reverse-cable-fly','reverse-pec-deck'],'To failure. Rest 1 min',60),
      tex('hammer-curl',2,'8-12',['ez-bar-curl','cable-hammer-curl'],'To failure. Rest 1 min',60) ]},
    { id:uid(), name:'Lower B', folderId:fid, ex:[
      tex('tempo-squat',4,'5-6',['hack-squat','smith-squat'],'2 RIR. Rest 3 min',180),
      tex('bulgarian-split-squat',2,'8-12',['walking-lunge','lunge'],'To failure, per leg. Rest 1.5 min',90),
      tex('leg-press',2,'12-15',['hack-squat','goblet-squat'],'To failure. Rest 2 min',120),
      tex('lying-leg-curl',2,'10-12',['seated-leg-curl','db-romanian-deadlift'],'To failure. Rest 1.5 min',90),
      tex('standing-calf-raise',2,'12-20',['calf-press','seated-calf-raise'],'To failure. Rest 1 min',60),
      tex('leg-extension',2,'12-15',null,'To failure. Rest 1 min',60),
      tex('preacher-curl',2,'8-12',['db-preacher-curl','machine-preacher-curl'],'To failure. Rest 1 min',60,true),
      tex('overhead-triceps-ext',2,'10-15',['cable-overhead-triceps-ext','triceps-pushdown'],'To failure. Rest 1 min',60) ]}
  ];
}
/* plate calculator: full selectable options and the default "what my gym has" set (per unit) */
const PLATE_OPTS = { kg:[25,20,15,10,5,2.5,1.25,0.5], lb:[45,35,25,15,10,5,2.5,1.25] };
const PLATE_DEF  = { kg:[25,20,15,10,5,2.5,1.25],      lb:[45,35,25,10,5,2.5] };
function defaultState(){
  const fid = uid();
  return { unit:'kg', theme:'auto', skin:'locked', keepAwake:true, lastBackup:0, bakSnooze:0, mig13:true,
           restTarget:120, restSound:true, /* restTarget = last picked value in the editor */
           ghRepo:'', ghToken:'', ghLast:0, ghDirty:0, /* cloud sync - device-local, never in share codes */
           lastActive:null, /* resume snapshot of the most recently finished workout */
           folders:[{ id:fid, name:'Upper / Lower', open:true, pinned:true }],
           customEx:[], templates:seedTemplates(fid), history:[], weights:[], active:null,
           trackedLifts:[], deloads:[], mainFolder:null,
           mbase:{}, /* machine starting weight per exercise key, kg; 0 = switched off on purpose */
           goals:{}, /* tracked-lift targets per exercise key: e1RM in kg */
           waves:{}, /* 4-week wave per exercise key: { base (week-A kg), step (kg), idx 0-3 } */
           stallSnooze:{}, /* per-key ts until which the home stall nudge stays hidden */
           dlEvery:0, dlSnooze:0, /* calendar deload reminder: every N weeks; snoozed-until ts */
           dlaSnooze:0, /* passive deload advisor: snoozed-until ts */
           onboarded:0, a2hsOff:0, /* one-time first-launch intro / install-hint dismissal */
           plates:{ kg:PLATE_DEF.kg.slice(), lb:PLATE_DEF.lb.slice() } };
}
/* validate + migrate a raw state object; returns null if unusable.
   REPAIR, never reject: one malformed field must not cost the whole blob
   (a corrupt templates entry used to wipe intact history) - every field
   falls back to its own default instead. */
function hydrate(s){
  if(!s || typeof s!=='object' || Array.isArray(s)) return null;
  try{ delete s.__proto__; }catch(e){} /* harden against crafted import codes */
  if(!Array.isArray(s.templates)) s.templates = [];
  s.templates = s.templates.filter(tp=>tp && typeof tp==='object' && Array.isArray(tp.ex));
  if(!Array.isArray(s.history)) s.history = [];
  s.history = s.history.filter(w=>w && typeof w==='object' && Array.isArray(w.exercises)
    && w.exercises.every(e=>e && Array.isArray(e.sets)));
  if(!Array.isArray(s.customEx)) s.customEx = [];
  s.customEx = s.customEx.filter(x=>x && typeof x.id==='string' && typeof x.n==='string');
  /* migration: older data had no program folders */
  if(!Array.isArray(s.folders)) s.folders = [];
  s.folders = s.folders.filter(f=>f && typeof f==='object' && typeof f.id==='string');
  /* save-time stamp used by boot to pick the newer of the two on-device copies;
     a future or non-numeric stamp (clock skew) must never win forever */
  if(typeof s.ts!=='number' || !(s.ts>0) || s.ts > Date.now()+864e5) s.ts = 0;
  if(!s.mig13 && !s.folders.length && s.templates.length){
    /* one-time recovery of flat-era data: group everything under one program.
       Guarded by mig13 so deleting all programs later does not resurrect them. */
    const fid = uid();
    s.folders = [{ id:fid, name:'Upper / Lower', open:true, pinned:true }];
    s.templates.forEach(tp=>{ tp.folderId = fid; });
  }
  s.mig13 = true;
  s.folders.forEach(f=>{ if(typeof f.pinned==='undefined') f.pinned = true; });
  if(!Array.isArray(s.weights)) s.weights = [];
  if(!Array.isArray(s.trackedLifts)) s.trackedLifts = [];
  s.trackedLifts = s.trackedLifts.filter(k=>typeof k==='string');
  if(!Array.isArray(s.deloads)) s.deloads = [];
  s.deloads = s.deloads.filter(d=>d && typeof d.s==='number' && typeof d.e==='number');
  s.deloads.forEach(d=>{
    if(!Array.isArray(d.tpls)) d.tpls=[];
    if(!Array.isArray(d.done)) d.done=[];
    if(typeof d.pct!=='number' || d.pct<=0 || d.pct>1) d.pct = 0.6;
    if(d.vol!==0.5 && d.vol!==1) d.vol = 1;
  });
  if(typeof s.mainFolder!=='string') s.mainFolder = null;
  if(typeof s.restTarget!=='number' || !(s.restTarget>=15 && s.restTarget<=1800)) s.restTarget = 120;
  if(typeof s.restSound!=='boolean') s.restSound = true;
  if(!SKIN_META[s.skin]) s.skin = 'locked'; /* util.js loads first; SKIN_META is the skin registry; retired skins land here */
  if(typeof s.ghRepo!=='string') s.ghRepo = '';
  if(typeof s.ghToken!=='string') s.ghToken = '';
  if(typeof s.ghLast!=='number') s.ghLast = 0;
  s.ghDirty = s.ghDirty ? 1 : 0;
  if(!s.lastActive || typeof s.lastActive!=='object' || typeof s.lastActive.id!=='string'
     || !s.lastActive.act || !Array.isArray(s.lastActive.act.exercises)) s.lastActive = null;
  if(!s.plates || !Array.isArray(s.plates.kg) || !Array.isArray(s.plates.lb)){
    s.plates = { kg:PLATE_DEF.kg.slice(), lb:PLATE_DEF.lb.slice() };
  }
  /* machine base memory: keep only sane key -> kg entries (0 = explicitly off) */
  if(!s.mbase || typeof s.mbase!=='object' || Array.isArray(s.mbase)) s.mbase = {};
  for(const k in s.mbase){
    const v = s.mbase[k];
    if(typeof v!=='number' || isNaN(v) || v<0 || v>500) delete s.mbase[k];
  }
  /* lift goals: key -> target e1RM kg */
  if(!s.goals || typeof s.goals!=='object' || Array.isArray(s.goals)) s.goals = {};
  for(const k in s.goals){
    const v = s.goals[k];
    if(typeof v!=='number' || isNaN(v) || v<=0 || v>1000) delete s.goals[k];
  }
  /* 4-week waves: key -> { base kg, step kg, idx 0-3, startBest, started, rounds } */
  if(!s.waves || typeof s.waves!=='object' || Array.isArray(s.waves)) s.waves = {};
  for(const k in s.waves){
    const w = s.waves[k];
    if(!w || typeof w.base!=='number' || !(w.base>0 && w.base<=500)
        || typeof w.step!=='number' || !(w.step>=0.5 && w.step<=10)
        || ![0,1,2,3].includes(w.idx)){ delete s.waves[k]; continue; }
    /* auto-end bookkeeping: fill sane defaults for waves saved before v2.7 */
    if(typeof w.startBest!=='number' || w.startBest<0) w.startBest = 0;
    if(typeof w.started!=='number' || w.started<0) w.started = 0;
    if(typeof w.rounds!=='number' || w.rounds<0) w.rounds = 0;
  }
  if(!s.stallSnooze || typeof s.stallSnooze!=='object' || Array.isArray(s.stallSnooze)) s.stallSnooze = {};
  if(typeof s.dlEvery!=='number' || !(s.dlEvery>=0 && s.dlEvery<=16)) s.dlEvery = 0;
  if(typeof s.dlSnooze!=='number') s.dlSnooze = 0;
  if(typeof s.dlaSnooze!=='number') s.dlaSnooze = 0;
  return Object.assign(defaultState(), s);
}
let LS_OK = false; /* did localStorage contain valid data at boot? */
function load(){
  let raw = null;
  try{
    raw = localStorage.getItem(LS_KEY);
    if(raw){
      const s = hydrate(JSON.parse(raw));
      if(s){ LS_OK = true; return s; }
    }
  }catch(e){}
  /* unusable blob: never destroy it silently - park it under a side key so the
     data survives the defaults being saved over the main key */
  if(raw){ try{ localStorage.setItem(LS_KEY+'.bad', raw); }catch(e){} }
  /* ...and if a parked copy from an earlier boot IS readable, that beats defaults
     (boot still consults the IndexedDB mirror and keeps whichever is newer) */
  try{
    const bad = localStorage.getItem(LS_KEY+'.bad');
    if(bad && bad!==raw){ const s = hydrate(JSON.parse(bad)); if(s){ LS_OK = true; return s; } }
  }catch(e){}
  return defaultState();
}
let S = load();

/* ---- storage safety net: IndexedDB mirror (+ backup codes / cloud sync).
   Boot keeps whichever on-device copy carries the newer save stamp. ---- */
function idbOpen(){
  return new Promise((res,rej)=>{
    const q = indexedDB.open('daveedus', 1);
    q.onupgradeneeded = ()=>q.result.createObjectStore('kv');
    q.onsuccess = ()=>res(q.result);
    q.onerror = ()=>rej(q.error);
  });
}
async function idbSet(val){
  try{
    const db = await idbOpen();
    await new Promise((res,rej)=>{
      const tx = db.transaction('kv','readwrite');
      tx.objectStore('kv').put(val, 'state');
      tx.oncomplete = res; tx.onerror = ()=>rej(tx.error);
    });
    db.close();
  }catch(e){}
}
async function idbGet(){
  try{
    const db = await idbOpen();
    const v = await new Promise((res,rej)=>{
      const q = db.transaction('kv','readonly').objectStore('kv').get('state');
      q.onsuccess = ()=>res(q.result); q.onerror = ()=>rej(q.error);
    });
    db.close();
    return v;
  }catch(e){ return null; }
}
let idbTimer = null, lsTimer = null, lsFailed = false;
function save(){
  S.ts = Date.now(); /* boot compares the two copies by this stamp and keeps the newer */
  const json = JSON.stringify(S);
  clearTimeout(lsTimer); lsTimer = null; /* a pending debounced write is covered by this one */
  try{
    if(lsFailed){ /* storage was full: drop the parked copy first - it is the one luxury we can afford to lose */
      try{ localStorage.removeItem(LS_KEY+'.bad'); }catch(e){}
    }
    localStorage.setItem(LS_KEY, json);
    lsFailed = false;
  }catch(e){
    /* quota exceeded - localStorage keeps its stale copy, so flush the fresh
       state to the IndexedDB mirror NOW; boot will prefer the newer copy.
       One toast per session, not one per keystroke. */
    if(!lsFailed) toast(t('saveError'));
    lsFailed = true;
    idbSet(json);
  }
  clearTimeout(idbTimer);
  idbTimer = setTimeout(()=>{ idbTimer = null; idbSet(json); }, 800);
}
/* backgrounding flushes BOTH pending writes - the phone may never come back */
function flushSaves(){
  if(lsTimer) save();
  else if(idbTimer){ clearTimeout(idbTimer); idbTimer = null; idbSet(JSON.stringify(S)); }
}
/* debounced save for per-keystroke paths (weight/reps/note typing): S is already
   mutated, only the O(full history) serialize+write waits until typing settles.
   Backgrounding the app flushes immediately, so nothing is lost on switch-away. */
function saveSoon(){
  clearTimeout(lsTimer);
  lsTimer = setTimeout(()=>{ lsTimer = null; save(); }, 400);
}
window.addEventListener('pagehide', flushSaves);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') flushSaves(); });
/* view state (not persisted) */
const V = { screen:'home', editTpl:null, viewFolder:null, exDetail:null, expanded:null,
            pickerCb:null, pickerQ:'', pickerG:'all', exQ:'', exG:'mine',
            exTplFilter:'', exFilterNames:[], exMetric:'w', showArch:false,
            histLimit:20, histQ:'',
            /* per-chart period state: p = 'w'|'m'|'y'|'c' (charts), days|'all'|'c' (muscle/bw);
               f/t = custom from-to as yyyy-mm-dd */
            cp:{ wk:{p:'w',f:'',t:''}, vol:{p:'w',f:'',t:''},
                 mus:{p:'7',f:'',t:''}, bw:{p:'90',f:'',t:''}, rh:{p:'14'} } };

/* exercise lookup: built-in DB + user's custom exercises */
function exInfo(k){
  return EX_DB.find(x=>x.id===k) || S.customEx.find(x=>x.id===k) || null;
}
function allExercises(){ return EX_DB.concat(S.customEx); }
function exName(k, fallback){ const i = exInfo(k); return i ? i.n : (fallback || k); }
/* time-based exercise (plank etc.): "reps" column means seconds */
function isTimeEx(k){ const i = exInfo(k); return !!(i && i.m==='t'); }
/* bodyweight exercise (pull-up, dip...): weight column is ADDED load (empty = BW only) */
function isBwEx(k){ const i = exInfo(k); return !!(i && i.e==='bodyweight' && i.m!=='t'); }

/* ---- units: weights are stored canonically in kg, shown in the chosen unit ---- */
const LB_PER_KG = 2.2046226218;
function unitL(){ return S.unit==='lb' ? 'lb' : 'kg'; }
function kg2u(kg){ if(kg==null||isNaN(kg)) return kg; return S.unit==='lb' ? Math.round(kg*LB_PER_KG*100)/100 : kg; }
function u2kg(v){ if(v==null||isNaN(v)) return v; return S.unit==='lb' ? v/LB_PER_KG : v; }
/* format a kg value in display unit; withUnit appends the label */
function wu(kg, withUnit){ const n = fmtW(kg2u(kg)); return withUnit ? n+' '+unitL() : n; }
/* THE plate step - one small plate pair: 2.5 kg or 5 lb - in display units and in kg.
   Every suggestion that snaps to plates (deload, comeback, wave base, warmup ramp,
   the +/- stepper) reads it from here. */
function stepU(){ return S.unit==='lb' ? 5 : 2.5; }
function stepKg(){ return u2kg(stepU()); }
/* scale a load by a factor and snap to the plate step - never ABOVE the original:
   a light load that rounds to zero stays at its own value instead of jumping up
   to a full step (1.25 kg "eased to 85%" must not become 2.5 kg) */
function scaleLoad(kg, f){
  if(!(kg>0) || f>=1) return kg;
  const step = stepKg();
  const snapped = Math.round(kg*f/step)*step;
  return snapped > 0 ? Math.min(kg, snapped) : Math.round(kg*f*100)/100;
}

function fmtSet(s, k, mb){
  const tm = isTimeEx(k), bw = isBwEx(k);
  const p = s.warm ? 'W ' : s.drop ? 'D ' : s.fail ? 'F ' : '';
  if(tm) return p + (s.weight ? wu(s.weight)+'·' : '') + s.reps + 's';
  if(bw){
    const add = s.weight ? (s.weight>0?'+':'') + wu(s.weight) + ' ' : '';
    return p + add + '×' + s.reps;
  }
  /* machine with a starting weight: the log holds the added plates only - the
     "+" marks it, exactly like added load on dips/pull-ups (stats count totals) */
  if(mb>0) return p + '+' + wu(s.weight) + '×' + s.reps;
  return p + wu(s.weight) + '×' + s.reps;
}

