/* stock-guard.js - تعطيل زرار الإضافة لما مفيش كمية (إضافة فقط، لا يغيّر أي ملف شغّال) */
(function () {
  'use strict';
  function fix() {
    var off = null;
    try { if (typeof OFF !== 'undefined' && Array.isArray(OFF)) off = OFF; } catch (e) {}
    if (off) {
      var btns = document.querySelectorAll('button[data-act="spadd"]');
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        if (b.disabled) continue;
        var k = b.getAttribute('data-k');
        var l = off.filter(function (o) { return o.group_key === k; });
        if (l.length && !l.some(function (o) { return Number(o.stock) > 0; })) {
          b.disabled = true;
          b.textContent = 'نفدت الكمية';
          b.style.cssText = 'background:#d9dfdf;color:#6b7f7f;cursor:not-allowed';
        }
      }
    }
    var sp = document.querySelectorAll('#ci .muted');
    for (var j = 0; j < sp.length; j++) {
      if (/متوفر\s*0\s*$/.test(sp[j].textContent)) sp[j].textContent = '· نفدت الكمية';
    }
  }
  try { new MutationObserver(fix).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  fix();
})();
