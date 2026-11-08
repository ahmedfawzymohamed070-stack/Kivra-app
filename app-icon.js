/* Kivra: أيقونة التطبيق الجديدة (K بلون التيل) + ملف التثبيت الجديد */
(function(){
  function link(rel){
    var l=document.querySelector('link[rel="'+rel+'"]');
    if(!l){ l=document.createElement('link'); l.setAttribute('rel',rel); document.head.appendChild(l); }
    return l;
  }
  link('manifest').setAttribute('href','/kivra.webmanifest');
  link('apple-touch-icon').setAttribute('href','/kivra-icon-192.png');
  var ic=link('icon'); ic.setAttribute('href','/kivra-icon-192.png'); ic.setAttribute('type','image/png');
  var m=document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content','#1F6F6B');
})();
