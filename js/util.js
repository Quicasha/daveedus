/* ============================================================
   Small pure-ish helpers used by every screen: DOM shortcut, escaping,
   number/weight/date formatting, unit conversion (kg <-> lb), exercise DB
   lookups, set formatting, toast, clipboard, theme application.
   Nothing here renders screens or mutates S (except applyTheme reading S.theme).
   ============================================================ */
'use strict';

/* ======================= helpers ======================= */
const $ = s => document.querySelector(s);
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function parseNum(v){
  if(v==null || v==='') return NaN;
  return parseFloat(String(v).replace(',','.'));
}
function fmtW(w){
  if(w==null || isNaN(w)) return '';
  return String(Math.round(w*100)/100);
}
/* normalize a template target to a clean "N" or "N-M" string (1..max, default 50 for reps) */
function normReps(v, max){
  max = max || 50;
  if(v==null) return '10';
  const m = String(v).replace(/[^\d-]/g,'').match(/^(\d+)(?:\s*-\s*(\d+))?/);
  if(!m) return '10';
  const clamp = n => Math.max(1, Math.min(max, parseInt(n,10)||10));
  let lo = clamp(m[1]);
  if(m[2]!=null && m[2]!==''){
    let hi = clamp(m[2]);
    if(hi < lo){ const x=lo; lo=hi; hi=x; }
    return lo===hi ? String(lo) : lo+'-'+hi;
  }
  return String(lo);
}
function fmtTime(sec){
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec/3600), m = Math.floor(sec%3600/60), s = sec%60;
  return h>0 ? h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')
             : m+':'+String(s).padStart(2,'0');
}
function fmtClock(iso){
  return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}
function fmtDate(iso){
  return new Date(iso).toLocaleDateString('en-GB',
    { month:'short', day:'numeric', weekday:'short' });
}
function daysAgoStr(iso){
  const one = 24*3600*1000;
  const a = new Date(iso); a.setHours(0,0,0,0);
  const b = new Date();    b.setHours(0,0,0,0);
  const n = Math.round((b-a)/one);
  if(n<=0) return t('today');
  if(n===1) return t('yesterday');
  return t('daysAgo',{n});
}
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('undo');
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show','undo'), 2200);
}
/* destructive actions apply immediately and offer a single-slot Undo for a few
   seconds instead of an "Are you sure?" dialog - restore() must fully reverse
   the deletion (the caller captured whatever it needs beforehand) */
function undoToast(msg, restore){
  const el = $('#toast');
  el.innerHTML = `${esc(msg)}<button id="undo-btn">${t('undoBtn')}</button>`;
  el.classList.add('show','undo');
  $('#undo-btn').onclick = ()=>{
    el.classList.remove('show','undo');
    clearTimeout(toast._t);
    restore(); save(); render();
  };
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show','undo'), 5000);
}
function copyText(txt){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>toast(t('copied')), ()=>copyFallback(txt));
  }else copyFallback(txt);
}
function copyFallback(txt){
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); toast(t('copied')); }catch(e){}
  ta.remove();
}

/* ======================= theme + skin ======================= */
/* Two independent axes: data-theme (dark/light, "auto" resolves here) and
   data-skin (ice = no attribute / zaza / stim). CSS owns the palettes;
   this only stamps the attributes and keeps the browser-chrome color in step. */
const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
const SKIN_META = { /* status-bar color per skin+mode, matches each --atmo top tone */
  ice:      { dark:'#0a1220', light:'#eef2f8' },
  zaza:     { dark:'#150c28', light:'#f0f2ec' },
  stim:     { dark:'#0b0d05', light:'#f7f8f2' },
  locked:   { dark:'#000000', light:'#f5f5f5' },
  aero:     { dark:'#082633', light:'#dff0f7' },
  golden:   { dark:'#1c1610', light:'#e9dfc9' },
  princess: { dark:'#241019', light:'#f6e7ee' }
};
/* fixed swatch colors for the skin pickers (dark palette bg + accent) - a new
   skin only needs entries here, in SKIN_META, the confetti map and a CSS token
   block. Retired skins (villain/batman/old, 2026-08-13) fall back to 'ice' via
   the hydrate/applyBak validation - no migration code needed. */
const SKIN_PREVIEW = {
  ice:      { bg:'#05070c', accent:'#38bdf8' },
  zaza:     { bg:'#0a0712', accent:'#4ade80' },
  stim:     { bg:'#030304', accent:'#c8f135' },
  locked:   { bg:'#000000', accent:'#f5f5f5' },
  aero:     { bg:'#04141c', accent:'#22d3ee' },
  golden:   { bg:'#120e08', accent:'#e0a32e' },
  princess: { bg:'#faf1f4', accent:'#db2777' }
};
function applyTheme(){
  const mode = S.theme==='auto' ? (mediaDark.matches?'dark':'light') : S.theme;
  const el = document.documentElement;
  el.dataset.theme = mode;
  const skin = SKIN_META[S.skin] ? S.skin : 'ice';
  if(skin==='ice') delete el.dataset.skin; else el.dataset.skin = skin;
  const meta = $('#themecolor');
  if(meta) meta.content = SKIN_META[skin][mode];
}
mediaDark.addEventListener('change', ()=>{ if(S.theme==='auto') applyTheme(); });

