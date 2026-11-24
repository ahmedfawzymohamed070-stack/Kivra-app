/* cosmo-receipt.js: هوية CosmoFast في الإيصال وإذن التسليم (لوجو C + اسم ملف الـ PDF).
   الإيصال أبيض وأسود زي ما هو (receipt-bw.js) والأرقام والبيانات ما بتتلمسش.
   1) بيبدّل لوجو K القديم بلوجو C جوه المستند.  2) اسم ملف PDF بيبقى CosmoFast-order-رقم بدل Kivra-order-رقم،
   وبيمنع إعادة اسم الصفحة لـ CosmoFast وقت فتح الإيصال (عشان الملف ما يبقاش اسمه واحد لكل الطلبات). */
(function(){
'use strict';
if(window.__cfReceipt)return; window.__cfReceipt=1;

var LOGO='<svg data-cf="1" viewBox="0 0 64 64" width="34" height="34" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#0F6B5B"/>'+
  '<g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none"><line x1="14" y1="24" x2="22" y2="24"/><line x1="11" y1="32" x2="22" y2="32"/><line x1="14" y1="40" x2="22" y2="40"/></g>'+
  '<path d="M50 23.6A13 13 0 1 0 50 40.4" stroke="#fff" stroke-width="6.5" stroke-linecap="round" fill="none"/></svg>';

function pass(){
  var s=document.querySelector('#rcpt .rc-brand svg');
  if(s&&!s.hasAttribute('data-cf'))s.outerHTML=LOGO;
}

try{
  var desc=Object.getOwnPropertyDescriptor(Document.prototype,'title');
  if(desc&&desc.get&&desc.set){
    Object.defineProperty(document,'title',{
      configurable:true,enumerable:true,
      get:function(){return desc.get.call(document);},
      set:function(v){
        v=String(v);
        if(v==='CosmoFast'&&document.getElementById('rcpt'))return;
        desc.set.call(document,v.replace(/^Kivra-/,'CosmoFast-'));
      }
    });
  }
}catch(e){}

var raf=0;
function sched(){if(!raf)raf=requestAnimationFrame(function(){raf=0;try{pass();}catch(e){}});}
new MutationObserver(sched).observe(document.body,{childList:true});
sched();
})();
