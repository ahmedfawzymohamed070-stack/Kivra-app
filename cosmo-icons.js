/* cosmo-icons.js: أيقونات SVG بدل الإيموجي في القائمة الجانبية (الكتالوج، المشرفون، المتجر، الإعدادات) */
(function(){
  'use strict';
  if(window.__cfIcons)return; window.__cfIcons=1;
  var ICO={
    'الكتالوج':'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    'المشرفون':'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM9 12l2 2 4-4',
    'المتجر':'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
    'الإعدادات':'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4'
  };
  function svg(d){
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
  }
  function pass(){
    Array.prototype.forEach.call(document.querySelectorAll('#kv-drawer .kv-dl button'),function(b){
      var e=b.querySelector('.kv-emo'), l=b.querySelector('.kv-lb');
      if(!e||!l)return;
      var d=ICO[(l.textContent||'').trim()];
      if(!d)return;
      e.outerHTML=svg(d);
    });
  }
  var busy=false;
  function tick(){
    if(busy)return; busy=true;
    requestAnimationFrame(function(){busy=false;try{pass();}catch(e){}});
  }
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});
  tick();
})();
