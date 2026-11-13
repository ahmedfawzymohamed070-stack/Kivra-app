/* store-profile.js — صفحة "متجرك" عند الصيدلية (جوه حسابي): غلاف ولوجو وبيانات توصيل وبانرات ورابط مشاركة */
(function () {
  const st = document.createElement('style');
  st.textContent = `
.sx-pg{height:8px;background:#e3ecea;border-radius:99px;overflow:hidden;margin:8px 0 4px}
.sx-pg i{display:block;height:100%;background:linear-gradient(90deg,#1F6F6B,#E3A857);border-radius:99px}
.sx-cvp{position:relative;height:120px;margin:10px 0 44px;border-radius:14px;background:#e6efee center/cover no-repeat;display:flex;align-items:center;justify-content:center}
.sx-lgp{position:absolute;bottom:-34px;right:14px;width:68px;height:68px;border-radius:16px;border:3px solid #fff;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#1F6F6B;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.sx-lgp img{width:100%;height:100%;object-fit:cover}
.sx-up{display:inline-block;padding:10px 14px;border-radius:12px;background:var(--soft);color:var(--p);font-size:14px;cursor:pointer}
.sx-tg{display:flex;gap:8px;align-items:center;margin:10px 0!important}
.sx-tg input{width:auto!important;margin:0!important}
.sx-bi{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #eef3f2}
.sx-bi img{width:96px;height:48px;object-fit:cover;border-radius:8px;background:#eceeee}
.sx-bi div{flex:1;min-width:0}
.sx-lnk{direction:ltr;word-break:break-all;background:var(--soft);border-radius:10px;padding:8px 10px;font-size:12px;margin:6px 0}
`;
  document.head.appendChild(st);

  const num = v => { const n = Number(v); return isFinite(n) ? n : 0; };

  function compress(file, max, q) {
    return new Promise((res, rej) => {
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = () => {
        let w = img.width, h = img.height; const k = Math.min(1, max / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(u); c.toBlob(b => b ? res(b) : rej(new Error('تعذّرت معالجة الصورة')), 'image/jpeg', q);
      };
      img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('الملف مش صورة صالحة')); };
      img.src = u;
    });
  }
  async function upload(file, kind, max) {
    const b = await compress(file, max, .82), path = `${ME.id}/${kind}-${Date.now()}.jpg`;
    ok(await sb.storage.from('store-media').upload(path, b, { contentType: 'image/jpeg' }));
    return sb.storage.from('store-media').getPublicUrl(path).data.publicUrl;
  }

  let PS = null, PB = [], PLOAD = false, PFAIL = false;
  const PDEF = { tagline: '', delivery_time: '', delivery_fee: 0, free_over: '', min_order: 0, hours: '', is_open: true, pickup: true, logo_url: '', cover_url: '', bn_title: '', bn_brand: '' };

  async function loadP() {
    if (PLOAD || PS || PFAIL) return; PLOAD = true;
    try {
      const p = ok(await sb.rpc('store_get_my_profile')) || {};
      PS = Object.assign({}, PDEF, p); PB = ok(await sb.rpc('store_my_banners')) || [];
    } catch (e) { PS = null; PFAIL = true; toast('بيانات المتجر مش متاحة دلوقتي (تأكد إن SQL اتنفذ)'); }
    PLOAD = false; paintP();
  }

  function pHtml() {
    const s = PS, ck = [s.logo_url, s.cover_url, s.tagline, s.delivery_time, s.hours, PB.length ? 1 : ''];
    const pct = Math.round(ck.filter(Boolean).length / ck.length * 100);
    return `<div class="card" id="sx-card"><h2>🏬 بيانات متجرك للعملاء</h2>
<div class="sx-pg"><i style="width:${pct}%"></i></div>
<div class="muted">اكتمال المتجر ${pct}%${pct < 100 ? ' — كمّل الناقص عشان متجرك يبان احترافي' : ' ✓'}</div>
<div class="sx-cvp" style="${s.cover_url ? `background-image:url('${esc(s.cover_url)}')` : ''}">${s.cover_url ? '' : '<span class="muted">مفيش صورة غلاف</span>'}
<div class="sx-lgp">${s.logo_url ? `<img src="${esc(s.logo_url)}" alt="">` : esc((ME.business_name || '؟').trim().charAt(0))}</div></div>
<div class="row"><label class="sx-up">📷 صورة الغلاف<input type="file" accept="image/*" data-sxf="cover" hidden></label>
<label class="sx-up">🖼️ لوجو الصيدلية<input type="file" accept="image/*" data-sxf="logo" hidden></label></div>
<label>وصف قصير<input data-sxk="tagline" maxlength="120" placeholder="مثال: صيدلية وعناية بالبشرة والشعر" value="${esc(s.tagline)}"></label>
<div class="grid"><label>وقت التوصيل<input data-sxk="delivery_time" maxlength="40" placeholder="30-45 دقيقة" value="${esc(s.delivery_time)}"></label>
<label>مواعيد العمل<input data-sxk="hours" maxlength="60" placeholder="9 ص - 12 م يومياً" value="${esc(s.hours)}"></label>
<label>رسوم التوصيل (ج.م)<input data-sxk="delivery_fee" type="number" min="0" step="0.5" value="${esc(s.delivery_fee)}"></label>
<label>توصيل مجاني فوق (ج.م)<input data-sxk="free_over" type="number" min="0" step="1" placeholder="اختياري" value="${esc(s.free_over)}"></label>
<label>أقل قيمة للطلب (ج.م)<input data-sxk="min_order" type="number" min="0" step="1" value="${esc(s.min_order)}"></label></div>
<label class="sx-tg"><input type="checkbox" data-sxk="is_open" ${s.is_open ? 'checked' : ''}> المتجر مفتوح دلوقتي</label>
<label class="sx-tg"><input type="checkbox" data-sxk="pickup" ${s.pickup ? 'checked' : ''}> الاستلام من الصيدلية متاح</label>
<button type="button" data-sxa="save">حفظ بيانات المتجر</button>
<h2 style="margin-top:18px">🔗 رابط متجرك</h2>
<div class="muted">ابعته لعملائك أو حطه على واتساب وانستجرام، ويفتح متجرك على طول.</div>
<div class="sx-lnk">${esc(location.origin + '/?store=' + ME.id)}</div>
<div class="row"><button type="button" class="ghost" data-sxa="copy">نسخ الرابط</button><button type="button" class="ghost" data-sxa="wa">مشاركة على واتساب</button></div>
<h2 style="margin-top:18px">🖼️ بانرات متجرك (${PB.length}/5)</h2>
${PB.map(b => `<div class="sx-bi"><img src="${esc(b.image_url)}" alt=""><div><b>${esc(b.title || 'بدون عنوان')}</b><div class="muted">${b.brand ? 'ماركة: ' + esc(b.brand) : ''}</div></div><button type="button" class="red" data-sxa="delb" data-id="${esc(b.id)}">حذف</button></div>`).join('')}
${PB.length < 5 ? `<label>عنوان البانر (اختياري)<input data-sxk="bn_title" maxlength="60" value="${esc(s.bn_title)}"></label>
<label>اسم ماركة يفتحها البانر (اختياري)<input data-sxk="bn_brand" maxlength="60" value="${esc(s.bn_brand)}"></label>
<label class="sx-up">➕ اختيار صورة البانر وإضافته<input type="file" accept="image/*" data-sxf="banner" hidden></label>` : '<p class="muted">وصلت للحد الأقصى، احذف بانر لو عاوز تضيف.</p>'}
</div>`;
  }

  function paintP() {
    const ab = document.querySelector('#stp .ab');
    if (!ab) { PFAIL = false; return; }
    if (document.getElementById('sx-card')) return;
    if (!PS) { if (!PLOAD && !PFAIL) loadP(); return; }
    ab.insertAdjacentHTML('afterbegin', pHtml());
  }
  function refreshP() { const c = document.getElementById('sx-card'); if (c) c.remove(); paintP(); }

  async function saveP() {
    const s = PS, fee = parseFloat(s.delivery_fee || 0), mo = parseFloat(s.min_order || 0);
    const fo = (s.free_over === '' || s.free_over == null) ? null : parseFloat(s.free_over);
    if (!(fee >= 0) || !(mo >= 0) || (fo !== null && !(fo >= 0))) throw new Error('الأرقام لازم تكون صحيحة');
    ok(await sb.rpc('store_save_my_profile', { p_logo: s.logo_url || '', p_cover: s.cover_url || '', p_tagline: s.tagline || '', p_delivery_time: s.delivery_time || '',
      p_delivery_fee: fee, p_free_over: fo, p_min_order: mo, p_hours: s.hours || '', p_is_open: !!s.is_open, p_pickup: !!s.pickup }));
  }

  document.addEventListener('input', e => {
    const t = e.target, k = t && t.dataset && t.dataset.sxk; if (!k || !PS) return;
    PS[k] = t.type === 'checkbox' ? t.checked : t.value;
  });
  document.addEventListener('change', e => {
    const t = e.target, k = t && t.dataset && t.dataset.sxk;
    if (k && PS && t.type === 'checkbox') PS[k] = t.checked;
    const fk = t && t.dataset && t.dataset.sxf; if (!fk) return;
    const f = t.files && t.files[0]; if (!f) return; t.value = '';
    run(async () => {
      if (!/^image\//.test(f.type)) throw new Error('اختار صورة');
      if (f.size > 20 * 1024 * 1024) throw new Error('الصورة كبيرة قوي');
      toast('جاري رفع الصورة...');
      if (fk === 'banner') {
        const u = await upload(f, 'banner', 1280);
        ok(await sb.rpc('store_add_banner', { p_image: u, p_title: (PS.bn_title || '').trim(), p_brand: (PS.bn_brand || '').trim() }));
        PS.bn_title = ''; PS.bn_brand = ''; PB = ok(await sb.rpc('store_my_banners')) || []; toast('تمت إضافة البانر');
      } else {
        const u = await upload(f, fk, fk === 'cover' ? 1400 : 400);
        PS[fk === 'cover' ? 'cover_url' : 'logo_url'] = u; await saveP(); toast('تم رفع الصورة وحفظها');
      }
      refreshP();
    });
  });

  document.addEventListener('click', e => {
    const a = e.target.closest('#sx-card [data-sxa]'); if (!a) return;
    const k = a.dataset.sxa, link = location.origin + '/?store=' + ME.id;
    if (k === 'save') run(async () => { await saveP(); toast('تم حفظ بيانات المتجر'); });
    if (k === 'copy') { try { navigator.clipboard.writeText(link); toast('تم نسخ الرابط'); } catch (x) { toast(link); } }
    if (k === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent('متجرنا على Kivra: ' + link), '_blank');
    if (k === 'delb') run(async () => {
      if (!confirm('حذف البانر؟')) return;
      ok(await sb.rpc('store_delete_banner', { p_id: a.dataset.id }));
      PB = ok(await sb.rpc('store_my_banners')) || []; refreshP();
    });
  });

  let tm = null;
  try { new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(() => { try { if (ME && ME.role === 'pharmacy') paintP(); } catch (e) {} }, 80); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
})();
