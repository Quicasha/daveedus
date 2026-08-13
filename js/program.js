/* ============================================================
   Programs (folders) and workout templates: the split cards, the template
   editor (sets/reps ranges, rest targets, progression step, weekday,
   alternatives), duplication and folder sharing.
   Template edits sync into an active session only through tplEntryFor().
   ============================================================ */
'use strict';

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
  const i = S.folders.findIndex(x=>x.id===id);
  if(i<0) return;
  const f = S.folders[i];
  const orphaned = S.templates.filter(tp=>tp.folderId===id).map(tp=>tp.id);
  S.templates.forEach(tp=>{ if(tp.folderId===id) tp.folderId=null; });
  S.folders.splice(i,1);
  save();
  go('program');
  undoToast(t('folderDelDone',{n:f.name}), ()=>{
    S.folders.splice(i,0,f);
    S.templates.forEach(tp=>{ if(orphaned.includes(tp.id)) tp.folderId = id; });
  });
}
function shareFolder(id){
  const f = S.folders.find(x=>x.id===id);
  if(!f) return;
  const tpls = S.templates.filter(x=>x.folderId===id);
  const payload = { t:'folder', name:f.name,
    tpls: tpls.map(d=>({ name:d.name, ex:d.ex.map(e=>({ k:e.k, n:exName(e.k,e.n), s:e.s, r:e.r, ss:e.ss?1:0, m:(exInfo(e.k)||{}).m||0, alts:(e.alts||[]), pnote:e.pnote||'', ...(e.rt?{rt:e.rt}:{}), ...(e.x2?{x2:1}:{}), ...(e.base?{base:e.base}:{}), ...(e.dp?{dp:e.dp}:{}) })) })) };
  const code = encodeShare(payload);
  openModal(`<h3>${t('folderShare')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div style="color:var(--dim);font-size:14px;margin:0 4px 10px">${t('folderShareHint')}</div>
    <textarea class="codebox" readonly onclick="this.select()">${esc(code)}</textarea>
    <button class="btn primary" style="margin-top:12px" onclick="copyText(document.querySelector('.codebox').value)">${ACT_ICONS.copy} ${t('copy')}</button>`);
}
function openTpl(id){ V.editTpl=id; go('tpledit'); }
function closeTplEdit(){
  const d = S.templates.find(x=>x.id===V.editTpl);
  scheduleCloudSync();
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
  const i = S.templates.findIndex(x=>x.id===id);
  if(i<0) return;
  const d = S.templates[i];
  S.templates.splice(i,1);
  save(); render();
  undoToast(t('tplDelDone',{n:d.name}), ()=>S.templates.splice(i,0,d));
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
      <div class="ct" style="color:var(--dim);font-size:13px;margin:12px 0 6px">${t('wdLabel')}</div>
      <div class="chips" style="padding-bottom:0">
        <button class="chip ${!d.wd?'on':''}" onclick="setTplWd('${d.id}',0)">—</button>
        ${[1,2,3,4,5,6,7].map(w=>`<button class="chip ${d.wd===w?'on':''}" onclick="setTplWd('${d.id}',${w})">${t('wd'+w)}</button>`).join('')}
      </div>
      <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:8px">${t('wdHint')}</div>
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
      ? rnum('lo',p.lo) + `<span class="rgdash">-</span>` + rnum('hi',p.hi)
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
          <button onclick="stepTplRest('${d.id}',${i},-1)">−</button><input class="val restin" type="text" inputmode="numeric" value="${e.rt?fmtTime(e.rt):''}" placeholder="—" onfocus="this.select()" oninput="fmtRestInput(this)" onchange="typeTplRest('${d.id}',${i},this.value)">
          <button onclick="stepTplRest('${d.id}',${i},1)">+</button>
        </div>
        ${e.rt?'':`<span class="resthint">${t('tplRestOff')}</span>`}
      </div>
      ${tm?'':`<div class="ctlrow">
        <span class="clbl wide">${t('dpLabel')}</span>
        ${dpSteps().map(v=>`<button class="rangetog ${Math.abs((e.dp||0)-v)<.01?'acc':''}" onclick="setTplDp('${d.id}',${i},${v})">+${fmtW(kg2u(v))}</button>`).join('')}
        <button class="rangetog ${e.dp?'':'acc'}" onclick="setTplDp('${d.id}',${i},0)">—</button>
      </div>`}
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
    ex: d.ex.map(e=>({ id:uid(), k:e.k, s:e.s, r:e.r, ss:!!e.ss, alts:(e.alts||[]).slice(), pnote:e.pnote||'', ...(e.rt?{rt:e.rt}:{}), ...(e.x2?{x2:true}:{}), ...(e.base?{base:e.base}:{}), ...(e.dp?{dp:e.dp}:{}) })) };
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
/* fixed weekday for this workout (0 = none) - drives the TODAY badge on home */
function setTplWd(id,wd){
  const d = S.templates.find(x=>x.id===id);
  if(!d) return;
  if(wd>=1 && wd<=7) d.wd = wd; else delete d.wd;
  save(); render();
}
/* per-exercise double-progression step on the template (0 = off) */
function setTplDp(id,i,v){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  if(v>0) d.ex[i].dp = Math.round(v*1000)/1000; else delete d.ex[i].dp;
  save(); render();
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
/* typed rest works like a microwave: the colon is fixed, digits shift in from the
   right - keys 1,3,0 read 0:01 -> 0:13 -> 1:30 (numeric keyboards have no ":") */
function fmtRestInput(el){
  const d = el.value.replace(/\D/g,'').replace(/^0+/,'').slice(0,4);
  el.value = d ? Math.floor(+d/100) + ':' + String(+d%100).padStart(2,'0') : '';
}
function parseRestInput(v){
  const d = String(v).replace(/\D/g,'');       /* "1:30" -> "130": minutes*100+seconds */
  if(!d) return 0;
  const sec = Math.floor(+d/100)*60 + (+d%100);
  if(!sec) return 0;
  return Math.max(15, Math.min(1800, Math.round(sec/15)*15));
}
function typeTplRest(id,i,v){
  const d = S.templates.find(x=>x.id===id);
  if(!d || !d.ex[i]) return;
  const sec = parseRestInput(v);
  if(sec) { d.ex[i].rt = sec; S.restTarget = sec; }
  else delete d.ex[i].rt;                      /* cleared or zero -> no target */
  save(); render();
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
/* toggle a target between a single value and a "from-to" range */
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
    d.ex.push({ id:uid(), k:info.id, s:3, r:String(repsCfg(info.id).def) });
    save(); closeModal(); render();
    /* bring the new row's sets/reps controls into view so the defaults get adjusted */
    const rows = document.querySelectorAll('.exedit');
    const last = rows[rows.length-1];
    if(last) last.scrollIntoView({ behavior:'smooth', block:'center' });
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
  const e = d.ex[i];
  d.ex.splice(i,1);
  save(); render();
  undoToast(t('woExRemoved',{n:exName(e.k,e.n)}), ()=>{
    const dd = S.templates.find(x=>x.id===id);
    if(dd) dd.ex.splice(Math.min(i, dd.ex.length), 0, e);
  });
}

