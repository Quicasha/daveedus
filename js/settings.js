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
      <span class="lb">${t('setTheme')}</span>
      <div class="seg">
        <button class="${S.theme==='auto'?'on':''}" onclick="setTheme('auto')">${t('themeAuto')}</button>
        <button class="${S.theme==='dark'?'on':''}" onclick="setTheme('dark')">${t('themeDark')}</button>
        <button class="${S.theme==='light'?'on':''}" onclick="setTheme('light')">${t('themeLight')}</button>
      </div>
    </div>
    <div style="color:var(--dim);font-size:13px;margin:12px 0 8px">${t('setStyle')}</div>
    <div class="segmented">
      ${['ice','villain','batman'].map(k=>
        `<button class="seg ${(S.skin||'ice')===k?'on':''}" onclick="setSkin('${k}')">${t('skin_'+k)}</button>`).join('')}
    </div>
    <div class="setline">
      <span class="lb">${t('setUnit')}</span>
      <div class="seg">
        <button class="${(S.unit||'kg')==='kg'?'on':''}" onclick="setUnit('kg')">kg</button>
        <button class="${S.unit==='lb'?'on':''}" onclick="setUnit('lb')">lb</button>
      </div>
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
function toggleRestSound(){
  S.restSound = !S.restSound;
  save(); render();
  if(S.restSound){ unlockAudio(); setTimeout(beep, 150); } /* preview the sound */
}
function setUnit(u){ S.unit=u; save(); render(); }
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
  go('home');
}

