/* reports.js — تقارير المخزن (مبيعات، عمولة، أكثر المنتجات والصيدليات) */
(function () {
  if (typeof V === 'undefined' || !V.warehouse) return;
  const E = typeof esc === 'function' ? esc : s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const M = typeof money === 'function' ? money : n => Number(n || 0).toFixed(2) + ' ج.م';
  const LBL = {pending:'بانتظار المخزن', accepted:'مقبول', delivered:'تم التسليم', received:'تم الاستلام', rejected:'مرفوض', cancelled:'ملغي'};
  const PER = [['m','هذا الشهر'], ['pm','الشهر اللي فات'], ['30','آخر 30 يوم'], ['y','هذه السنة'], ['all','الكل']];
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  let cur = 'm', seq = 0;

  function range(k) {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    if (k === 'm') return [new Date(y, m, 1), n];
    if (k === 'pm') return [new Date(y, m - 1, 1), new Date(y, m, 0)];
    if (k === '30') { const s = new Date(n); s.setDate(s.getDate() - 29); return [s, n]; }
    if (k === 'y') return [new Date(y, 0, 1), n];
    return [new Date(2024, 0, 1), n];
  }

  const st = document.createElement('style');
  st.textContent = `
#rep-ov{position:fixed;inset:0;z-index:40;background:var(--bg,#f6f1f6);overflow:auto;direction:rtl}
.rp-h{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 12px 10px;background:linear-gradient(135deg,var(--p,#0f766e),var(--p2,#14b8a6));color:#fff}
.rp-h b{flex:1;font-size:17px}
.rp-h button{background:rgba(255,255,255,.2);color:#fff;border:0;border-radius:8px;padding:6px 12px;font-size:13px}
.rp-b{max-width:760px;margin:0 auto;padding:10px 10px 40px}
.rp-chips{display:flex;gap:6px;overflow-x:auto;padding:4px 0 10px}
.rp-chip{flex:none;padding:6px 12px;border-radius:99px;border:1px solid #d9c4d5;background:#fff;font-size:12px;color:#5a4562}
.rp-chip.on{background:var(--p,#0f766e);color:#fff;border-color:transparent}
.rp-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.rp-k{background:#fff;border:1px solid #eadfe7;border-radius:10px;padding:10px}
.rp-k small{display:block;color:#7d6a85;font-size:11px}
.rp-k b{font-size:16px;color:var(--p,#0f766e)}
.rp-c{background:#fff;border:1px solid #eadfe7;border-radius:10px;padding:10px 12px;margin-bottom:8px}
.rp-c h3{margin:0 0 6px;font-size:14px;color:var(--p,#0f766e)}
.rp-r{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px solid #f3e9f0;font-size:13px}
.rp-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,var(--p,#0f766e),var(--p2,#14b8a6));margin-top:3px}
.rp-tag{display:inline-block;background:#f1e9f0;color:#5a4562;border-radius:99px;padding:2px 10px;margin:2px;font-size:12px}
.rp-m{color:#7d6a85;font-size:12px}`;
  document.head.appendChild(st);

  const kpi = (t, v) => '<div class="rp-k"><small>' + t + '</small><b>' + v + '</b></div>';

  function render(d) {
    const t = d.totals || {}, orders = Number(t.orders || 0), sales = Number(t.sales || 0);
    const status = d.status || {};
    let h = '<div class="rp-g">' +
      kpi('المبيعات المستلمة', M(sales)) + kpi('صافيك بعد العمولة', M(t.net)) +
      kpi('عمولة المنصة', M(t.commission)) + kpi('طلبات مستلمة', orders) +
      kpi('متوسط الطلب', M(orders ? sales / orders : 0)) + kpi('قطع مباعة', Number(t.qty || 0)) + '</div>';
    h += '<div class="rp-k" style="margin-bottom:8px"><small>طلبات لسه ما اتأكدش استلامها (جديدة أو مقبولة أو مسلّمة)</small><b>' + M(d.pipeline) + '</b></div>';
    h += '<div class="rp-c"><h3>حالات الطلبات في الفترة</h3>' +
      (Object.keys(status).length ? Object.entries(status).map(([s, c]) => '<span class="rp-tag">' + E(LBL[s] || s) + ': ' + c + '</span>').join('') : '<span class="rp-m">لا توجد طلبات.</span>') + '</div>';
    if (!orders) {
      h += '<div class="rp-c"><span class="rp-m">لا توجد مبيعات مستلمة في الفترة دي. المبيعات بتتحسب من الطلبات اللي الصيدلية أكدت استلامها بس.</span></div>';
      return h;
    }
    const daily = d.by_day && d.by_day.length;
    const ser = daily ? d.by_day : (d.by_month || []);
    const mx = Math.max(1, ...ser.map(x => Number(x.sales || 0)));
    h += '<div class="rp-c"><h3>' + (daily ? 'المبيعات اليومية' : 'المبيعات الشهرية') + '</h3>' +
      ser.map(x => '<div style="margin-top:6px"><div class="rp-r" style="border:0;padding:0"><span>' + E(daily ? x.d : x.m) + ' <span class="rp-m">(' + x.orders + ' طلب)</span></span><b>' + M(x.sales) + '</b></div><div class="rp-bar" style="width:' + Math.max(2, Math.round(Number(x.sales || 0) / mx * 100)) + '%"></div></div>').join('') + '</div>';
    h += '<div class="rp-c"><h3>أكثر المنتجات مبيعاً</h3>' +
      (d.top_products || []).map(p => '<div class="rp-r"><span>' + E(p.name) + ' <span class="rp-m">× ' + p.qty + '</span></span><b>' + M(p.value) + '</b></div>').join('') + '</div>';
    h += '<div class="rp-c"><h3>أكثر الصيدليات شراءً</h3>' +
      (d.top_pharmacies || []).map(p => '<div class="rp-r"><span>' + E(p.name) + ' <span class="rp-m">(' + p.orders + ' طلب)</span></span><b>' + M(p.value) + '</b></div>').join('') + '</div>';
    return h;
  }

  async function load() {
    const b = document.getElementById('rp-body');
    if (!b) return;
    const my = ++seq;
    b.innerHTML = '<p class="rp-m">جاري التحميل...</p>';
    try {
      const [a, z] = range(cur);
      const r = await sb.rpc('warehouse_report', { p_from: iso(a), p_to: iso(z) });
      if (my !== seq) return;
      if (r.error) throw r.error;
      b.innerHTML = render(r.data || {});
    } catch (e) {
      if (my === seq) b.innerHTML = '<div class="rp-c">تعذر تحميل التقرير: ' + E(e.message || 'حاول تاني') + '</div>';
    }
  }

  function openReport() {
    const old = document.getElementById('rep-ov');
    if (old) old.remove();
    const o = document.createElement('div');
    o.id = 'rep-ov';
    o.innerHTML = '<div class="rp-h"><button data-rp-close>← رجوع</button><b>📊 التقارير</b></div><div class="rp-b"><div class="rp-chips">' +
      PER.map(([k, l]) => '<button class="rp-chip' + (k === cur ? ' on' : '') + '" data-rp="' + k + '">' + l + '</button>').join('') +
      '</div><div id="rp-body"></div></div>';
    o.addEventListener('click', ev => {
      if (ev.target.closest('[data-rp-close]')) { o.remove(); return; }
      const c = ev.target.closest('[data-rp]');
      if (c) { cur = c.dataset.rp; o.querySelectorAll('.rp-chip').forEach(x => x.classList.toggle('on', x === c)); load(); }
    });
    document.body.appendChild(o);
    load();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-rep]')) { e.preventDefault(); openReport(); }
  });

  const entry = () => '<div class="card" data-rep style="cursor:pointer;background:linear-gradient(135deg,var(--p,#0f766e),var(--p2,#14b8a6));color:#fff;border:0">' +
    '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:26px">📊</span><div style="flex:1"><b style="font-size:15px">التقارير</b>' +
    '<div style="font-size:12px;opacity:.9">مبيعاتك وأكثر المنتجات والصيدليات</div></div><span style="font-size:22px">‹</span></div></div>';

  const key = V.warehouse.ord ? 'ord' : Object.keys(V.warehouse)[0];
  const orig = V.warehouse[key];
  if (typeof orig !== 'function') return;
  V.warehouse[key] = async function (m) {
    await orig(m);
    try { m.insertAdjacentHTML('afterbegin', entry()); } catch (e) { /* الصفحة تفضل شغالة */ }
  };
})();
