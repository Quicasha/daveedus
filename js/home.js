/* ============================================================
   Home screen: install hint, backup reminder, week stats, deload reminder
   card, pinned program cards with TODAY/NEXT suggestions.
   The weekday plan and its week counter follow ONLY the starred (main)
   program - same anchor the deload uses.
   ============================================================ */
'use strict';

/* ======================= HOME ======================= */
function weekCount(){
  const now = new Date();
  const day = (now.getDay()+6)%7; /* Monday = 0 */
  const monday = new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate()-day);
  return S.history.filter(h=>!h.arch && new Date(h.date)>=monday).length;
}
/* running as an installed app? (home-screen PWA, not a browser tab) */
function isStandalone(){
  return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || !!navigator.standalone;
}
function htmlHome(){
  const dateStr = new Date().toLocaleDateString('en-GB',
    { weekday:'long', month:'long', day:'numeric' });
  let h = `<div class="hero"><div class="date">${esc(dateStr)}</div>${syncPillHtml()}</div>`;
  /* browser tab on a phone: nudge once toward Add to Home Screen */
  const iosB = /iPhone|iPad|iPod/.test(navigator.userAgent), andB = /Android/.test(navigator.userAgent);
  if(!S.a2hsOff && !isStandalone() && (iosB || andB)){
    h += `<div class="card" style="display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:13px;line-height:1.45"><b>${t('a2hsTitle')}</b><br>
        <span style="color:var(--dim)">${iosB?t('a2hsIos'):t('a2hsAnd')}</span></span>
      <button class="minibtn" style="width:32px;min-height:32px;font-size:12px" onclick="S.a2hsOff=1; save(); render()">✕</button>
    </div>`;
  }
  if(needBackupReminder()){
    h += `<div class="card" style="display:flex;align-items:center;gap:10px">
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--orange)">${t('bakRemind')}</span>
      <button class="btn small" style="background:var(--accent);color:var(--on-accent)" onclick="copyBackup();render()">${t('copy')}</button>
      <button class="minibtn" style="width:32px;min-height:32px;font-size:12px" onclick="S.bakSnooze=Date.now(); save(); render()">✕</button>
    </div>`;
  }
  /* weekday plan follows only the STARRED (main) program - same anchor as deload;
     its templates turn the first stat into "done/planned this calendar week" */
  const wdToday = ((new Date().getDay()+6)%7)+1; /* Mon=1..Sun=7 */
  const mainId = mainFolderId();
  const mainTpls = S.templates.filter(x=>x.folderId===mainId);
  const wdTarget = mainTpls.filter(x=>x.wd).length;
  const monday = new Date(); monday.setHours(0,0,0,0); monday.setDate(monday.getDate()-(wdToday-1));
  const wkDone = S.history.filter(w=>!w.arch && new Date(w.date)>=monday && mainTpls.some(tp=>tp.id===w.tplId)).length;
  h += `<div class="statrow">
      <div class="stat" style="cursor:pointer" onclick="go('history')"><div class="v">${wdTarget?wkDone+'/'+wdTarget:weekCount()}</div><div class="l">${wdTarget?t('statWeekOf'):t('statWeek')}</div></div>
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
    return `<button class="tplbtn ${isNext?'next':''}" onclick="openWoPreview('${d.id}')">
      <div class="tinfo"><div class="tname">${esc(d.name)}${isNext?` <span class="nextchip">${t('nextBadge')}</span>`:''}</div>
      <div class="tsub">${last?daysAgoStr(last.date):t('never')} · ${esc(names)}</div></div>
      <div class="go">${ACT_ICONS.chevron}</div></button>`;
  };
  /* deload: active banner (tap = end early), otherwise a subtle button in the section header */
  const dl = dlActive();
  if(dl){
    h += `<div class="dlcard" onclick="endDeload()">
      <span class="dlttl">${t('dlActiveBanner')}</span>
      <span class="dlsub">${t('dlLeft',{n:dlRemaining(dl).length})} · ${t('dlSub')}</span></div>`;
  }else if(S.dlEvery>0 && Date.now()>S.dlSnooze){
    /* calendar reminder: N weeks since the last deload (or since training started) */
    const anchor = dlLastStart() || (S.history.length ? new Date(S.history[S.history.length-1].date).getTime() : 0);
    const wks = anchor ? Math.floor((Date.now()-anchor)/(7*864e5)) : 0;
    if(wks >= S.dlEvery){
      h += `<div class="dlcard" style="flex-direction:row;align-items:center;gap:10px" onclick="startDeload()">
        <span style="flex:1;display:flex;flex-direction:column;gap:2px">
          <span class="dlttl">${t('dlRemindTitle')}</span>
          <span class="dlsub">${t('dlRemindSub',{n:wks})}</span></span>
        <button class="minibtn" style="width:32px;min-height:32px;font-size:12px;background:none;color:var(--orange)"
          onclick="event.stopPropagation();S.dlSnooze=Date.now()+7*864e5; save(); render()">✕</button></div>`;
    }
  }
  /* passive deload advisor: fires only when research-grade signals stack
     (see dlAdvice in deload.js) - one tap starts the deload, X snoozes 2 weeks */
  const adv = dl ? null : dlAdvice();
  if(adv){
    h += `<div class="dlcard" style="flex-direction:row;align-items:center;gap:10px" onclick="startDeload()">
      <span style="flex:1;display:flex;flex-direction:column;gap:2px">
        <span class="dlttl">${t('dlaTitle')}</span>
        <span class="dlsub">${adv.why} · ${t('dlRemindSub',{n:adv.w})}</span></span>
      <button class="minibtn" style="width:32px;min-height:32px;font-size:12px;background:none;color:var(--orange)"
        onclick="event.stopPropagation();S.dlaSnooze=Date.now()+14*864e5; save(); render()">✕</button></div>`;
  }
  /* stall nudge: the first tracked lift that stopped setting e1RM bests -
     one card at a time, snoozable, silent for lifts already on a wave */
  if(!dl){
    const sk = S.trackedLifts.find(k=>!S.waves[k] && (S.stallSnooze[k]||0) < Date.now() && stallInfo(k));
    if(sk){
      const si = stallInfo(sk);
      h += `<div class="card" style="display:flex;align-items:center;gap:10px">
        <span style="flex:1;font-size:13px;line-height:1.5"><b>${t('stallTitle',{n:esc(exName(sk))})}</b><br>
          <span style="color:var(--dim)">${t('stallSub',{c:si.n})}</span></span>
        <button class="btn small" style="background:var(--accent);color:var(--on-accent)" onclick="openWaveModal('${esc(sk)}')">${t('stallGo')}</button>
        <button class="minibtn" style="width:32px;min-height:32px;font-size:12px" onclick="S.stallSnooze['${esc(sk)}']=Date.now()+14*864e5; save(); render()">✕</button>
      </div>`;
    }
  }
  /* home shows only PINNED splits as a grid of split cards; fall back to all when none pinned */
  const pinned = S.folders.filter(f=>f.pinned);
  const showFolders = pinned.length ? pinned : S.folders;
  /* workout + full-cycle counters since the last deload - the "when to deload" gauge */
  const counts = tplCounts();
  /* the main-program star only matters when there is a choice (free splits opt out) */
  const multi = showFolders.filter(f=>!f.free && S.templates.some(x=>x.folderId===f.id)).length > 1;
  const cards = showFolders.map(f=>{
    const tpls = S.templates.filter(x=>x.folderId===f.id);
    if(!tpls.length) return '';
    if(f.free){
      /* pick-by-place split: no rotation, no cycles, no star - the honest numbers
         are "how many times ever" and "how long ago", per variant */
      const rows = tpls.map(d=>{
        const last = S.history.find(h=>h.tplId===d.id && !h.arch);
        const total = S.history.reduce((a,h)=>a + (h.tplId===d.id && !h.arch && !h.dl ? 1 : 0), 0);
        const ago = last ? (n=> n<=0 ? t('today') : n+'d')(
          Math.round((new Date().setHours(0,0,0,0) - new Date(last.date).setHours(0,0,0,0))/864e5)) : '—';
        return `<button class="sprow" onclick="openWoPreview('${d.id}')">
          <span class="spn">${esc(d.name)}</span>
          ${total?`<span class="spcnt">${total}</span>`:''}
          <span class="spwd">${ago}</span></button>`;
      }).join('');
      return `<div class="splitcard">
        <div class="sphead" onclick="openSplit('${f.id}')"><span class="sphn">${esc(f.name)} ›</span></div>${rows}</div>`;
    }
    /* weekday plan applies to the STARRED program only (like deload): there a
       workout assigned to TODAY wins; otherwise suggest the one AFTER the most
       recently done in this split (cyclic) */
    const todayTpl = f.id===mainId ? tpls.find(x=>x.wd===wdToday) : null;
    let nextId = tpls[0].id;
    for(const hw of S.history){
      if(hw.arch) continue;
      const idx = tpls.findIndex(x=>x.id===hw.tplId);
      if(idx>=0){ nextId = tpls[(idx+1)%tpls.length].id; break; }
    }
    if(todayTpl) nextId = todayTpl.id;
    const cycles = Math.min(...tpls.map(d=>counts[d.id]||0));
    const rows = tpls.map(d=>{
      const dlDue = dl && dl.tpls.includes(d.id) && !dl.done.includes(d.id);
      return `<button class="sprow ${d.id===nextId?'next':''}" onclick="openWoPreview('${d.id}')">
      <span class="spn">${esc(d.name)}</span>
      ${dlDue?`<span class="dldot" title="${t('dlBadge')}"></span>`:''}
      ${counts[d.id]?`<span class="spcnt">${counts[d.id]}</span>`:''}
      ${(f.id===mainId && d.wd)?`<span class="spwd">${t('wd'+d.wd)}</span>`:''}
      ${d.id===nextId?`<span class="nextchip">${todayTpl?t('todayBadge'):t('nextBadge')}</span>`:''}</button>`;
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

