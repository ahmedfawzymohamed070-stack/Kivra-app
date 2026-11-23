/* cosmo-brand.js — تغيير الاسم من Kivra / كيفرا إلى CosmoFast / كوزمو فاست + اللوجو الجديد.
   بيتحمّل آخر ملف. تغيير شكلي بس (نصوص ولوجو) ومفيش لمس للـ Business Logic. */
(function () {
'use strict';
if (window.__cfBrand) return; window.__cfBrand = 1;
var EN = 'CosmoFast', AR = 'كوزمو فاست';
var SVG = '<svg class="cf-ic" width="28" height="28" viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="112" fill="#0F6B5B"/><path d="M386.9 176.1A113 113 0 1 0 386.9 335.9" fill="none" stroke="#fff" stroke-width="51" stroke-linecap="round"/><path d="M104 190H145M75 256H145M104 322H145" stroke="#fff" stroke-width="28" stroke-linecap="round"/></svg>';
var st = document.createElement('style');
st.textContent = '.cf-lg{display:inline-flex;align-items:center;gap:8px;direction:ltr}.cf-lg .cf-ic{flex:none;border-radius:8px;box-shadow:0 0 0 1.5px rgba(255,255,255,.35)}' +
  '.logo.cf-big{display:flex;justify-content:center;background:none;-webkit-background-clip:initial;background-clip:initial;color:#0A4A40}.logo.cf-big .cf-ic{width:44px;height:44px}';
document.head.appendChild(st);

function rename(s) { return s.replace(/Kivra/gi, EN).replace(/كيفرا/g, AR); }
function textPass(root) {
  var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
  while ((n = w.nextNode())) {
    var p = n.parentNode && n.parentNode.nodeName;
    if (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA') continue;
    if (/Kivra|كيفرا/i.test(n.nodeValue)) list.push(n);
  }
  list.forEach(function (t) { t.nodeValue = rename(t.nodeValue); });
  [].forEach.call(root.querySelectorAll('[alt],[title],[placeholder],[aria-label]'), function (el) {
    ['alt', 'title', 'placeholder', 'aria-label'].forEach(function (a) {
      var v = el.getAttribute(a); if (v && /Kivra|كيفرا/i.test(v)) el.setAttribute(a, rename(v));
    });
  });
}
function logoPass() {
  var b = document.querySelector('#app header b');
  if (b && !b.querySelector('.cf-ic')) { b.innerHTML = '<span class="cf-lg">' + SVG + '<span>' + EN + '</span></span>'; }
  var l = document.querySelector('#app .logo');
  if (l && !l.querySelector('.cf-ic')) { l.className = 'logo cf-big'; l.innerHTML = '<span class="cf-lg">' + SVG + '<span>' + EN + '</span></span>'; }
}
function headPass() {
  if (/Kivra|كيفرا/i.test(document.title)) document.title = rename(document.title);
  var m = document.querySelector('meta[name="apple-mobile-web-app-title"]'); if (m) m.setAttribute('content', EN);
  [].forEach.call(document.querySelectorAll('link[rel="apple-touch-icon"],link[rel="icon"],link[rel="shortcut icon"]'), function (l) {
    if (!/v=cf/.test(l.href)) l.setAttribute('href', '/icon-192.png?v=cf');
  });
  if (!document.querySelector('link[rel="icon"]')) { var l = document.createElement('link'); l.rel = 'icon'; l.href = '/icon-192.png?v=cf'; document.head.appendChild(l); }
}
var raf = 0;
function go() { raf = 0; try { textPass(document.body); logoPass(); headPass(); } catch (e) {} }
function sched() { if (!raf) raf = requestAnimationFrame(go); }
new MutationObserver(sched).observe(document.body, { childList: true, subtree: true, characterData: true });
sched();
})();
