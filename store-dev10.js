/* store-dev10.js — بيحمّل ملفات المتجر لكل الزوار والعملاء (من غير ما يحتاج علامة المعاينة) */
(function () {
  /* الملفات الجديدة (البانرات وغيرها) بتشتغل بس لو علامة kivra_preview موجودة، فبنفعّلها لكل الناس مرة واحدة */
  try {
    if (localStorage.getItem('kivra_preview') !== '1') {
      localStorage.setItem('kivra_preview', '1');
      if (!sessionStorage.getItem('kv_rl')) { sessionStorage.setItem('kv_rl', '1'); location.reload(); return; }
    }
  } catch (e) {}

  var FILES = ['kivra-store.js', 'kivra-customer.js', 'signup-labels.js',
               'store-pharmacy.js', 'store-front.js', 'store-home.js',
               'store-cart.js', 'store-profile2.js', 'store-km2.js', 'store-order2.js', 'store-tabs.js'];
  var errs = [];
  window.__kvLoadErr = function (f) { errs.push('ما اتحملش: ' + f); report(); };

  function report() {
    if (!errs.length || !document.body) return;
    var b = document.getElementById('kv-errs');
    if (!b) {
      b = document.createElement('div');
      b.id = 'kv-errs';
      b.style.cssText = 'position:fixed;bottom:70px;left:6px;right:6px;z-index:70;background:#fff3f3;color:#a00;border:1px solid #e99;border-radius:10px;padding:6px 8px;font-size:11px;direction:ltr;max-height:30vh;overflow:auto;white-space:pre-wrap';
      b.onclick = function () { b.remove(); };
      document.body.appendChild(b);
    }
    b.textContent = 'أخطاء التحميل (دوس للإخفاء):\n' + errs.join('\n');
  }
  window.addEventListener('error', function (ev) {
    var f = (ev.filename || '').split('/').pop().split('?')[0];
    if (!f) return;
    errs.push(f + ':' + (ev.lineno || '?') + ' ' + (ev.message || ''));
    report();
  });

  // document.write بيحمّل الملفات بالترتيب وقبل ما التطبيق يخلّص تشغيله، زي السطور العادية في index.html
  for (var i = 0; i < FILES.length; i++) {
    document.write('<script src="/' + FILES[i] + '?v=10" onerror="window.__kvLoadErr(\'' + FILES[i] + '\')"><\/script>');
  }

  /* نخفي شارة "وضع المعاينة" عن الناس */
  var tm = null;
  function hideBadge() {
    var l = document.querySelectorAll('span,div,b,small,p');
    for (var k = 0; k < l.length; k++) {
      var e = l[k];
      if (!e.children.length && e.textContent.trim() === 'وضع المعاينة') e.style.display = 'none';
    }
  }
  try {
    new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(hideBadge, 120); })
      .observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
