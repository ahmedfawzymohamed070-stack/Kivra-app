/* order-search.js — رقم طلب واضح (سيريال) لكل طلب + شريط بحث في صفحات الطلبات (صيدلية ومخزن وأدمن).
   كله على الشاشة بس، ما بيلمسش قاعدة البيانات ولا منطق الطلبات. لو حصل أي خطأ الصفحات بتفضل زي ما هي. */
(function () {
  const css = `
.os{margin:6px 0 8px}
.os input{width:100%;padding:10px 12px!important;border:1px solid var(--bd,#dfe8e7)!important;border-radius:12px!important;background:#fff!important;font-size:15px}
.os-n{font-size:12px;color:var(--mu,#7d8a88);margin:4px 2px 0;min-height:14px}
.ordsn{display:inline-block;background:var(--soft,#f1f7f6);color:var(--p,#1F6F6B);border-radius:6px;padding:1px 7px;font-size:11.5px;font-weight:600;letter-spacing:.4px;margin-inline-start:4px}
.oc .oh b:first-child{font-size:16px;color:var(--p,#1F6F6B)}
`;
  const st = document.createElement('style');
  st.id = 'order-search';
  st.textContent = css;
  document.head.appendChild(st);

  let Q = '';
  const AR = '٠١٢٣٤٥٦٧٨٩', FA = '۰۱۲۳۴۵۶۷۸۹';
  const norm = s => String(s || '')
    .replace(/[٠-٩]/g, d => AR.indexOf(d))
    .replace(/[۰-۹]/g, d => FA.indexOf(d))
    .trim().toLowerCase().replace(/^#/, '');
  const numOf = c => {
    const b = c.querySelector('b');
    const m = b && /^طلب #(\d+)/.exec(b.textContent.trim());
    return m ? m[1] : null;
  };
  const cards = () => [...document.querySelectorAll('.oc,.item')].filter(c => numOf(c) !== null);

  function apply() {
    const q = norm(Q);
    const all = cards();
    let match = all.map(() => true);
    if (q) {
      if (/^\d+$/.test(q)) {
        const strip = x => x.replace(/^0+/, '') || '0';
        const exact = all.map(c => strip(numOf(c)) === strip(q));
        match = exact.some(Boolean) ? exact : all.map(c => numOf(c).includes(q));
      } else {
        match = all.map(c => c.textContent.toLowerCase().includes(q));
      }
    }
    let shown = 0;
    all.forEach((c, i) => { c.style.display = match[i] ? '' : 'none'; if (match[i]) shown++; });
    const info = document.getElementById('os-n');
    if (info) info.textContent = q ? (shown ? shown + ' نتيجة' : 'مفيش طلب بالرقم أو الاسم ده') : '';
  }

  function ensureBox() {
    if (document.getElementById('os-box')) return;
    const list = cards();
    if (!list.length) return;
    const first = list[0], par = first.parentNode;
    const box = document.createElement('div');
    box.id = 'os-box';
    box.className = 'os';
    box.innerHTML = '<input id="os-q" type="search" inputmode="search" autocomplete="off" placeholder="🔎 ابحث برقم الطلب أو الاسم"><div id="os-n" class="os-n"></div>';
    if (par.id === 'wol') par.parentNode.insertBefore(box, par);
    else par.insertBefore(box, first);
    Q = '';
    const inp = box.querySelector('input');
    inp.addEventListener('input', () => { Q = inp.value; apply(); });
  }

  function serials() {
    cards().forEach(c => {
      if (c.dataset.sn) return;
      c.dataset.sn = '1';
      const b = c.querySelector('b');
      const s = document.createElement('span');
      s.className = 'ordsn';
      s.textContent = 'رقم الطلب ' + String(numOf(c)).padStart(6, '0');
      b.parentNode.appendChild(s);
    });
  }

  let raf = 0;
  function tick() {
    raf = 0;
    try { ensureBox(); serials(); apply(); } catch (e) { /* تجاهل */ }
  }
  new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(tick); }).observe(document.body, { childList: true, subtree: true });
  tick();
})();
