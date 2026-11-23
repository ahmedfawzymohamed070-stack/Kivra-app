/* kivra-shell.js — الشكل الجديد: صفحة رئيسية + قائمة جانبية (Drawer على الموبايل / Sidebar على الديسكتوب)
   بيتحمّل آخر ملف. بيقرأ بس من نفس الـ RPCs الموجودة، ومفيش تغيير في Business Logic أو DB. */
(function () {
'use strict';
if (window.__kvShell) return; window.__kvShell = 1;

var P = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  dist: 'M4 9l1-5h14l1 5M5 9v11h14V9',
  prod: 'M12 3l8 4v10l-8 4-8-4V7zM12 12l8-5M12 12v9M12 12L4 7',
  mine: 'M12 3l8 4v10l-8 4-8-4V7zM12 12l8-5M12 12v9M12 12L4 7',
  cart: 'M3 4h2l2.5 11h10.5l2-8H6M9 20h.01M17 20h.01',
  ord: 'M9 4h6v3H9zM7 5H6v16h12V5h-1M9 12h6M9 16h6',
  acc: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
  acct: 'M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M17 5.2a3 3 0 0 1 0 5.6',
  comm: 'M12 3v18M16 7c-1-1.4-2.6-2-4-2-2.4 0-4 1-4 3s1.6 3 4 3 4 1 4 3-1.6 3-4 3c-1.4 0-3-.6-4-2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M21 21l-5-5',
  out: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9'
};
function ic(k, s) {
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + P[k] + '"/></svg>';
}

/* ---------- CSS ---------- */
var css = ':root{--p:#0F6B5B;--p2:#1E8A76;--bg:#F6F9F8;--bd:#dcebe7;--tx:#14302b;--mu:#566663;--soft:#E6F2EF}' +
'header{background:#0A4A40!important;box-shadow:none!important;flex-wrap:nowrap!important}' +
'header span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px!important;color:#d6efe9!important}' +
'header button[data-act="logout"]{display:none!important}' +
'.kv-menu{background:rgba(255,255,255,.14)!important;width:44px;height:44px;padding:0!important;display:flex;align-items:center;justify-content:center;flex:none}' +
'nav button.on{color:#0F6B5B}' +
'.kv-hero{background:#0A4A40;color:#fff;border-radius:22px;padding:22px 20px 46px;position:relative;overflow:hidden}' +
'.kv-hero>*{position:relative}' +
'.kv-orb{position:absolute!important;left:-34px;top:-30px;width:160px;height:160px;border-radius:50%;background:#1E8A76;opacity:.5}' +
'.kv-orb2{position:absolute!important;left:70px;bottom:-50px;width:110px;height:110px;border-radius:50%;background:#0F6B5B;opacity:.8}' +
'.kv-sm{font-size:13px;opacity:.9}.kv-nm{font-size:22px;font-weight:700;margin-top:2px}.kv-tg{font-size:26px;font-weight:700;line-height:1.35;margin-top:10px}' +
'.kv-search{margin:-26px 14px 0;position:relative;background:#fff;border-radius:16px;box-shadow:0 6px 18px rgba(10,74,64,.16);height:52px;display:flex;align-items:center;gap:10px;padding:0 14px;color:#566663}' +
'.kv-search input{border:0;margin:0;padding:0;flex:1;width:auto;display:block;background:none;font-size:15px}.kv-search input:focus{outline:0}' +
'.kv-qa{display:grid;grid-template-columns:repeat(auto-fit,minmax(78px,1fr));gap:10px;margin-top:16px}' +
'.kv-qa button{background:#fff;color:#14302b;border-radius:16px;box-shadow:0 2px 10px rgba(10,74,64,.1);display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 4px;font-size:13px;font-weight:600}' +
'.kv-qa button svg{color:#0F6B5B}' +
'h3.kv-h{margin:18px 2px 8px;font-size:16px;color:#14302b}' +
'.kv-st{display:flex;background:#fff;border-radius:16px;box-shadow:0 2px 10px rgba(10,74,64,.08)}' +
'.kv-st div{flex:1;text-align:center;padding:12px 2px}.kv-st b{display:block;font-size:20px;color:#0A4A40}.kv-st span{font-size:11px;color:#566663}' +
'.kv-promo{background:#0F6B5B;color:#fff;border-radius:18px;padding:18px 20px;margin-top:16px}.kv-promo b{font-size:20px;display:block}.kv-promo span{font-size:13px;opacity:.92}' +
'.kv-cats{display:flex;flex-wrap:wrap;gap:8px}.kv-cats button{background:#E6F2EF;color:#0A4A40;border-radius:14px;padding:12px 14px;font-weight:600;font-size:13px}' +
'.kv-note{background:#fff3cd;color:#7a5b00;border-radius:14px;padding:12px 14px;margin-top:14px;font-size:14px}' +
'#kv-drawer{position:fixed;top:0;bottom:0;right:0;width:300px;max-width:86vw;background:#fff;z-index:30;display:none;flex-direction:column;border-radius:24px 0 0 24px;box-shadow:-8px 0 30px rgba(0,0,0,.25);transform:translateX(105%);transition:transform .25s}' +
'body.kv-on #kv-drawer{display:flex}body.kv-open #kv-drawer{transform:none}' +
'#kv-scrim{position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(10,30,26,.45);z-index:29;display:none}body.kv-open #kv-scrim{display:block}' +
'.kv-dh{background:#0A4A40;color:#fff;padding:22px 18px;border-radius:24px 0 0 0;display:flex;gap:12px;align-items:center}' +
'.kv-av{width:46px;height:46px;border-radius:50%;background:#1E8A76;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;flex:none}' +
'.kv-dn b{display:block}.kv-dn span{font-size:12px;opacity:.85}' +
'.kv-dl{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:2px}' +
'.kv-dl button,.kv-df button{background:none;color:#2b3b38;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;font-size:15px;width:100%;text-align:start}' +
'.kv-dl button.on{background:#E6F2EF;color:#0A4A40;font-weight:700}' +
'.kv-df{border-top:1px solid #dcebe7;padding:10px 12px 18px}.kv-df button{color:#B03A2E;font-weight:600}' +
'.kv-emo{width:22px;text-align:center;font-size:18px}' +
'@media(min-width:1024px){' +
'body.kv-on{padding-right:250px;transition:padding .2s}body.kv-on.kv-col{padding-right:76px}' +
'body.kv-on #kv-drawer{transform:none;width:250px;border-radius:0;box-shadow:none;max-width:none;transition:width .2s}' +
'body.kv-on.kv-col #kv-drawer{width:76px}body.kv-col .kv-lb,body.kv-col .kv-dn{display:none}' +
'body.kv-on .kv-dh{border-radius:0}body.kv-on #kv-scrim{display:none!important}' +
'body.kv-on nav{display:none}body.kv-on main{max-width:1000px}body.kv-col .kv-dl button,body.kv-col .kv-df button{justify-content:center}}';
var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
var mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute('content', '#0A4A40');
try { if (localStorage.getItem('kv_col') === '1') document.body.classList.add('kv-col'); } catch (e) {}

/* ---------- الرئيسية ---------- */
async function vHome(m) {
  var role = ME.role;
  var o = []; try { o = ok(await sb.rpc('my_orders')) || []; } catch (e) {}
  var c = function (s) { return o.filter(function (x) { return x.status === s; }).length; };
  var qa, sts;
  if (role === 'pharmacy') {
    qa = [['dist', 'الموزعين'], ['prod', 'المنتجات'], ['cart', 'السلة'], ['ord', 'طلباتي']];
    sts = [[o.length, 'كل الطلبات'], [c('pending'), 'بانتظار المخزن'], [c('delivered'), 'بانتظار تأكيدك'], [cartCount(), 'في السلة']];
  } else if (role === 'warehouse') {
    qa = [['ord', 'الطلبات'], ['mine', 'منتجاتي'], ['acc', 'حسابي']];
    sts = [[o.length, 'كل الطلبات'], [c('pending'), 'طلبات جديدة'], [c('accepted'), 'جاهزة للتسليم'], [c('delivered'), 'تم التسليم']];
  } else {
    var pa = 0;
    try { var r = await sb.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending').neq('role', 'admin'); pa = r.count || 0; } catch (e) {}
    qa = [['acct', 'الحسابات'], ['ord', 'الطلبات'], ['comm', 'العمولة']];
    sts = [[o.length, 'كل الطلبات'], [c('pending'), 'طلبات جديدة'], [pa, 'حسابات للمراجعة'], [c('received'), 'مستلمة']];
  }
  var have = {}; document.querySelectorAll('#nav button[data-t]').forEach(function (b) { have[b.getAttribute('data-t')] = 1; });
  qa = qa.filter(function (x) { return have[x[0]]; });
  var cats = [];
  if (role === 'pharmacy') {
    try {
      var of = ok(await sb.rpc('get_offers')) || [], seen = {};
      of.forEach(function (x) { var k = (x.category || '').trim(); if (k && !seen[k]) { seen[k] = 1; cats.push(k); } });
      cats = cats.slice(0, 8);
    } catch (e) {}
  }
  var h = '<section class="kv-hero"><i class="kv-orb"></i><i class="kv-orb2"></i><div class="kv-sm">أهلاً بيك</div><div class="kv-nm">' + esc(ME.business_name) + '</div><div class="kv-tg">جمالك وصحتك<br>في مكان واحد</div></section>';
  h += role === 'pharmacy'
    ? '<form id="kv-sf" class="kv-search">' + ic('search', 20) + '<input id="kv-q" placeholder="ابحث عن منتج أو ماركة..." aria-label="بحث"></form>'
    : '<div class="kv-search">' + ic('acc', 20) + '<span>' + esc(ROLE[role]) + (role !== 'admin' ? ' · ' + esc(STATUS[ME.status] || '') : '') + '</span></div>';
  if (role === 'pharmacy' && ME.status !== 'approved') h += '<div class="kv-note">حسابك لسه ما اتفعّلش. ارفع الرخصة من «حسابي» عشان تظهر الأسعار وتقدر تطلب.</div>';
  h += '<div class="kv-qa">' + qa.map(function (x) { return '<button type="button" data-kv="go" data-t="' + x[0] + '">' + ic(x[0], 24) + '<span>' + x[1] + '</span></button>'; }).join('') + '</div>';
  h += '<h3 class="kv-h">إحصائيات سريعة</h3><div class="kv-st">' + sts.map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>';
  h += '<div class="kv-promo"><b>Kivra</b><span>منتجات أصلية • أفضل الأسعار من موزعين مفعّلين</span></div>';
  if (cats.length) h += '<h3 class="kv-h">أقسام المنتجات</h3><div class="kv-cats">' + cats.map(function (k) { return '<button type="button" data-kv="cat" data-q="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div>';
  m.innerHTML = h;
}
['pharmacy', 'warehouse', 'admin'].forEach(function (r) {
  if (!TABS[r].some(function (x) { return x[0] === 'home'; })) TABS[r].unshift(['home', '🏠', 'الرئيسية']);
  V[r].home = vHome;
});

/* ---------- القائمة الجانبية ---------- */
var mq = window.matchMedia('(min-width:1024px)'), B = document.body;
function closeD() { B.classList.remove('kv-open'); }
function toggle() {
  if (mq.matches) { B.classList.toggle('kv-col'); try { localStorage.setItem('kv_col', B.classList.contains('kv-col') ? '1' : '0'); } catch (e) {} }
  else B.classList.toggle('kv-open');
}
function paintDrawer() {
  var d = document.getElementById('kv-drawer'); if (!d) return;
  var items = [].slice.call(document.querySelectorAll('#nav button[data-act="tab"]')).map(function (b) {
    var t = b.getAttribute('data-t'), cl = b.cloneNode(true);
    var emo = (cl.querySelector('.ico') || {}).textContent || '';
    [].slice.call(cl.querySelectorAll('.ico,.cnt')).forEach(function (n) { n.remove(); });
    return '<button type="button" class="' + (b.classList.contains('on') ? 'on' : '') + '" data-kv="go" data-t="' + esc(t) + '">' +
      (P[t] ? ic(t, 22) : '<span class="kv-emo">' + esc(emo) + '</span>') + '<span class="kv-lb">' + esc(cl.textContent.trim()) + '</span></button>';
  }).join('');
  d.innerHTML = '<div class="kv-dh"><div class="kv-av">' + esc((ME.business_name || '?').trim().charAt(0)) + '</div><div class="kv-dn"><b>' + esc(ME.business_name) + '</b><span>' + esc(ROLE[ME.role]) + '</span></div></div>' +
    '<div class="kv-dl">' + items + '</div><div class="kv-df"><button type="button" data-act="logout">' + ic('out', 22) + '<span class="kv-lb">تسجيل الخروج</span></button></div>';
}
var raf = 0;
function ensure() {
  raf = 0;
  var app = document.getElementById('app'), h = app && app.querySelector('header');
  if (!h || typeof ME === 'undefined' || !ME) { B.classList.remove('kv-on', 'kv-open'); return; }
  B.classList.add('kv-on');
  if (!h.querySelector('.kv-menu')) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'kv-menu'; b.setAttribute('aria-label', 'القائمة'); b.setAttribute('data-kv', 'menu'); b.innerHTML = ic('menu', 24);
    h.insertBefore(b, h.firstChild);
  }
  if (!document.getElementById('kv-drawer')) {
    var d = document.createElement('aside'); d.id = 'kv-drawer'; d.setAttribute('aria-label', 'القائمة الجانبية');
    var s = document.createElement('div'); s.id = 'kv-scrim'; s.setAttribute('data-kv', 'close');
    B.appendChild(s); B.appendChild(d);
  }
  paintDrawer();
}
function sched() { if (!raf) raf = requestAnimationFrame(ensure); }

function search(q) {
  run(async function () {
    await show('prod');
    var i = document.getElementById('q');
    if (i) { i.value = q; i.dispatchEvent(new Event('input', { bubbles: true })); }
  });
}
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-kv]'); if (!el) return;
  var a = el.getAttribute('data-kv');
  if (a === 'menu') toggle();
  else if (a === 'close') closeD();
  else if (a === 'go') {
    closeD();
    var nb = document.querySelector('#nav button[data-t="' + el.getAttribute('data-t') + '"]');
    if (nb) nb.click();
  } else if (a === 'cat') search(el.getAttribute('data-q'));
});
document.addEventListener('submit', function (e) {
  if (e.target.id === 'kv-sf') { e.preventDefault(); search(document.getElementById('kv-q').value.trim()); }
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeD(); });
new MutationObserver(sched).observe(document.getElementById('app'), { childList: true, subtree: true });
sched();
})();
