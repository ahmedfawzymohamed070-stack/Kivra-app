/* store-dev.js — بيحمّل ملفات المتجر في وضع المعاينة بس (?preview=on).
   لو المعاينة مش شغالة: ما بيحمّلش حاجة، فالصيدليات ما بتشوفش المتجر. */
(function () {
  var on = false;
  try { on = localStorage.getItem('kivra_preview') === '1'; } catch (e) {}
  if (!on) return;

  var FILES = ['kivra-store.js', 'kivra-customer.js', 'signup-labels.js',
               'store-pharmacy.js', 'store-front.js',
               'store-home.js', 'store-cart.js', 'store-profile.js'];
  var errs = [];

  function report() {
    if (!errs.length) return;
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
    errs.push((f || 'page') + ':' + (ev.lineno || '?') + ' ' + (ev.message || ''));
    report();
  });

  function next(i) {
    if (i >= FILES.length) return;
    var s = document.createElement('script');
    s.src = '/' + FILES[i] + '?v=3';
    s.onload = function () { next(i + 1); };
    s.onerror = function () { errs.push('ما اتحمّلش: ' + FILES[i]); report(); next(i + 1); };
    document.body.appendChild(s);
  }
  next(0);
})();
