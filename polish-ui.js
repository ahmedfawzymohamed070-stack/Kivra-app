/* polish-ui.js — تنسيق صفحة المنتجات عند الصيدلية (CSS فقط، بدون أي منطق).
   بيتحمّل في آخر index.html بعد compact-ui.js. لو مش عاجبك امسحه والشكل يرجع زي ما كان. */
(function () {
  const css = `
/* البحث */
#q{background:#fff!important;border:1px solid var(--bd)!important;border-radius:12px!important;padding:10px 12px!important;margin:2px 0 0!important}

/* الأقسام: سطر واحد بدون شريط تمرير ظاهر */
.chips{scrollbar-width:none;-ms-overflow-style:none;padding:8px 0 6px!important;margin:0!important}
.chips::-webkit-scrollbar{display:none}
.chips .chip{border-radius:99px!important;padding:5px 13px!important;font-size:12.5px!important;border:1px solid var(--bd)!important;background:#fff!important;color:var(--p)!important}
.chips .chip.on{background:linear-gradient(135deg,var(--p),var(--p2))!important;color:#fff!important;border-color:transparent!important}

/* كارت المنتج */
.pc{gap:10px!important;padding:10px!important;margin-bottom:8px!important;border-radius:14px!important;box-shadow:0 1px 6px rgba(166,61,158,.08)!important;align-items:flex-start}
.pc .pi{width:78px!important;height:78px!important;border-radius:12px!important;border:1px solid var(--bd);background:#fff!important}
.pc .ph{font-size:30px!important}
.pc .pn{font-size:14.5px!important;line-height:1.35!important}
.pc .pb>.muted{margin-top:1px}
.pc .price{font-size:16px!important;font-weight:700;color:var(--p)!important}

/* صف الأزرار: الموزعين ياخد المساحة، المفضلة مربعة صغيرة، إضافة واضحة */
.pc .row{display:flex!important;gap:6px!important;margin-top:8px!important;align-items:center}
.pc .row button{padding:7px 10px!important;font-size:13px!important;border-radius:10px!important}
.pc .row button[data-act="sptog"]{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pc .row button[data-act="spfav"]{width:36px;padding:7px 0!important;flex:none}
.pc .row button[data-act="spadd"]{min-width:70px;flex:none}

/* عروض الموزعين لما تتفتح */
.pc .offer{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#faf3f9;border:1px solid #f0dcec;border-radius:10px;padding:8px 10px!important;margin-top:6px!important}
.pc .offer .row{margin-top:4px!important}
.pc .offer input{width:56px!important;padding:6px!important}
`;
  const st = document.createElement('style');
  st.id = 'polish-ui';
  st.textContent = css;
  document.head.appendChild(st);
})();
