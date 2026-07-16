/* ============================================================
   Daveedus v1.0 — workout tracker
   Sections: i18n | state | helpers | theme | render core |
             home | workout | rest+elapsed | program | picker |
             exercises | history | settings | share codes | boot
   ============================================================ */
'use strict';

const APP_VER = '1.12.1'; /* bump together with CACHE in sw.js on every release */

/* ======================= i18n ======================= */
const I18N = {
  lt: {
    tabHome:'Treniruotė', tabProgram:'Programos', tabExercises:'Pratimai', tabHistory:'Istorija', tabSettings:'Nustatymai',
    today:'šiandien', yesterday:'vakar', daysAgo:'prieš {n} d.', never:'dar nedaryta',
    statWeek:'šią savaitę', statTotal:'iš viso',
    homeContinue:'Tęsti treniruotę',
    homeTemplates:'Mano programos',
    woFinish:'BAIGTI', woElapsed:'TRUKMĖ',
    woCancel:'Atšaukti treniruotę', woCancelConfirm:'Atšaukti treniruotę? Įvesti duomenys nebus išsaugoti.',
    woSwitchConfirm:'Jau vyksta kita treniruotė. Ją atšaukti ir pradėti naują?',
    woSet:'Set', woPrev:'Anksčiau', woReps:'kart.',
    woAddSet:'+ Setas', woRemoveSet:'− Setas', woRemoveDone:'Setas jau atliktas',
    woDelEx:'Išimti pratimą „{n}“?', woDelExBtn:'Išimti pratimą',
    swapTitle:'Keisti pratimą', swapPlanned:'planas', swapAdd:'+ Pridėti alternatyvą',
    woAltBack:'Atgal į', altLabel:'alt.', altAdd:'Alternatyva',
    woOrderHint:'Atlikimo eilė', woPrevOrderHint:'Praeitą kartą buvo tokia eilė',
    warmBtn:'Apšilimo setai', warmNeedW:'Pirma įvesk darbinį svorį', warmTooLight:'Svoris per lengvas apšilimo setams',
    woNoteSess:'Užrašas (šiam kartui)…', woNotePerm:'Nuolatinis užrašas…', woNotePermToggle:'Nuolatinis užrašas',
    woEmptyVals:'Įvesk svorį ir kartojimus',
    woFinishEmpty:'Nėra atliktų setų. Atšaukti treniruotę?',
    woFinishPart:'Ne visi setai atlikti. Baigti ir išsaugoti?',
    restLabel:'Poilsis',
    tplNew:'+ Nauja treniruotė', tplImport:'Įvesti kodą', tplDefaultName:'Nauja treniruotė',
    tplDel:'Ištrinti treniruotę „{n}“?', tplExCount:'{n} prat.',
    tplName:'Treniruotės pavadinimas', tplAddEx:'+ Pridėti pratimą', tplDelEx:'Išimti pratimą „{n}“?',
    tplShare:'Treniruotės kodas', tplShareHint:'Nusiųsk šį kodą draugui — jis įves jį ir gaus tavo treniruotę.',
    tplImportTitle:'Įvesti kodą', tplImportHint:'Įklijuok gautą kodą čia:',
    tplImportBtn:'Importuoti', tplImported:'Treniruotė „{n}“ pridėta ✓',
    folderNew:'+ Nauja programa', folderDefault:'Nauja programa', folderNone:'Be programos',
    folderName:'Programos pavadinimas', folderDel:'Ištrinti programą „{n}“? Treniruotės liks, tik be programos.',
    folderShare:'Programos kodas', folderShareHint:'Nusiųsk šį kodą draugui — jis gaus visą programą su visomis treniruotėmis.',
    folderImported:'Programa „{n}“ pridėta ✓', tplFolder:'Programa', deleteBtn:'Ištrinti', nextBadge:'KITA',
    progEmpty:'Programų dar nėra — spausk „+ Nauja programa“ apačioje ir susikurk savo splitą.',
    homeNoProg:'Programų nėra — susikurk skiltyje „Programos“.',
    histEditTitle:'Redaguoti treniruotę',
    tplDup:'Dubliuoti', tplDupSuffix:'(kopija)',
    woSec:'sek.',
    sumTitle:'Treniruotė išsaugota', sumDur:'Trukmė', sumVol:'Apimtis', sumSets:'Setai',
    sumPRs:'Nauji rekordai', sumOk:'Atlikta',
    recTitle:'Rekordai', rec1RM:'~1RM (apytikslis)', recBestSet:'Geriausias setas', recTime:'Ilgiausiai',
    bakRemind:'Atsarginis kodas seniai nekopijuotas.',
    protTitle:'Duomenų apsauga', protPersist:'Nuolatinė saugykla',
    protOn:'✓ Įjungta', protOff:'Nesuteikta',
    protSnaps:'Automatinės kopijos įrenginyje',
    protRestore:'Atkurti', protRestoreConfirm:'Atkurti duomenis iš {d}? Dabartiniai duomenys bus pakeisti.',
    protNoSnaps:'Kopijų dar nėra — atsiras po kito išsaugojimo.',
    protRestored:'Atkurta ✓', protRecovered:'Duomenys atkurti iš atsarginės saugyklos ✓',
    protHint:'Kasdien automatiškai išsaugoma kopija įrenginyje, o duomenys dubliuojami į antrą saugyklą — jei viena sugestų, atsistatys iš kitos. Retkarčiais nusikopijuok ir atsarginį kodą: jis vienintelis padės pametus telefoną.',
    updToast:'Atnaujinta į naujausią versiją ✓',
    setUnit:'Matavimo vienetai',
    bwEnter:'Įvesk savo kūno svorį',
    woBwCol:'Kūno sv.', woAddCol:'Papild.', woBwHint:'Kūno svoris (tik statistikai)',
    exCreateMode:'Tipas', modeReps:'Kartai', modeTime:'Laikas (sek.)',
    histArch:'Archyvuoti', histUnarch:'Grąžinti', archTitle:'Archyvas',
    statsMuscle:'Raumenų balansas',
    statsWorkoutsPer:'Treniruotės', statsVolumePer:'Apimtis',
    pdcW:'Sav', pdcM:'Mėn', pdcY:'Metai', pdAll:'Viskas',
    pdFrom:'Nuo', pdTo:'Iki',
    hs7w:'treniruotės · 7 d.', hs7v:'apimtis · 7 d.', hsGap:'vid. tarpas',
    rhythmTitle:'Ritmas',
    trackedTitle:'Sekami pratimai', trackAdd:'+ Sekti pratimą',
    trackedEmpty:'Pasirink pratimus, kurių progresą nori matyti čia — pvz. spaudimą ir pritūpimus.',
    trackedDup:'Šis pratimas jau sekamas',
    trackDelta30:'per 30 d.',
    prTitle:'Nauji rekordai', prEmpty:'Rekordai atsiras po kelių treniruočių.',
    dlBtn:'Deload',
    mainSet:'Pagrindinė programa: {n}', mainTitle:'Pagrindinė programa',
    dlEndConfirm:'Baigti deload anksčiau?',
    dlOn:'Deload pradėtas',
    dlDone:'Deload ciklas baigtas',
    dlActiveBanner:'DELOAD',
    dlLeft:'liko {n} trenir.', dlSub:'rekordai nesiskaičiuoja · tap = baigti',
    dlWoBar:'DELOAD — siūlomi svoriai ~{p} %', dlWoBarVol:'setai perpus',
    dlBadge:'DELOAD', dlCycles:'Pilni ciklai nuo deload',
    dlmHow:'Kiekvienai treniruotei — vienas lengvas praėjimas. Setai nesiskaito į rekordus, skaitliukai prasideda iš naujo. Praėjus visas, deload baigsis pats — arba baik anksčiau bakstelėjęs oranžinę juostą pradžioje.',
    dlmW:'Siūlomi svoriai',
    dlmWHint:'Jėgai įprasta 50–60 %. 70 % — švelnesnis variantas. 90 % — beveik darbiniai svoriai: tada rinkis „Perpus“ ir stok toliau nuo nesėkmės.',
    dlmSets:'Setai',
    dlmSetsAll:'Visi', dlmSetsHalf:'Perpus',
    dlmSetsHint:'„Perpus“ — pusė suplanuotų setų. Sportininkai deload metu apimtį dažniausiai mažina ~30–50 %.',
    dlmLight:'Lengvi pratimai (< {n}) mažinami daugiausia iki ~80 % — izoliaciniams didelio sumažinimo nereikia.',
    dlmStart:'Pradėti deload',
    histMore:'Rodyti daugiau', bwLogNew:'+ Įvesti svorį',
    metricW:'Svoris', metricVol:'Apimtis', metric1RM:'~1RM',
    exMine:'Mano', exMineEmpty:'Čia atsiras pratimai, kuriuos jau darei. Kol kas žiūrėk „Visi“.',
    saveDone:'Išsaugoti',
    bw:'Kūno svoris', bwLog:'Įrašyti', bwDel:'Ištrinti šį įrašą?',
    plates:'Svarelių kalkuliatorius', platesBar:'Grifas', platesSide:'Ant vienos pusės',
    platesRem:'{n} {u} pusėj netelpa iš standartinių svarelių', platesEmpty:'Tuščias grifas',
    platesAvail:'Kokie svareliai yra salėje',
    superset:'Superset',
    codeBad:'Neteisingas kodas', copy:'Kopijuoti', copied:'Nukopijuota ✓',
    daySets:'setai', dayReps:'kart.', daySec:'sek.', repsRangeTog:'nuo–iki',
    exSearch:'Ieškoti pratimo...', exCreate:'+ Sukurti savo pratimą',
    exCreateTitle:'Naujas pratimas', exCreateName:'Pavadinimas', exCreateGroup:'Raumenų grupė',
    exCreateSave:'Išsaugoti', exNameReq:'Įvesk pavadinimą',
    exBest:'Rekordas', exSessions:'Treniruotės', exLastDone:'Paskutinį kartą',
    exNoHistory:'Šio pratimo istorijos dar nėra',
    chartTop:'geriausias setas ({u})', chartNoData:'Nėra duomenų',
    histEmpty:'Istorijos dar nėra. Pasirink treniruotę skiltyje „Treniruotė“.',
    histDel:'Ištrinti šią treniruotę iš istorijos?', histSets:'setai', histVolume:'apimtis',
    setTheme:'Tema', themeAuto:'Auto', themeDark:'Tamsi', themeLight:'Šviesi',
    setLang:'Kalba', setAwake:'Neužmigdyti ekrano',
    setRestSnd:'Poilsio garso signalas',
    setRestHint:'Poilsio taikinys nustatomas treniruotės redagavime prie kiekvieno pratimo. Kai laikas sueina, juosta sumirksi ir pyptelės — telefonui esant begarsiu režimu signalas tik vizualus.',
    tplRest:'Poilsis', tplRestOff:'laisvai',
    setBackup:'Atsarginė kopija', setBackupCopy:'Kopijuoti atsarginį kodą', setBackupLoad:'Įkelti atsarginį kodą',
    csvTitle:'CSV eksportas (analizei)',
    csvSets:'Treniruočių setai (CSV)', csvBw:'Kūno svoris (CSV)',
    csvHint:'Viena eilutė = vienas setas. Svoriai {u}, datos ISO, UTF-8 — tinka Excel / Google Sheets / Python.',
    csvEmpty:'Dar nėra ką eksportuoti',
    bakHint:'Įklijuok atsarginį kodą — VISI dabartiniai duomenys bus pakeisti.',
    bakConfirm:'Atkurti duomenis iš kodo? Dabartiniai duomenys bus pakeisti.',
    bakDone:'Duomenys atkurti ✓',
    setDanger:'Pavojinga zona', setWipe:'Ištrinti visus duomenis',
    setWipeConfirm:'Tikrai ištrinti VISUS duomenis (programas ir istoriją)?',
    saveError:'Nepavyko išsaugoti duomenų. Atlaisvink vietos arba nusikopijuok atsarginį kodą.',
    g_all:'Visi', g_chest:'Krūtinė', g_back:'Nugara', g_shoulders:'Pečiai', g_biceps:'Bicepsai',
    g_triceps:'Tricepsai', g_forearms:'Dilbiai', g_quads:'Keturgalviai', g_hamstrings:'Dvigalviai',
    g_glutes:'Sėdmenys', g_calves:'Blauzdos', g_core:'Pilvo presas', g_other:'Kita',
    e_barbell:'Štanga', e_dumbbell:'Hanteliai', e_machine:'Treniruoklis', e_cable:'Trosas',
    e_bodyweight:'Savo svoris', e_kettlebell:'Girja', e_other:'Kita'
  },
  en: {
    tabHome:'Workout', tabProgram:'Programs', tabExercises:'Exercises', tabHistory:'History', tabSettings:'Settings',
    today:'today', yesterday:'yesterday', daysAgo:'{n} days ago', never:'not done yet',
    statWeek:'this week', statTotal:'total',
    homeContinue:'Continue workout',
    homeTemplates:'My templates',
    woFinish:'FINISH', woElapsed:'DURATION',
    woCancel:'Cancel workout', woCancelConfirm:'Cancel workout? Entered data will not be saved.',
    woSwitchConfirm:'Another workout is in progress. Discard it and start a new one?',
    woSet:'Set', woPrev:'Previous', woReps:'reps',
    woAddSet:'+ Set', woRemoveSet:'− Set', woRemoveDone:'Set already completed',
    woDelEx:'Remove exercise “{n}”?', woDelExBtn:'Remove exercise',
    swapTitle:'Swap exercise', swapPlanned:'planned', swapAdd:'+ Add alternative',
    woAltBack:'Back to', altLabel:'alt.', altAdd:'Alternative',
    woOrderHint:'Order done', woPrevOrderHint:'Last time you did it in this order',
    warmBtn:'Warmup sets', warmNeedW:'Enter your working weight first', warmTooLight:'Weight too light for a warmup ramp',
    woNoteSess:'Note (this workout)…', woNotePerm:'Permanent note…', woNotePermToggle:'Permanent note',
    woEmptyVals:'Enter weight and reps',
    woFinishEmpty:'No completed sets. Discard workout?',
    woFinishPart:'Not all sets completed. Finish and save?',
    restLabel:'Rest',
    tplNew:'+ New workout', tplImport:'Enter code', tplDefaultName:'New workout',
    tplDel:'Delete workout “{n}”?', tplExCount:'{n} ex.',
    tplName:'Workout name', tplAddEx:'+ Add exercise', tplDelEx:'Remove exercise “{n}”?',
    tplShare:'Workout code', tplShareHint:'Send this code to a friend — they enter it and get your workout.',
    tplImportTitle:'Enter code', tplImportHint:'Paste the received code here:',
    tplImportBtn:'Import', tplImported:'Workout “{n}” added ✓',
    folderNew:'+ New program', folderDefault:'New program', folderNone:'No program',
    folderName:'Program name', folderDel:'Delete program “{n}”? Workouts will remain, just without the program.',
    folderShare:'Program code', folderShareHint:'Send this code to a friend — they get the whole program with all workouts.',
    folderImported:'Program “{n}” added ✓', tplFolder:'Program', deleteBtn:'Delete', nextBadge:'NEXT',
    progEmpty:'No programs yet — tap “+ New program” below and build your split.',
    homeNoProg:'No programs — create one in the Programs tab.',
    histEditTitle:'Edit workout',
    tplDup:'Duplicate', tplDupSuffix:'(copy)',
    woSec:'sec',
    sumTitle:'Workout saved', sumDur:'Duration', sumVol:'Volume', sumSets:'Sets',
    sumPRs:'New records', sumOk:'Done',
    recTitle:'Records', rec1RM:'~1RM (estimated)', recBestSet:'Best set', recTime:'Longest',
    bakRemind:"Backup code hasn't been copied in a while.",
    protTitle:'Data protection', protPersist:'Persistent storage',
    protOn:'✓ On', protOff:'Not granted',
    protSnaps:'Automatic on-device snapshots',
    protRestore:'Restore', protRestoreConfirm:'Restore data from {d}? Current data will be replaced.',
    protNoSnaps:'No snapshots yet — one will appear after the next save.',
    protRestored:'Restored ✓', protRecovered:'Data recovered from backup storage ✓',
    protHint:'A daily snapshot is kept on this device and data is mirrored to a second storage — if one breaks, the other restores it. Still copy a backup code occasionally: it is the only thing that survives losing the phone.',
    updToast:'Updated to the latest version ✓',
    setUnit:'Units',
    bwEnter:'Enter your body weight',
    woBwCol:'BW', woAddCol:'Added', woBwHint:'Body weight (stats only)',
    exCreateMode:'Type', modeReps:'Reps', modeTime:'Time (sec)',
    histArch:'Archive', histUnarch:'Restore', archTitle:'Archive',
    statsMuscle:'Muscle balance',
    statsWorkoutsPer:'Workouts', statsVolumePer:'Volume',
    pdcW:'Wk', pdcM:'Mo', pdcY:'Yr', pdAll:'All',
    pdFrom:'From', pdTo:'To',
    hs7w:'workouts · 7 d', hs7v:'volume · 7 d', hsGap:'avg gap',
    rhythmTitle:'Rhythm',
    trackedTitle:'Tracked lifts', trackAdd:'+ Track a lift',
    trackedEmpty:'Pick the lifts whose progress you want to see here — e.g. bench and squat.',
    trackedDup:'This lift is already tracked',
    trackDelta30:'in 30 d',
    prTitle:'Recent records', prEmpty:'Records will show up after a few workouts.',
    dlBtn:'Deload',
    mainSet:'Main program: {n}', mainTitle:'Main program',
    dlEndConfirm:'End the deload early?',
    dlOn:'Deload started',
    dlDone:'Deload cycle complete',
    dlActiveBanner:'DELOAD',
    dlLeft:'{n} workouts left', dlSub:'records paused · tap to end',
    dlWoBar:'DELOAD — suggested weights ~{p}%', dlWoBarVol:'half sets',
    dlBadge:'DELOAD', dlCycles:'Full cycles since deload',
    dlmHow:'One light pass per workout. Sets do not count toward records and the counters restart. Once every workout is done the deload ends by itself — or end it early by tapping the orange banner on Home.',
    dlmW:'Suggested weights',
    dlmWHint:'50–60% is the strength classic. 70% is gentler. 90% keeps near-working weights: pick “Half” sets then and stay far from failure.',
    dlmSets:'Sets',
    dlmSetsAll:'All', dlmSetsHalf:'Half',
    dlmSetsHint:'“Half” plans half the sets. Athletes most often deload by cutting volume ~30–50%.',
    dlmLight:'Light exercises (< {n}) are only trimmed to ~80% — isolation work needs little reduction.',
    dlmStart:'Start deload',
    histMore:'Show more', bwLogNew:'+ Log weight',
    metricW:'Weight', metricVol:'Volume', metric1RM:'~1RM',
    exMine:'Mine', exMineEmpty:'Exercises you have done will appear here. Browse “All” for now.',
    saveDone:'Save',
    bw:'Body weight', bwLog:'Log', bwDel:'Delete this entry?',
    plates:'Plate calculator', platesBar:'Bar', platesSide:'Per side',
    platesRem:"{n} {u} per side doesn't fit standard plates", platesEmpty:'Empty bar',
    platesAvail:'Plates available at the gym',
    superset:'Superset',
    codeBad:'Invalid code', copy:'Copy', copied:'Copied ✓',
    daySets:'sets', dayReps:'reps', daySec:'sec', repsRangeTog:'range',
    exSearch:'Search exercises...', exCreate:'+ Create your own exercise',
    exCreateTitle:'New exercise', exCreateName:'Name', exCreateGroup:'Muscle group',
    exCreateSave:'Save', exNameReq:'Enter a name',
    exBest:'Best', exSessions:'Sessions', exLastDone:'Last done',
    exNoHistory:'No history for this exercise yet',
    chartTop:'top set ({u})', chartNoData:'No data',
    histEmpty:'No history yet. Pick a workout in the Workout tab.',
    histDel:'Delete this workout from history?', histSets:'sets', histVolume:'volume',
    setTheme:'Theme', themeAuto:'Auto', themeDark:'Dark', themeLight:'Light',
    setLang:'Language', setAwake:'Keep screen awake',
    setRestSnd:'Rest sound signal',
    setRestHint:'Set a rest target per exercise when editing a workout. When time is up, the bar flashes and beeps — on silent mode the signal is visual only.',
    tplRest:'Rest', tplRestOff:'free',
    setBackup:'Backup', setBackupCopy:'Copy backup code', setBackupLoad:'Load backup code',
    csvTitle:'CSV export (for analysis)',
    csvSets:'Workout sets (CSV)', csvBw:'Body weight (CSV)',
    csvHint:'One row = one set. Weights in {u}, ISO dates, UTF-8 — ready for Excel / Google Sheets / Python.',
    csvEmpty:'Nothing to export yet',
    bakHint:'Paste a backup code — ALL current data will be replaced.',
    bakConfirm:'Restore data from code? Current data will be replaced.',
    bakDone:'Data restored ✓',
    setDanger:'Danger zone', setWipe:'Delete all data',
    setWipeConfirm:'Really delete ALL data (templates and history)?',
    saveError:'Could not save data. Free up space or copy a backup code.',
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
    { id:uid(), name:'Upper A', folderId:fid, ex:[
      tex('bench-press',4,'4-6'), tex('barbell-row',3,'6-8'), tex('smith-incline-press',2,'8-10'),
      tex('lat-pulldown',2,'10-12'), tex('cable-lateral-raise',2,'12-15'), tex('incline-db-curl',2,'8-12'),
      tex('triceps-pushdown',2,'10-12') ]},
    { id:uid(), name:'Lower A', folderId:fid, ex:[
      tex('back-squat',4,'4-6'), tex('romanian-deadlift',3,'6-8'), tex('leg-press',2,'10-12'),
      tex('lying-leg-curl',2,'10-12'), tex('leg-extension',2,'12-15'), tex('seated-calf-raise',3,'10-15') ]},
    { id:uid(), name:'Upper B', folderId:fid, ex:[
      tex('overhead-press',4,'5-7'), tex('chest-dip',3,'6-8'), tex('pull-up',3,'6-8'),
      tex('chest-supported-row',2,'10-12'), tex('face-pull',2,'15-20'), tex('hammer-curl',2,'8-12'),
      tex('overhead-triceps-ext',2,'10-12') ]},
    { id:uid(), name:'Lower B', folderId:fid, ex:[
      tex('back-squat',3,'8-10'), tex('bulgarian-split-squat',2,'8-12'), tex('leg-press',2,'12-15'),
      tex('lying-leg-curl',2,'10-12'), tex('leg-extension',2,'15-20'), tex('calf-press',3,'12-20') ]},
    { id:uid(), name:'Upper C', folderId:fid, ex:[
      tex('smith-incline-press',2,'8-10'), tex('seated-cable-row',2,'10-12'), tex('lat-pulldown',2,'12-15'),
      tex('lateral-raise',3,'12-20'), tex('face-pull',2,'15-20'), tex('preacher-curl',2,'8-12'),
      tex('overhead-triceps-ext',2,'10-15') ]}
  ];
}
/* plate calculator: full selectable options and the default "what my gym has" set (per unit) */
const PLATE_OPTS = { kg:[25,20,15,10,5,2.5,1.25,0.5], lb:[45,35,25,15,10,5,2.5,1.25] };
const PLATE_DEF  = { kg:[25,20,15,10,5,2.5,1.25],      lb:[45,35,25,10,5,2.5] };
function defaultState(){
  const fid = uid();
  return { lang:'en', unit:'kg', theme:'auto', keepAwake:true, lastBackup:0, bakSnooze:0, mig13:true,
           restTarget:120, restSound:true, /* restTarget = last picked value in the editor */
           folders:[{ id:fid, name:'Upper / Lower', open:true, pinned:true }],
           customEx:[], templates:seedTemplates(fid), history:[], weights:[], active:null,
           trackedLifts:[], deloads:[], mainFolder:null,
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
  if(!s.plates || !Array.isArray(s.plates.kg) || !Array.isArray(s.plates.lb)){
    s.plates = { kg:PLATE_DEF.kg.slice(), lb:PLATE_DEF.lb.slice() };
  }
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
    /* once state grows large, three full copies would dominate the localStorage
       quota — skip on-device snapshots and rely on the IndexedDB mirror + backup codes */
    if(prev && prev.length < 1500000) localStorage.setItem(SNAP_PREFIX+today, prev);
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
  const json = JSON.stringify(S);
  try{
    maybeSnapshot();
    localStorage.setItem(LS_KEY, json);
  }catch(e){
    /* quota exceeded — snapshots are the largest extra; drop them so the main
       state always persists, then retry once */
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
            histLimit:20,
            /* per-chart period state: p = 'w'|'m'|'y'|'c' (charts), days|'all'|'c' (muscle/bw);
               f/t = custom from–to as yyyy-mm-dd */
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

function fmtSet(s, k){
  const tm = isTimeEx(k), bw = isBwEx(k);
  const p = s.warm ? 'W ' : s.drop ? 'D ' : s.fail ? 'F ' : '';
  if(tm) return p + (s.weight ? wu(s.weight)+'·' : '') + s.reps + 's';
  if(bw){
    const add = s.weight ? (s.weight>0?'+':'') + wu(s.weight) + ' ' : '';
    return p + add + '×' + s.reps;
  }
  return p + wu(s.weight) + '×' + s.reps;
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
/* normalize a template target to a clean "N" or "N-M" string (1..max, default 50 for reps) */
function normReps(v, max){
  max = max || 50;
  if(v==null) return '10';
  const m = String(v).replace(/[^\d-]/g,'').match(/^(\d+)(?:\s*-\s*(\d+))?/);
  if(!m) return '10';
  const clamp = n => Math.max(1, Math.min(max, parseInt(n,10)||10));
  let lo = clamp(m[1]);
  if(m[2]!=null && m[2]!==''){
    let hi = clamp(m[2]);
    if(hi < lo){ const x=lo; lo=hi; hi=x; }
    return lo===hi ? String(lo) : lo+'-'+hi;
  }
  return String(lo);
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
  if(meta) meta.content = mode==='dark' ? '#07090c' : '#f2f4f8';
}
mediaDark.addEventListener('change', ()=>{ if(S.theme==='auto') applyTheme(); });

/* ======================= render core ======================= */
function go(screen){
  if(screen!==V.screen && screen==='history') V.histLimit = 20;
  V.screen = screen;
  render();
  /* entrance animation only on navigation, not on every re-render */
  const el = $('#screen');
  el.classList.remove('screen-in'); void el.offsetWidth;
  el.classList.add('screen-in');
  clearTimeout(go._t);
  go._t = setTimeout(()=>el.classList.remove('screen-in'), 450);
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
    /* while resting, the label line shows the count-up since the last set — always
       glanceable, even when the rest bar is scrolled away */
    const r = S.active.rest;
    const rdone = r && r.tgt && (Date.now()-r.at)/1000 >= r.tgt;
    const label = r
      ? `<span class="tbr${rdone?' done':''}"><span class="tbdot"></span>${t('restLabel')} <span id="tbrest-time">${fmtTime((Date.now()-r.at)/1000)}${r.tgt?'/'+fmtTime(r.tgt):''}</span></span> · ${esc(S.active.name)}`
      : `${t('woElapsed')} · ${esc(S.active.name)}`;
    h = `<button class="iconbtn" onclick="go('home')">‹</button>
         <div class="elapsed"><small>${label}</small><span id="elapsed-time">${el}</span></div>
         <button class="iconbtn danger" onclick="cancelWorkout()" aria-label="${t('woCancel')}">${ACT_ICONS.x}</button>
         <button class="finishbtn" onclick="finishWorkout()">${t('woFinish')}</button>`;
  }else if(V.screen==='tpledit'){
    const d = S.templates.find(x=>x.id===V.editTpl);
    h = `<button class="iconbtn" onclick="closeTplEdit()">‹</button><h1>${d?esc(d.name):''}</h1>
         <button class="finishbtn" onclick="closeTplEdit()">${ACT_ICONS.check} ${t('saveDone')}</button>`;
  }else if(V.screen==='splitview'){
    const f = S.folders.find(x=>x.id===V.viewFolder);
    h = `<button class="iconbtn" onclick="go('program')">‹</button><h1>${f?esc(f.name):''}</h1>
         <button class="finishbtn" onclick="go('program')">${ACT_ICONS.check} ${t('saveDone')}</button>`;
  }else if(V.screen==='exdetail'){
    h = `<button class="iconbtn" onclick="go((V.exDetailFrom==='workout'&&S.active)?'workout':(V.exDetailFrom==='history'?'history':'exercises'))">‹</button><h1>${esc(exName(V.exDetail, V.exDetailName))}</h1>`;
  }else{
    const titles = { home:'Daveedus', program:t('tabProgram'), exercises:t('tabExercises'),
                     history:t('tabHistory'), settings:t('tabSettings') };
    h = `<h1>${titles[V.screen]||'Daveedus'}</h1>`;
    if(V.screen==='home' && S.active){
      h += `<button class="finishbtn" onclick="go('workout')">${ACT_ICONS.play} ${fmtTime((Date.now()-new Date(S.active.startedAt).getTime())/1000)}</button>`;
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
/* small line icons for card/row actions (clean SVG, no emoji) */
const ACT_ICONS = {
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.8V6a1 1 0 0 1 1-1 2 2 0 0 0 0-4h4a2 2 0 0 0 0 4 1 1 0 0 1 1 1v4.8l2 2.2H7l2-2.2Z"/></svg>',
  chevron:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4.5v15l12-7.5z"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>',
  plates:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 8l5-5 5 5"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 11l5 5 5-5"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  archive:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
  restore:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3 8a9 9 0 1 1-1 5"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  scale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="M8.2 8.5h7.6L18 20a1 1 0 0 1-1 1.2H7A1 1 0 0 1 6 20z"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6L12 16.8 6.6 19.7l1.1-6L3.2 9.4l6.1-.8z"/></svg>'
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
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--orange)">${t('bakRemind')}</span>
      <button class="btn small" style="background:var(--accent);color:var(--on-accent)" onclick="copyBackup();render()">${t('copy')}</button>
      <button class="minibtn" style="width:32px;min-height:32px;font-size:12px" onclick="S.bakSnooze=Date.now(); save(); render()">✕</button>
    </div>`;
  }
  h += `<div class="statrow">
      <div class="stat" style="cursor:pointer" onclick="go('history')"><div class="v">${weekCount()}</div><div class="l">${t('statWeek')}</div></div>
      <div class="stat" style="cursor:pointer" onclick="go('history')"><div class="v">${S.history.length}</div><div class="l">${t('statTotal')}</div></div>
      <div class="stat" style="cursor:pointer" onclick="openBwModal()">
        <div class="v">${S.weights.length?wu(S.weights[0].kg):'—'}</div><div class="l">${t('bw').toLowerCase()}, ${unitL()}</div></div>
    </div>`;
  if(S.active){
    const n = S.active.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
    h += `<h2 class="sec">${t('homeContinue')}</h2>
      <button class="tplbtn continue" onclick="go('workout')">
        <div class="tinfo"><div class="tname">${esc(S.active.name)}</div>
        <div class="tsub"><span id="home-elapsed">${fmtTime((Date.now()-new Date(S.active.startedAt).getTime())/1000)}</span> · ${n} ✓</div></div>
        <div class="go">${ACT_ICONS.play}</div></button>`;
  }
  const tplBtn = (d, isNext) => {
    const last = S.history.find(x=>x.tplId===d.id);
    const names = d.ex.slice(0,3).map(e=>exName(e.k,e.n)).join(', ') + (d.ex.length>3?'…':'');
    return `<button class="tplbtn ${isNext?'next':''}" onclick="startWorkout('${d.id}')">
      <div class="tinfo"><div class="tname">${esc(d.name)}${isNext?` <span class="nextchip">${t('nextBadge')}</span>`:''}</div>
      <div class="tsub">${last?daysAgoStr(last.date):t('never')} · ${esc(names)}</div></div>
      <div class="go">${ACT_ICONS.play}</div></button>`;
  };
  /* deload: active banner (tap = end early), otherwise a subtle button in the section header */
  const dl = dlActive();
  if(dl){
    h += `<div class="dlcard" onclick="endDeload()">
      <span class="dlttl">${t('dlActiveBanner')}</span>
      <span class="dlsub">${t('dlLeft',{n:dlRemaining(dl).length})} · ${t('dlSub')}</span></div>`;
  }
  /* home shows only PINNED splits as a grid of split cards; fall back to all when none pinned */
  const pinned = S.folders.filter(f=>f.pinned);
  const showFolders = pinned.length ? pinned : S.folders;
  /* workout + full-cycle counters since the last deload — the "when to deload" gauge */
  const counts = tplCounts();
  const mainId = mainFolderId();
  /* the main-program star only matters when there is a choice */
  const multi = showFolders.filter(f=>S.templates.some(x=>x.folderId===f.id)).length > 1;
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
    const cycles = Math.min(...tpls.map(d=>counts[d.id]||0));
    const rows = tpls.map(d=>{
      const dlDue = dl && dl.tpls.includes(d.id) && !dl.done.includes(d.id);
      return `<button class="sprow ${d.id===nextId?'next':''}" onclick="startWorkout('${d.id}')">
      <span class="spn">${esc(d.name)}</span>
      ${dlDue?`<span class="dldot" title="${t('dlBadge')}"></span>`:''}
      ${counts[d.id]?`<span class="spcnt">${counts[d.id]}</span>`:''}
      ${d.id===nextId?`<span class="nextchip">${t('nextBadge')}</span>`:''}</button>`;
    }).join('');
    return `<div class="splitcard">
      <div class="sphead" onclick="openSplit('${f.id}')"><span class="sphn">${esc(f.name)} ›</span>
        ${cycles?`<span class="cyc" title="${t('dlCycles')}">${cycles}×</span>`:''}
        ${multi?`<button class="mainbtn${f.id===mainId?' on':''}" onclick="event.stopPropagation();setMainFolder('${f.id}')" aria-label="${t('mainTitle')}">${ACT_ICONS.star}</button>`:''}</div>${rows}</div>`;
  }).filter(Boolean);
  if(cards.length){
    h += `<h2 class="sec" style="display:flex;align-items:center"><span style="flex:1">${t('homeTemplates')}</span>
      ${dl?'':`<button class="secbtn" onclick="startDeload()">${t('dlBtn')}</button>`}</h2>
      <div class="splitgrid">${cards.join('')}</div>`;
  }
  const loose = looseTemplates();
  if(loose.length && !pinned.length){
    h += `<h2 class="sec">${S.folders.length?t('folderNone'):t('homeTemplates')}</h2>` + loose.map(d=>tplBtn(d,false)).join('');
  }
  if(!cards.length && !loose.length){
    h += `<div class="empty">${t('homeNoProg')}</div>`;
  }
  return h;
}

/* ======================= DELOAD ======================= */
/* manual deload CYCLE: every workout of the MAIN program gets exactly one deload
   pass (reduced ghost loads, sets out of records/PRs, tagged dl:1). The deload ends
   automatically once each workout was done once — or manually anytime. A workout
   whose deload pass is already done counts as a normal session again.
   Options (research-backed, see v1.9.3 notes): load 50/60/70/90 % of previous
   working weights + optional half sets. Light exercises (<20 kg) are only trimmed
   to ~80 % — surveyed athletes mostly keep isolation loads and cut volume instead. */
const DL_FACTOR = 0.6;      /* default load % */
const DL_LIGHT_KG = 20;     /* below this, cap the reduction at DL_LIGHT_FLOOR */
const DL_LIGHT_FLOOR = 0.8;
function dlActive(){
  const d = S.deloads[S.deloads.length-1];
  if(!d || d.e) return null;
  /* self-heal: if every still-existing workout has its pass, the cycle is complete */
  if(d.tpls.length && !dlRemaining(d).length){ d.e = Date.now(); save(); return null; }
  return d;
}
/* workouts still waiting for their deload pass (deleted templates don't block) */
function dlRemaining(d){
  return d.tpls.filter(id=>!d.done.includes(id) && S.templates.some(tp=>tp.id===id));
}
/* is THIS workout's deload pass still due? (drives ghost scaling + dl tagging) */
function dlForTpl(tplId){
  const d = dlActive();
  return !!(d && tplId && d.tpls.includes(tplId) && !d.done.includes(tplId));
}
function dlLastStart(){
  const d = S.deloads[S.deloads.length-1];
  return d ? d.s : 0;
}
/* MAIN program: the split deload (and future self-regulation features) anchors to.
   User-picked among the pinned home cards; falls back to the first shown card. */
function mainFolderId(){
  const pinned = S.folders.filter(f=>f.pinned);
  const pool = pinned.length ? pinned : S.folders;
  if(S.mainFolder && pool.some(f=>f.id===S.mainFolder)) return S.mainFolder;
  return pool.length ? pool[0].id : null;
}
function setMainFolder(id){
  const f = S.folders.find(x=>x.id===id);
  if(!f) return;
  S.mainFolder = id;
  save(); render();
  toast(t('mainSet',{n:f.name}));
}
/* deload suggestion from a previous load (kg), rounded to the plate step;
   assisted (negative) loads are left alone — scaling them would make the set harder */
function dlW(kg){
  if(kg<=0) return kg;
  const d = dlActive();
  let p = (d && d.pct) || DL_FACTOR;
  if(kg < DL_LIGHT_KG) p = Math.max(p, DL_LIGHT_FLOOR); /* light/isolation: gentle trim only */
  const step = S.unit==='lb' ? 5/LB_PER_KG : 2.5;
  return Math.max(step, Math.round(kg*p/step)*step);
}
/* deload options sheet: pick load % and set volume, with one-line explanations */
function startDeload(){
  if(dlActive()) return;
  const fid = mainFolderId();
  const f = S.folders.find(x=>x.id===fid);
  if(!f || !S.templates.some(tp=>tp.folderId===fid)) return;
  V.dlm = { pct:DL_FACTOR, vol:1 };
  openModal(`<h3>${t('dlBtn')} · ${esc(f.name)}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:13px;line-height:1.45;margin:0 4px 14px">${t('dlmHow')}</div>
    <div id="dlm-body"></div>
    <button class="btn primary" style="margin-top:14px" onclick="confirmDeload()">${t('dlmStart')}</button>`);
  renderDlm();
}
function renderDlm(){
  const el = $('#dlm-body');
  if(!el) return;
  const o = V.dlm;
  const pctChip = p => `<button class="chip ${o.pct===p?'on':''}" onclick="V.dlm.pct=${p}; renderDlm()">${Math.round(p*100)} %</button>`;
  el.innerHTML = `
    <h2 class="sec" style="margin-top:0">${t('dlmW')}</h2>
    <div class="chips" style="padding-bottom:4px">${[0.5,0.6,0.7,0.9].map(pctChip).join('')}</div>
    <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:0 4px 6px">${t('dlmWHint')}</div>
    <h2 class="sec">${t('dlmSets')}</h2>
    <div class="chips" style="padding-bottom:4px">
      <button class="chip ${o.vol===1?'on':''}" onclick="V.dlm.vol=1; renderDlm()">${t('dlmSetsAll')}</button>
      <button class="chip ${o.vol===0.5?'on':''}" onclick="V.dlm.vol=0.5; renderDlm()">${t('dlmSetsHalf')}</button>
    </div>
    <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:0 4px 6px">${t('dlmSetsHint')}</div>
    <div style="color:var(--ghost);font-size:12px;line-height:1.45;margin:12px 4px 0">${t('dlmLight',{n:S.unit==='lb'?'45 lb':'20 kg'})}</div>`;
}
function confirmDeload(){
  if(dlActive()){ closeModal(); return; }
  const fid = mainFolderId();
  const tpls = S.templates.filter(tp=>tp.folderId===fid).map(tp=>tp.id);
  if(!tpls.length){ closeModal(); return; }
  const o = V.dlm || { pct:DL_FACTOR, vol:1 };
  S.deloads.push({ s:Date.now(), e:0, tpls, done:[], pct:o.pct, vol:o.vol });
  closeModal(); save(); render();
  toast(t('dlOn'));
}
function endDeload(){
  const d = dlActive();
  if(!d) return;
  if(!confirm(t('dlEndConfirm'))) return;
  d.e = Date.now();
  save(); render();
}
/* workouts done per template since the last deload started (deload sets excluded) —
   the "how many rounds before the next deload" counters on the home split cards */
function tplCounts(){
  const from = dlLastStart();
  const counts = {};
  for(const h of S.history){
    if(h.arch || h.dl || !h.tplId) continue;
    if(new Date(h.date).getTime() < from) continue;
    counts[h.tplId] = (counts[h.tplId]||0) + 1;
  }
  return counts;
}

/* ======================= WORKOUT ======================= */
function latestBw(){ return S.weights.length ? S.weights[0].kg : null; }
function newSet(extra){ return Object.assign({ w:'', r:'', warm:false, drop:false, fail:false, done:false, cls:'' }, extra||{}); }
function buildActiveEx(k, name, sets, reps, ss, tplId, alts, pnote, rt){
  const last = lastForExercise(k, name, tplId);
  const ex = { id:uid(), k, name, targetSets:sets, targetReps:reps, note:'', ss:!!ss, last,
    baseK:k, alts:(alts||[]).slice(), stash:{}, tplId:tplId||null,
    pnote:pnote||'', notePerm:false, prevOrder:(last && last.order) ? last.order : 0,
    sets: Array.from({length:sets}, ()=>newSet()) };
  if(typeof rt==='number' && rt>=15) ex.rt = Math.min(1800, Math.round(rt));
  if(isBwEx(k)){
    /* body weight prefilled from the latest log (or last session), kept separate from the logged load */
    ex.bw = latestBw() != null ? latestBw() : (last && last.bw != null ? last.bw : null);
  }
  return ex;
}
/* swap the exercise being performed (planned <-> alternative); each variant keeps
   its own logged sets in ex.stash so progress is tracked separately per exercise */
function swapExercise(xi, toKey){
  const ex = S.active.exercises[xi];
  if(!ex || toKey===ex.k) return;
  ex.stash[ex.k] = { name:ex.name, note:ex.note, last:ex.last, sets:ex.sets, bw:ex.bw };
  if(ex.stash[toKey]){
    const v = ex.stash[toKey];
    ex.name=v.name; ex.note=v.note; ex.last=v.last; ex.sets=v.sets; ex.bw=v.bw;
    delete ex.stash[toKey];
  }else{
    ex.name = exName(toKey);
    ex.note = '';
    ex.last = lastForExercise(toKey, ex.name, ex.tplId);
    ex.sets = Array.from({length:ex.targetSets}, ()=>newSet());
    ex.bw = isBwEx(toKey) ? (latestBw()!=null?latestBw():(ex.last&&ex.last.bw!=null?ex.last.bw:null)) : undefined;
  }
  ex.k = toKey;
  if(toKey!==ex.baseK && !ex.alts.includes(toKey)) ex.alts.push(toKey);
  if(S.active.rest && S.active.rest.key.split('-')[0]===String(xi)) S.active.rest = null;
  S.active.curEx = ex.id;
  updateExDone(ex);
  save(); render();
}
function openSwapMenu(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  const keys = [ex.baseK].concat(ex.alts.filter(k=>k!==ex.baseK));
  const items = keys.map(k=>{
    const on = k===ex.k, isBase = k===ex.baseK;
    return `<button class="swapitem ${on?'on':''}" onclick="swapExercise(${xi},'${esc(k)}');closeModal()">
      <span class="sn">${esc(exName(k))}${isBase?` <span class="basetag">${t('swapPlanned')}</span>`:''}</span>
      ${on?`<span class="chk">${ACT_ICONS.chevron}</span>`:''}</button>`;
  }).join('');
  openModal(`<h3>${t('swapTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="swaplist">${items}</div>
    <button class="btn ghostbtn" style="margin-top:10px" onclick="addAltExercise(${xi})">${t('swapAdd')}</button>`);
}
function addAltExercise(xi){
  openPicker(info=>{
    const ex = S.active.exercises[xi];
    if(!ex){ closeModal(); return; }
    /* remember this alternative on the template exercise too, so it stays an option */
    const tpl = S.templates.find(t=>t.id===S.active.tplId);
    if(tpl){ const te = tpl.ex.find(e=>e.k===ex.baseK); if(te){ if(!te.alts) te.alts=[]; if(info.id!==te.k && !te.alts.includes(info.id)) te.alts.push(info.id); } }
    closeModal();
    swapExercise(xi, info.id);
  });
}
/* per-exercise action menu — keeps the exercise header uncluttered */
function openExMenu(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  const notLast = xi < S.active.exercises.length-1;
  const bw = isBwEx(ex.k);
  const item = (cls, icon, label, action) =>
    `<button class="swapitem ${cls}" onclick="closeModal();${action}">
       <span class="mi">${icon}</span><span class="sn">${label}</span></button>`;
  openModal(`<h3>${esc(ex.name)}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="swaplist">
      ${item(ex.k!==ex.baseK?'on':'', ACT_ICONS.swap, t('swapTitle'), `openSwapMenu(${xi})`)}
      ${bw?'':item('', ACT_ICONS.plates, t('plates'), `openPlates(${xi})`)}
      ${notLast?item(ex.ss?'on':'', ACT_ICONS.link, t('superset'), `toggleWoSS(${xi})`):''}
      ${item('danger', ACT_ICONS.x, t('woDelExBtn'), `removeWorkoutEx(${xi})`)}
    </div>`);
}
function onBwInput(xi,v){
  const ex = S.active.exercises[xi];
  const n = parseNum(v);
  ex.bw = isNaN(n) ? null : u2kg(n);
  save();
}
/* quick ±0.1 (display unit) stepper for the body-weight field; updates in place, no full re-render */
function stepBw(xi,d){
  const ex = S.active.exercises[xi];
  const base = ex.bw!=null ? kg2u(ex.bw) : (latestBw()!=null ? kg2u(latestBw()) : 0);
  let v = Math.round((base + d)*10)/10;
  if(v < 0) v = 0;
  ex.bw = u2kg(v);
  const inp = document.getElementById('bw-'+xi);
  if(inp) inp.value = fmtW(v);
  save();
}
/* previous-session text for a ghost set, per exercise type */
function ghostText(g, tm, bw){
  if(!g) return '—';
  if(tm) return (g.weight ? wu(g.weight,true)+' · ' : '') + g.reps + ' s';
  if(bw) return (g.weight ? (g.weight>0?'+':'')+wu(g.weight,true)+' ' : '') + '× ' + g.reps;
  return wu(g.weight,true) + ' × ' + g.reps;
}
function lastForExercise(k, name, tplId){
  const nm = (name||'').trim().toLowerCase();
  const match = e => (e.k===k || (nm && e.name && e.name.trim().toLowerCase()===nm))
                     && e.sets && e.sets.length;
  /* prefer the last session of the SAME workout — exercise order/fatigue context matters.
     Deload sessions are skipped, so after a deload the ghosts return to real loads. */
  if(tplId){
    for(const h of S.history){
      if(h.arch || h.dl || h.tplId!==tplId) continue;
      for(const e of h.exercises){
        if(match(e)) return { date:h.date, sets:e.sets, note:e.note||'', bw:e.bw, order:e.order||0, sameTpl:true };
      }
    }
  }
  /* fallback: any workout that had this exercise (marked as approximate in the UI) */
  for(const h of S.history){
    if(h.arch || h.dl) continue;
    for(const e of h.exercises){
      if(match(e)) return { date:h.date, sets:e.sets, note:e.note||'', bw:e.bw, order:e.order||0, sameTpl:false };
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
  /* on a deload pass with "half sets" picked, plan half the sets (min 1 per exercise) */
  const dlv = dlForTpl(tpl.id) ? ((dlActive()||{}).vol || 1) : 1;
  const dls = n => Math.max(1, Math.ceil(n*dlv));
  S.active = {
    tplId: tpl.id, name: tpl.name, startedAt: new Date().toISOString(), rest:null,
    exercises: tpl.ex.map(e => buildActiveEx(e.k, exName(e.k,e.n), dls(e.s), e.r, e.ss, tpl.id, e.alts, e.pnote, e.rt))
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
  return prevWork[wi] || null;
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
  return prevWork[wi] || null;
}
function htmlWorkout(){
  if(!S.active){ V.screen='home'; return htmlHome(); }
  const dl = dlForTpl(S.active.tplId);
  let h = '<div style="height:8px"></div>';
  if(dl){
    const d = dlActive();
    h += `<div class="dlbar">${t('dlWoBar',{p:Math.round(((d&&d.pct)||DL_FACTOR)*100)})}${(d&&d.vol<1)?' · '+t('dlWoBarVol'):''}</div>`;
  }
  /* this-session completion order numbers */
  const doneOrder = {};
  S.active.exercises.filter(e=>e.doneAt).sort((a,b)=>a.doneAt-b.doneAt).forEach((e,i)=>{ doneOrder[e.id]=i+1; });
  /* outline the exercise being worked on: the one last logged (if unfinished), else the first unfinished;
     when it belongs to a superset, outline the whole linked group */
  const curEx = S.active.exercises.find(e=>e.id===S.active.curEx);
  const activeId = (curEx && !exFullyDone(curEx)) ? curEx.id : (S.active.exercises.find(e=>!exFullyDone(e))||{}).id;
  const outlined = new Set(activeId ? [activeId] : []);
  const actIdx = S.active.exercises.findIndex(e=>e.id===activeId);
  if(actIdx>=0){ const [ga,gb] = ssGroup(actIdx); for(let j=ga;j<=gb;j++) outlined.add(S.active.exercises[j].id); }
  h += S.active.exercises.map((ex,xi)=>{
    const tm = isTimeEx(ex.k), bw = isBwEx(ex.k);
    const firstNotDone = ex.sets.findIndex(s=>!s.done); /* -1 = all done */
    const wcol = bw ? t('woAddCol') : (tm ? unitL() : unitL());
    const hdr = `<div class="setgrid hdr"><div>${t('woSet')}</div><div>${t('woPrev')}</div>
      <div>${wcol}</div><div>${tm?t('woSec'):t('woReps')}</div><div>${ACT_ICONS.check}</div><div></div></div>`;
    let workNum = 0;
    const approx = ex.last && !ex.last.sameTpl ? '~' : ''; /* values borrowed from another workout */
    const rows = ex.sets.map((s,si)=>{
      const g = ghostFor(ex,si);
      const prevTxt = g ? approx + ghostText(g, tm, bw) : '—';
      if(!s.warm && !s.drop) workNum++;
      const label = s.warm ? 'W' : s.drop ? 'D' : s.fail ? 'F' : String(workNum);
      const chkCls = (s.done ? (s.cls==='loss' ? 'loss' : 'done') : '')
                   + (V.lastDone===xi+'-'+si ? ' pop' : '');
      const restHere = S.active.rest && S.active.rest.key===xi+'-'+si;
      const rowBtn = s.drop
        ? `<button class="dropbtn del" onclick="removeDrop(${xi},${si})">✕</button>`
        : `<button class="dropbtn" onclick="addDrop(${xi},${si})">D+</button>`;
      const wph = g ? wu(dl && !s.warm ? dlW(g.weight) : g.weight) : (bw ? '+' : unitL());
      const isCur = si === firstNotDone;                          /* the set to do now */
      const isLocked = firstNotDone!==-1 && !s.done && !isCur;    /* later sets: ✓ waits its turn */
      return `<div class="setrow-wrap ${s.done?'done':''} ${s.drop?'droprow':''} ${isLocked?'locked':''}">
        <div class="setgrid">
          <button class="setnum ${s.warm?'warm':''} ${s.drop?'dropn':''} ${s.fail?'failn':''}" onclick="toggleWarm(${xi},${si})">${label}</button>
          <div class="prev">${prevTxt}</div>
          <input type="text" inputmode="decimal" id="w-${xi}-${si}" placeholder="${wph}" value="${esc(s.w)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'w',this.value)">
          <input type="text" inputmode="numeric" id="r-${xi}-${si}" placeholder="${g?g.reps:(tm?'s':'×')}" value="${esc(s.r)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'r',this.value)">
          <button class="checkbtn ${chkCls}${isCur?' cur':''}" onclick="toggleSet(${xi},${si})">${ACT_ICONS.check}</button>
          ${rowBtn}
        </div>
        ${restHere ? restBarHtml() : ''}
      </div>`;
    }).join('');
    const bwPh = latestBw()!=null ? fmtW(kg2u(latestBw())) : '';
    const bwField = bw ? `<div class="bwline">
      <span class="bwlbl" onclick="document.getElementById('bw-${xi}').focus()">${ACT_ICONS.scale} ${t('woBwCol')}</span>
      <div class="bwstepper">
        <button class="bwstep" onclick="stepBw(${xi},-0.1)" aria-label="-0.1">▾</button>
        <input type="text" inputmode="decimal" class="bwinput" id="bw-${xi}" placeholder="${bwPh}"
          value="${ex.bw!=null?esc(fmtW(kg2u(ex.bw))):''}" oninput="onBwInput(${xi},this.value)">
        <button class="bwstep" onclick="stepBw(${xi},0.1)" aria-label="+0.1">▴</button>
      </div>
      <span class="bwu">${unitL()}</span><span class="bwhint">${t('woBwHint')}</span></div>` : '';
    const notLast = xi < S.active.exercises.length-1;
    const ssConn = (ex.ss && notLast) ? `<div class="ssline">${ACT_ICONS.link} ${t('superset')}</div>` : '';
    const isAlt = ex.k !== ex.baseK;
    const statusBadge = doneOrder[ex.id] ? `<span class="ordbadge" title="${t('woOrderHint')}">${doneOrder[ex.id]}</span>`
      : (ex.prevOrder ? `<span class="ordbadge last" title="${t('woPrevOrderHint')}">${ex.prevOrder}</span>` : '');
    return `<div class="card${isAlt?' altcard':''}${doneOrder[ex.id]?' exdone':''}${outlined.has(ex.id)?' excur':''}">
      <div class="exhead">
        <div class="exname" onclick="openExDetailByKey('${esc(ex.k)}')">${esc(ex.name)}</div>
        ${statusBadge}
        <div class="extarget">${ex.targetSets}×${ex.targetReps}${tm?'s':''}</div>
        ${(tm||bw)?'':`<button class="minibtn warm${ex.sets.some(s=>s.warm&&!s.done)?' on':''}" onclick="autoWarmup(${xi})" aria-label="${t('warmBtn')}">W</button>`}
        <button class="minibtn${isAlt||ex.ss?' acc':''}" onclick="openExMenu(${xi})" aria-label="menu">${ACT_ICONS.more}</button>
      </div>
      ${isAlt?`<div class="altbar" onclick="swapExercise(${xi},'${esc(ex.baseK)}')">${ACT_ICONS.swap}<span>${t('woAltBack')} ${esc(exName(ex.baseK))}</span></div>`:''}
      ${(ex.pnote && !ex.notePerm) ? `<div class="pnote">${ACT_ICONS.pin} ${esc(ex.pnote)}</div>` : ''}
      ${ex.last && ex.last.note ? `<div class="lastnote">${ACT_ICONS.note} <span>${esc(ex.last.note)}</span></div>` : ''}
      <div class="noterow">
        <input class="exnote${ex.notePerm?' perm':''}" placeholder="${ex.notePerm?t('woNotePerm'):t('woNoteSess')}"
          value="${esc(ex.notePerm?(ex.pnote||''):ex.note)}"
          oninput="${ex.notePerm?`setPnote(${xi},this.value)`:`onNoteInput(${xi},this.value)`}">
        <button class="noteperm${ex.notePerm?' on':''}" onclick="toggleNoteMode(${xi})" aria-label="${t('woNotePermToggle')}">${ACT_ICONS.pin}</button>
      </div>
      ${bwField}${hdr}${rows}
      <div class="setctl">
        <button onclick="addSet(${xi})">${t('woAddSet')}</button>
        <button onclick="removeSet(${xi})">${t('woRemoveSet')}</button>
      </div>
    </div>${ssConn}`;
  }).join('');
  V.lastDone = null; /* pop animation plays once */
  return h;
}
function restBarHtml(){
  const r = S.active.rest;
  const el = (Date.now()-r.at)/1000;
  if(!r.tgt) return `<div class="restbar" id="restbar" onclick="dismissRest()">
    <span class="pulse"></span>
    <span class="tm" id="rest-time">${t('restLabel')} ${fmtTime(el)}</span>
  </div>`;
  const done = el >= r.tgt;
  return `<div class="restbar target${done?' done':''}" id="restbar" onclick="dismissRest()">
    <div class="rfill" id="rest-fill" style="width:${Math.min(100, el/r.tgt*100)}%"></div>
    <button class="adj" onclick="event.stopPropagation();adjRest(-15)">−15</button>
    <span class="mid"><span class="pulse"></span>
      <span class="tm" id="rest-time">${t('restLabel')} ${fmtTime(el)} / ${fmtTime(r.tgt)}</span></span>
    <button class="adj" onclick="event.stopPropagation();adjRest(15)">+15</button>
  </div>`;
}
/* nudge the target of the CURRENT rest only (the default in Settings stays) */
function adjRest(d){
  const r = S.active && S.active.rest;
  if(!r || !r.tgt) return;
  unlockAudio();
  r.tgt = Math.min(1800, Math.max(15, r.tgt + d));
  if((Date.now()-r.at)/1000 < r.tgt) r.sig = 0; /* extended past "done" — signal re-arms */
  save(); render();
}
function dismissRest(){
  if(S.active) S.active.rest = null;
  save(); render();
}
function onSetInput(xi,si,f,v){ S.active.exercises[xi].sets[si][f]=v; save(); }
function onNoteInput(xi,v){ S.active.exercises[xi].note=v; save(); }
/* toggle the note field between "this workout only" and a permanent note kept on the template */
function toggleNoteMode(xi){ const ex=S.active.exercises[xi]; ex.notePerm=!ex.notePerm; save(); render(); }
function setPnote(xi,v){
  const ex = S.active.exercises[xi];
  ex.pnote = v;
  const tpl = S.templates.find(t=>t.id===S.active.tplId);
  if(tpl){ const te = tpl.ex.find(e=>e.k===ex.baseK); if(te) te.pnote = v; }
  save();
}
/* tap the set number to cycle its type: number -> W (warmup) -> F (failure) -> number */
function toggleWarm(xi,si){
  const s = S.active.exercises[xi].sets[si];
  if(s.done || s.drop) return;
  if(!s.warm && !s.fail){ s.warm = true; }
  else if(s.warm){ s.warm = false; s.fail = true; }
  else { s.fail = false; }
  save(); render();
}
/* one-tap warmup ramp: empty bar x10 (barbell lifts), then ~40/60/80% of the
   working weight at 6/4/2 reps — the standard strength ramp; low reps up high
   so the warmup wakes you up without eating into the work sets. Warmup sets
   are W-typed, so they stay out of records/volume/progress. Tapping W again
   removes the not-yet-done warmups. */
function autoWarmup(xi){
  const ex = S.active.exercises[xi];
  if(!ex || isTimeEx(ex.k) || isBwEx(ex.k)) return;
  const undoneWarm = ex.sets.some(s=>s.warm && !s.done);
  if(undoneWarm){
    ex.sets = ex.sets.filter(s=>!(s.warm && !s.done));
    if(S.active.rest && Number(S.active.rest.key.split('-')[0])===xi) S.active.rest = null;
    updateExDone(ex); save(); render(); return;
  }
  /* target = the first working set's weight (typed, or the ghost from last time) */
  let w = NaN;
  for(let i=0;i<ex.sets.length;i++){
    const s = ex.sets[i];
    if(s.warm || s.drop) continue;
    w = parseNum(s.w);
    if(isNaN(w)){ const g = ghostFor(ex,i); if(g) w = kg2u(dlForTpl(S.active.tplId) ? dlW(g.weight) : g.weight); }
    break;
  }
  if(isNaN(w) || w<=0){ toast(t('warmNeedW')); return; }
  const step = S.unit==='lb' ? 5 : 2.5;
  const bar = plateBars()[0];
  const barbell = (exInfo(ex.k)||{}).e==='barbell';
  const ramp = [];
  if(barbell && w > bar) ramp.push({ w:bar, r:10 });
  [[0.4,6],[0.6,4],[0.8,2]].forEach(([p,r])=>{
    let ww = Math.round(w*p/step)*step;
    if(barbell) ww = Math.max(ww, bar);
    if(ww<=0 || ww>=w) return;
    if(ramp.length && ww<=ramp[ramp.length-1].w) return; /* keep the ramp strictly increasing */
    ramp.push({ w:ww, r });
  });
  if(!ramp.length){ toast(t('warmTooLight')); return; }
  ex.sets = ramp.map(x=>newSet({ warm:true, w:fmtW(x.w), r:String(x.r) })).concat(ex.sets);
  shiftRestKey(xi, 0, ramp.length);
  updateExDone(ex);
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
  const ex = S.active.exercises[xi];
  ex.sets.splice(si+1, 0, newSet({drop:true}));
  shiftRestKey(xi, si+1, 1);
  updateExDone(ex);
  save(); render();
}
function removeDrop(xi,si){
  const ex = S.active.exercises[xi];
  const s = ex.sets[si];
  if(!s || !s.drop) return;
  if(s.done){ toast(t('woRemoveDone')); return; }
  ex.sets.splice(si,1);
  shiftRestKey(xi, si+1, -1);
  updateExDone(ex);
  save(); render();
}
/* an exercise is "done" when every set is checked; doneAt records the order in
   which exercises were completed (for the sequence numbers shown on the cards) */
function exFullyDone(ex){ return ex.sets.length>0 && ex.sets.every(s=>s.done); }
/* superset group around exercise xi: [first,last] indices of the linked chain
   (ex.ss links an exercise to the NEXT one); first===last means no superset */
function ssGroup(xi){
  const ex = S.active.exercises;
  let a = xi, b = xi;
  while(a>0 && ex[a-1].ss) a--;
  while(b<ex.length-1 && ex[b].ss) b++;
  return [a,b];
}
function updateExDone(ex){
  if(exFullyDone(ex)){ if(!ex.doneAt) ex.doneAt = (S.active.seq = (S.active.seq||0)+1); }
  else ex.doneAt = 0;
}
function toggleSet(xi,si){
  const ex = S.active.exercises[xi];
  const s = ex.sets[si];
  if(s.done){
    /* sets are completed in order — only the last completed set can be un-done */
    if(ex.sets.slice(si+1).some(x=>x.done)) return;
    s.done=false; s.cls=''; updateExDone(ex); save(); render(); return;
  }
  /* only the current set (first not-done) can be completed */
  if(ex.sets.findIndex(x=>!x.done) !== si) return;
  const g = ghostFor(ex,si);                 /* g.weight is kg */
  const tm = isTimeEx(ex.k), bw = isBwEx(ex.k);
  const dl = dlForTpl(S.active.tplId);
  let w = parseNum(s.w), r = parseNum(s.r);  /* w is in the display unit */
  if(isNaN(w) && g) w = kg2u(dl && !s.warm ? dlW(g.weight) : g.weight);
  if(isNaN(r) && g) r = g.reps;
  if(isNaN(w) && (tm || bw)) w = 0;          /* weight optional for time & bodyweight */
  if(isNaN(w) || isNaN(r) || Math.abs(w)>2000 || r<1 || r>5000){ toast(t('woEmptyVals')); return; }
  if(!bw && w<0){ toast(t('woEmptyVals')); return; } /* only assisted bodyweight may be negative */
  const wkg = u2kg(w);
  s.w = fmtW(w); s.r = String(Math.round(r)); s.done = true;
  const real = realPrev(ex,si);              /* kg */
  if(!real || s.warm || s.drop || dl) s.cls = 'none'; /* no win/loss judgment on a deload */
  else if(wkg>real.weight || (wkg===real.weight && r>real.reps)) s.cls='win';
  else if(wkg===real.weight && r===real.reps) s.cls='even';
  else s.cls='loss';
  /* no rest after the very last set of the workout — nothing left to rest for */
  if(S.active.exercises.every(exFullyDone)){
    S.active.rest = null;
  }else{
    S.active.rest = { at:Date.now(), key:xi+'-'+si };
    if(ex.rt){
      S.active.rest.tgt = ex.rt;
      if(S.restSound) unlockAudio(); /* iOS: audio must be unlocked by a tap */
    }
  }
  V.lastDone = xi+'-'+si;
  updateExDone(ex);
  /* superset: after each set, hand over to the next linked partner that still
     has sets left (A -> B -> A ...), so the flow alternates without scrolling */
  let jump = -1;
  const [ga,gb] = ssGroup(xi);
  if(gb > ga){
    for(let step=1; step<=gb-ga; step++){
      const j = ga + ((xi-ga+step) % (gb-ga+1));
      if(!exFullyDone(S.active.exercises[j])){ jump = j; break; }
    }
  }
  S.active.curEx = (jump>=0) ? S.active.exercises[jump].id : ex.id;
  save(); render();
  if(jump>=0 && jump!==xi){
    const card = document.querySelectorAll('#screen .card')[jump];
    if(card) card.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  /* focus the next set's weight field only when it must be typed (no ghost to one-tap) */
  const fx = (jump>=0) ? jump : xi;
  const fex = S.active.exercises[fx];
  for(let i=0; i<fex.sets.length; i++){
    if(!fex.sets[i].done){
      if(!ghostFor(fex,i) && fx===xi){
        const el = document.getElementById('w-'+fx+'-'+i);
        if(el) el.focus();
      }
      break;
    }
  }
}
function addSet(xi){
  const ex = S.active.exercises[xi];
  ex.sets.push(newSet());
  updateExDone(ex);
  save(); render();
}
function removeSet(xi){
  const ex = S.active.exercises[xi];
  const sets = ex.sets;
  if(sets.length<=1) return;
  if(sets[sets.length-1].done){ toast(t('woRemoveDone')); return; }
  sets.pop();
  updateExDone(ex);
  save(); render();
}
function toggleWoSS(xi){
  if(xi >= S.active.exercises.length-1) return;
  S.active.exercises[xi].ss = !S.active.exercises[xi].ss;
  save(); render();
}
function removeWorkoutEx(xi){
  const ex = S.active.exercises[xi];
  if(!confirm(t('woDelEx',{n:ex.name}))) return;
  const r = S.active.rest;
  if(r){
    const [rx, rs] = r.key.split('-').map(Number);
    if(rx===xi) S.active.rest = null;              /* rest belonged to the removed exercise */
    else if(rx>xi) r.key = (rx-1)+'-'+rs;          /* exercises after it shift down by one */
  }
  S.active.exercises.splice(xi,1);
  save(); render();
}
function finishWorkout(){
  if(!S.active) return;
  /* each exercise slot may hold several performed variants (planned + alternatives);
     every variant with logged sets becomes its own history entry, tracked separately */
  /* rank of each exercise slot by the order it was completed (for "last order" next time) */
  const orderMap = {};
  S.active.exercises.filter(e=>e.doneAt).sort((a,b)=>a.doneAt-b.doneAt).forEach((e,i)=>{ orderMap[e.id]=i+1; });
  const exercises = [];
  let total = 0;
  S.active.exercises.forEach(ex=>{
    const variants = [{ k:ex.k, name:ex.name, note:ex.note, sets:ex.sets, bw:ex.bw }];
    for(const sk in ex.stash){ const v=ex.stash[sk]; variants.push({ k:sk, name:v.name, note:v.note, sets:v.sets, bw:v.bw }); }
    variants.forEach(v=>{
      total += v.sets.length;
      const done = v.sets.filter(s=>s.done).map(s=>({ weight:u2kg(parseNum(s.w)), reps:parseNum(s.r), warm:!!s.warm, drop:!!s.drop, fail:!!s.fail }));
      if(!done.length) return;
      const o = { k:v.k, name:v.name, targetSets:ex.targetSets, targetReps:ex.targetReps, note:v.note||'', ss:!!ex.ss, sets:done };
      if(orderMap[ex.id]) o.order = orderMap[ex.id];
      if(isBwEx(v.k) && v.bw!=null) o.bw = v.bw;
      exercises.push(o);
    });
  });
  if(!exercises.length){
    if(confirm(t('woFinishEmpty'))){ S.active=null; save(); go('home'); }
    return;
  }
  const done = exercises.reduce((a,e)=>a+e.sets.length,0);
  if(done < total && !confirm(t('woFinishPart'))) return;
  /* detect all-time PRs BEFORE this workout enters history (never on a deload pass) */
  const isDl = dlForTpl(S.active.tplId);
  const prs = [];
  if(!isDl) for(const e of exercises){
    const work = e.sets.filter(s=>!s.warm && !s.drop);
    if(!work.length) continue;
    const prev = exStats(e.k, e.name);
    if(isTimeEx(e.k)){
      const bt = Math.max(...work.map(s=>s.reps));
      if(prev.bestTime>0 && bt>prev.bestTime) prs.push({ name:e.name, txt:bt+' s' });
    }else{
      const topW = Math.max(...work.map(s=>s.weight));
      if(prev.best>0 && topW>prev.best) prs.push({ name:e.name, txt:wu(topW,true) });
    }
  }
  const dur = Math.round((Date.now()-new Date(S.active.startedAt).getTime())/1000);
  const vol = exercises.reduce((a,e)=>a+e.sets.filter(s=>!s.warm).reduce((b,s)=>b+s.weight*s.reps,0),0);
  const entry = {
    id:uid(), tplId:S.active.tplId, name:S.active.name, date:new Date().toISOString(),
    dur, exercises
  };
  if(isDl){
    entry.dl = 1; /* deload session: out of records/PRs/ghosts, badged in history */
    const d = dlActive();
    if(d && !d.done.includes(entry.tplId)) d.done.push(entry.tplId);
    if(d && !dlRemaining(d).length){ d.e = Date.now(); toast(t('dlDone')); }
  }
  S.history.unshift(entry);
  S.active = null;
  save();
  go('home');
  showSummary(dur, vol, done, prs);
}
function showSummary(dur, vol, setsDone, prs){
  const prHtml = prs.length ? `<h2 class="sec" style="margin-top:14px">${t('sumPRs')}</h2>` +
    prs.map(p=>`<div class="card" style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px">
      <span style="flex:1;font-weight:700">${esc(p.name)}</span>
      <span style="font-weight:800;color:var(--accent-soft);font-size:18px">${p.txt}</span></div>`).join('') : '';
  openModal(`<h3>${t('sumTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="statrow">
      <div class="stat"><div class="v">${fmtTime(dur)}</div><div class="l">${t('sumDur')}</div></div>
      <div class="stat"><div class="v">${Math.round(kg2u(vol))}</div><div class="l">${t('sumVol')}, ${unitL()}</div></div>
      <div class="stat"><div class="v">${setsDone}</div><div class="l">${t('sumSets')}</div></div>
    </div>
    ${prHtml}
    <button class="btn primary" style="margin-top:14px" onclick="closeModal()">${t('sumOk')}</button>`);
  if(prs.length) confetti();
}
/* lightweight one-shot confetti — CSS animated, no library, cleans itself up */
function confetti(){
  if(document.getElementById('confetti')) return;
  const box = document.createElement('div');
  box.id = 'confetti';
  const cols = ['#3f82f7','#30d158','#ff9f0a','#ff453a','#6ca4ff','#ffd60a'];
  let html = '';
  for(let i=0;i<70;i++){
    const l = Math.random()*100, delay = Math.random()*0.5, dur = 1.6+Math.random()*1.2;
    const c = cols[i%cols.length], rot = Math.random()*360, drift = (Math.random()*2-1)*80;
    html += `<i style="left:${l}%;background:${c};animation-delay:${delay}s;animation-duration:${dur}s;--rot:${rot}deg;--drift:${drift}px"></i>`;
  }
  box.innerHTML = html;
  document.body.appendChild(box);
  setTimeout(()=>box.remove(), 3400);
}
function cancelWorkout(){
  if(!confirm(t('woCancelConfirm'))) return;
  S.active = null;
  save();
  go('home');
}

/* ============== quick ±weight steppers (shown while a weight input is focused) ============== */
let stepEl = null;
function stepVal(){ return S.unit==='lb' ? 5 : 2.5; }
function stepperInit(){
  const bar = $('#stepper');
  if(!bar) return;
  bar.querySelectorAll('button').forEach(b=>{
    b.addEventListener('pointerdown', e=>{
      e.preventDefault(); /* keep the input focused */
      stepWeight(parseFloat(b.dataset.d) < 0 ? -stepVal() : stepVal());
    });
  });
  document.addEventListener('focusin', e=>{
    if(V.screen==='workout' && e.target.id && /^[wr]-/.test(e.target.id)){
      stepEl = e.target;
      const reps = e.target.id.startsWith('r-');
      const step = reps ? 1 : stepVal();
      bar.querySelectorAll('button').forEach(b=>{
        b.textContent = (parseFloat(b.dataset.d)<0?'−':'+') + step;
      });
      bar.classList.add('show');
      updateStepTime();
      startStepLoop();
    }
  });
  document.addEventListener('focusout', ()=>{
    setTimeout(()=>{
      const a = document.activeElement;
      if(!(a && a.id && /^[wr]-/.test(a.id))){
        bar.classList.remove('show'); bar.style.transform=''; stepEl=null;
      }else stepEl = a;
    }, 120);
  });
}
/* follow the keyboard every frame while visible. iOS composites page panning on
   another thread, so any JS-positioned element visibly trails during scroll and
   the keyboard animation — instead of chasing it, the bar hides while the viewport
   is moving and snaps back the moment it settles (what Safari's own bars do). */
let stepRAF = 0;
function startStepLoop(){
  if(stepRAF) return;
  let lastOff = -1, stable = 0;
  const loop = ()=>{
    const bar = $('#stepper');
    if(!bar || !bar.classList.contains('show')){ if(bar) bar.classList.remove('moving'); stepRAF = 0; return; }
    if(window.visualViewport){
      const vv = window.visualViewport;
      const off = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
      bar.style.transform = off > 40 ? 'translateY('+(-off)+'px)' : '';
      stable = Math.abs(off - lastOff) < 1 ? stable + 1 : 0;
      lastOff = off;
      bar.classList.toggle('moving', stable < 3);
    }
    stepRAF = requestAnimationFrame(loop);
  };
  stepRAF = requestAnimationFrame(loop);
}
function stepWeight(d){
  if(!stepEl || !S.active) return;
  const m = stepEl.id.match(/^([wr])-(\d+)-(\d+)$/);
  if(!m) return;
  const xi = +m[2], si = +m[3];
  const ex = S.active.exercises[xi];
  if(!ex || !ex.sets[si] || ex.sets[si].done) return;
  if(m[1]==='r'){ /* reps field: step by ±1 */
    let cur = parseNum(stepEl.value);
    if(isNaN(cur)){
      const g = ghostFor(ex, si);
      cur = g ? g.reps : 0;
    }
    cur = Math.max(1, Math.round(cur + (d<0?-1:1)));
    stepEl.value = String(cur);
    ex.sets[si].r = String(cur);
    save();
    return;
  }
  let cur = parseNum(stepEl.value);
  if(isNaN(cur)){
    const g = ghostFor(ex, si);
    cur = g ? kg2u(g.weight) : 0;
  }
  cur = Math.round((cur + d) * 100) / 100;
  if(!isBwEx(ex.k) && cur < 0) cur = 0; /* assisted bodyweight may go negative */
  stepEl.value = fmtW(cur);
  ex.sets[si].w = fmtW(cur);
  save();
}

/* ============== elapsed + rest tick (no full re-render) ============== */
function tick(){
  if(!S.active) return;
  const now = Date.now();
  const elapsed = fmtTime((now - new Date(S.active.startedAt).getTime())/1000);
  const el = $('#elapsed-time'); if(el) el.textContent = elapsed;
  const he = $('#home-elapsed'); if(he) he.textContent = elapsed;
  const r = S.active.rest;
  if(r){
    const rel = (now - r.at)/1000;
    const done = !!r.tgt && rel >= r.tgt;
    if(V.screen==='workout'){
      const tm = $('#rest-time');
      if(tm) tm.textContent = t('restLabel')+' '+fmtTime(rel)+(r.tgt ? ' / '+fmtTime(r.tgt) : '');
      const bar = $('#restbar');
      if(bar && r.tgt) bar.classList.toggle('done', done);
      const f = $('#rest-fill');
      if(f) f.style.width = Math.min(100, rel/r.tgt*100)+'%';
    }
    const tb = $('#tbrest-time');
    if(tb){
      tb.textContent = fmtTime(rel)+(r.tgt ? '/'+fmtTime(r.tgt) : '');
      const wrap = tb.closest('.tbr');
      if(wrap) wrap.classList.toggle('done', done);
    }
    /* target reached — signal once, whatever screen is visible */
    if(r.tgt && !r.sig && done){ r.sig = 1; save(); restSignal(); }
  }
  updateStepTime();
}
/* workout + rest time on the keyboard stepper bar — the topbar scrolls away
   on iOS while the keyboard is open, this stays visible */
function updateStepTime(){
  const el = $('#step-time');
  if(!el || !S.active) return;
  const now = Date.now();
  const r = S.active.rest;
  const rdone = r && r.tgt && (now - r.at)/1000 >= r.tgt;
  el.innerHTML = fmtTime((now - new Date(S.active.startedAt).getTime())/1000)
    + (r ? ` <span class="rst${rdone?' ok':''}">· ${fmtTime((now - r.at)/1000)}${r.tgt?'/'+fmtTime(r.tgt):''}</span>` : '');
}

/* ======================= PROGRAM (splits + templates) ======================= */
function tplCardHtml(d){
  const groups = [...new Set(d.ex.map(e=>{ const i=exInfo(e.k); return i?t('g_'+i.g):null; }).filter(Boolean))].slice(0,3).join(', ');
  return `<div class="card"><div class="tplrow">
    <div class="info" onclick="openTpl('${d.id}')">
      <div class="nm">${esc(d.name)}</div>
      <div class="ct">${t('tplExCount',{n:d.ex.length})}${groups?' · '+esc(groups):''}</div>
    </div>
    <div class="rowacts">
      <button class="iconbtn2" onclick="openTpl('${d.id}')" aria-label="edit">${ACT_ICONS.edit}</button>
      <button class="iconbtn2 danger" onclick="delTpl('${d.id}')" aria-label="delete">${ACT_ICONS.x}</button>
      <button class="iconbtn2 play" onclick="startWorkout('${d.id}')" aria-label="start">${ACT_ICONS.play}</button>
    </div>
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
      <div class="rowacts">
        <button class="iconbtn2 ${f.pinned?'on':''}" onclick="event.stopPropagation(); togglePin('${f.id}')" aria-label="pin">${ACT_ICONS.pin}</button>
        <button class="iconbtn2 danger" onclick="event.stopPropagation(); delFolder('${f.id}')" aria-label="delete">${ACT_ICONS.x}</button>
        <div class="go">${ACT_ICONS.chevron}</div>
      </div></div>`;
  }).join('');
  const loose = looseTemplates();
  if(loose.length){
    if(S.folders.length) h += `<h2 class="sec">${t('folderNone')}</h2>`;
    h += loose.map(tplCardHtml).join('');
  }
  if(!S.folders.length && !loose.length){
    h += `<div class="empty">${t('progEmpty')}</div>`;
  }
  h += `<div style="height:8px"></div>
        <button class="btn ghostbtn" onclick="addFolder()">${t('folderNew')}</button>
        <button class="btn" onclick="openImportModal('tpl')">${ACT_ICONS.dl} ${t('tplImport')}</button>`;
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
        <button class="btn primary" onclick="go('program')">${ACT_ICONS.check} ${t('saveDone')}</button>
        <button class="btn" onclick="shareFolder('${f.id}')">${ACT_ICONS.share} ${t('folderShare')}</button>
        <button class="btn danger" onclick="delFolder('${f.id}')">${ACT_ICONS.x} ${t('deleteBtn')}</button>`;
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
    tpls: tpls.map(d=>({ name:d.name, ex:d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0, alts:(e.alts||[]), pnote:e.pnote||'' })) })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('folderShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('folderShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">${ACT_ICONS.copy} ${t('copy')}</button>`);
}
function openTpl(id){ V.editTpl=id; go('tpledit'); }
function closeTplEdit(){
  const d = S.templates.find(x=>x.id===V.editTpl);
  if(d && d.folderId && S.folders.some(f=>f.id===d.folderId)) openSplit(d.folderId);
  else go('program');
}
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
    const tm = isTimeEx(e.k);
    const p = repsParse(e.r);
    const rnum = (which,val) => `<div class="numfield">
      <button onclick="stepReps('${d.id}',${i},'${which}',-1)">−</button><span class="val">${val}</span>
      <button onclick="stepReps('${d.id}',${i},'${which}',1)">+</button></div>`;
    const repsCtl = p.range
      ? rnum('lo',p.lo) + `<span class="rgdash">–</span>` + rnum('hi',p.hi)
      : rnum('single',p.lo);
    const canSS = i < d.ex.length-1;
    return `<div class="exedit">
      <div class="exhrow">
        <div class="exlabel">
          <div class="n">${esc(exName(e.k,e.n))}</div>
          <div class="gr">${info?t('g_'+info.g)+' · '+t('e_'+info.e):''}</div>
        </div>
        <div class="rowacts">
          <button class="iconbtn2" onclick="moveTplEx('${d.id}',${i},-1)" aria-label="up">${ACT_ICONS.up}</button>
          <button class="iconbtn2" onclick="moveTplEx('${d.id}',${i},1)" aria-label="down">${ACT_ICONS.down}</button>
          ${canSS?`<button class="iconbtn2 ${e.ss?'on':''}" onclick="toggleSS('${d.id}',${i})" aria-label="superset">${ACT_ICONS.link}</button>`:''}
          <button class="iconbtn2 danger" onclick="delTplEx('${d.id}',${i})" aria-label="delete">${ACT_ICONS.x}</button>
        </div>
      </div>
      <div class="ctlrow">
        <span class="clbl">${t('daySets')}</span>
        <div class="numfield">
          <button onclick="bumpTplEx('${d.id}',${i},'s',-1)">−</button><span class="val">${e.s}</span>
          <button onclick="bumpTplEx('${d.id}',${i},'s',1)">+</button>
        </div>
      </div>
      <div class="ctlrow repsrow">
        <span class="clbl">${tm?t('daySec'):t('dayReps')}</span>
        ${repsCtl}
        <button class="rangetog ${p.range?'acc':''}" onclick="toggleRepsRange('${d.id}',${i})">${t('repsRangeTog')}</button>
      </div>
      <div class="ctlrow">
        <span class="clbl">${t('tplRest')}</span>
        <div class="numfield">
          <button onclick="stepTplRest('${d.id}',${i},-1)">−</button><input class="val restin" type="text" inputmode="decimal" value="${e.rt?fmtTime(e.rt):''}" placeholder="—" onfocus="this.select()" onchange="typeTplRest('${d.id}',${i},this.value)">
          <button onclick="stepTplRest('${d.id}',${i},1)">+</button>
        </div>
        ${e.rt?'':`<span class="resthint">${t('tplRestOff')}</span>`}
      </div>
      <div class="altsrow">
        <span class="clbl">${t('altLabel')}</span>
        ${(e.alts||[]).map((ak,ai)=>`<span class="altchip">${esc(exName(ak))}<button onclick="delTplAlt('${d.id}',${i},${ai})" aria-label="remove">${ACT_ICONS.x}</button></span>`).join('')}
        <button class="altadd" onclick="addTplAlt('${d.id}',${i})">${ACT_ICONS.swap} ${t('altAdd')}</button>
      </div>
      ${e.ss && canSS?`<div class="ssline">${ACT_ICONS.link} ${t('superset')}</div>`:''}
    </div>`;
  }).join('');
  if(!d.ex.length) h += `<div class="empty">—</div>`;
  h += `</div>
    <button class="btn ghostbtn" onclick="addTplEx('${d.id}')">${t('tplAddEx')}</button>
    <button class="btn primary" onclick="closeTplEdit()">${ACT_ICONS.check} ${t('saveDone')}</button>
    <button class="btn" onclick="dupTpl('${d.id}')">${ACT_ICONS.copy} ${t('tplDup')}</button>
    <button class="btn" onclick="shareTpl('${d.id}')">${ACT_ICONS.share} ${t('tplShare')}</button>`;
  return h;
}
function addTplAlt(id,i){
  openPicker(info=>{
    const d = S.templates.find(x=>x.id===id);
    if(!d || !d.ex[i]){ closeModal(); return; }
    if(!d.ex[i].alts) d.ex[i].alts = [];
    if(info.id!==d.ex[i].k && !d.ex[i].alts.includes(info.id)) d.ex[i].alts.push(info.id);
    save(); closeModal(); render();
  });
}
function delTplAlt(id,i,ai){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i] || !d.ex[i].alts) return;
  d.ex[i].alts.splice(ai,1);
  save(); render();
}
function dupTpl(id){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  const copy = { id:uid(), name:(d.name+' '+t('tplDupSuffix')).slice(0,60), folderId:d.folderId,
    ex: d.ex.map(e=>({ id:uid(), k:e.k, s:e.s, r:e.r, ss:!!e.ss, alts:(e.alts||[]).slice(), pnote:e.pnote||'', ...(e.rt?{rt:e.rt}:{}) })) };
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
  d.ex[i][f] = Math.max(1, Math.min(f==='s'?12:50, (parseInt(d.ex[i][f],10)||0)+delta));
  save(); render();
}
/* per-exercise rest target: "—" (plain count-up) or 15 s .. 30 min in 15 s steps;
   the last picked value is remembered as the starting point for other exercises */
function stepTplRest(id,i,dir){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  const e = d.ex[i];
  if(!e.rt){
    if(dir>0) e.rt = S.restTarget || 120;
  }else{
    const v = e.rt + dir*15;
    if(v < 15) delete e.rt;
    else e.rt = Math.min(1800, v);
  }
  if(e.rt) S.restTarget = e.rt;
  save(); render();
}
/* typed rest: "1:30" = m:ss, "1.5" = minutes, plain numbers below 15 mean minutes
   ("3" -> 3:00), 15 and up mean seconds ("90" -> 1:30); snapped to 15 s */
function parseRestInput(v){
  v = String(v).trim().replace(',','.');
  if(!v) return 0;
  let sec;
  const m = v.match(/^(\d+):(\d{1,2})$/);
  if(m) sec = (+m[1])*60 + (+m[2]);
  else{
    const n = parseFloat(v);
    if(isNaN(n) || n<=0) return NaN;
    sec = (n<15 || v.includes('.')) ? n*60 : n;
  }
  return Math.max(15, Math.min(1800, Math.round(sec/15)*15));
}
function typeTplRest(id,i,v){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  const sec = parseRestInput(v);
  if(sec===0) delete d.ex[i].rt;               /* cleared the field -> no target */
  else if(!isNaN(sec)){ d.ex[i].rt = sec; S.restTarget = sec; }
  save(); render();                            /* invalid input just re-renders the old value */
}
/* reps target may be a single number or a range (e.g. "10-12") */
function repsParse(r){
  const m = String(r).match(/^(\d+)-(\d+)$/);
  if(m) return { range:true, lo:+m[1], hi:+m[2] };
  const n = parseInt(r,10)||10;
  return { range:false, lo:n, hi:n };
}
/* target constraints differ by exercise type: reps 1..50 step 1, time 5..600s step 5 */
function repsCfg(k){ return isTimeEx(k) ? {step:5,min:5,max:600,add:15,def:30} : {step:1,min:1,max:50,add:2,def:10}; }
function stepReps(id,i,which,dir){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  const c = repsCfg(d.ex[i].k);
  const cl = n => Math.max(c.min, Math.min(c.max, n));
  const delta = dir*c.step;
  const p = repsParse(d.ex[i].r);
  if(!p.range){
    d.ex[i].r = String(cl(p.lo+delta));
  } else if(which==='hi'){
    const hi = cl(p.hi+delta);
    d.ex[i].r = Math.min(p.lo,hi)+'-'+hi;
  } else {
    const lo = cl(p.lo+delta);
    d.ex[i].r = lo+'-'+Math.max(p.hi,lo);
  }
  save(); render();
}
/* toggle a target between a single value and a "from–to" range */
function toggleRepsRange(id,i){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  const c = repsCfg(d.ex[i].k);
  const p = repsParse(d.ex[i].r);
  d.ex[i].r = p.range ? String(p.lo) : p.lo+'-'+Math.min(c.max,p.lo+c.add);
  save(); render();
}
function addTplEx(id){
  openPicker(info=>{
    const d = S.templates.find(x=>x.id===id);
    if(!d) return;
    d.ex.push({ id:uid(), k:info.id, s:3, r:repsCfg(info.id).def });
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
      <div class="segmented" id="cx-mode">
        <button type="button" class="seg on" data-v="r" onclick="pickSeg(this)">${t('modeReps')}</button>
        <button type="button" class="seg" data-v="t" onclick="pickSeg(this)">${t('modeTime')}</button>
      </div>
    </div>
    <button class="btn primary" onclick="saveCustomEx()">${t('exCreateSave')}</button>`);
  setTimeout(()=>{ const i=$('#cx-name'); if(i) i.focus(); }, 50);
}
function pickSeg(btn){
  const seg = btn.parentElement;
  seg.querySelectorAll('.seg').forEach(b=>b.classList.toggle('on', b===btn));
}
function saveCustomEx(){
  const name = ($('#cx-name').value||'').trim();
  const g = $('#cx-group').value;
  if(!name){ toast(t('exNameReq')); return; }
  const info = { id:'custom-'+uid(), n:name, g, e:'other' };
  const modeSel = $('#cx-mode .seg.on');
  if(modeSel && modeSel.dataset.v==='t') info.m = 't';
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
  const bwKind = isBwEx(k);
  let best = 0, bestBw = null, bestAdd = null, bestTime = 0, e1rm = 0, bestVol = 0, bestSet = null, sessions = 0, lastDate = null;
  for(const h of S.history){
    if(h.arch || h.dl || (tplName && h.name!==tplName)) continue;
    for(const e of h.exercises){
      if(e.k===k || (nm && e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm && !s.drop);
        if(work.length){
          sessions++;
          if(!lastDate) lastDate = h.date;
          const add = bwKind ? (e.bw||0) : 0; /* records use TOTAL load = body weight + added */
          for(const s of work){
            const ew = s.weight + add;
            if(ew > best){ best = ew; if(bwKind && e.bw!=null){ bestBw = e.bw; bestAdd = s.weight; } }
            bestTime = Math.max(bestTime, s.reps);
            const est = ew * (1 + s.reps/30); /* Epley */
            if(est > e1rm) e1rm = est;
            const v = ew * s.reps;
            if(v > bestVol){ bestVol = v; bestSet = { weight:ew, reps:s.reps, bw:(bwKind && e.bw!=null)?e.bw:null, add:s.weight }; }
          }
        }
      }
    }
  }
  return { best, bestBw, bestAdd, bestTime, e1rm, bestSet, sessions, lastDate };
}
/* "80 + 28" / "80 − 20" breakdown (kg stored -> display unit) for bodyweight records */
function bwSplit(bw, add){
  return wu(bw) + (add>=0 ? ' + ' + wu(add) : ' − ' + wu(Math.abs(add)));
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
      ${st.best?`<div class="best">${wu(st.best,true)}</div>`:''}</button>`;
  }).join('') + `<button class="btn ghostbtn" style="margin-top:4px" onclick="openCustomExForm()">${t('exCreate')}</button>`;
}
function openExDetailByKey(k){
  V.exDetail = k;
  V.exTplFilter = '';
  V.exMetric = 'w';
  const i = exInfo(k);
  V.exDetailName = i ? i.n : k;
  /* back returns to wherever the detail was opened from (workout / history / browser) */
  V.exDetailFrom = (V.screen==='workout' && S.active) ? 'workout'
                 : V.screen==='history' ? 'history' : 'exercises';
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
  /* bodyweight moves: the record is total load — show the "bw + added" split under it */
  const bestSplit = (!tm && st.best && st.bestBw!=null) ? ` (${bwSplit(st.bestBw, st.bestAdd)})` : '';
  h += `<div class="statrow">
    <div class="stat"><div class="v">${tm ? (st.bestTime?st.bestTime+' s':'—') : (st.best?wu(st.best,true):'—')}</div><div class="l">${tm?t('recTime'):t('exBest')}${bestSplit}</div></div>
    <div class="stat"><div class="v">${st.sessions}</div><div class="l">${t('exSessions')}</div></div>
    <div class="stat"><div class="v" style="font-size:16px;padding-top:6px">${st.lastDate?daysAgoStr(st.lastDate):'—'}</div><div class="l">${t('exLastDone')}</div></div>
  </div>`;
  if(!st.sessions) return h + `<div class="empty">${t('exNoHistory')}</div>`;
  if(!tm && st.bestSet){
    h += `<div class="card">
      <div style="font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--dim);margin-bottom:8px">${t('recTitle')}</div>
      <div style="display:flex;gap:8px;padding:4px 0;align-items:baseline;font-size:14px">
        <span style="color:var(--dim);flex:1">${t('rec1RM')}</span>
        <span style="font-weight:800;font-size:16px">${wu(Math.round(st.e1rm*10)/10,true)}</span></div>
      <div style="display:flex;gap:8px;padding:4px 0;align-items:baseline;font-size:14px">
        <span style="color:var(--dim);flex:1">${t('recBestSet')}${st.bestSet.bw!=null?` <span style="font-weight:500">(${bwSplit(st.bestSet.bw, st.bestSet.add)})</span>`:''}</span>
        <span style="font-weight:800;font-size:16px">${wu(st.bestSet.weight,true)} × ${st.bestSet.reps}</span></div>
    </div>`;
  }
  if(!tm){
    h += `<div class="chips" style="padding-bottom:6px">` +
      [['w',t('metricW')],['vol',t('metricVol')],['1rm',t('metric1RM')]].map(([m,lb])=>
        `<button class="chip ${(V.exMetric||'w')===m?'on':''}" onclick="V.exMetric='${m}'; render()">${lb}</button>`).join('') +
      `</div>`;
  }
  h += `<div id="chartbox" class="card">${chartSVG(k, name, filter, V.exMetric)}</div>`;
  /* session log */
  const rows = [];
  for(const w of S.history){
    if(w.arch || (filter && w.name!==filter)) continue;
    for(const e of w.exercises){
      if(matches(e)){
        rows.push(`<div class="exl"><span class="n">${fmtDate(w.date)}${w.dl?` <span class="dlchip">${t('dlBadge')}</span>`:''} <span style="opacity:.6">· ${esc(w.name)}</span></span>
          <span class="s">${e.sets.map(s=>`<span class="tok">${fmtSet(s, k)}</span>`).join(' ')}</span></div>`);
      }
    }
  }
  h += `<div class="card"><div class="histdetail" style="border:none;margin:0;padding:0">${rows.join('')}</div></div>`;
  return h;
}
function chartSVG(k, name, tplName, metric){
  const nm = (name||'').trim().toLowerCase();
  const tm = isTimeEx(k), bwKind = isBwEx(k);
  const pts = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    if(w.arch || w.dl || (tplName && w.name!==tplName)) continue;
    for(const e of w.exercises){
      if(e.k===k || (e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm && !s.drop);
        if(!work.length) continue;
        const add = bwKind ? (e.bw||0) : 0; /* volume/1RM use TOTAL load for bodyweight moves */
        let v;
        if(tm) v = Math.max(...work.map(s=>s.reps));
        else if(metric==='vol') v = Math.round(kg2u(work.reduce((a,s)=>a+(s.weight+add)*s.reps,0)));
        else if(metric==='1rm') v = Math.round(kg2u(Math.max(...work.map(s=>(s.weight+add)*(1+s.reps/30))))*10)/10;
        /* weight metric on bodyweight moves plots ADDED load only (comparable across
           body-weight changes); the body weight itself shows on point tap */
        else v = Math.round(kg2u(Math.max(...work.map(s=>bwKind ? s.weight : s.weight+add)))*100)/100;
        pts.push({ d:w.date, w:v, bw:(bwKind && e.bw!=null) ? e.bw : undefined });
      }
    }
  }
  const label = tm ? t('woSec')
    : metric==='vol' ? t('metricVol')+' ('+unitL()+')'
    : metric==='1rm' ? t('metric1RM')+' ('+unitL()+')'
    : bwKind ? t('woAddCol')+' ('+unitL()+')'
    : t('chartTop',{u:unitL()});
  return lineChartSVG(pts, label, tm?'s':unitL());
}
/* tap on a chart point -> exact value with date (+ body weight at the time, if known) */
function chartTap(i){
  const d = window.__chartData && window.__chartData[i];
  if(!d) return;
  toast(fmtDate(d.d)+' · '+fmtW(d.w)+' '+(window.__chartUnit||'')
        + (d.bw!=null ? ' · '+t('woBwCol')+' '+wu(d.bw,true) : ''));
}
/* generic line chart: pts = [{d:dateIso, w:number}] chronological */
function lineChartSVG(pts, label, unit){
  if(!pts.length) return `<div class="empty">${t('chartNoData')}</div>`;
  const data = pts.slice(-24);
  window.__chartData = data; window.__chartUnit = unit||'';
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
    `<circle cx="${X(i)}" cy="${Y(p.w)}" r="13" fill="transparent" style="cursor:pointer" onclick="chartTap(${i})"/>` +
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

/* ======================= STATS DASHBOARD ======================= */
function barChartSVG(data){ /* data = [{l:label, v:number}] */
  if(!data.some(d=>d.v)) return `<div class="empty" style="padding:14px">${t('chartNoData')}</div>`;
  const W=360, H=150, padL=6, padR=6, padT=20, padB=20;
  const max = Math.max(1, ...data.map(d=>d.v));
  const bw = (W-padL-padR)/data.length;
  const showVals = data.length<=16; /* value labels overlap once bars get thin */
  let out = '';
  data.forEach((d,i)=>{
    const bh = (H-padT-padB)*(d.v/max);
    const x = padL+i*bw, y = H-padB-bh;
    out += `<rect x="${x+bw*0.16}" y="${d.v?y:H-padB-2}" width="${bw*0.68}" height="${Math.max(bh,2)}" rx="${Math.min(4,bw*0.3)}" fill="${d.v?'var(--accent)':'var(--input)'}"/>`;
    if(d.v && showVals) out += `<text x="${x+bw/2}" y="${y-5}" fill="var(--dim)" font-size="10" font-weight="700" text-anchor="middle">${d.v>=10000?Math.round(d.v/1000)+'k':d.v}</text>`;
    if(d.l) out += `<text x="${x+bw/2}" y="${H-6}" fill="var(--ghost)" font-size="9" text-anchor="middle">${d.l}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
}
/* ---- per-chart period controls ---- */
/* compact chips on a card header; opts = [[value,label],...]; withCustom adds ⋯ (from–to) */
function pchipsHtml(cid, opts, withCustom){
  const c = V.cp[cid];
  let h = `<div class="pchips">` + opts.map(([v,lb])=>
    `<button type="button" class="${c.p===v?'on':''}" onclick="setPd('${cid}','${v}')">${lb}</button>`).join('');
  if(withCustom) h += `<button type="button" class="${c.p==='c'?'on':''}" onclick="setPd('${cid}','c')">⋯</button>`;
  return h + `</div>`;
}
function setPd(cid, p){
  const c = V.cp[cid];
  c.p = p;
  if(p==='c' && !c.f){ /* sensible starting range: last 30 days */
    const d = new Date();
    c.t = d.toISOString().slice(0,10);
    d.setDate(d.getDate()-29);
    c.f = d.toISOString().slice(0,10);
  }
  render();
}
function setPdD(cid, which, val){
  if(val) V.cp[cid][which] = val;
  render();
}
function rangeBarHtml(cid){
  const c = V.cp[cid];
  if(c.p!=='c') return '';
  return `<div class="rangebar">
    <label>${t('pdFrom')}<input type="date" value="${c.f}" max="${c.t||''}" onchange="setPdD('${cid}','f',this.value)"></label>
    <label>${t('pdTo')}<input type="date" value="${c.t}" min="${c.f||''}" onchange="setPdD('${cid}','t',this.value)"></label>
  </div>`;
}
/* custom from–to as [startDate, endDateExclusive]; null if incomplete/reversed */
function customRange(c){
  if(!c.f || !c.t) return null;
  const s = new Date(c.f+'T00:00:00'), e = new Date(c.t+'T00:00:00');
  e.setDate(e.getDate()+1);
  return e>s ? [s,e] : null;
}
/* time buckets for a chart's period setting; bucket size auto-adapts on custom ranges */
function bucketsFor(c){
  const loc = S.lang==='lt'?'lt-LT':'en-GB';
  const buckets = [];
  if(c.p==='c'){
    const r = customRange(c);
    if(!r) return buckets;
    const [s0,e0] = r;
    const days = Math.round((e0-s0)/864e5);
    if(days<=32){ /* daily bars */
      const d = new Date(s0);
      while(d<e0){
        const nx = new Date(d); nx.setDate(nx.getDate()+1);
        buckets.push({ s:d.getTime(), e:nx.getTime(), l:String(d.getDate()) });
        d.setDate(d.getDate()+1);
      }
    }else if(days<=200){ /* weekly */
      const d = new Date(s0);
      while(d<e0){
        const nx = new Date(d); nx.setDate(nx.getDate()+7);
        buckets.push({ s:d.getTime(), e:Math.min(nx.getTime(),e0.getTime()),
                       l:d.getDate()+'.'+String(d.getMonth()+1).padStart(2,'0') });
        d.setDate(d.getDate()+7);
      }
    }else{ /* calendar months */
      let y = s0.getFullYear(), m = s0.getMonth();
      while(buckets.length<240){
        const bs = new Date(y,m,1), be = new Date(y,m+1,1);
        if(bs>=e0) break;
        buckets.push({ s:Math.max(bs.getTime(),s0.getTime()), e:Math.min(be.getTime(),e0.getTime()),
                       l:bs.toLocaleDateString(loc,{month:'short'}) });
        m++; if(m>11){ m=0; y++; }
      }
    }
    /* thin out labels so they stay readable with many bars */
    if(buckets.length>14){
      const step = Math.ceil(buckets.length/7);
      buckets.forEach((b,i)=>{ if(i%step) b.l=''; });
    }
    return buckets;
  }
  const now = new Date();
  const n = c.p==='y'?6:12;
  for(let i=n-1; i>=0; i--){
    let s, e, l;
    if(c.p==='w'){
      const day=(now.getDay()+6)%7;
      s=new Date(now); s.setHours(0,0,0,0); s.setDate(now.getDate()-day-7*i);
      e=new Date(s); e.setDate(s.getDate()+7);
      l=s.getDate()+'.'+String(s.getMonth()+1).padStart(2,'0');
    }else if(c.p==='m'){
      s=new Date(now.getFullYear(), now.getMonth()-i, 1);
      e=new Date(now.getFullYear(), now.getMonth()-i+1, 1);
      l=s.toLocaleDateString(loc,{month:'short'});
    }else{
      s=new Date(now.getFullYear()-i, 0, 1);
      e=new Date(now.getFullYear()-i+1, 0, 1);
      l=String(s.getFullYear());
    }
    buckets.push({ s:s.getTime(), e:e.getTime(), l });
  }
  return buckets;
}
/* one pass over history: workout count + volume per bucket */
function aggBuckets(buckets){
  const wk = buckets.map(b=>({l:b.l, v:0})), vol = buckets.map(b=>({l:b.l, v:0}));
  for(const h of S.history){
    if(h.arch) continue;
    const d = new Date(h.date).getTime();
    for(let bi=0; bi<buckets.length; bi++){
      if(d>=buckets[bi].s && d<buckets[bi].e){
        wk[bi].v++;
        vol[bi].v += h.exercises.reduce((a,ex)=>a+ex.sets.filter(x=>!x.warm).reduce((b,x)=>b+x.weight*x.reps,0),0);
        break;
      }
    }
  }
  vol.forEach(o=>o.v=Math.round(kg2u(o.v)));
  return { wk, vol };
}
function muscleBalanceHtml(){
  const c = V.cp.mus;
  let from, to = Infinity;
  if(c.p==='c'){
    const r = customRange(c);
    if(!r) return `<div class="empty" style="padding:14px">${t('chartNoData')}</div>`;
    from = r[0].getTime(); to = r[1].getTime();
  }else from = Date.now() - (+c.p||7)*864e5;
  const counts = {};
  for(const h of S.history){
    if(h.arch) continue;
    const ts = new Date(h.date).getTime();
    if(ts<from || ts>=to) continue;
    for(const e of h.exercises){
      const info = exInfo(e.k);
      const g = info ? info.g : 'other';
      counts[g] = (counts[g]||0) + e.sets.filter(s=>!s.warm).length;
    }
  }
  const rows = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  if(!rows.length) return `<div class="empty" style="padding:14px">${t('chartNoData')}</div>`;
  const max = rows[0][1];
  return rows.map(([g,n])=>`<div class="mb-row">
    <span class="mb-name">${t('g_'+g)}</span>
    <span class="mb-bar"><i style="width:${Math.round(100*n/max)}%"></i></span>
    <span class="mb-val">${n}</span>
  </div>`).join('');
}

/* ---- summary strip: rolling 7-day windows (the user does not train by calendar weeks) ---- */
function histSummaryHtml(){
  const now = Date.now(), D = 864e5;
  let c7=0, v7=0, cP=0, vP=0;
  const days = new Set();
  for(const h of S.history){
    if(h.arch) continue;
    const ts = new Date(h.date).getTime();
    if(ts>=now-7*D){
      c7++;
      v7 += h.exercises.reduce((a,ex)=>a+ex.sets.filter(x=>!x.warm).reduce((b,x)=>b+x.weight*x.reps,0),0);
    }else if(ts>=now-14*D){
      cP++;
      vP += h.exercises.reduce((a,ex)=>a+ex.sets.filter(x=>!x.warm).reduce((b,x)=>b+x.weight*x.reps,0),0);
    }
    const d = new Date(h.date); d.setHours(0,0,0,0);
    days.add(d.getTime());
  }
  /* rhythm: average gap between the most recent training days */
  const dl = [...days].sort((a,b)=>b-a).slice(0,7);
  let gap = null;
  if(dl.length>=2){
    let sum = 0;
    for(let i=0;i<dl.length-1;i++) sum += (dl[i]-dl[i+1])/D;
    gap = Math.round(sum/(dl.length-1)*10)/10;
  }
  const fmtV = v => { v = Math.round(kg2u(v)); return v>=10000 ? Math.round(v/100)/10+'k' : String(v); };
  const dltN = (a,b) => a===b ? '' :
    `<span class="dlt ${a>b?'up':'down'}">${a>b?'▲':'▼'}${Math.abs(a-b)}</span>`;
  const dltA = (a,b) => a===b ? '' :
    `<span class="dlt ${a>b?'up':'down'}">${a>b?'▲':'▼'}</span>`;
  return `<div class="statrow">
    <div class="stat"><div class="v">${c7}${dltN(c7,cP)}</div><div class="l">${t('hs7w')}</div></div>
    <div class="stat"><div class="v">${fmtV(v7)}${dltA(v7,vP)}</div><div class="l">${t('hs7v')} (${unitL()})</div></div>
    <div class="stat"><div class="v">${gap!=null?fmtW(gap)+' d.':'—'}</div><div class="l">${t('hsGap')}</div></div>
  </div>`;
}

/* ---- rhythm strip: the last 14/30/90 days (replaces the month calendar) ---- */
function rhythmHtml(){
  const n = +V.cp.rh.p || 14;
  const today = new Date(); today.setHours(0,0,0,0);
  const map = {};
  for(const h of S.history){
    if(h.arch) continue;
    const d = new Date(h.date); d.setHours(0,0,0,0);
    const ts = d.getTime();
    if(!map[ts]) map[ts] = { id:h.id, ltr:(h.name||'').trim().charAt(0).toUpperCase()||'✓', n:1, dl:!!h.dl };
    else map[ts].n++;
  }
  let cells = '';
  for(let i=n-1; i>=0; i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    const w = map[d.getTime()];
    const td = i===0 ? ' today' : '';
    cells += w
      ? `<button class="rc on${w.dl?' dl':''}${td}" onclick="rhythmTap('${w.id}')">${esc(w.ltr)}${w.n>1?'⁺':''}</button>`
      : `<span class="rc${td}"></span>`;
  }
  /* 14 d = one row; longer ranges wrap into 15-day rows (no weekday grid on purpose —
     the user's rhythm is self-regulated, not weekly) */
  return `<div class="chead" style="margin-bottom:8px"><span class="ct">${t('rhythmTitle')}</span>
      ${pchipsHtml('rh',[['14','14 d.'],['30','30 d.'],['90','90 d.']],false)}</div>
    <div class="rhythm${n>14?' multi':''}">${cells}</div>`;
}
function rhythmTap(id){
  const idx = S.history.filter(w=>!w.arch).findIndex(w=>w.id===id);
  if(idx>=(V.histLimit||20)) V.histLimit = idx+5; /* make sure it is on the page */
  V.expanded = id;
  render();
  setTimeout(()=>{
    const el = document.getElementById('hw-'+id);
    if(el) el.scrollIntoView({ block:'center' });
  }, 60);
}

/* ---- tracked lifts: user-picked exercises with sparkline + Δ vs ~30 d ago ---- */
/* chronological top-set per session (added load for bodyweight moves, seconds for time moves) */
function trackSeries(k){
  const info = exInfo(k);
  const nm = (info?info.n:k).trim().toLowerCase();
  const tm = isTimeEx(k);
  const pts = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    if(w.arch || w.dl) continue;
    for(const e of w.exercises){
      if(e.k===k || (e.name && e.name.trim().toLowerCase()===nm)){
        const work = e.sets.filter(s=>!s.warm && !s.drop);
        if(!work.length) continue;
        pts.push({ ts:new Date(w.date).getTime(), v:Math.max(...work.map(s=>tm?s.reps:s.weight)) });
      }
    }
  }
  return pts;
}
function sparkSVG(vals){
  if(vals.length<2) return '';
  const W=120, H=36, p=4;
  let min = Math.min(...vals), max = Math.max(...vals);
  if(min===max){ min-=1; max+=1; }
  const X = i => p + i*(W-2*p)/(vals.length-1);
  const Y = v => p + (max-v)*(H-2*p)/(max-min);
  const line = vals.map((v,i)=>`${Math.round(X(i)*10)/10},${Math.round(Y(v)*10)/10}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(vals.length-1)}" cy="${Y(vals[vals.length-1])}" r="3" fill="var(--accent)"/></svg>`;
}
function trackedHtml(){
  let h = `<h2 class="sec">${t('trackedTitle')}</h2>`;
  if(!S.trackedLifts.length)
    h += `<div class="empty" style="padding:16px 20px 6px">${t('trackedEmpty')}</div>`;
  h += S.trackedLifts.map(k=>{
    const info = exInfo(k);
    const name = info ? info.n : k;
    const tm = isTimeEx(k), bwKind = isBwEx(k);
    const pts = trackSeries(k);
    const last = pts.length ? pts[pts.length-1] : null;
    /* Δ vs the session closest to 30 days back (falls back to the first ever) */
    let delta = null;
    if(pts.length>=2){
      const cut = Date.now() - 30*864e5;
      let ref = pts[0];
      for(const p of pts){ if(p.ts<=cut) ref = p; else break; }
      if(ref!==last) delta = last.v - ref.v;
    }
    const fmtVal = v => tm ? v+' s' : bwKind ? (v ? (v>0?'+':'')+wu(v,true) : 'BW') : wu(v,true);
    const dHtml = (delta==null || delta===0) ? '' :
      `<span class="tkdelta ${delta>0?'up':'down'}">${delta>0?'▲':'▼'} ${tm?Math.abs(delta)+' s':wu(Math.abs(delta),true)} · ${t('trackDelta30')}</span>`;
    return `<div class="card trackcard" onclick="openExDetailByKey('${k}')">
      <div class="tkhead"><span class="tkname">${esc(name)}</span>
        <button class="iconbtn2" onclick="event.stopPropagation();trackRemove('${k}')" aria-label="stop tracking">${ACT_ICONS.x}</button></div>
      <div class="tkrow">
        <div class="tkleft"><div class="tkval">${last?fmtVal(last.v):'—'}</div>${dHtml}</div>
        ${sparkSVG(pts.slice(-16).map(p=>p.v))}
      </div>
    </div>`;
  }).join('');
  h += `<button class="btn ghostbtn" onclick="trackAdd()">${t('trackAdd')}</button>`;
  return h;
}
function trackAdd(){
  openPicker(info=>{
    if(S.trackedLifts.includes(info.id)){ toast(t('trackedDup')); return; }
    S.trackedLifts.push(info.id);
    save(); closeModal(); render();
  });
}
function trackRemove(k){
  S.trackedLifts = S.trackedLifts.filter(x=>x!==k);
  save(); render();
}

/* ---- PR feed: rep-specific records ("the record at those reps") ---- */
/* one pass oldest→newest; a PR = set beating the best earlier weight at that exact rep
   count. The exercise's first-ever session only sets the baseline (no PR flood). */
function prEvents(){
  const best = {}, seen = {};
  const events = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    if(w.arch || w.dl) continue;
    for(const e of w.exercises){
      if(!e.k || isTimeEx(e.k)) continue; /* seconds are not reps */
      const work = e.sets.filter(s=>!s.warm && !s.drop && s.reps>0);
      if(!work.length) continue;
      const m = best[e.k] || (best[e.k]={});
      const had = seen[e.k]; seen[e.k] = 1;
      const bwKind = isBwEx(e.k);
      const add = bwKind ? (e.bw||0) : 0; /* records use TOTAL load */
      const top = {};
      for(const s of work){
        const tot = s.weight + add;
        if(!(s.reps in top) || tot>top[s.reps].tot)
          top[s.reps] = { tot, bw:(bwKind && e.bw!=null)?e.bw:null, add:s.weight };
      }
      for(const r in top){
        if(had && (!(r in m) || top[r].tot>m[r]))
          events.push({ k:e.k, name:e.name, w:top[r].tot, bw:top[r].bw, add:top[r].add, r:+r, d:w.date });
        if(!(r in m) || top[r].tot>m[r]) m[r] = top[r].tot;
      }
    }
  }
  return events.slice(-8).reverse();
}
function prFeedHtml(){
  const evs = prEvents();
  let h = `<h2 class="sec">${t('prTitle')}</h2>`;
  if(!evs.length) return h + `<div class="empty" style="padding:16px 20px">${t('prEmpty')}</div>`;
  return h + `<div class="card" style="padding:5px 16px">` + evs.map(ev=>
    `<div class="prrow" onclick="openExDetailByKey('${ev.k}')">
      <span class="prbadge">${ev.r}RM</span>
      <div class="pri"><div class="prn">${esc(exName(ev.k, ev.name))}</div>
        <div class="prd">${ev.bw!=null?`(${bwSplit(ev.bw, ev.add)}) · `:''}${daysAgoStr(ev.d)}</div></div>
      <span class="prv">${wu(ev.w,true)} × ${ev.r}</span>
    </div>`).join('') + `</div>`;
}

/* ======================= HISTORY ======================= */
function htmlHistory(){
  let h = '<div style="height:8px"></div>';
  /* 1. rolling summary strip (slot reserved above for a future deload suggestion card) */
  h += histSummaryHtml();
  /* 2. rhythm strip — the self-regulated U/L/rest pattern at a glance */
  h += `<div class="card" style="margin-top:10px">${rhythmHtml()}</div>`;
  /* 3. tracked lifts */
  h += trackedHtml();
  /* 4. PR feed */
  h += prFeedHtml();
  /* 5. trend charts, each with its own compact period control */
  const wk = aggBuckets(bucketsFor(V.cp.wk)).wk;
  const vol = aggBuckets(bucketsFor(V.cp.vol)).vol;
  const pd3 = [['w',t('pdcW')],['m',t('pdcM')],['y',t('pdcY')]];
  h += `<div class="card" style="margin-top:24px">
      <div class="chead"><span class="ct">${t('statsWorkoutsPer')}</span>${pchipsHtml('wk',pd3,true)}</div>
      ${rangeBarHtml('wk')}${barChartSVG(wk)}
    </div>
    <div class="card">
      <div class="chead"><span class="ct">${t('statsVolumePer')} (${unitL()})</span>${pchipsHtml('vol',pd3,true)}</div>
      ${rangeBarHtml('vol')}${barChartSVG(vol)}
    </div>
    <div class="card">
      <div class="chead"><span class="ct">${t('statsMuscle')}</span>${pchipsHtml('mus',[['7','7 d.'],['30','30 d.']],true)}</div>
      ${rangeBarHtml('mus')}${muscleBalanceHtml()}
    </div>`;
  /* 6. body weight — graph + recent entries; logging via the quick modal */
  const cbw = V.cp.bw;
  let ws = S.weights;
  if(cbw.p!=='all'){
    const cut = Date.now() - (+cbw.p)*864e5;
    ws = ws.filter(x=>new Date(x.date).getTime()>=cut);
  }
  /* chart caps at 24 points — downsample evenly so long ranges keep their shape */
  let bwPts = ws.slice().reverse().map(x=>({d:x.date,w:kg2u(x.kg)}));
  if(bwPts.length>24){
    const out = [];
    for(let i=0;i<24;i++) out.push(bwPts[Math.round(i*(bwPts.length-1)/23)]);
    bwPts = out;
  }
  h += `<div class="card">
      <div class="chead"><span class="ct">${t('bw')}</span>${pchipsHtml('bw',[['30','30 d.'],['90','90 d.'],['all',t('pdAll')]],false)}</div>
      ${bwPts.length?`<div>${lineChartSVG(bwPts, unitL(), unitL())}</div>`
        : `<div class="empty" style="padding:6px 0 12px">${t('chartNoData')}</div>`}
      <button class="btn ghostbtn" style="margin-top:10px" onclick="openBwModal()">${t('bwLogNew')}</button>
      ${S.weights.slice(0,5).map(x=>`<div style="display:flex;gap:8px;padding:6px 0;align-items:center;font-size:14px">
        <span style="color:var(--dim);flex:1">${fmtDate(x.date)}</span>
        <span style="font-weight:700">${wu(x.kg,true)}</span>
        <button class="dropbtn del" style="min-height:28px" onclick="delWeight('${x.id}')">✕</button></div>`).join('')}
    </div>
    <h2 class="sec">${t('tabHistory')}</h2>`;
  if(!S.history.length) return h + `<div class="empty">${t('histEmpty')}</div>`;
  const act = S.history.filter(w=>!w.arch);
  const arch = S.history.filter(w=>w.arch);
  const lim = V.histLimit||20;
  h += act.slice(0,lim).map(histRowHtml).join('') || `<div class="empty">—</div>`;
  if(act.length>lim){
    h += `<button class="btn ghostbtn" onclick="V.histLimit=(V.histLimit||20)+30; render()">${t('histMore')} (${act.length-lim})</button>`;
  }
  if(arch.length){
    h += `<h2 class="sec" style="cursor:pointer" onclick="V.showArch=!V.showArch; render()">
            ${V.showArch?'▾':'▸'} ${t('archTitle')} (${arch.length})</h2>`;
    if(V.showArch) h += arch.slice(0,lim).map(histRowHtml).join('');
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
       <span class="s">${e.sets.map(s=>`<span class="tok">${fmtSet(s, e.k)}</span>`).join(' ')}</span></div>`).join('') +
      `<div style="display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap">
        <span style="color:var(--ghost);font-size:13px">${t('histVolume')}: ${Math.round(kg2u(vol))} ${unitL()}${w.dur?' · '+fmtTime(w.dur):''}</span>
        <div class="rowacts" style="margin-left:auto">
          <button class="iconbtn2" onclick="event.stopPropagation();toggleArch('${w.id}')" aria-label="${w.arch?t('histUnarch'):t('histArch')}">${w.arch?ACT_ICONS.restore:ACT_ICONS.archive}</button>
          <button class="iconbtn2" onclick="event.stopPropagation();openHistEdit('${w.id}')" aria-label="edit">${ACT_ICONS.edit}</button>
          <button class="iconbtn2 danger" onclick="event.stopPropagation();delHist('${w.id}')" aria-label="delete">${ACT_ICONS.x}</button>
        </div>
      </div></div>`;
  }
  return `<div class="card histrow" id="hw-${w.id}" style="${w.arch?'opacity:.65':''}" onclick="V.expanded=V.expanded==='${w.id}'?null:'${w.id}'; render()">
    <div class="hd">
      <span class="dt">${fmtDate(w.date)}</span>
      <span class="dn">${esc(w.name)}</span>
      ${w.dl?`<span class="dlchip">${t('dlBadge')}</span>`:''}
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
      if(!s.warm && !s.drop) workNum++;
      const label = s.warm ? 'W' : s.drop ? 'D' : s.fail ? 'F' : String(workNum);
      return `<div class="setgrid" style="grid-template-columns:30px 1fr 70px 56px 34px">
        <div class="setnum ${s.warm?'warm':s.drop?'dropn':s.fail?'failn':''}" style="display:flex;align-items:center;justify-content:center;min-height:40px">${label}</div>
        <div></div>
        <input type="text" inputmode="decimal" value="${fmtW(kg2u(s.weight))}"
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
  if(!isNaN(n) && (f==='reps' ? n>=0 : true)){
    w.exercises[ei].sets[si][f] = f==='reps' ? Math.round(n) : u2kg(n);
    save();
  }
}
function delHistSet(id,ei,si){
  const w = S.history.find(x=>x.id===id);
  if(!w || !w.exercises[ei]) return;
  w.exercises[ei].sets.splice(si,1);
  if(!w.exercises[ei].sets.length) w.exercises.splice(ei,1);
  if(!w.exercises.length){
    /* last set of the last exercise deleted — the workout itself is gone */
    S.history = S.history.filter(x=>x.id!==id);
    V.expanded = null;
    save(); closeModal(); render();
    return;
  }
  save();
  const b = $('#he-body');
  if(b) b.innerHTML = histEditBody(id);
}

/* ---- body weight ---- */
function logWeight(n){
  if(isNaN(n) || n<=0 || n>(S.unit==='lb'?900:400)){ toast(t('bwEnter')); return false; }
  S.weights.unshift({ id:uid(), date:new Date().toISOString(), kg:Math.round(u2kg(n)*10)/10 });
  return true;
}
/* quick body-weight logging modal (opened from the home stat card or History):
   prefilled with the last logged weight, adjustable ±0.1 with the ▾/▴ buttons */
function openBwModal(){
  const last = S.weights.length ? kg2u(S.weights[0].kg) : null;
  openModal(`<h3>${t('bwEnter')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="bwmodal">
      <button class="bwmstep" onclick="stepBwModal(-0.1)" aria-label="-0.1">▾</button>
      <input id="bwm-input" type="text" inputmode="decimal" class="bwminput"
        value="${last!=null?esc(fmtW(last)):''}" placeholder="${last!=null?esc(fmtW(last)):'—'}">
      <span class="bwmu">${unitL()}</span>
      <button class="bwmstep" onclick="stepBwModal(0.1)" aria-label="+0.1">▴</button>
    </div>
    <button class="btn primary" onclick="saveBwModal()">${ACT_ICONS.check} ${t('bwLog')}</button>`);
  setTimeout(()=>{ const i=$('#bwm-input'); if(i) i.focus(); }, 60);
}
function stepBwModal(d){
  const inp = $('#bwm-input');
  if(!inp) return;
  let cur = parseNum(inp.value);
  if(isNaN(cur)) cur = S.weights.length ? kg2u(S.weights[0].kg) : 0;
  let v = Math.round((cur + d)*10)/10;
  if(v < 0) v = 0;
  inp.value = fmtW(v);
}
function saveBwModal(){
  const inp = $('#bwm-input');
  if(logWeight(parseNum(inp ? inp.value : ''))){ save(); closeModal(); render(); }
}
function delWeight(id){
  if(!confirm(t('bwDel'))) return;
  S.weights = S.weights.filter(x=>x.id!==id);
  save(); render();
}

/* ---- plate calculator (works entirely in the display unit) ---- */
function plateBars(){ return S.unit==='lb' ? [45,35,25] : [20,15,10]; }
function platesUnit(){ return S.unit==='lb' ? 'lb' : 'kg'; }
/* only the plates the user marked as available at their gym, biggest first */
function plateSet(){
  const u = platesUnit();
  const en = (S.plates && Array.isArray(S.plates[u]) && S.plates[u].length) ? S.plates[u] : PLATE_DEF[u];
  return en.slice().sort((a,b)=>b-a);
}
function togglePlate(p){
  const u = platesUnit();
  if(!S.plates) S.plates = { kg:PLATE_DEF.kg.slice(), lb:PLATE_DEF.lb.slice() };
  const arr = S.plates[u];
  const i = arr.indexOf(p);
  if(i>=0) arr.splice(i,1); else arr.push(p);
  save(); renderPlatesAvail(); renderPlates();
}
function renderPlatesAvail(){
  const el = $('#pl-avail');
  if(!el) return;
  const u = platesUnit();
  const en = (S.plates && S.plates[u]) ? S.plates[u] : PLATE_DEF[u];
  el.innerHTML = PLATE_OPTS[u].slice().sort((a,b)=>b-a).map(p=>
    `<button class="platechip ${en.indexOf(p)>=0?'on':''}" onclick="togglePlate(${p})">${fmtW(p)}</button>`).join('');
}
function openPlates(xi){
  let w = NaN;
  if(xi!=null && S.active && S.active.exercises[xi]){
    const ex = S.active.exercises[xi];
    for(let i=0;i<ex.sets.length;i++){
      const s = ex.sets[i];
      if(!s.done){
        w = parseNum(s.w); /* already in display unit */
        if(isNaN(w)){ const g = ghostFor(ex,i); if(g) w = kg2u(g.weight); }
        break;
      }
    }
  }
  const bars = plateBars();
  if(bars.indexOf(V.plateBar) < 0) V.plateBar = bars[0]; /* reset when unit changed */
  openModal(`<h3>${t('plates')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="card">
      <input class="nameinput" id="pl-w" type="text" inputmode="decimal" value="${!isNaN(w)?fmtW(w):''}"
        placeholder="${unitL()}" style="font-size:24px;font-weight:800;text-align:center;min-height:56px"
        oninput="renderPlates()">
      <div class="setline" style="margin-top:10px">
        <span class="lb">${t('platesBar')}</span>
        <div class="seg" id="pl-bars"></div>
      </div>
    </div>
    <div class="card" id="pl-out"></div>
    <div class="card">
      <div style="color:var(--dim);font-size:13px;font-weight:600;margin-bottom:8px">${t('platesAvail')}</div>
      <div class="platechips" id="pl-avail"></div>
    </div>`);
  renderPlatesSeg();
  renderPlatesAvail();
  renderPlates();
}
function renderPlatesSeg(){
  const el = $('#pl-bars');
  if(!el) return;
  el.innerHTML = plateBars().map(b=>
    `<button class="${V.plateBar===b?'on':''}" onclick="V.plateBar=${b};renderPlatesSeg();renderPlates()">${b} ${unitL()}</button>`).join('');
}
function renderPlates(){
  const out = $('#pl-out');
  if(!out) return;
  const w = parseNum($('#pl-w').value);
  if(isNaN(w) || w<=0){ out.innerHTML = `<div class="empty" style="padding:12px">—</div>`; return; }
  const side = (w - V.plateBar)/2;
  if(side <= 0){ out.innerHTML = `<div class="empty" style="padding:12px">${t('platesEmpty')} (${V.plateBar} ${unitL()})</div>`; return; }
  const used = [];
  let rem = side;
  for(const p of plateSet()){ while(rem >= p - 1e-9){ used.push(p); rem -= p; } }
  rem = Math.round(rem*100)/100;
  let html = `<div style="font-size:13px;color:var(--dim);font-weight:600;margin-bottom:8px">${t('platesSide')} — ${fmtW(side)} ${unitL()}:</div>`;
  html += used.length
    ? `<div style="font-size:24px;font-weight:800;color:var(--accent-soft)">${used.map(fmtW).join(' + ')}</div>`
    : `<div style="font-size:16px;font-weight:700">${t('platesEmpty')}</div>`;
  if(rem > 0) html += `<div style="margin-top:8px;font-size:13px;color:var(--orange);font-weight:600">${t('platesRem',{n:fmtW(rem), u:unitL()})}</div>`;
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
        <button class="${S.lang==='en'?'on':''}" onclick="S.lang='en'; save(); render()">EN</button>
        <button class="${S.lang==='lt'?'on':''}" onclick="S.lang='lt'; save(); render()">LT</button>
      </div>
    </div>
    <div class="setline">
      <span class="lb">${t('setUnit')}</span>
      <div class="seg">
        <button class="${(S.unit||'kg')==='kg'?'on':''}" onclick="setUnit('kg')">kg</button>
        <button class="${S.unit==='lb'?'on':''}" onclick="setUnit('lb')">lb</button>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('setAwake')}</span>
      <div class="switch ${S.keepAwake?'on':''}" onclick="S.keepAwake=!S.keepAwake; save(); render()"></div>
    </div>
    <div class="setline">
      <span class="lb">${t('setRestSnd')}</span>
      <div class="switch ${S.restSound?'on':''}" onclick="toggleRestSound()"></div>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:2px">${t('setRestHint')}</div>
  </div>
  <h2 class="sec">${t('setBackup')}</h2>
  <button class="btn" onclick="copyBackup()">${ACT_ICONS.share} ${t('setBackupCopy')}</button>
  <button class="btn" onclick="openImportModal('bak')">${ACT_ICONS.dl} ${t('setBackupLoad')}</button>
  <h2 class="sec">${t('csvTitle')}</h2>
  <button class="btn" onclick="exportCSV('sets')">${ACT_ICONS.copy} ${t('csvSets')}</button>
  <button class="btn" onclick="exportCSV('bw')">${ACT_ICONS.scale} ${t('csvBw')}</button>
  <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:2px 6px 0">${t('csvHint',{u:unitL()})}</div>
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
function toggleRestSound(){
  S.restSound = !S.restSound;
  save(); render();
  if(S.restSound){ unlockAudio(); setTimeout(beep, 150); } /* preview the sound */
}
function setUnit(u){ S.unit=u; save(); render(); }
function snapListHtml(){
  const keys = Object.keys(localStorage).filter(k=>k.startsWith(SNAP_PREFIX)).sort().reverse();
  if(!keys.length) return `<div style="color:var(--dim);font-size:14px;padding:4px 0">${t('protNoSnaps')}</div>`;
  return keys.map(k=>`<div class="setline">
    <span class="lb" style="font-weight:600">${k.slice(SNAP_PREFIX.length)}</span>
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
    ex: d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0, alts:(e.alts||[]), pnote:e.pnote||'', rt:e.rt||0 })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('tplShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('tplShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">${ACT_ICONS.copy} ${t('copy')}</button>`);
}
function copyBackup(){
  const payload = { t:'bak', s:{ lang:S.lang, theme:S.theme, keepAwake:S.keepAwake, plates:S.plates,
    restTarget:S.restTarget, restSound:S.restSound,
    folders:S.folders, customEx:S.customEx, templates:S.templates, history:S.history, weights:S.weights,
    trackedLifts:S.trackedLifts, deloads:S.deloads, mainFolder:S.mainFolder } };
  S.lastBackup = Date.now();
  save();
  copyText(encodeShare(payload));
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
    'set_number','set_type','is_time_exercise','weight_'+u,'reps_or_seconds',
    'bodyweight_'+u,'total_'+u,'volume_'+u,'note']];
  for(let i=S.history.length-1; i>=0; i--){ /* oldest first — chronological for analysis */
    const w = S.history[i];
    w.exercises.forEach((e,ei)=>{
      const info = exInfo(e.k);
      const tm = isTimeEx(e.k), bw = isBwEx(e.k);
      e.sets.forEach((s,si)=>{
        const type = s.warm ? 'warmup' : s.drop ? 'dropset' : s.fail ? 'failure' : 'work';
        const total = bw ? s.weight + (e.bw||0) : s.weight;
        rows.push([w.date, w.name, w.dl?1:0, w.arch?1:0, w.dur||'',
          e.name, e.k||'', info?info.g:'', info?info.e:'', ei+1, e.order||'',
          si+1, type, tm?1:0, kg2u(s.weight), s.reps,
          (bw && e.bw!=null)?kg2u(e.bw):'', kg2u(total),
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
    const alts = Array.isArray(e.alts) ? e.alts.filter(a=>exInfo(a) && a!==k) : [];
    const rt = (typeof e.rt==='number' && e.rt>=15 && e.rt<=1800) ? Math.round(e.rt/15)*15 : 0;
    tpl.ex.push({ id:uid(), k, s:Math.max(1,Math.min(12,e.s|0||3)), r:normReps(e.r, isTimeEx(k)?600:50), ss:!!e.ss, alts, pnote:String(e.pnote||'').slice(0,200), ...(rt?{rt}:{}) });
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
    if(!Array.isArray(d.s.trackedLifts)) delete d.s.trackedLifts; /* keep the [] default */
    if(!Array.isArray(d.s.deloads)) delete d.s.deloads;
    if(typeof d.s.mainFolder!=='string') delete d.s.mainFolder;
    if(typeof d.s.restTarget!=='number' || !(d.s.restTarget>=15 && d.s.restTarget<=1800)) delete d.s.restTarget;
    if(typeof d.s.restSound!=='boolean') delete d.s.restSound;
    S = Object.assign(defaultState(), d.s, { active:null });
    save(); applyTheme(); closeModal();
    go('home');
    toast(t('bakDone'));
  }else{
    toast(t('codeBad'));
  }
}

/* ======================= rest signal (sound + flash) ======================= */
let AC = null;
function unlockAudio(){
  /* create/resume the AudioContext inside a user gesture so iOS lets us beep later */
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    if(!AC) AC = new Ctx();
    if(AC.state==='suspended') AC.resume();
  }catch(e){}
}
function beep(){
  if(!AC || AC.state!=='running') return;
  try{
    const t0 = AC.currentTime + 0.02;
    [[0,880],[0.22,1175]].forEach(([off,hz])=>{ /* two rising tones — "ready" */
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.value = hz;
      g.gain.setValueAtTime(0.0001, t0+off);
      g.gain.linearRampToValueAtTime(0.3, t0+off+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0+off+0.18);
      o.connect(g); g.connect(AC.destination);
      o.start(t0+off); o.stop(t0+off+0.2);
    });
  }catch(e){}
}
function restSignal(){
  if(S.restSound) beep();
  try{ if(navigator.vibrate) navigator.vibrate([180,90,180]); }catch(e){} /* no-op on iOS */
  const bar = $('#restbar');
  if(bar){ bar.classList.remove('flash'); void bar.offsetWidth; bar.classList.add('flash'); }
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
  stepperInit();
  /* subtle divider under the sticky header once the page is scrolled */
  const onScroll = ()=>{ const tb=$('#topbar'); if(tb) tb.classList.toggle('scrolled', window.scrollY>4); };
  window.addEventListener('scroll', onScroll, {passive:true});
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
