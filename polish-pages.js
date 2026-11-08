/* polish-pages.js — شكل صفحتي "طلباتي" و"الموزعين" عند الصيدلية.
   بيعيد رسم الصفحة من البيانات اللي الصفحة الأصلية حمّلتها، ولو حصل أي خطأ الصفحة القديمة تفضل زي ما هي.
   بيتحمّل في آخر index.html بعد polish-ui.js. لو مش عاجبك امسحه والشكل يرجع. */
(function () {
  const css = `
.pgt{font-size:15px;font-weight:700;color:var(--p);margin:4px 2px 8px}
.pgt span{color:var(--mu);font-weight:400;font-size:12.5px}

/* طلباتي */
.oc{background:#fff;border:1px solid var(--bd);border-inline-start:4px solid var(--ac,#d9a21b);border-radius:12px;padding:10px 12px;margin-bottom:8px;box-shadow:0 1px 6px rgba(166,61,158,.07)}
.oc.ok{--ac:#2e9e72}.oc.bad{--ac:#c0392b}.oc.info{--ac:var(--p)}
.oh{display:flex;align-items:center;justify-content:space-between;gap:8px}
.oh b{font-size:15px}
.oh .od{font-size:12px;color:var(--mu)}
.ow{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0 4px;font-size:13px;color:#5a4562}
.ow a{color:var(--p);text-decoration:none;direction:ltr}
.oln{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px dashed var(--bd)}
.oln .oname{font-size:13.5px;font-weight:600}
.oln b{white-space:nowrap;font-size:13.5px}
.otot{display:flex;justify-content:space-between;align-items:center;background:var(--soft);border-radius:10px;padding:8px 10px;margin-top:6px}
.otot b{color:var(--p);font-size:15.5px}
.onote{font-size:12px;color:var(--mu);margin-top:6px}
.oc .row{margin-top:8px!important}
.oc .row button{flex:1;padding:8px 10px!important;border-radius:10px!important}

/* الموزعين */
#wq{background:#fff!important;border:1px solid var(--bd)!important;border-radius:12px!important;padding:10px 12px!important;margin:0 0 8px!important}
.dc{display:flex;gap:10px;background:#fff;border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:8px;box-shadow:0 1px 6px rgba(166,61,158,.07)}
.dc .av{width:46px!important;height:46px!important;border-radius:12px!important;font-size:20px!important}
.db{flex:1;min-width:0}
.dh{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dn{font-size:14.5px}
.rt{background:#fff6dc;color:#8a6200;border-radius:99px;padding:1px 9px;font-size:12px;white-space:nowrap}
.rt.new{background:var(--soft);color:var(--p)}
.dm{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 8px}
.dm span{background:#faf3f9;border:1px solid #f0dcec;border-radius:99px;padding:2px 9px;font-size:12px;color:#5a4562}
.dc button{width:100%;padding:8px!important;border-radius:10px!important}
`;
  const st = document.createElement('style');
  st.id = 'polish-pages';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- طلباتي ---------- */
  function orderCard(o) {
    const it = o.items || [];
    const cls = o.status === 'received' ? 'ok' : (o.status === 'rejected' || o.status === 'cancelled') ? 'bad' : o.status === 'delivered' ? 'info' : '';
    const bcls = o.status === 'received' ? 'approved' : (o.status === 'rejected' || o.status === 'cancelled') ? 'rejected' : 'pending';
    let act = '';
    if (o.status === 'pending') act = ob('إلغاء الطلب', o.id, 'cancelled', 'red');
    else if (o.status === 'delivered') act = ob('تأكيد الاستلام', o.id, 'received');
    else if (o.status === 'received' && !RATED.has(o.id)) act = '<button class="ghost" data-act="rate" data-id="' + esc(o.id) + '">⭐ قيّم المخزن</button>';
    const phone = String(o.warehouse_phone || '').replace(/[^\d+]/g, '');
    const lines = it.map(i =>
      '<div class="oln"><div><div class="oname">' + esc(i.name) + '</div><div class="muted">' + esc(i.qty) + ' × ' + money(i.unit_price) + '</div></div>' +
      '<b>' + money(Number(i.qty) * Number(i.unit_price)) + '</b></div>').join('');
    return '<div class="oc ' + cls + '">' +
      '<div class="oh"><div><b>طلب #' + esc(o.order_no) + '</b> <span class="badge ' + bcls + '">' + esc(OST[o.status] || o.status) + '</span></div><span class="od">' + fd(o.created_at) + '</span></div>' +
      '<div class="ow">🏬 <b>' + esc(o.warehouse) + '</b>' + (phone ? ' · <a href="tel:' + esc(phone) + '">' + esc(o.warehouse_phone) + '</a>' : '') + '</div>' +
      lines +
      '<div class="otot"><span>الإجمالي</span><b>' + money(o.total) + '</b></div>' +
      (o.status === 'delivered' ? '<div class="onote">يتأكد الاستلام تلقائياً بعد 7 أيام من التسليم.</div>' : '') +
      (o.received_at ? '<div class="onote">تاريخ الاستلام: ' + fd(o.received_at) + (o.auto_received ? ' (تلقائي)' : '') + '</div>' : '') +
      (act ? '<div class="row">' + act + '</div>' : '') +
      '</div>';
  }
  function drawOrders(m) {
    const l = Array.isArray(ORD) ? ORD : [];
    m.innerHTML = '<div class="pgt">طلباتي <span>(' + l.length + ')</span></div>' +
      (l.length ? l.map(orderCard).join('') : '<div class="card"><p class="muted">لا توجد طلبات.</p></div>');
  }

  /* ---------- الموزعين ---------- */
  function whCard(w) {
    const rated = Number(w.rating_count) > 0;
    const min = Number(w.min_order) > 0 ? money(w.min_order) : 'لا يوجد';
    return '<div class="dc"><div class="av">' + esc((w.business_name || '?').trim().charAt(0)) + '</div><div class="db">' +
      '<div class="dh"><b class="dn">' + esc(w.business_name) + '</b><span class="rt' + (rated ? '' : ' new') + '">' + (rated ? '★ ' + Number(w.rating).toFixed(1) + ' (' + esc(w.rating_count) + ')' : 'جديد') + '</span></div>' +
      '<div class="dm">' + (w.city ? '<span>📍 ' + esc(w.city) + '</span>' : '') + '<span>الحد الأدنى: ' + min + '</span>' +
      (w.delivery_days ? '<span>🚚 ' + esc(w.delivery_days) + '</span>' : '') + '<span>📦 ' + esc(w.products_count) + ' منتج</span></div>' +
      '<button class="ghost" data-act="whfilter" data-id="' + esc(w.id) + '">عرض المنتجات</button></div></div>';
  }
  function drawDist(m) {
    const list = Array.isArray(WH) ? WH : [];
    if (!list.length) return; // رسالة "لا يوجد موزعين" الأصلية تفضل
    m.innerHTML = '<div class="pgt">الموزعين <span>(' + list.length + ')</span></div>' +
      '<input id="wq" placeholder="ابحث باسم المخزن أو المدينة"><div id="wl"></div>';
    const paint = () => {
      const q = (document.getElementById('wq').value || '').trim().toLowerCase();
      const f = list.filter(w => [w.business_name, w.city].join(' ').toLowerCase().includes(q));
      document.getElementById('wl').innerHTML = f.length ? f.map(whCard).join('') : '<p class="muted">لا توجد نتائج.</p>';
    };
    document.getElementById('wq').oninput = paint;
    paint();
  }

  /* ---------- التغليف: نكمّل الصفحة الأصلية ثم نعيد رسمها ---------- */
  function wrap(tab, draw) {
    const orig = V.pharmacy && V.pharmacy[tab];
    if (!orig) return;
    V.pharmacy[tab] = async function (m) {
      await orig(m);
      try { draw(m); } catch (e) { /* لو حصل خطأ، الصفحة القديمة تفضل زي ما هي */ }
    };
  }
  wrap('ord', drawOrders);
  wrap('dist', drawDist);
})();
