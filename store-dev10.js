/* store-dev7.js — بيحمّل ملفات المتجر في وضع المعاينة بس (?preview=on)، وبنفس توقيت باقي ملفات التطبيق عشان الريفرش ما يبوّظش */
(function () {
  var on = false;
  try { on = localStorage.getItem('kivra_preview') === '1'; } catch (e) {}
  if (!on) return;

  var FILES = ['kivra-store.js', 'kivra-customer.js', 'signup-labels.js',
               'store-pharmacy.js', 'store-front.js', 'store-home.js',
               'store-cart.js', 'store-profile2.js', 'store-km2.js', 'store-order2.js', 'store-tabs.js'];
  var errs = [];
  window.__kvLoadErr = function (f) { errs.push('ما اتحمّلش: ' + f); report(); };

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
    b.textContent = 'أخطاء المعاينة (دوس للإخفاء):\n' + errs.join('\n');
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
})();
