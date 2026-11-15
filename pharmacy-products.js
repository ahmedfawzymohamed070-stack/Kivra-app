/* pharmacy-products.js v2 — قسم "🛍️ المنتجات" جوه تاب "متجري" عند الصيدلية:
   إضافة / تعديل / حذف / خصم بتاريخ انتهاء + أسعار المخازن بعد البحث + رفع منتجات من ملف Excel */
(function () {
  'use strict';
  let LIST = [], RES = [], SEL = null, EDIT = null, DONE = false, PS = false, OFFERS = [];
  let IMP = { rows: [], report: null, busy: false };

  const st = document.createElement('style');
  st.textContent = `
  .pp-c{display:flex;gap:10px;padding:10px 0;border-top:1px solid #e3ecea}
  .pp-c:first-child{border-top:0}
  .pp-i{width:56px;height:56px;border-radius:12px;background:#eef5f4;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;font-size:24px}
  .pp-i img{width:100%;height:100%;object-fit:cover}
  .pp-b{flex:1;min-width:0}
  .pp-box{background:#f5f9f8;border-radius:12px;padding:10px;margin:8px 0;font-size:13px;line-height:1.8}
  .pp-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .pp-r{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
  .pp-w{display:flex;justify-content:space-between;gap:8px;padding:2px 0;border-bottom:1px dashed #dbe6e4}
  .pp-w:last-child{border-bottom:0}
  #pp-host .card{margin:10px 0}`;
  document.head.appendChild(st);

  const UU = /^[0-9a-f]{8}-[0-9a-f]{4}-/;
  const rid = r => r.id ?? r.catalog_id ?? r.cid ?? Object.values(r).find(v => typeof v === 'string' && UU.test(v));
  const imgUrl = p => !p ? '' : /^https?:/.test(p) ? p : sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  const thumb = p => { const u = imgUrl(p); return '<div class="pp-i">' + (u ? '<img loading="lazy" src="' + esc(u) + '" alt="" onerror="this.parentNode.textContent=\'🧴\'">' : '🧴') + '</div>'; };
  const p2 = n => String(n).padStart(2, '0');
  const ymd = d => { const t = new Date(d); return t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate()); };
  const expired = x => !!(x.old_price != null && x.sale_ends && new Date(x.sale_ends) <= new Date());
  const G = id => document.getElementById(id);
  const norm = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '');

  function readDisc(oid, did, price) {
    const oRaw = G(oid).value.trim(), dRaw = G(did).value;
    const old = oRaw === '' ? null : parseFloat(oRaw);
    if (old !== null && !(old > price)) throw new Error('السعر قبل الخصم لازم يكون أكبر من سعر البيع');
    let ends = null;
    if (dRaw) {
      if (old === null) throw new Error('اكتب السعر قبل الخصم الأول');
      const e = new Date(dRaw + 'T23:59:59');
      if (!(e > new Date())) throw new Error('تاريخ انتهاء الخصم لازم يكون في المستقبل');
      ends = e.toISOString();
    }
    return { p_old_price: old, p_sale_ends: ends };
  }

  /* ---------- أسعار المخازن للمنتج ---------- */
  async function loadOffers() { try { OFFERS = ok(await sb.rpc('get_offers')) || []; } catch (e) { OFFERS = []; } }
  function offersFor(r) {
    const id = String(rid(r)), n = norm(r.name);
    return OFFERS.filter(o => String(o.group_key || '') === id || String(o.catalog_id || '') === id || (n && norm(o.name) === n));
  }
  function whHtml(r) {
    const l = offersFor(r).slice().sort((a, b) => ((a.price == null) - (b.price == null)) || (Number(a.price) - Number(b.price)));
    if (!l.length) return '<div class="pp-box muted">مش موجود عند أي مخزن حالياً (بحسب الاسم).</div>';
    return '<div class="pp-box"><b>سعره عند المخازن:</b>' + l.map((o, i) => '<div class="pp-w"><span>' + esc(o.warehouse_name) + (i === 0 && o.price != null && l.length > 1 ? ' <span class="badge approved">الأقل</span>' : '') +
      ' <span class="muted">· المتاح ' + esc(o.stock) + '</span></span><b>' + (o.price == null ? '🔒' : money(o.price)) + '</b></div>').join('') + '</div>';
  }

  /* ---------- الإضافة اليدوي ---------- */
  function addHtml() {
    if (SEL) return '<div class="loc"><b>' + esc(SEL.name) + '</b><div class="muted">' + esc(SEL.brand) + (SEL.category ? ' · ' + esc(SEL.category) : '') + '</div></div>' + whHtml(SEL.r) +
      '<div class="pp-g"><label>سعر البيع للعميل (ج.م)<input id="pp-p" type="number" min="0" step="0.01"></label>' +
      '<label>الكمية المتاحة<input id="pp-s" type="number" min="0" step="1"></label>' +
      '<label>السعر قبل الخصم (اختياري)<input id="pp-o" type="number" min="0" step="0.01"></label>' +
      '<label>انتهاء الخصم (اختياري)<input id="pp-d" type="date"></label></div>' +
      '<div class="muted">لو كتبت سعر قبل الخصم هيظهر للعميل مشطوب مع نسبة الخصم. بعد تاريخ الانتهاء السعر بيرجع للسعر قبل الخصم لوحده.</div>' +
      '<div class="pp-r"><button type="button" data-pp="add">إضافة للمتجر</button><button type="button" class="ghost" data-pp="back">رجوع</button></div>';
    return '<label>ابحث في الكتالوج بالاسم أو الباركود<input id="pp-q"></label>' +
      '<button type="button" data-pp="search">بحث</button><div>' +
      (DONE ? (RES.length ? RES.map(r => '<div class="item" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><div><b>' + esc(r.name) + '</b><div class="muted">' + esc(r.brand) + (r.category ? ' · ' + esc(r.category) : '') + (r.barcode ? ' · ' + esc(r.barcode) : '') + '</div></div>' +
        '<button type="button" data-pp="pick" data-id="' + esc(rid(r)) + '">اختيار</button></div>' + whHtml(r) + '</div>').join('') : '<p class="muted">مفيش نتائج. المنتج لازم يكون في الكتالوج.</p>') : '') + '</div>';
  }

  /* ---------- الرفع من Excel ---------- */
  const H = {
    name: ['name', 'اسم المنتج', 'الاسم', 'المنتج', 'الصنف', 'اسم الصنف'],
    barcode: ['barcode', 'الباركود', 'باركود', 'كود'],
    price: ['price', 'السعر', 'سعر البيع', 'سعر'],
    stock: ['stock', 'qty', 'quantity', 'الكمية', 'كمية', 'المخزون'],
    old: ['old_price', 'السعر قبل الخصم', 'قبل الخصم'],
    ends: ['sale_ends', 'انتهاء الخصم', 'تاريخ انتهاء الخصم']
  };
  const nh = s => String(s).toLowerCase().replace(/[\s_\-()]+/g, '');
  const HN = {}; Object.keys(H).forEach(k => { HN[k] = new Set(H[k].map(nh)); });
  const lat = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  function num(v) {
    if (typeof v === 'number') return v;
    const s = lat(v == null ? '' : v).replace(/[٬,\s]/g, '').replace('٫', '.');
    if (s === '') return null;
    const n = Number(s); return isNaN(n) ? NaN : n;
  }
  function parseEnds(v) {
    if (v === '' || v == null) return null;
    let y, m, d;
    if (v instanceof Date) { y = v.getFullYear(); m = v.getMonth() + 1; d = v.getDate(); }
    else {
      const s = lat(v).trim(); let a;
      if ((a = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/))) { y = +a[1]; m = +a[2]; d = +a[3]; }
      else if ((a = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/))) { d = +a[1]; m = +a[2]; y = +a[3]; }
      else throw new Error('تاريخ انتهاء الخصم غلط (اكتبه 2026-12-31)');
    }
    const e = new Date(y + '-' + p2(m) + '-' + p2(d) + 'T23:59:59');
    if (isNaN(e)) throw new Error('تاريخ انتهاء الخصم غلط');
    if (!(e > new Date())) throw new Error('تاريخ انتهاء الخصم لازم يكون في المستقبل');
    return e.toISOString();
  }
  async function ensureXlsx() {
    if (window.XLSX) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload = res; s.onerror = () => rej(new Error('تعذر تحميل أداة قراءة Excel، تأكد من النت وجرب تاني'));
      document.head.appendChild(s);
    });
  }
  function parseRows(raw) {
    const out = [];
    raw.forEach((r, i) => {
      const g = f => { for (const k of Object.keys(r)) if (HN[f].has(nh(k))) return r[k]; return ''; };
      const name = String(g('name')).trim();
      let bc = g('barcode'); bc = typeof bc === 'number' ? String(Math.round(bc)) : String(bc).trim();
      if (!name && !bc) return;
      out.push({ n: i + 2, name, bc, price: num(g('price')), stock: num(g('stock')), old: num(g('old')), ends: g('ends') });
    });
    return out;
  }
  async function readFile(file) {
    await ensureXlsx();
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = parseRows(XLSX.utils.sheet_to_json(ws, { defval: '', raw: true }));
    if (!rows.length) throw new Error('الملف فاضي أو أسماء الأعمدة مش معروفة. حمّل النموذج واستخدمه.');
    if (rows.length > 300) throw new Error('الحد الأقصى 300 منتج في المرة. قسّم الملف.');
    IMP = { rows, report: null, busy: false }; draw();
  }
  async function template() {
    await ensureXlsx();
    const ws = XLSX.utils.aoa_to_sheet([['الاسم', 'الباركود', 'السعر', 'الكمية', 'السعر قبل الخصم', 'انتهاء الخصم'], ['Clary Serum 100 ml', '', 255, 10, '', '']]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'products');
    XLSX.writeFile(wb, 'kivra-products.xlsx');
  }
  const prog = t => { const e = G('pp-prog'); if (e) e.textContent = t; };
  async function runImport() {
    if (IMP.busy) return;
    const rows = IMP.rows, rep = { ok: 0, bad: [] }; IMP.busy = true;
    try {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]; prog('جاري الاستيراد ' + (i + 1) + ' / ' + rows.length + ' ... لا تقفل الصفحة');
        try {
          if (!(r.price >= 0)) throw new Error('السعر ناقص أو غلط');
          if (!(r.stock >= 0) || !Number.isInteger(r.stock)) throw new Error('الكمية ناقصة أو غلط');
          let old = null, ends = null;
          if (r.old !== null) { if (isNaN(r.old) || !(r.old > r.price)) throw new Error('السعر قبل الخصم لازم يكون أكبر من السعر'); old = r.old; }
          if (r.ends !== '' && r.ends != null) { if (old === null) throw new Error('انتهاء الخصم من غير سعر قبل الخصم'); ends = parseEnds(r.ends); }
          const q = r.bc || r.name; if (String(q).length < 2) throw new Error('اسم المنتج ناقص');
          let res = ok(await sb.rpc('search_catalog', { p_q: q })) || [], m = [];
          if (r.bc) m = res.filter(c => String(c.barcode || '').trim() === r.bc);
          if (!m.length && r.name) {
            if (r.bc) res = ok(await sb.rpc('search_catalog', { p_q: r.name })) || [];
            const n = norm(r.name); m = res.filter(c => norm(c.name) === n);
          }
          if (!m.length) throw new Error('مش لاقيه في الكتالوج (الاسم لازم يطابقه)');
          if (m.length > 1) throw new Error('أكتر من منتج بنفس الاسم، استخدم الباركود أو ضيفه يدوي');
          ok(await sb.rpc('store_upsert_product', { p_catalog: rid(m[0]), p_price: r.price, p_stock: r.stock, p_active: true, p_old_price: old, p_sale_ends: ends }));
          rep.ok++;
        } catch (e) { rep.bad.push({ n: r.n, name: r.name || r.bc, why: (e && e.message) || 'خطأ' }); }
      }
    } finally { IMP = { rows: [], report: rep, busy: false }; }
    await load(); draw();
  }
  function importHtml() {
    let h = '<div class="card"><h2>📥 رفع منتجات من Excel</h2>' +
      '<div class="muted">الأعمدة: الاسم، الباركود (اختياري)، السعر، الكمية، السعر قبل الخصم (اختياري)، انتهاء الخصم (اختياري). المنتج لازم يكون في الكتالوج.</div>' +
      '<div class="pp-r"><button type="button" class="ghost" data-pp="tpl">⬇️ تحميل نموذج</button></div>' +
      '<label>اختار ملف Excel أو CSV<input id="pp-file" type="file" accept=".xlsx,.xls,.csv"></label>';
    if (IMP.rows.length) {
      h += '<div class="pp-box"><b>' + IMP.rows.length + '</b> منتج جاهز. أول 3 للتأكد:' +
        IMP.rows.slice(0, 3).map(r => '<div>' + esc(r.name || r.bc) + ' — ' + esc(isNaN(r.price) || r.price === null ? '؟' : r.price) + ' ج.م — كمية ' + esc(isNaN(r.stock) || r.stock === null ? '؟' : r.stock) + '</div>').join('') +
        '<div class="lock" style="margin-top:6px">⚠️ المنتجات الموجودة في متجرك بالفعل هيتغيّر سعرها وكميتها وخصمها للي في الملف، وهترجع ظاهرة للعملاء.</div></div>' +
        '<div id="pp-prog" class="muted"></div><div class="pp-r"><button type="button" data-pp="import">▶️ ابدأ الاستيراد</button><button type="button" class="ghost" data-pp="cancelimp">إلغاء</button></div>';
    }
    if (IMP.report) {
      const R = IMP.report;
      h += '<div class="pp-box">تمت إضافة/تحديث <b>' + R.ok + '</b> منتج' + (R.bad.length ? ' · تعذّر <b>' + R.bad.length + '</b>:' : ' ✅') +
        R.bad.map(b => '<div>صف ' + esc(b.n) + ' — ' + esc(b.name) + ': <span class="lock">' + esc(b.why) + '</span></div>').join('') + '</div>';
    }
    return h + '</div>';
  }

  /* ---------- القايمة ---------- */
  function listHtml() {
    if (!LIST.length) return '<p class="muted">لسه مفيش منتجات في متجرك.</p>';
    return LIST.map(x => {
      const id = esc(x.id), open = EDIT === x.id, ex = expired(x);
      const eff = ex ? x.old_price : x.price;
      const has = !ex && x.old_price != null && Number(x.old_price) > Number(x.price);
      const pct = has ? Math.round((1 - Number(x.price) / Number(x.old_price)) * 100) : 0;
      return '<div class="pp-c">' + thumb(x.image_path) + '<div class="pp-b"><b>' + esc(x.name) + '</b>' +
        '<div class="muted">' + esc(x.brand) + (x.category ? ' · ' + esc(x.category) : '') + '</div>' +
        '<div><span class="price">' + money(eff) + '</span> ' + (has ? '<s class="muted">' + money(x.old_price) + '</s> <span class="badge approved">خصم ' + pct + '%</span>' : '') +
        ' <span class="muted">· الكمية ' + esc(x.stock) + '</span> ' + (x.active ? '' : '<span class="badge rejected">متوقف</span>') + '</div>' +
        (has && x.sale_ends ? '<div class="muted">الخصم ينتهي ' + fd(x.sale_ends) + '</div>' : '') +
        (ex ? '<div class="muted">انتهى الخصم، والسعر للعميل رجع للسعر قبل الخصم.</div>' : '') +
        '<div class="pp-r"><button type="button" class="ghost" data-pp="edit" data-id="' + id + '">' + (open ? 'إغلاق' : '✏️ تعديل') + '</button>' +
        '<button type="button" class="red" data-pp="del" data-id="' + id + '">حذف</button></div>' +
        (open ? '<div class="pp-box"><div class="pp-g"><label>السعر<input id="pp-ep" type="number" min="0" step="0.01" value="' + esc(has ? x.price : eff) + '"></label>' +
          '<label>الكمية<input id="pp-es" type="number" min="0" step="1" value="' + esc(x.stock) + '"></label>' +
          '<label>السعر قبل الخصم (اختياري)<input id="pp-eo" type="number" min="0" step="0.01" value="' + (has ? esc(x.old_price) : '') + '"></label>' +
          '<label>انتهاء الخصم (اختياري)<input id="pp-ed" type="date" value="' + (has && x.sale_ends ? ymd(x.sale_ends) : '') + '"></label></div>' +
          '<label style="display:flex;gap:8px;align-items:center"><input id="pp-ea" type="checkbox" style="width:auto;margin:0" ' + (x.active ? 'checked' : '') + '> ظاهر للعملاء</label>' +
          '<button type="button" data-pp="save" data-id="' + id + '">حفظ</button></div>' : '') + '</div></div>';
    }).join('');
  }

  const paneHtml = () => '<div id="pp-host"><div class="card"><h2>إضافة منتج للمتجر</h2>' + addHtml() + '</div>' + importHtml() +
    '<div class="card"><h2>منتجات متجري (' + LIST.length + ')</h2>' + listHtml() + '</div></div>';

  const obs = new MutationObserver(() => mount());
  function watch() { try { obs.observe(document.body, { childList: true, subtree: true }); } catch (e) {} }

  function mount() {
    if (typeof ME === 'undefined' || !ME || ME.role !== 'pharmacy') return;
    const root = G('so-root'); if (!root) return;
    const ch = root.querySelector('.so-ch'); if (!ch) return;
    const has = ch.querySelector('[data-pp="tab"]'), host = G('pp-host');
    if (has && (!PS || host)) return;
    obs.disconnect();
    try {
      let b = has;
      if (!b) { b = document.createElement('button'); b.type = 'button'; b.dataset.pp = 'tab'; b.textContent = '🛍️ المنتجات'; ch.appendChild(b); }
      b.className = PS ? 'on' : '';
      if (PS) {
        ch.querySelectorAll('[data-soa="sec"]').forEach(x => x.classList.remove('on'));
        while (ch.nextSibling) ch.parentNode.removeChild(ch.nextSibling);
        ch.insertAdjacentHTML('afterend', paneHtml());
      }
    } finally { watch(); }
  }

  function draw() { const h = G('pp-host'); if (!h) return mount(); h.outerHTML = paneHtml(); }
  async function load() { LIST = ok(await sb.rpc('store_my_products')) || []; }

  async function act(t) {
    const k = t.dataset.pp;
    if (k === 'tab') {
      if (ME.status !== 'approved') throw new Error('حسابك لازم يتفعّل الأول');
      PS = true; SEL = null; RES = []; DONE = false; EDIT = null; IMP = { rows: [], report: null, busy: false };
      await load(); await loadOffers(); mount(); return;
    }
    if (k === 'tpl') { await template(); return; }
    if (k === 'cancelimp') { IMP = { rows: [], report: null, busy: false }; draw(); return; }
    if (k === 'import') { await runImport(); return; }
    if (k === 'search') {
      const q = G('pp-q').value.trim();
      if (q.length < 2) throw new Error('اكتب حرفين على الأقل');
      RES = ok(await sb.rpc('search_catalog', { p_q: q })) || []; DONE = true; draw();
      const i = G('pp-q'); if (i) i.value = q; return;
    }
    if (k === 'pick') {
      const r = RES.find(x => String(rid(x)) === t.dataset.id); if (!r) throw new Error('اختار المنتج تاني');
      SEL = { id: rid(r), name: r.name, brand: r.brand, category: r.category, r: r }; draw(); return;
    }
    if (k === 'back') { SEL = null; draw(); return; }
    if (k === 'add') {
      const pp = parseFloat(G('pp-p').value), ps = parseInt(G('pp-s').value, 10);
      if (!(pp >= 0)) throw new Error('السعر غير صحيح');
      if (!(ps >= 0)) throw new Error('الكمية غير صحيحة');
      const d = readDisc('pp-o', 'pp-d', pp);
      ok(await sb.rpc('store_upsert_product', Object.assign({ p_catalog: SEL.id, p_price: pp, p_stock: ps, p_active: true }, d)));
      toast('تمت إضافة المنتج لمتجرك'); SEL = null; RES = []; DONE = false; await load(); draw(); return;
    }
    if (k === 'edit') { EDIT = EDIT === t.dataset.id ? null : t.dataset.id; draw(); return; }
    if (k === 'save') {
      const x = LIST.find(r => String(r.id) === t.dataset.id); if (!x) throw new Error('حدّث الصفحة وجرب تاني');
      const pp = parseFloat(G('pp-ep').value), ps = parseInt(G('pp-es').value, 10);
      if (!(pp >= 0)) throw new Error('السعر غير صحيح');
      if (!(ps >= 0)) throw new Error('الكمية غير صحيحة');
      const d = readDisc('pp-eo', 'pp-ed', pp);
      ok(await sb.rpc('store_upsert_product', Object.assign({ p_catalog: x.catalog_id, p_price: pp, p_stock: ps, p_active: G('pp-ea').checked }, d)));
      toast('تم الحفظ'); EDIT = null; await load(); draw(); return;
    }
    if (k === 'del') {
      if (!confirm('حذف المنتج من متجرك؟')) return;
      ok(await sb.rpc('store_delete_product', { p_id: t.dataset.id }));
      toast('تم الحذف'); await load(); draw();
    }
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#so-root [data-soa="sec"]')) { PS = false; return; }
    const t = e.target.closest('[data-pp]'); if (!t) return;
    run(() => act(t));
  }, true);
  document.addEventListener('change', e => {
    const f = e.target;
    if (f && f.id === 'pp-file' && f.files && f.files[0]) run(() => readFile(f.files[0]));
  });

  watch(); mount();
})();
