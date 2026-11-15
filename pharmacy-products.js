/* pharmacy-products.js — قسم "🛍️ المنتجات" جوه تاب "متجري" عند الصيدلية (إضافة / تعديل / حذف / خصم بتاريخ انتهاء) */
(function () {
  'use strict';
  let LIST = [], RES = [], SEL = null, EDIT = null, DONE = false, PS = false;

  const st = document.createElement('style');
  st.textContent = `
  .pp-c{display:flex;gap:10px;padding:10px 0;border-top:1px solid #e3ecea}
  .pp-c:first-child{border-top:0}
  .pp-i{width:56px;height:56px;border-radius:12px;background:#eef5f4;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;font-size:24px}
  .pp-i img{width:100%;height:100%;object-fit:cover}
  .pp-b{flex:1;min-width:0}
  .pp-box{background:#f5f9f8;border-radius:12px;padding:10px;margin:8px 0}
  .pp-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .pp-r{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
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

  function addHtml() {
    if (SEL) return '<div class="loc"><b>' + esc(SEL.name) + '</b><div class="muted">' + esc(SEL.brand) + (SEL.category ? ' · ' + esc(SEL.category) : '') + '</div></div>' +
      '<div class="pp-g"><label>سعر البيع للعميل (ج.م)<input id="pp-p" type="number" min="0" step="0.01"></label>' +
      '<label>الكمية المتاحة<input id="pp-s" type="number" min="0" step="1"></label>' +
      '<label>السعر قبل الخصم (اختياري)<input id="pp-o" type="number" min="0" step="0.01"></label>' +
      '<label>انتهاء الخصم (اختياري)<input id="pp-d" type="date"></label></div>' +
      '<div class="muted">لو كتبت سعر قبل الخصم هيظهر للعميل مشطوب مع نسبة الخصم. بعد تاريخ الانتهاء السعر بيرجع للسعر قبل الخصم لوحده.</div>' +
      '<div class="pp-r"><button type="button" data-pp="add">إضافة للمتجر</button><button type="button" class="ghost" data-pp="back">رجوع</button></div>';
    return '<label>ابحث في الكتالوج بالاسم أو الباركود<input id="pp-q"></label>' +
      '<button type="button" data-pp="search">بحث</button><div>' +
      (DONE ? (RES.length ? RES.map(r => '<div class="item"><div><b>' + esc(r.name) + '</b><div class="muted">' + esc(r.brand) + (r.category ? ' · ' + esc(r.category) : '') + (r.barcode ? ' · ' + esc(r.barcode) : '') + '</div></div>' +
        '<button type="button" data-pp="pick" data-id="' + esc(rid(r)) + '">اختيار</button></div>').join('') : '<p class="muted">مفيش نتائج. المنتج لازم يكون في الكتالوج.</p>') : '') + '</div>';
  }

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

  const paneHtml = () => '<div id="pp-host"><div class="card"><h2>إضافة منتج للمتجر</h2>' + addHtml() + '</div>' +
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
      PS = true; SEL = null; RES = []; DONE = false; EDIT = null; await load(); mount(); return;
    }
    if (k === 'search') {
      const q = G('pp-q').value.trim();
      if (q.length < 2) throw new Error('اكتب حرفين على الأقل');
      RES = ok(await sb.rpc('search_catalog', { p_q: q })) || []; DONE = true; draw();
      const i = G('pp-q'); if (i) i.value = q; return;
    }
    if (k === 'pick') {
      const r = RES.find(x => String(rid(x)) === t.dataset.id); if (!r) throw new Error('اختار المنتج تاني');
      SEL = { id: rid(r), name: r.name, brand: r.brand, category: r.category }; draw(); return;
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

  watch(); mount();
})();
