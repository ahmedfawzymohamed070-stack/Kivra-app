/* returns-ui.js — واجهة المرتجعات.
   الصيدلية: زرار "طلب مرتجع" على الطلبات المستلمة (خلال 7 أيام) + قائمة "مرتجعاتي" تحت الطلبات.
   المخزن: تبويب جديد "المرتجعات" (قبول مع/بدون إرجاع للمخزون، أو رفض).
   بيعتمد على دوال قاعدة البيانات (my_returns و returnable_items و request_return و decide_return)
   وعلى polish-pages.js (لازم يتحمّل قبله). بيتحمّل في آخر index.html. */
(function () {
  const css = `
.rt-ov{position:fixed;inset:0;background:rgba(42,24,48,.5);z-index:30;display:flex;align-items:flex-end;justify-content:center}
.rt-sh{background:#f6f1f6;width:100%;max-width:760px;max-height:90vh;overflow:auto;border-radius:16px 16px 0 0;padding:12px 12px calc(16px + env(safe-area-inset-bottom))}
.rt-it{display:flex;gap:8px;align-items:center;background:#fff;border:1px solid var(--bd);border-radius:10px;padding:8px 10px;margin:0 0 6px!important}
.rt-it input[type=radio]{width:20px!important;height:20px;margin:0!important;padding:0!important;display:inline-block!important;flex:none}
.rt-it .oname{font-size:13.5px;font-weight:600}
textarea.rt-ta{width:100%;display:block;margin-top:4px;padding:8px 10px;border:1px solid #e6cfe1;border-radius:8px;font-size:16px;font-family:inherit;background:#fff;color:inherit;min-height:64px;resize:vertical}
.rt-err{background:#fde2de;color:#9b2a1d;border-radius:10px;padding:8px 10px;font-size:13px;margin:8px 0}
.rt-send{width:100%;margin-top:8px}
`;
  const st = document.createElement('style');
  st.id = 'returns-ui';
  st.textContent = css;
  document.head.appendChild(st);

  const RS = { expired: 'منتهي الصلاحية', damaged: 'تالف أو مكسور', wrong_item: 'منتج غير المطلوب', other: 'أخرى' };
  const RET = {};
  const DAY = 864e5;

  const badge = r => {
    const cls = r.status === 'accepted' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending';
    const t = r.status === 'accepted' ? 'مقبول' : r.status === 'rejected' ? (r.auto_closed ? 'مرفوض تلقائياً' : 'مرفوض') : 'قيد المراجعة';
    return '<span class="badge ' + cls + '">' + t + '</span>';
  };
  const creditOf = r => Math.round((Number(r.unit_price) - Number(r.unit_net)) * Number(r.qty) * 100) / 100;

  /* كارت مرتجع (للدورين) */
  function rtCard(r, role) {
    RET[r.id] = r;
    const cls = r.status === 'accepted' ? 'ok' : r.status === 'rejected' ? 'bad' : '';
    const name = role === 'pharmacy' ? r.warehouse_name : r.pharmacy_name;
    const phoneRaw = role === 'pharmacy' ? r.warehouse_phone : r.pharmacy_phone;
    const phone = String(phoneRaw || '').replace(/[^\d+]/g, '');
    const who = (role === 'pharmacy' ? '🏬 ' : '🏥 ') + '<b>' + esc(name) + '</b>' + (phone ? ' · <a href="tel:' + esc(phone) + '">' + esc(phoneRaw) + '</a>' : '');
    let note;
    if (r.status === 'pending') {
      note = role === 'pharmacy'
        ? 'بانتظار رد المخزن. يتقفل تلقائياً (مرفوض) لو ما ردّش قبل ' + fd(r.deadline) + '.'
        : 'خد قرارك قبل ' + fd(r.deadline) + '، وبعدها يتقفل تلقائياً مرفوض.';
    } else if (r.status === 'accepted') {
      note = role === 'warehouse'
        ? 'اتخصم من عمولتك ' + money(r.commission_credit) + (r.restock ? ' · رجعت الكمية للمخزون' : ' · الكمية ما رجعتش للمخزون')
        : 'المخزن قبل المرتجع.';
    } else {
      note = r.auto_closed ? 'اتقفل تلقائياً لأن المخزن ما ردّش خلال 7 أيام.' : 'المخزن رفض المرتجع (القرار نهائي).';
    }
    let act = '';
    if (role === 'warehouse' && r.status === 'pending') {
      const id = esc(r.id);
      act = '<button data-act="rtdec" data-m="restock" data-id="' + id + '">✅ قبول وإرجاع للمخزون</button>' +
            '<button class="ghost" data-act="rtdec" data-m="norestock" data-id="' + id + '">✅ قبول بدون إرجاع للمخزون</button>' +
            '<button class="red" data-act="rtdec" data-m="reject" data-id="' + id + '">رفض</button>';
    }
    return '<div class="oc ' + cls + '">' +
      '<div class="oh"><div><b>مرتجع #' + esc(r.return_no) + '</b> ' + badge(r) + '</div><span class="od">' + fd(r.created_at) + '</span></div>' +
      '<div class="ow">' + who + '</div>' +
      '<div class="oln"><div><div class="oname">' + esc(r.product_name) + '</div><div class="muted">' + esc(r.qty) + ' × ' + money(r.unit_price) + '</div></div>' +
      '<b>' + money(Number(r.qty) * Number(r.unit_price)) + '</b></div>' +
      '<div class="onote">السبب: ' + esc(RS[r.reason] || r.reason) + (r.note ? ' · ' + esc(r.note) : '') + '</div>' +
      '<div class="onote">' + note + '</div>' +
      (act ? '<div class="row">' + act + '</div>' : '') + '</div>';
  }

  /* نافذة من تحت */
  function closeSheet() { const o = document.getElementById('rt-ov'); if (o) o.remove(); }
  function openSheet(title, html) {
    closeSheet();
    const o = document.createElement('div');
    o.id = 'rt-ov';
    o.className = 'rt-ov';
    o.innerHTML = '<div class="rt-sh"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b style="font-size:15px;color:var(--p)">' + esc(title) +
      '</b><button class="ghost" data-rtclose>إغلاق</button></div><div id="rt-body">' + html + '</div></div>';
    o.addEventListener('click', ev => { if (ev.target === o || ev.target.closest('[data-rtclose]')) closeSheet(); });
    document.body.appendChild(o);
  }

  Object.assign(A, {
    /* الصيدلية: فتح نافذة طلب مرتجع لطلب معيّن */
    rtopen: async el => {
      openSheet('طلب مرتجع', '<p class="muted">جاري التحميل...</p>');
      let items;
      try { items = ok(await sb.rpc('returnable_items', { p_order: el.dataset.id })) || []; }
      catch (e) { closeSheet(); throw e; }
      const body = document.getElementById('rt-body');
      if (!body) return;
      const can = items.filter(i => i.can_return);
      if (!can.length) {
        body.innerHTML = '<p class="muted">لا توجد منتجات متاحة للإرجاع من هذا الطلب (المهلة 7 أيام من الاستلام، أو تم طلب إرجاع الكمية بالكامل).</p>';
        return;
      }
      body.innerHTML =
        '<div class="muted" style="margin-bottom:6px">المهلة تنتهي ' + fd(can[0].deadline) + '</div>' +
        items.map((i, k) => i.can_return
          ? '<label class="rt-it"><input type="radio" name="rti" value="' + esc(i.item_id) + '" data-max="' + esc(i.remaining) + '"' + (i === can[0] ? ' checked' : '') + '>' +
            '<div style="flex:1"><div class="oname">' + esc(i.product_name) + '</div><div class="muted">المتاح للإرجاع: ' + esc(i.remaining) + ' من ' + esc(i.qty) + ' · ' + money(i.unit_price) + '</div></div></label>'
          : '<div class="rt-it" style="opacity:.55"><div style="flex:1"><div class="oname">' + esc(i.product_name) + '</div><div class="muted">تم طلب إرجاع الكمية بالكامل</div></div></div>').join('') +
        '<label>الكمية<input id="rt-q" type="number" min="1" step="1" value="1"></label>' +
        '<label>السبب<select id="rt-r">' + Object.keys(RS).map(k => '<option value="' + k + '">' + RS[k] + '</option>').join('') + '</select></label>' +
        '<label>ملاحظة (اختياري)<textarea id="rt-n" class="rt-ta" maxlength="300"></textarea></label>' +
        '<p id="rt-err" class="rt-err" hidden></p>' +
        '<button class="rt-send" data-act="rtsend">إرسال طلب المرتجع</button>' +
        '<p class="muted" style="margin-top:8px">المخزن يرد خلال 7 أيام. لو قبل، بيتخصم من عمولته وتتحاسبوا على المبلغ بينكم مباشرة.</p>';
      const q = document.getElementById('rt-q');
      const sync = () => {
        const r = body.querySelector('input[name=rti]:checked');
        if (!r || !q) return;
        const mx = Number(r.dataset.max);
        q.max = mx;
        if (Number(q.value) > mx) q.value = mx;
      };
      body.addEventListener('change', e => { if (e.target && e.target.name === 'rti') sync(); });
      sync();
    },

    /* الصيدلية: إرسال الطلب */
    rtsend: async el => {
      const err = document.getElementById('rt-err');
      const say = t => { if (err) { err.textContent = t; err.hidden = !t; } };
      say('');
      const r = document.querySelector('#rt-body input[name=rti]:checked');
      if (!r) { say('اختار المنتج'); return; }
      const mx = Number(r.dataset.max);
      const qty = parseInt(document.getElementById('rt-q').value, 10);
      if (!(qty >= 1) || qty > mx) { say('الكمية لازم تكون بين 1 و ' + mx); return; }
      el.disabled = true;
      try {
        ok(await sb.rpc('request_return', {
          p_item: r.value, p_qty: qty,
          p_reason: document.getElementById('rt-r').value,
          p_note: (document.getElementById('rt-n').value || '').trim() || null
        }));
      } catch (e) {
        el.disabled = false;
        say(e.message || 'حصل خطأ، حاول تاني');
        return;
      }
      closeSheet();
      toast('تم إرسال طلب المرتجع للمخزن');
      await show('ord');
    },

    /* المخزن: قبول (مع/بدون إرجاع للمخزون) أو رفض */
    rtdec: async el => {
      const id = el.dataset.id, m = el.dataset.m, r = RET[id];
      if (!r) throw new Error('حدّث الصفحة وحاول تاني');
      const msg = m === 'reject'
        ? 'رفض المرتجع قرار نهائي ولا يمكن التراجع عنه. تأكيد الرفض؟'
        : 'قبول المرتجع هيخصم ' + money(creditOf(r)) + ' من العمولة المستحقة عليك' +
          (m === 'restock' ? '، وهترجع الكمية (' + r.qty + ') للمخزون.' : '، ولن ترجع الكمية للمخزون.') + ' تأكيد القبول؟';
      if (!confirm(msg)) return;
      el.disabled = true;
      try {
        ok(await sb.rpc('decide_return', { p_id: id, p_accept: m !== 'reject', p_restock: m === 'restock' }));
      } catch (e) { el.disabled = false; throw e; }
      toast(m === 'reject' ? 'تم رفض المرتجع' : 'تم قبول المرتجع وخصم العمولة');
      await show('ret');
    }
  });

  /* ---------- الصيدلية: زرار على كروت الطلبات + قائمة مرتجعاتي ---------- */
  function decorate(m) {
    const cards = m.querySelectorAll('.oc');
    const l = Array.isArray(ORD) ? ORD : [];
    if (!cards.length || cards.length !== l.length) return;
    cards.forEach((c, i) => {
      const o = l[i];
      if (o.status !== 'received' || !o.received_at) return;
      if (Date.now() - new Date(o.received_at).getTime() > 7 * DAY) return;
      let row = c.querySelector('.row');
      if (!row) { row = document.createElement('div'); row.className = 'row'; c.appendChild(row); }
      row.insertAdjacentHTML('beforeend', '<button class="ghost" data-act="rtopen" data-id="' + esc(o.id) + '">↩️ طلب مرتجع</button>');
    });
  }
  const origOrd = V.pharmacy && V.pharmacy.ord;
  if (origOrd) {
    V.pharmacy.ord = async function (m) {
      await origOrd(m);
      try {
        decorate(m);
        const rows = ok(await sb.rpc('my_returns')) || [];
        if (rows.length) {
          m.insertAdjacentHTML('beforeend', '<div class="pgt" style="margin-top:14px">مرتجعاتي <span>(' + rows.length + ')</span></div>' +
            rows.map(r => rtCard(r, 'pharmacy')).join(''));
        }
      } catch (e) { /* لو حصل أي خطأ، صفحة الطلبات تفضل زي ما هي */ }
    };
  }

  /* ---------- المخزن: تبويب المرتجعات ---------- */
  if (TABS.warehouse && !TABS.warehouse.some(t => t[0] === 'ret')) {
    TABS.warehouse.splice(TABS.warehouse.length - 1, 0, ['ret', '↩️', 'المرتجعات']);
    try { if (ME && ME.role === 'warehouse') paintNav(); } catch (e) { /* هيتحدّث مع أول ضغطة تبويب */ }
  }
  if (V.warehouse) {
    V.warehouse.ret = async function (m) {
      const rows = ok(await sb.rpc('my_returns')) || [];
      const pend = rows.filter(r => r.status === 'pending');
      const done = rows.filter(r => r.status !== 'pending');
      m.innerHTML =
        '<div class="pgt">مرتجعات بانتظار ردك <span>(' + pend.length + ')</span></div>' +
        (pend.length ? pend.map(r => rtCard(r, 'warehouse')).join('') : '<div class="card"><p class="muted">لا توجد طلبات مرتجع بانتظارك.</p></div>') +
        (done.length ? '<div class="pgt" style="margin-top:14px">السجل <span>(' + done.length + ')</span></div>' + done.map(r => rtCard(r, 'warehouse')).join('') : '');
    };
  }
})();
