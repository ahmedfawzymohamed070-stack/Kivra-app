/* polish-warehouse.js — شكل تبويب "الطلبات والعمولة" عند المخزن.
   بيعتمد على polish-pages.js (لازم يتحمّل قبله). لو حصل أي خطأ الصفحة القديمة تفضل زي ما هي. */
(function () {
  const css = `
.wsum{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:10px 12px;margin-bottom:8px;box-shadow:0 1px 6px rgba(166,61,158,.07)}
.wsum .pgt{margin:0 0 8px}
.wst{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.wst div{background:#faf3f9;border:1px solid #f0dcec;border-radius:10px;padding:7px 4px;text-align:center}
.wst small{display:block;font-size:11px;color:var(--mu)}
.wst b{display:block;font-size:14px;margin-top:2px}
.wst .hot{background:linear-gradient(135deg,var(--p),var(--p2));border-color:transparent;color:#fff}
.wst .hot small{color:#ffe9f6}
.wfee{display:flex;gap:6px;margin-top:6px}
.wfee div{flex:1;background:#faf3f9;border:1px solid #f0dcec;border-radius:10px;padding:6px 8px;font-size:12px;color:#5a4562}
.wfee b{display:block;font-size:13.5px;color:var(--tx)}
.wfc{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 8px}
.wfc::-webkit-scrollbar{display:none}
.wfc .chip{border-radius:99px!important;padding:5px 13px!important;font-size:12.5px!important;border:1px solid var(--bd)!important;background:#fff!important;color:var(--p)!important;white-space:nowrap}
.wfc .chip.on{background:linear-gradient(135deg,var(--p),var(--p2))!important;color:#fff!important;border-color:transparent!important}
.oc .oaddr{font-size:12.5px;color:var(--mu);margin-bottom:2px}
`;
  const st = document.createElement('style');
  st.id = 'polish-warehouse';
  st.textContent = css;
  document.head.appendChild(st);

  let FIL = 'all';
  const GRP = { pending: ['pending'], run: ['accepted', 'delivered'], done: ['received'], bad: ['rejected', 'cancelled'] };
  const CHIPS = [['all', 'الكل'], ['pending', 'جديدة'], ['run', 'قيد التنفيذ'], ['done', 'مكتملة'], ['bad', 'ملغية']];
  const inGrp = (k, o) => k === 'all' || GRP[k].includes(o.status);

  function card(o) {
    const it = o.items || [];
    const com = it.reduce((s, i) => s + Number(i.commission || 0), 0);
    const net = it.reduce((s, i) => s + Number(i.net || 0), 0);
    const cls = o.status === 'received' ? 'ok' : (o.status === 'rejected' || o.status === 'cancelled') ? 'bad' : o.status === 'delivered' ? 'info' : '';
    const bcls = o.status === 'received' ? 'approved' : (o.status === 'rejected' || o.status === 'cancelled') ? 'rejected' : 'pending';
    let act = '';
    if (o.status === 'pending') act = ob('قبول', o.id, 'accepted') + ob('رفض', o.id, 'rejected', 'red');
    else if (o.status === 'accepted') act = ob('تم التسليم', o.id, 'delivered') + ob('إلغاء الطلب', o.id, 'rejected', 'red');
    act += '<button class="ghost" data-act="openloc" data-id="' + esc(o.id) + '">📍 موقع الصيدلية</button>';
    const phone = String(o.pharmacy_phone || '').replace(/[^\d+]/g, '');
    const lines = it.map(i =>
      '<div class="oln"><div><div class="oname">' + esc(i.name) + '</div><div class="muted">' + esc(i.qty) + ' × ' + money(i.unit_price) + '</div></div>' +
      '<b>' + money(Number(i.qty) * Number(i.unit_price)) + '</b></div>').join('');
    return '<div class="oc ' + cls + '">' +
      '<div class="oh"><div><b>طلب #' + esc(o.order_no) + '</b> <span class="badge ' + bcls + '">' + esc(OST[o.status] || o.status) + '</span></div><span class="od">' + fd(o.created_at) + '</span></div>' +
      '<div class="ow">🏥 <b>' + esc(o.pharmacy) + '</b>' + (phone ? ' · <a href="tel:' + esc(phone) + '">' + esc(o.pharmacy_phone) + '</a>' : '') + '</div>' +
      (o.pharmacy_address ? '<div class="oaddr">العنوان: ' + esc(o.pharmacy_address) + '</div>' : '') +
      lines +
      '<div class="otot"><span>الإجمالي</span><b>' + money(o.total) + '</b></div>' +
      '<div class="wfee"><div>عمولة المنصة<b>' + money(com) + '</b></div><div>صافيك بعد العمولة<b>' + money(net) + '</b></div></div>' +
      (o.status === 'delivered' ? '<div class="onote">يتأكد الاستلام تلقائياً بعد 7 أيام من التسليم.</div>' : '') +
      (o.received_at ? '<div class="onote">تاريخ الاستلام: ' + fd(o.received_at) + (o.auto_received ? ' (تلقائي)' : '') + '</div>' : '') +
      '<div class="row">' + act + '</div></div>';
  }

  function draw(m, x) {
    const l = Array.isArray(ORD) ? ORD : [];
    m.innerHTML =
      '<div class="wsum"><div class="pgt">حسابك مع المنصة (العمولة)</div>' +
      '<div class="wst"><div><small>مستحقة للمنصة</small><b>' + money(x.due) + '</b></div><div><small>المسدّد</small><b>' + money(x.paid) + '</b></div>' +
      '<div class="hot"><small>المتبقي</small><b>' + money(x.balance) + '</b></div></div>' +
      '<div class="muted" style="margin-top:6px">العمولة بتتحسب من الطلبات المستلمة بس.</div></div>' +
      '<div class="pgt">الطلبات <span>(' + l.length + ')</span></div><div class="wfc" id="wfc"></div><div id="wol"></div>';
    const paint = () => {
      document.getElementById('wfc').innerHTML = CHIPS.map(([k, t]) => {
        const n = l.filter(o => inGrp(k, o)).length;
        return '<button type="button" class="chip' + (FIL === k ? ' on' : '') + '" data-f="' + k + '">' + t + ' (' + n + ')</button>';
      }).join('');
      const f = l.filter(o => inGrp(FIL, o));
      document.getElementById('wol').innerHTML = f.length ? f.map(card).join('') : '<div class="card"><p class="muted">لا توجد طلبات.</p></div>';
    };
    document.getElementById('wfc').onclick = e => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      FIL = b.dataset.f;
      paint();
    };
    paint();
  }

  const orig = V.warehouse && V.warehouse.ord;
  if (!orig) return;
  V.warehouse.ord = async function (m) {
    await orig(m);
    try {
      FIL = 'all';
      const x = (ok(await sb.rpc('my_ledger')) || [])[0] || {};
      draw(m, x);
    } catch (e) { /* لو حصل أي خطأ، الصفحة القديمة تفضل زي ما هي */ }
  };
})();
