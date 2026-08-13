/* ============================================================
   Manual deload cycle: one intentionally light pass over every workout of
   the main program. dlW() scales suggested loads (pct >= 1 means "same
   weight, fewer sets" and passes loads through untouched); deload sessions
   are tagged dl:1 and excluded from records, PRs and ghosts.
   ============================================================ */
'use strict';

/* ======================= DELOAD ======================= */
/* manual deload CYCLE: every workout of the MAIN program gets exactly one deload
   pass (reduced ghost loads, sets out of records/PRs, tagged dl:1). The deload ends
   automatically once each workout was done once - or manually anytime. A workout
   whose deload pass is already done counts as a normal session again.
   Options (research-backed, see v1.9.3 notes): load 50/60/70/90 % of previous
   working weights + optional half sets. Light exercises (<20 kg) are only trimmed
   to 80 % - surveyed athletes mostly keep isolation loads and cut volume instead. */
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
   assisted (negative) loads are left alone - scaling them would make the set harder */
function dlW(kg){
  if(kg<=0) return kg;
  const d = dlActive();
  let p = (d && d.pct) || DL_FACTOR;
  if(p>=1) return kg; /* "same weight, fewer sets" deload - loads untouched, no rounding drift */
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
  /* 100 % = "same weight, half the sets" - picking it flips volume to half automatically */
  const pctChip = p => `<button class="chip ${o.pct===p?'on':''}" onclick="V.dlm.pct=${p};${p===1?' V.dlm.vol=0.5;':''} renderDlm()">${Math.round(p*100)} %</button>`;
  el.innerHTML = `
    <h2 class="sec" style="margin-top:0">${t('dlmW')}</h2>
    <div class="chips" style="padding-bottom:4px">${[0.5,0.6,0.7,0.9,1].map(pctChip).join('')}</div>
    <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:0 4px 6px">${t('dlmWHint')}</div>
    <h2 class="sec">${t('dlmSets')}</h2>
    <div class="chips" style="padding-bottom:4px">
      <button class="chip ${o.vol===1?'on':''}" onclick="V.dlm.vol=1; renderDlm()">${t('dlmSetsAll')}</button>
      <button class="chip ${o.vol===0.5?'on':''}" onclick="V.dlm.vol=0.5; renderDlm()">${t('dlmSetsHalf')}</button>
    </div>
    <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:0 4px 6px">${t('dlmSetsHint')}</div>
    <h2 class="sec">${t('dlmRemind')}</h2>
    <div class="chips" style="padding-bottom:4px">
      <button class="chip ${!S.dlEvery?'on':''}" onclick="S.dlEvery=0; save(); renderDlm()">—</button>
      ${[6,7,8].map(w=>`<button class="chip ${S.dlEvery===w?'on':''}" onclick="S.dlEvery=${w}; save(); renderDlm()">${w} ${t('wkS')}</button>`).join('')}
    </div>
    <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:0 4px 6px">${t('dlmRemindHint')}</div>
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
/* workouts done per template since the last deload started (deload sets excluded) -
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

