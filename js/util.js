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
/* session volume in kg: work sets only (warmups excluded), external load with
   x2 pairs doubled and the machine base added - THE one volume formula; the
   finish summary, history rows and every chart must all agree on it */
function woVolume(exs){
  return exs.reduce((a,e)=>a+e.sets.filter(s=>!s.warm)
    .reduce((b,s)=>b+(s.weight*(e.x2?2:1)+(e.mb||0))*s.reps,0),0);
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
  zaza:     { dark:'#150c28', light:'#f0f2ec' },
  stim:     { dark:'#0b0d05', light:'#f7f8f2' },
  locked:   { dark:'#000000', light:'#f5f5f5' },
  aero:     { dark:'#082633', light:'#dff0f7' },
  golden:   { dark:'#1c1610', light:'#e9dfc9' },
  princess: { dark:'#3a1d2b', light:'#f6e7ee' },
  spooder:  { dark:'#101a3c', light:'#dde5f8' },
  batman:   { dark:'#0c1016', light:'#e9eaee' }
};
/* skin-picker swatches: each shows the skin's real sky (atmo-top -> bg gradient)
   plus its accent dot(s) - two dots for the two-color skins. Object ORDER is the
   picker order: mono first (the default), then blues, greens, yellows, warm
   tones, pink. A new skin needs entries here, in SKIN_META, the confetti map and
   a CSS token block. Retired skins (villain/old, the original ice) map or fall
   back via hydrate/applyBak validation - no migration code needed. */
const SKIN_PREVIEW = {
  locked:   { bg:'linear-gradient(135deg,#1f1f1f,#000000)', accent:'#f5f5f5' },
  aero:     { bg:'linear-gradient(135deg,#0c3c52,#04141c)', accent:'#22d3ee' },
  spooder:  { bg:'linear-gradient(135deg,#1a2c63,#070a18)', accent:'#f43f4b', accent2:'#4f74ff' },
  zaza:     { bg:'linear-gradient(135deg,#2a1856,#0a0712)', accent:'#4ade80', accent2:'#a855f7' },
  stim:     { bg:'linear-gradient(135deg,#1a2108,#030304)', accent:'#c8f135' },
  batman:   { bg:'linear-gradient(135deg,#232b3a,#05060a)', accent:'#ffd60a' },
  golden:   { bg:'linear-gradient(135deg,#332714,#120e08)', accent:'#e0a32e' },
  princess: { bg:'linear-gradient(135deg,#f6e7ee,#ecc3d8)', accent:'#db2777' }
};
function applyTheme(){
  const mode = S.theme==='auto' ? (mediaDark.matches?'dark':'light') : S.theme;
  const el = document.documentElement;
  el.dataset.theme = mode;
  const skin = SKIN_META[S.skin] ? S.skin : 'locked';
  el.dataset.skin = skin; /* every skin has a data-skin block; bare :root is only the fallback layer */
  const meta = $('#themecolor');
  if(meta) meta.content = SKIN_META[skin][mode];
}
mediaDark.addEventListener('change', ()=>{ if(S.theme==='auto') applyTheme(); });

