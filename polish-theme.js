/* polish-theme.js — الهوية الجديدة: ألوان تيل هادي + لوجو K + شاشة بداية + شاشة دخول.
   بيتحمّل آخر ملف في index.html (لازم يكون بعد كل ملفات polish-*). لو مش عاجبك امسحه وسطر script بتاعه والشكل القديم يرجع. */
(function () {
  var P = '#1F6F6B', P2 = '#2A8780', GOLD = '#E3A857';

  function logo(bg, fg, size) {
    return '<svg viewBox="0 0 64 64" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<rect width="64" height="64" rx="16" fill="' + bg + '"/>' +
      '<g stroke="' + fg + '" stroke-width="7" stroke-linecap="round" fill="none">' +
      '<line x1="22" y1="16" x2="22" y2="48"/><line x1="27" y1="33" x2="42" y2="18"/><line x1="27" y1="33" x2="43" y2="49"/></g>' +
      '<circle cx="47" cy="14" r="4.5" fill="' + GOLD + '"/></svg>';
  }

  var css =
    ':root{--p:' + P + ';--p2:' + P2 + ';--bg:#F4F8F7;--bd:#D4E5E2;--tx:#17302E;--mu:#5B7572;--soft:#E3F0EE}' +
    'body{background:var(--bg);color:var(--tx)}' +
    'header{background:linear-gradient(135deg,' + P + ',' + P2 + ')!important;box-shadow:0 2px 10px rgba(31,111,107,.25)!important}' +
    'header span{color:#d6efec!important}' +
    'header b::before,header b::after{display:none!important}' +
    'header b{display:inline-flex;align-items:center;gap:8px}' +
    'header b .kv{display:inline-flex;width:32px;height:32px;background:#fff;border-radius:10px;padding:2px;flex:none}' +
    'label{color:#3d5754}' +
    'input,select{border-color:#cfe0dd}' +
    '.item,.wh{border-top-color:#e4efed}' +
    '.card{box-shadow:0 2px 12px rgba(31,111,107,.08)}' +
    '.oc,.dc{box-shadow:0 1px 6px rgba(31,111,107,.08)}' +
    '.ow,.dm span{color:#3d5754}' +
    '.dm span{background:#f1f7f6;border-color:#d4e5e2}' +
    'nav .cnt{background:' + GOLD + ';color:#17302E}' +
    '#toast{background:#17302E}#pushmsg{background:#17302E}' +
    '.narrow .logo{display:none}' +
    'html,body{background:#F4F8F7!important}' +
    'a{color:var(--p)!important}' +
    '.narrow.card{background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#bfe0db,#fff 45%,#f3dcc0) border-box!important}' +
    'header b{font-family:Cairo,system-ui,sans-serif!important;font-weight:700!important;font-size:20px!important;letter-spacing:.5px!important;text-shadow:none!important}' +
    '.kv-hero{text-align:center;margin:6px 0 16px}' +
    '.kv-hero .nm{font-size:30px;font-weight:700;color:var(--p);letter-spacing:1px;line-height:1.2;margin-top:6px}' +
    '.kv-hero .tg{color:var(--mu);font-size:13.5px;margin-top:2px}' +
    '#kvsplash{position:fixed;inset:0;z-index:99999;background:linear-gradient(160deg,' + P + ',' + P2 + ');display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;transition:opacity .35s ease}' +
    '#kvsplash .nm{font-size:34px;font-weight:700;letter-spacing:1.5px;margin-top:14px}' +
    '#kvsplash .tg{font-size:14px;opacity:.88;margin-top:4px}';

  var st = document.createElement('style');
  st.id = 'polish-theme';
  st.textContent = css;
  document.head.appendChild(st);

  try {
    var mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.setAttribute('content', P);
  } catch (e) {}

  function decorate() {
    document.querySelectorAll('header b').forEach(function (b) {
      if (!b.querySelector('.kv')) b.insertAdjacentHTML('afterbegin', '<span class="kv">' + logo(P, '#fff', 28) + '</span>');
    });
    var card = document.querySelector('main.narrow');
    if (card && !card.querySelector('.kv-hero')) {
      card.insertAdjacentHTML('afterbegin',
        '<div class="kv-hero">' + logo(P, '#fff', 72) + '<div class="nm">' + (typeof APP !== 'undefined' ? APP : 'Kivra') + '</div>' +
        '<div class="tg">كوزمتكس بالجملة، بسهولة</div></div>');
    }
  }
  try { decorate(); } catch (e) {}
  try {
    new MutationObserver(function () { try { decorate(); } catch (e) {} })
      .observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  } catch (e) {}

  try {
    var sp = document.createElement('div');
    sp.id = 'kvsplash';
    sp.innerHTML = logo('#fff', P, 84) + '<div class="nm">' + (typeof APP !== 'undefined' ? APP : 'Kivra') + '</div><div class="tg">كوزمتكس بالجملة، بسهولة</div>';
    document.body.appendChild(sp);
    setTimeout(function () { sp.style.opacity = '0'; sp.style.pointerEvents = 'none'; }, 900);
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 1400);
  } catch (e) {}
})();
