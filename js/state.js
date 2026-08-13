/* ============================================================
   Persistent state: the S object and everything that guards it.
   defaultState() is the schema, hydrate() validates/migrates any raw blob
   (localStorage, IndexedDB mirror, backup codes, cloud restore - they all
   funnel through it), save() writes localStorage + debounced IndexedDB.
   V holds per-session view state and is never persisted.
   All weights are stored in KG everywhere; display conversion happens in util.js.
   ============================================================ */
'use strict';

/* ======================= state ======================= */
const LS_KEY = 'daveedus.v1';
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-3);

function seedTemplates(fid){
  const tex = (k,s,r,alts,pn) => ({ id:uid(), k, s, r,
    ...(alts && alts.length ? { alts } : {}), ...(pn ? { pnote:pn } : {}) });
  return [
    { id:uid(), name:'Upper A', folderId:fid, ex:[
      tex('bench-press',4,'4-6',['smith-bench-press','db-bench-press'],'1 RIR, last set 0 RIR'),
      tex('barbell-row',3,'6-8',['chest-supported-row'],'last set to failure'),
      tex('incline-db-press',2,'8-10',['smith-incline-press','incline-bench-press'],'to failure'),
      tex('close-grip-lat-pulldown',2,'10-12',['pull-up'],'to failure'),
      tex('cable-lateral-raise',3,'12-15',['lateral-raise'],'to failure'),
      tex('incline-db-curl',2,'8-12',['preacher-curl'],'to failure'),
      tex('triceps-pushdown',2,'10-12',['overhead-triceps-ext'],'to failure') ]},
    { id:uid(), name:'Lower A', folderId:fid, ex:[
      tex('back-squat',4,'4-6',['hack-squat','leg-press'],'1-2 RIR'),
      tex('romanian-deadlift',3,'6-8',['db-romanian-deadlift'],'1 RIR'),
      tex('leg-press',2,'10-12',['hack-squat'],'to failure'),
      tex('lying-leg-curl',2,'10-12',['seated-leg-curl'],'to failure'),
      tex('leg-extension',2,'12-15',null,'to failure'),
      tex('seated-calf-raise',3,'10-15',['standing-calf-raise'],'to failure') ]},
    { id:uid(), name:'Upper B', folderId:fid, ex:[
      tex('overhead-press',4,'5-7',['seated-db-press'],'1 RIR'),
      tex('chest-dip',3,'6-8',['machine-dip','close-grip-bench'],'last set to failure'),
      tex('pull-up',3,'6-8',['close-grip-lat-pulldown'],'last set to failure'),
      tex('chest-supported-row',2,'10-12',['seated-cable-row'],'to failure'),
      tex('face-pull',2,'15-20',['reverse-cable-fly'],'to failure'),
      tex('hammer-curl',2,'8-12',['ez-bar-curl'],'to failure'),
      tex('overhead-triceps-ext',2,'10-12',['triceps-pushdown'],'to failure') ]},
    { id:uid(), name:'Lower B', folderId:fid, ex:[
      tex('tempo-squat',3,'8-10',['hack-squat'],'1-2 RIR'),
      tex('bulgarian-split-squat',2,'8-12',['lunge'],'to failure'),
      tex('leg-press',2,'12-15',['hack-squat'],'to failure'),
      tex('lying-leg-curl',2,'10-12',['seated-leg-curl'],'to failure'),
      tex('leg-extension',2,'15-20',null,'to failure'),
      tex('calf-press',3,'12-20',['seated-calf-raise'],'to failure') ]},
    { id:uid(), name:'Upper C', folderId:fid, ex:[
      tex('close-grip-bench',3,'6-8',['paused-bench-press','db-bench-press'],'1 RIR'),
      tex('incline-db-press',2,'8-10',['smith-incline-press'],'to failure'),
      tex('seated-cable-row',2,'10-12',['chest-supported-row'],'to failure'),
      tex('close-grip-lat-pulldown',2,'12-15',['pull-up'],'to failure'),
      tex('lateral-raise',4,'12-20',['cable-lateral-raise'],'to failure'),
      tex('preacher-curl',2,'8-12',['incline-db-curl'],'to failure'),
      tex('triceps-pushdown',2,'10-15',['overhead-triceps-ext'],'to failure') ]}
  ];
}
/* plate calculator: full selectable options and the default "what my gym has" set (per unit) */
const PLATE_OPTS = { kg:[25,20,15,10,5,2.5,1.25,0.5], lb:[45,35,25,15,10,5,2.5,1.25] };
const PLATE_DEF  = { kg:[25,20,15,10,5,2.5,1.25],      lb:[45,35,25,10,5,2.5] };
function defaultState(){
  const fid = uid();
  return { unit:'kg', theme:'auto', skin:'ice', keepAwake:true, lastBackup:0, bakSnooze:0, mig13:true,
           restTarget:120, restSound:true, /* restTarget = last picked value in the editor */
           ghRepo:'', ghToken:'', ghLast:0, ghDirty:0, /* cloud sync - device-local, never in share codes */
           lastActive:null, /* resume snapshot of the most recently finished workout */
           folders:[{ id:fid, name:'Upper / Lower', open:true, pinned:true }],
           customEx:[], templates:seedTemplates(fid), history:[], weights:[], active:null,
           trackedLifts:[], deloads:[], mainFolder:null,
           mbase:{}, /* machine starting weight per exercise key, kg; 0 = switched off on purpose */
           goals:{}, /* tracked-lift targets per exercise key: e1RM in kg */
           dlEvery:0, dlSnooze:0, /* calendar deload reminder: every N weeks; snoozed-until ts */
           onboarded:0, a2hsOff:0, /* one-time first-launch intro / install-hint dismissal */
           plates:{ kg:PLATE_DEF.kg.slice(), lb:PLATE_DEF.lb.slice() } };
}
/* validate + migrate a raw state object; returns null if unusable */
function hydrate(s){
  if(!s || !Array.isArray(s.templates)) return null;
  try{ delete s.__proto__; }catch(e){} /* harden against crafted import codes */
  /* migration: older data had no program folders */
  if(!Array.isArray(s.folders)) s.folders = [];
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
  if(!['ice','villain','batman'].includes(s.skin)) s.skin = 'ice';
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
  if(typeof s.dlEvery!=='number' || !(s.dlEvery>=0 && s.dlEvery<=16)) s.dlEvery = 0;
  if(typeof s.dlSnooze!=='number') s.dlSnooze = 0;
  return Object.assign(defaultState(), s);
}
let LS_OK = false; /* did localStorage contain valid data at boot? */
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      const s = hydrate(JSON.parse(raw));
      if(s){ LS_OK = true; return s; }
    }
  }catch(e){}
  return defaultState();
}
let S = load();

/* ---- storage safety net: IndexedDB mirror (+ backup codes / cloud sync) ----
   Daily on-device snapshots were retired in v1.22.0: GitHub sync keeps a full
   commit history of the data, which does the same job better. */
const SNAP_PREFIX = 'daveedus.snap.';
try{ /* one-time cleanup of legacy snapshot keys */
  Object.keys(localStorage).filter(k=>k.startsWith(SNAP_PREFIX)).forEach(k=>localStorage.removeItem(k));
  localStorage.removeItem('daveedus.lastSnap');
}catch(e){}
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
let idbTimer = null;
function save(){
  const json = JSON.stringify(S);
  try{
    localStorage.setItem(LS_KEY, json);
  }catch(e){
    /* quota exceeded - clear any legacy extras and retry once */
    try{
      Object.keys(localStorage).filter(k=>k.startsWith(SNAP_PREFIX)).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem(LS_KEY, json);
    }catch(e2){ toast(t('saveError')); }
  }
  clearTimeout(idbTimer);
  idbTimer = setTimeout(()=>idbSet(json), 800);
}
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

