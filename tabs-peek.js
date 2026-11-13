/* tabs-peek.js — للفحص بس: لما تفتح الموقع بـ ?peek=1 بيعرض تبويبات التطبيق على الشاشة. من غير ?peek=1 مبيعملش أي حاجة. */
(function () {
  if (location.search.indexOf('peek=1') < 0) return;
  window.addEventListener('load', function () {
    setTimeout(function () {
      var out = {};
      try { out.TABS = JSON.parse(JSON.stringify(TABS, function (k, v) { return typeof v === 'function' ? 'fn' : v; })); } catch (e) { out.TABS = 'err ' + e.message; }
      try { out.role = ME && ME.role; } catch (e) {}
      try { out.V = {}; Object.keys(V).forEach(function (r) { out.V[r] = Object.keys(V[r] || {}); }); } catch (e) { out.V = 'err'; }
      try { out.TAB = TAB; } catch (e) {}
      var d = document.createElement('pre');
      d.style.cssText = 'position:fixed;top:60px;left:6px;right:6px;bottom:80px;z-index:99;background:#fff;color:#000;border:2px solid #1F6F6B;border-radius:10px;padding:8px;font-size:10px;direction:ltr;overflow:auto;white-space:pre-wrap';
      d.textContent = JSON.stringify(out, null, 1) + '\n\n(دوس للإخفاء)';
      d.onclick = function () { d.remove(); };
      document.body.appendChild(d);
    }, 900);
  });
})();
