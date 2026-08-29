/* ============================================================
   The active session: building exercises from a template, ghost values
   (previous session, rescaled to today's machine base), set logging with
   win/loss coloring, warmup ramp, drop sets, supersets, swaps with
   per-variant stashes, double-progression offers, the 4-week wave, comeback
   easing after a layoff (cbFactor/sugW), rest timer, the +/- steppers above
   the keyboard, and finishWorkout() which turns it all into a history entry
   (plus the no-PR mastery fact for the summary).
   Key invariant: set weights in inputs are display-unit strings; history
   stores kg. Machine-base exercises store ADDED load only (entry.mb keeps
   the base); bodyweight exercises store added load too (entry.bw).
   ============================================================ */
'use strict';

/* ======================= WORKOUT ======================= */
function latestBw(){ return S.weights.length ? S.weights[0].kg : null; }
/* machine starting weight for an exercise KEY - the base belongs to the machine,
   not the template slot, so it follows the exercise everywhere (alternatives,
   session additions, other templates). Priority: the remembered per-machine value
   (0 = switched off on purpose), then the template slot, then the newest history
   entry that logged a base for this machine. */
function resolveBase(k, tplBase){
  const m = (S.mbase||{})[k];
  if(typeof m==='number') return m>0 ? m : 0;
  if(typeof tplBase==='number' && tplBase>0) return tplBase;
  for(const h of S.history){
    if(h.arch) continue;
    for(const e of h.exercises) if(e.k===k && e.mb>0) return e.mb;
  }
  return 0;
}
/* ghost weight rescaled to TODAY's base: history stores plates-only relative to
   the base of ITS session, so when the base changed (or old entries logged the
   full load with no base) the shown/prefilled value keeps the same total. */
function ghostW(ex, g){
  const d = ((ex.last && ex.last.mb) || 0) - (ex.base || 0);
  return d ? Math.max(0, g.weight + d) : g.weight;
}
function newSet(extra){ return Object.assign({ w:'', r:'', warm:false, drop:false, fail:false, done:false, cls:'' }, extra||{}); }
function buildActiveEx(k, name, sets, reps, ss, tplId, alts, pnote, rt, x2, teId, base, dp){
  const last = lastForExercise(k, name, tplId);
  const ex = { id:uid(), k, name, targetSets:sets, targetReps:reps, note:'', ss:!!ss, last,
    baseK:k, alts:(alts||[]).slice(), stash:{}, tplId:tplId||null,
    pnote:pnote||'', notePerm:false, prevOrder:(last && last.order) ? last.order : 0,
    sets: Array.from({length:sets}, ()=>newSet()) };
  if(typeof rt==='number' && rt>=15) ex.rt = Math.min(1800, Math.round(rt));
  if(x2) ex.x2 = true; /* pair of dumbbells: inputs are one-hand, totals count both */
  if(teId) ex.teId = teId; /* which template slot this card belongs to - survives duplicate keys */
  const rb = resolveBase(k, base); /* machine starting weight, kg - per machine, not per slot */
  if(rb>0) ex.base = Math.min(500, rb);
  if(typeof dp==='number' && dp>0) ex.dp = Math.min(10, dp); /* double-progression step, kg */
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
  ex.stash[ex.k] = { name:ex.name, note:ex.note, last:ex.last, sets:ex.sets, bw:ex.bw, base:ex.base };
  if(ex.stash[toKey]){
    const v = ex.stash[toKey];
    ex.name=v.name; ex.note=v.note; ex.last=v.last; ex.sets=v.sets; ex.bw=v.bw;
    if(v.base>0) ex.base = v.base; else delete ex.base;
    delete ex.stash[toKey];
  }else{
    ex.name = exName(toKey);
    ex.note = '';
    ex.last = lastForExercise(toKey, ex.name, ex.tplId);
    ex.sets = Array.from({length:ex.targetSets}, ()=>newSet());
    ex.bw = isBwEx(toKey) ? (latestBw()!=null?latestBw():(ex.last&&ex.last.bw!=null?ex.last.bw:null)) : undefined;
    /* each machine keeps its own starting weight - never inherit the old variant's */
    const te = tplEntryFor(ex);
    const b = resolveBase(toKey, (te && te.k===toKey) ? te.base : 0);
    if(b>0) ex.base = b; else delete ex.base;
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
    return `<div class="swapitem swaprow ${on?'on':''}">
      <button class="swapmain" onclick="swapExercise(${xi},'${esc(k)}');closeModal()">
        <span class="sn">${esc(exName(k))}${isBase?` <span class="basetag">${t('swapPlanned')}</span>`:''}</span>
        ${on?`<span class="chk">${ACT_ICONS.chevron}</span>`:''}
      </button>
      ${isBase?'':`<button class="pinbtn" onclick="makeMainExercise(${xi},'${esc(k)}')" aria-label="${t('swapMakeMain')}">${ACT_ICONS.pin}<span>${t('swapMakeMain')}</span></button>`}
    </div>`;
  }).join('');
  openModal(`<h3>${t('swapTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="swaplist">${items}</div>
    <button class="btn ghostbtn" style="margin-top:10px" onclick="addAltExercise(${xi})">${t('swapAdd')}</button>`);
}
/* promote an alternative to be this slot's MAIN exercise - the template updates too:
   the old main becomes one of the alternatives (nothing is lost, roles just flip) */
function makeMainExercise(xi, key){
  const ex = S.active.exercises[xi];
  if(!ex || key===ex.baseK) return;
  const oldBase = ex.baseK;
  {
    const te = tplEntryFor(ex);
    if(te){
      te.k = key;
      if(te.n) delete te.n; /* custom label belonged to the old exercise */
      te.alts = (te.alts||[]).filter(a=>a!==key);
      if(!te.alts.includes(oldBase)) te.alts.push(oldBase);
      const L = lvlsOf(te); /* on a ladder this rewrites the CURRENT level's movement */
      if(L && L[te.lvl||0]){ L[te.lvl||0].k = key; delete L[te.lvl||0].n; }
    }
  }
  ex.baseK = key;
  ex.alts = ex.alts.filter(a=>a!==key);
  if(!ex.alts.includes(oldBase)) ex.alts.push(oldBase);
  save(); render();
  openSwapMenu(xi); /* refresh the sheet - the Planned tag moves to the new main */
  toast(t('swapMainDone',{n:exName(key)}));
}
function addAltExercise(xi){
  openPicker(info=>{
    const ex = S.active.exercises[xi];
    if(!ex){ closeModal(); return; }
    /* remember this alternative on the template exercise too, so it stays an option;
       tplEntryFor disambiguates duplicate slots of the same lift via teId */
    const te = tplEntryFor(ex);
    if(te){ if(!te.alts) te.alts=[]; if(info.id!==te.k && !te.alts.includes(info.id)) te.alts.push(info.id); }
    closeModal();
    swapExercise(xi, info.id);
  });
}
/* per-exercise action menu - keeps the exercise header uncluttered */
/* ===== progression ladder in-session: the L-chip opens this sheet =====
   Tap any level to move there NOW (down when today is not happening, up when
   it is too easy) - the template remembers, next session starts on that level. */
function openLvlSheet(xi){
  const ex = S.active.exercises[xi];
  const te = (ex && !ex.adhoc) ? tplEntryFor(ex) : null;
  const L = lvlsOf(te);
  if(!L) return;
  const cur = te.lvl||0;
  const items = L.map((v,i)=>`<div class="swapitem swaprow ${i===cur?'on':''}">
    <button class="swapmain" onclick="lvlGo(${xi},${i});closeModal()">
      <span class="sn">L${i+1} · ${esc(exName(v.k,v.n))} <span class="basetag">${v.s}×${v.r}${isTimeEx(v.k)?' s':''}</span></span>
      ${i===cur?`<span class="chk">${ACT_ICONS.chevron}</span>`:''}
    </button></div>`).join('');
  openModal(`<h3>${t('lvlSheetTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:13px;line-height:1.5;margin:0 4px 10px">${te.lvlN?t('lvlStreak',{n:te.lvlN}):t('lvlHint')}</div>
    <div class="swaplist">${items}</div>`);
}
function lvlGo(xi, li){
  const ex = S.active.exercises[xi];
  const te = (ex && !ex.adhoc) ? tplEntryFor(ex) : null;
  const L = lvlsOf(te);
  if(!L || !L[li] || li===(te.lvl||0)) return;
  lvlApply(te, li);
  ex.targetSets = te.s; ex.targetReps = te.r;
  ex.baseK = te.k;                    /* the new level IS the plan - no "back to" bar */
  ex.alts = (te.alts||[]).slice();
  if(te.k !== ex.k){
    swapExercise(xi, te.k);           /* stash keeps anything already logged on the old level */
  } else if(!ex.sets.some(s=>s.done)){
    ex.sets = Array.from({length:ex.targetSets}, ()=>newSet());
  }
  ex.name = exName(te.k, te.n);       /* level label, e.g. "Hollow Hold (tuck)" */
  updateExDone(ex);
  save(); render();
  toast(t('lvlSetToast',{n:'L'+(li+1)+' · '+ex.name}));
}
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
      ${item(ex.dropUi?'on':'', 'D+', t('dropTog'), `toggleDropUi(${xi})`)}
      ${isTimeEx(ex.k)?'':item(S.waves[ex.k]?'on':'', '∿', t('waveMode'), `openWaveModal('${esc(ex.k)}')`)}
      ${notLast?item(ex.ss?'on':'', ACT_ICONS.link, t('superset'), `toggleWoSS(${xi})`):''}
      ${item('danger', ACT_ICONS.x, t('woDelExBtn'), `removeWorkoutEx(${xi})`)}
    </div>`);
}
function onBwInput(xi,v){
  const ex = S.active.exercises[xi];
  const n = parseNum(v);
  ex.bw = isNaN(n) ? null : u2kg(n);
  saveSoon();
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
  saveSoon();
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
  /* prefer the last session of the SAME workout - exercise order/fatigue context matters.
     Deload sessions are skipped, so after a deload the ghosts return to real loads. */
  if(tplId){
    for(const h of S.history){
      if(h.arch || h.dl || h.tplId!==tplId) continue;
      for(const e of h.exercises){
        if(match(e)) return { date:h.date, sets:e.sets, note:e.note||'', bw:e.bw, mb:e.mb||0, order:e.order||0, sameTpl:true };
      }
    }
  }
  /* fallback: any workout that had this exercise (marked as approximate in the UI) */
  for(const h of S.history){
    if(h.arch || h.dl) continue;
    for(const e of h.exercises){
      if(match(e)) return { date:h.date, sets:e.sets, note:e.note||'', bw:e.bw, mb:e.mb||0, order:e.order||0, sameTpl:false };
    }
  }
  return null;
}
/* quick "what's today" preview - tapping a workout on Home shows the plan first;
   the workout only starts from the button here (or the play button in Programs) */
function openWoPreview(id){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  const last = S.history.find(x=>x.tplId===id && !x.arch);
  const dlDue = dlForTpl(id);
  const rows = d.ex.map((e,i)=>`<div class="pvrow">
    <span class="pvnum">${i+1}</span>
    <span class="pvname">${esc(exName(e.k,e.n))}${e.ss && i<d.ex.length-1?` <span class="ssic">${ACT_ICONS.link}</span>`:''}</span>
    <span class="pvsr">${e.s}×${e.r}${isTimeEx(e.k)?' s':''}</span>
  </div>`).join('');
  openModal(`<h3>${esc(d.name)}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="pvsub">${last?daysAgoStr(last.date)+' '+fmtClock(last.date):t('never')} · ${t('tplExCount',{n:d.ex.length})}${dlDue?` · <span class="pvdl">${t('dlBadge')}</span>`:''}</div>
    <div class="pvlist">${rows || `<div class="empty" style="padding:14px">—</div>`}</div>
    <button class="btn primary" style="margin-top:14px" onclick="closeModal();startWorkout('${d.id}')">${ACT_ICONS.play} ${t('pvStart')}</button>`);
}
function startWorkout(tplId){
  const tpl = S.templates.find(d=>d.id===tplId);
  if(!tpl) return;
  if(S.active){
    if(!confirm(t('woSwitchConfirm'))) return;
  }
  /* on a deload pass with "half sets" picked, plan half the sets (min 1 per exercise) */
  const isDl = dlForTpl(tpl.id);
  const dlv = isDl ? ((dlActive()||{}).vol || 1) : 1;
  const dls = n => Math.max(1, Math.ceil(n*dlv));
  S.active = {
    tplId: tpl.id, name: tpl.name, startedAt: new Date().toISOString(), rest:null,
    dl: isDl ? 1 : 0, /* pinned at start: starting or ending a deload mid-session must not re-label THIS session */
    exercises: tpl.ex.map(e => buildActiveEx(e.k, exName(e.k,e.n), dls(e.s), e.r, e.ss, tpl.id, e.alts, e.pnote, e.rt, e.x2, e.id, e.base, e.dp))
  };
  /* one-shot ghosts: extra exercises logged LAST session of this template that are
     not part of it - shown faded at the bottom; ignored once, they vanish (they
     only exist because last session had them), pinned in they become permanent */
  const lastW = S.history.find(h=>h.tplId===tpl.id && !h.arch);
  if(lastW){
    const known = new Set();
    tpl.ex.forEach(e=>{ known.add(e.k); (e.alts||[]).forEach(a=>known.add(a)); });
    const ghostSeen = new Set();
    /* force = the entry was a standalone addition (adhoc): it ghosts even when its
       key overlaps a template exercise or alternative - duplicates are deliberate */
    const addGhost = (k, name, sets, reps, x2, force, base)=>{
      if(!k || ghostSeen.has(k)) return;
      if(!force){
        if(known.has(k)) return;
        if(S.active.exercises.some(x=>x.k===k)) return;
      }
      ghostSeen.add(k);
      const gx = buildActiveEx(k, name, sets, reps, false, tpl.id, [], '', undefined, x2, undefined, base);
      gx.ghost = true; gx.adhoc = true;
      S.active.exercises.push(gx);
    };
    /* extras that were LOGGED last session */
    for(const e of lastW.exercises){
      if(!e.sets.length) continue;
      addGhost(e.k, e.name,
        Math.max(1, Math.min(12, e.sets.filter(s=>!s.warm && !s.drop).length || e.sets.length)),
        String(e.targetReps||'10'), !!e.x2, !!e.adhoc, e.mb);
    }
    /* extras that were ADDED last session but never logged - adhoc by definition */
    if(Array.isArray(lastW.sug)) for(const g of lastW.sug){
      addGhost(g.k, g.n || exName(g.k), Math.max(1, Math.min(12, g.s|0 || 3)), String(g.r||'10'), !!g.x2, true, g.mb);
    }
  }
  save();
  go('workout');
}
/* is the CURRENT session a deload pass? Pinned when the workout started, so
   starting or ending a deload from Home mid-session never re-labels a session
   that was already lifted at full (or at reduced) load. Older sessions resumed
   with Continue have no pin - fall back to the live cycle for those. */
function woIsDeload(){
  if(!S.active) return false;
  return S.active.dl != null ? !!S.active.dl : dlForTpl(S.active.tplId);
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
/* ===== comeback easing: after a long gap on a lift the SUGGESTED weights come
   back a notch lower and ramp up by themselves (each comeback session becomes
   the new "last", so the factor decays session by session).
   Numbers follow the detraining evidence for trained lifters: 1RM is largely
   kept ~3 weeks (Hwang 2017, Ogasawara 2013), ~5-10% gone by 6-8 weeks
   (Encarnacao 2022), more later (Halonen 2024) - and the reload sits a notch
   below what was lost because connective tissue re-adapts slower than muscle
   and load spikes after low-load periods are the injury window (Gabbett 2016). */
function cbFactor(ex){
  if(!ex || !ex.last) return 1;
  /* ex.last skips deload sessions, so measure the gap from the last time the
     lift was TRAINED at all (deload passes included) - a deload week is not a
     layoff and must not earn a second reduction on top of itself */
  const d = (Date.now() - lastTrainedTs(ex.k, ex.last.date))/864e5;
  return d<10 ? 1 : d<14 ? .95 : d<21 ? .9 : d<28 ? .85 : d<56 ? .75 : d<84 ? .65 : d<180 ? .55 : .5;
}
function lastTrainedTs(k, fallbackIso){
  for(const h of S.history){
    if(h.arch) continue;
    if(h.exercises.some(e=>e.k===k && e.sets.some(s=>!s.warm))) return new Date(h.date).getTime();
  }
  return new Date(fallbackIso).getTime();
}
function cbW(ex, kg){ return scaleLoad(kg, cbFactor(ex)); } /* assisted (negative) loads pass through, like dlW */
/* the one place that decides what a ghost SUGGESTS: deload scaling wins
   (it is deliberate and temporary), otherwise comeback easing applies */
function sugW(ex, isWarm, gkg){
  const dl = woIsDeload();
  if(dl) return isWarm ? gkg : dlW(gkg);
  return cbW(ex, gkg);
}
/* ===== quiet mastery fact for no-PR days: the strongest true statement history
   supports - "best e1RM on X in N weeks". Called BEFORE today's entry lands in
   history, so "history" means every session except today. Gaps under 6 weeks are
   recency noise, not mastery; the biggest gap (or an all-time e1RM best, which
   the top-weight PR check can miss) wins. One fact, zero input. ===== */
function masteryFact(exercises){
  const MIN_GAP = 42*864e5;
  let best = null; /* { name, gap } - gap Infinity = all-time */
  for(const e of exercises){
    if(isTimeEx(e.k)) continue;
    const work = e.sets.filter(s=>!s.warm && !s.drop && s.reps>0);
    if(!work.length) continue;
    const add = (isBwEx(e.k) ? (e.bw||0) : 0) + (e.mb||0);
    const mul = e.x2 ? 2 : 1;
    const today = Math.max(...work.map(s=>(s.weight*mul+add)*(1+s.reps/30)));
    if(today <= 0) continue;
    const pts = e1rmSeries(e.k);
    if(pts.length < 4) continue; /* young lifts: every session is a "best" - not a fact */
    let lastBeat = null; /* newest session that already matched today (0.25% noise band) */
    for(let i=pts.length-1; i>=0; i--){ if(pts[i].v >= today*0.9975){ lastBeat = pts[i].ts; break; } }
    const gap = lastBeat==null ? Infinity : Date.now()-lastBeat;
    if(gap >= MIN_GAP && (!best || gap > best.gap)) best = { name:e.name, gap };
  }
  if(!best) return null;
  const wks = Math.round(best.gap/(7*864e5));
  return best.gap===Infinity ? t('mfEver',{n:best.name})
       : wks > 12 ? t('mfMo',{n:best.name, m:Math.round(wks/4.345)})
       : t('mfWks',{n:best.name, w:wks});
}
/* ===== 4-week wave (the stage after linear progress stalls) =====
   Fixed weekly prescription off a base weight: A base x5, B +step x4,
   C +2 steps x3, D base x6 - then the next round starts one step higher.
   State lives in S.waves[k] = { base, step (kg), idx 0-3, startBest (e1RM kg
   at start), started (ts), rounds } and advances once per finished session
   that logged working sets on that lift.

   The wave ENDS ITSELF (wave blocks are 3-6 weeks in practice, never open-
   ended - and 5/3/1-style cycling progresses only until the milestone is
   hit or missed): at each round wrap it checks
   - WIN: a session during the wave beat the pre-wave all-time e1RM best
     (week D's base x6 is exactly that attempt) -> back to normal progression;
   - FLAT: 3 full rounds without a new best -> stop, deload or change the lift. */
function waveTarget(wv){
  const p = [[0,5],[1,4],[2,3],[0,6]][wv.idx];
  return { w: Math.round((wv.base + p[0]*wv.step)*100)/100, r: p[1] };
}
/* week-A start suggestion: ~85.5% of the best recent e1RM, rounded to the
   plate step - a five with a rep or two in reserve (5 @ 1-2 RIR sits around
   80-86% 1RM in every load chart), which week D turns into a six = the
   new-best attempt. Needs a few sessions of data to dare an answer. */
function waveRecommend(k){
  /* current-form window only: after a cut or a long break the suggestion must
     reflect what the lifter lifts NOW, not the pre-break peak */
  const pts = recentSeries(k).slice(-5);
  if(pts.length < 3) return 0;
  let best = pts[0];
  for(const p of pts) if(p.v > best.v) best = p;
  /* e1RM is TOTAL load; the wave base lives in the ADDED-load column (what the
     user types), so the body weight / machine base of THAT session comes back
     off - taking it from any other session would shift the suggestion */
  const add = addedBaseAt(k, best.ts);
  const su = stepU();
  const u = Math.round(kg2u(best.v*0.855 - add)/su)*su;
  return u > 0 ? u2kg(u) : 0;
}
/* body weight / machine base recorded for a lift in the session at ts (or the
   newest one before it) - matched the same way e1rmSeries matches entries */
function addedBaseAt(k, ts){
  const info = exInfo(k);
  const nm = (info?info.n:k).trim().toLowerCase();
  for(const h of S.history){
    if(h.arch || h.dl) continue;
    if(ts && new Date(h.date).getTime() > ts) continue;
    for(const e of h.exercises)
      if(e.k===k || (e.name && e.name.trim().toLowerCase()===nm))
        return (isBwEx(k) ? (e.bw||0) : 0) + (e.mb||0);
  }
  return 0;
}
/* end-of-round verdict: 'win' (new best during the wave), 'flat' (3 rounds
   without one), or null = keep going. startBest 0 = unknown, never auto-wins. */
function waveVerdict(k, wv){
  if(wv.startBest > 0){
    const since = e1rmSeries(k).filter(p=>p.ts >= (wv.started||0));
    if(since.length && Math.max(...since.map(p=>p.v)) > wv.startBest*1.005) return 'win';
  }
  return (wv.rounds||0) >= 3 ? 'flat' : null;
}
/* fill this session's empty working sets with the week's prescription */
function applyWave(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  const wv = S.waves[ex.k];
  if(!wv) return;
  const wt = waveTarget(wv);
  ex.sets.forEach(s=>{
    if(s.done || s.warm || s.drop) return;
    if(!s.w) s.w = fmtW(kg2u(wt.w));
    if(!s.r) s.r = String(wt.r);
  });
  save(); render();
}
/* top working-set weight of the lift's latest session (same scale the user types) */
function lastTopW(k){
  for(const h of S.history){
    if(h.arch || h.dl) continue;
    for(const e of h.exercises){
      if(e.k!==k) continue;
      const work = e.sets.filter(s=>!s.warm && !s.drop);
      if(work.length) return Math.max(...work.map(s=>s.weight));
    }
  }
  return 0;
}
function openWaveModal(k){
  const wv = S.waves[k];
  /* step defaults to the lift's progression step from any template, else one plate pair */
  let dp = 0;
  for(const tp of S.templates){ const e = tp.ex.find(x=>x.k===k && x.dp); if(e){ dp = e.dp; break; } }
  V.waveStep = wv ? wv.step : (dp || dpSteps()[1]);
  /* prefill: an active wave shows its own base; a new one auto-fills the
     e1RM-derived suggestion and falls back to the last top set */
  const rec = wv ? 0 : waveRecommend(k);
  const base = wv ? wv.base : (rec || lastTopW(k));
  const recLine = rec ? `<div style="font-size:12px;color:var(--accent-soft);font-weight:600;margin:6px 2px 0">${t('waveRecFrom',{w:wu(rec,true)})}</div>` : '';
  openModal(`<h3>${esc(exName(k))}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="pvsub" style="margin-bottom:10px">${t('waveTitle')}${wv?` · W${wv.idx+1} · R${(wv.rounds||0)+1}`:''}</div>
    <div style="font-size:13px;color:var(--dim);line-height:1.5;margin:0 2px 10px">${t('waveHint')}</div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin:0 2px 14px">${t('waveEndHint')}</div>
    <div class="ctlrow">
      <span class="clbl wide">${t('waveBase')}</span>
      <input id="wave-base" type="text" inputmode="decimal" class="nameinput" style="width:110px;text-align:center;font-weight:700"
        value="${base?esc(fmtW(kg2u(base))):''}" placeholder="0" onfocus="this.select()">
      <span style="font-weight:700;color:var(--dim)">${unitL()}</span>
    </div>
    ${recLine}
    <div class="ctlrow" id="wave-steps"></div>
    <button class="btn primary" style="margin-top:14px" onclick="saveWave('${k}')">${ACT_ICONS.check} ${wv?t('saveDone'):t('waveStart')}</button>
    ${wv?`<button class="btn danger" onclick="stopWave('${k}')">${t('waveStop')}</button>`:''}`);
  renderWaveSteps();
  setTimeout(()=>{ const i=$('#wave-base'); if(i && !wv) i.focus(); }, 60);
}
function renderWaveSteps(){
  const el = $('#wave-steps');
  if(!el) return;
  el.innerHTML = `<span class="clbl wide">${t('waveStep')}</span>` +
    dpSteps().map(v=>`<button class="rangetog ${Math.abs(V.waveStep-v)<.01?'acc':''}"
      onclick="V.waveStep=${v}; renderWaveSteps()">+${fmtW(kg2u(v))}</button>`).join('');
}
function saveWave(k){
  const v = parseNum(($('#wave-base')||{}).value);
  const kg = (!isNaN(v) && v>0) ? Math.min(500, Math.round(u2kg(v)*100)/100) : 0;
  if(!kg){ toast(t('warmNeedW')); return; }
  const prev = S.waves[k];
  /* the WIN bar is the CURRENT-FORM best (recent window), not the lifetime
     record - during a cut or a comeback the wave should reward beating who
     you are now. Editing an active wave keeps its history intact. */
  const series = recentSeries(k);
  S.waves[k] = {
    base:kg, step:Math.round(V.waveStep*1000)/1000,
    idx: prev ? prev.idx : 0,
    startBest: prev ? prev.startBest : (series.length ? Math.max(...series.map(p=>p.v)) : 0),
    started: prev ? prev.started : Date.now(),
    rounds: prev ? (prev.rounds||0) : 0
  };
  delete S.stallSnooze[k];
  save(); closeModal(); render(); scheduleCloudSync();
  toast(t('waveOn'));
}
function stopWave(k){
  delete S.waves[k];
  save(); closeModal(); render(); scheduleCloudSync();
  toast(t('waveOff'));
}

/* ===== double progression (opt-in per exercise): when LAST session's working
   sets all reached the top of the rep range, offer +step on today's weights ===== */
function dpDue(ex){
  if(!ex.dp || isTimeEx(ex.k)) return false;
  if(S.waves[ex.k]) return false;                          /* the wave owns this lift now */
  if(woIsDeload()) return false;                            /* not on a deload pass */
  if(cbFactor(ex) < 1) return false;                       /* never offer +weight right after a break */
  if(ex.sets.some(s=>s.done || s.w)) return false;         /* already lifting / typed */
  if(!ex.last || !ex.last.sameTpl) return false;           /* borrowed values don't count */
  const p = repsParse(ex.targetReps);
  const top = p.range ? p.hi : p.lo;
  const work = ex.last.sets.filter(s=>!s.warm && !s.drop);
  return work.length > 0 && work.every(s=>s.reps >= top);
}
/* fill every empty working-set weight with its previous load + the step */
function applyDp(xi){
  const ex = S.active.exercises[xi];
  if(!ex || !ex.dp) return;
  let carry = null; /* sets beyond last session's count reuse the previous suggestion */
  ex.sets.forEach((s,si)=>{
    if(s.done || s.warm || s.drop || s.w) return;
    const g = ghostFor(ex,si);
    const w = g ? ghostW(ex,g) + ex.dp : carry;
    if(w==null) return;
    carry = w;
    s.w = fmtW(kg2u(w));
  });
  save(); render();
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
  const dl = woIsDeload();
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
    /* ghost suggestion: an extra exercise from LAST session, faded and inert -
       tap to bring it into today's workout, ignore it and it's gone next time */
    if(ex.ghost) return `<div class="card ghostex">
      <div class="ginfo" onclick="activateGhost(${xi})">
        <div class="gname">+ ${esc(ex.name)}</div>
        <div class="gsub">${t('ghostExHint')}</div>
      </div>
      <button class="gx" onclick="dismissGhostEx(${xi})" aria-label="dismiss">✕</button>
    </div>`;
    const tm = isTimeEx(ex.k), bw = isBwEx(ex.k);
    /* progression ladder chip: current level, taps open the level sheet */
    const lte = (!ex.adhoc && ex.tplId) ? tplEntryFor(ex) : null;
    const lvlL = lvlsOf(lte);
    const firstNotDone = ex.sets.findIndex(s=>!s.done); /* -1 = all done */
    const wcol = bw ? t('woAddCol') : unitL();
    /* pair-of-dumbbells toggle lives right in the column header - one tap, no menus */
    const equip = (exInfo(ex.k)||{}).e;
    const x2chip = (!bw && !tm && equip==='dumbbell')
      ? ` <button class="x2chip${isX2(ex)?' on':''}" onclick="toggleX2(${xi})" aria-label="${t('x2Label')}">×2</button>` : '';
    /* machine starting weight: enter it once, then log only the plates YOU add */
    const baseChip = (!bw && !tm && (equip==='machine' || equip==='cable'))
      ? ` <button class="x2chip${ex.base?' on':''}" onclick="openBaseEdit(${xi})" aria-label="${t('baseLabel')}">+${ex.base?fmtW(kg2u(ex.base)):unitL()}</button>` : '';
    /* the D column exists only while it's needed (D+ enabled or drop rows present) -
       otherwise the grid is 5 columns and the check button sits flush at the edge */
    const dropCol = !!ex.dropUi || ex.sets.some(s=>s.drop);
    const gcls = dropCol ? 'setgrid' : 'setgrid nod';
    const hdr = `<div class="${gcls} hdr"><div>${t('woSet')}</div><div>${t('woPrev')}</div>
      <div>${wcol}${x2chip}${baseChip}</div><div>${tm?t('woSec'):t('woReps')}</div><div>${ACT_ICONS.check}</div>${dropCol?'<div></div>':''}</div>`;
    let workNum = 0;
    const approx = ex.last && !ex.last.sameTpl ? '* ' : ''; /* values borrowed from another workout */
    const rows = ex.sets.map((s,si)=>{
      const g = ghostFor(ex,si);
      const prevTxt = g ? approx + ghostText({ weight:ghostW(ex,g), reps:g.reps }, tm, bw) : '—';
      if(!s.warm && !s.drop) workNum++;
      const label = s.warm ? 'W' : s.drop ? 'D' : s.fail ? 'F' : String(workNum);
      const chkCls = (s.done ? (s.cls==='loss' ? 'loss' : 'done') : '')
                   + (V.lastDone===xi+'-'+si ? ' pop' : '');
      const restHere = S.active.rest && S.active.rest.key===xi+'-'+si;
      /* D+ hidden by default (small target, easy to fat-finger) - the exercise menu
         turns it on per block; an existing drop row always keeps its remove button */
      const rowBtn = !dropCol ? ''
        : s.drop ? `<button class="dropbtn del" onclick="removeDrop(${xi},${si})">✕</button>`
        : ex.dropUi ? `<button class="dropbtn" onclick="addDrop(${xi},${si})">D+</button>`
        : '<div></div>';
      const wph = g ? wu(sugW(ex, s.warm, ghostW(ex,g))) : (bw ? '+' : unitL());
      const isCur = si === firstNotDone;                          /* the set to do now */
      const isLocked = firstNotDone!==-1 && !s.done && !isCur;    /* later sets: ✓ waits its turn */
      /* the rest bar is a SIBLING of the row, not a child - otherwise the done
         row's green background stretches around the timer and the row looks
         inflated. It still anchors visually right under the set it follows. */
      return `<div class="setrow-wrap ${s.done?'done':''} ${s.drop?'droprow':''} ${isLocked?'locked':''}">
        <div class="${gcls}">
          <button class="setnum ${s.warm?'warm':''} ${s.drop?'dropn':''} ${s.fail?'failn':''}" onclick="toggleWarm(${xi},${si})">${label}</button>
          <div class="prev">${prevTxt}</div>
          <input type="text" inputmode="decimal" id="w-${xi}-${si}" placeholder="${wph}" value="${esc(s.w)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'w',this.value)">
          <input type="text" inputmode="numeric" id="r-${xi}-${si}" placeholder="${g?g.reps:(tm?'s':'×')}" value="${esc(s.r)}"
            ${s.done?'disabled':''} oninput="onSetInput(${xi},${si},'r',this.value)">
          <button class="checkbtn ${chkCls}${isCur?' cur':''}" onclick="toggleSet(${xi},${si})">${ACT_ICONS.check}</button>
          ${rowBtn}
        </div>
      </div>${restHere ? restBarHtml() : ''}`;
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
        ${(!tm && !dl && S.waves[ex.k] && !exFullyDone(ex))?(w=>{const wt=waveTarget(w);
          return `<button class="dpchip" onclick="applyWave(${xi})" title="${t('waveChipHint')}">W${w.idx+1} ${fmtW(kg2u(wt.w))}×${wt.r}</button>`;})(S.waves[ex.k]):''}
        ${dpDue(ex)?`<button class="dpchip" onclick="applyDp(${xi})" title="${t('dpChipHint')}">+${fmtW(kg2u(ex.dp))}</button>`:''}
        ${lvlL?`<button class="dpchip" onclick="openLvlSheet(${xi})" title="${t('lvlSheetTitle')}">L${(lte.lvl||0)+1}/${lvlL.length}</button>`:''}
        <div class="extarget" onclick="openTargetEdit(${xi})">${ex.targetSets}×${ex.targetReps}${tm?'s':''}</div>
        ${ex.adhoc?`<button class="minibtn pinex" onclick="pinToTpl(${xi})" aria-label="${t('pinExLabel')}">${ACT_ICONS.pin}</button>`:''}
        ${(tm||bw)?'':`<button class="minibtn warm${ex.sets.some(s=>s.warm&&!s.done)?' on':''}" onclick="autoWarmup(${xi})" aria-label="${t('warmBtn')}">W</button>`}
        <button class="minibtn${isAlt||ex.ss?' acc':''}" onclick="openExMenu(${xi})" aria-label="menu">${ACT_ICONS.more}</button>
      </div>
      ${isAlt?`<div class="altbar" onclick="swapExercise(${xi},'${esc(ex.baseK)}')">${ACT_ICONS.swap}<span>${t('woAltBack')} ${esc(exName(ex.baseK))}</span></div>`:''}
      ${(!dl && !ex.ghost && cbFactor(ex)<1) ? `<div class="cbnote">${t('cbNote',{p:Math.round(cbFactor(ex)*100)})}</div>` : ''}
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
  h += `<button class="addexbtn" onclick="addWorkoutEx()">+ ${t('woAddEx')}</button>`;
  return h;
}
/* ===== machine starting weight: tap the "+kg" chip in the KG column header =====
   The machine's empty/starting weight is entered ONCE and remembered on the
   template slot; from then on the weight column takes only the plates YOU add,
   while records, charts and totals count base + added. */
function openBaseEdit(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  openModal(`<h3>${esc(ex.name)}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="pvsub" style="margin-bottom:12px">${t('baseLabel')}</div>
    <div style="display:flex;align-items:center;gap:10px">
      <input id="base-in" type="text" inputmode="decimal" class="nameinput" style="flex:1;text-align:center;font-weight:700;font-size:18px"
        value="${ex.base?esc(fmtW(kg2u(ex.base))):''}" placeholder="0" onfocus="this.select()">
      <span style="font-weight:700;color:var(--dim)">${unitL()}</span>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:12px">${t('baseHint')}</div>
    <button class="btn primary" style="margin-top:14px" onclick="saveBase(${xi})">${ACT_ICONS.check} ${t('saveDone')}</button>`);
  setTimeout(()=>{ const i=$('#base-in'); if(i) i.focus(); }, 60);
}
function saveBase(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  const v = parseNum(($('#base-in')||{}).value);
  const kg = (!isNaN(v) && v>0) ? Math.min(500, Math.round(u2kg(v)*10)/10) : 0;
  if(kg) ex.base = kg; else delete ex.base;
  /* remembered per MACHINE (0 = switched off on purpose - history stops suggesting it) */
  if(!S.mbase) S.mbase = {};
  S.mbase[ex.k] = kg;
  /* the template slot mirrors it only while it points at this same exercise -
     saving while performing an alternative must not touch the planned machine */
  const te = tplEntryFor(ex);
  if(te && te.k===ex.k){ if(kg) te.base = kg; else delete te.base; }
  save(); closeModal(); render(); scheduleCloudSync();
}

/* ===== quick sets x reps editor: tap the "3x10" chip on a workout card =====
   Changes apply to this session AND (for template exercises) the template. */
function tplEntryFor(ex){
  const tpl = S.templates.find(t=>t.id===S.active.tplId);
  if(!tpl) return null;
  /* slot id first - exact even with duplicate exercise keys; key match as fallback */
  return tpl.ex.find(e=>e.id===ex.teId) || tpl.ex.find(e=>e.k===ex.baseK) || null;
}
function syncTargetToTpl(ex){
  if(ex.adhoc) return;
  const te = tplEntryFor(ex);
  if(te){ te.s = ex.targetSets; te.r = ex.targetReps; }
}
function openTargetEdit(xi){ V.tgtXi = xi; renderTargetEdit(); }
function renderTargetEdit(){
  const xi = V.tgtXi;
  const ex = S.active && S.active.exercises[xi];
  if(!ex) return;
  const tm = isTimeEx(ex.k);
  const p = repsParse(ex.targetReps);
  const rnum = (which,val)=>`<div class="numfield">
    <button onclick="wtReps(${xi},'${which}',-1)">−</button><span class="val">${val}</span>
    <button onclick="wtReps(${xi},'${which}',1)">+</button></div>`;
  const repsCtl = p.range
    ? rnum('lo',p.lo) + `<span class="rgdash">-</span>` + rnum('hi',p.hi)
    : rnum('single',p.lo);
  const persists = !ex.adhoc && !!tplEntryFor(ex);
  openModal(`<h3>${esc(ex.name)}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="ctlrow">
      <span class="clbl">${t('daySets')}</span>
      <div class="numfield">
        <button onclick="wtSets(${xi},-1)">−</button><span class="val">${ex.targetSets}</span>
        <button onclick="wtSets(${xi},1)">+</button>
      </div>
    </div>
    <div class="ctlrow repsrow">
      <span class="clbl">${tm?t('daySec'):t('dayReps')}</span>
      ${repsCtl}
      <button class="rangetog ${p.range?'acc':''}" onclick="wtRangeTog(${xi})">${t('repsRangeTog')}</button>
    </div>
    ${tm?'':`<div class="ctlrow">
      <span class="clbl wide">${t('dpLabel')}</span>
      ${dpSteps().map(v=>`<button class="rangetog ${Math.abs((ex.dp||0)-v)<.01?'acc':''}" onclick="wtDp(${xi},${v})">+${fmtW(kg2u(v))}</button>`).join('')}
      <button class="rangetog ${ex.dp?'':'acc'}" onclick="wtDp(${xi},0)">—</button>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:8px">${t('dpHint')}</div>`}
    ${persists?`<div style="font-size:12px;color:var(--ghost);margin-top:12px">${t('tgtHint')}</div>`:''}
    <button class="btn primary" style="margin-top:14px" onclick="closeModal()">${ACT_ICONS.check} ${t('saveDone')}</button>`);
}
/* progression step options in the display unit (stored in kg) */
function dpSteps(){
  return S.unit==='lb' ? [2.5/LB_PER_KG, 5/LB_PER_KG] : [1.25, 2.5, 5];
}
function wtDp(xi, v){
  const ex = S.active && S.active.exercises[xi];
  if(!ex) return;
  if(v>0) ex.dp = Math.round(v*1000)/1000; else delete ex.dp;
  const te = tplEntryFor(ex);
  if(te && !ex.adhoc){ if(ex.dp) te.dp = ex.dp; else delete te.dp; }
  save(); render(); renderTargetEdit();
}
function wtSets(xi,d){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  if(d>0){
    if(ex.targetSets>=12) return;
    ex.targetSets++; ex.sets.push(newSet());
  }else{
    if(ex.targetSets<=1 || ex.sets.length<=1) return;
    if(ex.sets[ex.sets.length-1].done){ toast(t('woRemoveDone')); return; }
    ex.targetSets--; ex.sets.pop();
  }
  updateExDone(ex); syncTargetToTpl(ex);
  save(); render(); renderTargetEdit();
}
function wtReps(xi,which,dir){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  const c = repsCfg(ex.k);
  const cl = n=>Math.max(c.min, Math.min(c.max, n));
  const p = repsParse(ex.targetReps);
  const d = dir*c.step;
  const rng = (lo,hi)=> lo===hi ? String(lo) : lo+'-'+hi;
  if(which==='single') ex.targetReps = String(cl(p.lo+d));
  else if(which==='lo'){ const lo=cl(p.lo+d); ex.targetReps = rng(lo, Math.max(lo,p.hi)); }
  else{ const hi=cl(p.hi+d); ex.targetReps = rng(Math.min(p.lo,hi), hi); }
  syncTargetToTpl(ex);
  save(); render(); renderTargetEdit();
}
function wtRangeTog(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  const c = repsCfg(ex.k);
  const p = repsParse(ex.targetReps);
  ex.targetReps = p.range ? String(p.lo) : p.lo+'-'+Math.min(c.max, p.lo+c.add);
  syncTargetToTpl(ex);
  save(); render(); renderTargetEdit();
}
/* wake a ghost suggestion into a real exercise for this session */
function activateGhost(xi){
  const ex = S.active.exercises[xi];
  if(!ex || !ex.ghost) return;
  delete ex.ghost;
  save(); render();
}
/* hide a ghost for this session (it only returns if it gets logged again) */
function dismissGhostEx(xi){
  const ex = S.active.exercises[xi];
  if(!ex || !ex.ghost) return;
  S.active.exercises.splice(xi, 1);
  const r = S.active.rest;
  if(r){
    const [rx, rs] = r.key.split('-').map(Number);
    if(rx > xi) r.key = (rx-1)+'-'+rs;
    else if(rx === xi) S.active.rest = null;
  }
  save(); render();
}
/* make a session-added exercise part of the template - it shows up every time */
function pinToTpl(xi){
  const ex = S.active.exercises[xi];
  const tpl = S.templates.find(t=>t.id===S.active.tplId);
  if(!ex || !tpl) return;
  /* always its own slot - duplicating a template exercise (or one of its
     alternatives) on purpose is a valid plan, e.g. a second bench slot */
  const te = { id:uid(), k:ex.k,
    s:Math.max(1, Math.min(12, ex.sets.filter(s=>!s.warm && !s.drop).length || 3)),
    r:String(ex.targetReps||'10'), ...(isX2(ex)?{x2:true}:{}), ...(ex.base>0?{base:ex.base}:{}), ...(ex.dp?{dp:ex.dp}:{}) };
  tpl.ex.push(te);
  ex.adhoc = false;
  ex.teId = te.id;
  save(); render(); scheduleCloudSync();
  toast(t('pinExDone',{n:tpl.name}));
}
/* add an exercise to THIS session only - the template is left untouched */
function addWorkoutEx(){
  openPicker(info=>{
    if(!S.active){ closeModal(); return; }
    const reps = isTimeEx(info.id) ? '30' : '10';
    const nx = buildActiveEx(info.id, exName(info.id), 3, reps, false, S.active.tplId, [], '');
    nx.adhoc = true; /* not part of the template - can be pinned in via the pin button */
    S.active.exercises.push(nx);
    closeModal(); save(); render();
    const cards = document.querySelectorAll('#screen .card');
    const last = cards[cards.length-1];
    if(last) last.scrollIntoView({ behavior:'smooth', block:'center' });
    toast(t('woAddExDone'));
    openTargetEdit(S.active.exercises.length-1); /* set sets x reps right away, no silent defaults */
  });
}
function restBarHtml(){
  const r = S.active.rest;
  const el = (Date.now()-r.at)/1000;
  const rrst = `<button class="rrst" onclick="event.stopPropagation();resetRest()" aria-label="${t('rrstLabel')}">${ACT_ICONS.restore}</button>`;
  if(!r.tgt) return `<div class="restbar" id="restbar" onclick="dismissRest()">
    <span class="rsp"></span>
    <span class="mid"><span class="pulse"></span>
      <span class="tm" id="rest-time">${t('restLabel')} ${fmtTime(el)}</span></span>
    ${rrst}
  </div>`;
  const done = el >= r.tgt;
  return `<div class="restbar target${done?' done':''}" id="restbar" onclick="dismissRest()">
    <div class="rfill" id="rest-fill" style="width:${Math.min(100, el/r.tgt*100)}%"></div>
    <button class="adj" onclick="event.stopPropagation();adjRest(-15)">−15</button>
    <span class="mid"><span class="pulse"></span>
      <span class="tm" id="rest-time">${t('restLabel')} ${fmtTime(el)} / ${fmtTime(r.tgt)}</span></span>
    <button class="adj" onclick="event.stopPropagation();adjRest(15)">+15</button>
    ${rrst}
  </div>`;
}
/* restart the rest clock from zero - e.g. between the left and right arm of a
   unilateral exercise; a target's signal re-arms too */
function resetRest(){
  const r = S.active && S.active.rest;
  if(!r) return;
  r.at = Date.now();
  r.sig = 0;
  save(); render();
}
/* nudge the target of the CURRENT rest only (the default in Settings stays) */
function adjRest(d){
  const r = S.active && S.active.rest;
  if(!r || !r.tgt) return;
  unlockAudio();
  r.tgt = Math.min(1800, Math.max(15, r.tgt + d));
  if((Date.now()-r.at)/1000 < r.tgt) r.sig = 0; /* extended past "done" - signal re-arms */
  save(); render();
}
function dismissRest(){
  if(S.active) S.active.rest = null;
  save(); render();
}
function onSetInput(xi,si,f,v){ S.active.exercises[xi].sets[si][f]=v; saveSoon(); }
function onNoteInput(xi,v){ S.active.exercises[xi].note=v; saveSoon(); }
/* toggle the note field between "this workout only" and a permanent note kept on the template */
function toggleNoteMode(xi){ const ex=S.active.exercises[xi]; ex.notePerm=!ex.notePerm; save(); render(); }
function setPnote(xi,v){
  const ex = S.active.exercises[xi];
  ex.pnote = v;
  const te = tplEntryFor(ex);
  if(te) te.pnote = v;
  saveSoon();
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
   working weight at 6/4/2 reps - the standard strength ramp; low reps up high
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
  /* sets already logged? prepending warmups now would block the next working
     set (sets complete strictly in order) - too late for a ramp */
  if(ex.sets.some(s=>s.done)){ toast(t('warmLate')); return; }
  /* target = the first working set's weight (typed, or the ghost from last time) */
  let w = NaN;
  for(let i=0;i<ex.sets.length;i++){
    const s = ex.sets[i];
    if(s.warm || s.drop) continue;
    w = parseNum(s.w);
    if(isNaN(w)){ const g = ghostFor(ex,i); if(g) w = kg2u(sugW(ex, false, ghostW(ex,g))); }
    break;
  }
  const step = stepU();
  const bar = plateBars()[0];
  const barbell = (exInfo(ex.k)||{}).e==='barbell';
  /* machine base: the % ramp works on the TOTAL load (base + plates) - the set
     stores plates only, so convert back after scaling. 0 plates = empty machine,
     a perfectly valid first warmup on a heavy sled. */
  const baseU = kg2u(ex.base||0);
  if(isNaN(w) || w+baseU<=0){ toast(t('warmNeedW')); return; }
  const ramp = [];
  if(barbell && w > bar) ramp.push({ w:bar, r:10 });
  [[0.4,6],[0.6,4],[0.8,2]].forEach(([p,r])=>{
    let ww = Math.round(((w+baseU)*p - baseU)/step)*step;
    if(barbell) ww = Math.max(ww, bar);
    if(ww<0 || (ww===0 && !baseU) || ww>=w) return;
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
/* show/hide the D+ buttons for this exercise block (session-only flag) */
function toggleDropUi(xi){
  const ex = S.active.exercises[xi];
  if(!ex) return;
  ex.dropUi = !ex.dropUi;
  save(); render();
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
/* session-only reorder: called when an exercise logs its FIRST set - if it was
   started out of template order, its whole superset group moves right below the
   last group already under way; untouched exercises keep template order below.
   Returns the exercise's index after the move. The template itself never changes. */
function autoMoveEx(xi){
  const exs = S.active.exercises;
  if(exs[xi].sets.filter(s=>s.done).length !== 1) return xi;
  const [ga,gb] = ssGroup(xi);
  let insertAfter = -1; /* end index of the last started group outside ours */
  for(let i=0;i<exs.length;i++){
    if(i>=ga && i<=gb) continue;
    if(exs[i].sets.some(s=>s.done)) insertAfter = Math.max(insertAfter, ssGroup(i)[1]);
  }
  let target = insertAfter + 1;
  if(target === ga) return xi;
  const group = exs.splice(ga, gb-ga+1);
  if(target > ga) target -= group.length;
  exs.splice(target, 0, ...group);
  return target + (xi - ga);
}
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
/* the x2 flag only counts while the performed variant is actually a dumbbell move -
   a slot can be flagged and still swap to a barbell alternative unaffected */
function isX2(ex){ return !!ex.x2 && (exInfo(ex.k)||{}).e==='dumbbell'; }
function toggleX2(xi){
  const ex = S.active.exercises[xi];
  ex.x2 = !ex.x2;
  const te = tplEntryFor(ex);
  if(te){ if(ex.x2) te.x2 = true; else delete te.x2; }
  save(); render();
}
function toggleSet(xi,si){
  const ex = S.active.exercises[xi];
  const s = ex.sets[si];
  if(s.done){
    /* sets are completed in order - only the last completed set can be un-done */
    if(ex.sets.slice(si+1).some(x=>x.done)) return;
    s.done=false; s.cls=''; updateExDone(ex); save(); render(); return;
  }
  /* only the current set (first not-done) can be completed */
  if(ex.sets.findIndex(x=>!x.done) !== si) return;
  const g = ghostFor(ex,si);                 /* g.weight is kg */
  const tm = isTimeEx(ex.k), bw = isBwEx(ex.k);
  const dl = woIsDeload();
  let w = parseNum(s.w), r = parseNum(s.r);  /* w is in the display unit */
  if(isNaN(w) && g) w = kg2u(sugW(ex, s.warm, ghostW(ex,g)));
  if(isNaN(r) && g) r = g.reps;
  if(isNaN(w) && (tm || bw)) w = 0;          /* weight optional for time & bodyweight */
  if(isNaN(w) || isNaN(r) || Math.abs(w)>2000 || r<1 || r>5000){ toast(t('woEmptyVals')); return; }
  if(!bw && w<0){ toast(t('woEmptyVals')); return; } /* only assisted bodyweight may be negative */
  const wkg = u2kg(w);
  s.w = fmtW(w); s.r = String(Math.round(r)); s.done = true;
  const real = realPrev(ex,si);              /* kg */
  /* compare TOTAL loads: when the machine base changed between sessions the
     logged plates-only numbers live on different scales */
  const mbd = ((ex.last && ex.last.mb) || 0) - (ex.base || 0);
  const rw = real ? real.weight + mbd : 0;
  if(!real || s.warm || s.drop || dl) s.cls = 'none'; /* no win/loss judgment on a deload */
  else if(wkg>rw || (wkg===rw && r>real.reps)) s.cls='win';
  else if(wkg===rw && r===real.reps) s.cls='even';
  else s.cls='loss';
  updateExDone(ex);
  /* out-of-order training: on an exercise's first set it floats (with its whole
     superset group) up right below the exercises already under way, so the card
     being worked on sits near the top instead of far down the template order */
  const nxi = autoMoveEx(xi);
  const moved = nxi !== xi;
  xi = nxi;
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
  /* rest: none after the workout's final set; inside a superset it starts only
     when the round wraps back (A -> B is immediate work, B -> A begins the rest) */
  if(S.active.exercises.every(e=>e.ghost || exFullyDone(e)) || jump > xi){
    S.active.rest = null;
  }else{
    S.active.rest = { at:Date.now(), key:xi+'-'+si };
    if(ex.rt){
      S.active.rest.tgt = ex.rt;
      if(S.restSound) unlockAudio(); /* iOS: audio must be unlocked by a tap */
    }
  }
  V.lastDone = xi+'-'+si;
  S.active.curEx = (jump>=0) ? S.active.exercises[jump].id : ex.id;
  save(); render();
  if(jump>=0 && jump!==xi){
    const card = document.querySelectorAll('#screen .card')[jump];
    if(card) card.scrollIntoView({ behavior:'smooth', block:'center' });
  }else if(moved){
    const card = document.querySelectorAll('#screen .card')[xi];
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
  if(!ex) return;
  const sid = S.active.startedAt; /* the undo must not leak into a different session */
  const hadRest = S.active.rest ? Object.assign({}, S.active.rest) : null;
  const r = S.active.rest;
  if(r){
    const [rx, rs] = r.key.split('-').map(Number);
    if(rx===xi) S.active.rest = null;              /* rest belonged to the removed exercise */
    else if(rx>xi) r.key = (rx-1)+'-'+rs;          /* exercises after it shift down by one */
  }
  S.active.exercises.splice(xi,1);
  save(); render();
  undoToast(t('woExRemoved',{n:ex.name}), ()=>{
    if(!S.active || S.active.startedAt !== sid) return; /* session ended or a new one started */
    S.active.exercises.splice(Math.min(xi, S.active.exercises.length), 0, ex);
    /* only restore the rest clock this deletion actually cleared - never stomp
       a timer the user has started since */
    if(hadRest && !S.active.rest) S.active.rest = hadRest;
  });
}
function finishWorkout(){
  if(!S.active) return;
  /* each exercise slot may hold several performed variants (planned + alternatives);
     every variant with logged sets becomes its own history entry, tracked separately */
  /* rank of each exercise slot by the order it was completed (for "last order" next time) */
  const orderMap = {};
  S.active.exercises.filter(e=>e.doneAt).sort((a,b)=>a.doneAt-b.doneAt).forEach((e,i)=>{ orderMap[e.id]=i+1; });
  const exercises = [];
  S.active.exercises.forEach(ex=>{
    if(ex.ghost) return; /* untouched suggestions never reach history */
    /* base travels per VARIANT - a stashed machine keeps its own starting weight,
       not whatever machine the slot happened to end the session on */
    const variants = [{ k:ex.k, name:ex.name, note:ex.note, sets:ex.sets, bw:ex.bw, base:ex.base }];
    for(const sk in ex.stash){ const v=ex.stash[sk]; variants.push({ k:sk, name:v.name, note:v.note, sets:v.sets, bw:v.bw, base:v.base }); }
    variants.forEach(v=>{
      const done = v.sets.filter(s=>s.done).map(s=>({ weight:u2kg(parseNum(s.w)), reps:parseNum(s.r), warm:!!s.warm, drop:!!s.drop, fail:!!s.fail }));
      if(!done.length) return;
      const o = { k:v.k, name:v.name, targetSets:ex.targetSets, targetReps:ex.targetReps, note:v.note||'', ss:!!ex.ss, sets:done };
      if(orderMap[ex.id]) o.order = orderMap[ex.id];
      if(isBwEx(v.k) && v.bw!=null) o.bw = v.bw;
      if(ex.x2 && (exInfo(v.k)||{}).e==='dumbbell') o.x2 = 1; /* weights are per hand */
      if(ex.adhoc) o.adhoc = 1; /* standalone addition - ghosts next time even if the key overlaps the template */
      if(v.base > 0) o.mb = v.base; /* machine base: logged weights are added-only, totals include this */
      exercises.push(o);
    });
  });
  if(!exercises.length){
    if(confirm(t('woFinishEmpty'))){ S.active=null; save(); go('home'); }
    return;
  }
  /* "unfinished sets?" looks only at each slot's CURRENT variant - sets sitting
     in a swapped-away variant's stash are not work that was left undone */
  const unfinished = S.active.exercises.some(ex=>!ex.ghost && ex.sets.some(s=>!s.done));
  if(unfinished && !confirm(t('woFinishPart'))) return;
  /* detect all-time PRs BEFORE this workout enters history (never on a deload pass) */
  const isDl = woIsDeload();
  const prs = [];
  if(!isDl) for(const e of exercises){
    const work = e.sets.filter(s=>!s.warm && !s.drop);
    if(!work.length) continue;
    const prev = exStats(e.k, e.name);
    if(isTimeEx(e.k)){
      const bt = Math.max(...work.map(s=>s.reps));
      if(prev.bestTime>0 && bt>prev.bestTime) prs.push({ name:e.name, txt:bt+' s' });
    }else{
      /* compare in the same scale exStats uses: total load (x2 pairs doubled, body weight / machine base added) */
      const addb = (isBwEx(e.k) ? (e.bw||0) : 0) + (e.mb||0);
      const topW = Math.max(...work.map(s=>s.weight*(e.x2?2:1) + addb));
      if(prev.best>0 && topW>prev.best) prs.push({ name:e.name, txt:wu(topW,true) });
    }
  }
  const fact = (!isDl && !prs.length) ? masteryFact(exercises) : null;
  const dur = Math.round((Date.now()-new Date(S.active.startedAt).getTime())/1000);
  const vol = woVolume(exercises);
  const entry = {
    id:uid(), tplId:S.active.tplId, name:S.active.name, date:new Date().toISOString(),
    dur, exercises
  };
  let dlUndo = null; /* what this finish changed on the deload record - Continue rolls it back */
  if(isDl){
    entry.dl = 1; /* deload session: out of records/PRs/ghosts, badged in history */
    const d = dlActive();
    dlUndo = { ds:d ? d.s : 0, tplId:null, closed:0 }; /* ds = start ts, the deload record's identity */
    if(d && !d.done.includes(entry.tplId)){ d.done.push(entry.tplId); dlUndo.tplId = entry.tplId; }
    if(d && !dlRemaining(d).length){ d.e = Date.now(); dlUndo.closed = 1; toast(t('dlDone')); }
  }
  /* exercises the user ADDED (or woke from a ghost) but never logged a set on:
     keep them as suggestions so they still ghost next session - only untouched
     ghosts are allowed to expire */
  const sug = S.active.exercises
    .filter(ex=>ex.adhoc && !ex.ghost && !ex.sets.some(s=>s.done))
    .map(ex=>({ k:ex.k, n:ex.name, s:ex.targetSets, r:ex.targetReps, ...(isX2(ex)?{x2:1}:{}), ...(ex.base>0?{mb:ex.base}:{}) }));
  if(sug.length) entry.sug = sug;
  S.history.unshift(entry);
  /* advance any wave whose lift logged working sets (once per lift, never on a
     deload) - AFTER the entry lands in history, so the fresh session counts
     toward the verdict. After week D the round wraps and the wave judges
     itself: new best during the wave = job done, 3 dry rounds = stop. */
  const wrapped = [], ended = [];
  const advanced = new Set();
  const waveSnaps = []; /* pre-advance snapshots - Continue restores them verbatim, even auto-ended waves */
  if(!isDl){
    for(const e of exercises){
      const wv = S.waves[e.k];
      if(!wv || advanced.has(e.k)) continue;
      if(!e.sets.some(s=>!s.warm && !s.drop)) continue;
      advanced.add(e.k);
      waveSnaps.push({ k:e.k, prev:Object.assign({}, wv) });
      wv.idx++;
      if(wv.idx > 3){
        wv.idx = 0;
        wv.rounds = (wv.rounds||0) + 1;
        const verdict = waveVerdict(e.k, wv);
        if(verdict){
          delete S.waves[e.k];
          ended.push({ k:e.k, verdict });
        }else{
          wv.base = Math.round((wv.base + wv.step)*100)/100;
          wrapped.push({ k:e.k, base:wv.base });
        }
      }
    }
  }
  /* level ladders: top of the range on every work set, two sessions in a row ->
     the slot advances a level for next time (manual moves always win, see lvlGo) */
  const lvlUps = [];
  if(!isDl) for(const ex of S.active.exercises){
    if(ex.ghost || ex.adhoc) continue;
    const te = tplEntryFor(ex);
    const L = lvlsOf(te);
    if(!L || ex.k !== te.k) continue;  /* swapped to something else today - no verdict */
    const work = ex.sets.filter(s=>s.done && !s.warm && !s.drop);
    if(!work.length) continue;
    const top = repsParse(ex.targetReps).hi;
    const clean = work.length >= ex.targetSets && work.every(s=>parseNum(s.r) >= top);
    if(!clean){ te.lvlN = 0; continue; }
    te.lvlN = (te.lvlN||0) + 1;
    if(te.lvlN >= 2 && (te.lvl||0) < L.length-1){
      lvlApply(te, (te.lvl||0)+1);
      lvlUps.push('L'+((te.lvl||0)+1)+' · '+exName(te.k, te.n));
    }
  }
  /* keep the finished session resurrectable - "Continue" on the newest history
     row undoes an accidental Finish with sets and elapsed time intact */
  S.lastActive = { id:entry.id, act:S.active, waved:waveSnaps, ...(dlUndo?{dl:dlUndo}:{}) };
  S.active = null;
  save();
  scheduleCloudSync();
  go('home');
  showSummary(dur, vol, exercises.reduce((a,e)=>a+e.sets.length,0), prs, fact);
  if(ended.length) toast(t(ended[0].verdict==='win'?'waveWin':'waveFlat', {n:exName(ended[0].k)}));
  else if(wrapped.length) toast(t('waveNextRound',{n:exName(wrapped[0].k), w:wu(wrapped[0].base,true)}));
  else if(lvlUps.length) toast(t('lvlUpToast',{n:lvlUps[0]}));
}
function showSummary(dur, vol, setsDone, prs, fact){
  const prHtml = prs.length ? `<h2 class="sec" style="margin-top:14px">${t('sumPRs')}</h2>` +
    prs.map(p=>`<div class="card" style="display:flex;align-items:baseline;gap:10px;margin-bottom:8px">
      <span style="flex:1;font-weight:700">${esc(p.name)}</span>
      <span style="font-weight:800;color:var(--accent-soft);font-size:18px">${p.txt}</span></div>`).join('') : '';
  const factHtml = fact ? `<div class="mfact">${ACT_ICONS.star}<span>${esc(fact)}</span></div>` : '';
  openModal(`<h3>${t('sumTitle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="statrow">
      <div class="stat"><div class="v">${fmtTime(dur)}</div><div class="l">${t('sumDur')}</div></div>
      <div class="stat"><div class="v">${Math.round(kg2u(vol))}</div><div class="l">${t('sumVol')}, ${unitL()}</div></div>
      <div class="stat"><div class="v">${setsDone}</div><div class="l">${t('sumSets')}</div></div>
    </div>
    ${prHtml}${factHtml}
    <button class="btn primary" style="margin-top:14px" onclick="closeModal()">${t('sumOk')}</button>`);
  if(prs.length) confetti();
}
/* lightweight one-shot confetti - CSS animated, no library, cleans itself up */
function confetti(){
  if(document.getElementById('confetti')) return;
  const box = document.createElement('div');
  box.id = 'confetti';
  /* confetti wears the LIVE palette (skin AND light/dark) straight from the CSS
     tokens - every piece is a color that already reads on this background, and
     a new skin needs no confetti table */
  const cs = getComputedStyle(document.documentElement);
  const tok = n => cs.getPropertyValue(n).trim();
  const cols = [tok('--accent'), tok('--accent-soft'), tok('--text'), tok('--green'), tok('--orange'), tok('--dim')].filter(Boolean);
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
function stepperInit(){
  const bar = $('#stepper');
  if(!bar) return;
  bar.querySelectorAll('button').forEach(b=>{
    b.addEventListener('pointerdown', e=>{
      e.preventDefault(); /* keep the input focused */
      stepWeight(parseFloat(b.dataset.d) < 0 ? -stepU() : stepU());
    });
  });
  document.addEventListener('focusin', e=>{
    if(V.screen==='workout' && e.target.id && /^[wr]-/.test(e.target.id)){
      stepEl = e.target;
      const reps = e.target.id.startsWith('r-');
      const step = reps ? 1 : stepU();
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
   the keyboard animation - instead of chasing it, the bar hides while the viewport
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
    saveSoon();
    return;
  }
  let cur = parseNum(stepEl.value);
  if(isNaN(cur)){
    /* start from the value the placeholder is showing (deload/comeback-scaled, base-adjusted) */
    const g = ghostFor(ex, si);
    cur = g ? kg2u(sugW(ex, ex.sets[si].warm, ghostW(ex,g))) : 0;
  }
  cur = Math.round((cur + d) * 100) / 100;
  if(!isBwEx(ex.k) && cur < 0) cur = 0; /* assisted bodyweight may go negative */
  stepEl.value = fmtW(cur);
  ex.sets[si].w = fmtW(cur);
  saveSoon();
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
    /* target reached - signal once, whatever screen is visible */
    if(r.tgt && !r.sig && done){ r.sig = 1; save(); restSignal(); }
  }
  updateStepTime();
}
/* workout + rest time on the keyboard stepper bar - the topbar scrolls away
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

