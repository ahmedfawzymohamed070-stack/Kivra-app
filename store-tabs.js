/* store-tabs.js — تبويب "متجري" عند الصيدلية (الطلبات + بروفايل المتجر) وتبويب "طلباتي" عند العميل */
(function () {
  const st = document.createElement('style');
  st.textContent = `
.so-o{border:1px solid #dfe8e7;border-radius:14px;padding:12px;margin:10px 0;background:#fff}
.so-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.so-h b{font-size:16px;color:#1c2423}
.so-b{font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;background:#eef5f4;color:#1F6F6B}
.so-b.st-pending{background:#fff3d6;color:#8a5a00}.so-b.st-shipped{background:#e0eefc;color:#0b5394}
.so-b.st-delivered{background:#d8f3e3;color:#0a5a41}.so-b.st-rejected,.so-b.st-cancelled{background:#fde2de;color:#9b2a1d}
.so-bx{background:#f5f9f8;border-radius:10px;padding:8px 10px;margin:8px 0;font-size:13px;line-height:1.8}
.so-it{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px dashed #e3ecea;font-size:13px}
.so-t{display:flex;justify-content:space-between;font-size:13px;padding:2px 0}.so-t.g{font-weight:800;font-size:15px}
.so-ch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.so-ch button{padding:8px 14px;border-radius:99px;background:#eef5f4;color:#1F6F6B;font-size:13px}.so-ch button.on{background:#1F6F6B;color:#fff}
.so-ac{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.so-ac button{flex:1;min-width:110px}
.so-in{display:flex;gap:6px;margin-top:8px}.so-in input{flex:1;min-width:0}
.so-tl{margin:8px 0;padding-right:4px}.so-s{display:flex;gap:8px;align-items:flex-start;padding:4px 0;font-size:13px;color:#8a9a98}
.so-s i{width:14px;height:14px;border-radius:50%;background:#cfd8d7;margin-top:3px;flex:none}.so-s.d{color:#1c2423}.so-s.d i{background:#1F6F6B}
`;
  document.head.appendChild(st);

  const ST = { pending: 'جديد', accepted: 'مقبول', shipped: 'تم الشحن', delivered: 'تم التسليم', rejected: 'مرفوض', cancelled: 'ملغي' };
  const RANK = { pending: 0, accepted: 1, shipped: 2, delivered: 3 };
  const E = s => esc(s == null ? '' : s);
  const D = t => { try { return t ? new Date(t).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : ''; } catch (e) { return ''; } };
  const cur = () => { try { return TAB; } catch (e) { return ''; } };
  const setMain = h => { const m = document.getElementById('main'); if (m) m.innerHTML = h; return h; };
  const itemsHtml = o => (o.items || []).map(x => '<div class="so-it"><span>' + E(x.name) + ' × ' + E(x.qty) + '</span><b>' + money(x.price * x.qty) + '</b></div>').join('');
  const totalsHtml = o => '<div class="so-t"><span>المنتجات</span><span>' + money(o.subtotal) + '</span></div>' +
    (o.mode === 'delivery' ? '<div class="so-t"><span>التوصيل</span><span>' + money(o.fee) + '</span></div>' : '') +
    '<div class="so-t g"><span>الإجمالي</span><span>' + money(o.total) + '</span></div>';
  const mapLink = o => (o.lat != null && o.lng != null) ? ' <a href="https://www.google.com/maps?q=' + o.lat + ',' + o.lng + '" target="_blank" rel="noopener">📍 الخريطة</a>' : '';
  const driverHtml = o => (o.driver_name ? '<div class="so-bx">🚚 المندوب: <b>' + E(o.driver_name) + '</b> · <a href="tel:' + E(o.driver_phone) + '">📞 ' + E(o.driver_phone) + '</a></div>' : '');

  // ===== الصيدلية: تبويب متجري =====
  let ORD = null, OF = 'new', SS = 'orders';
  const grp = o => o.status === 'pending' ? 'new' : (o.status === 'accepted' || o.status === 'shipped') ? 'run' : 'done';
  async function fetchO() { try { ORD = ok(await sb.rpc('store_orders_for_pharmacy')) || []; } catch (e) { ORD = []; toast('طلبات المتجر مش متاحة دلوقتي'); } }
  function pCard(o) {
    let act = '';
    if (o.status === 'pending') act = '<button type="button" data-soa="accepted" data-id="' + o.id + '">✅ قبول</button><button type="button" class="red" data-soa="rejected" data-id="' + o.id + '">رفض</button>';
    else if (o.status === 'accepted' && o.mode === 'delivery')
      act = '<div class="so-in" style="width:100%"><input data-sod="name" data-id="' + o.id + '" placeholder="اسم المندوب"><input data-sod="phone" data-id="' + o.id + '" type="tel" placeholder="رقم المندوب"></div><button type="button" data-soa="ship" data-id="' + o.id + '">🚚 تم الشحن</button>';
    else if (o.status === 'accepted') act = '<button type="button" data-soa="delivered" data-id="' + o.id + '">📦 تم التسليم للعميل</button>';
    else if (o.status === 'shipped') act = '<button type="button" data-soa="delivered" data-id="' + o.id + '">📦 تم التسليم</button>';
    if (['accepted', 'shipped', 'delivered'].indexOf(o.status) > -1) act += '<button type="button" class="ghost" data-soa="print" data-id="' + o.id + '">🖨️ طباعة</button>';
    return '<div class="so-o"><div class="so-h"><b>#' + E(o.order_no) + '</b><span class="so-b st-' + o.status + '">' + (ST[o.status] || E(o.status)) + '</span><span class="muted">' + D(o.created_at) + '</span></div>' +
      '<div class="so-bx"><b>' + E(o.name) + '</b> · <a href="tel:' + E(o.phone) + '">📞 ' + E(o.phone) + '</a><br>' + (o.mode === 'delivery' ? '🛵 توصيل: ' + E(o.address) + mapLink(o) : '🏬 استلام من الصيدلية') +
      (o.notes ? '<br>📝 ' + E(o.notes) : '') + '</div>' + itemsHtml(o) + totalsHtml(o) + driverHtml(o) + (act ? '<div class="so-ac">' + act + '</div>' : '') + '</div>';
  }
  function ordersHtml() {
    const c = { new: 0, run: 0, done: 0 }; (ORD || []).forEach(o => c[grp(o)]++);
    const list = (ORD || []).filter(o => OF === 'all' || grp(o) === OF);
    const chip = (k, l) => '<button type="button" data-soa="f" data-f="' + k + '" class="' + (OF === k ? 'on' : '') + '">' + l + (k !== 'all' ? ' (' + c[k] + ')' : '') + '</button>';
    return '<div class="so-ch">' + chip('new', 'جديدة') + chip('run', 'شغّالة') + chip('done', 'منتهية') + chip('all', 'الكل') + '<button type="button" data-soa="refresh">🔄</button></div>' +
      (list.length ? list.map(pCard).join('') : '<p class="muted">مفيش طلبات هنا.</p>');
  }
  function storeHtml() {
    const n = (ORD || []).filter(o => o.status === 'pending').length;
    const sec = (k, l) => '<button type="button" data-soa="sec" data-s="' + k + '" class="' + (SS === k ? 'on' : '') + '">' + l + '</button>';
    return '<div id="so-root"><h2>🛍️ متجري</h2><div class="so-ch">' + sec('orders', '📦 الطلبات' + (n ? ' (' + n + ')' : '')) + sec('profile', '🏬 بروفايل المتجر') + '</div>' +
      (SS === 'orders' ? ordersHtml() : '<div id="sx-host"></div>') + '</div>';
  }
  function repaintStore() { if (cur() === 'store') setMain(storeHtml()); }

  function printOrder(o) {
    const w = window.open('', '_blank'); if (!w) { toast('اسمح بالنوافذ المنبثقة عشان الطباعة'); return; }
    const rows = (o.items || []).map((x, i) => '<tr><td>' + (i + 1) + '</td><td>' + E(x.name) + '</td><td>' + E(x.qty) + '</td><td>' + money(x.price) + '</td><td>' + money(x.price * x.qty) + '</td></tr>').join('');
    w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>طلب ' + E(o.order_no) + '</title><style>' +
      '@page{size:A4;margin:14mm}body{font-family:Tahoma,Arial,sans-serif;color:#111;font-size:14px}h1{margin:0;color:#1F6F6B}.r{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1F6F6B;padding-bottom:8px}' +
      '.bx{border:1px solid #bbb;border-radius:8px;padding:8px 12px;margin:10px 0;line-height:1.9}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #999;padding:6px;text-align:center}th{background:#eef5f4}' +
      '.t{margin-right:auto;width:260px}.t div{display:flex;justify-content:space-between;padding:3px 0}.sg{display:flex;justify-content:space-between;margin-top:50px}.sg div{width:40%;border-top:1px solid #333;text-align:center;padding-top:6px}' +
      '.pb{margin:12px 0;padding:10px 20px;font-size:16px}@media print{.pb{display:none}}</style></head><body>' +
      '<div class="r"><div><h1>' + E(ME.business_name || 'الصيدلية') + '</h1><div>' + E(ME.phone || '') + '</div></div><div style="text-align:left"><b style="font-size:20px">إذن تسليم</b><br>رقم الطلب: <b>' + E(o.order_no) + '</b><br>' + D(o.created_at) + '</div></div>' +
      '<div class="bx"><b>العميل:</b> ' + E(o.name) + '<br><b>الموبايل:</b> ' + E(o.phone) + '<br><b>' + (o.mode === 'delivery' ? 'عنوان التوصيل:' : 'الاستلام:') + '</b> ' + (o.mode === 'delivery' ? E(o.address) : 'من الصيدلية') + (o.notes ? '<br><b>ملاحظات:</b> ' + E(o.notes) : '') + (o.driver_name ? '<br><b>المندوب:</b> ' + E(o.driver_name) + ' - ' + E(o.driver_phone) : '') + '</div>' +
      '<table><tr><th>#</th><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>' + rows + '</table>' +
      '<div class="t"><div><span>المنتجات</span><span>' + money(o.subtotal) + '</span></div>' + (o.mode === 'delivery' ? '<div><span>التوصيل</span><span>' + money(o.fee) + '</span></div>' : '') + '<div><b>الإجمالي</b><b>' + money(o.total) + '</b></div></div>' +
      '<div class="sg"><div>توقيع المستلم</div><div>توقيع الصيدلية</div></div><button class="pb" onclick="window.print()">🖨️ طباعة / حفظ PDF</button></body></html>');
    w.document.close();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('#so-root [data-soa]'); if (!b) return;
    const k = b.dataset.soa, id = Number(b.dataset.id);
    if (k === 'sec') { SS = b.dataset.s; repaintStore(); return; }
    if (k === 'f') { OF = b.dataset.f; repaintStore(); return; }
    if (k === 'refresh') { run(async () => { await fetchO(); repaintStore(); }); return; }
    if (k === 'print') { const o = (ORD || []).find(x => x.id === id); if (o) printOrder(o); return; }
    if (k === 'ship') {
      const nm = document.querySelector('[data-sod="name"][data-id="' + id + '"]'), ph = document.querySelector('[data-sod="phone"][data-id="' + id + '"]');
      run(async () => { ok(await sb.rpc('store_ship_order', { p_id: id, p_driver_name: nm ? nm.value.trim() : '', p_driver_phone: ph ? ph.value.trim() : '' })); toast('تم الشحن'); await fetchO(); repaintStore(); });
      return;
    }
    run(async () => { ok(await sb.rpc('store_set_order_status', { p_id: id, p_status: k })); toast('تم التحديث'); await fetchO(); repaintStore(); });
  });

  // ===== العميل: تبويب طلباتي =====
  let MINE = null;
  function steps(o) {
    if (o.status === 'rejected' || o.status === 'cancelled') return '<div class="so-s d"><i style="background:#c0392b"></i>' + (o.status === 'rejected' ? 'الصيدلية رفضت الطلب' : 'تم إلغاء الطلب') + '</div>';
    const r = RANK[o.status] || 0, L = [['تم إرسال الطلب', o.created_at], ['الصيدلية قبلت الطلب', o.accepted_at]];
    if (o.mode === 'delivery') L.push(['تم الشحن', o.shipped_at]);
    L.push(['تم التسليم', o.delivered_at]);
    const idx = o.mode === 'delivery' ? [0, 1, 2, 3] : [0, 1, 3];
    return L.map((s, i) => '<div class="so-s ' + (r >= idx[i] ? 'd' : '') + '"><i></i><div>' + s[0] + (s[1] && r >= idx[i] ? ' <span class="muted">' + D(s[1]) + '</span>' : '') + '</div></div>').join('');
  }
  function cCard(o) {
    return '<div class="so-o"><div class="so-h"><b>#' + E(o.order_no) + '</b><span class="so-b st-' + o.status + '">' + (ST[o.status] || E(o.status)) + '</span><span class="muted">' + D(o.created_at) + '</span></div>' +
      '<div class="muted" style="margin:4px 0">🏬 ' + E(o.pharmacy) + ' · ' + (o.mode === 'delivery' ? '🛵 توصيل' : 'استلام من الصيدلية') + '</div>' +
      '<div class="so-tl">' + steps(o) + '</div>' + (o.status === 'shipped' || o.status === 'delivered' ? driverHtml(o) : '') + itemsHtml(o) + totalsHtml(o) +
      (o.status === 'pending' ? '<div class="so-ac"><button type="button" class="red" data-sca="cancel" data-id="' + o.id + '">إلغاء الطلب</button></div>' : '') + '</div>';
  }
  async function fetchM() { try { MINE = ok(await sb.rpc('store_my_orders')) || []; } catch (e) { MINE = []; toast('طلباتك مش متاحة دلوقتي'); } }
  function mineHtml() {
    return '<div id="so-croot"><h2>📦 طلباتي</h2><div class="so-ch"><button type="button" data-sca="refresh">🔄 تحديث</button></div>' +
      ((MINE || []).length ? MINE.map(cCard).join('') : '<p class="muted">لسه معملتش أي طلب.</p>') + '</div>';
  }
  function repaintMine() { if (cur() === 'sord') setMain(mineHtml()); }
  document.addEventListener('click', e => {
    const b = e.target.closest('#so-croot [data-sca]'); if (!b) return;
    if (b.dataset.sca === 'refresh') { run(async () => { await fetchM(); repaintMine(); }); return; }
    if (b.dataset.sca === 'cancel') run(async () => { if (!confirm('إلغاء الطلب؟')) return; ok(await sb.rpc('store_set_order_status', { p_id: Number(b.dataset.id), p_status: 'cancelled' })); toast('تم إلغاء الطلب'); await fetchM(); repaintMine(); });
  });

  // ===== تسجيل التبويبات =====
  try {
    if (typeof TABS !== 'undefined' && typeof V !== 'undefined') {
      if (TABS.pharmacy && V.pharmacy && !TABS.pharmacy.some(t => t[0] === 'store')) {
        const i = TABS.pharmacy.findIndex(t => t[0] === 'ord');
        TABS.pharmacy.splice(i < 0 ? TABS.pharmacy.length : i + 1, 0, ['store', '🛍️', 'متجري']);
        V.pharmacy.store = async function () { if (ORD === null) await fetchO(); return setMain(storeHtml()); };
      }
      if (TABS.customer && V.customer && !TABS.customer.some(t => t[0] === 'sord')) {
        const j = TABS.customer.findIndex(t => t[0] === 'acc');
        TABS.customer.splice(j < 0 ? TABS.customer.length : j, 0, ['sord', '📦', 'طلباتي']);
        V.customer.sord = async function () { await fetchM(); return setMain(mineHtml()); };
      }
      try { paintNav(); } catch (e) {}
    }
  } catch (e) {}
})();
