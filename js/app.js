/* ============================================================
   Daveedus v1.0 — workout tracker
   Sections: i18n | state | helpers | theme | render core |
             home | workout | rest+elapsed | program | picker |
             exercises | history | settings | share codes | boot
   ============================================================ */
'use strict';

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
    woSug:'Siūlymas', woSugApply:'Taikyti', woSugOr:'arba +1 kart.',
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
    woSug:'Suggestion', woSugApply:'Apply', woSugOr:'or +1 rep',
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
  return { lang:'lt', theme:'auto', keepAwake:true,
           folders:[{ id:fid, name:'Upper / Lower', open:true }],
           customEx:[], templates:seedTemplates(fid), history:[], active:null };
}
function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      const s = JSON.parse(raw);
      if(s && Array.isArray(s.templates)){
        /* migration: older data had no split folders */
        if(!Array.isArray(s.folders)){
          const fid = uid();
          s.folders = [{ id:fid, name:'Upper / Lower', open:true }];
          s.templates.forEach(tp=>{ if(!tp.folderId) tp.folderId = fid; });
        }
        return Object.assign(defaultState(), s);
      }
    }
  }catch(e){}
  return defaultState();
}
let S = load();
function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }
  catch(e){ toast(t('saveError')); }
}
/* view state (not persisted) */
const V = { screen:'home', editTpl:null, viewFolder:null, exDetail:null, expanded:null,
            pickerCb:null, pickerQ:'', pickerG:'all', exQ:'', exG:'all' };

/* exercise lookup: built-in DB + user's custom exercises */
function exInfo(k){
  return EX_DB.find(x=>x.id===k) || S.customEx.find(x=>x.id===k) || null;
}
function allExercises(){ return EX_DB.concat(S.customEx); }
function exName(k, fallback){ const i = exInfo(k); return i ? i.n : (fallback || k); }

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
    const back = (d && d.folderId && S.folders.some(f=>f.id===d.folderId))
      ? `openSplit('${d.folderId}')` : `go('program')`;
    h = `<button class="iconbtn" onclick="${back}">‹</button><h1>${d?esc(d.name):''}</h1>`;
  }else if(V.screen==='splitview'){
    const f = S.folders.find(x=>x.id===V.viewFolder);
    h = `<button class="iconbtn" onclick="go('program')">‹</button><h1>${f?esc(f.name):''}</h1>`;
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
  return S.history.filter(h=>new Date(h.date)>=monday).length;
}
function htmlHome(){
  const dateStr = new Date().toLocaleDateString(S.lang==='lt'?'lt-LT':'en-GB',
    { weekday:'long', month:'long', day:'numeric' });
  let h = `<div class="hero"><div class="date">${esc(dateStr)}</div></div>
    <div class="statrow">
      <div class="stat"><div class="v">${weekCount()}</div><div class="l">${t('statWeek')}</div></div>
      <div class="stat"><div class="v">${S.history.length}</div><div class="l">${t('statTotal')}</div></div>
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
  for(const f of S.folders){
    const tpls = S.templates.filter(x=>x.folderId===f.id);
    if(!tpls.length) continue;
    /* suggest the workout AFTER the most recently done one in this split (cyclic) */
    let nextId = tpls[0].id;
    for(const hw of S.history){
      const idx = tpls.findIndex(x=>x.id===hw.tplId);
      if(idx>=0){ nextId = tpls[(idx+1)%tpls.length].id; break; }
    }
    h += `<h2 class="sec">${esc(f.name)}</h2>` + tpls.map(d=>tplBtn(d, d.id===nextId)).join('');
  }
  const loose = looseTemplates();
  if(loose.length){
    h += `<h2 class="sec">${S.folders.length?t('folderNone'):t('homeTemplates')}</h2>` + loose.map(d=>tplBtn(d,false)).join('');
  }
  return h;
}

/* ======================= WORKOUT ======================= */
function buildActiveEx(k, name, sets, reps){
  const last = lastForExercise(k, name);
  return { id:uid(), k, name, targetSets:sets, targetReps:reps, note:'',
    last, sug:suggestionFor(sets, reps, last), sugOn:false,
    sets: Array.from({length:sets}, ()=>({ w:'', r:'', warm:false, done:false, cls:'' })) };
}
function lastForExercise(k, name){
  const nm = (name||'').trim().toLowerCase();
  for(const h of S.history){
    for(const e of h.exercises){
      if(e.k===k || (nm && e.name && e.name.trim().toLowerCase()===nm)){
        if(e.sets && e.sets.length) return { date:h.date, sets:e.sets };
      }
    }
  }
  return null;
}
function suggestionFor(targetSets, targetReps, last){
  if(!last) return null;
  const work = last.sets.filter(s=>!s.warm);
  if(work.length < targetSets) return null;
  if(!work.every(s => s.reps >= targetReps)) return null;
  const maxW = Math.max(...work.map(s=>s.weight));
  if(!isFinite(maxW) || maxW<=0) return null;
  return { w: Math.round((maxW+2.5)*100)/100, r: targetReps };
}
function startWorkout(tplId){
  const tpl = S.templates.find(d=>d.id===tplId);
  if(!tpl) return;
  if(S.active){
    if(!confirm(t('woSwitchConfirm'))) return;
  }
  S.active = {
    tplId: tpl.id, name: tpl.name, startedAt: new Date().toISOString(), rest:null,
    exercises: tpl.ex.map(e => buildActiveEx(e.k, exName(e.k,e.n), e.s, e.r))
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
  if(ex.sugOn && ex.sug) return { weight:ex.sug.w, reps:ex.sug.r };
  if(!prev) return null;
  const prevWork = prev.filter(s=>!s.warm);
  if(!prevWork.length) return null;
  let wi = 0; for(let i=0;i<si;i++) if(!ex.sets[i].warm) wi++;
  return prevWork[Math.min(wi, prevWork.length-1)] || null;
}
/* comparison target = actual previous session (never the suggestion) */
function realPrev(ex, si){
  const prev = ex.last ? ex.last.sets : null;
  if(!prev) return null;
  const cur = ex.sets[si];
  if(cur.warm) return null;
  const prevWork = prev.filter(s=>!s.warm);
  if(!prevWork.length) return null;
  let wi = 0; for(let i=0;i<si;i++) if(!ex.sets[i].warm) wi++;
  return prevWork[Math.min(wi, prevWork.length-1)] || null;
}
function htmlWorkout(){
  if(!S.active){ V.screen='home'; return htmlHome(); }
  let h = '<div style="height:8px"></div>';
  h += S.active.exercises.map((ex,xi)=>{
    let sug = '';
    if(ex.sug && !ex.sugOn){
      sug = `<div class="sug"><span>💪 ${t('woSug')}: <b>${fmtW(ex.sug.w)} ${t('woKg')} × ${ex.sug.r}</b> <span style="opacity:.7">(${t('woSugOr')})</span></span>
             <button onclick="applySug(${xi})">${t('woSugApply')}</button></div>`;
    }
    const hdr = `<div class="setgrid hdr"><div>${t('woSet')}</div><div>${t('woPrev')}</div>
      <div>${t('woKg')}</div><div>${t('woReps')}</div><div>✓</div></div>`;
    let workNum = 0;
    const rows = ex.sets.map((s,si)=>{
      const g = ghostFor(ex,si);
      const prevTxt = g ? `${fmtW(g.weight)} ${t('woKg')} × ${g.reps}` : '—';
      const label = s.warm ? 'W' : String(++workNum);
      const chkCls = s.done ? (s.cls==='loss' ? 'loss' : 'done') : '';
      const restHere = S.active.rest && S.active.rest.key===xi+'-'+si;
      return `<div class="setrow-wrap ${s.done?'done':''}">
        <div class="setgrid">
          <button class="setnum ${s.warm?'warm':''}" onclick="toggleWarm(${xi},${si})">${label}</button>
          <div class="prev">${prevTxt}</div>
          <input type="text" inputmode="decimal" placeholder="${g?fmtW(g.weight):t('woKg')}" value="${esc(s.w)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'w',this.value)">
          <input type="text" inputmode="numeric" placeholder="${g?g.reps:'×'}" value="${esc(s.r)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'r',this.value)">
          <button class="checkbtn ${chkCls}" onclick="toggleSet(${xi},${si})">✓</button>
        </div>
        ${restHere ? restBarHtml() : ''}
      </div>`;
    }).join('');
    return `<div class="card">
      <div class="exhead">
        <div class="exname" onclick="openExDetailByKey('${esc(ex.k)}')">${esc(ex.name)}</div>
        <div class="extarget">${ex.targetSets}×${ex.targetReps}</div>
        <button class="minibtn del" onclick="removeWorkoutEx(${xi})">✕</button>
      </div>
      <input class="exnote" placeholder="${t('woNote')}" value="${esc(ex.note)}" oninput="onNoteInput(${xi},this.value)">
      ${sug}${hdr}${rows}
      <div class="setctl">
        <button onclick="addSet(${xi})">${t('woAddSet')}</button>
        <button onclick="removeSet(${xi})">${t('woRemoveSet')}</button>
      </div>
    </div>`;
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
function applySug(xi){ S.active.exercises[xi].sugOn=true; save(); render(); }
function toggleWarm(xi,si){
  const s = S.active.exercises[xi].sets[si];
  if(s.done) return;
  s.warm = !s.warm;
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
  if(isNaN(w) || isNaN(r)){ toast(t('woEmptyVals')); return; }
  s.w = fmtW(w); s.r = String(Math.round(r)); s.done = true;
  const real = realPrev(ex,si);
  if(!real || s.warm) s.cls = 'none';
  else if(w>real.weight || (w===real.weight && r>real.reps)) s.cls='win';
  else if(w===real.weight && r===real.reps) s.cls='even';
  else s.cls='loss';
  S.active.rest = { at:Date.now(), key:xi+'-'+si };
  save(); render();
}
function addSet(xi){
  S.active.exercises[xi].sets.push({w:'',r:'',warm:false,done:false,cls:''});
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
    k:ex.k, name:ex.name, targetSets:ex.targetSets, targetReps:ex.targetReps, note:ex.note||'',
    sets: ex.sets.filter(s=>s.done).map(s=>({ weight:parseNum(s.w), reps:parseNum(s.r), warm:!!s.warm }))
  })).filter(e=>e.sets.length);
  if(!exercises.length){
    if(confirm(t('woFinishEmpty'))){ S.active=null; save(); go('home'); }
    return;
  }
  const total = S.active.exercises.reduce((a,e)=>a+e.sets.length,0);
  const done  = S.active.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  if(done < total && !confirm(t('woFinishPart'))) return;
  S.history.unshift({
    id:uid(), tplId:S.active.tplId, name:S.active.name, date:new Date().toISOString(),
    dur: Math.round((Date.now()-new Date(S.active.startedAt).getTime())/1000),
    exercises
  });
  S.active = null;
  save();
  toast(t('woSaved'));
  go('home');
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
    return `<button class="tplbtn" onclick="openSplit('${f.id}')">
      <div class="tinfo"><div class="tname">${esc(f.name)} <span style="color:var(--dim);font-weight:700;font-size:14px">(${tpls.length})</span></div>
      <div class="tsub">${esc(names)||'—'}</div></div>
      <div class="go">›</div></button>`;
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
    tpls: tpls.map(d=>({ name:d.name, ex:d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r })) })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('folderShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('folderShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">⤴ ${t('copy')}</button>`);
}
function openTpl(id){ V.editTpl=id; go('tpledit'); }
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
      </div>
    </div>`;
  }).join('');
  if(!d.ex.length) h += `<div class="empty">—</div>`;
  h += `</div>
    <button class="btn ghostbtn" onclick="addTplEx('${d.id}')">${t('tplAddEx')}</button>
    <button class="btn" onclick="shareTpl('${d.id}')">⤴ ${t('tplShare')}</button>`;
  return h;
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
  V.pickerCb = cb; V.pickerQ=''; V.pickerG='all';
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
  el.innerHTML = ['all'].concat(EX_GROUPS).map(g=>
    `<button class="chip ${V.pickerG===g?'on':''}" onclick="V.pickerG='${g}'; renderPickerChips(); renderPickerList()">${t('g_'+g)}</button>`).join('');
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
  const list = filterExercises(V.pickerQ, V.pickerG);
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
    </div>
    <button class="btn primary" onclick="saveCustomEx()">${t('exCreateSave')}</button>`);
  setTimeout(()=>{ const i=$('#cx-name'); if(i) i.focus(); }, 50);
}
function saveCustomEx(){
  const name = ($('#cx-name').value||'').trim();
  const g = $('#cx-group').value;
  if(!name){ toast(t('exNameReq')); return; }
  const info = { id:'custom-'+uid(), n:name, g, e:'other' };
  S.customEx.push(info);
  save();
  if(V.pickerCb){ V.pickerCb(info); }
  else { closeModal(); render(); }
}

/* ======================= EXERCISES tab ======================= */
function exStats(k, name){
  const nm = (name||'').trim().toLowerCase();
  let best = 0, sessions = 0, lastDate = null;
  for(const h of S.history){
    for(const e of h.exercises){
      if(e.k===k || (nm && e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm);
        if(work.length){
          sessions++;
          if(!lastDate) lastDate = h.date;
          best = Math.max(best, ...work.map(s=>s.weight));
        }
      }
    }
  }
  return { best, sessions, lastDate };
}
function htmlExercises(){
  let h = `<div style="height:8px"></div>
    <div class="searchbox">${TAB_ICONS.exercises}
      <input id="ex-q" type="text" value="${esc(V.exQ)}" placeholder="${t('exSearch')}"
        oninput="V.exQ=this.value; renderExList()">
    </div>
    <div class="chips">` + ['all'].concat(EX_GROUPS).map(g=>
      `<button class="chip ${V.exG===g?'on':''}" onclick="V.exG='${g}'; render()">${t('g_'+g)}</button>`).join('')
    + `</div><div id="ex-list"></div>`;
  return h;
}
function renderExList(){
  const el = $('#ex-list');
  if(!el) return;
  const list = filterExercises(V.exQ, V.exG);
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
  const i = exInfo(k);
  V.exDetailName = i ? i.n : k;
  closeModal();
  go('exdetail');
}
function htmlExDetail(){
  const k = V.exDetail;
  const info = exInfo(k);
  const name = info ? info.n : (V.exDetailName||k);
  const st = exStats(k, name);
  let h = `<div style="height:8px"></div>`;
  if(info) h += `<div style="color:var(--dim);font-size:14px;margin:0 4px 12px">${t('g_'+info.g)} · ${t('e_'+info.e)}</div>`;
  h += `<div class="statrow">
    <div class="stat"><div class="v">${st.best?fmtW(st.best)+' kg':'—'}</div><div class="l">${t('exBest')}</div></div>
    <div class="stat"><div class="v">${st.sessions}</div><div class="l">${t('exSessions')}</div></div>
    <div class="stat"><div class="v" style="font-size:16px;padding-top:6px">${st.lastDate?daysAgoStr(st.lastDate):'—'}</div><div class="l">${t('exLastDone')}</div></div>
  </div>`;
  if(!st.sessions) return h + `<div class="empty">${t('exNoHistory')}</div>`;
  h += `<div id="chartbox" class="card">${chartSVG(k, name)}</div>`;
  /* session log */
  const rows = [];
  for(const w of S.history){
    for(const e of w.exercises){
      if(e.k===k || (e.name && e.name.trim().toLowerCase()===name.trim().toLowerCase())){
        rows.push(`<div class="exl"><span class="n">${fmtDate(w.date)}</span>
          <span class="s">${e.sets.map(s=>(s.warm?'W ':'')+fmtW(s.weight)+'×'+s.reps).join('&nbsp; ')}</span></div>`);
      }
    }
  }
  h += `<div class="card"><div class="histdetail" style="border:none;margin:0;padding:0">${rows.join('')}</div></div>`;
  return h;
}
function chartSVG(k, name){
  const nm = (name||'').trim().toLowerCase();
  const pts = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    for(const e of w.exercises){
      if(e.k===k || (e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm);
        if(work.length) pts.push({ d:w.date, w:Math.max(...work.map(s=>s.weight)) });
      }
    }
  }
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
    <text x="${W-padR}" y="${padT-5}" fill="var(--ghost)" font-size="10" text-anchor="end">${t('chartTop')}</text>
  </svg>`;
}

/* ======================= HISTORY ======================= */
function htmlHistory(){
  let h = '<div style="height:8px"></div>';
  if(!S.history.length) return h + `<div class="empty">${t('histEmpty')}</div>`;
  h += S.history.map(w=>{
    const nsets = w.exercises.reduce((a,e)=>a+e.sets.length,0);
    const vol = w.exercises.reduce((a,e)=>a+e.sets.filter(s=>!s.warm).reduce((b,s)=>b+s.weight*s.reps,0),0);
    const open = V.expanded===w.id;
    let detail = '';
    if(open){
      detail = `<div class="histdetail">` + w.exercises.map(e=>
        `<div class="exl"><span class="n">${esc(e.name)}${e.note?` <em style="opacity:.8">— ${esc(e.note)}</em>`:''}</span>
         <span class="s">${e.sets.map(s=>(s.warm?'W ':'')+fmtW(s.weight)+'×'+s.reps).join('&nbsp; ')}</span></div>`).join('') +
        `<div style="display:flex;gap:10px;margin-top:10px;align-items:center">
          <span style="color:var(--ghost);font-size:13px">${t('histVolume')}: ${Math.round(vol)} kg${w.dur?' · ⏱ '+fmtTime(w.dur):''}</span>
          <button class="btn danger small" style="margin-left:auto" onclick="event.stopPropagation();delHist('${w.id}')">✕</button>
        </div></div>`;
    }
    return `<div class="card histrow" onclick="V.expanded=V.expanded==='${w.id}'?null:'${w.id}'; render()">
      <div class="hd">
        <span class="dt">${fmtDate(w.date)}</span>
        <span class="dn">${esc(w.name)}</span>
        <span class="sm">${nsets} ${t('histSets')}${w.dur?' · '+fmtTime(w.dur):''}</span>
      </div>${detail}</div>`;
  }).join('');
  return h;
}
function delHist(id){
  if(!confirm(t('histDel'))) return;
  S.history = S.history.filter(w=>w.id!==id);
  V.expanded = null;
  save(); render();
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
  <h2 class="sec" style="color:var(--red)">${t('setDanger')}</h2>
  <button class="btn danger" onclick="wipeAll()">${t('setWipe')}</button>
  <div style="text-align:center;color:var(--ghost);font-size:12px;margin-top:24px">Daveedus v1.0</div>`;
}
function setTheme(m){ S.theme=m; save(); applyTheme(); render(); }
function wipeAll(){
  if(!confirm(t('setWipeConfirm'))) return;
  if(!confirm(t('setWipeConfirm'))) return;
  localStorage.removeItem(LS_KEY);
  S = defaultState();
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
    ex: d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('tplShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('tplShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">⤴ ${t('copy')}</button>`);
}
function copyBackup(){
  const payload = { t:'bak', s:{ lang:S.lang, theme:S.theme, keepAwake:S.keepAwake,
    folders:S.folders, customEx:S.customEx, templates:S.templates, history:S.history } };
  copyText(encodeShare(payload));
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
        S.customEx.push(info);
        k = info.id;
      } else continue;
    }
    tpl.ex.push({ id:uid(), k, s:Math.max(1,Math.min(12,e.s|0||3)), r:Math.max(1,Math.min(50,e.r|0||10)) });
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
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme();
  $('#modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
  if(S.active) V.screen = 'workout';
  render();
  if(V.screen==='exercises') renderExList();
  setInterval(tick, 500);
  if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});

/* exercises tab needs its list rendered after each full render */
const _origRender = render;
render = function(){
  _origRender();
  if(V.screen==='exercises') renderExList();
};
