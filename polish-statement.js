/* polish-statement.js — كشف شهري لكل مخزن في تبويب "العمولة" عند الأدمن (مع تحميل CSV يفتح في Excel).
   بيتحمّل في آخر index.html. لو حصل أي خطأ الصفحة القديمة تفضل زي ما هي. */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '#stmt .sw{border:1px solid var(--bd);border-radius:14px;padding:10px 12px;margin:8px 0;background:#fff}' +
    '#stmt .sw b.n{font-size:15px}' +
    '#stmt .ln{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:13.5px}' +
    '#stmt .ln.big{font-weight:700;color:var(--p)}' +
    '#stmt .tot{background:var(--soft);border-radius:14px;padding:10px 12px;margin:8px 0}' +
    '#stmt .od{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px dashed var(--bd);font-size:13px}';
  document.head.appendChild(st);

  function q(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function toCsv(head, rows) { return [head].concat(rows).map(function (r) { return r.map(q).join(','); }).join('\r\n'); }
  function dl(name, text) {
    var b = new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function num(v) { return Number(v || 0); }
  function r2(v) { return num(v).toFixed(2); }

  function cardHtml() {
    var d = new Date();
    var cur = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    return '<div class="card" id="stmt"><h2>📊 كشف شهري لكل مخزن</h2>' +
      '<div class="muted">الطلبات بتتحسب في الشهر اللي اتأكد فيه الاستلام (بتوقيت القاهرة).</div>' +
      '<label>الشهر<input id="stm" type="month" value="' + cur + '"></label>' +
      '<div class="row"><button id="stgo">عرض الكشف</button></div><div id="stout"></div></div>';
  }

  function drawDetails(box, w, month, rows) {
    var tc = rows.reduce(function (s, x) { return s + num(x.commission); }, 0);
    var ts = rows.reduce(function (s, x) { return s + num(x.sales); }, 0);
    box.innerHTML = '<div class="tot"><b>' + esc(w.warehouse) + '</b> — ' + rows.length + ' طلب<br>' +
      'المبيعات: ' + money(ts) + ' · العمولة: ' + money(tc) + '</div>' +
      (rows.length ? rows.map(function (x) {
        return '<div class="od"><div><b>#' + esc(x.order_no) + '</b> ' + esc(x.pharmacy) + '<div class="muted">' + fd(x.received_on) + '</div></div>' +
          '<div style="text-align:left">' + money(x.sales) + '<div class="muted">عمولة ' + money(x.commission) + '</div></div></div>';
      }).join('') : '<p class="muted">لا توجد طلبات مستلمة في الشهر ده.</p>') +
      (rows.length ? '<div class="row" style="margin-top:8px"><button class="ghost" data-csvd="1">⬇️ تحميل تفاصيل الطلبات (CSV)</button></div>' : '');
    var b = box.querySelector('[data-csvd]');
    if (b) b.onclick = function () {
      var head = ['رقم الطلب', 'تاريخ الاستلام', 'الصيدلية', 'المبيعات', 'العمولة', 'صافي المخزن'];
      var data = rows.map(function (x) { return [x.order_no, String(x.received_on || '').slice(0, 10), x.pharmacy, r2(x.sales), r2(x.commission), r2(x.net)]; });
      dl('kivra-' + (w.warehouse || 'warehouse') + '-' + month + '.csv', toCsv(head, data));
    };
  }

  function drawStatement(out, data, month) {
    var T = { cnt: 0, sales: 0, com: 0, net: 0, paid: 0, bal: 0 };
    data.forEach(function (x) {
      T.cnt += num(x.orders_count); T.sales += num(x.sales); T.com += num(x.commission);
      T.net += num(x.net); T.paid += num(x.paid_in_month); T.bal += num(x.balance_end);
    });
    out.innerHTML =
      '<div class="tot"><b>إجمالي كل المخازن — ' + esc(month) + '</b>' +
      '<div class="ln"><span>طلبات مستلمة</span><b>' + T.cnt + '</b></div>' +
      '<div class="ln"><span>المبيعات</span><b>' + money(T.sales) + '</b></div>' +
      '<div class="ln big"><span>عمولة الشهر</span><b>' + money(T.com) + '</b></div>' +
      '<div class="ln"><span>المسدّد في الشهر</span><b>' + money(T.paid) + '</b></div>' +
      '<div class="ln big"><span>المتبقي نهاية الشهر</span><b>' + money(T.bal) + '</b></div></div>' +
      '<div class="row"><button class="ghost" id="stcsv">⬇️ تحميل الكشف (CSV)</button></div>' +
      data.map(function (w, i) {
        return '<div class="sw"><b class="n">' + esc(w.warehouse) + '</b>' +
          '<div class="ln"><span>طلبات مستلمة</span><b>' + esc(w.orders_count) + '</b></div>' +
          '<div class="ln"><span>المبيعات</span><b>' + money(w.sales) + '</b></div>' +
          '<div class="ln big"><span>عمولة الشهر</span><b>' + money(w.commission) + '</b></div>' +
          '<div class="ln"><span>صافي المخزن</span><b>' + money(w.net) + '</b></div>' +
          '<div class="ln"><span>المسدّد في الشهر</span><b>' + money(w.paid_in_month) + '</b></div>' +
          '<div class="ln big"><span>المتبقي نهاية الشهر</span><b>' + money(w.balance_end) + '</b></div>' +
          '<div class="row" style="margin-top:6px"><button class="ghost" data-wi="' + i + '">تفاصيل الطلبات</button></div>' +
          '<div class="det" data-det="' + i + '"></div></div>';
      }).join('');
    var c = out.querySelector('#stcsv');
    if (c) c.onclick = function () {
      var head = ['المخزن', 'طلبات مستلمة', 'المبيعات', 'عمولة الشهر', 'صافي المخزن', 'المسدّد في الشهر', 'المتبقي نهاية الشهر'];
      var rows = data.map(function (w) { return [w.warehouse, w.orders_count, r2(w.sales), r2(w.commission), r2(w.net), r2(w.paid_in_month), r2(w.balance_end)]; });
      dl('kivra-statement-' + month + '.csv', toCsv(head, rows));
    };
    out.querySelectorAll('[data-wi]').forEach(function (b) {
      b.onclick = function () { run(async function () {
        var w = data[Number(b.getAttribute('data-wi'))];
        var r = await sb.rpc('admin_monthly_orders', { p_month: month + '-01', p_warehouse: w.warehouse_id });
        if (r.error) throw r.error;
        drawDetails(out.querySelector('[data-det="' + b.getAttribute('data-wi') + '"]'), w, month, r.data || []);
      }); };
    });
  }

  if (V.admin && V.admin.comm) {
    var orig = V.admin.comm;
    V.admin.comm = async function (m) {
      await orig(m);
      try {
        var old = m.querySelector('#stmt');
        if (old) old.remove();
        m.insertAdjacentHTML('afterbegin', cardHtml());
        m.querySelector('#stgo').onclick = function () { run(async function () {
          var v = m.querySelector('#stm').value;
          if (!v) throw new Error('اختار الشهر');
          var r = await sb.rpc('admin_monthly_statement', { p_month: v + '-01' });
          if (r.error) throw r.error;
          drawStatement(m.querySelector('#stout'), r.data || [], v);
        }); };
      } catch (e) { /* الصفحة القديمة تفضل زي ما هي */ }
    };
  }
})();
