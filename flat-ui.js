/* flat-ui.js — ستايل مسطّح ونضيف للتطبيق كله (أقسام بيضا على خلفية رمادي فاتح، من غير ظلال تقيلة، أزرار بسيطة).
   للإلغاء: امسح سطر <script src="/flat-ui.js"> من index.html بس. */
(function () {
  var css = `
html body{background:#f1f3f3!important;color:#1c2423;font-size:15px;line-height:1.6}
html body header{background:#1F6F6B!important;box-shadow:none!important;border-bottom:0!important}
html body main{padding-left:0!important;padding-right:0!important;padding-top:0!important}
html body main.narrow,html body .narrow{padding:16px!important}

/* الأقسام: بيضا، حدود خفيفة، من غير ظل، تتفصل بشريط رمادي رفيع */
html body .card{background:#fff!important;border:0!important;border-radius:0!important;box-shadow:none!important;margin:8px 0 0!important;padding:16px!important}
html body .card:first-child{margin-top:0!important}
html body .narrow.card{border-radius:12px!important;margin:24px auto 0!important}
html body h2{color:#1c2423!important;font-size:17px!important;font-weight:700!important;margin:0 0 10px!important}
html body .muted{color:#7a8785!important}

/* صفوف وفواصل */
html body .item,html body .wh,html body .offer,html body .sx-ci,html body .pp-c,html body .pp-w{border-color:#ececec!important}

/* أزرار بسيطة */
html body button{background:#1F6F6B!important;color:#fff!important;border:0!important;border-radius:8px!important;box-shadow:none!important;font-weight:600}
html body button.ghost,html body .sx-up,html body .so-ch button{background:#fff!important;color:#1F6F6B!important;border:1px solid #cfdad8!important}
html body .so-ch button.on,html body .sx-seg button.on,html body .sh-tile.on{background:#1F6F6B!important;color:#fff!important}
html body button.red{background:#c0392b!important;color:#fff!important;border:0!important}
html body header button{background:rgba(255,255,255,.18)!important;color:#fff!important;border:0!important}
html body button:active{opacity:.85}

/* خانات الإدخال */
html body input,html body select,html body textarea{background:#fff!important;border:1px solid #d5dedc!important;border-radius:8px!important;box-shadow:none!important}
html body input:focus,html body select:focus,html body textarea:focus{outline:2px solid #1F6F6B!important;border-color:#1F6F6B!important}

/* الشارات */
html body .badge{border-radius:6px!important}

/* الشريط السفلي */
html body nav{background:#fff!important;border-top:1px solid #e5e8e8!important;box-shadow:none!important}

/* كروت العميل والمتجر */
html body .sh-card,html body .u5c,html body .u5h,html body .sx-hd,html body .sf-c,html body .pc{border:1px solid #e8ecec!important;border-radius:10px!important;box-shadow:none!important}
html body .sh-hero{background:#1F6F6B!important;border-radius:0!important}
html body .sh-tile u,html body .sf-cat u{box-shadow:none!important}
html body .sf-ctl{border:0!important;border-radius:0!important;background:transparent!important;padding:0!important}
html body #sx-bar{border-radius:10px!important;box-shadow:0 2px 8px rgba(0,0,0,.18)!important}
html body #sx-sheet .sx-p{border-radius:14px 14px 0 0!important}
html body .loc,html body .so-bx,html body .pp-box{border-radius:8px!important}
`;
  var st = document.createElement('style');
  st.id = 'flat-ui';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
