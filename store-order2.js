/* store-order2.js — إرسال طلب العميل للصيدلية جوه التطبيق (بدل واتساب). عرض الطلبات في store-orders-ui.js */
(function () {
  const _o = sb.rpc.bind(sb);
  let PH = '';
  sb.rpc = function (n, a, o) {
    if ((n === 'store_public_profile' || n === 'store_view') && a && a.p_pharmacy) PH = a.p_pharmacy;
    return _o(n, a, o);
  };
  const digits = s => String(s || '').replace(/[^\d.]/g, '');
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function getPos() {
    try { const c = JSON.parse(sessionStorage.getItem('kv_pos') || 'null'); if (c && Date.now() - c.t < 600000) return Promise.resolve(c); } catch (e) {}
    return new Promise(res => {
      if (!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition(p => {
        const o = { lat: p.coords.latitude, lng: p.coords.longitude, t: Date.now() };
        try { sessionStorage.setItem('kv_pos', JSON.stringify(o)); } catch (e) {}
        res(o);
      }, () => res(null), { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
    });
  }

  // ===== جانب العميل =====
  async function sendOrder() {
    const sh = document.getElementById('sx-sheet'); if (!sh) return;
    if (!PH) throw new Error('افتح متجر الصيدلية الأول');
    const lock = sh.querySelector('p.lock'); if (lock) throw new Error(lock.textContent.trim());
    const items = [...sh.querySelectorAll('.sx-ci')].map(r => {
      const bt = r.querySelector('[data-i]'), qb = r.querySelector('.sx-q b'), nb = r.querySelector('b');
      return { id: bt ? bt.dataset.i : '', qty: parseInt(qb ? qb.textContent : '0', 10), name: nb ? nb.textContent.trim() : '' };
    });
    if (!items.length) throw new Error('السلة فاضية');
    const mb = sh.querySelector('.sx-seg button.on'), mode = (mb && mb.dataset.m === 'pickup') ? 'pickup' : 'delivery';
    const val = k => { const e = sh.querySelector('[data-sxi="' + k + '"]'); return e ? e.value.trim() : ''; };
    const name = val('n'), phone = val('p'), addr = val('a'), notes = val('t');
    if (!name) throw new Error('اكتب اسمك');
    if (digits(phone).length < 8) throw new Error('اكتب رقم موبايل صحيح');
    if (mode === 'delivery' && !addr) throw new Error('اكتب عنوان التوصيل');
    let fee = 0;
    for (const d of sh.querySelectorAll('.sx-sum > div')) { const sp = d.querySelectorAll('span'); if (sp[0] && sp[0].textContent.trim() === 'التوصيل') fee = parseFloat(digits(sp[1] && sp[1].textContent)) || 0; }
    const up = sh.querySelector('[data-kvu]:checked'), pts = up ? (parseInt(up.getAttribute('data-pts'), 10) || 0) : 0;
    let pos = null; if (mode === 'delivery') pos = await getPos();
    toast('جاري إرسال الطلب...');
    const args = { p_pharmacy: PH, p_mode: mode, p_name: name, p_phone: phone, p_address: addr, p_notes: notes,
      p_lat: pos ? pos.lat : null, p_lng: pos ? pos.lng : null, p_items: items, p_fee: fee };
    if (pts > 0) args.p_points = pts;
    const id = ok(await _o('store_place_order', args));
    // فضّي السلة
    for (let i = 0; i < 3000; i++) {
      const b = document.querySelector('#sx-sheet .sx-ci [data-d="-1"]'); if (!b) break;
      b.click(); await wait(25);
    }
    const old = document.getElementById('sx-sheet'); if (old) old.remove();
    const no = String(id).padStart(6, '0');
    const d = document.createElement('div'); d.id = 'sx-sheet';
    d.innerHTML = '<div class="sx-p" style="text-align:center"><div style="font-size:48px">✅</div><h2>تم إرسال طلبك للصيدلية</h2><p class="muted">رقم الطلب: <b>' + no + '</b></p><p class="muted">الصيدلية هتراجع الطلب وتتواصل معاك لو احتاجت حاجة.</p><button type="button" style="width:100%" data-sxa="close">تمام</button></div>';
    d.addEventListener('click', e => { if (e.target === d) d.remove(); });
    document.body.appendChild(d);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-sxa="send"]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    run(sendOrder);
  }, true);

  // غيّر نصوص واتساب في السلة
  function fixText() {
    const sh = document.getElementById('sx-sheet'); if (!sh) return;
    const b = sh.querySelector('[data-sxa="send"]');
    if (b && b.textContent.indexOf('واتساب') > -1) b.textContent = 'إرسال الطلب للصيدلية';
    sh.querySelectorAll('p.muted').forEach(p => { if (p.textContent.indexOf('واتساب') > -1) p.textContent = 'الطلب بيتبعت للصيدلية جوه التطبيق، والدفع والتأكيد معاها مباشرة.'; });
  }

  let tm = null;
  try { new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(() => { try { fixText(); } catch (e) {} }, 80); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
})();
