/* polish-logo.js — لوجو المخزن: رفع من "حسابي" عند المخزن، وظهوره في "الموزعين" عند الصيدلية.
   بيتحمّل في آخر index.html بعد polish-pages.js. لو حصل أي خطأ الصفحات القديمة تفضل زي ما هي. */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '.dc .av{overflow:hidden}.dc .av img{width:100%;height:100%;object-fit:cover;display:block}' +
    '#logocard .lg{width:84px;height:84px;border-radius:18px;border:1px solid var(--bd);background:var(--soft);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:30px;color:var(--p);font-weight:700}' +
    '#logocard .lg img{width:100%;height:100%;object-fit:cover;display:block}';
  document.head.appendChild(st);

  function say(t) { try { toast(t); } catch (e) {} }
  function pub(p) { return sb.storage.from('logos').getPublicUrl(p).data.publicUrl; }

  function shrink(file) {
    return new Promise(function (res, rej) {
      var img = new Image();
      var u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, 320 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * s));
        c.height = Math.max(1, Math.round(img.height * s));
        var x = c.getContext('2d');
        x.fillStyle = '#fff';
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('تعذر تجهيز الصورة')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error('الملف مش صورة صالحة')); };
      img.src = u;
    });
  }

  /* ---------- حسابي عند المخزن ---------- */
  function logoCard() {
    var has = ME && ME.logo_path;
    return '<div class="card" id="logocard"><h2>لوجو المخزن</h2>' +
      '<div class="row"><div class="lg">' + (has ? '<img src="' + esc(pub(ME.logo_path)) + '" alt="">' : esc((ME.business_name || '?').trim().charAt(0))) + '</div>' +
      '<div style="flex:1;min-width:160px"><div class="muted">بيظهر للصيدليات في صفحة الموزعين. صورة مربعة وواضحة أحسن.</div></div></div>' +
      '<label>اختار صورة اللوجو<input id="logof" type="file" accept="image/*"></label>' +
      '<div class="row"><button id="logoup">رفع اللوجو</button>' +
      (has ? '<button id="logodel" class="ghost">حذف اللوجو</button>' : '') + '</div></div>';
  }
  async function refreshAcc() {
    var m = document.getElementById('main');
    if (m && V.warehouse && V.warehouse.acc) await V.warehouse.acc(m);
  }
  function wireLogo(m) {
    var up = m.querySelector('#logoup'), del = m.querySelector('#logodel');
    if (up) up.onclick = function () { run(async function () {
      var f = m.querySelector('#logof').files[0];
      if (!f) throw new Error('اختار صورة الأول');
      if (f.size > 8 * 1024 * 1024) throw new Error('الصورة كبيرة، اختار صورة أصغر');
      up.disabled = true;
      try {
        var blob = await shrink(f);
        var path = ME.id + '/logo-' + Date.now() + '.jpg';
        var r1 = await sb.storage.from('logos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (r1.error) throw r1.error;
        var r2 = await sb.rpc('set_my_logo', { p_path: path });
        if (r2.error) throw r2.error;
        var old = ME.logo_path;
        ME.logo_path = path;
        if (old) { try { await sb.storage.from('logos').remove([old]); } catch (e) {} }
        say('تم رفع اللوجو ✅');
        await refreshAcc();
      } finally { up.disabled = false; }
    }); };
    if (del) del.onclick = function () { run(async function () {
      var old = ME.logo_path;
      var r = await sb.rpc('set_my_logo', { p_path: null });
      if (r.error) throw r.error;
      ME.logo_path = null;
      if (old) { try { await sb.storage.from('logos').remove([old]); } catch (e) {} }
      say('تم حذف اللوجو');
      await refreshAcc();
    }); };
  }
  if (V.warehouse && V.warehouse.acc) {
    var origAcc = V.warehouse.acc;
    V.warehouse.acc = async function (m) {
      await origAcc(m);
      try {
        var old = m.querySelector('#logocard');
        if (old) old.remove();
        m.insertAdjacentHTML('afterbegin', logoCard());
        wireLogo(m);
      } catch (e) { /* الصفحة القديمة تفضل زي ما هي */ }
    };
  }

  /* ---------- الموزعين عند الصيدلية ---------- */
  var obs = null;
  if (V.pharmacy && V.pharmacy.dist) {
    var origDist = V.pharmacy.dist;
    V.pharmacy.dist = async function (m) {
      await origDist(m);
      try {
        if (obs) { obs.disconnect(); obs = null; }
        var r = await sb.rpc('warehouse_logos');
        if (r.error || !Array.isArray(r.data)) return;
        var map = {};
        r.data.forEach(function (x) { map[x.id] = x.logo_path; });
        var apply = function () {
          m.querySelectorAll('.dc').forEach(function (card) {
            var b = card.querySelector('[data-act="whfilter"]');
            var av = card.querySelector('.av');
            if (!b || !av || av.querySelector('img')) return;
            var p = map[b.getAttribute('data-id')];
            if (p) av.innerHTML = '<img src="' + esc(pub(p)) + '" alt="">';
          });
        };
        apply();
        obs = new MutationObserver(apply);
        obs.observe(m, { childList: true, subtree: true });
      } catch (e) { /* الصفحة القديمة تفضل زي ما هي */ }
    };
  }
})();
