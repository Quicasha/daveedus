/* ============================================================
   Startup and ambient services: rest-finished signal (beep/vibrate/flash),
   screen wake lock, service-worker registration with auto-update-and-
   reload, the first-launch onboarding tour, and the render() wrap that
   refreshes async bits after each full render.
   ============================================================ */
'use strict';

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
    [[0,880],[0.22,1175]].forEach(([off,hz])=>{ /* two rising tones - "ready" */
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
  if(document.visibilityState==='visible'){ syncWakeLock(); tick(); if(S.ghDirty) scheduleCloudSync(); }
});

/* ======================= boot ======================= */
document.addEventListener('DOMContentLoaded', async ()=>{
  applyTheme();
  /* backdrop tap closes AND re-renders - modal edits (history, targets, base
     weight) must show on the screen behind no matter how the sheet is dismissed */
  $('#modal').addEventListener('click', e=>{ if(e.target.id==='modal'){ closeModal(); render(); } });
  /* IndexedDB mirror: recovers when localStorage is empty/corrupt, and wins
     whenever it is NEWER - e.g. quota failures left localStorage stale while
     the mirror kept receiving fresh state */
  try{
    const raw = await idbGet();
    if(raw){
      const s = hydrate(typeof raw==='string' ? JSON.parse(raw) : raw);
      if(s && (!LS_OK || (s.ts||0) > (S.ts||0))){
        /* the copy being replaced is parked, never destroyed - if the stamp
           lied (clock skew) the real data is still one key away */
        if(LS_OK && S.history.length){ try{ localStorage.setItem(LS_KEY+'.bad', JSON.stringify(S)); }catch(e){} }
        S = s; save(); applyTheme();
        if(!LS_OK) toast(t('protRecovered'));
      }
    }
  }catch(e){}
  /* ask the browser to protect our storage from eviction */
  if(navigator.storage && navigator.storage.persist){
    navigator.storage.persist().catch(()=>{});
  }
  /* a push left pending by a quick close after the last workout goes out now */
  if(S.ghDirty && navigator.onLine) scheduleCloudSync();
  if(S.active) V.screen = 'workout';
  render();
  stepperInit();
  /* first launch ever: a three-card tour, shown exactly once */
  if(!S.onboarded && !S.history.length && !S.active) openOnboarding();
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
      if(!hadController || reloaded) return; /* first install - nothing to refresh */
      reloaded = true;
      try{ sessionStorage.setItem('dvd-upd','1'); }catch(e){}
      location.reload();
    });
  }
});

/* ===== first-launch intro: three short cards, never shown again ===== */
/* closing the tour re-renders: step 0 can change the unit, and Home was
   already drawn before the tour opened */
function obClose(){ closeModal(); render(); }
function openOnboarding(){
  S.onboarded = 1; save(); /* even a backdrop dismiss counts as seen */
  V.ob = 0;
  renderOb();
}
/* looping mini-demo built from the REAL set-row markup, so what the intro
   shows is pixel-for-pixel what the workout screen looks like */
function obDemo(step){
  const u = unitL();
  if(step==='w') return `<div class="obdemo obw"><span class="obwm">Daveedus</span></div>`;
  if(step===4) return `<div class="obdemo ob3">
      <span class="obkey">${ACT_ICONS.copy}</span>
      <span class="obcode">DVD1.eyJ0Ijoi…</span>
    </div>`;
  /* body weight: the home stat row - the tap lands on the third tile and the
     dash becomes a weight, so people learn the tile is a button at all */
  if(step===6){
    const bwv = S.unit==='lb' ? '149.1' : '67.6';
    return `<div class="obdemo ob7">
      <div class="statrow" style="margin:0">
        <div class="stat"><div class="v">7</div><div class="l">${t('statWeek')}</div></div>
        <div class="stat"><div class="v">67</div><div class="l">${t('statTotal')}</div></div>
        <div class="stat obbwtile"><div class="v"><span class="obbw1">—</span><span class="obbw2">${bwv}</span></div>
          <div class="l">${t('bw').toLowerCase()}, ${u}</div><span class="obtap tap7"></span></div>
      </div></div>`;
  }
  /* programs: a pinned split card - the tap lands on the star, TODAY lights up */
  if(step===5) return `<div class="obdemo ob6">
    <div class="splitcard" style="margin:0">
      <div class="sphead" style="cursor:default"><span class="sphn">Upper / Lower ›</span>
        <button class="mainbtn obstar">${ACT_ICONS.star}<span class="obtap tap6"></span></button></div>
      <div class="sprow next" style="cursor:default"><span class="spn">Upper A</span><span class="nextchip obtoday">${t('todayBadge')}</span></div>
      <div class="sprow" style="cursor:default"><span class="spn">Lower A</span></div>
    </div></div>`;
  /* swap: tap the ... menu, the exercise name crossfades to its alternative */
  if(step===2) return `<div class="obdemo ob4">
    <div class="exhead" style="margin:2px 0">
      <div class="exname obswap"><span class="obn1">Bench Press</span><span class="obn2">${ACT_ICONS.swap} Smith Bench Press</span></div>
      <button class="minibtn obmenu">${ACT_ICONS.more}<span class="obtap tap4"></span></button>
    </div></div>`;
  /* warmup: tap W, the ramp rows fade in under the working set */
  if(step===3) return `<div class="obdemo ob5">
    <div class="exhead" style="margin:2px 0">
      <div class="exname">Bench Press</div>
      <button class="minibtn warm obwbtn">W<span class="obtap tap5"></span></button>
    </div>
    ${[['W','20','10','r1'],['W','40','6','r2'],['W','60','2','r3']].map(([l,w,r,c])=>`
      <div class="setgrid nod obwr ${c}">
        <span class="setnum warm">${l}</span><div class="prev"></div>
        <span class="obin">${w}</span><span class="obin">${r}</span>
        <div class="checkbtn">${ACT_ICONS.check}</div>
      </div>`).join('')}
    <div class="setgrid nod">
      <span class="setnum">1</span><div class="prev">80 ${u} × 5</div>
      <span class="obin">80</span><span class="obin">5</span>
      <div class="checkbtn">${ACT_ICONS.check}</div>
    </div></div>`;
  const up = S.unit==='lb' ? '45' : '42.5'; /* one realistic plate jump in the display unit */
  const hdr = `<div class="setgrid nod hdr" style="margin-top:2px"><div>${t('woSet')}</div><div>${t('woPrev')}</div><div>${u}</div><div>${t('woReps')}</div><div>${ACT_ICONS.check}</div></div>`;
  if(step===0) return `<div class="obdemo ob1">${hdr}
    <div class="setgrid nod">
      <span class="setnum">1</span><div class="prev">40 ${u} × 10</div>
      <span class="obin">40</span><span class="obin">10</span>
      <div class="checkbtn obchk">${ACT_ICONS.check}<span class="obtap"></span></div>
    </div></div>`;
  return `<div class="obdemo ob2">${hdr}
    <div class="setgrid nod">
      <span class="setnum">1</span><div class="prev">40 ${u} × 10</div>
      <span class="obin"><i class="obtype">${up}</i></span><span class="obin">10</span>
      <div class="checkbtn obchk2">${ACT_ICONS.check}<span class="obtap"></span></div>
    </div></div>`;
}
function renderOb(){
  const i = V.ob||0;
  const N = 10;
  const dots = Array.from({length:N},(_,j)=>`<span class="obdot${j===i?' on':''}"></span>`).join('');
  const dotRow = `<div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px">${dots}</div>`;
  /* step 0: units, theme and skin - every pick applies INSTANTLY, so the sheet
     itself is the live preview before Next is ever pressed */
  if(i===0){
    openModal(`<h3>Daveedus<button class="x" onclick="obClose()">✕</button></h3>
      <div class="card">
        <div class="setline">
          <span class="lb">${t('setUnit')}</span>
          <div class="seg">
            <button class="${(S.unit||'kg')==='kg'?'on':''}" onclick="S.unit='kg';save();renderOb()">kg</button>
            <button class="${S.unit==='lb'?'on':''}" onclick="S.unit='lb';save();renderOb()">lb</button>
          </div>
        </div>
        <div class="setline">
          <span class="lb">${t('setTheme')}</span>
          <div class="seg">
            <button class="${S.theme!=='light'?'on':''}" onclick="S.theme='dark';save();applyTheme();renderOb()">${t('themeDark')}</button>
            <button class="${S.theme==='light'?'on':''}" onclick="S.theme='light';save();applyTheme();renderOb()">${t('themeLight')}</button>
          </div>
        </div>
        <div style="color:var(--dim);font-size:13px;margin:12px 0 8px">${t('setStyle')}</div>
        <div class="swaplist">${skinRowsHtml("S.skin='KEY';save();applyTheme();renderOb()")}</div>
      </div>
      ${dotRow}
      <button class="btn primary" onclick="V.ob=1;renderOb()">${t('obNext')}</button>`);
    return;
  }
  /* step 1: pick who you are today - the welcome card talks back in those words */
  if(i===1){
    openModal(`<h3>${t('obpT')}<button class="x" onclick="obClose()">✕</button></h3>
      <div class="obbody">${t('obpB')}</div>
      <div>${['skinny','fluffy','liar'].map(k=>
        `<button class="btn" onclick="V.obP='${k}';V.ob=2;renderOb()">${t('obp_'+k)}</button>`).join('')}</div>
      ${dotRow}`);
    return;
  }
  const steps = [null, null,
    ['obwT','obwB','w'], ['ob1T','ob1B',0], ['ob2T','ob2B',1],
    ['ob4T','ob4B',2], ['ob5T','ob5B',3], ['ob6T','ob6B',5], ['obBwT','obBwB',6], ['ob3T','ob3B',4]];
  const [tt, bb, dm] = steps[i];
  const lastStep = i === N-1;
  openModal(`<h3>${t(tt)}<button class="x" onclick="obClose()">✕</button></h3>
    ${obDemo(dm)}
    <div class="obbody">${t(bb, {p:t('obpi_'+(V.obP||'skinny'))})}</div>
    ${dotRow}
    <button class="btn primary" onclick="${lastStep?'obClose()':'V.ob++; renderOb()'}">${lastStep?t('obDone'):t('obNext')}</button>`);
}

/* screens with async bits need a follow-up after each full render */
const _origRender = render;
render = function(){
  _origRender();
  if(V.screen==='exercises') renderExList();
  if(V.screen==='settings'){ updatePersistStatus(); updateGhStatus(); }
  if(V.screen==='history') rhythmYearScroll();
};

