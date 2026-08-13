/* ============================================================
   Derived numbers and charts: exStats/e1RM, rep-specific PR feed, tracked
   lifts with goals and trends, rhythm strip, period-bucketed bar charts,
   muscle balance and the generic SVG chart builders.
   All totals use FULL load: x2 pairs doubled, body weight and machine base
   added. Deload (dl) and archived (arch) workouts are excluded from records.
   ============================================================ */
'use strict';

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
/* compact chips on a card header; opts = [[value,label],...]; withCustom adds ⋯ (from-to) */
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
/* custom from-to as [startDate, endDateExclusive]; null if incomplete/reversed */
function customRange(c){
  if(!c.f || !c.t) return null;
  const s = new Date(c.f+'T00:00:00'), e = new Date(c.t+'T00:00:00');
  e.setDate(e.getDate()+1);
  return e>s ? [s,e] : null;
}
/* time buckets for a chart's period setting; bucket size auto-adapts on custom ranges */
function bucketsFor(c){
  const loc = 'en-GB';
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
        vol[bi].v += h.exercises.reduce((a,ex)=>a+ex.sets.filter(x=>!x.warm).reduce((b,x)=>b+(x.weight*(ex.x2?2:1)+(ex.mb||0))*x.reps,0),0);
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
  /* 14 d = one row; longer ranges wrap into 15-day rows (no weekday grid on purpose -
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
        pts.push({ ts:new Date(w.date).getTime(), v:Math.max(...work.map(s=>tm?s.reps:s.weight*(e.x2?2:1)+(e.mb||0))) });
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
/* per-session best e1RM (Epley, TOTAL load) for a lift, oldest -> newest,
   deloads and archived workouts excluded - the shared source for the trend
   arrow, the goal ETA and the stall detector */
function e1rmSeries(k){
  if(isTimeEx(k)) return [];
  const info = exInfo(k);
  const nm = (info?info.n:k).trim().toLowerCase();
  const pts = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    if(w.arch || w.dl) continue;
    for(const e of w.exercises){
      if(!(e.k===k || (e.name && e.name.trim().toLowerCase()===nm))) continue;
      const work = e.sets.filter(s=>!s.warm && !s.drop && s.reps>0);
      if(!work.length) continue;
      const add = (isBwEx(e.k) ? (e.bw||0) : 0) + (e.mb||0);
      const mul = e.x2 ? 2 : 1;
      pts.push({ ts:new Date(w.date).getTime(), v:Math.max(...work.map(s=>(s.weight*mul+add)*(1+s.reps/30))) });
    }
  }
  return pts;
}
/* passive stall detector: e1RM direction over the last ~6 sessions of a lift -
   rising means the training is working, flat/falling is the honest deload signal.
   Purely computed from history, never asks the user anything. */
function trendFor(k){
  const rec = e1rmSeries(k).slice(-6).map(p=>p.v);
  if(rec.length < 4) return null; /* too little data to call a direction */
  const half = Math.floor(rec.length/2);
  const a = rec.slice(0,half).reduce((x,y)=>x+y,0)/half;
  const b = rec.slice(-half).reduce((x,y)=>x+y,0)/half;
  if(a <= 0) return null;
  const pct = (b-a)/a*100;
  return pct > 1.5 ? 'up' : pct < -1.5 ? 'down' : 'flat';
}
/* goal ETA: linear fit over the last <=10 sessions of e1RM; a date only comes
   back when there is enough data, the trend actually climbs and the answer
   lands within three years - anything else would be a guess, so show nothing */
function etaFor(k, goalKg){
  if(trendFor(k) !== 'up') return null; /* the date and the trend arrow must agree */
  const pts = e1rmSeries(k).slice(-10);
  if(pts.length < 4) return null;
  const n = pts.length;
  const mx = pts.reduce((a,p)=>a+p.ts,0)/n, my = pts.reduce((a,p)=>a+p.v,0)/n;
  let num = 0, den = 0;
  for(const p of pts){ num += (p.ts-mx)*(p.v-my); den += (p.ts-mx)*(p.ts-mx); }
  if(den <= 0) return null;
  const slope = num/den; /* kg per ms */
  const cur = pts[n-1].v;
  if(slope <= 0 || cur >= goalKg) return null;
  const ms = (goalKg - cur)/slope;
  if(ms > 3*365*864e5) return null;
  return new Date(Date.now() + ms);
}
/* CURRENT FORM window: the last 12 sessions within 90 days. Progress logic
   (stall watch, wave targets) anchors here, NOT to lifetime records - after a
   cut, a layoff or a program change the old peak ages out and the detectors
   recalibrate to what the lifter can actually do now. Records and the PR feed
   stay all-time on purpose: that is what records are. */
function recentSeries(k){
  const cut = Date.now() - 90*864e5;
  return e1rmSeries(k).filter(p=>p.ts >= cut).slice(-12);
}
/* stalled = flat trend AND 4+ sessions without beating the CURRENT-FORM best
   (0.25% tolerance eats rounding noise). A falling trend stays silent - that
   is a cut or life happening, and a wave does not fix a calorie deficit. */
function stallInfo(k){
  if(trendFor(k) !== 'flat') return null;
  const pts = recentSeries(k);
  if(pts.length < 6) return null;
  let best = 0, since = 0;
  for(const p of pts){
    if(p.v > best*1.0025){ best = p.v; since = 0; }
    else since++;
  }
  return since >= 4 ? { n:since } : null;
}
function trackedHtml(){
  let h = `<h2 class="sec">${t('trackedTitle')}</h2>`;
  /* say plainly what tracking buys - the stall watch especially must not feel random */
  if(S.trackedLifts.length)
    h += `<div style="color:var(--ghost);font-size:12px;line-height:1.5;margin:-2px 6px 8px">${t('trackedSub')}</div>`;
  else
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
    const tr = trendFor(k);
    const trHtml = tr ? `<span class="tktrend ${tr}" title="${t('trend_'+tr)}">${tr==='up'?'↗':tr==='down'?'↘':'→'}</span>` : '';
    /* goal line: target e1RM vs the all-time best e1RM */
    const goal = (S.goals||{})[k];
    let goalHtml = '';
    if(goal>0 && !tm){
      const cur = exStats(k, name).e1rm;
      const pct = Math.min(100, Math.round(cur/goal*100));
      const done = cur >= goal;
      /* honest projection: only shows when the trend really climbs (see etaFor) */
      const eta = done ? null : etaFor(k, goal);
      const etaTxt = eta ? ` · ${t('goalEta',{d:eta.toLocaleDateString('en-GB',{year:'numeric',month:'short'})})}` : '';
      goalHtml = `<div class="goalrow">
        <span class="goalbar"><i style="width:${pct}%${done?';background:var(--green)':''}"></i></span>
        <span class="goaltxt${done?' done':''}">${wu(Math.round(cur*10)/10)} / ${wu(goal,true)} · ${done?t('goalReached'):t('goalLeft',{n:wu(Math.round((goal-cur)*10)/10)})}${etaTxt}</span>
      </div>`;
    }
    return `<div class="card trackcard" onclick="openExDetailByKey('${k}')">
      <div class="tkhead"><span class="tkname">${esc(name)}</span>${trHtml}
        ${tm?'':`<button class="iconbtn2 ${goal>0?'on':''}" onclick="event.stopPropagation();openGoalEdit('${k}')" aria-label="${t('goalTitle')}">${ACT_ICONS.star}</button>`}
        <button class="iconbtn2" onclick="event.stopPropagation();trackRemove('${k}')" aria-label="stop tracking">${ACT_ICONS.x}</button></div>
      <div class="tkrow">
        <div class="tkleft"><div class="tkval">${last?fmtVal(last.v):'—'}</div>${dHtml}</div>
        ${sparkSVG(pts.slice(-16).map(p=>p.v))}
      </div>
      ${goalHtml}
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
/* target e1RM for a tracked lift (kg stored, edited in the display unit) */
function openGoalEdit(k){
  const goal = (S.goals||{})[k];
  openModal(`<h3>${esc(exName(k))}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="pvsub" style="margin-bottom:12px">${t('goalTitle')} (e1RM)</div>
    <div style="display:flex;align-items:center;gap:10px">
      <input id="goal-in" type="text" inputmode="decimal" class="nameinput" style="flex:1;text-align:center;font-weight:700;font-size:18px"
        value="${goal?esc(fmtW(kg2u(goal))):''}" placeholder="0" onfocus="this.select()">
      <span style="font-weight:700;color:var(--dim)">${unitL()}</span>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:12px">${t('goalHint')}</div>
    <button class="btn primary" style="margin-top:14px" onclick="saveGoal('${k}')">${ACT_ICONS.check} ${t('saveDone')}</button>`);
  setTimeout(()=>{ const i=$('#goal-in'); if(i) i.focus(); }, 60);
}
function saveGoal(k){
  const v = parseNum(($('#goal-in')||{}).value);
  const kg = (!isNaN(v) && v>0) ? Math.min(1000, Math.round(u2kg(v)*10)/10) : 0;
  if(!S.goals) S.goals = {};
  if(kg) S.goals[k] = kg; else delete S.goals[k];
  save(); closeModal(); render(); scheduleCloudSync();
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
      const add = (bwKind ? (e.bw||0) : 0) + (e.mb||0); /* records use TOTAL load */
      const mul = e.x2 ? 2 : 1;
      const top = {};
      for(const s of work){
        const tot = s.weight*mul + add;
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

