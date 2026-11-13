/* store-km.js — رسوم التوصيل بالكيلومتر: 10 ج لكل كم (مسافة GPS × 1.3).
   الصيدلية بتحدد موقعها مرة، والعميل بيسمح بموقعه، والرسوم بتتحسب لوحدها. لو الموقع مش متاح بترجع للرسوم الثابتة. */
(function () {
  const RATE = 10, FACTOR = 1.3, CK = 'kv_pos';
  const hav = (a, b, c, d) => {
    const R = 6371, t = x => x * Math.PI / 180, dl = t(c - a), dg = t(d - b);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dg / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  let warned = false;
  function getPos(force) {
    try {
      if (!force) { const c = JSON.parse(sessionStorage.getItem(CK) || 'null'); if (c && Date.now() - c.t < 600000) return Promise.resolve(c); }
    } catch (e) {}
    return new Promise(res => {
      if (!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition(p => {
        const o = { lat: p.coords.latitude, lng: p.coords.longitude, t: Date.now() };
        try { sessionStorage.setItem(CK, JSON.stringify(o)); } catch (e) {}
        res(o);
      }, () => res(null), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
  }

  const _r = sb.rpc.bind(sb);
  sb.rpc = function (n, a, o) {
    const p = _r(n, a, o);
    if (n !== 'store_public_profile' || !a || !a.p_pharmacy) return p;
    window.__kvkm = null;
    return Promise.resolve(p).then(async r => {
      try {
        if (!r || !r.data || !r.data.profile) return r;
        const g = await _r('store_get_geo', { p_pharmacy: a.p_pharmacy });
        const row = g && (Array.isArray(g.data) ? g.data[0] : g.data);
        if (!row) return r;
        const pos = await getPos(false);
        if (!pos) { if (!warned) { warned = true; try { toast('فعّل الموقع عشان رسوم التوصيل تتحسب بالكيلو'); } catch (e) {} } return r; }
        const km = hav(pos.lat, pos.lng, row.lat, row.lng) * FACTOR;
        r.data.profile = Object.assign({}, r.data.profile, { delivery_fee: Math.round(km * RATE), _km: Math.round(km * 10) / 10 });
        window.__kvkm = Math.round(km * 10) / 10;
      } catch (e) {}
      return r;
    });
  };

  // جانب الصيدلية: زرار تحديد موقع الصيدلية
  async function paintGeo() {
    const card = document.getElementById('sx-card');
    if (!card || document.getElementById('sx-geo')) return;
    const btn = card.querySelector('[data-sxa="save"]'); if (!btn) return;
    btn.insertAdjacentHTML('afterend', '<div id="sx-geo" style="margin-top:14px"><h2>📍 موقع الصيدلية</h2>' +
      '<div class="muted">رسوم التوصيل بتتحسب 10 ج لكل كيلو من موقع الصيدلية للعميل. وإنت واقف في الصيدلية دوس الزرار.</div>' +
      '<div class="muted" id="sx-geo-st">...</div><button type="button" class="ghost" data-kmact="set">📍 حدد موقعي الحالي كموقع للصيدلية</button></div>');
    try {
      const g = await _r('store_get_geo', { p_pharmacy: ME.id });
      const row = g && (Array.isArray(g.data) ? g.data[0] : g.data);
      const st = document.getElementById('sx-geo-st');
      if (st) st.textContent = row ? '✓ الموقع محدد' : '⚠️ الموقع لسه متحددش، فالرسوم بتبقى ثابتة';
    } catch (e) {}
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-kmact="set"]'); if (!b) return;
    run(async () => {
      toast('جاري تحديد الموقع...');
      const pos = await getPos(true);
      if (!pos) throw new Error('مقدرتش أحدد الموقع، تأكد إن الموقع مفعّل للمتصفح');
      ok(await _r('store_set_geo', { p_lat: pos.lat, p_lng: pos.lng }));
      const st = document.getElementById('sx-geo-st'); if (st) st.textContent = '✓ الموقع محدد';
      toast('تم حفظ موقع الصيدلية');
    });
  });
  let tm = null;
  try { new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(() => { try { if (ME && ME.role === 'pharmacy') paintGeo(); } catch (e) {} }, 120); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  // سطر توضيحي في السلة: المسافة × 10 ج (بيظهر بس لو الرسوم اتحسبت بالكيلو)
  function paintKm() {
    const sh = document.getElementById('sx-sheet'); if (!sh || document.getElementById('sx-km')) return;
    if (window.__kvkm == null) return;
    const rows = sh.querySelectorAll('.sx-sum > div');
    for (const d of rows) {
      const sp = d.querySelector('span');
      if (sp && sp.textContent.trim() === 'التوصيل') {
        d.insertAdjacentHTML('afterend', '<div id="sx-km" class="muted" style="display:block;font-size:12px">📍 المسافة تقريباً ' + window.__kvkm + ' كم × 10 ج</div>');
        return;
      }
    }
  }
  try { new MutationObserver(() => { try { paintKm(); } catch (e) {} }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
})();
