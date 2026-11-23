/* cosmo-style.js: ستايل عام واحد لكل الأدوار (أدمن، مخزن، صيدلية، عميل) على شكل الصور المعتمدة.
   CSS بس: بيشيل بواقي اللون البنفسجي من compact-ui / polish-ui / polish-pages ويظبط الكروت والأزرار والحقول.
   مفيش أي منطق ولا لمس للـ DB. بيتحمّل في الآخر. للرجوع: امسح سطره من index.html. */
(function(){
'use strict';
if(window.__cfStyle)return; window.__cfStyle=1;
var css=[
/* الأساس */
'html body{background:#F4F8F7!important;font-size:14px!important;line-height:1.5!important;color:#14302b}',
'html body h2{font-size:17px!important;margin:0 0 10px!important;color:#14302b}',
/* الكروت */
'html body .card{border-radius:16px!important;padding:14px 16px!important;margin-bottom:12px!important;border:1px solid #dcebe7!important;box-shadow:0 2px 10px rgba(10,74,64,.07)!important}',
/* الحقول والأزرار */
'html body input:not([type=checkbox]):not([type=radio]):not([type=file]),html body select,html body textarea{border-radius:12px!important;padding:10px 12px!important;border:1px solid #cfe0dd!important;background:#fff}',
'html body button{border-radius:10px!important}',
/* عناصر الرئيسية والفلاتر الجديدة (compact-ui كان بيصغّرها) */
'html body button.cfd-c{border-radius:16px!important;padding:14px!important}',
'html body .cff button{border-radius:99px!important;padding:8px 14px!important;font-size:13px!important}',
/* بواقي البنفسجي: صفحة حسابي والنوافذ */
'html body .prof{background:linear-gradient(135deg,#0A4A40,#1E8A76)!important}',
'html body .menu{border-color:#dcebe7!important;border-radius:16px!important;box-shadow:0 2px 10px rgba(10,74,64,.07)}',
'html body .mrow{border-top-color:#e4efed!important}',
'html body .mi{background:#E6F2EF!important;color:#0F6B5B}',
'html body .mc{color:#8fb0aa!important}',
'html body #sheet-ov{background:rgba(10,30,28,.5)!important}',
'html body #sheet-ov>div{background:#F4F8F7!important}',
'html body #sheet-ov>div>.row:first-child>b{color:#0A4A40!important}',
/* بواقي البنفسجي: كروت المنتجات والطلبات والموزعين */
'html body .pc,html body .oc,html body .dc{border-radius:16px!important;box-shadow:0 2px 10px rgba(10,74,64,.07)!important}',
'html body .pc .offer{background:#F1F7F6!important;border-color:#dcebe7!important}'
].join('');
var st=document.createElement('style');
st.id='cosmo-style';
st.textContent=css;
document.head.appendChild(st);
})();
