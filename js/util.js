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
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>el.classList.remove('show'), 2200);
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

/* ======================= theme ======================= */
const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){
  const mode = S.theme==='auto' ? (mediaDark.matches?'dark':'light') : S.theme;
  document.documentElement.dataset.theme = mode;
  const meta = $('#themecolor');
  if(meta) meta.content = mode==='dark' ? '#0a1220' : '#eef2f8'; /* matches the topbar's blended tone */
}
mediaDark.addEventListener('change', ()=>{ if(S.theme==='auto') applyTheme(); });

