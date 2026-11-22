/* store-dev10.js — بيحمّل ملفات المتجر لكل الزوار والعملاء + نسيت كلمة المرور */
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

  /* ===== نسيت كلمة المرور ===== */
  var RECOV = false;
  try { RECOV = /type=recovery/.test(location.hash) || /type=recovery/.test(location.search); } catch (e) {}

  function say(m) { try { toast(m); } catch (e) { alert(m); } }

  function addLink() {
    if (document.getElementById('fg-link')) return;
    var pw = document.querySelectorAll('input[type="password"]');
    if (pw.length !== 1) return;
    var others = document.querySelectorAll('input:not([type="password"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),select,textarea');
    if (others.length > 3) return;
    var host = pw[0].closest('label') || pw[0];
    host.insertAdjacentHTML('afterend', '<p style="margin:6px 0"><a href="#" id="fg-link" style="color:#1F6F6B;font-weight:700">نسيت كلمة المرور؟</a></p>');
  }

  function sendLink() {
    var em = '', ins = document.querySelectorAll('input');
    for (var k = 0; k < ins.length; k++) { var v = (ins[k].value || '').trim(); if (v.indexOf('@') > 0 && ins[k].type !== 'password') { em = v; break; } }
    if (!em) em = (window.prompt('اكتب الإيميل اللي سجّلت بيه') || '').trim();
    if (!em) return;
    sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + '/' }).then(function (r) {
      say(r && r.error ? ('مقدرناش نبعت اللينك: ' + r.error.message) : 'لو الإيميل مسجّل عندنا هيوصلك لينك تغيير كلمة المرور (شوف الـ Spam كمان)');
    }).catch(function () { say('حصلت مشكلة، جرّب تاني'); });
  }

  function showReset() {
    if (document.getElementById('fg-box')) return;
    var d = document.createElement('div');
    d.id = 'fg-box';
    d.style.cssText = 'position:fixed;inset:0;z-index:2000;background:#f4f8f7;display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl';
    d.innerHTML = '<div style="background:#fff;border-radius:18px;padding:20px;width:100%;max-width:420px;box-shadow:0 6px 24px rgba(0,0,0,.12)">' +
      '<h2 style="margin:0 0 10px;color:#1c2423">كلمة مرور جديدة</h2>' +
      '<input id="fg-p1" type="password" placeholder="كلمة المرور الجديدة (8 حروف على الأقل)" style="width:100%;box-sizing:border-box;padding:12px;margin:6px 0;border:1px solid #dfe8e7;border-radius:12px;font-size:15px">' +
      '<input id="fg-p2" type="password" placeholder="اكتبها تاني" style="width:100%;box-sizing:border-box;padding:12px;margin:6px 0;border:1px solid #dfe8e7;border-radius:12px;font-size:15px">' +
      '<div id="fg-er" style="color:#9b2a1d;font-size:13px;min-height:18px"></div>' +
      '<button id="fg-go" type="button" style="width:100%;margin-top:6px;background:#1F6F6B;color:#fff;border:0;border-radius:12px;padding:13px;font-weight:700;font-size:16px">حفظ وتسجيل الدخول</button></div>';
    document.body.appendChild(d);
    document.getElementById('fg-go').onclick = function () {
      var p1 = document.getElementById('fg-p1').value, p2 = document.getElementById('fg-p2').value, er = document.getElementById('fg-er');
      if (p1.length < 8) { er.textContent = 'كلمة المرور لازم تكون 8 حروف على الأقل'; return; }
      if (p1 !== p2) { er.textContent = 'كلمتين المرور مش متطابقين'; return; }
      er.textContent = 'جاري الحفظ...';
      sb.auth.updateUser({ password: p1 }).then(function (r) {
        if (r && r.error) { er.textContent = 'مقدرناش نحفظ: ' + r.error.message; return; }
        say('تم تغيير كلمة المرور');
        setTimeout(function () { location.replace(location.pathname); }, 600);
      }).catch(function () { er.textContent = 'حصلت مشكلة، جرّب تاني'; });
    };
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('#fg-link');
    if (a) { e.preventDefault(); sendLink(); }
  });

  try {
    if (typeof sb !== 'undefined' && sb.auth) {
      sb.auth.onAuthStateChange(function (ev) { if (ev === 'PASSWORD_RECOVERY') { RECOV = true; showReset(); } });
    }
  } catch (e) {}

  function boot2() { try { if (RECOV) showReset(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot2, 400); });
  else setTimeout(boot2, 400);

  try {
    new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(function () { hideBadge(); addLink(); }, 120); })
      .observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
