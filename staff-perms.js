/* staff-perms.js - شاشة إدارة الموظفين والصلاحيات (إضافة جديدة، لا تغيّر الشاشة القديمة) */
(function () {
  'use strict';
  var T = '#1F6F6B';
  var GROUPS = [
    ['المنتجات', [['products.view','عرض المنتجات'],['products.add','إضافة منتج'],['products.edit','تعديل بيانات المنتج'],['products.images','تغيير صور المنتج'],['products.archive','إخفاء / أرشفة منتج'],['products.delete','حذف منتج']]],
    ['الأسعار والخصومات', [['prices.view','عرض الأسعار'],['prices.edit','تعديل سعر البيع'],['discounts.add','إضافة خصم'],['discounts.edit','تعديل خصم'],['discounts.cancel','إلغاء خصم']]],
    ['المخزون', [['inventory.view','عرض المخزون'],['inventory.add','زيادة الكمية'],['inventory.remove','خصم الكمية']]],
    ['الطلبات', [['orders.view','عرض الطلبات'],['orders.accept','قبول الطلب'],['orders.reject','رفض الطلب'],['orders.prepare','تجهيز الطلب'],['orders.ship','تأكيد الشحن'],['orders.deliver','تأكيد التسليم'],['orders.cancel','إلغاء الطلب'],['orders.print','طباعة الإيصال'],['orders.invoice','تحميل الفاتورة']]],
    ['العملاء', [['customers.view','عرض العملاء'],['customers.history','سجل العميل'],['customers.contact','التواصل مع العميل']]],
    ['المالية', [['finance.view','عرض الحسابات'],['finance.commissions','العمولات'],['finance.profits','الأرباح'],['finance.warehouses','أرصدة المخازن'],['finance.reports','التقارير المالية']]],
    ['التقارير', [['reports.view','عرض التقارير'],['reports.sales','تقارير المبيعات'],['reports.pdf','تحميل PDF'],['reports.excel','تصدير Excel']]],
    ['إدارة الموظفين', [['staff.view','عرض الموظفين'],['staff.add','إضافة موظف'],['staff.edit','تعديل موظف'],['staff.toggle','إيقاف / تفعيل'],['staff.delete','حذف موظف'],['staff.newcode','كود دخول جديد']]],
    ['الإعدادات والصلاحيات', [['settings.view','عرض الإعدادات'],['settings.edit','تعديل الإعدادات'],['settings.perms_view','عرض صلاحيات الموظفين'],['settings.perms_edit','تعديل صلاحيات الموظفين']]]
  ];
  var ALL = [];
  GROUPS.forEach(function (g) { g[1].forEach(function (p) { ALL.push(p[0]); }); });

  var LIVE = ['orders.view','orders.accept','orders.reject','orders.ship','orders.deliver','products.view','products.add','products.edit','reports.view'];
  var S = { list: [], q: '', cur: null, perms: {}, orig: {}, busy: false };
  var root = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function say(m) { try { toast(m); } catch (e) { alert(m); } }
  function fdt(d) { if (!d) return 'لم يدخل بعد'; try { return new Date(d).toLocaleString('ar-EG'); } catch (e) { return ''; } }

  function css() {
    if (document.getElementById('sp-css')) return;
    var s = document.createElement('style'); s.id = 'sp-css';
    s.textContent =
      '#sp{position:fixed;inset:0;z-index:50;background:#f4f7f7;overflow:auto;direction:rtl;font-family:system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;color:#1c2b2b;padding-bottom:90px}' +
      '#sp .top{background:' + T + ';color:#fff;padding:calc(12px + env(safe-area-inset-top)) 16px 12px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:2}' +
      '#sp .top b{flex:1;font-size:18px}#sp .top button{background:rgba(255,255,255,.2);color:#fff;border:0;border-radius:12px;padding:8px 14px;font-size:14px}' +
      '#sp .w{max-width:760px;margin:0 auto;padding:14px}' +
      '#sp h3{margin:4px 0 2px;font-size:20px}#sp .mu{color:#6b7f7f;font-size:13px}' +
      '#sp .card{background:#fff;border-radius:18px;padding:14px;margin:10px 0;box-shadow:0 2px 10px rgba(31,111,107,.08)}' +
      '#sp .emp{display:flex;align-items:center;gap:12px;cursor:pointer}' +
      '#sp .av{width:48px;height:48px;border-radius:50%;background:#dff0ee;color:' + T + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;flex:none}' +
      '#sp .in{flex:1;min-width:0}#sp .nm{font-weight:700;font-size:16px}' +
      '#sp .tag{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;background:#dff0ee;color:' + T + ';margin-inline-end:6px}' +
      '#sp .on{background:#d8f3e0;color:#157a3a}#sp .off{background:#f1e3e3;color:#a33}' +
      '#sp input.q{width:100%;padding:12px;border:1px solid #d5e2e1;border-radius:14px;font-size:16px;background:#fff}' +
      '#sp .btn{border:0;border-radius:14px;padding:12px 18px;font-size:15px;background:' + T + ';color:#fff;cursor:pointer}' +
      '#sp .btn.g{background:#fff;color:' + T + ';border:1.5px solid ' + T + '}' +
      '#sp .btn.s{padding:6px 12px;font-size:12px;border-radius:10px}' +
      '#sp .row{display:flex;gap:8px;align-items:center}#sp .row>*{flex:1}' +
      '#sp .gh{display:flex;align-items:center;gap:8px;margin-bottom:6px}#sp .gh b{flex:1}' +
      '#sp .cnt{font-size:12px;color:' + T + ';background:#e8f3f2;border-radius:99px;padding:2px 10px}' +
      '#sp .pr{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-top:1px solid #eef3f3;font-size:14px}' +
      '#sp .sw{position:relative;width:46px;height:26px;flex:none}#sp .sw input{opacity:0;width:100%;height:100%;position:absolute;margin:0;cursor:pointer;z-index:1}' +
      '#sp .sw i{position:absolute;inset:0;background:#ccd6d6;border-radius:99px;transition:.2s}' +
      '#sp .sw i:after{content:"";position:absolute;top:3px;right:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:.2s}' +
      '#sp .sw input:checked+i{background:' + T + '}#sp .sw input:checked+i:after{right:23px}' +
      '#sp .bar{position:fixed;bottom:0;left:0;right:0;background:#fff;padding:10px 14px calc(10px + env(safe-area-inset-bottom));display:flex;gap:10px;box-shadow:0 -2px 10px rgba(0,0,0,.08);z-index:3}' +
      '#sp .bar .btn{flex:1}#sp .soon{background:#fff3cd;color:#7a5b00;border-radius:99px;padding:1px 8px;font-size:11px}';
    document.head.appendChild(s);
  }

  function parseList(r, scope) {
    var d = r;
    if (d && typeof d === 'object' && !Array.isArray(d)) d = d.staff || d.items || d.data || d.list || [];
    if (!Array.isArray(d)) d = [];
    return d.map(function (x) { return { id: x.id, name: x.name || '', active: x.active !== false, last: x.last_used_at || x.last_used || null, scope: scope }; });
  }

  async function loadList() {
    var out = [], errs = [];
    var a = await sb.rpc('wh_staff_list');
    if (a.error) errs.push('المخزن: ' + a.error.message); else out = out.concat(parseList(a.data, 'wh'));
    var b = await sb.rpc('store_staff_list');
    if (b.error) errs.push('الصيدلية: ' + b.error.message); else out = out.concat(parseList(b.data, 'store'));
    S.list = out;
    if (errs.length && !out.length) say('تعذر تحميل الموظفين. ' + errs.join(' | '));
  }

  function shell(inner) {
    root.innerHTML = '<div class="top"><b>إدارة الموظفين والصلاحيات</b><button data-a="close">إغلاق</button></div><div class="w">' + inner + '</div>';
  }

  function drawList() {
    S.cur = null;
    var q = S.q.trim().toLowerCase();
    var l = S.list.filter(function (e) { return !q || String(e.name).toLowerCase().indexOf(q) > -1; });
    var h = '<h3>الموظفين</h3><div class="mu">تحكم دقيق في مهام كل موظف</div>' +
      '<div class="card"><input class="q" id="sp-q" placeholder="ابحث عن موظف..." value="' + esc(S.q) + '"></div>';
    if (!l.length) h += '<div class="card mu">لا يوجد موظفين.</div>';
    l.forEach(function (e, i) {
      var idx = S.list.indexOf(e);
      h += '<div class="card emp" data-a="open" data-i="' + idx + '"><div class="av">' + esc((e.name || '?').trim().charAt(0)) + '</div>' +
        '<div class="in"><div class="nm">' + esc(e.name) + '</div><div><span class="tag">' + (e.scope === 'wh' ? 'موظف مخزن' : 'موظف صيدلية') + '</span>' +
        '<span class="tag ' + (e.active ? 'on' : 'off') + '">' + (e.active ? 'نشط' : 'موقوف') + '</span></div>' +
        '<div class="mu">آخر دخول: ' + esc(fdt(e.last)) + '</div></div></div>';
    });
    h += '<div class="mu" style="margin-top:10px">لإضافة موظف أو إيقافه أو كود جديد استخدم الشاشة القديمة (لم تتغير).</div>';
    shell(h);
    var qi = document.getElementById('sp-q');
    if (qi) qi.oninput = function () { S.q = qi.value; var pos = qi.selectionStart; drawList(); var n = document.getElementById('sp-q'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
  }

  function total() { var n = 0; ALL.forEach(function (k) { if (S.perms[k]) n++; }); return n; }

  function drawEdit() {
    var e = S.cur, h =
      '<div class="card emp"><div class="av">' + esc((e.name || '?').trim().charAt(0)) + '</div><div class="in"><div class="nm">' + esc(e.name) + '</div>' +
      '<div><span class="tag">' + (e.scope === 'wh' ? 'موظف مخزن' : 'موظف صيدلية') + '</span><span class="tag ' + (e.active ? 'on' : 'off') + '">' + (e.active ? 'نشط' : 'موقوف') + '</span></div>' +
      '<div class="mu">آخر دخول: ' + esc(fdt(e.last)) + '</div></div></div>' +
      '<h3>الصلاحيات التفصيلية</h3><div class="mu">فعّل فقط المهام المسموح بها لهذا الموظف</div>' +
      '<div class="card"><b id="sp-tot"></b> <span class="mu">صلاحية مفعّلة من ' + ALL.length + '</span></div>';
    GROUPS.forEach(function (g, gi) {
      h += '<div class="card"><div class="gh"><b>' + esc(g[0]) + '</b><span class="cnt" id="sp-c' + gi + '"></span>' +
        '<button class="btn g s" data-a="all" data-g="' + gi + '" id="sp-b' + gi + '"></button></div>';
      g[1].forEach(function (p) {
        h += '<div class="pr"><span>' + esc(p[1]) + (LIVE.indexOf(p[0]) < 0 ? ' <small class="soon">قريبًا</small>' : '') + '</span><label class="sw"><input type="checkbox" data-k="' + p[0] + '"' + (S.perms[p[0]] ? ' checked' : '') + '><i></i></label></div>';
      });
      h += '</div>';
    });
    h += '<div class="mu" style="margin:6px 0 10px">ملحوظة: المفاتيح المكتوب عليها "قريبًا" تُحفظ لكن لا تؤثر بعد، لأن الميزة نفسها لم تُربط.</div>';
    shell(h);
    var bar = document.createElement('div'); bar.className = 'bar';
    bar.innerHTML = '<button class="btn g" data-a="cancel">إلغاء</button><button class="btn" data-a="save">حفظ الصلاحيات</button>';
    root.appendChild(bar);
    counters();
  }

  function counters() {
    var t = document.getElementById('sp-tot'); if (t) t.textContent = total();
    GROUPS.forEach(function (g, gi) {
      var on = 0; g[1].forEach(function (p) { if (S.perms[p[0]]) on++; });
      var c = document.getElementById('sp-c' + gi); if (c) c.textContent = on + '/' + g[1].length;
      var b = document.getElementById('sp-b' + gi); if (b) b.textContent = on === g[1].length ? 'إلغاء الكل' : 'تحديد الكل';
    });
  }

  async function openEmp(i) {
    var e = S.list[i]; if (!e || S.busy) return;
    S.busy = true;
    try {
      var r = await sb.rpc('staff_perms_get', { p_scope: e.scope, p_staff_id: e.id });
      if (r.error) throw r.error;
      var d = r.data;
      if (!d || !d.ok) throw new Error('تعذر قراءة الصلاحيات: ' + ((d && d.error) || 'خطأ'));
      S.cur = e; S.perms = {}; ALL.forEach(function (k) { S.perms[k] = !!d.perms[k]; });
      S.orig = JSON.parse(JSON.stringify(S.perms));
      drawEdit();
    } catch (err) { say(err.message || 'حصل خطأ'); }
    S.busy = false;
  }

  async function save() {
    if (S.busy || !S.cur) return;
    var ch = {}, n = 0;
    ALL.forEach(function (k) { if (S.perms[k] !== S.orig[k]) { ch[k] = S.perms[k]; n++; } });
    if (!n) { say('مفيش تغييرات للحفظ'); return; }
    S.busy = true;
    try {
      var r = await sb.rpc('staff_perms_set', { p_scope: S.cur.scope, p_staff_id: S.cur.id, p_perms: ch });
      if (r.error) throw r.error;
      if (!r.data || !r.data.ok) throw new Error('تعذر الحفظ: ' + ((r.data && r.data.error) || 'خطأ'));
      S.orig = JSON.parse(JSON.stringify(S.perms));
      say('تم حفظ الصلاحيات ✓');
    } catch (err) { say(err.message || 'حصل خطأ'); }
    S.busy = false;
  }

  function onClick(ev) {
    var t = ev.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a');
    if (a === 'close') close();
    else if (a === 'open') openEmp(+t.getAttribute('data-i'));
    else if (a === 'cancel') { S.cur = null; drawList(); }
    else if (a === 'save') save();
    else if (a === 'all') {
      var g = GROUPS[+t.getAttribute('data-g')][1], every = g.every(function (p) { return S.perms[p[0]]; });
      g.forEach(function (p) { S.perms[p[0]] = !every; });
      var y = root.scrollTop; drawEdit(); root.scrollTop = y;
    }
  }
  function onChange(ev) {
    var k = ev.target.getAttribute && ev.target.getAttribute('data-k');
    if (k) { S.perms[k] = ev.target.checked; counters(); }
  }

  async function open() {
    css();
    if (!root) {
      root = document.createElement('div'); root.id = 'sp';
      root.addEventListener('click', onClick); root.addEventListener('change', onChange);
    }
    document.body.appendChild(root);
    shell('<div class="card mu">جاري التحميل...</div>');
    try { await loadList(); } catch (e) { say(e.message || 'حصل خطأ'); }
    drawList();
  }
  function close() { if (root && root.parentNode) root.parentNode.removeChild(root); }

  window.StaffPerms = { open: open, close: close };

  /* زر عائم صغير لفتح الشاشة (للمالك فقط: مخزن أو صيدلية) */
  function addBtn() {
    if (document.getElementById('sp-fab')) return;
    var ok = false;
    try { ok = typeof ME !== 'undefined' && ME && (ME.role === 'warehouse' || ME.role === 'pharmacy'); } catch (e) {}
    if (!ok) return;
    var b = document.createElement('button'); b.id = 'sp-fab'; b.textContent = '🔐 الصلاحيات';
    b.style.cssText = 'position:fixed;bottom:calc(84px + env(safe-area-inset-bottom));left:14px;z-index:20;border:0;border-radius:99px;padding:10px 16px;background:' + T + ';color:#fff;font-size:14px;box-shadow:0 3px 12px rgba(0,0,0,.25)';
    b.onclick = open;
    document.body.appendChild(b);
  }
  setInterval(function () {
    var has = document.getElementById('sp-fab'), ok = false;
    try { ok = typeof ME !== 'undefined' && ME && (ME.role === 'warehouse' || ME.role === 'pharmacy'); } catch (e) {}
    if (ok && !has) addBtn();
    if (!ok && has) has.parentNode.removeChild(has);
  }, 1500);
})();
