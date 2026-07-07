/* ============================================================
   Daveedus v1.0 — workout tracker
   Sections: i18n | state | helpers | theme | render core |
             home | workout | rest+elapsed | program | picker |
             exercises | history | settings | share codes | boot
   ============================================================ */
'use strict';

const APP_VER = '1.1.0'; /* bump together with CACHE in sw.js on every release */

/* ======================= i18n ======================= */
const I18N = {
  lt: {
    tabHome:'Treniruotė', tabProgram:'Programa', tabExercises:'Pratimai', tabHistory:'Istorija', tabSettings:'Nustatymai',
    today:'šiandien', yesterday:'vakar', daysAgo:'prieš {n} d.', never:'dar nedaryta',
    statWeek:'šią savaitę', statTotal:'iš viso',
    homeContinue:'Tęsti treniruotę',
    homeTemplates:'Mano programos', emptyWorkoutName:'Treniruotė',
    woFinish:'BAIGTI', woElapsed:'TRUKMĖ',
    woCancel:'Atšaukti treniruotę', woCancelConfirm:'Atšaukti treniruotę? Įvesti duomenys nebus išsaugoti.',
    woSwitchConfirm:'Jau vyksta kita treniruotė. Ją atšaukti ir pradėti naują?',
    woSet:'Set', woPrev:'Anksčiau', woKg:'kg', woReps:'kart.', woNote:'Pastaba...',
    woAddSet:'+ Setas', woRemoveSet:'− Setas', woRemoveDone:'Setas jau atliktas',
    woAddEx:'+ Pridėti pratimą', woDelEx:'Išimti pratimą „{n}“?',
    woEmptyVals:'Įvesk svorį ir kartojimus', woSaved:'Treniruotė išsaugota 💪',
    woFinishEmpty:'Nėra atliktų setų. Atšaukti treniruotę?',
    woFinishPart:'Ne visi setai atlikti. Baigti ir išsaugoti?',
    woFirst:'pirmas kartas', restLabel:'Poilsis',
    tplNew:'+ Nauja programa', tplImport:'⤓ Įvesti kodą', tplDefaultName:'Nauja programa',
    tplDel:'Ištrinti programą „{n}“?', tplExCount:'{n} prat.',
    tplName:'Programos pavadinimas', tplAddEx:'+ Pridėti pratimą', tplDelEx:'Išimti pratimą „{n}“?',
    tplShare:'Programos kodas', tplShareHint:'Nusiųsk šį kodą draugui — jis įves jį ir gaus tavo programą.',
    tplImportTitle:'Įvesti kodą', tplImportHint:'Įklijuok gautą kodą čia:',
    tplImportBtn:'Importuoti', tplImported:'Programa „{n}“ pridėta ✓',
    folderNew:'+ Naujas splitas', folderDefault:'Naujas splitas', folderNone:'Be splito',
    folderName:'Splito pavadinimas', folderDel:'Ištrinti splitą „{n}“? Programos liks, tik be splito.',
    folderShare:'Splito kodas', folderShareHint:'Nusiųsk šį kodą draugui — jis gaus visą splitą su visomis programomis.',
    folderImported:'Splitas „{n}“ pridėtas ✓', tplFolder:'Splitas', deleteBtn:'Ištrinti', nextBadge:'KITA',
    histEditTitle:'Redaguoti treniruotę',
    tplDup:'Dubliuoti', tplDupSuffix:'(kopija)',
    woSec:'sek.',
    sumTitle:'Treniruotė išsaugota 💪', sumDur:'Trukmė', sumVol:'Apimtis', sumSets:'Setai',
    sumPRs:'Nauji rekordai', sumOk:'Super!',
    recTitle:'Rekordai', rec1RM:'~1RM (apytikslis)', recBestSet:'Geriausias setas', recTime:'Ilgiausiai',
    bakRemind:'Seniai nekopijavai atsarginio kodo!',
    protTitle:'Duomenų apsauga', protPersist:'Nuolatinė saugykla',
    protOn:'✓ Įjungta', protOff:'Nesuteikta',
    protSnaps:'Automatinės kopijos įrenginyje',
    protRestore:'Atkurti', protRestoreConfirm:'Atkurti duomenis iš {d}? Dabartiniai duomenys bus pakeisti.',
    protNoSnaps:'Kopijų dar nėra — atsiras po kito išsaugojimo.',
    protRestored:'Atkurta ✓', protRecovered:'Duomenys atkurti iš atsarginės saugyklos ✓',
    protHint:'Kasdien automatiškai išsaugoma kopija įrenginyje, o duomenys dubliuojami į antrą saugyklą — jei viena sugestų, atsistatys iš kitos. Retkarčiais nusikopijuok ir atsarginį kodą: jis vienintelis padės pametus telefoną.',
    updToast:'Atnaujinta į naujausią versiją ✓',
    exCreateMode:'Tipas', modeReps:'Kartai', modeTime:'Laikas (sek.)',
    histArch:'Archyvuoti', histUnarch:'Grąžinti', archTitle:'Archyvas',
    exMine:'Mano', exMineEmpty:'Dar nieko nedarei — pasirink „Visi“ ir pradėk!',
    saveDone:'Išsaugoti',
    bw:'Kūno svoris', bwLog:'Įrašyti', bwDel:'Ištrinti šį įrašą?',
    plates:'Svarelių kalkuliatorius', platesBar:'Grifas', platesSide:'Ant vienos pusės',
    platesRem:'{n} kg pusėj netelpa iš standartinių svarelių', platesEmpty:'Tuščias grifas',
    superset:'Superset',
    codeBad:'Neteisingas kodas', copy:'Kopijuoti', copied:'Nukopijuota ✓',
    daySets:'setai', dayReps:'kart.',
    exSearch:'Ieškoti pratimo...', exAll:'Visi', exCreate:'+ Sukurti savo pratimą',
    exCreateTitle:'Naujas pratimas', exCreateName:'Pavadinimas', exCreateGroup:'Raumenų grupė',
    exCreateSave:'Išsaugoti', exNameReq:'Įvesk pavadinimą',
    exBest:'Rekordas', exSessions:'Treniruotės', exLastDone:'Paskutinį kartą',
    exNoHistory:'Šio pratimo istorijos dar nėra',
    chartTop:'geriausias setas (kg)', chartNoData:'Nėra duomenų',
    histEmpty:'Istorija tuščia — laikas treniruotis! Pasirink programą skiltyje „Treniruotė“.',
    histDel:'Ištrinti šią treniruotę iš istorijos?', histSets:'setai', histVolume:'apimtis',
    setTheme:'Tema', themeAuto:'Auto', themeDark:'Tamsi', themeLight:'Šviesi',
    setLang:'Kalba', setAwake:'Neužmigdyti ekrano',
    setBackup:'Atsarginė kopija', setBackupCopy:'Kopijuoti atsarginį kodą', setBackupLoad:'Įkelti atsarginį kodą',
    bakHint:'Įklijuok atsarginį kodą — VISI dabartiniai duomenys bus pakeisti.',
    bakConfirm:'Atkurti duomenis iš kodo? Dabartiniai duomenys bus pakeisti.',
    bakDone:'Duomenys atkurti ✓',
    setDanger:'Pavojinga zona', setWipe:'Ištrinti visus duomenis',
    setWipeConfirm:'Tikrai ištrinti VISUS duomenis (programas ir istoriją)?',
    saveError:'Nepavyko išsaugoti duomenų!',
    g_all:'Visi', g_chest:'Krūtinė', g_back:'Nugara', g_shoulders:'Pečiai', g_biceps:'Bicepsai',
    g_triceps:'Tricepsai', g_forearms:'Dilbiai', g_quads:'Keturgalviai', g_hamstrings:'Dvigalviai',
    g_glutes:'Sėdmenys', g_calves:'Blauzdos', g_core:'Pilvo presas', g_other:'Kita',
    e_barbell:'Štanga', e_dumbbell:'Hanteliai', e_machine:'Treniruoklis', e_cable:'Trosas',
    e_bodyweight:'Savo svoris', e_kettlebell:'Girja', e_other:'Kita'
  },
  en: {
    tabHome:'Workout', tabProgram:'Program', tabExercises:'Exercises', tabHistory:'History', tabSettings:'Settings',
    today:'today', yesterday:'yesterday', daysAgo:'{n} days ago', never:'not done yet',
    statWeek:'this week', statTotal:'total',
    homeContinue:'Continue workout',
    homeTemplates:'My templates', emptyWorkoutName:'Workout',
    woFinish:'FINISH', woElapsed:'DURATION',
    woCancel:'Cancel workout', woCancelConfirm:'Cancel workout? Entered data will not be saved.',
    woSwitchConfirm:'Another workout is in progress. Discard it and start a new one?',
    woSet:'Set', woPrev:'Previous', woKg:'kg', woReps:'reps', woNote:'Note...',
    woAddSet:'+ Set', woRemoveSet:'− Set', woRemoveDone:'Set already completed',
    woAddEx:'+ Add exercise', woDelEx:'Remove exercise “{n}”?',
    woEmptyVals:'Enter weight and reps', woSaved:'Workout saved 💪',
    woFinishEmpty:'No completed sets. Discard workout?',
    woFinishPart:'Not all sets completed. Finish and save?',
    woFirst:'first time', restLabel:'Rest',
    tplNew:'+ New template', tplImport:'⤓ Enter code', tplDefaultName:'New template',
    tplDel:'Delete template “{n}”?', tplExCount:'{n} ex.',
    tplName:'Template name', tplAddEx:'+ Add exercise', tplDelEx:'Remove exercise “{n}”?',
    tplShare:'Template code', tplShareHint:'Send this code to a friend — they enter it and get your template.',
    tplImportTitle:'Enter code', tplImportHint:'Paste the received code here:',
    tplImportBtn:'Import', tplImported:'Template “{n}” added ✓',
    folderNew:'+ New split', folderDefault:'New split', folderNone:'No split',
    folderName:'Split name', folderDel:'Delete split “{n}”? Templates will remain, just without the split.',
    folderShare:'Split code', folderShareHint:'Send this code to a friend — they get the whole split with all templates.',
    folderImported:'Split “{n}” added ✓', tplFolder:'Split', deleteBtn:'Delete', nextBadge:'NEXT',
    histEditTitle:'Edit workout',
    tplDup:'Duplicate', tplDupSuffix:'(copy)',
    woSec:'sec',
    sumTitle:'Workout saved 💪', sumDur:'Duration', sumVol:'Volume', sumSets:'Sets',
    sumPRs:'New records', sumOk:'Nice!',
    recTitle:'Records', rec1RM:'~1RM (estimated)', recBestSet:'Best set', recTime:'Longest',
    bakRemind:"You haven't copied a backup code in a while!",
    protTitle:'Data protection', protPersist:'Persistent storage',
    protOn:'✓ On', protOff:'Not granted',
    protSnaps:'Automatic on-device snapshots',
    protRestore:'Restore', protRestoreConfirm:'Restore data from {d}? Current data will be replaced.',
    protNoSnaps:'No snapshots yet — one will appear after the next save.',
    protRestored:'Restored ✓', protRecovered:'Data recovered from backup storage ✓',
    protHint:'A daily snapshot is kept on this device and data is mirrored to a second storage — if one breaks, the other restores it. Still copy a backup code occasionally: it is the only thing that survives losing the phone.',
    updToast:'Updated to the latest version ✓',
    exCreateMode:'Type', modeReps:'Reps', modeTime:'Time (sec)',
    histArch:'Archive', histUnarch:'Restore', archTitle:'Archive',
    exMine:'Mine', exMineEmpty:'Nothing done yet — pick “All” and get started!',
    saveDone:'Save',
    bw:'Body weight', bwLog:'Log', bwDel:'Delete this entry?',
    plates:'Plate calculator', platesBar:'Bar', platesSide:'Per side',
    platesRem:"{n} kg per side doesn't fit standard plates", platesEmpty:'Empty bar',
    superset:'Superset',
    codeBad:'Invalid code', copy:'Copy', copied:'Copied ✓',
    daySets:'sets', dayReps:'reps',
    exSearch:'Search exercises...', exAll:'All', exCreate:'+ Create your own exercise',
    exCreateTitle:'New exercise', exCreateName:'Name', exCreateGroup:'Muscle group',
    exCreateSave:'Save', exNameReq:'Enter a name',
    exBest:'Best', exSessions:'Sessions', exLastDone:'Last done',
    exNoHistory:'No history for this exercise yet',
    chartTop:'top set (kg)', chartNoData:'No data',
    histEmpty:'No history yet — time to train! Pick a template in the “Workout” tab.',
    histDel:'Delete this workout from history?', histSets:'sets', histVolume:'volume',
    setTheme:'Theme', themeAuto:'Auto', themeDark:'Dark', themeLight:'Light',
    setLang:'Language', setAwake:'Keep screen awake',
    setBackup:'Backup', setBackupCopy:'Copy backup code', setBackupLoad:'Load backup code',
    bakHint:'Paste a backup code — ALL current data will be replaced.',
    bakConfirm:'Restore data from code? Current data will be replaced.',
    bakDone:'Data restored ✓',
    setDanger:'Danger zone', setWipe:'Delete all data',
    setWipeConfirm:'Really delete ALL data (templates and history)?',
    saveError:'Could not save data!',
    g_all:'All', g_chest:'Chest', g_back:'Back', g_shoulders:'Shoulders', g_biceps:'Biceps',
    g_triceps:'Triceps', g_forearms:'Forearms', g_quads:'Quads', g_hamstrings:'Hamstrings',
    g_glutes:'Glutes', g_calves:'Calves', g_core:'Core', g_other:'Other',
    e_barbell:'Barbell', e_dumbbell:'Dumbbell', e_machine:'Machine', e_cable:'Cable',
    e_bodyweight:'Bodyweight', e_kettlebell:'Kettlebell', e_other:'Other'
  }
};
function t(k, vars){
  let s = (I18N[S.lang] && I18N[S.lang][k]) || I18N.lt[k] || k;
  if(vars) for(const v in vars) s = s.replace('{'+v+'}', vars[v]);
  return s;
}

/* ======================= state ======================= */
const LS_KEY = 'daveedus.v1';
const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-3);

function seedTemplates(fid){
  const tex = (k,s,r) => ({ id:uid(), k, s, r });
  return [
    { id:uid(), name:'Upper A', folderId:fid, ex:[ tex('bench-press',3,8), tex('barbell-row',3,8),
      tex('overhead-press',3,10), tex('lat-pulldown',3,10), tex('db-curl',3,12), tex('triceps-pushdown',3,12) ]},
    { id:uid(), name:'Lower A', folderId:fid, ex:[ tex('back-squat',3,8), tex('romanian-deadlift',3,10),
      tex('leg-press',3,12), tex('lying-leg-curl',3,12), tex('standing-calf-raise',4,15), tex('ab-crunch',3,15) ]},
    { id:uid(), name:'Upper B', folderId:fid, ex:[ tex('incline-db-press',3,10), tex('pull-up',3,8),
      tex('seated-cable-row',3,10), tex('seated-db-press',3,10), tex('ez-bar-curl',3,10), tex('overhead-triceps-ext',3,12) ]},
    { id:uid(), name:'Lower B', folderId:fid, ex:[ tex('deadlift',3,5), tex('bulgarian-split-squat',3,10),
      tex('leg-extension',3,12), tex('seated-leg-curl',3,12), tex('standing-calf-raise',4,15), tex('hanging-leg-raise',3,12) ]}
  ];
}
function defaultState(){
  const fid = uid();
  return { lang:'lt', theme:'auto', keepAwake:true, lastBackup:0, bakSnooze:0,
           folders:[{ id:fid, name:'Upper / Lower', open:true, pinned:true }],
           customEx:[], templates:seedTemplates(fid), history:[], weights:[], active:null };
}
/* validate + migrate a raw state object; returns null if unusable */
function hydrate(s){
  if(!s || !Array.isArray(s.templates)) return null;
  /* migration: older data had no split folders */
  if(!Array.isArray(s.folders)){
    const fid = uid();
    s.folders = [{ id:fid, name:'Upper / Lower', open:true }];
    s.templates.forEach(tp=>{ if(!tp.folderId) tp.folderId = fid; });
  }
  s.folders.forEach(f=>{ if(typeof f.pinned==='undefined') f.pinned = true; });
  if(!Array.isArray(s.weights)) s.weights = [];
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

/* ---- storage safety net: daily snapshots + IndexedDB mirror ---- */
const SNAP_PREFIX = 'daveedus.snap.';
function maybeSnapshot(){
  /* once per day, keep the previous state as an on-device snapshot (newest 3) */
  try{
    const today = new Date().toISOString().slice(0,10);
    if(localStorage.getItem('daveedus.lastSnap')===today) return;
    const prev = localStorage.getItem(LS_KEY);
    if(prev) localStorage.setItem(SNAP_PREFIX+today, prev);
    localStorage.setItem('daveedus.lastSnap', today);
    const keys = Object.keys(localStorage).filter(k=>k.startsWith(SNAP_PREFIX)).sort();
    while(keys.length>3) localStorage.removeItem(keys.shift());
  }catch(e){}
}
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
  try{
    maybeSnapshot();
    localStorage.setItem(LS_KEY, JSON.stringify(S));
  }catch(e){ toast(t('saveError')); }
  clearTimeout(idbTimer);
  idbTimer = setTimeout(()=>idbSet(JSON.stringify(S)), 800);
}
/* view state (not persisted) */
const V = { screen:'home', editTpl:null, viewFolder:null, exDetail:null, expanded:null,
            pickerCb:null, pickerQ:'', pickerG:'all', exQ:'', exG:'mine',
            exTplFilter:'', exFilterNames:[], showArch:false };

/* exercise lookup: built-in DB + user's custom exercises */
function exInfo(k){
  return EX_DB.find(x=>x.id===k) || S.customEx.find(x=>x.id===k) || null;
}
function allExercises(){ return EX_DB.concat(S.customEx); }
function exName(k, fallback){ const i = exInfo(k); return i ? i.n : (fallback || k); }
/* time-based exercise (plank etc.): "reps" column means seconds */
function isTimeEx(k){ const i = exInfo(k); return !!(i && i.m==='t'); }
function fmtSet(s, tm){
  const p = s.warm ? 'W ' : s.drop ? 'D ' : '';
  if(tm) return p + (s.weight ? fmtW(s.weight)+'kg·' : '') + s.reps + 's';
  return p + fmtW(s.weight) + '×' + s.reps;
}

/* ======================= helpers ======================= */
const $ = s => document.querySelector(s);
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function parseNum(v){
  if(v==null || v==='') return NaN;
  return parseFloat(String(v).replace(',','.'));
}
function fmtW(w){
  if(w==null || isNaN(w)) return '';
  return String(Math.round(w*100)/100);
}
function fmtTime(sec){
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), s = sec%60;
  return h>0 ? h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')
             : m+':'+String(s).padStart(2,'0');
}
function fmtDate(iso){
  return new Date(iso).toLocaleDateString(S.lang==='lt'?'lt-LT':'en-GB',
    { month:'short', day:'numeric', weekday:'short' });
}
function daysAgoStr(iso){
  const one = 24*3600*1000;
  const a = new Date(iso); a.setHours(0,0,0,0);
  const b = new Date();    b.setHours(0,0,0,0);
  const n = Math.round((b-a)/one);
  if(n<=0) return t('today');
  if(n===1) return t('yesterday');
  return t('daysAgo',{n});
}
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 2200);
}
function copyText(txt){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>toast(t('copied')), ()=>copyFallback(txt));
  }else copyFallback(txt);
}
function copyFallback(txt){
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); toast(t('copied')); }catch(e){}
  ta.remove();
}

/* ======================= theme ======================= */
const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){
  const mode = S.theme==='auto' ? (mediaDark.matches?'dark':'light') : S.theme;
  document.documentElement.dataset.theme = mode;
  const meta = $('#themecolor');
  if(meta) meta.content = mode==='dark' ? '#0b0f14' : '#f4f6f9';
}
mediaDark.addEventListener('change', ()=>{ if(S.theme==='auto') applyTheme(); });

/* ======================= render core ======================= */
function go(screen){
  V.screen = screen;
  render();
  window.scrollTo(0,0);
}
function render(){
  renderTopbar();
  renderTabbar();
  const el = $('#screen');
  if(V.screen==='home')          el.innerHTML = htmlHome();
  else if(V.screen==='workout')  el.innerHTML = htmlWorkout();
  else if(V.screen==='program')  el.innerHTML = htmlProgram();
  else if(V.screen==='splitview')el.innerHTML = htmlSplitView();
  else if(V.screen==='tpledit')  el.innerHTML = htmlTplEdit();
  else if(V.screen==='exercises')el.innerHTML = htmlExercises();
  else if(V.screen==='exdetail') el.innerHTML = htmlExDetail();
  else if(V.screen==='history')  el.innerHTML = htmlHistory();
  else if(V.screen==='settings') el.innerHTML = htmlSettings();
  syncWakeLock();
}
function renderTopbar(){
  let h = '';
  if(V.screen==='workout' && S.active){
    const el = fmtTime((Date.now()-new Date(S.active.startedAt).getTime())/1000);
    h = `<button class="iconbtn" onclick="go('home')">‹</button>
         <div class="elapsed"><small>${t('woElapsed')} · ${esc(S.active.name)}</small><span id="elapsed-time">${el}</span></div>
         <button class="finishbtn" onclick="finishWorkout()">${t('woFinish')}</button>`;
  }else if(V.screen==='tpledit'){
    const d = S.templates.find(x=>x.id===V.editTpl);
    h = `<button class="iconbtn" onclick="closeTplEdit()">‹</button><h1>${d?esc(d.name):''}</h1>
         <button class="finishbtn" onclick="closeTplEdit()">✓ ${t('saveDone')}</button>`;
  }else if(V.screen==='splitview'){
    const f = S.folders.find(x=>x.id===V.viewFolder);
    h = `<button class="iconbtn" onclick="go('program')">‹</button><h1>${f?esc(f.name):''}</h1>
         <button class="finishbtn" onclick="go('program')">✓ ${t('saveDone')}</button>`;
  }else if(V.screen==='exdetail'){
    h = `<button class="iconbtn" onclick="go('exercises')">‹</button><h1>${esc(exName(V.exDetail, V.exDetailName))}</h1>`;
  }else{
    const titles = { home:'Daveedus', program:t('tabProgram'), exercises:t('tabExercises'),
                     history:t('tabHistory'), settings:t('tabSettings') };
    h = `<h1>${titles[V.screen]||'Daveedus'}</h1>`;
    if(V.screen==='home' && S.active){
      h += `<button class="finishbtn" onclick="go('workout')">▶ ${fmtTime((Date.now()-new Date(S.active.startedAt).getTime())/1000)}</button>`;
    }
  }
  $('#topbar').innerHTML = h;
}
const TAB_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/></svg>',
  program: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="3.5" cy="12" r="1" fill="currentColor"/><circle cx="3.5" cy="18" r="1" fill="currentColor"/></svg>',
  exercises: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 21v-6M4 9V3M12 21v-9M12 6V3M20 21v-4M20 11V3M2 15h4M10 12h4M18 17h4"/></svg>'
};
function renderTabbar(){
  const tabs = [
    ['home', t('tabHome'), ['home','workout']],
    ['program', t('tabProgram'), ['program','splitview','tpledit']],
    ['exercises', t('tabExercises'), ['exercises','exdetail']],
    ['history', t('tabHistory'), ['history']],
    ['settings', t('tabSettings'), ['settings']]
  ];
  $('#tabinner').innerHTML = tabs.map(([id,lb,grp]) =>
    `<button class="${grp.includes(V.screen)?'on':''}" onclick="go('${id}')">${TAB_ICONS[id]}${lb}</button>`).join('');
}

/* ======================= HOME ======================= */
function weekCount(){
  const now = new Date();
  const day = (now.getDay()+6)%7; /* Monday = 0 */
  const monday = new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate()-day);
  return S.history.filter(h=>!h.arch && new Date(h.date)>=monday).length;
}
function htmlHome(){
  const dateStr = new Date().toLocaleDateString(S.lang==='lt'?'lt-LT':'en-GB',
    { weekday:'long', month:'long', day:'numeric' });
  let h = `<div class="hero"><div class="date">${esc(dateStr)}</div></div>`;
  if(needBackupReminder()){
    h += `<div class="card" style="display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--orange)">💾 ${t('bakRemind')}</span>
      <button class="btn small" style="background:var(--accent);color:var(--on-accent)" onclick="copyBackup();render()">${t('copy')}</button>
      <button class="minibtn" style="width:32px;min-height:32px;font-size:12px" onclick="S.bakSnooze=Date.now(); save(); render()">✕</button>
    </div>`;
  }
  h += `<div class="statrow">
      <div class="stat"><div class="v">${weekCount()}</div><div class="l">${t('statWeek')}</div></div>
      <div class="stat"><div class="v">${S.history.length}</div><div class="l">${t('statTotal')}</div></div>
      <div class="stat" style="cursor:pointer" onclick="go('history')">
        <div class="v">${S.weights.length?fmtW(S.weights[0].kg):'—'}</div><div class="l">${t('bw').toLowerCase()}, kg</div></div>
    </div>`;
  if(S.active){
    const n = S.active.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
    h += `<h2 class="sec">${t('homeContinue')}</h2>
      <button class="tplbtn continue" onclick="go('workout')">
        <div class="tinfo"><div class="tname">${esc(S.active.name)}</div>
        <div class="tsub"><span id="home-elapsed">${fmtTime((Date.now()-new Date(S.active.startedAt).getTime())/1000)}</span> · ${n} ✓</div></div>
        <div class="go">▶</div></button>`;
  }
  const tplBtn = (d, isNext) => {
    const last = S.history.find(x=>x.tplId===d.id);
    const names = d.ex.slice(0,3).map(e=>exName(e.k,e.n)).join(', ') + (d.ex.length>3?'…':'');
    return `<button class="tplbtn ${isNext?'next':''}" onclick="startWorkout('${d.id}')">
      <div class="tinfo"><div class="tname">${esc(d.name)}${isNext?` <span class="nextchip">${t('nextBadge')}</span>`:''}</div>
      <div class="tsub">${last?daysAgoStr(last.date):t('never')} · ${esc(names)}</div></div>
      <div class="go">▶</div></button>`;
  };
  /* home shows only PINNED splits as a grid of split cards; fall back to all when none pinned */
  const pinned = S.folders.filter(f=>f.pinned);
  const showFolders = pinned.length ? pinned : S.folders;
  const cards = showFolders.map(f=>{
    const tpls = S.templates.filter(x=>x.folderId===f.id);
    if(!tpls.length) return '';
    /* suggest the workout AFTER the most recently done one in this split (cyclic) */
    let nextId = tpls[0].id;
    for(const hw of S.history){
      if(hw.arch) continue;
      const idx = tpls.findIndex(x=>x.id===hw.tplId);
      if(idx>=0){ nextId = tpls[(idx+1)%tpls.length].id; break; }
    }
    const rows = tpls.map(d=>`<button class="sprow ${d.id===nextId?'next':''}" onclick="startWorkout('${d.id}')">
      <span class="spn">${esc(d.name)}</span>
      ${d.id===nextId?`<span class="nextchip">${t('nextBadge')}</span>`:''}</button>`).join('');
    return `<div class="splitcard">
      <div class="sphead" onclick="openSplit('${f.id}')">${esc(f.name)} ›</div>${rows}</div>`;
  }).filter(Boolean);
  if(cards.length) h += `<h2 class="sec">${t('homeTemplates')}</h2><div class="splitgrid">${cards.join('')}</div>`;
  const loose = looseTemplates();
  if(loose.length && !pinned.length){
    h += `<h2 class="sec">${S.folders.length?t('folderNone'):t('homeTemplates')}</h2>` + loose.map(d=>tplBtn(d,false)).join('');
  }
  return h;
}

/* ======================= WORKOUT ======================= */
function buildActiveEx(k, name, sets, reps, ss){
  const last = lastForExercise(k, name);
  return { id:uid(), k, name, targetSets:sets, targetReps:reps, note:'', ss:!!ss, last,
    sets: Array.from({length:sets}, ()=>({ w:'', r:'', warm:false, drop:false, done:false, cls:'' })) };
}
function lastForExercise(k, name){
  const nm = (name||'').trim().toLowerCase();
  for(const h of S.history){
    if(h.arch) continue;
    for(const e of h.exercises){
      if(e.k===k || (nm && e.name && e.name.trim().toLowerCase()===nm)){
        if(e.sets && e.sets.length) return { date:h.date, sets:e.sets, note:e.note||'' };
      }
    }
  }
  return null;
}
function startWorkout(tplId){
  const tpl = S.templates.find(d=>d.id===tplId);
  if(!tpl) return;
  if(S.active){
    if(!confirm(t('woSwitchConfirm'))) return;
  }
  S.active = {
    tplId: tpl.id, name: tpl.name, startedAt: new Date().toISOString(), rest:null,
    exercises: tpl.ex.map(e => buildActiveEx(e.k, exName(e.k,e.n), e.s, e.r, e.ss))
  };
  save();
  go('workout');
}
/* ghost = values shown as placeholder / "previous" column */
function ghostFor(ex, si){
  const cur = ex.sets[si];
  const prev = ex.last ? ex.last.sets : null;
  if(cur.warm){
    if(!prev) return null;
    const prevWarm = prev.filter(s=>s.warm);
    let wi = 0; for(let i=0;i<si;i++) if(ex.sets[i].warm) wi++;
    return prevWarm[wi] || null;
  }
  if(cur.drop){
    if(!prev) return null;
    const prevDrop = prev.filter(s=>s.drop);
    let di = 0; for(let i=0;i<si;i++) if(ex.sets[i].drop) di++;
    return prevDrop[di] || null;
  }
  if(!prev) return null;
  const prevWork = prev.filter(s=>!s.warm && !s.drop);
  if(!prevWork.length) return null;
  let wi = 0; for(let i=0;i<si;i++) if(!ex.sets[i].warm && !ex.sets[i].drop) wi++;
  return prevWork[Math.min(wi, prevWork.length-1)] || null;
}
/* comparison target = same working set of the previous session */
function realPrev(ex, si){
  const prev = ex.last ? ex.last.sets : null;
  if(!prev) return null;
  const cur = ex.sets[si];
  if(cur.warm || cur.drop) return null;
  const prevWork = prev.filter(s=>!s.warm && !s.drop);
  if(!prevWork.length) return null;
  let wi = 0; for(let i=0;i<si;i++) if(!ex.sets[i].warm && !ex.sets[i].drop) wi++;
  return prevWork[Math.min(wi, prevWork.length-1)] || null;
}
function htmlWorkout(){
  if(!S.active){ V.screen='home'; return htmlHome(); }
  let h = '<div style="height:8px"></div>';
  h += S.active.exercises.map((ex,xi)=>{
    const tm = isTimeEx(ex.k);
    const hdr = `<div class="setgrid hdr"><div>${t('woSet')}</div><div>${t('woPrev')}</div>
      <div>${t('woKg')}</div><div>${tm?t('woSec'):t('woReps')}</div><div>✓</div><div></div></div>`;
    let workNum = 0;
    const rows = ex.sets.map((s,si)=>{
      const g = ghostFor(ex,si);
      const prevTxt = g ? (tm ? `${g.weight?fmtW(g.weight)+' kg · ':''}${g.reps} s`
                              : `${fmtW(g.weight)} ${t('woKg')} × ${g.reps}`) : '—';
      const label = s.warm ? 'W' : s.drop ? 'D' : String(++workNum);
      const chkCls = s.done ? (s.cls==='loss' ? 'loss' : 'done') : '';
      const restHere = S.active.rest && S.active.rest.key===xi+'-'+si;
      const rowBtn = s.drop
        ? `<button class="dropbtn del" onclick="removeDrop(${xi},${si})">✕</button>`
        : `<button class="dropbtn" onclick="addDrop(${xi},${si})">D+</button>`;
      return `<div class="setrow-wrap ${s.done?'done':''} ${s.drop?'droprow':''}">
        <div class="setgrid">
          <button class="setnum ${s.warm?'warm':''} ${s.drop?'dropn':''}" onclick="toggleWarm(${xi},${si})">${label}</button>
          <div class="prev">${prevTxt}</div>
          <input type="text" inputmode="decimal" placeholder="${g?fmtW(g.weight):t('woKg')}" value="${esc(s.w)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'w',this.value)">
          <input type="text" inputmode="numeric" placeholder="${g?g.reps:(tm?'s':'×')}" value="${esc(s.r)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'r',this.value)">
          <button class="checkbtn ${chkCls}" onclick="toggleSet(${xi},${si})">✓</button>
          ${rowBtn}
        </div>
        ${restHere ? restBarHtml() : ''}
      </div>`;
    }).join('');
    const notLast = xi < S.active.exercises.length-1;
    const ssConn = (ex.ss && notLast) ? `<div class="ssline">🔗 ${t('superset')}</div>` : '';
    return `<div class="card">
      <div class="exhead">
        <div class="exname" onclick="openExDetailByKey('${esc(ex.k)}')">${esc(ex.name)}</div>
        <div class="extarget">${ex.targetSets}×${ex.targetReps}</div>
        <button class="minibtn" onclick="openPlates(${xi})">⚖</button>
        ${notLast?`<button class="minibtn ${ex.ss?'acc':''}" onclick="toggleWoSS(${xi})">🔗</button>`:''}
        <button class="minibtn del" onclick="removeWorkoutEx(${xi})">✕</button>
      </div>
      ${ex.last && ex.last.note ? `<div class="lastnote">💬 ${esc(ex.last.note)}</div>` : ''}
      <input class="exnote" placeholder="${t('woNote')}" value="${esc(ex.note)}" oninput="onNoteInput(${xi},this.value)">
      ${hdr}${rows}
      <div class="setctl">
        <button onclick="addSet(${xi})">${t('woAddSet')}</button>
        <button onclick="removeSet(${xi})">${t('woRemoveSet')}</button>
      </div>
    </div>${ssConn}`;
  }).join('');
  h += `<button class="btn ghostbtn" onclick="addWorkoutEx()">${t('woAddEx')}</button>`;
  h += `<button class="btn primary" onclick="finishWorkout()">${t('woFinish')} ✓</button>`;
  h += `<button class="btn danger" onclick="cancelWorkout()">${t('woCancel')}</button>`;
  return h;
}
function restBarHtml(){
  return `<div class="restbar" id="restbar" onclick="dismissRest()">
    <span class="pulse"></span>
    <span class="tm" id="rest-time">${t('restLabel')} 0:00</span>
  </div>`;
}
function dismissRest(){
  if(S.active) S.active.rest = null;
  save(); render();
}
function onSetInput(xi,si,f,v){ S.active.exercises[xi].sets[si][f]=v; save(); }
function onNoteInput(xi,v){ S.active.exercises[xi].note=v; save(); }
function toggleWarm(xi,si){
  const s = S.active.exercises[xi].sets[si];
  if(s.done || s.drop) return;
  s.warm = !s.warm;
  save(); render();
}
function shiftRestKey(xi, fromSi, delta){
  /* keep the inline rest bar anchored to the same row when rows are inserted/removed above it */
  const r = S.active.rest;
  if(!r) return;
  const [rx, rs] = r.key.split('-').map(Number);
  if(rx!==xi) return;
  if(rs >= fromSi) r.key = xi+'-'+(rs+delta);
}
function addDrop(xi,si){
  S.active.exercises[xi].sets.splice(si+1, 0, {w:'',r:'',warm:false,drop:true,done:false,cls:''});
  shiftRestKey(xi, si+1, 1);
  save(); render();
}
function removeDrop(xi,si){
  const s = S.active.exercises[xi].sets[si];
  if(!s || !s.drop) return;
  if(s.done){ toast(t('woRemoveDone')); return; }
  S.active.exercises[xi].sets.splice(si,1);
  shiftRestKey(xi, si+1, -1);
  save(); render();
}
function toggleSet(xi,si){
  const ex = S.active.exercises[xi];
  const s = ex.sets[si];
  if(s.done){ s.done=false; s.cls=''; save(); render(); return; }
  const g = ghostFor(ex,si);
  let w = parseNum(s.w), r = parseNum(s.r);
  if(isNaN(w) && g) w = g.weight;
  if(isNaN(r) && g) r = g.reps;
  if(isNaN(w) && isTimeEx(ex.k)) w = 0; /* plank & co: weight optional */
  if(isNaN(w) || isNaN(r)){ toast(t('woEmptyVals')); return; }
  s.w = fmtW(w); s.r = String(Math.round(r)); s.done = true;
  const real = realPrev(ex,si);
  if(!real || s.warm || s.drop) s.cls = 'none';
  else if(w>real.weight || (w===real.weight && r>real.reps)) s.cls='win';
  else if(w===real.weight && r===real.reps) s.cls='even';
  else s.cls='loss';
  S.active.rest = { at:Date.now(), key:xi+'-'+si };
  save(); render();
}
function addSet(xi){
  S.active.exercises[xi].sets.push({w:'',r:'',warm:false,drop:false,done:false,cls:''});
  save(); render();
}
function removeSet(xi){
  const sets = S.active.exercises[xi].sets;
  if(sets.length<=1) return;
  if(sets[sets.length-1].done){ toast(t('woRemoveDone')); return; }
  sets.pop();
  save(); render();
}
function addWorkoutEx(){
  openPicker(info=>{
    S.active.exercises.push(buildActiveEx(info.id, info.n, 3, 10));
    save(); closeModal(); render();
  });
}
function toggleWoSS(xi){
  if(xi >= S.active.exercises.length-1) return;
  S.active.exercises[xi].ss = !S.active.exercises[xi].ss;
  save(); render();
}
function removeWorkoutEx(xi){
  const ex = S.active.exercises[xi];
  if(!confirm(t('woDelEx',{n:ex.name}))) return;
  if(S.active.rest && S.active.rest.key.split('-')[0]==String(xi)) S.active.rest=null;
  S.active.exercises.splice(xi,1);
  save(); render();
}
function finishWorkout(){
  if(!S.active) return;
  const exercises = S.active.exercises.map(ex=>({
    k:ex.k, name:ex.name, targetSets:ex.targetSets, targetReps:ex.targetReps, note:ex.note||'', ss:!!ex.ss,
    sets: ex.sets.filter(s=>s.done).map(s=>({ weight:parseNum(s.w), reps:parseNum(s.r), warm:!!s.warm, drop:!!s.drop }))
  })).filter(e=>e.sets.length);
  if(!exercises.length){
    if(confirm(t('woFinishEmpty'))){ S.active=null; save(); go('home'); }
    return;
  }
  const total = S.active.exercises.reduce((a,e)=>a+e.sets.length,0);
  const done  = S.active.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  if(done < total && !confirm(t('woFinishPart'))) return;
  /* detect all-time PRs BEFORE this workout enters history */
  const prs = [];
  for(const e of exercises){
    const work = e.sets.filter(s=>!s.warm && !s.drop);
    if(!work.length) continue;
    const prev = exStats(e.k, e.name);
    if(isTimeEx(e.k)){
      const bt = Math.max(...work.map(s=>s.reps));
      if(prev.bestTime>0 && bt>prev.bestTime) prs.push({ name:e.name, txt:bt+' s' });
    }else{
      const bw = Math.max(...work.map(s=>s.weight));
      if(prev.best>0 && bw>prev.best) prs.push({ name:e.name, txt:fmtW(bw)+' kg' });
    }
  }
  const dur = Math.round((Date.now()-new Date(S.active.startedAt).getTime())/1000);
  const vol = exercises.reduce((a,e)=>a+e.sets.filter(s=>!s.warm).reduce((b,s)=>b+s.weight*s.reps,0),0);
  S.history.unshift({
    id:uid(), tplId:S.active.tplId, name:S.active.name, date:new Date().toISOString(),
    dur, exercises
  });
  S.active = null;
  save();
  go('home');
  showSummary(dur, vol, done, prs);
}
function showSummary(dur, vol, setsDone, prs){
  const prHtml = prs.length ? `<h2 class="sec" style="margin-top:14px">🏆 ${t('sumPRs')}</h2>` +
    prs.map(p=>`<div class="card" style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px">
      <span style="flex:1;font-weight:700">${esc(p.name)}</span>
      <span style="font-weight:800;color:var(--accent-soft);font-size:18px">${p.txt} 🎉</span></div>`).join('') : '';
  openModal(`<h3>${t('sumTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="statrow">
      <div class="stat"><div class="v">${fmtTime(dur)}</div><div class="l">${t('sumDur')}</div></div>
      <div class="stat"><div class="v">${Math.round(vol)}</div><div class="l">${t('sumVol')}, kg</div></div>
      <div class="stat"><div class="v">${setsDone}</div><div class="l">${t('sumSets')}</div></div>
    </div>
    ${prHtml}
    <button class="btn primary" style="margin-top:14px" onclick="closeModal()">${t('sumOk')}</button>`);
}
function cancelWorkout(){
  if(!confirm(t('woCancelConfirm'))) return;
  S.active = null;
  save();
  go('home');
}

/* ============== elapsed + rest tick (no full re-render) ============== */
function tick(){
  if(!S.active) return;
  const now = Date.now();
  const elapsed = fmtTime((now - new Date(S.active.startedAt).getTime())/1000);
  const el = $('#elapsed-time'); if(el) el.textContent = elapsed;
  const he = $('#home-elapsed'); if(he) he.textContent = elapsed;
  const r = S.active.rest;
  if(r && V.screen==='workout'){
    const tm = $('#rest-time');
    if(tm) tm.textContent = t('restLabel')+' '+fmtTime((now - r.at)/1000);
  }
}

/* ======================= PROGRAM (splits + templates) ======================= */
function tplCardHtml(d){
  const groups = [...new Set(d.ex.map(e=>{ const i=exInfo(e.k); return i?t('g_'+i.g):null; }).filter(Boolean))].slice(0,3).join(', ');
  return `<div class="card"><div class="tplrow">
    <div class="info" onclick="openTpl('${d.id}')">
      <div class="nm">${esc(d.name)}</div>
      <div class="ct">${t('tplExCount',{n:d.ex.length})}${groups?' · '+esc(groups):''}</div>
    </div>
    <button class="minibtn acc" onclick="startWorkout('${d.id}')">▶</button>
    <button class="minibtn" onclick="openTpl('${d.id}')">✎</button>
    <button class="minibtn del" onclick="delTpl('${d.id}')">✕</button>
  </div></div>`;
}
function looseTemplates(){
  return S.templates.filter(x=>!x.folderId || !S.folders.some(f=>f.id===x.folderId));
}
function htmlProgram(){
  let h = '<div style="height:8px"></div>';
  h += S.folders.map(f=>{
    const tpls = S.templates.filter(x=>x.folderId===f.id);
    const names = tpls.slice(0,4).map(x=>x.name).join(', ');
    return `<div class="tplbtn" onclick="openSplit('${f.id}')">
      <div class="tinfo"><div class="tname">${esc(f.name)} <span style="color:var(--dim);font-weight:700;font-size:14px">(${tpls.length})</span></div>
      <div class="tsub">${esc(names)||'—'}</div></div>
      <button class="minibtn ${f.pinned?'acc':''}" style="${f.pinned?'':'opacity:.4'}"
        onclick="event.stopPropagation(); togglePin('${f.id}')">📌</button>
      <div class="go">›</div></div>`;
  }).join('');
  const loose = looseTemplates();
  if(loose.length){
    if(S.folders.length) h += `<h2 class="sec">${t('folderNone')}</h2>`;
    h += loose.map(tplCardHtml).join('');
  }
  h += `<div style="height:8px"></div>
        <button class="btn ghostbtn" onclick="addFolder()">${t('folderNew')}</button>
        <button class="btn ghostbtn" onclick="addTpl()">${t('tplNew')}</button>
        <button class="btn" onclick="openImportModal('tpl')">${t('tplImport')}</button>`;
  return h;
}
function openSplit(id){
  V.viewFolder = id;
  go('splitview');
}
function togglePin(id){
  const f = S.folders.find(x=>x.id===id);
  if(!f) return;
  f.pinned = !f.pinned;
  save(); render();
}
function htmlSplitView(){
  const f = S.folders.find(x=>x.id===V.viewFolder);
  if(!f){ V.screen='program'; return htmlProgram(); }
  const tpls = S.templates.filter(x=>x.folderId===f.id);
  let h = `<div style="height:8px"></div>
    <div class="card">
      <div style="color:var(--dim);font-size:13px;margin-bottom:6px">${t('folderName')}</div>
      <input class="nameinput" type="text" value="${esc(f.name)}" oninput="renameFolder('${f.id}',this.value)">
    </div>`;
  h += tpls.map(tplCardHtml).join('') || `<div class="empty">—</div>`;
  h += `<button class="btn ghostbtn" onclick="addTplTo('${f.id}')">${t('tplNew')}</button>
        <button class="btn primary" onclick="go('program')">✓ ${t('saveDone')}</button>
        <button class="btn" onclick="shareFolder('${f.id}')">⤴ ${t('folderShare')}</button>
        <button class="btn danger" onclick="delFolder('${f.id}')">✕ ${t('deleteBtn')}</button>`;
  return h;
}
function addFolder(){
  const f = { id:uid(), name:t('folderDefault'), open:true };
  S.folders.push(f);
  save();
  openSplit(f.id);
}
function renameFolder(id,v){
  const f = S.folders.find(x=>x.id===id);
  if(!f) return;
  f.name = v;
  save(); renderTopbar();
}
function delFolder(id){
  const f = S.folders.find(x=>x.id===id);
  if(!f || !confirm(t('folderDel',{n:f.name}))) return;
  S.templates.forEach(tp=>{ if(tp.folderId===id) tp.folderId=null; });
  S.folders = S.folders.filter(x=>x.id!==id);
  save();
  go('program');
}
function shareFolder(id){
  const f = S.folders.find(x=>x.id===id);
  if(!f) return;
  const tpls = S.templates.filter(x=>x.folderId===id);
  const payload = { t:'folder', name:f.name,
    tpls: tpls.map(d=>({ name:d.name, ex:d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0 })) })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('folderShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('folderShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">⤴ ${t('copy')}</button>`);
}
function openTpl(id){ V.editTpl=id; go('tpledit'); }
function closeTplEdit(){
  const d = S.templates.find(x=>x.id===V.editTpl);
  if(d && d.folderId && S.folders.some(f=>f.id===d.folderId)) openSplit(d.folderId);
  else go('program');
}
function addTpl(){ addTplTo(null); }
function addTplTo(fid){
  const d = { id:uid(), name:t('tplDefaultName'), folderId:fid||null, ex:[] };
  S.templates.push(d);
  save();
  openTpl(d.id);
}
function delTpl(id){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !confirm(t('tplDel',{n:d.name}))) return;
  S.templates = S.templates.filter(x=>x.id!==id);
  save(); render();
}
function htmlTplEdit(){
  const d = S.templates.find(x=>x.id===V.editTpl);
  if(!d){ V.screen='program'; return htmlProgram(); }
  const folderOpts = `<option value="">${t('folderNone')}</option>` +
    S.folders.map(f=>`<option value="${f.id}" ${d.folderId===f.id?'selected':''}>${esc(f.name)}</option>`).join('');
  let h = `<div style="height:8px"></div>
    <div class="card">
      <div class="ct" style="color:var(--dim);font-size:13px;margin-bottom:6px">${t('tplName')}</div>
      <input class="nameinput" type="text" value="${esc(d.name)}" oninput="renameTpl('${d.id}',this.value)">
      <div class="ct" style="color:var(--dim);font-size:13px;margin:12px 0 6px">${t('tplFolder')}</div>
      <select class="nameinput" style="width:100%" onchange="setTplFolder('${d.id}',this.value)">${folderOpts}</select>
    </div>
    <div class="card">`;
  h += d.ex.map((e,i)=>{
    const info = exInfo(e.k);
    return `<div class="exedit">
      <div class="row1">
        <div class="exlabel">
          <div class="n">${esc(exName(e.k,e.n))}</div>
          <div class="gr">${info?t('g_'+info.g)+' · '+t('e_'+info.e):''}</div>
        </div>
        <button class="minibtn" onclick="moveTplEx('${d.id}',${i},-1)">↑</button>
        <button class="minibtn" onclick="moveTplEx('${d.id}',${i},1)">↓</button>
        <button class="minibtn del" onclick="delTplEx('${d.id}',${i})">✕</button>
      </div>
      <div class="row2">
        <div class="numfield">
          <button onclick="bumpTplEx('${d.id}',${i},'s',-1)">−</button><span class="val">${e.s}</span>
          <button onclick="bumpTplEx('${d.id}',${i},'s',1)">+</button><span class="lbl">${t('daySets')}</span>
        </div>
        <div class="numfield">
          <button onclick="bumpTplEx('${d.id}',${i},'r',-1)">−</button><span class="val">${e.r}</span>
          <button onclick="bumpTplEx('${d.id}',${i},'r',1)">+</button><span class="lbl">${t('dayReps')}</span>
        </div>
        ${i<d.ex.length-1?`<button class="minibtn ${e.ss?'acc':''}" style="margin-left:auto" onclick="toggleSS('${d.id}',${i})">🔗</button>`:''}
      </div>
      ${e.ss && i<d.ex.length-1?`<div class="ssline">🔗 ${t('superset')}</div>`:''}
    </div>`;
  }).join('');
  if(!d.ex.length) h += `<div class="empty">—</div>`;
  h += `</div>
    <button class="btn ghostbtn" onclick="addTplEx('${d.id}')">${t('tplAddEx')}</button>
    <button class="btn primary" onclick="closeTplEdit()">✓ ${t('saveDone')}</button>
    <button class="btn" onclick="dupTpl('${d.id}')">⧉ ${t('tplDup')}</button>
    <button class="btn" onclick="shareTpl('${d.id}')">⤴ ${t('tplShare')}</button>`;
  return h;
}
function dupTpl(id){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  const copy = { id:uid(), name:(d.name+' '+t('tplDupSuffix')).slice(0,60), folderId:d.folderId,
    ex: d.ex.map(e=>({ id:uid(), k:e.k, s:e.s, r:e.r, ss:!!e.ss })) };
  S.templates.splice(S.templates.indexOf(d)+1, 0, copy);
  save();
  openTpl(copy.id);
}
function renameTpl(id,v){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  d.name = v;
  save(); renderTopbar();
}
function setTplFolder(id,fid){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  d.folderId = fid || null;
  save();
}
function moveTplEx(id,i,dir){
  const d = S.templates.find(x=>x.id===id);
  const j = i+dir;
  if(!d || j<0 || j>=d.ex.length) return;
  [d.ex[i],d.ex[j]] = [d.ex[j],d.ex[i]];
  save(); render();
}
function bumpTplEx(id,i,f,delta){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  d.ex[i][f] = Math.max(1, Math.min(f==='s'?12:50, d.ex[i][f]+delta));
  save(); render();
}
function addTplEx(id){
  openPicker(info=>{
    const d = S.templates.find(x=>x.id===id);
    if(!d) return;
    d.ex.push({ id:uid(), k:info.id, s:3, r:10 });
    save(); closeModal(); render();
  });
}
function toggleSS(id,i){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  d.ex[i].ss = !d.ex[i].ss;
  save(); render();
}
function delTplEx(id,i){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  if(!confirm(t('tplDelEx',{n:exName(d.ex[i].k)}))) return;
  d.ex.splice(i,1);
  save(); render();
}

/* ======================= EXERCISE PICKER (modal) ======================= */
function openModal(html){
  $('#modalsheet').innerHTML = html;
  $('#modal').classList.add('show');
}
function closeModal(){
  $('#modal').classList.remove('show');
  V.pickerCb = null;
}
function openPicker(cb){
  V.pickerCb = cb; V.pickerQ='';
  V.pickerG = doneExerciseList().length ? 'mine' : 'all';
  openModal(`<h3>${t('tabExercises')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="searchbox">${TAB_ICONS.exercises}
      <input id="pk-q" type="text" placeholder="${t('exSearch')}" oninput="V.pickerQ=this.value; renderPickerList()">
    </div>
    <div class="chips" id="pk-chips"></div>
    <div id="pk-list"></div>`);
  renderPickerChips();
  renderPickerList();
}
function renderPickerChips(){
  const el = $('#pk-chips');
  if(!el) return;
  el.innerHTML = ['mine','all'].concat(EX_GROUPS).map(g=>
    `<button class="chip ${V.pickerG===g?'on':''}" onclick="V.pickerG='${g}'; renderPickerChips(); renderPickerList()">${chipLabel(g)}</button>`).join('');
}
function filterExercises(q, g){
  q = (q||'').trim().toLowerCase();
  return allExercises().filter(x=>
    (g==='all' || x.g===g) && (!q || x.n.toLowerCase().includes(q)))
    .sort((a,b)=>a.n.localeCompare(b.n));
}
function renderPickerList(){
  const el = $('#pk-list');
  if(!el) return;
  let list;
  if(V.pickerG==='mine'){
    const q = (V.pickerQ||'').trim().toLowerCase();
    list = doneExerciseList().filter(x=>!q || x.n.toLowerCase().includes(q));
  }else{
    list = filterExercises(V.pickerQ, V.pickerG);
  }
  el.innerHTML = list.map(x=>
    `<button class="exitem" onclick="pickEx('${x.id}')">
      <div class="xi"><div class="xn">${esc(x.n)}</div>
      <div class="xg">${t('g_'+x.g)} · ${t('e_'+x.e)}</div></div></button>`).join('')
    + `<button class="btn ghostbtn" style="margin-top:4px" onclick="openCustomExForm()">${t('exCreate')}</button>`;
}
function pickEx(id){
  const info = exInfo(id);
  if(info && V.pickerCb) V.pickerCb(info);
}
function openCustomExForm(){
  const groups = EX_GROUPS.map(g=>`<option value="${g}">${t('g_'+g)}</option>`).join('');
  openModal(`<h3>${t('exCreateTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="card">
      <div style="color:var(--dim);font-size:13px;margin-bottom:6px">${t('exCreateName')}</div>
      <input class="nameinput" id="cx-name" type="text">
      <div style="color:var(--dim);font-size:13px;margin:12px 0 6px">${t('exCreateGroup')}</div>
      <select class="nameinput" id="cx-group" style="width:100%">${groups}</select>
      <div style="color:var(--dim);font-size:13px;margin:12px 0 6px">${t('exCreateMode')}</div>
      <select class="nameinput" id="cx-mode" style="width:100%">
        <option value="r">${t('modeReps')}</option>
        <option value="t">${t('modeTime')}</option>
      </select>
    </div>
    <button class="btn primary" onclick="saveCustomEx()">${t('exCreateSave')}</button>`);
  setTimeout(()=>{ const i=$('#cx-name'); if(i) i.focus(); }, 50);
}
function saveCustomEx(){
  const name = ($('#cx-name').value||'').trim();
  const g = $('#cx-group').value;
  if(!name){ toast(t('exNameReq')); return; }
  const info = { id:'custom-'+uid(), n:name, g, e:'other' };
  if($('#cx-mode') && $('#cx-mode').value==='t') info.m = 't';
  S.customEx.push(info);
  save();
  if(V.pickerCb){ V.pickerCb(info); }
  else { closeModal(); render(); }
}

/* ======================= EXERCISES tab ======================= */
/* exercises the user has actually done, most recent first */
function doneExerciseList(){
  const seen = new Map();
  for(const h of S.history){
    if(h.arch) continue;
    for(const e of h.exercises){
      const info = exInfo(e.k) ||
        allExercises().find(x=>x.n.toLowerCase()===(e.name||'').trim().toLowerCase());
      if(info && !seen.has(info.id)) seen.set(info.id, info);
    }
  }
  return [...seen.values()];
}
function chipLabel(g){ return g==='mine' ? t('exMine') : t('g_'+g); }
function exStats(k, name, tplName){
  const nm = (name||'').trim().toLowerCase();
  let best = 0, bestTime = 0, e1rm = 0, bestVol = 0, bestSet = null, sessions = 0, lastDate = null;
  for(const h of S.history){
    if(h.arch || (tplName && h.name!==tplName)) continue;
    for(const e of h.exercises){
      if(e.k===k || (nm && e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm && !s.drop);
        if(work.length){
          sessions++;
          if(!lastDate) lastDate = h.date;
          for(const s of work){
            best = Math.max(best, s.weight);
            bestTime = Math.max(bestTime, s.reps);
            const est = s.weight * (1 + s.reps/30); /* Epley */
            if(est > e1rm) e1rm = est;
            const v = s.weight * s.reps;
            if(v > bestVol){ bestVol = v; bestSet = s; }
          }
        }
      }
    }
  }
  return { best, bestTime, e1rm, bestSet, sessions, lastDate };
}
function htmlExercises(){
  let h = `<div style="height:8px"></div>
    <div class="searchbox">${TAB_ICONS.exercises}
      <input id="ex-q" type="text" value="${esc(V.exQ)}" placeholder="${t('exSearch')}"
        oninput="V.exQ=this.value; renderExList()">
    </div>
    <div class="chips">` + ['mine','all'].concat(EX_GROUPS).map(g=>
      `<button class="chip ${V.exG===g?'on':''}" onclick="V.exG='${g}'; render()">${chipLabel(g)}</button>`).join('')
    + `</div><div id="ex-list"></div>`;
  return h;
}
function renderExList(){
  const el = $('#ex-list');
  if(!el) return;
  let list;
  if(V.exG==='mine'){
    const q = (V.exQ||'').trim().toLowerCase();
    list = doneExerciseList().filter(x=>!q || x.n.toLowerCase().includes(q));
    if(!list.length){
      el.innerHTML = `<div class="empty">${t('exMineEmpty')}</div>`;
      return;
    }
  }else{
    list = filterExercises(V.exQ, V.exG);
  }
  el.innerHTML = list.map(x=>{
    const st = exStats(x.id, x.n);
    return `<button class="exitem" onclick="openExDetailByKey('${x.id}')">
      <div class="xi"><div class="xn">${esc(x.n)}</div>
      <div class="xg">${t('g_'+x.g)} · ${t('e_'+x.e)}</div></div>
      ${st.best?`<div class="best">${fmtW(st.best)} kg</div>`:''}</button>`;
  }).join('') + `<button class="btn ghostbtn" style="margin-top:4px" onclick="openCustomExForm()">${t('exCreate')}</button>`;
}
function openExDetailByKey(k){
  V.exDetail = k;
  V.exTplFilter = '';
  const i = exInfo(k);
  V.exDetailName = i ? i.n : k;
  closeModal();
  go('exdetail');
}
function htmlExDetail(){
  const k = V.exDetail;
  const info = exInfo(k);
  const name = info ? info.n : (V.exDetailName||k);
  const nm = name.trim().toLowerCase();
  const matches = e => e.k===k || (e.name && e.name.trim().toLowerCase()===nm);
  const filter = V.exTplFilter || null;
  const st = exStats(k, name, filter);
  let h = `<div style="height:8px"></div>`;
  if(info) h += `<div style="color:var(--dim);font-size:14px;margin:0 4px 12px">${t('g_'+info.g)} · ${t('e_'+info.e)}</div>`;
  /* filter chips: analyse this exercise per template (e.g. Upper A vs Upper B) */
  V.exFilterNames = [...new Set(S.history.filter(w=>!w.arch && w.exercises.some(matches)).map(w=>w.name))];
  if(V.exFilterNames.length>1){
    h += `<div class="chips">
      <button class="chip ${!filter?'on':''}" onclick="V.exTplFilter=''; render()">${t('g_all')}</button>` +
      V.exFilterNames.map((n,i)=>
        `<button class="chip ${filter===n?'on':''}" onclick="V.exTplFilter=V.exFilterNames[${i}]; render()">${esc(n)}</button>`).join('') +
      `</div>`;
  }
  const tm = isTimeEx(k);
  h += `<div class="statrow">
    <div class="stat"><div class="v">${tm ? (st.bestTime?st.bestTime+' s':'—') : (st.best?fmtW(st.best)+' kg':'—')}</div><div class="l">${tm?t('recTime'):t('exBest')}</div></div>
    <div class="stat"><div class="v">${st.sessions}</div><div class="l">${t('exSessions')}</div></div>
    <div class="stat"><div class="v" style="font-size:16px;padding-top:6px">${st.lastDate?daysAgoStr(st.lastDate):'—'}</div><div class="l">${t('exLastDone')}</div></div>
  </div>`;
  if(!st.sessions) return h + `<div class="empty">${t('exNoHistory')}</div>`;
  if(!tm && st.bestSet){
    h += `<div class="card">
      <div style="font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--dim);margin-bottom:8px">🏆 ${t('recTitle')}</div>
      <div style="display:flex;gap:8px;padding:4px 0;align-items:baseline;font-size:14px">
        <span style="color:var(--dim);flex:1">${t('rec1RM')}</span>
        <span style="font-weight:800;font-size:16px">${fmtW(Math.round(st.e1rm*10)/10)} kg</span></div>
      <div style="display:flex;gap:8px;padding:4px 0;align-items:baseline;font-size:14px">
        <span style="color:var(--dim);flex:1">${t('recBestSet')}</span>
        <span style="font-weight:800;font-size:16px">${fmtW(st.bestSet.weight)} kg × ${st.bestSet.reps}</span></div>
    </div>`;
  }
  h += `<div id="chartbox" class="card">${chartSVG(k, name, filter)}</div>`;
  /* session log */
  const rows = [];
  for(const w of S.history){
    if(w.arch || (filter && w.name!==filter)) continue;
    for(const e of w.exercises){
      if(matches(e)){
        rows.push(`<div class="exl"><span class="n">${fmtDate(w.date)} <span style="opacity:.6">· ${esc(w.name)}</span></span>
          <span class="s">${e.sets.map(s=>fmtSet(s, tm)).join('&nbsp; ')}</span></div>`);
      }
    }
  }
  h += `<div class="card"><div class="histdetail" style="border:none;margin:0;padding:0">${rows.join('')}</div></div>`;
  return h;
}
function chartSVG(k, name, tplName){
  const nm = (name||'').trim().toLowerCase();
  const tm = isTimeEx(k);
  const pts = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    if(w.arch || (tplName && w.name!==tplName)) continue;
    for(const e of w.exercises){
      if(e.k===k || (e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm && !s.drop);
        if(work.length) pts.push({ d:w.date, w:Math.max(...work.map(s=>tm?s.reps:s.weight)) });
      }
    }
  }
  return lineChartSVG(pts, tm ? t('woSec') : t('chartTop'));
}
/* generic line chart: pts = [{d:dateIso, w:number}] chronological */
function lineChartSVG(pts, label){
  if(!pts.length) return `<div class="empty">${t('chartNoData')}</div>`;
  const data = pts.slice(-24);
  const W=360, H=210, padL=44, padR=14, padT=18, padB=30;
  let min = Math.min(...data.map(p=>p.w)), max = Math.max(...data.map(p=>p.w));
  if(min===max){ min-=5; max+=5; }
  const span = max-min;
  min -= span*0.12; max += span*0.12;
  const X = i => data.length===1 ? (padL+(W-padL-padR)/2) : padL + i*(W-padL-padR)/(data.length-1);
  const Y = v => padT + (max-v)*(H-padT-padB)/(max-min);
  let grid='', labels='';
  for(let g2=0; g2<4; g2++){
    const v = min + (max-min)*g2/3;
    const y = Y(v);
    grid += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
    labels += `<text x="${padL-6}" y="${y+4}" fill="var(--dim)" font-size="11" text-anchor="end">${Math.round(v*10)/10}</text>`;
  }
  const line = data.map((p,i)=>`${X(i)},${Y(p.w)}`).join(' ');
  const dots = data.map((p,i)=>
    `<circle cx="${X(i)}" cy="${Y(p.w)}" r="4" fill="var(--accent)"/>` +
    (data.length<=10 ? `<text x="${X(i)}" y="${Y(p.w)-9}" fill="var(--text)" font-size="11" font-weight="700" text-anchor="middle">${fmtW(p.w)}</text>` : '')
  ).join('');
  const d0 = fmtDate(data[0].d), d1 = fmtDate(data[data.length-1].d);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${grid}${labels}
    <polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
    ${dots}
    <text x="${padL}" y="${H-8}" fill="var(--dim)" font-size="11">${d0}</text>
    <text x="${W-padR}" y="${H-8}" fill="var(--dim)" font-size="11" text-anchor="end">${d1}</text>
    <text x="${W-padR}" y="${padT-5}" fill="var(--ghost)" font-size="10" text-anchor="end">${label||''}</text>
  </svg>`;
}

/* ======================= HISTORY ======================= */
function htmlHistory(){
  let h = '<div style="height:8px"></div>';
  /* body weight tracking */
  h += `<h2 class="sec" style="margin-top:8px">${t('bw')}</h2>
    <div class="card">
      <div style="display:flex;gap:8px;align-items:center">
        <input class="nameinput" id="bw-input" type="text" inputmode="decimal"
          placeholder="${S.weights.length?fmtW(S.weights[0].kg)+' kg':'kg'}" style="flex:1">
        <button class="btn small" style="background:var(--accent);color:var(--on-accent);min-height:46px;padding:0 20px" onclick="addWeight()">${t('bwLog')}</button>
      </div>
      ${S.weights.length>1?`<div style="margin-top:12px">${lineChartSVG(S.weights.slice(0,24).slice().reverse().map(x=>({d:x.date,w:x.kg})), 'kg')}</div>`:''}
      ${S.weights.slice(0,5).map(x=>`<div style="display:flex;gap:8px;padding:6px 0;align-items:center;font-size:14px">
        <span style="color:var(--dim);flex:1">${fmtDate(x.date)}</span>
        <span style="font-weight:700">${fmtW(x.kg)} kg</span>
        <button class="dropbtn del" style="min-height:28px" onclick="delWeight('${x.id}')">✕</button></div>`).join('')}
    </div>
    <h2 class="sec">${t('tabHistory')}</h2>`;
  if(!S.history.length) return h + `<div class="empty">${t('histEmpty')}</div>`;
  const act = S.history.filter(w=>!w.arch);
  const arch = S.history.filter(w=>w.arch);
  h += act.map(histRowHtml).join('') || `<div class="empty">—</div>`;
  if(arch.length){
    h += `<h2 class="sec" style="cursor:pointer" onclick="V.showArch=!V.showArch; render()">
            ${V.showArch?'▾':'▸'} 📦 ${t('archTitle')} (${arch.length})</h2>`;
    if(V.showArch) h += arch.map(histRowHtml).join('');
  }
  return h;
}
function histRowHtml(w){
  const nsets = w.exercises.reduce((a,e)=>a+e.sets.length,0);
  const vol = w.exercises.reduce((a,e)=>a+e.sets.filter(s=>!s.warm).reduce((b,s)=>b+s.weight*s.reps,0),0);
  const open = V.expanded===w.id;
  let detail = '';
  if(open){
    detail = `<div class="histdetail">` + w.exercises.map(e=>
      `<div class="exl"><span class="n">${esc(e.name)}${e.note?` <em style="opacity:.8">— ${esc(e.note)}</em>`:''}</span>
       <span class="s">${e.sets.map(s=>fmtSet(s, isTimeEx(e.k))).join('&nbsp; ')}</span></div>`).join('') +
      `<div style="display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap">
        <span style="color:var(--ghost);font-size:13px">${t('histVolume')}: ${Math.round(vol)} kg${w.dur?' · ⏱ '+fmtTime(w.dur):''}</span>
        <button class="btn small" style="margin-left:auto;background:var(--input);color:var(--dim)" onclick="event.stopPropagation();toggleArch('${w.id}')">${w.arch?'↩ '+t('histUnarch'):'📦'}</button>
        <button class="btn small" style="background:var(--accent-bg);color:var(--accent-soft)" onclick="event.stopPropagation();openHistEdit('${w.id}')">✎</button>
        <button class="btn danger small" onclick="event.stopPropagation();delHist('${w.id}')">✕</button>
      </div></div>`;
  }
  return `<div class="card histrow" style="${w.arch?'opacity:.65':''}" onclick="V.expanded=V.expanded==='${w.id}'?null:'${w.id}'; render()">
    <div class="hd">
      <span class="dt">${fmtDate(w.date)}</span>
      <span class="dn">${esc(w.name)}</span>
      <span class="sm">${nsets} ${t('histSets')}${w.dur?' · '+fmtTime(w.dur):''}</span>
    </div>${detail}</div>`;
}
function toggleArch(id){
  const w = S.history.find(x=>x.id===id);
  if(!w) return;
  w.arch = !w.arch;
  save(); render();
}
function delHist(id){
  if(!confirm(t('histDel'))) return;
  S.history = S.history.filter(w=>w.id!==id);
  V.expanded = null;
  save(); render();
}

/* ---- history editing ---- */
function openHistEdit(id){
  openModal(`<h3>${t('histEditTitle')}<button class="x" onclick="closeHistEdit()">✕</button></h3>
    <div id="he-body">${histEditBody(id)}</div>
    <button class="btn primary" onclick="closeHistEdit()">OK</button>`);
}
function closeHistEdit(){ closeModal(); render(); }
function histEditBody(id){
  const w = S.history.find(x=>x.id===id);
  if(!w) return '';
  return w.exercises.map((e,ei)=>{
    let workNum = 0;
    const rows = e.sets.map((s,si)=>{
      const label = s.warm ? 'W' : s.drop ? 'D' : String(++workNum);
      return `<div class="setgrid" style="grid-template-columns:30px 1fr 70px 56px 34px">
        <div class="setnum ${s.warm?'warm':s.drop?'dropn':''}" style="display:flex;align-items:center;justify-content:center;min-height:40px">${label}</div>
        <div></div>
        <input type="text" inputmode="decimal" value="${fmtW(s.weight)}"
          oninput="editHistSet('${id}',${ei},${si},'weight',this.value)">
        <input type="text" inputmode="numeric" value="${s.reps}"
          oninput="editHistSet('${id}',${ei},${si},'reps',this.value)">
        <button class="dropbtn del" onclick="delHistSet('${id}',${ei},${si})">✕</button>
      </div>`;
    }).join('');
    return `<div class="card"><div class="exname">${esc(e.name)}</div>${rows}</div>`;
  }).join('');
}
function editHistSet(id,ei,si,f,v){
  const w = S.history.find(x=>x.id===id);
  if(!w || !w.exercises[ei] || !w.exercises[ei].sets[si]) return;
  const n = parseNum(v);
  if(!isNaN(n) && n>=0){
    w.exercises[ei].sets[si][f] = f==='reps' ? Math.round(n) : n;
    save();
  }
}
function delHistSet(id,ei,si){
  const w = S.history.find(x=>x.id===id);
  if(!w || !w.exercises[ei]) return;
  w.exercises[ei].sets.splice(si,1);
  if(!w.exercises[ei].sets.length) w.exercises.splice(ei,1);
  save();
  const b = $('#he-body');
  if(b) b.innerHTML = histEditBody(id);
}

/* ---- body weight ---- */
function addWeight(){
  const inp = $('#bw-input');
  const n = parseNum(inp ? inp.value : '');
  if(isNaN(n) || n<=0 || n>400){ toast(t('woEmptyVals')); return; }
  S.weights.unshift({ id:uid(), date:new Date().toISOString(), kg:Math.round(n*10)/10 });
  save(); render();
}
function delWeight(id){
  if(!confirm(t('bwDel'))) return;
  S.weights = S.weights.filter(x=>x.id!==id);
  save(); render();
}

/* ---- plate calculator ---- */
function openPlates(xi){
  let w = NaN;
  if(xi!=null && S.active && S.active.exercises[xi]){
    const ex = S.active.exercises[xi];
    for(let i=0;i<ex.sets.length;i++){
      const s = ex.sets[i];
      if(!s.done){
        w = parseNum(s.w);
        if(isNaN(w)){ const g = ghostFor(ex,i); if(g) w = g.weight; }
        break;
      }
    }
  }
  V.plateBar = V.plateBar || 20;
  openModal(`<h3>${t('plates')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="card">
      <input class="nameinput" id="pl-w" type="text" inputmode="decimal" value="${!isNaN(w)?fmtW(w):''}"
        placeholder="kg" style="font-size:24px;font-weight:800;text-align:center;min-height:56px"
        oninput="renderPlates()">
      <div class="setline" style="margin-top:10px">
        <span class="lb">${t('platesBar')}</span>
        <div class="seg" id="pl-bars"></div>
      </div>
    </div>
    <div class="card" id="pl-out"></div>`);
  renderPlatesSeg();
  renderPlates();
}
function renderPlatesSeg(){
  const el = $('#pl-bars');
  if(!el) return;
  el.innerHTML = [20,15,10].map(b=>
    `<button class="${V.plateBar===b?'on':''}" onclick="V.plateBar=${b};renderPlatesSeg();renderPlates()">${b} kg</button>`).join('');
}
function renderPlates(){
  const out = $('#pl-out');
  if(!out) return;
  const w = parseNum($('#pl-w').value);
  if(isNaN(w) || w<=0){ out.innerHTML = `<div class="empty" style="padding:12px">—</div>`; return; }
  const side = (w - V.plateBar)/2;
  if(side <= 0){ out.innerHTML = `<div class="empty" style="padding:12px">${t('platesEmpty')} (${V.plateBar} kg)</div>`; return; }
  const plates = [25,20,15,10,5,2.5,1.25];
  const used = [];
  let rem = side;
  for(const p of plates){ while(rem >= p - 1e-9){ used.push(p); rem -= p; } }
  rem = Math.round(rem*100)/100;
  let html = `<div style="font-size:13px;color:var(--dim);font-weight:600;margin-bottom:8px">${t('platesSide')} — ${fmtW(side)} kg:</div>`;
  html += used.length
    ? `<div style="font-size:24px;font-weight:800;color:var(--accent-soft)">${used.map(fmtW).join(' + ')}</div>`
    : `<div style="font-size:16px;font-weight:700">${t('platesEmpty')}</div>`;
  if(rem > 0) html += `<div style="margin-top:8px;font-size:13px;color:var(--orange);font-weight:600">${t('platesRem',{n:fmtW(rem)})}</div>`;
  out.innerHTML = html;
}

/* ======================= SETTINGS ======================= */
function htmlSettings(){
  return `<div style="height:8px"></div>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('setTheme')}</span>
      <div class="seg">
        <button class="${S.theme==='auto'?'on':''}" onclick="setTheme('auto')">${t('themeAuto')}</button>
        <button class="${S.theme==='dark'?'on':''}" onclick="setTheme('dark')">${t('themeDark')}</button>
        <button class="${S.theme==='light'?'on':''}" onclick="setTheme('light')">${t('themeLight')}</button>
      </div>
    </div>
    <div class="setline">
      <span class="lb">${t('setLang')}</span>
      <div class="seg">
        <button class="${S.lang==='lt'?'on':''}" onclick="S.lang='lt'; save(); render()">LT</button>
        <button class="${S.lang==='en'?'on':''}" onclick="S.lang='en'; save(); render()">EN</button>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('setAwake')}</span>
      <div class="switch ${S.keepAwake?'on':''}" onclick="S.keepAwake=!S.keepAwake; save(); render()"></div>
    </div>
  </div>
  <h2 class="sec">${t('setBackup')}</h2>
  <button class="btn" onclick="copyBackup()">⤴ ${t('setBackupCopy')}</button>
  <button class="btn" onclick="openImportModal('bak')">⤓ ${t('setBackupLoad')}</button>
  <h2 class="sec">${t('protTitle')}</h2>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('protPersist')}</span>
      <span id="persist-status" style="color:var(--dim);font-weight:700;font-size:14px">…</span>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:2px">${t('protHint')}</div>
  </div>
  <h2 class="sec">${t('protSnaps')}</h2>
  <div class="card">${snapListHtml()}</div>
  <h2 class="sec" style="color:var(--red)">${t('setDanger')}</h2>
  <button class="btn danger" onclick="wipeAll()">${t('setWipe')}</button>
  <div style="text-align:center;color:var(--ghost);font-size:12px;margin-top:24px">Daveedus v${APP_VER}</div>`;
}
function setTheme(m){ S.theme=m; save(); applyTheme(); render(); }
function snapListHtml(){
  const keys = Object.keys(localStorage).filter(k=>k.startsWith(SNAP_PREFIX)).sort().reverse();
  if(!keys.length) return `<div style="color:var(--dim);font-size:14px;padding:4px 0">${t('protNoSnaps')}</div>`;
  return keys.map(k=>`<div class="setline">
    <span class="lb" style="font-weight:600">📄 ${k.slice(SNAP_PREFIX.length)}</span>
    <button class="btn small" style="background:var(--accent-bg);color:var(--accent-soft)"
      onclick="restoreSnapshot('${k}')">${t('protRestore')}</button>
  </div>`).join('');
}
function restoreSnapshot(key){
  try{
    const s = hydrate(JSON.parse(localStorage.getItem(key)));
    if(!s){ toast(t('codeBad')); return; }
    if(!confirm(t('protRestoreConfirm',{d:key.slice(SNAP_PREFIX.length)}))) return;
    s.active = null;
    S = s;
    save(); applyTheme();
    go('home');
    toast(t('protRestored'));
  }catch(e){ toast(t('codeBad')); }
}
function updatePersistStatus(){
  const el = $('#persist-status');
  if(!el) return;
  if(navigator.storage && navigator.storage.persisted){
    navigator.storage.persisted().then(p=>{
      el.textContent = p ? t('protOn') : t('protOff');
      el.style.color = p ? 'var(--green)' : 'var(--orange)';
    }).catch(()=>{ el.textContent='—'; });
  }else el.textContent = '—';
}
function wipeAll(){
  if(!confirm(t('setWipeConfirm'))) return;
  if(!confirm(t('setWipeConfirm'))) return;
  /* wipe everything, including snapshots and the IndexedDB mirror */
  Object.keys(localStorage).filter(k=>k.startsWith('daveedus.')).forEach(k=>localStorage.removeItem(k));
  idbSet(null);
  S = defaultState();
  save();
  go('home');
}

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
    ex: d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0 })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('tplShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('tplShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">⤴ ${t('copy')}</button>`);
}
function copyBackup(){
  const payload = { t:'bak', s:{ lang:S.lang, theme:S.theme, keepAwake:S.keepAwake,
    folders:S.folders, customEx:S.customEx, templates:S.templates, history:S.history, weights:S.weights } };
  S.lastBackup = Date.now();
  save();
  copyText(encodeShare(payload));
}
/* nag when there is real data but no recent backup (localStorage is fragile on iOS) */
function needBackupReminder(){
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
      /* unknown exercise (friend's custom one) — register it locally */
      const existing = allExercises().find(x=>x.n.toLowerCase()===String(e.n||'').toLowerCase());
      if(existing) k = existing.id;
      else if(e.n){
        const info = { id:'custom-'+uid(), n:String(e.n).slice(0,60), g:'other', e:'other' };
        if(e.m==='t') info.m = 't';
        S.customEx.push(info);
        k = info.id;
      } else continue;
    }
    tpl.ex.push({ id:uid(), k, s:Math.max(1,Math.min(12,e.s|0||3)), r:Math.max(1,Math.min(50,e.r|0||10)), ss:!!e.ss });
  }
  S.templates.push(tpl);
  return tpl;
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
    if(!Array.isArray(d.s.folders)){ /* backup from pre-split version */
      const fid = uid();
      d.s.folders = [{ id:fid, name:'Upper / Lower', open:true }];
      d.s.templates.forEach(tp=>{ if(!tp.folderId) tp.folderId=fid; });
    }
    d.s.folders.forEach(f=>{ if(typeof f.pinned==='undefined') f.pinned=true; });
    S = Object.assign(defaultState(), d.s, { active:null });
    save(); applyTheme(); closeModal();
    go('home');
    toast(t('bakDone'));
  }else{
    toast(t('codeBad'));
  }
}

/* ======================= wake lock ======================= */
let wakeLock = null;
async function syncWakeLock(){
  const want = S.keepAwake && V.screen==='workout' && !!S.active;
  try{
    if(want && !wakeLock && 'wakeLock' in navigator){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', ()=>{ wakeLock=null; });
    }else if(!want && wakeLock){
      await wakeLock.release(); wakeLock=null;
    }
  }catch(e){ wakeLock=null; }
}
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState==='visible'){ syncWakeLock(); tick(); }
});

/* ======================= boot ======================= */
document.addEventListener('DOMContentLoaded', async ()=>{
  applyTheme();
  $('#modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
  /* localStorage empty or corrupt? try the IndexedDB mirror before showing defaults */
  if(!LS_OK){
    try{
      const raw = await idbGet();
      if(raw){
        const s = hydrate(typeof raw==='string' ? JSON.parse(raw) : raw);
        if(s){ S = s; save(); applyTheme(); toast(t('protRecovered')); }
      }
    }catch(e){}
  }
  /* ask the browser to protect our storage from eviction */
  if(navigator.storage && navigator.storage.persist){
    navigator.storage.persist().catch(()=>{});
  }
  if(S.active) V.screen = 'workout';
  render();
  setInterval(tick, 500);
  /* auto-update: check for a new version on every open/foreground; when the
     new service worker takes over, reload once so fresh code is used */
  if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
    try{
      if(sessionStorage.getItem('dvd-upd')){
        sessionStorage.removeItem('dvd-upd');
        toast(t('updToast'));
      }
    }catch(e){}
    navigator.serviceWorker.register('sw.js').then(reg=>{
      reg.update().catch(()=>{});
      document.addEventListener('visibilitychange', ()=>{
        if(document.visibilityState==='visible') reg.update().catch(()=>{});
      });
    }).catch(()=>{});
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      if(!hadController || reloaded) return; /* first install — nothing to refresh */
      reloaded = true;
      try{ sessionStorage.setItem('dvd-upd','1'); }catch(e){}
      location.reload();
    });
  }
});

/* screens with async bits need a follow-up after each full render */
const _origRender = render;
render = function(){
  _origRender();
  if(V.screen==='exercises') renderExList();
  if(V.screen==='settings') updatePersistStatus();
};
