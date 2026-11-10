/* polish-pharmacy-commission.js — كارت "عمولة المنصة لكل صيدلية" في تبويب "العمولة" عند الأدمن (مع تحميل CSV).
   بيحسب من الطلبات المستلمة في الشهر اللي تختاره. بيتحمّل بعد polish-statement.js وقبل polish-theme.js.
   لو حصل أي خطأ الصفحة القديمة تفضل زي ما هي. */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '#pcm .pr{border:1px solid var(--bd);border-radius:14px;padding:9px 12px;margin:8px 0;background:#fff}' +
    '#pcm .pr .ln{display:flex;justify-content:space-between;gap:8px;padding:2px 0;font-size:13.5px}' +
    '#pcm .pr .ln.big{font-weight:700;color:var(--p)}' +
    '#pcm .tot{background:var(--soft);border-radius:14px;padding:10px 12px;margin:8px 0}';
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
    return '<div class="card" id="pcm"><h2>🏪 عمولة المنصة لكل صيدلية</h2>' +
      '<div class="muted">من الطلبات المستلمة في الشهر (بتوقيت القاهرة). المخزن هو اللي بيسدّد العمولة، والكارت ده بيوريك أنهي صيدليات بتجيبها.</div>' +
      '<label>الشهر<input id="pcmm" type="month" value="' + cur + '"></label>' +
      '<div class="row"><button id="pcgo">عرض</button></div><div id="pcout"></div></div>';
  }

  function draw(out, data, month) {
    var tc = 0, tp = 0, to = 0;
    data.forEach(function (x) { tc += num(x.commission); tp += num(x.purchases); to += num(x.orders_count); });
    if (!data.length) {
      out.innerHTML = '<p class="muted">لا توجد طلبات مستلمة في الشهر ده.</p>';
      return;
    }
    out.innerHTML =
      '<div class="tot"><b>الإجمالي — ' + esc(month) + '</b>' +
      '<div class="ln"><span>صيدليات اشترت</span><b>' + data.length + '</b></div>' +
      '<div class="ln"><span>طلبات مستلمة</span><b>' + to + '</b></div>' +
      '<div class="ln"><span>المشتريات</span><b>' + money(tp) + '</b></div>' +
      '<div class="ln big"><span>عمولة المنصة</span><b>' + money(tc) + '</b></div></div>' +
      '<div class="row"><button class="ghost" id="pccsv">⬇️ تحميل CSV</button></div>' +
      data.map(function (x, i) {
        var pct = tc > 0 ? (num(x.commission) / tc * 100) : 0;
        return '<div class="pr"><b>' + (i + 1) + '. ' + esc(x.pharmacy || '—') + '</b>' +
          '<div class="ln"><span>طلبات مستلمة</span><b>' + esc(x.orders_count) + '</b></div>' +
          '<div class="ln"><span>المشتريات</span><b>' + money(x.purchases) + '</b></div>' +
          '<div class="ln big"><span>عمولة المنصة منها</span><b>' + money(x.commission) + ' (' + pct.toFixed(1) + '%)</b></div></div>';
      }).join('');
    var c = out.querySelector('#pccsv');
    if (c) c.onclick = function () {
      var head = ['الصيدلية', 'طلبات مستلمة', 'المشتريات', 'عمولة المنصة', 'نسبة من إجمالي العمولة %'];
      var rows = data.map(function (x) {
        var pct = tc > 0 ? (num(x.commission) / tc * 100) : 0;
        return [x.pharmacy, x.orders_count, r2(x.purchases), r2(x.commission), pct.toFixed(1)];
      });
      dl('kivra-pharmacies-commission-' + month + '.csv', toCsv(head, rows));
    };
  }

  if (V.admin && V.admin.comm) {
    var orig = V.admin.comm;
    V.admin.comm = async function (m) {
      await orig(m);
      try {
        var old = m.querySelector('#pcm');
        if (old) old.remove();
        var s = m.querySelector('#stmt');
        if (s) s.insertAdjacentHTML('afterend', cardHtml());
        else m.insertAdjacentHTML('afterbegin', cardHtml());
        m.querySelector('#pcgo').onclick = function () { run(async function () {
          var v = m.querySelector('#pcmm').value;
          if (!v) throw new Error('اختار الشهر');
          var r = await sb.rpc('admin_pharmacy_commission', { p_month: v + '-01' });
          if (r.error) throw r.error;
          draw(m.querySelector('#pcout'), r.data || [], v);
        }); };
      } catch (e) { /* الصفحة القديمة تفضل زي ما هي */ }
    };
  }
})();
