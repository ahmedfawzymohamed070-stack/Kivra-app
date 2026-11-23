/* cosmo-customer-home.js: رئيسية العميل والزائر على شكل الصورة المعتمدة (كارت ترحيب + بحث + 4 تايلز + إحصائيات سريعة).
   عرض بس: الإحصائيات من قايمة الصيدليات الحقيقية (نفس الـ RPC اللي بتستخدمها الصفحة). مفيش لمس للبحث أو الفلاتر أو الطلبات. */
(function(){
'use strict';
if(window.__cfCustHome)return; window.__cfCustHome=1;
var IC={
  store:'M4 9l1-5h14l1 5M5 9v11h14V9M9 20v-6h6v6',
  box:'M12 3l8 4v10l-8 4-8-4V7zM12 12l8-5M12 12v9M12 12L4 7',
  star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'
};
function svg(k){return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+IC[k]+'"/></svg>';}
var css=[
'html body .sh-hero{padding:22px 18px 20px!important}',
'html body .sh-hero>b{display:none!important}',
'.cfh-tg{font-size:26px;font-weight:800;line-height:1.35;color:#fff}',
'.cfh-sb{font-size:13px;color:#fff;opacity:.9;margin:6px 0 14px}',
'html body .sh-hero input{border-radius:16px!important;padding:14px 16px!important}',
'html body .sh-tiles{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:10px!important;overflow:visible!important;padding-bottom:0!important}',
'html body .sh-tiles .sh-tile{width:auto!important;min-width:0!important;background:#fff!important;border:1px solid #dcebe7!important;border-radius:16px!important;box-shadow:0 2px 10px rgba(10,74,64,.07)!important;padding:12px 4px!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:6px!important;font-size:12px!important;font-weight:600!important;color:#14302b!important;white-space:normal!important;text-align:center!important}',
'html body .sh-tiles .sh-tile u{width:auto!important;height:auto!important;margin:0!important;background:none!important;border:0!important;border-radius:0!important;color:#0F6B5B!important}',
'html body .sh-tiles .sh-tile u svg{width:28px!important;height:28px!important}',
'html body .sh-tiles .sh-tile.on{background:#E6F2EF!important;border-color:#0F6B5B!important}',
'html body .sh-tiles .sh-tile.on u{background:none!important;border:0!important}',
'.cfh-h3{margin:18px 2px 8px;font-size:16px;font-weight:700;color:#14302b}',
'.cfh-row{display:flex;gap:10px}',
'.cfh-s{flex:1;min-width:0;background:#fff;border:1px solid #dcebe7;border-radius:16px;box-shadow:0 2px 10px rgba(10,74,64,.07);padding:12px 4px;text-align:center}',
'.cfh-s svg{color:#0F6B5B}.cfh-s b{display:block;font-size:20px;color:#0A4A40;margin-top:2px}.cfh-s span{font-size:11px;color:#566663}'
].join('');
var st=document.createElement('style'); st.id='cosmo-customer-home'; st.textContent=css; document.head.appendChild(st);

function calc(l){
  var pr=0,rated=0;
  l.forEach(function(p){pr+=Number(p.products_count)||0;if(Number(p.rating)>0)rated++;});
  return [['store',l.length,'صيدلية'],['box',pr,'منتج متاح'],['star',rated,'صيدلية مقيّمة']];
}
function html(cards){
  return '<div class="cfh-h3">إحصائيات سريعة</div><div class="cfh-row">'+cards.map(function(c){
    return '<div class="cfh-s">'+svg(c[0])+'<b>'+Number(c[1])+'</b><span>'+c[2]+'</span></div>';
  }).join('')+'</div>';
}
var cache=null,at=0,pend=null;
async function load(){
  if(cache&&Date.now()-at<120000)return cache;
  if(pend)return pend;
  pend=(async function(){
    try{
      var r=await sb.rpc('store_list_pharmacies2'),l;
      if(!r.error&&Array.isArray(r.data))l=r.data; else l=ok(await sb.rpc('store_list_pharmacies'))||[];
      cache=calc(l);at=Date.now();return cache;
    }catch(e){return null;}
    finally{pend=null;}
  })();
  return pend;
}
function pass(){
  var hero=document.querySelector('#main .sh-hero'); if(!hero)return;
  if(!hero.querySelector('.cfh-tg'))hero.insertAdjacentHTML('afterbegin','<div class="cfh-tg">جمالك وصحتك<br>في مكان واحد</div><div class="cfh-sb">اختار صيدليتك وتصفّح منتجاتها</div>');
  var tiles=document.querySelector('#main .sh-tiles');
  if(!tiles||document.getElementById('cfh-st'))return;
  var box=document.createElement('div'); box.id='cfh-st';
  tiles.parentNode.insertBefore(box,tiles.nextSibling);
  var h=document.querySelector('#main .sh-h'); if(h)box.parentNode.insertBefore(h,box.nextSibling);
  load().then(function(c){
    if(!box.isConnected)return;
    if(c)box.innerHTML=html(c); else box.remove();
  });
}
var raf=0;
function sched(){if(!raf)raf=requestAnimationFrame(function(){raf=0;try{pass();}catch(e){}});}
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
sched();
})();
