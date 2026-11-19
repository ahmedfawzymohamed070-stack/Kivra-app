/* Kivra: store-ui6-fix.js - إصلاح ظهور الغلاف واللوجو والبانرات والحالة في هيدر الصيدلية عند الزائر (إضافة فقط، مش بيعدّل store-ui6.js).
   السبب: store-ui6 بيرسم الهيدر قبل ما يعرف رقم الصيدلية فبيفضل من غير صور. هنا بنمسك رقم الصيدلية من الضغطة نفسها وبنكمّل الهيدر. */
(function(){try{
var LAST2='', CLICKED='', T=null;
var _r=sb.rpc.bind(sb);
sb.rpc=function(n,a,o){ if(n==='store_view'&&a&&a.p_pharmacy) LAST2=a.p_pharmacy; return _r(n,a,o); };
function num(v){var n=Number(v);return isFinite(n)?n:0}
function img(p){ if(!p) return ''; if(/^https?:/.test(p)) return p; try{ return sb.storage.from('product-images').getPublicUrl(p).data.publicUrl; }catch(e){ return ''; } }
function cssu(u){ return 'url("'+String(u).replace(/[()"'\\]/g,function(c){return '%'+c.charCodeAt(0).toString(16)})+'")'; }
function chips(p){
  var a=[];
  if(p.delivery_time) a.push('⏱ '+esc(p.delivery_time));
  if(num(p.delivery_fee)>0) a.push('🛵 توصيل '+money(p.delivery_fee));
  if(num(p.min_order)>0) a.push('الحد الأدنى '+money(p.min_order));
  if(num(p.free_over)>0) a.push('مجاني فوق '+money(p.free_over));
  if(p.hours) a.push('🕒 '+esc(p.hours));
  return a.map(function(s){return '<span>'+s+'</span>'}).join('');
}
function stat(p){ return p.is_open===true?'<span class="u5st on">مفتوح</span>':p.is_open===false?'<span class="u5st off">مغلق</span>':''; }
function paint(el,d,id){
  var p=(d&&d.profile)||{}, banners=(d&&d.banners)||[];
  var cv=el.querySelector('.u5cv'), lg=el.querySelector('.u5lg'), s=el.querySelector('.u5s'), c=el.querySelector('.u5ch'), tg=el.querySelector('.u5tg'), bn=el.querySelector('.u5bn'), h2=el.querySelector('h2');
  var cu=img(p.cover_url), lu=img(p.logo_url);
  if(cv) cv.style.backgroundImage=cu?cssu(cu):'';
  if(lg) lg.innerHTML=lu?'<img src="'+esc(lu)+'" alt="">':esc(((h2&&h2.textContent)||'').trim().charAt(0)||'؟');
  if(s) s.innerHTML=stat(p);
  if(c) c.innerHTML=chips(p);
  if(tg) tg.textContent=p.tagline||'';
  if(bn) bn.innerHTML=banners.map(function(b){ var u=img(b.image_url); return u?'<img loading="lazy" src="'+esc(u)+'" alt="'+esc(b.title||'')+'">':''; }).join('');
  el.setAttribute('data-fixed',id); el.setAttribute('data-pid',id);
}
function fix(el,id){
  el.setAttribute('data-fixed',id);
  Promise.resolve(_r('store_public_profile',{p_pharmacy:id})).then(function(r){
    if(el.getAttribute('data-fixed')!==id) return;
    if(r&&!r.error&&r.data){ var d=Array.isArray(r.data)?r.data[0]:r.data; if(d&&d.store_public_profile) d=d.store_public_profile; paint(el,d,id); }
    else { el.setAttribute('data-fixed',''); }
  }).catch(function(){ el.setAttribute('data-fixed',''); });
}
document.addEventListener('click',function(e){
  var t=e.target; if(!t||!t.closest) return;
  var b=t.closest('[data-act="cshop"]'); if(b&&b.getAttribute('data-id')){ CLICKED=b.getAttribute('data-id'); return; }
  if(t.closest('[data-act="cback"]')) CLICKED='';
},true);
function tick(){
  try{
    var list=document.querySelectorAll('.u5h'); if(!list.length) return;
    [].forEach.call(list,function(el){
      var want=CLICKED||LAST2||el.getAttribute('data-pid')||'';
      if(!want||el.getAttribute('data-fixed')===want) return;
      fix(el,want);
    });
  }catch(e){ console.warn('store-ui6-fix',e); }
}
new MutationObserver(function(){ clearTimeout(T); T=setTimeout(tick,80); }).observe(document.body,{childList:true,subtree:true});
}catch(e){ console.warn('store-ui6-fix',e); }})();
