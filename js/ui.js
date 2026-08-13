/* ============================================================
   Render core: go() navigation, render() dispatch to the html* screen
   builders, the sticky topbar, tab bar, modal open/close and icon sets.
   Screens are template-string builders; every interactive element wires
   through global onclick handlers, so all handlers must stay global.
   ============================================================ */
'use strict';

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
    /* while resting, the label line shows the count-up since the last set - always
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

