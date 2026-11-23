/* CosmoFast: ملف التثبيت + أيقونة التطبيق (C على أخضر) */
(function(){
  function link(rel){
    var l=document.querySelector('link[rel="'+rel+'"]');
    if(!l){ l=document.createElement('link'); l.setAttribute('rel',rel); document.head.appendChild(l); }
    return l;
  }
  link('manifest').setAttribute('href','/kivra.webmanifest?v=cf');
  link('apple-touch-icon').setAttribute('href','/icon-192.png?v=cf');
  var ic=link('icon'); ic.setAttribute('href','/icon-192.png?v=cf'); ic.setAttribute('type','image/png');
  var m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content','#0A4A40');
})();
