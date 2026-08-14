/* ============================================================
   Settings screen: theme, units, wake lock, rest sound, backup code
   copy/load, cloud sync setup, CSV export buttons and the danger zone.
   ============================================================ */
'use strict';

/* ======================= SETTINGS ======================= */
function htmlSettings(){
  return `<div style="height:8px"></div>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('setUnit')}</span>
      <div class="seg">
        <button class="${(S.unit||'kg')==='kg'?'on':''}" onclick="setUnit('kg')">kg</button>
        <button class="${S.unit==='lb'?'on':''}" onclick="setUnit('lb')">lb</button>
      </div>
    </div>
    <div class="setline">
      <span class="lb">${t('setTheme')}</span>
      <div class="seg">
        <button class="${S.theme==='auto'?'on':''}" onclick="setTheme('auto')">${t('themeAuto')}</button>
        <button class="${S.theme==='dark'?'on':''}" onclick="setTheme('dark')">${t('themeDark')}</button>
        <button class="${S.theme==='light'?'on':''}" onclick="setTheme('light')">${t('themeLight')}</button>
      </div>
    </div>
    <div class="setline">
      <span class="lb">${t('setStyle')}</span>
      <button class="btn small" onclick="openSkinPicker()">${t('skin_'+(S.skin||'ice'))} ›</button>
    </div>
  </div>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('setAwake')}</span>
      <div class="switch ${S.keepAwake?'on':''}" onclick="S.keepAwake=!S.keepAwake; save(); render()"></div>
    </div>
    <div class="setline">
      <span class="lb">${t('setRestSnd')}</span>
      <div class="switch ${S.restSound?'on':''}" onclick="toggleRestSound()"></div>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:2px">${t('setRestHint')}</div>
  </div>
  <h2 class="sec">${t('setBackup')}</h2>
  <button class="btn" onclick="copyBackup()">${ACT_ICONS.share} ${t('setBackupCopy')}</button>
  <button class="btn" onclick="openImportModal('bak')">${ACT_ICONS.dl} ${t('setBackupLoad')}</button>
  <h2 class="sec">${t('ghTitle')}</h2>
  <div class="card">${ghOn() ? `
    <div class="setline">
      <span class="lb" style="font-weight:600">${esc(S.ghRepo)}</span>
      <span id="gh-status" style="font-weight:700;font-size:13px;color:var(--dim)">…</span>
    </div>
    <div class="setctl">
      <button onclick="S.ghDirty=1; save(); cloudSync()">${t('ghNow')}</button>
      <button onclick="ghRestore()">${t('ghRestore')}</button>
      <button onclick="ghDisconnect()">${t('ghOff')}</button>
    </div>` : `
    <input class="nameinput" id="gh-repo" type="text" placeholder="${t('ghRepoPh')}" autocapitalize="none" autocorrect="off" style="margin-bottom:8px">
    <input class="nameinput" id="gh-token" type="password" placeholder="${t('ghTokenPh')}" autocapitalize="none" style="margin-bottom:10px">
    <button class="btn primary" id="gh-connect" style="margin-bottom:0" onclick="ghConnect()">${t('ghConnect')}</button>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:10px">${t('ghHint')}</div>`}
  </div>
  <h2 class="sec">${t('csvTitle')}</h2>
  <button class="btn" onclick="exportCSV('sets')">${ACT_ICONS.copy} ${t('csvSets')}</button>
  <button class="btn" onclick="exportCSV('bw')">${ACT_ICONS.scale} ${t('csvBw')}</button>
  <div style="color:var(--dim);font-size:12px;line-height:1.45;margin:2px 6px 0">${t('csvHint',{u:unitL()})}</div>
  <h2 class="sec">${t('protTitle')}</h2>
  <div class="card">
    <div class="setline">
      <span class="lb">${t('protPersist')}</span>
      <span id="persist-status" style="color:var(--dim);font-weight:700;font-size:14px">…</span>
    </div>
    <div style="font-size:12px;color:var(--ghost);line-height:1.5;margin-top:2px">${t('protHint')}</div>
  </div>
  <h2 class="sec" style="color:var(--red)">${t('setDanger')}</h2>
  <button class="btn danger" onclick="wipeAll()">${t('setWipe')}</button>
  <div style="text-align:center;color:var(--ghost);font-size:12px;margin-top:24px">Daveedus v${APP_VER}</div>`;
}
function setTheme(m){ S.theme=m; save(); applyTheme(); render(); }
function setSkin(k){ S.skin=k; save(); applyTheme(); render(); scheduleCloudSync(); }
/* one skin row per entry: swatch (bg + accent dot), name, check on the active one.
   `act` is the onclick body - the pickers differ only in what happens after the tap. */
function skinRowsHtml(act){
  return Object.keys(SKIN_PREVIEW).map(k=>{
    const sw = SKIN_PREVIEW[k];
    return `<button class="swapitem ${S.skin===k?'on':''}" onclick="${act.replace(/KEY/g,k)}">
      <span class="skinsw" style="background:${sw.bg}"><i style="background:${sw.accent}"></i>${sw.accent2?`<i style="background:${sw.accent2}"></i>`:''}</span>
      <span class="sn">${t('skin_'+k)}</span>
      ${S.skin===k?`<span class="chk">${ACT_ICONS.check}</span>`:''}
    </button>`;
  }).join('');
}
/* the sheet stays open while you tap around - the app behind it IS the preview */
function openSkinPicker(){
  openModal(`<h3>${t('setStyle')}<button class="x" onclick="closeModal()">✕</button></h3>
    <div class="swaplist">${skinRowsHtml("setSkin('KEY');openSkinPicker()")}</div>`);
}
function toggleRestSound(){
  S.restSound = !S.restSound;
  save(); render();
  if(S.restSound){ unlockAudio(); setTimeout(beep, 150); } /* preview the sound */
}
function setUnit(u){
  if(u===S.unit) return;
  /* active-session set inputs hold DISPLAY-unit strings - rescale them so an
     already-logged 100 kg stays 100 kg (shown as 220.46 lb), instead of being
     reinterpreted as 100 lb when the session is finished */
  if(S.active){
    const conv = v=>{ const n = parseNum(v); return isNaN(n) ? v : fmtW(u==='lb' ? n*LB_PER_KG : n/LB_PER_KG); };
    for(const ex of S.active.exercises){
      const variants = [ex.sets].concat(Object.values(ex.stash||{}).map(x=>x.sets));
      for(const sets of variants) for(const s of sets) if(s.w) s.w = conv(s.w);
    }
  }
  S.unit=u; save(); render();
}
function updatePersistStatus(){
  const el = $('#persist-status');
  if(!el) return;
  if(navigator.storage && navigator.storage.persisted){
    navigator.storage.persisted().then(p=>{
      el.textContent = p ? t('protOn') : t('protOff');
      el.style.color = p ? 'var(--green)' : 'var(--orange)';
    }).catch(()=>{ el.textContent='—'; });
  }else el.textContent = '—';
}
function wipeAll(){
  if(!confirm(t('setWipeConfirm'))) return;
  if(!confirm(t('setWipeConfirm'))) return;
  /* wipe everything, including snapshots and the IndexedDB mirror */
  Object.keys(localStorage).filter(k=>k.startsWith('daveedus.')).forEach(k=>localStorage.removeItem(k));
  idbSet(null);
  S = defaultState();
  save();
  applyTheme(); /* the fresh defaults' skin/theme must actually show */
  go('home');
}

