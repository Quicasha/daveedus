/* ============================================================
   Exercise picker modal, the Exercises browser tab, the custom-exercise
   form and the per-exercise detail screen (records, rep-max table, charts,
   session log). Time-based exercises (m:"t") show seconds everywhere.
   ============================================================ */
'use strict';

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
      <div class="xg">${t('g_'+x.g)} · ${t('e_'+x.e)}${isTimeEx(x.id)?` · <span class="xt">${t('modeTime')}</span>`:''}</div></div></button>`).join('')
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
          const add = (bwKind ? (e.bw||0) : 0) + (e.mb||0); /* records use TOTAL load */
          const mul = e.x2 ? 2 : 1;          /* dumbbell pairs: stored per hand, counted total */
          for(const s of work){
            const ew = s.weight*mul + add;
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
/* rep-max map: best TOTAL load (x2 doubled, body weight added) at every rep count;
   warm-ups and drop sets excluded, deloads and archived workouts skipped */
function repMaxRows(k, nm, tplName){
  const best = {};
  for(const h of S.history){
    if(h.arch || h.dl || (tplName && h.name!==tplName)) continue;
    for(const e of h.exercises){
      if(!(e.k===k || (e.name && e.name.trim().toLowerCase()===nm))) continue;
      const add = (isBwEx(e.k) ? (e.bw||0) : 0) + (e.mb||0);
      const mul = e.x2 ? 2 : 1;
      for(const s of e.sets){
        if(s.warm || s.drop || !s.reps) continue;
        const w = s.weight*mul + add;
        if(!(s.reps in best) || w > best[s.reps].w) best[s.reps] = { w, d:h.date };
      }
    }
  }
  return Object.keys(best).map(r=>({ r:+r, w:best[r].w, d:best[r].d })).sort((a,b)=>a.r-b.r);
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
      <div class="xg">${t('g_'+x.g)} · ${t('e_'+x.e)}${isTimeEx(x.id)?` · <span class="xt">${t('modeTime')}</span>`:''}</div></div>
      ${(isTimeEx(x.id)?st.bestTime:st.best)?`<div class="best">${isTimeEx(x.id)?st.bestTime+' s':wu(st.best,true)}</div>`:''}</button>`;
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
  if(info) h += `<div style="color:var(--dim);font-size:14px;margin:0 4px 12px">${t('g_'+info.g)} · ${t('e_'+info.e)}${isTimeEx(k)?` · <span class="xt">${t('modeTime')}</span>`:''}</div>`;
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
  /* bodyweight moves: the record is total load - show the "bw + added" split under it */
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
  /* rep-max map: the best total load ever lifted at each rep count */
  if(!tm){
    const rm = repMaxRows(k, nm, filter);
    if(rm.length){
      h += `<div class="card" style="padding:10px 16px 6px">
        <div style="font-size:12px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--dim);margin-bottom:4px">${t('repRecTitle')}</div>` +
        rm.map(x=>`<div class="rmrow">
          <span class="rr">${x.r} ×</span>
          <span class="rw">${wu(x.w,true)}</span>
          <span class="rd">${fmtDate(x.d)}</span>
        </div>`).join('') + `</div>`;
    }
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
          <span class="s">${e.sets.map(s=>`<span class="tok">${fmtSet(s, k, e.mb)}</span>`).join(' ')}</span></div>`);
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
        const add = (bwKind ? (e.bw||0) : 0) + (e.mb||0); /* volume/1RM use TOTAL load */
        const mul = e.x2 ? 2 : 1;           /* dumbbell pairs count both hands */
        let v;
        if(tm) v = Math.max(...work.map(s=>s.reps));
        else if(metric==='vol') v = Math.round(kg2u(work.reduce((a,s)=>a+(s.weight*mul+add)*s.reps,0)));
        else if(metric==='1rm') v = Math.round(kg2u(Math.max(...work.map(s=>(s.weight*mul+add)*(1+s.reps/30))))*10)/10;
        /* weight metric on bodyweight moves plots ADDED load only (comparable across
           body-weight changes); the body weight itself shows on point tap */
        else v = Math.round(kg2u(Math.max(...work.map(s=>bwKind ? s.weight : s.weight*mul+add)))*100)/100;
        pts.push({ d:w.date, w:v, bw:(bwKind && e.bw!=null) ? e.bw : undefined });
      }
    }
  }
  const label = tm ? t('woSec')
    : metric==='vol' ? t('metricVol')+' ('+unitL()+')'
    : metric==='1rm' ? t('metric1RM')+' ('+unitL()+')'
    : bwKind ? t('woAddCol')+' ('+unitL()+')'
    : t('chartTop',{u:unitL()});
  /* the lift's e1RM goal draws as a dashed line on the ~1RM chart */
  const goal = (!tm && metric==='1rm') ? (S.goals||{})[k] : 0;
  return lineChartSVG(pts, label, tm?'s':unitL(), goal ? Math.round(kg2u(goal)*10)/10 : 0);
}
/* tap on a chart point -> exact value with date (+ body weight at the time, if known) */
function chartTap(i){
  const d = window.__chartData && window.__chartData[i];
  if(!d) return;
  toast(fmtDate(d.d)+' · '+fmtW(d.w)+' '+(window.__chartUnit||'')
        + (d.bw!=null ? ' · '+t('woBwCol')+' '+wu(d.bw,true) : ''));
}
/* generic line chart: pts = [{d:dateIso, w:number}] chronological;
   goal (optional, display unit) adds a dashed target line the scale makes room for */
function lineChartSVG(pts, label, unit, goal){
  if(!pts.length) return `<div class="empty">${t('chartNoData')}</div>`;
  const data = pts.slice(-24);
  window.__chartData = data; window.__chartUnit = unit||'';
  const W=360, H=210, padL=44, padR=14, padT=18, padB=30;
  let min = Math.min(...data.map(p=>p.w)), max = Math.max(...data.map(p=>p.w));
  if(goal) max = Math.max(max, goal);
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
  const goalLine = goal ? `<line x1="${padL}" y1="${Y(goal)}" x2="${W-padR}" y2="${Y(goal)}"
      stroke="var(--accent-soft)" stroke-width="1.5" stroke-dasharray="6 5" opacity=".75"/>
    <text x="${padL+2}" y="${Y(goal)-5}" fill="var(--accent-soft)" font-size="10" font-weight="700">${t('goalTitle').toUpperCase()} ${fmtW(goal)}</text>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${grid}${labels}${goalLine}
    <polyline points="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
    ${dots}
    <text x="${padL}" y="${H-8}" fill="var(--dim)" font-size="11">${d0}</text>
    <text x="${W-padR}" y="${H-8}" fill="var(--dim)" font-size="11" text-anchor="end">${d1}</text>
    <text x="${W-padR}" y="${padT-5}" fill="var(--ghost)" font-size="10" text-anchor="end">${label||''}</text>
  </svg>`;
}

