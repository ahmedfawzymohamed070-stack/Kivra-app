/* cosmo-customer-icons.js: أيقونات خطية (SVG) بدل الإيموجي في تبويبات العميل السفلية وفي فلاتر رئيسية الصيدليات.
   عرض بس: مفيش لمس لأي زرار أو منطق أو DB. للرجوع: امسح سطره من index.html. */
(function(){
'use strict';
if(window.__cfCustIcons)return; window.__cfCustIcons=1;
var P={
  shops:'M4 9l1-5h14l1 5M5 9v11h14V9M9 20v-6h6v6',
  sord:'M12 3l8 4v10l-8 4-8-4V7zM12 12l8-5M12 12v9M12 12L4 7',
  acc:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
  all:'M4 9l1-5h14l1 5M5 9v11h14V9M9 20v-6h6v6',
  near:'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  rated:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  top:'M12 3l8 4v10l-8 4-8-4V7zM12 12l8-5M12 12v9M12 12L4 7'
};
function svg(k,s){
  return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+P[k]+'"/></svg>';
}
function pass(){
  [].slice.call(document.querySelectorAll('#nav button[data-t] .ico')).forEach(function(e){
    var t=e.parentNode.getAttribute('data-t');
    if(!P[t]||e.querySelector('svg'))return;
    e.innerHTML=svg(t,24);
    e.style.display='inline-flex';
  });
  [].slice.call(document.querySelectorAll('.sh-tile[data-sh] u')).forEach(function(u){
    var k=u.parentNode.getAttribute('data-sh');
    if(!P[k]||u.querySelector('svg'))return;
    u.innerHTML=svg(k,34);
    u.style.color='#0F6B5B';
  });
}
var raf=0;
function sched(){if(!raf)raf=requestAnimationFrame(function(){raf=0;try{pass();}catch(e){}});}
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
sched();
})();
