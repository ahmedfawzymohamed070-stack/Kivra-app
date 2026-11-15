/* store-km2.js — رسوم التوصيل بالكيلومتر: 10 ج لكل كم (مسافة GPS × 1.3).
   الصيدلية بتحدد موقعها مرة، والعميل بيسمح بموقعه، والرسوم بتتحسب لوحدها. لو الموقع مش متاح بترجع للرسوم الثابتة.
   نسخة محسّنة: محاولة تانية بدقة أقل لو الأولى فشلت، ورسالة بالسبب الحقيقي بدل الصمت. */
(function () {
  const RATE = 10, FACTOR = 1.3, CK = 'kv_pos';
  const hav = (a, b, c, d) => {
    const R = 6371, t = x => x * Math.PI / 180, dl = t(c - a), dg = t(d - b);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dg / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const POSERR = {
    1: 'إذن الموقع مرفوض. دوس على 🔒 جنب الرابط ← الأذونات ← الموقع ← سماح',
    2: 'مش قادر أحدد موقعك. شغّل GPS الموبايل وجرّب تاني',
    3: 'تحديد الموقع أخد وقت طويل. اقف في مكان مفتوح وجرّب تاني'
  };
  let lastErr = '', lastWarn = 0;
  const noGeoShown = new Set();
  const say = m => { try { toast(m); } catch (e) {} };
  const geo = opts => new Promise(res => {
    navigator.geolocation.getCurrentPosition(p => res({ ok: 1, p }), e => res({ ok: 0, c: (e && e.code) || 0 }), opts);
  });

  const SK = 'kv_my_loc';
  function savedPos() {
    try {
      const x = JSON.parse(localStorage.getItem(SK) || 'null');
      if (x && isFinite(x.lat) && isFinite(x.lng)) return { lat: +x.lat, lng: +x.lng, t: Date.now(), saved: 1, at: x.at };
    } catch (e) {}
    return null;
  }
  async function getPos(force) {
    if (!force) { const sv = savedPos(); if (sv) return sv; }
    try {
      if (!force) { const c = JSON.parse(sessionStorage.getItem(CK) || 'null'); if (c && Date.now() - c.t < 600000) return c; }
    } catch (e) {}
    if (!navigator.geolocation) { lastErr = 'المتصفح مش بيدعم تحديد الموقع'; return null; }
    if (window.isSecureContext === false) { lastErr = 'تحديد الموقع بيشتغل بس على رابط https'; return null; }
    let r = await geo({ enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
    if (!r.ok && r.c !== 1) r = await geo({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    if (!r.ok) { lastErr = POSERR[r.c] || 'تعذر تحديد الموقع'; return null; }
    const o = { lat: r.p.coords.latitude, lng: r.p.coords.longitude, t: Date.now() };
    try { sessionStorage.setItem(CK, JSON.stringify(o)); } catch (e) {}
    return o;
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
        if (!row) {
          if (!noGeoShown.has(a.p_pharmacy)) { noGeoShown.add(a.p_pharmacy); say('الصيدلية دي لسه ما حددتش موقعها، فالتوصيل برسوم ثابتة'); }
          return r;
        }
        const pos = await getPos(false);
        if (!pos) { if (Date.now() - lastWarn > 30000) { lastWarn = Date.now(); say(lastErr || 'فعّل الموقع عشان رسوم التوصيل تتحسب بالكيلو'); } return r; }
        const km = hav(pos.lat, pos.lng, row.lat, row.lng) * FACTOR;
        r.data.profile = Object.assign({}, r.data.profile, { delivery_fee: Math.round(km * RATE), _km: Math.round(km * 10) / 10 });
        window.__kvkm = Math.round(km * 10) / 10;
      } catch (e) {}
      return r;
    });
  };


  // جانب العميل: كارت "موقعي للتوصيل" في تبويب حسابي (بيتحفظ على الموبايل ده ويتغيّر في أي وقت)
  const MAPHOST = /^https:\/\/([a-z0-9.\-]*google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i;
  function parseMaps(u) {
    u = String(u || '').trim();
    if (!MAPHOST.test(u)) throw new Error('الرابط لازم يكون من خرائط جوجل');
    const m = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || u.match(/[?&](?:q|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)/) || u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (!m) throw new Error('الرابط المختصر مش بيشتغل. افتحه في Chrome وانسخ الرابط الطويل من فوق، أو استخدم زرار "حدد موقعي الحالي"');
    const lat = +m[1], lng = +m[2];
    if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) throw new Error('الإحداثيات غلط');
    return { lat, lng };
  }
  function meStatus() {
    const st = document.getElementById('kv-me-st'); if (!st) return;
    const sv = savedPos();
    st.textContent = sv ? '✓ موقعك محفوظ' + (sv.at ? ' (' + new Date(sv.at).toLocaleDateString('ar-EG') + ')' : '') : 'مفيش موقع محفوظ، هنطلب موقعك الحالي لما تفتح صيدلية';
  }
  function paintMe() {
    if (typeof ME === 'undefined' || !ME || ['admin', 'warehouse', 'pharmacy'].indexOf(ME.role) > -1) return;
    const m = document.getElementById('main'); if (!m || document.getElementById('kv-me-loc')) return;
    const h = Array.prototype.find.call(m.querySelectorAll('.card h2'), x => x.textContent.indexOf('بيانات الحساب') > -1);
    if (!h) return;
    h.closest('.card').insertAdjacentHTML('afterend', '<div class="card" id="kv-me-loc"><h2>📍 موقعي للتوصيل</h2>' +
      '<div class="muted" id="kv-me-st">...</div>' +
      '<div style="margin:8px 0"><button type="button" class="ghost" data-kmme="gps">📍 حدد موقعي الحالي</button></div>' +
      '<label>أو الصق رابط موقعك من خرائط جوجل<input id="kv-me-url" dir="ltr" placeholder="https://www.google.com/maps/..."></label>' +
      '<div class="row"><button type="button" data-kmme="url">حفظ الرابط</button><button type="button" class="ghost" data-kmme="clear">مسح الموقع المحفوظ</button></div>' +
      '<div class="muted" style="margin-top:6px">الموقع بيتحفظ على الموبايل ده وبيتستخدم لحساب رسوم التوصيل. تقدر تغيّره في أي وقت، وبعد التغيير افتح الصيدلية تاني عشان الرسوم تتحدّث.</div></div>');
    meStatus();
  }
  function saveMe(pt) { try { localStorage.setItem(SK, JSON.stringify({ lat: pt.lat, lng: pt.lng, at: Date.now() })); } catch (e) { throw new Error('مقدرتش أحفظ الموقع على الموبايل'); } meStatus(); }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-kmme]'); if (!b) return;
    const k = b.dataset.kmme;
    run(async () => {
      if (k === 'gps') {
        toast('جاري تحديد الموقع...');
        const pos = await getPos(true);
        if (!pos) throw new Error(lastErr || 'مقدرتش أحدد الموقع');
        saveMe(pos); toast('تم حفظ موقعك ✓');
      } else if (k === 'url') {
        const pt = parseMaps((document.getElementById('kv-me-url') || {}).value);
        saveMe(pt); toast('تم حفظ موقعك ✓');
      } else if (k === 'clear') {
        try { localStorage.removeItem(SK); } catch (e) {}
        meStatus(); toast('تم مسح الموقع المحفوظ');
      }
    });
  });
  let tm2 = null;
  try { new MutationObserver(() => { clearTimeout(tm2); tm2 = setTimeout(() => { try { paintMe(); } catch (e) {} }, 120); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}

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
      if (!pos) throw new Error(lastErr || 'مقدرتش أحدد الموقع، تأكد إن الموقع مفعّل للمتصفح');
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
