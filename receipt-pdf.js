/* receipt-pdf.js — طباعة / حفظ PDF للطلب.
   - المخزن: زرار "🖨️ إذن تسليم" (فيه المنتجات والمبلغ المستحق واسم المندوب وخانات توقيع).
   - الصيدلية والأدمن: زرار "🧾 إيصال PDF".
   بيظهر على الطلبات (قيد التجهيز / تم الشحن / تم التسليم). مفيش عمولة ولا صافي المخزن في أي مستند.
   بيفتح المستند جوه التطبيق، وزرار "طباعة / حفظ PDF" بيفتح قائمة الطباعة (اختار "حفظ كـ PDF").
   بيتحمّل قبل polish-theme.js. لو حصل أي خطأ التطبيق بيشتغل زي ما هو. */
(function () {
  var OK_ST = ['accepted', 'delivered', 'received'];
  var P = '#1F6F6B';

  var st = document.createElement('style');
  st.textContent =
    '.rcwrap{margin-top:8px}' +
    '.rcbtn{width:100%;padding:7px!important;border-radius:10px!important;font-size:13px!important}' +
    '#rcpt{position:fixed;inset:0;z-index:100000;background:#fff;overflow:auto;direction:rtl;font-family:Cairo,system-ui,sans-serif;color:#17302E}' +
    '#rcpt .rc-bar{position:sticky;top:0;display:flex;gap:8px;padding:10px 14px;background:#F4F8F7;border-bottom:1px solid #D4E5E2;z-index:2}' +
    '#rcpt .rc-bar button{flex:1;padding:10px;border:0;border-radius:10px;font-size:14px;background:' + P + ';color:#fff}' +
    '#rcpt .rc-bar button.g{background:#E3F0EE;color:' + P + '}' +
    '#rcpt .rc-tip{padding:8px 14px;font-size:12.5px;color:#5B7572}' +
    '#rcpt .rc-page{max-width:720px;margin:0 auto;padding:18px 20px 30px}' +
    '#rcpt .rc-head{display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:2px solid ' + P + ';padding-bottom:10px}' +
    '#rcpt .rc-brand{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:700;color:' + P + '}' +
    '#rcpt .rc-meta{text-align:left;font-size:13px;line-height:1.7}' +
    '#rcpt .rc-parties{display:flex;gap:12px;margin:14px 0}' +
    '#rcpt .rc-box{flex:1;border:1px solid #D4E5E2;border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.7}' +
    '#rcpt .rc-box b{display:block;color:' + P + ';margin-bottom:2px}' +
    '#rcpt table{width:100%;border-collapse:collapse;font-size:13.5px}' +
    '#rcpt th{background:#E3F0EE;text-align:right;padding:7px 8px}' +
    '#rcpt td{padding:7px 8px;border-bottom:1px solid #E4EFED}' +
    '#rcpt .rc-total{display:flex;justify-content:space-between;margin-top:12px;padding:10px 12px;background:#F4F8F7;border-radius:10px;font-size:16px;font-weight:700;color:' + P + '}' +
    '#rcpt .rc-drv{margin-top:12px;border:1px dashed #9fc3be;border-radius:10px;padding:8px 10px;font-size:13.5px;line-height:1.9}' +
    '#rcpt .rc-sign{display:flex;gap:12px;margin-top:22px}' +
    '#rcpt .rc-sign div{flex:1;border:1px solid #D4E5E2;border-radius:10px;height:92px;padding:8px 10px;font-size:12.5px;color:#5B7572}' +
    '#rcpt .rc-foot{margin-top:18px;font-size:11.5px;color:#5B7572;line-height:1.7}' +
    '@page{size:A4;margin:12mm}' +
    '@media print{html,body{height:auto!important;overflow:visible!important;background:#fff!important}' +
    'body>*:not(#rcpt){display:none!important}' +
    '#rcpt{position:static!important;overflow:visible!important;height:auto!important}' +
    '#rcpt .rc-bar,#rcpt .rc-tip{display:none!important}}';
  document.head.appendChild(st);

  function E(s) { return (typeof esc === 'function') ? esc(s) : String(s == null ? '' : s); }
  function M(n) { return (typeof money === 'function') ? money(n) : Number(n || 0).toFixed(2) + ' ج.م'; }
  function D(d) { return d ? new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : ''; }
  function statusName(s) { return ((typeof OST !== 'undefined' && OST[s]) || s || ''); }
  function isNote() { return (typeof ME !== 'undefined' && ME && ME.role === 'warehouse'); }
  function appName() { return (typeof APP !== 'undefined') ? APP : 'Kivra'; }

  function logo() {
    return '<svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true"><rect width="64" height="64" rx="16" fill="' + P + '"/>' +
      '<g stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"><line x1="22" y1="16" x2="22" y2="48"/>' +
      '<line x1="27" y1="33" x2="42" y2="18"/><line x1="27" y1="33" x2="43" y2="49"/></g><circle cx="47" cy="14" r="4.5" fill="#E3A857"/></svg>';
  }

  function tableHtml(o) {
    var items = o.items || [];
    var rows = items.map(function (i, n) {
      var line = Number(i.qty) * Number(i.unit_price);
      return '<tr><td>' + (n + 1) + '</td><td>' + E(i.name) + '</td><td>' + E(i.qty) + '</td><td>' + M(i.unit_price) + '</td><td>' + M(line) + '</td></tr>';
    }).join('');
    var total = o.total != null ? o.total : items.reduce(function (s, i) { return s + Number(i.qty) * Number(i.unit_price); }, 0);
    return { html: '<table><thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>' + rows + '</tbody></table>', total: total };
  }

  function partiesHtml(o) {
    return '<div class="rc-parties"><div class="rc-box"><b>المخزن</b>' + E(o.warehouse) + '<br>' + E(o.warehouse_phone) + '</div>' +
      '<div class="rc-box"><b>الصيدلية (المستلم)</b>' + E(o.pharmacy) + '<br>' + E(o.pharmacy_phone) + (o.pharmacy_address ? '<br>' + E(o.pharmacy_address) : '') + '</div></div>';
  }

  function receiptHtml(o) {
    var t = tableHtml(o), app = appName();
    return '<div class="rc-page">' +
      '<div class="rc-head"><div class="rc-brand">' + logo() + '<span>' + E(app) + '</span></div>' +
      '<div class="rc-meta"><b>إيصال طلب #' + E(o.order_no) + '</b><br>تاريخ الطلب: ' + D(o.created_at) + '<br>الحالة: ' + E(statusName(o.status)) +
      (o.received_at ? '<br>تاريخ الاستلام: ' + D(o.received_at) : '') + '</div></div>' +
      partiesHtml(o) + t.html +
      '<div class="rc-total"><span>إجمالي الطلب</span><span>' + M(t.total) + '</span></div>' +
      '<div class="rc-foot">إيصال إلكتروني بتفاصيل الطلب من تطبيق ' + E(app) + '. الدفع بين الصيدلية والمخزن مباشرة. هذا الإيصال لا يُعد فاتورة ضريبية.</div></div>';
  }

  function noteHtml(o, drv) {
    var t = tableHtml(o), app = appName();
    var driver = (drv && (drv.driver_name || drv.driver_phone))
      ? 'المندوب: <b>' + E(drv.driver_name || '—') + '</b>' + (drv.driver_phone ? ' · ' + E(drv.driver_phone) : '')
      : 'المندوب: ..........................................  رقم الموبايل: ..............................';
    return '<div class="rc-page">' +
      '<div class="rc-head"><div class="rc-brand">' + logo() + '<span>' + E(app) + '</span></div>' +
      '<div class="rc-meta"><b>إذن تسليم · طلب #' + E(o.order_no) + '</b><br>تاريخ الطلب: ' + D(o.created_at) + '<br>الحالة: ' + E(statusName(o.status)) + '</div></div>' +
      partiesHtml(o) + t.html +
      '<div class="rc-total"><span>المبلغ المستحق على الصيدلية للمخزن</span><span>' + M(t.total) + '</span></div>' +
      '<div class="rc-drv">' + driver + '<br>طريقة الدفع: دفع مباشر للمخزن عند الاستلام أو حسب الاتفاق.</div>' +
      '<div class="rc-sign"><div>توقيع المندوب / التاريخ</div><div>توقيع واستلام الصيدلية (الاسم والتاريخ)</div></div>' +
      '<div class="rc-foot">يرجى مراجعة الأصناف والكميات عند الاستلام قبل التوقيع. أي نقص أو تلف يتم الإبلاغ عنه فوراً للمخزن.</div></div>';
  }

  function show(inner, no, hint) {
    var old = document.getElementById('rcpt');
    if (old) old.remove();
    var box = document.createElement('div');
    box.id = 'rcpt';
    box.innerHTML =
      '<div class="rc-bar"><button type="button" data-rcprint="1">🖨️ طباعة / حفظ PDF</button><button type="button" class="g" data-rcclose="1">إغلاق</button></div>' +
      '<div class="rc-tip">' + hint + '</div>' + inner;
    document.body.appendChild(box);
    box.scrollTop = 0;
    curNo = no;
  }

  function closeDoc() { var b = document.getElementById('rcpt'); if (b) b.remove(); }

  function printDoc(no) {
    var prev = document.title;
    var pre = isNote() ? 'Kivra-delivery-' : 'Kivra-order-';
    document.title = pre + no;
    var restore = function () { document.title = prev; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    setTimeout(function () { try { window.print(); } catch (e) {} setTimeout(restore, 4000); }, 100);
  }

  function orders() { return (typeof ORD !== 'undefined' && Array.isArray(ORD)) ? ORD : []; }

  var curNo = '';
  var HINT = 'عشان تحفظه PDF: دوس "طباعة / حفظ PDF"، وبعدين اختار <b>حفظ كـ PDF</b> من قائمة الطابعة.';

  async function driverInfo(o) {
    try {
      if (typeof sb === 'undefined') return null;
      var r = await sb.rpc('order_tracking_info');
      if (r && !r.error && Array.isArray(r.data)) {
        return r.data.find(function (x) { return String(x.order_id) === String(o.id); }) || null;
      }
    } catch (e) {}
    return null;
  }

  function inject() {
    var list = orders();
    if (!list.length) return;
    var label = isNote() ? '🖨️ إذن تسليم' : '🧾 إيصال PDF';
    document.querySelectorAll('.oc, .item').forEach(function (c) {
      if (c.querySelector('.rcbtn')) return;
      var h = c.querySelector('b');
      if (!h) return;
      var m = /^\s*طلب\s*#\s*(\d+)/.exec(h.textContent || '');
      if (!m) return;
      var o = list.find(function (x) { return String(x.order_no) === m[1]; });
      if (!o || OK_ST.indexOf(o.status) < 0) return;
      c.insertAdjacentHTML('beforeend', '<div class="rcwrap"><button type="button" class="ghost rcbtn" data-rc="' + E(o.order_no) + '">' + label + '</button></div>');
    });
  }

  var busy = false;
  function schedule() {
    if (busy) return;
    busy = true;
    requestAnimationFrame(function () { busy = false; try { inject(); } catch (e) {} });
  }
  try {
    new MutationObserver(schedule).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (!t) return;
    var b = t.closest('.rcbtn'), p = t.closest('[data-rcprint]'), c = t.closest('[data-rcclose]');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      var no = b.getAttribute('data-rc');
      var o = orders().find(function (x) { return String(x.order_no) === no; });
      if (!o) { try { toast('تعذر فتح المستند'); } catch (er) {} return; }
      if (isNote()) {
        driverInfo(o).then(function (drv) { show(noteHtml(o, drv), no, HINT); });
      } else {
        show(receiptHtml(o), no, HINT);
      }
    } else if (p) {
      e.preventDefault(); e.stopPropagation();
      printDoc(curNo);
    } else if (c) {
      e.preventDefault(); e.stopPropagation();
      closeDoc();
    }
  }, true);
})();
