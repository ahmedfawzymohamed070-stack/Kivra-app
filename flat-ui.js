(function () {
  var css = `
html body{background:#f1f3f3!important;color:#1c2423}
html body header{box-shadow:none!important}
html body .card{box-shadow:none!important;border:0!important;border-radius:12px!important;margin:8px 12px!important}
html body input,html body select,html body textarea{box-shadow:none!important;border:1px solid #d5dedc!important;border-radius:10px!important}
html body nav,html body nav button{background:#fff!important;color:#1F6F6B!important;box-shadow:none!important;border:0!important}
html body nav{border-top:1px solid #e5e8e8!important}
html body .sh-card,html body .u5c,html body .sf-c,html body .pc{box-shadow:none!important;border:1px solid #e8ecec!important;border-radius:12px!important}

html body .sh-hero{border-radius:16px!important;padding:14px!important}
html body .sh-h{font-size:18px!important;margin:14px 0 8px!important}
html body .sh-tiles{gap:8px!important;padding:2px 0 10px!important}
html body .sh-tile{flex:0 0 auto!important;width:auto!important;display:flex!important;align-items:center!important;gap:6px!important;padding:9px 16px!important;border-radius:99px!important;background:#fff!important;border:1px solid #d5dedc!important;font-size:14px!important;font-weight:600!important;color:#1c2423!important;white-space:nowrap!important;box-shadow:none!important}
html body .sh-tile u{display:inline!important;width:auto!important;height:auto!important;margin:0!important;background:none!important;border:0!important;font-size:16px!important;text-decoration:none!important}
html body .sh-tile.on{background:#1F6F6B!important;color:#fff!important;border-color:#1F6F6B!important}
html body .sh-cv img{object-fit:cover!important}
`;
  var st = document.createElement('style');
  st.id = 'flat-ui';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* عشان البانر يظهر مع صفحة الفلاتر الجديدة */
  function mark() {
    var has = document.getElementById('sh-l');
    var c = document.getElementById('cl');
    if (has && !c) {
      var d = document.createElement('i');
      d.id = 'cl';
      d.hidden = true;
      d.setAttribute('data-mark', '1');
      document.body.appendChild(d);
    } else if (!has && c && c.getAttribute('data-mark')) {
      c.remove();
    }
  }
  new MutationObserver(mark).observe(document.documentElement, { childList: true, subtree: true });
  mark();
})();
