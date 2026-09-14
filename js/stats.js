/* ============================================================
   Derived numbers and charts: e1RM series and the current-form window,
   trend / ETA / stall detectors, tracked lifts with goals, rep-specific PR
   feed, the rhythm card (day strips, GitHub-style year grid, all-time month
   map), period-bucketed bar charts, muscle balance and the bar/spark SVG
   builders (exStats and the line chart live in exercises-ui.js).
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
  const loc = uiLocale();
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
        vol[bi].v += woVolume(h.exercises);
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

/* ---- weekly sets per muscle: calendar weeks (Monday-anchored), work sets only ----
   The one question this answers: is the back getting as much as the chest.
   Warmups never count; the muted 10-20 band is where most hypertrophy research
   lands - drawn as a guide, never as a grade (no reds, no shaming). */
function weeklyMuscleSets(nWeeks){
  const mon = new Date(); mon.setHours(0,0,0,0);
  mon.setDate(mon.getDate() - ((mon.getDay()+6)%7));   /* this week's Monday */
  const weeks = [];
  for(let i=0;i<nWeeks;i++){
    const s = mon.getTime() - i*7*864e5;
    weeks.push({ s, e:s + 7*864e5, counts:{} });
  }
  const oldest = weeks[weeks.length-1].s;
  for(const h of S.history){
    if(h.arch) continue;
    const ts = new Date(h.date).getTime();
    if(ts < oldest) continue;
    const wkb = weeks.find(w=>ts>=w.s && ts<w.e);
    if(!wkb) continue;
    for(const e of h.exercises){
      const info = exInfo(e.k);
      const g = info ? info.g : 'other';
      wkb.counts[g] = (wkb.counts[g]||0) + e.sets.filter(s=>!s.warm).length;
    }
  }
  return weeks;
}
function weeklySetsHtml(){
  const weeks = weeklyMuscleSets(5);      /* 4 pickable + 1 more for the comparison */
  const wi = Math.max(0, Math.min(3, V.wkvol|0));
  const cur = weeks[wi].counts, prev = weeks[wi+1].counts;
  /* every group seen anywhere in the window - a muscle at 0 THIS week is the signal */
  const groups = [...new Set(weeks.flatMap(w=>Object.keys(w.counts)))]
    .sort((a,b)=>(cur[b]||0)-(cur[a]||0) || (prev[b]||0)-(prev[a]||0));
  if(!groups.length) return `<div class="empty" style="padding:6px 0 12px">${t('chartNoData')}</div>`;
  const scale = Math.max(22, ...groups.map(g=>Math.max(cur[g]||0, prev[g]||0)));
  const pct = n => Math.round(1000*n/scale)/10;
  const chips = [t('wv0'),t('wv1'),t('wv2'),t('wv3')].map((l,i)=>
    `<button class="chip ${wi===i?'on':''}" onclick="V.wkvol=${i}; render()">${l}</button>`).join('');
  const rows = groups.map(g=>{
    const n = cur[g]||0, p = prev[g]||0;
    /* down-deltas stay NEUTRAL here - a lighter week is information, not failure */
    const dlt = n===p ? '' : `<span class="dlt ${n>p?'up':'wv-down'}">${n>p?'▲':'▼'}${Math.abs(n-p)}</span>`;
    return `<div class="mb-row">
      <span class="mb-name">${t('g_'+g)}</span>
      <span class="mb-bar wv-bar"><span class="wv-band" style="left:${pct(10)}%;width:${pct(10)}%"></span><i style="width:${pct(n)}%"></i>${p?`<span class="wv-tick" style="left:${pct(p)}%"></span>`:''}</span>
      <span class="mb-val">${n}${dlt}</span>
    </div>`;
  }).join('');
  return `<div class="chips" style="padding:0 0 8px">${chips}</div>${rows}
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:8px">${t('wvHint')}</div>`;
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
      v7 += woVolume(h.exercises);
    }else if(ts>=now-14*D){
      cP++;
      vP += woVolume(h.exercises);
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

/* ---- rhythm: 14/30/90-day strips, a GitHub-style year grid and an all-time
        month heat map. Deload days stay orange everywhere - a rest week is part
        of the story, not a gap in it. ---- */
function rhythmDayMap(){ /* midnight ts -> { id, ltr, n, dl } */
  const map = {};
  for(const h of S.history){
    if(h.arch) continue;
    const d = new Date(h.date); d.setHours(0,0,0,0);
    const ts = d.getTime();
    if(!map[ts]) map[ts] = { id:h.id, ltr:(h.name||'').trim().charAt(0).toUpperCase()||'✓', n:1, dl:!!h.dl };
    else { map[ts].n++; if(h.dl) map[ts].dl = true; }
  }
  return map;
}
function rhythmHtml(){
  const p = V.cp.rh.p || '14';
  const chips = pchipsHtml('rh',[['14','14 d.'],['30','30 d.'],['90','90 d.'],['y',t('pdcY')],['all',t('pdAll')]],false);
  const head = `<div class="chead" style="margin-bottom:8px"><span class="ct">${t('rhythmTitle')}</span>${chips}</div>`;
  if(p==='y') return head + rhythmYearHtml();
  if(p==='all') return head + rhythmAllHtml();
  const n = +p || 14;
  const today = new Date(); today.setHours(0,0,0,0);
  const map = rhythmDayMap();
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
  return head + `<div class="rhythm${n>14?' multi':''}">${cells}</div>`;
}
/* year grid: 7 weekday rows (Mon top) x one column per week, month labels above,
   < > to step through the years that have data; totals underneath */
/* oldest non-archived workout, or null - the anchor for both long-range views */
function rhythmFirst(){
  for(let i=S.history.length-1; i>=0; i--) if(!S.history[i].arch) return new Date(S.history[i].date);
  return null;
}
function rhythmYearHtml(){
  const now = new Date();
  const f0 = rhythmFirst();
  const first = f0 ? Math.min(f0.getFullYear(), now.getFullYear()) : now.getFullYear();
  const yr = Math.min(now.getFullYear(), Math.max(first, V.cp.rh.y || now.getFullYear()));
  V.cp.rh.y = yr;
  const map = rhythmDayMap();
  const today = new Date(); today.setHours(0,0,0,0);
  const jan1 = new Date(yr,0,1), dec31 = new Date(yr,11,31);
  /* grid starts on the Monday on/before Jan 1 */
  const start = new Date(jan1); start.setDate(start.getDate() - ((jan1.getDay()+6)%7));
  const cols = [];
  const months = []; /* [colIndex, label] where a month begins */
  const byMonth = new Array(12).fill(0);
  let total = 0, dlDays = 0, days = 0;
  for(let c=0; ; c++){
    const colStart = new Date(start); colStart.setDate(start.getDate()+c*7);
    if(colStart > dec31) break;
    let col = '';
    for(let r=0; r<7; r++){
      const d = new Date(colStart); d.setDate(colStart.getDate()+r);
      const inYear = d.getFullYear()===yr;
      if(inYear && d.getDate()===1) months.push([c, d.toLocaleDateString(uiLocale(),{month:'short'})]);
      if(!inYear || d > today){ col += `<i class="yc off"></i>`; continue; }
      const w = map[d.getTime()];
      if(w){ total += w.n; byMonth[d.getMonth()] += w.n; if(w.dl) dlDays++; days++; }
      const td = d.getTime()===today.getTime() ? ' today' : '';
      col += w ? `<button class="yc on${w.dl?' dl':''}${w.n>1?' x2':''}${td}" onclick="rhythmTap('${w.id}')" aria-label="${fmtDate(d.toISOString())}"></button>`
               : `<i class="yc${td}"></i>`;
    }
    cols.push(`<div class="ycol">${col}</div>`);
  }
  /* month labels: absolute-positioned by column index, skip ones that would collide */
  let lastLbl = -3, mh = '';
  for(const [c,l] of months){ if(c-lastLbl >= 3){ mh += `<span style="left:${(c/cols.length*100).toFixed(2)}%">${l}</span>`; lastLbl = c; } }
  const bestI = byMonth.indexOf(Math.max(...byMonth));
  const best = byMonth[bestI] ? t('rhBest',{m:new Date(yr,bestI,1).toLocaleDateString(uiLocale(),{month:'long'}), n:byMonth[bestI]}) : '';
  const canPrev = yr > first, canNext = yr < now.getFullYear();
  return `<div class="ynav">
      <button class="minibtn" ${canPrev?'':'disabled'} onclick="V.cp.rh.y=${yr-1}; render()">‹</button>
      <span class="yyr">${yr}</span>
      <button class="minibtn" ${canNext?'':'disabled'} onclick="V.cp.rh.y=${yr+1}; render()">›</button>
    </div>
    <div class="ywrap" id="ywrap"><div class="yinner"><div class="ymonths">${mh}</div><div class="ygrid">${cols.join('')}</div></div></div>
    <div class="ystats">${t('rhTotal',{n:total})}${days!==total?` · ${t('rhDays',{n:days})}`:''}${dlDays?` · ${t('rhDl',{n:dlDays})}`:''}${best?` · ${best}`:''}</div>`;
}
/* after render: the grid keeps the scroll position the user left it at (re-renders
   happen on every tap); a freshly opened year lands on today's week for the
   current year and on January for past ones */
function rhythmYearScroll(){
  const el = document.getElementById('ywrap');
  if(!el) return;
  const key = V.cp.rh.y;
  if(V.rhScroll && V.rhScroll.y === key) el.scrollLeft = V.rhScroll.x;
  else el.scrollLeft = (key === new Date().getFullYear()) ? el.scrollWidth : 0;
  el.onscroll = ()=>{ V.rhScroll = { y:key, x:el.scrollLeft }; };
}
/* all-time: one row per year, one cell per month, shade = workouts that month */
function rhythmAllHtml(){
  const first = rhythmFirst();
  if(!first) return `<div class="empty" style="padding:14px">${t('chartNoData')}</div>`;
  const now = new Date();
  if(first > now) first.setTime(now.getTime()); /* clock skew: never an empty table */
  const cnt = {}, dlm = {}; /* 'y-m' -> workouts / deload workouts */
  let total = 0;
  for(const h of S.history){
    if(h.arch) continue;
    const d = new Date(h.date), k = d.getFullYear()+'-'+d.getMonth();
    cnt[k] = (cnt[k]||0)+1; total++;
    if(h.dl) dlm[k] = (dlm[k]||0)+1;
  }
  const max = Math.max(1, ...Object.values(cnt));
  let rows = '';
  for(let y=first.getFullYear(); y<=now.getFullYear(); y++){
    let cells = '';
    for(let m=0; m<12; m++){
      const k = y+'-'+m, n = cnt[k]||0;
      const future = y===now.getFullYear() && m>now.getMonth();
      const before = y===first.getFullYear() && m<first.getMonth();
      if(future || before){ cells += `<i class="mc off"></i>`; continue; }
      const lvl = n ? Math.max(1, Math.ceil(n/max*4)) : 0;
      const dl = dlm[k] ? ' dl' : '';
      cells += `<i class="mc${lvl?' l'+lvl:''}${dl}"><span>${n||''}</span></i>`;
    }
    rows += `<div class="mrow"><span class="myr">${y}</span>${cells}</div>`;
  }
  const mons = Array.from({length:12},(_,i)=>`<span>${new Date(2000,i,1).toLocaleDateString(uiLocale(),{month:'narrow'})}</span>`).join('');
  return `<div class="mrow mhead"><span class="myr"></span>${mons}</div>${rows}
    <div class="ystats">${t('rhTotal',{n:total})} · ${t('rhSince',{d:first.toLocaleDateString(uiLocale(),{month:'short',year:'numeric'})})}</div>`;
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
/* best e1RM for one lift inside ONE session (Epley, TOTAL load), 0 when the lift
   is absent or only warmup/drop sets were logged. THE per-session formula: the
   lifetime series and the per-workout views must never disagree about a number. */
function sessionE1rm(w, k, nm){
  let v = 0;
  for(const e of w.exercises){
    if(!(e.k===k || (e.name && e.name.trim().toLowerCase()===nm))) continue;
    const work = e.sets.filter(s=>!s.warm && !s.drop && s.reps>0);
    if(!work.length) continue;
    const add = (isBwEx(e.k) ? (e.bw||0) : 0) + (e.mb||0);
    const mul = e.x2 ? 2 : 1;
    v = Math.max(v, ...work.map(s=>(s.weight*mul+add)*(1+s.reps/30)));
  }
  return v;
}
/* direction of a run of numbers: compare the first half against the last, with
   a 1.5% dead band so noise does not read as a trend. null = too few points. */
function seriesTrend(vals){
  if(vals.length < 4) return null;
  const half = Math.floor(vals.length/2);
  const a = vals.slice(0,half).reduce((x,y)=>x+y,0)/half;
  const b = vals.slice(-half).reduce((x,y)=>x+y,0)/half;
  if(a <= 0) return null;
  const pct = (b-a)/a*100;
  return pct > 1.5 ? 'up' : pct < -1.5 ? 'down' : 'flat';
}
function e1rmSeries(k){
  if(isTimeEx(k)) return [];
  const info = exInfo(k);
  const nm = (info?info.n:k).trim().toLowerCase();
  const pts = [];
  for(let i=S.history.length-1; i>=0; i--){
    const w = S.history[i];
    if(w.arch || w.dl) continue;
    /* ONE point per SESSION: a lift logged twice in a workout (top set + back-off
       slot, an added duplicate) must not count as two sessions - every window
       downstream (trend, stall, fatigue, ETA) is denominated in sessions */
    const v = sessionE1rm(w, k, nm);
    /* v=0 happens on bodyweight lifts logged before any body weight existed -
       an artifact, not form; letting it in fabricates trends and ETAs */
    if(v > 0) pts.push({ ts:new Date(w.date).getTime(), v });
  }
  return pts;
}
/* "where the lift is NOW" for the goal row and the ETA - the best of the
   current-form window, so the bar and the projected date agree on one number */
function currentE1rm(k){
  const rp = recentSeries(k);
  return rp.length ? Math.max(...rp.map(p=>p.v)) : 0;
}
/* the window a direction call may use: this training BLOCK, i.e. the newest
   points walking back until a real break (60+ days) - never across a layoff,
   whatever the session count. A lift nobody has trained in four months gets no
   window at all, so it shows no arrow and no projected date. */
function trendWindow(k){
  const all = e1rmSeries(k);
  if(!all.length) return [];
  if(Date.now() - all[all.length-1].ts > 120*864e5) return [];
  let start = all.length-1;
  while(start > 0 && all[start].ts - all[start-1].ts <= 60*864e5) start--;
  return all.slice(start);
}
/* passive stall detector: e1RM direction over the last ~6 sessions of a lift -
   rising means the training is working, flat/falling is the honest deload signal.
   Purely computed from history, never asks the user anything. */
function trendFor(k){
  /* CURRENT-FORM window (see trendWindow): after a layoff the pre-break
     sessions must not mix into the direction call, and a lift nobody trains
     any more gets no arrow at all */
  return seriesTrend(trendWindow(k).slice(-6).map(p=>p.v));
}
/* goal ETA: linear fit over the last <=10 sessions of e1RM; a date only comes
   back when there is enough data, the trend actually climbs and the answer
   lands within three years - anything else would be a guess, so show nothing */
function etaFor(k, goalKg){
  if(trendFor(k) !== 'up') return null; /* the date and the trend arrow must agree */
  const pts = trendWindow(k).slice(-10); /* same recency-gated window as the arrow */
  if(pts.length < 4) return null;
  /* a fit needs real calendar span - four sessions in one week (or one day)
     would extrapolate a slope of nonsense */
  if(pts[pts.length-1].ts - pts[0].ts < 14*864e5) return null;
  const n = pts.length;
  const mx = pts.reduce((a,p)=>a+p.ts,0)/n, my = pts.reduce((a,p)=>a+p.v,0)/n;
  let num = 0, den = 0;
  for(const p of pts){ num += (p.ts-mx)*(p.v-my); den += (p.ts-mx)*(p.ts-mx); }
  if(den <= 0) return null;
  const slope = num/den; /* kg per ms */
  const cur = currentE1rm(k) || pts[n-1].v; /* the same "now" the goal bar shows */
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
    /* goal line: target e1RM vs the CURRENT-FORM best - the bar and the ETA on
       the same row must agree on what "now" means; all-time is only the
       fallback when there is no recent data at all */
    const goal = (S.goals||{})[k];
    let goalHtml = '';
    if(goal>0 && !tm){
      /* no session in 90 days: the LAST session is "now", never the lifetime
         peak - otherwise a single old point ageing out would jump the bar */
      const all = e1rmSeries(k);
      const cur = currentE1rm(k) || (all.length ? all[all.length-1].v : 0);
      const pct = Math.min(100, Math.round(cur/goal*100));
      const done = cur >= goal;
      /* honest projection: only shows when the trend really climbs (see etaFor) */
      const eta = done ? null : etaFor(k, goal);
      const etaTxt = eta ? ` · ${t('goalEta',{d:eta.toLocaleDateString(uiLocale(),{year:'numeric',month:'short'})})}` : '';
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
    <div class="pvsub" style="margin-bottom:12px">${t('goalTitle')} (${t('metric1RM')})</div>
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


/* ======================= per-workout progress =======================
   The question the per-exercise views cannot answer: is THIS workout working.
   A lift can climb in Upper A while the same lift stalls in Upper B, and only
   one template's own session list shows that. Everything here filters history
   down to a single template, then reuses the lifetime machinery on top. */

/* sessions logged for one template, newest first. Matched by id, with the
   template NAME as a fallback so a workout that was re-created (new id, same
   name) keeps its history instead of restarting from zero. Deload passes are
   out by default - they are deliberately light and would fake a downtrend. */
function tplSessions(tplId, withDl){
  const tpl = S.templates.find(x=>x.id===tplId);
  const nm = tpl ? tpl.name.trim().toLowerCase() : null;
  return S.history.filter(w=>{
    if(w.arch) return false;
    if(w.dl && !withDl) return false;
    return w.tplId===tplId || (nm && (w.name||'').trim().toLowerCase()===nm);
  });
}
/* headline numbers for one template. avgGap is the real cadence: how many days
   actually pass between doing this workout, which is what tells you whether a
   "twice a week" plan is a plan or a wish. */
function tplProgStats(tplId){
  const ss = tplSessions(tplId);
  const n = ss.length;
  const out = { n, last:null, first:null, avgDur:0, avgVol:0, avgSets:0, avgGap:null, best:0 };
  if(!n) return out;
  out.last = ss[0].date;
  out.first = ss[n-1].date;
  const durs = ss.map(w=>w.dur||0).filter(d=>d>0);
  if(durs.length) out.avgDur = Math.round(durs.reduce((a,b)=>a+b,0)/durs.length);
  const vols = ss.map(w=>woVolume(w.exercises));
  out.avgVol = vols.reduce((a,b)=>a+b,0)/n;
  out.best = Math.max.apply(null, vols);
  out.avgSets = Math.round(ss.reduce((a,w)=>
    a + w.exercises.reduce((b,e)=>b+e.sets.filter(s=>!s.warm).length,0), 0)/n);
  if(n >= 2){
    const span = new Date(ss[0].date).getTime() - new Date(ss[n-1].date).getTime();
    out.avgGap = Math.round(span/(n-1)/864e5*10)/10;
  }
  return out;
}
/* volume of each session of this template, oldest -> newest, in {d,w} form for
   lineChartSVG. A LINE, not bars: session volumes sit in a narrow band (6229 to
   6636 is a real 6.5% climb) and zero-based bars would draw that as a flat wall,
   while truncating a bar axis to fix it would be a lie about length. */
function tplVolSeries(tplId, max){
  return tplSessions(tplId).slice(0, max||14).reverse()
    .map(w=>({ d: w.date, w: Math.round(kg2u(woVolume(w.exercises))) }));
}
/* one row per exercise this workout has actually trained (plus the ones planned
   but never logged), each with its progress INSIDE this workout only. */
function tplExRows(tplId){
  const ss = tplSessions(tplId);
  const tpl = S.templates.find(x=>x.id===tplId);
  const order = [];                       /* template order first, history after */
  const seen = new Set();
  const add = k => { if(k && !seen.has(k)){ seen.add(k); order.push(k); } };
  if(tpl) tpl.ex.forEach(e=>add(e.k));
  ss.forEach(w=>w.exercises.forEach(e=>add(e.k)));
  return order.map(k=>{
    const info = exInfo(k);
    const nm = (info?info.n:k).trim().toLowerCase();
    const tm = isTimeEx(k);
    const pts = [];                       /* oldest -> newest, within this workout */
    for(let i=ss.length-1; i>=0; i--){
      const w = ss[i];
      let v = 0;
      if(tm){
        for(const e of w.exercises){
          if(!(e.k===k || (e.name && e.name.trim().toLowerCase()===nm))) continue;
          for(const s of e.sets) if(!s.warm && !s.drop) v = Math.max(v, s.reps);
        }
      }else v = sessionE1rm(w, k, nm);
      if(v > 0) pts.push(v);
    }
    const n = pts.length;
    return { k, name: info ? info.n : k, tm, n,
             first: n ? pts[0] : 0,
             now:   n ? pts[n-1] : 0,
             best:  n ? Math.max.apply(null, pts) : 0,
             pts,
             trend: seriesTrend(pts.slice(-6)),
             planned: !!(tpl && tpl.ex.some(e=>e.k===k)) };
  });
}

/* ---- the screen: one template's own progress ---- */
function openWoProg(tplId, from){
  V.progTpl = tplId;
  V.progFrom = from || (V.screen==='woprog' ? V.progFrom : V.screen);
  closeModal();
  go('woprog');
}
function htmlWoProg(){
  const tpl = S.templates.find(x=>x.id===V.progTpl);
  if(!tpl){ V.screen='home'; return htmlHome(); }
  const st = tplProgStats(tpl.id);
  let h = '<div style="height:8px"></div>';
  if(!st.n){
    return h + `<div class="empty">${t('wpEmpty')}</div>
      <button class="btn primary" onclick="startWorkout('${tpl.id}')">${ACT_ICONS.play} ${t('pvStart')}</button>`;
  }
  /* 1. what this workout IS: how often, how long, how far apart */
  h += `<div class="statrow">
      <div class="stat"><div class="v">${st.n}</div><div class="l">${t('wpSessions')}</div></div>
      <div class="stat"><div class="v">${st.avgDur?fmtTime(st.avgDur):'—'}</div><div class="l">${t('wpAvgDur')}</div></div>
      <div class="stat"><div class="v">${st.avgGap!=null?fmtW(st.avgGap)+' d.':'—'}</div><div class="l">${t('wpEvery')}</div></div>
    </div>
    <div style="color:var(--ghost);font-size:12px;line-height:1.5;margin:6px 6px 0">
      ${t('wpSince',{d:fmtDate(st.first)})} · ${t('wpAvgVol',{v:Math.round(kg2u(st.avgVol)), u:unitL()})}</div>`;
  /* 2. is the work itself growing */
  h += `<div class="card" style="margin-top:16px">
      <div class="chead"><span class="ct">${t('wpVolPer')} (${unitL()})</span></div>
      ${lineChartSVG(tplVolSeries(tpl.id), unitL(), unitL())}
    </div>`;
  /* 3. the money view: every lift of this workout, measured INSIDE it */
  const withData = tplExRows(tpl.id).filter(r=>r.n>0);
  if(withData.length){
    h += `<h2 class="sec">${t('wpExTitle')}</h2>`;
    h += withData.map(r=>{
      const pct = (r.n>1 && r.first>0) ? Math.round((r.now-r.first)/r.first*1000)/10 : 0;
      const arrow = r.trend ? `<i class="wptr ${r.trend}">${r.trend==='up'?'▲':r.trend==='down'?'▼':'▬'}</i>` : '';
      const now = r.tm ? r.now+' s' : wu(Math.round(r.now*10)/10, true);
      const chg = r.n<2 ? `<i class="wpnew">${t('wpNew')}</i>`
        : `<i class="wpdlt ${pct>0?'up':pct<0?'down':''}">${pct>0?'+':''}${fmtW(pct)}%</i>`;
      return `<button class="wprow" onclick="openExFromTpl('${esc(r.k)}')">
        <span class="wpn">${esc(r.name)}${r.planned?'':`<i class="wpoff">${t('wpExtra')}</i>`}</span>
        <span class="wpsp">${sparkSVG(r.pts.slice(-12))}</span>
        <span class="wpv">${now} ${arrow}<br>${chg}</span>
      </button>`;
    }).join('');
    h += `<div style="color:var(--ghost);font-size:12px;line-height:1.5;margin:8px 6px 0">${t('wpExHint')}</div>`;
  }
  /* 4. the sessions themselves */
  h += `<h2 class="sec">${t('wpLog')}</h2>`;
  h += tplSessions(tpl.id).slice(0,12).map(w=>{
    const sets = w.exercises.reduce((a,e)=>a+e.sets.filter(s=>!s.warm).length,0);
    return `<div class="wplog">
      <span class="d">${fmtDate(w.date)}</span>
      <span class="m">${w.dur?fmtTime(w.dur):'—'} · ${sets} ${t('histSets')}</span>
      <span class="v">${Math.round(kg2u(woVolume(w.exercises)))} ${unitL()}</span>
    </div>`;
  }).join('');
  h += `<button class="btn primary" style="margin-top:16px" onclick="startWorkout('${tpl.id}')">${ACT_ICONS.play} ${t('pvStart')}</button>`;
  return h;
}
/* a lift opened from here lands on its detail already filtered to this workout */
function openExFromTpl(k){
  const tpl = S.templates.find(x=>x.id===V.progTpl);
  openExDetailByKey(k);
  if(tpl){
    V.exTplFilter = tpl.name;
    V.exDetailFrom = 'woprog';
  }
  render();
}

/* ---- program level: a whole folder as one training block ----
   Answers "how is THIS program going" without mixing in the program you ran
   before it, which is exactly what the lifetime charts cannot separate. */
/* every session that belongs to one program: its workouts by id, with the
   name fallback so a re-created workout stays in the block */
function folderSessions(fid){
  const tpls = S.templates.filter(x=>x.folderId===fid);
  const ids = new Set(tpls.map(x=>x.id));
  const names = new Set(tpls.map(x=>x.name.trim().toLowerCase()));
  return S.history.filter(w=>!w.arch && !w.dl &&
    (ids.has(w.tplId) || names.has((w.name||'').trim().toLowerCase())));
}
function folderProgStats(fid){
  const ss = folderSessions(fid);
  const n = ss.length;
  const out = { n, first:null, last:null, perWeek:null, weeks:0, vol:0, avgVol:0, avgDur:0 };
  if(!n) return out;
  out.last = ss[0].date;
  out.first = ss[n-1].date;
  out.vol = ss.reduce((a,w)=>a+woVolume(w.exercises), 0);
  out.avgVol = out.vol/n;
  const durs = ss.map(w=>w.dur||0).filter(d=>d>0);
  if(durs.length) out.avgDur = Math.round(durs.reduce((a,b)=>a+b,0)/durs.length);
  out.weeks = Math.round((new Date(out.last).getTime() - new Date(out.first).getTime())/(7*864e5)*10)/10;
  /* one session is not a rate; from two on, count the span it actually covered */
  if(out.weeks > 0.5) out.perWeek = Math.round(n/out.weeks*10)/10;
  return out;
}
/* every lift a program trained, with where it started and ended INSIDE that
   program. perWeek is the fair number between programs of different length:
   a 6-week block that added 5% and a 20-week one that added 8% did not move
   the lift equally fast. */
function folderLifts(fid){
  const ss = folderSessions(fid);
  const series = new Map();               /* k -> [{ts, v}] oldest -> newest */
  for(let i=ss.length-1; i>=0; i--){
    const w = ss[i];
    const seen = new Set();
    for(const e of w.exercises){
      if(seen.has(e.k) || isTimeEx(e.k)) continue;
      const v = sessionE1rm(w, e.k, exName(e.k).trim().toLowerCase());
      if(v <= 0) continue;
      seen.add(e.k);
      if(!series.has(e.k)) series.set(e.k, []);
      series.get(e.k).push({ ts:new Date(w.date).getTime(), v });
    }
  }
  const out = {};
  for(const [k, pts] of series){
    const n = pts.length, first = pts[0].v, last = pts[n-1].v;
    const weeks = n > 1 ? (pts[n-1].ts - pts[0].ts)/(7*864e5) : 0;
    const pct = first > 0 ? (last-first)/first*100 : 0;
    out[k] = { n, first, last, weeks, pct, perWeek: weeks >= 1 ? pct/weeks : null };
  }
  return out;
}
function folderProgHtml(fid){
  const st = folderProgStats(fid);
  if(!st.n) return '';
  return `<div class="statrow" style="margin-bottom:6px">
      <div class="stat"><div class="v">${st.n}</div><div class="l">${t('wpSessions')}</div></div>
      <div class="stat"><div class="v">${st.perWeek!=null?fmtW(st.perWeek):'—'}</div><div class="l">${t('fpPerWeek')}</div></div>
      <div class="stat"><div class="v" style="font-size:16px;padding-top:6px">${daysAgoStr(st.last)}</div><div class="l">${t('exLastDone')}</div></div>
    </div>
    <div style="color:var(--ghost);font-size:12px;line-height:1.5;margin:0 6px 12px">${t('wpSince',{d:fmtDate(st.first)})}</div>`;
}

/* ---- the screen: programs side by side ----
   One column per program that has sessions. The top block is the shape of each
   block (how long, how often, how heavy); the bottom is every lift that shows
   up in at least two of them, with its change per week in each - the one
   number that lets a 6-week block and a 20-week block answer the same
   question: which program moved this lift faster. */
function htmlProgCmp(){
  const cols = S.folders.map(f=>({ f, st:folderProgStats(f.id), lifts:folderLifts(f.id) }))
    .filter(c=>c.st.n>0);
  let h = '<div style="height:8px"></div>';
  if(cols.length < 2) return h + `<div class="empty">${t('cmpEmpty')}</div>`;
  const head = `<tr><th></th>${cols.map(c=>`<th>${esc(c.f.name)}</th>`).join('')}</tr>`;
  const row = (label, fn) => `<tr><td>${label}</td>${cols.map(c=>`<td>${fn(c)}</td>`).join('')}</tr>`;
  h += `<div class="card cmpwrap"><table class="cmptbl">${head}
    ${row(t('wpSessions'), c=>c.st.n)}
    ${row(t('cmpWeeks'), c=>c.st.weeks ? fmtW(c.st.weeks) : '—')}
    ${row(t('fpPerWeek'), c=>c.st.perWeek!=null ? fmtW(c.st.perWeek) : '—')}
    ${row(t('cmpAvgDur'), c=>c.st.avgDur ? fmtTime(c.st.avgDur) : '—')}
    ${row(t('cmpAvgVol')+' ('+unitL()+')', c=>Math.round(kg2u(c.st.avgVol)))}
  </table></div>`;
  /* lifts present in two or more programs, most-shared first */
  const count = {};
  cols.forEach(c=>Object.keys(c.lifts).forEach(k=>{ count[k]=(count[k]||0)+1; }));
  const shared = Object.keys(count).filter(k=>count[k]>=2)
    .sort((a,b)=>count[b]-count[a] || exName(a).localeCompare(exName(b)));
  h += `<h2 class="sec">${t('cmpLifts')}</h2>`;
  if(!shared.length) return h + `<div class="empty">${t('cmpNoShared')}</div>`;
  const cell = L => {
    if(!L) return '<span class="cmpna">—</span>';
    const dl = L.pct > 0.05 ? 'up' : L.pct < -0.05 ? 'down' : '';
    const rate = L.perWeek!=null ? `<i class="cmprate ${dl}">${L.perWeek>0?'+':''}${fmtW(Math.round(L.perWeek*100)/100)}%/wk</i>` : `<i class="cmprate">${t('wpNew')}</i>`;
    return `<b>${fmtW(Math.round(kg2u(L.first)))} → ${fmtW(Math.round(kg2u(L.last)))}</b><br>${rate}`;
  };
  h += `<div class="card cmpwrap"><table class="cmptbl lifts">${head}
    ${shared.map(k=>row(esc(exName(k)), c=>cell(c.lifts[k]))).join('')}
  </table></div>
  <div style="color:var(--ghost);font-size:12px;line-height:1.5;margin:8px 6px 0">${t('cmpLiftHint')}</div>`;
  return h;
}
