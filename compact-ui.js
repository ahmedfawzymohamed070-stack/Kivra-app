/* compact-ui.js — شكل أكثر تنظيماً وتقارباً: خطوط أصغر، مسافات أقل، وصفحة حسابي كقائمة صفوف.
   بيتحمّل في آخر index.html بعد باقي الملفات. */
(function () {
  const css = `
body{font-size:13.5px!important;line-height:1.45!important;background:#f6f1f6!important}
header{padding:calc(8px + env(safe-area-inset-top)) 12px 8px!important;gap:6px!important}
header b{font-size:17px!important}
header span{font-size:12px!important}
header button{padding:5px 10px!important;font-size:12px!important;border-radius:8px!important}
main{padding:8px 8px 76px!important}
.card{border-radius:10px!important;padding:10px 12px!important;margin-bottom:8px!important;box-shadow:none!important}
h2{font-size:15px!important;margin:0 0 6px!important}
label{margin:7px 0!important;font-size:12px!important}
input,select{padding:8px 10px!important;font-size:14px!important;border-radius:8px!important;margin-top:3px!important}
button{padding:7px 12px!important;font-size:13px!important;border-radius:8px!important}
.item,.wh{padding:8px 0!important}
.offer{padding:6px 0!important;margin-top:4px!important}
.muted{font-size:12px!important}
.price{font-size:15px!important}
.badge{font-size:11px!important;padding:1px 8px!important}
.av{width:38px!important;height:38px!important;border-radius:10px!important;font-size:17px!important}
.row{gap:6px!important}
nav button{padding:5px 2px!important;font-size:10px!important}
nav .ico{font-size:18px!important}
#toast{bottom:calc(64px + env(safe-area-inset-bottom))!important;font-size:13px!important}
.prof{display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,#a63d9e,#e0589a);color:#fff;border-radius:10px;padding:12px;margin-bottom:8px}
.prof .av{background:rgba(255,255,255,.25)!important}
.menu{background:#fff;border:1px solid #f0dcec;border-radius:10px;overflow:hidden;margin-bottom:8px}
.mrow{display:flex;align-items:center;gap:10px;padding:11px 12px;border-top:1px solid #f4e6f0;color:inherit;text-decoration:none;cursor:pointer}
.mrow:first-child{border-top:0}
.mi{width:30px;height:30px;border-radius:8px;background:#f6e8f3;display:flex;align-items:center;justify-content:center;font-size:16px;flex:none}
.mt{flex:1;font-size:14px}
.mc{color:#b79bb4;font-size:20px;line-height:1}
@supports (-webkit-touch-callout:none){input,select{font-size:16px!important}}`;
  const st = document.createElement('style');
  st.id = 'compact-ui';
  st.textContent = css;
  document.head.appendChild(st);

  let SHEETS = {};

  function openSheet(k) {
    const s = SHEETS[k];
    if (!s) return;
    const old = document.getElementById('sheet-ov');
    if (old) old.remove();
    const o = document.createElement('div');
    o.id = 'sheet-ov';
    o.style.cssText = 'position:fixed;inset:0;background:rgba(42,24,48,.5);z-index:30;display:flex;align-items:flex-end;justify-content:center';
    o.innerHTML = '<div style="background:#f6f1f6;width:100%;max-width:760px;max-height:90vh;overflow:auto;border-radius:16px 16px 0 0;padding:12px 10px calc(16px + env(safe-area-inset-bottom))">' +
      '<div class="row" style="justify-content:space-between;margin-bottom:8px"><b style="font-size:15px;color:#a63d9e">' + esc(s.title) + '</b><button class="ghost" data-close>إغلاق</button></div>' +
      s.html + '</div>';
    o.addEventListener('click', ev => {
      if (ev.target === o || ev.target.closest('[data-close]')) { o.remove(); return; }
      const a = ev.target.closest('[data-act]');
      if (a && ['saveloc', 'savewh', 'uplic'].includes(a.dataset.act)) {
        // نقفل النافذة بس لو العملية نجحت (رسالة النجاح بتبدأ بكلمة "تم")
        setTimeout(() => {
          const t = document.getElementById('toast');
          if (t && !t.hidden && /^تم/.test(t.textContent.trim())) o.remove();
        }, 1300);
      }
    });
    document.body.appendChild(o);
  }

  document.addEventListener('click', e => {
    const r = e.target.closest('[data-sheet]');
    if (!r) return;
    e.preventDefault();
    openSheet(r.dataset.sheet);
  });

  function rebuildAccount(m, role) {
    const cards = [...m.querySelectorAll(':scope > .card')];
    const find = re => cards.find(c => { const h = c.querySelector('h2'); return h && re.test(h.textContent.trim()); });
    const info = find(/^بيانات الحساب/), lic = find(/^حالة الحساب/);
    const loc = find(/العنوان والموقع/) || find(/بيانات المخزن/);
    const wa = m.querySelector('a[href^="https://wa.me/"]');
    const waHref = wa ? wa.getAttribute('href') : '';

    SHEETS = {};
    const rows = [];
    const stBadge = '<span class="badge ' + ME.status + '">' + STATUS[ME.status] + '</span>';
    const add = (key, icon, title, badge, html) => {
      if (!html) return;
      SHEETS[key] = { title, html };
      rows.push('<a class="mrow" data-sheet="' + key + '"><span class="mi">' + icon + '</span><span class="mt">' + title + '</span>' + (badge || '') + '<span class="mc">‹</span></a>');
    };
    add('acct', '👤', 'بيانات الحساب وحالته', stBadge, (info ? info.outerHTML : '') + (lic ? lic.outerHTML : ''));
    add('loc', role === 'pharmacy' ? '📍' : '🏬', role === 'pharmacy' ? 'العنوان والموقع' : 'بيانات المخزن للصيدليات', '', loc ? loc.outerHTML : '');
    rows.push('<a class="mrow" data-legal="terms"><span class="mi">📄</span><span class="mt">الشروط والأحكام</span><span class="mc">‹</span></a>');
    rows.push('<a class="mrow" data-legal="privacy"><span class="mi">🔒</span><span class="mt">سياسة الخصوصية</span><span class="mc">‹</span></a>');
    if (waHref) rows.push('<a class="mrow" href="' + esc(waHref) + '" target="_blank" rel="noopener"><span class="mi">💬</span><span class="mt">تواصل معنا عبر واتساب</span><span class="mc">‹</span></a>');
    rows.push('<a class="mrow" data-act="logout"><span class="mi">🚪</span><span class="mt">تسجيل الخروج</span><span class="mc">‹</span></a>');

    const initial = (ME.business_name || '?').trim().charAt(0);
    m.innerHTML = '<div class="prof"><div class="av">' + esc(initial) + '</div><div style="flex:1"><b>' + esc(ME.business_name) +
      '</b><div style="font-size:12px;opacity:.9">' + ROLE[ME.role] + (ME.phone ? ' · ' + esc(ME.phone) : '') + '</div></div>' + stBadge + '</div>' +
      '<div class="menu">' + rows.join('') + '</div>';
  }

  ['pharmacy', 'warehouse'].forEach(role => {
    const orig = V[role] && V[role].acc;
    if (!orig) return;
    V[role].acc = async function (m) {
      await orig(m);
      try { rebuildAccount(m, role); } catch (e) { /* لو حصل أي مشكلة، الصفحة القديمة تفضل زي ما هي */ }
    };
  });
})();
