/* cosmo-store-style.js: ألوان وشكل شاشات المتجر والعميل بنفس هوية CosmoFast (أخضر #0F6B5B بدل التيل القديم #1F6F6B).
   CSS بس. بيغطي: رئيسية العميل (الصيدليات)، طلباتي عند العميل، وتبويب "متجري" عند الصيدلية. مفيش منطق ولا DB. */
(function(){
'use strict';
if(window.__cfStoreStyle)return; window.__cfStoreStyle=1;
var G='#0F6B5B', GD='#0A4A40', SOFT='#E6F2EF', BD='#dcebe7', SH='0 2px 10px rgba(10,74,64,.07)';
var css=[
/* رئيسية العميل */
'html body .sh-hero{background:linear-gradient(135deg,'+GD+',#1E8A76)!important;border-radius:20px!important}',
'html body .sh-loc{border:1px solid '+BD+'!important;border-radius:16px!important;box-shadow:'+SH+'}',
'html body .sh-loc b{color:'+G+'!important}',
'html body .sh-h{font-size:22px!important;color:#14302b!important}',
'html body .sh-tile u{background:'+SOFT+'!important}',
'html body .sh-tile.on u{border-color:'+G+'!important;background:#cfe6e0!important}',
'html body .sh-card{border:1px solid '+BD+'!important;border-radius:16px!important;box-shadow:'+SH+'}',
'html body .sh-cv{background:linear-gradient(135deg,'+SOFT+',#F4F8F7)!important}',
'html body .sh-cv .in{color:'+G+'!important}',
'html body .sh-tg,html body .sh-ds{color:'+G+'!important}',
'html body .sh-note{background:#F1F7F6!important}',
/* طلباتي عند العميل + متجري عند الصيدلية */
'html body .so-o{border:1px solid '+BD+'!important;border-radius:16px!important;box-shadow:'+SH+'}',
'html body .so-b{background:'+SOFT+'!important;color:'+G+'!important}',
'html body .so-b.st-pending{background:#fff3d6!important;color:#8a5a00!important}',
'html body .so-b.st-shipped{background:#e0eefc!important;color:#0b5394!important}',
'html body .so-b.st-delivered{background:#d8f3e3!important;color:#0a5a41!important}',
'html body .so-b.st-rejected,html body .so-b.st-cancelled{background:#fde2de!important;color:#9b2a1d!important}',
'html body .so-bx{background:#F1F7F6!important}',
'html body .so-ch button{background:'+SOFT+'!important;color:'+G+'!important;border-radius:99px!important}',
'html body .so-ch button.on{background:'+G+'!important;color:#fff!important}',
'html body .so-s.d i{background:'+G+'!important}'
].join('');
var st=document.createElement('style');
st.id='cosmo-store-style';
st.textContent=css;
document.head.appendChild(st);
})();
