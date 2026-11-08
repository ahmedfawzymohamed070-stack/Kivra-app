/* polish-mine.js — شكل تبويب "منتجاتي" عند المخزن.
   - أداتي "إضافة منتج" و"رفع Excel" بتتقفل وتتفتح بالضغط على العنوان.
   - قائمة المنتجات من غير إطار مزدوج، وسطر السعر بيتحول لشرائح.
   بيتحمّل في آخر index.html بعد polish-warehouse.js. لو حصل أي خطأ الصفحة القديمة تفضل زي ما هي. */
(function () {
  const css = `
.tool>h2{display:flex!important;justify-content:space-between;align-items:center;margin:0!important;cursor:pointer}
.tool>h2::after{content:'‹';font-size:20px;line-height:1;color:#b79bb4;transition:transform .2s;transform:rotate(-90deg)}
.tool.open>h2{margin-bottom:8px!important}
.tool.open>h2::after{transform:rotate(90deg)}
.tool:not(.open)>:not(h2){display:none!important}

.card.mine-card{background:none!important;border:0!important;padding:0 2px!important;box-shadow:none!important}
#mine .pc .muted{font-size:12px}
#mine .pc .row button[data-act="pedit"]{flex:1}
#mine .pc .row button[data-act="delp"]{flex:none;padding:7px 14px!important}
.mp{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
.mp span{background:#faf3f9;border:1px solid #f0dcec;border-radius:99px;padding:1px 8px;font-size:12px;color:#5a4562;white-space:nowrap}
.mp span.net{background:#d8f3e8;border-color:transparent;color:#0a5a41;font-weight:700}
#mine .loc .grid{grid-template-columns:repeat(3,1fr)!important;gap:6px!important}
#mine .loc label{font-size:11.5px!important;margin:0!important}
#mine .loc input{padding:7px 6px!important;font-size:15px!important}
`;
  const st = document.createElement('style');
  st.id = 'polish-mine';
  st.textContent = css;
  document.head.appendChild(st);

  /* فتح وقفل الأدوات (مرة واحدة على مستوى الصفحة كلها) */
  document.addEventListener('click', e => {
    const h = e.target.closest && e.target.closest('.tool > h2');
    if (h) h.parentElement.classList.toggle('open');
  });

  function collapse(m) {
    m.querySelectorAll('.card').forEach(c => {
      if (c.classList.contains('tool') || c.classList.contains('mine-card')) return;
      const h = c.querySelector(':scope > h2');
      if (!h) return;
      const t = h.textContent.trim();
      if (/^إضافة منتج/.test(t) || /Excel|إكسل/i.test(t)) c.classList.add('tool');
      else if (c.querySelector('#mine')) c.classList.add('mine-card');
    });
  }

  /* سطر "سعر عام ... · خصمك ... · صافيك ..." يبقى شرائح */
  function deco(root) {
    root.querySelectorAll('.pb > .muted').forEach(d => {
      if (d.dataset.pd) return;
      const t = d.textContent.trim();
      if (!/^سعر عام/.test(t)) return;
      d.dataset.pd = '1';
      d.classList.add('mp');
      d.innerHTML = t.split(' · ').map((s, i, a) =>
        '<span' + (i === a.length - 1 ? ' class="net"' : '') + '>' + esc(s) + '</span>').join('');
    });
  }

  const orig = V.warehouse && V.warehouse.mine;
  if (!orig) return;
  let MO = null;
  V.warehouse.mine = async function (m) {
    await orig(m);
    try {
      collapse(m);
      if (MO) MO.disconnect();
      MO = new MutationObserver(() => collapse(m));
      MO.observe(m, { childList: true });
      const el = m.querySelector('#mine');
      if (el) {
        const mo = new MutationObserver(() => {
          mo.disconnect();
          try { deco(el); } catch (e) { /* تجاهل */ }
          mo.observe(el, { childList: true, subtree: true });
        });
        mo.observe(el, { childList: true, subtree: true });
        deco(el);
      }
    } catch (e) { /* لو حصل أي خطأ، الصفحة القديمة تفضل زي ما هي */ }
  };
})();
