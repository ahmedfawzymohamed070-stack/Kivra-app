(function () {
  var css = `
html body{background:#f1f3f3!important;color:#1c2423}
html body header{box-shadow:none!important}
html body .card{box-shadow:none!important;border:0!important;border-radius:12px!important;margin:8px 12px!important}
html body input,html body select,html body textarea{box-shadow:none!important;border:1px solid #d5dedc!important;border-radius:10px!important}
html body nav,html body nav button{background:#fff!important;color:#1F6F6B!important;box-shadow:none!important;border:0!important}
html body nav{border-top:1px solid #e5e8e8!important}
html body .sh-card,html body .u5c,html body .sf-c,html body .pc{box-shadow:none!important;border:1px solid #e8ecec!important;border-radius:12px!important}
`;
  var st = document.createElement('style');
  st.id = 'flat-ui';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
