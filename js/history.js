/* ============================================================
   History tab: summary strip, searchable workout list with deload dividers,
   row expansion, edit/archive/delete, the resurrect-last-workout Continue,
   and body-weight logging.
   ============================================================ */
'use strict';

/* ======================= HISTORY ======================= */
function htmlHistory(){
  let h = '<div style="height:8px"></div>';
  /* 1. rolling summary strip (slot reserved above for a future deload suggestion card) */
  h += histSummaryHtml();
  /* 2. rhythm strip - the self-regulated U/L/rest pattern at a glance */
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
  /* 6. body weight - graph + recent entries; logging via the quick modal */
  const cbw = V.cp.bw;
  let ws = S.weights;
  if(cbw.p!=='all'){
    const cut = Date.now() - (+cbw.p)*864e5;
    ws = ws.filter(x=>new Date(x.date).getTime()>=cut);
  }
  /* chart caps at 24 points - downsample evenly so long ranges keep their shape */
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
  h += `<div class="searchbox">${TAB_ICONS.exercises}
      <input id="hist-q" type="text" value="${esc(V.histQ||'')}" placeholder="${t('histSearch')}"
        oninput="V.histQ=this.value; renderHistList()">
    </div>
    <div id="histlist">${histListSection()}</div>`;
  return h;
}
/* the filterable part of the History list - re-rendered alone while typing */
function histMatches(w, q){
  return w.name.toLowerCase().includes(q) || w.exercises.some(e=>(e.name||'').toLowerCase().includes(q));
}
function histListSection(){
  const q = (V.histQ||'').trim().toLowerCase();
  const act = S.history.filter(w=>!w.arch && (!q || histMatches(w,q)));
  const arch = S.history.filter(w=>w.arch && (!q || histMatches(w,q)));
  const lim = V.histLimit||20;
  if(!act.length && !arch.length) return `<div class="empty">${t('histNoMatch')}</div>`;
  /* deload dividers only make sense on the full timeline - plain rows when filtered */
  let h = q ? act.slice(0,lim).map(histRowHtml).join('') : histListHtml(act, lim);
  if(act.length>lim){
    h += `<button class="btn ghostbtn" onclick="V.histLimit=(V.histLimit||20)+30; renderHistList()">${t('histMore')} (${act.length-lim})</button>`;
  }
  if(arch.length){
    h += `<h2 class="sec" style="cursor:pointer" onclick="V.showArch=!V.showArch; renderHistList()">
            ${V.showArch?'▾':'▸'} ${t('archTitle')} (${arch.length})</h2>`;
    if(V.showArch) h += arch.slice(0,lim).map(histRowHtml).join('');
  }
  return h;
}
function renderHistList(){ const el = $('#histlist'); if(el) el.innerHTML = histListSection(); }
/* history list with deload dividers woven in: each divider marks a deload period
   and says how many workouts the training cycle below it had */
function histListHtml(act, lim){
  const dls = S.deloads.slice().sort((a,b)=>b.s-a.s); /* newest first */
  const counts = dls.map(d=>{
    const prevEnd = Math.max(0, ...S.deloads.filter(x=>x.s<d.s).map(x=>x.e||x.s));
    const byName = {};
    let n = 0;
    for(const w of act){
      if(w.dl) continue;
      const ts = new Date(w.date).getTime();
      if(ts > prevEnd && ts < d.s){ n++; byName[w.name] = (byName[w.name]||0)+1; }
    }
    const per = Object.keys(byName).map(nm=>({ nm, c:byName[nm] })).sort((a,b)=>b.c-a.c || a.nm.localeCompare(b.nm));
    const cycles = per.length ? Math.min(...per.map(x=>x.c)) : 0;
    return { n, per, cycles };
  });
  let di = 0, h = '';
  act.slice(0,lim).forEach(w=>{
    const ts = new Date(w.date).getTime();
    while(di < dls.length && ts <= (dls[di].e || Date.now())){
      h += dlDividerHtml(dls[di], counts[di]);
      di++;
    }
    h += histRowHtml(w);
  });
  return h;
}
function dlDividerHtml(d, c){
  const brk = c.per.map(x=>`${x.c}× ${esc(x.nm)}`).join(' · ');
  return `<div class="dldiv">
    <span class="l">${t('dlBadge')}</span>
    <span class="d">${fmtDate(new Date(d.s).toISOString())}${d.e?'':' · '+t('dlActiveShort')}</span>
    ${c.n?`<span class="r">${t('histDlAfter',{n:c.n})}</span>`:''}
  </div>${c.n?`<div class="dldiv2">${brk}${c.cycles?` · <span class="cy">${t('histDlCycles',{n:c.cycles})}</span>`:''}</div>`:''}`;
}
function histRowHtml(w){
  const nsets = w.exercises.reduce((a,e)=>a+e.sets.length,0);
  const vol = w.exercises.reduce((a,e)=>a+e.sets.filter(s=>!s.warm).reduce((b,s)=>b+(s.weight*(e.x2?2:1)+(e.mb||0))*s.reps,0),0);
  const open = V.expanded===w.id;
  let detail = '';
  if(open){
    detail = `<div class="histdetail">` + w.exercises.map(e=>
      `<div class="exl"><span class="n">${esc(e.name)}${e.note?` <em style="opacity:.8">- ${esc(e.note)}</em>`:''}</span>
       <span class="s">${e.sets.map(s=>`<span class="tok">${fmtSet(s, e.k, e.mb)}</span>`).join(' ')}</span></div>`).join('') +
      `<div style="display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap">
        <span style="color:var(--ghost);font-size:13px">${t('histVolume')}: ${Math.round(kg2u(vol))} ${unitL()}${w.dur?' · '+fmtTime(w.dur):''}</span>
        <div class="rowacts" style="margin-left:auto">
          ${w.arch?`<button class="iconbtn2" onclick="event.stopPropagation();toggleArch('${w.id}')" aria-label="${t('histUnarch')}">${ACT_ICONS.restore}</button>`:''}
          <button class="iconbtn2" onclick="event.stopPropagation();openHistEdit('${w.id}')" aria-label="edit">${ACT_ICONS.edit}</button>
          <button class="iconbtn2 danger" onclick="event.stopPropagation();delHist('${w.id}')" aria-label="delete">${ACT_ICONS.x}</button>
        </div>
      </div></div>`;
  }
  const canCont = !S.active && S.lastActive && S.lastActive.id===w.id;
  return `<div class="card histrow" id="hw-${w.id}" style="${w.arch?'opacity:.65':''}" onclick="V.expanded=V.expanded==='${w.id}'?null:'${w.id}'; render()">
    <div class="hd">
      <span class="dt">${fmtDate(w.date)} <span class="tmm">${fmtClock(w.date)}</span></span>
      <span class="dn">${esc(w.name)}</span>
      ${w.dl?`<span class="dlchip">${t('dlBadge')}</span>`:''}
      ${canCont?`<button class="contbtn" onclick="event.stopPropagation();continueWorkout()">${ACT_ICONS.play} ${t('histContinue')}</button>`:''}
      <span class="sm">${nsets} ${t('histSets')}${w.dur?' · '+fmtTime(w.dur):''}</span>
    </div>${detail}</div>`;
}
/* undo an accidental Finish: pull the entry back out of history and resume the
   session exactly where it was - the clock keeps running from the original start */
function continueWorkout(){
  if(S.active || !S.lastActive) return;
  const idx = S.history.findIndex(w=>w.id===S.lastActive.id);
  if(idx<0){ S.lastActive = null; save(); render(); return; }
  S.history.splice(idx, 1);
  S.active = S.lastActive.act;
  S.active.rest = null; /* the old rest clock is long stale */
  S.lastActive = null;
  save(); scheduleCloudSync();
  go('workout');
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
  if(S.lastActive && S.lastActive.id===id) S.lastActive = null;
  V.expanded = null;
  save(); render();
}

/* ---- history editing ---- */
function openHistEdit(id){
  /* editing the entry invalidates the pre-edit resume snapshot */
  if(S.lastActive && S.lastActive.id===id) S.lastActive = null;
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
    const mbTag = e.mb>0 ? ` <span style="font-size:12px;font-weight:600;color:var(--dim)">(+${wu(e.mb,true)})</span>` : '';
    return `<div class="card"><div class="exname">${esc(e.name)}${mbTag}</div>${rows}</div>`;
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
    /* last set of the last exercise deleted - the workout itself is gone */
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
  if(logWeight(parseNum(inp ? inp.value : ''))){ save(); scheduleCloudSync(); closeModal(); render(); }
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
        if(isNaN(w)){ const g = ghostFor(ex,i); if(g) w = kg2u(ghostW(ex,g)); }
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
  let html = `<div style="font-size:13px;color:var(--dim);font-weight:600;margin-bottom:8px">${t('platesSide')} - ${fmtW(side)} ${unitL()}:</div>`;
  html += used.length
    ? `<div style="font-size:24px;font-weight:800;color:var(--accent-soft)">${used.map(fmtW).join(' + ')}</div>`
    : `<div style="font-size:16px;font-weight:700">${t('platesEmpty')}</div>`;
  if(rem > 0) html += `<div style="margin-top:8px;font-size:13px;color:var(--orange);font-weight:600">${t('platesRem',{n:fmtW(rem), u:unitL()})}</div>`;
  out.innerHTML = html;
}

