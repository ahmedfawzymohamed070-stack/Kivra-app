/* order-tracking.js — تتبّع الطلب بوضوح: شريط من 4 خطوات مع وقت كل خطوة، ونافذة الشحن مع بيانات الدليفري.
   الحالات الداخلية ما اتغيّرتش (delivered = تم الشحن، received = تم التسليم)، فالعمولة والاستلام التلقائي زي ما هم.
   بيعتمد على دالتين في قاعدة البيانات: ship_order و order_tracking_info. لو حصل أي خطأ بقية التطبيق يفضل شغال. */
(function () {
  const css = `
.trk{display:flex;margin:8px 0 4px;padding:8px 4px 2px;background:var(--soft,#f1f7f6);border-radius:10px}
.trs{flex:1;position:relative;text-align:center;min-width:0}
.trs i{width:22px;height:22px;border-radius:50%;background:#d9e0df;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:12px;font-style:normal;position:relative;z-index:1}
.trs::after{content:'';position:absolute;top:11px;right:50%;width:100%;height:2px;background:#d9e0df;z-index:0}
.trs:last-child::after{display:none}
.trs.done i{background:var(--p,#1F6F6B)}
.trs.lk::after{background:var(--p,#1F6F6B)}
.trs.cur i{background:#fff;color:var(--p,#1F6F6B);border:2px solid var(--p,#1F6F6B);box-shadow:0 0 0 3px rgba(31,111,107,.15)}
.trs.bad i{background:#c0392b}
.trs b{display:block;font-size:11px;margin-top:3px;font-weight:600;color:#33403f}
.trs.todo b{color:#8a9a98;font-weight:500}
.trs small{display:block;font-size:10px;color:var(--mu,#7d8a88);line-height:1.3;min-height:13px}
.drv{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0;font-size:13px;color:#33403f}
.drv a{background:var(--soft,#f1f7f6);color:var(--p,#1F6F6B);padding:3px 10px;border-radius:99px;text-decoration:none;font-size:12.5px}
.trk-ov{position:fixed;inset:0;z-index:100;background:rgba(10,30,28,.55);display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl}
.trk-box{background:#fff;border-radius:18px;max-width:340px;width:100%;padding:18px 16px 14px;box-shadow:0 10px 40px rgba(0,0,0,.25)}
.trk-ic{font-size:30px;text-align:center}
.trk-t{font-size:16px;font-weight:700;text-align:center;margin:2px 0}
.trk-s{font-size:12.5px;color:var(--mu,#7d8a88);text-align:center;margin-bottom:6px}
.trk-box label{display:block;margin:8px 0;font-size:13px}
.trk-err{background:#fde2de;color:#9b2a1d;border-radius:10px;padding:8px 10px;font-size:13px;margin:8px 0}
.trk-b{display:flex;gap:8px;margin-top:10px}
.trk-b button{flex:1;padding:11px!important;border-radius:12px;border:0;font-size:14px!important;font-weight:600;cursor:pointer}
.trk-no{background:#eef1f1!important;color:#334!important}
.trk-yes{background:linear-gradient(135deg,var(--p,#1F6F6B),var(--p2,#2A8780));color:#fff}
`;
  const st = document.createElement('style');
  st.id = 'order-tracking';
  st.textContent = css;
  document.head.appendChild(st);

  /* الأسماء الجديدة (الحالات الداخلية زي ما هي) */
  Object.assign(OST, { accepted: 'قيد التجهيز', delivered: 'تم الشحن', received: 'تم التسليم' });

  const fmt = d => d ? new Date(d).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
  const clean = p => String(p || '').replace(/[^0-9+]/g, '');
  const toWa = p => {
    let d = String(p || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    else if (d.startsWith('0')) d = '20' + d.slice(1);
    return d;
  };

  function stepsFor(o, ti) {
    const s = o.status;
    if (s === 'rejected' || s === 'cancelled') {
      return [
        { t: 'تم الطلب', done: true, at: o.created_at },
        { t: s === 'rejected' ? 'مرفوض' : 'ملغي', bad: true, at: '' }
      ];
    }
    const acc = ['accepted', 'delivered', 'received'].includes(s);
    const shp = ['delivered', 'received'].includes(s);
    const rec = s === 'received';
    return [
      { t: 'تم الطلب', done: true, at: o.created_at },
      { t: 'القبول والتجهيز', done: acc, at: acc && ti ? ti.accepted_at : '' },
      { t: 'تم الشحن', done: shp, at: shp ? o.delivered_at : '' },
      { t: 'تم التسليم', done: rec, at: rec ? o.received_at : '' }
    ];
  }
  function barHtml(steps) {
    const cur = steps.findIndex(x => !x.done && !x.bad);
    return '<div class="trk">' + steps.map((x, i) => {
      const next = steps[i + 1];
      let cls = x.bad ? 'bad' : x.done ? 'done' : (i === cur ? 'cur' : 'todo');
      if (x.done && next && next.done) cls += ' lk';
      const icon = x.bad ? '✕' : x.done ? '✓' : (i + 1);
      return '<div class="trs ' + cls + '"><i>' + icon + '</i><b>' + esc(x.t) + '</b><small>' + esc(fmt(x.at)) + '</small></div>';
    }).join('') + '</div>';
  }
  function driverHtml(o, ti) {
    if (!ti || !(ti.driver_name || ti.driver_phone) || !['delivered', 'received'].includes(o.status)) return '';
    const ph = clean(ti.driver_phone);
    return '<div class="drv">🚚 <b>' + esc(ti.driver_name || 'الدليفري') + '</b>' +
      (ph ? ' <a href="tel:' + esc(ph) + '">📞 اتصال</a> <a href="https://wa.me/' + esc(toWa(ph)) + '" target="_blank" rel="noopener">💬 واتساب</a>' : '') + '</div>';
  }

  /* بيانات وقت القبول والدليفري */
  let TI = {}, tiAt = 0, inflight = null;
  function loadTI() {
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const rows = ok(await sb.rpc('order_tracking_info')) || [];
        const m = {};
        rows.forEach(r => { m[r.order_id] = r; });
        TI = m; tiAt = Date.now();
      } catch (e) { /* لو الدالة مش موجودة لسه، الشريط بيشتغل من غير وقت القبول والدليفري */ }
      finally { inflight = null; }
    })();
    return inflight;
  }

  function paintCard(c, o) {
    c.querySelectorAll('.trk,.drv').forEach(x => x.remove());
    const ti = TI[o.id];
    const head = c.querySelector('.oh') || c.firstElementChild;
    if (!head) return;
    head.insertAdjacentHTML('afterend', barHtml(stepsFor(o, ti)) + driverHtml(o, ti));
    c.querySelectorAll('.onote,.muted').forEach(n => {
      if (n.children.length === 0 && n.textContent.includes('من التسليم')) n.textContent = n.textContent.replace('من التسليم', 'من الشحن');
    });
    c.querySelectorAll('[data-act="ostat"][data-st="delivered"]').forEach(b => { b.textContent = 'تم الشحن'; });
  }

  let busy = false, again = false;
  async function refresh() {
    if (busy) { again = true; return; }
    busy = true;
    try {
      const l = Array.isArray(ORD) ? ORD : [];
      const cards = [...document.querySelectorAll('.oc:not([data-trk]), .item:not([data-trk])')].filter(c => {
        const b = c.querySelector('b');
        const m = b && /^طلب #(\d+)/.exec(b.textContent.trim());
        const o = m && l.find(x => String(x.order_no) === m[1]);
        if (!o) { c.dataset.trk = '0'; return false; }
        c._o = o;
        return true;
      });
      if (cards.length) {
        cards.forEach(c => { c.dataset.trk = '1'; paintCard(c, c._o); });
        if (Date.now() - tiAt > 3000) {
          await loadTI();
          cards.forEach(c => { if (c.isConnected) paintCard(c, c._o); });
        }
      }
    } catch (e) { /* تجاهل */ }
    finally {
      busy = false;
      if (again) { again = false; refresh(); }
    }
  }

  /* نافذة الشحن */
  const closeDlg = () => { const o = document.getElementById('trk-dlg'); if (o) o.remove(); };
  function openShip(oid) {
    closeDlg();
    const o = document.createElement('div');
    o.id = 'trk-dlg';
    o.className = 'trk-ov';
    o.innerHTML = '<div class="trk-box"><div class="trk-ic">🚚</div><div class="trk-t">تأكيد شحن الطلب</div>' +
      '<div class="trk-s">بيانات الدليفري اختيارية، وهتظهر للصيدلية.</div>' +
      '<label>اسم الدليفري<input id="trk-dn" maxlength="60" placeholder="مثال: أحمد"></label>' +
      '<label>رقم الدليفري<input id="trk-dp" type="tel" dir="ltr" maxlength="16" placeholder="01xxxxxxxxx"></label>' +
      '<p id="trk-err" class="trk-err" hidden></p>' +
      '<div class="trk-b"><button class="trk-no" data-no>إلغاء</button><button class="trk-yes" data-yes>تأكيد الشحن</button></div></div>';
    o.addEventListener('click', async ev => {
      if (ev.target === o || ev.target.closest('[data-no]')) { closeDlg(); return; }
      const y = ev.target.closest('[data-yes]');
      if (!y) return;
      const err = document.getElementById('trk-err');
      const say = t => { err.textContent = t; err.hidden = !t; };
      say('');
      const dn = document.getElementById('trk-dn').value.trim();
      const dp = clean(document.getElementById('trk-dp').value);
      if (dp && (dp.length < 7 || dp.length > 16)) { say('رقم الدليفري غير صحيح'); return; }
      y.disabled = true;
      try {
        ok(await sb.rpc('ship_order', { p_oid: oid, p_driver_name: dn || null, p_driver_phone: dp || null }));
      } catch (e) {
        y.disabled = false;
        say(e.message || 'حصل خطأ، حاول تاني');
        return;
      }
      closeDlg();
      tiAt = 0;
      toast('تم تسجيل الشحن');
      await show(TAB);
    });
    document.body.appendChild(o);
  }
  /* بدل زرار "تم التسليم" القديم عند المخزن: نفتح نافذة الشحن */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-act="ostat"][data-st="delivered"]');
    if (!b || !ME || ME.role !== 'warehouse') return;
    e.stopImmediatePropagation();
    e.preventDefault();
    openShip(b.dataset.id);
  }, true);

  let raf = 0;
  new MutationObserver(() => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; refresh(); });
  }).observe(document.body, { childList: true, subtree: true });
  refresh();
})();
