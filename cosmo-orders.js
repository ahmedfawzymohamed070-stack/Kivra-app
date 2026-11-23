/* cosmo-orders.js: شريط فلاتر حالة الطلبات (الكل / بانتظار المخزن / قيد التجهيز / تم الشحن / تم التسليم / ملغي) لصفحة الطلبات عند الأدمن والمخزن والصيدلية.
   بيخفي ويظهر الكروت على الشاشة بس. مفيش لمس لأزرار القبول والرفض والتتبع والطباعة ولا للـ DB. */
(function(){
'use strict';
if(window.__cfOrders)return; window.__cfOrders=1;
var F='all', last='';
var st=document.createElement('style');
st.textContent='.cff{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 8px;margin:4px 0 6px;-webkit-overflow-scrolling:touch}'+
'.cff button{flex:none;display:flex;align-items:center;gap:6px;background:#fff;color:#0A4A40;border:1px solid #dcebe7;border-radius:99px;padding:8px 14px;font-size:13px;font-weight:600;white-space:nowrap}'+
'.cff button b{background:#E6F2EF;color:#0A4A40;border-radius:99px;padding:0 7px;font-size:12px}'+
'.cff button.on{background:#0F6B5B;color:#fff;border-color:#0F6B5B}.cff button.on b{background:rgba(255,255,255,.22);color:#fff}'+
'.cff-n{color:#566663;font-size:13px;padding:8px 2px}.cff-h{display:none!important}';
document.head.appendChild(st);

var KEYS=['all','pending','accepted','delivered','received','bad'];
function label(k){return k==='all'?'الكل':k==='bad'?'ملغي / مرفوض':(OST[k]||k);}
function inG(g,s){return g==='all'||(g==='bad'?(s==='rejected'||s==='cancelled'):s===g);}
function counts(l){
  var c={all:l.length,pending:0,accepted:0,delivered:0,received:0,bad:0};
  l.forEach(function(o){
    if(o.status==='rejected'||o.status==='cancelled')c.bad++;
    else if(c[o.status]!==undefined)c[o.status]++;
  });
  return c;
}
function numOf(c){var b=c.querySelector('b'),m=b&&/^طلب #(\d+)/.exec(b.textContent.trim());return m?m[1]:null;}
function cards(){return [].slice.call(document.querySelectorAll('.oc,.item')).filter(function(c){return numOf(c)!==null;});}
function stOf(c,l){var n=numOf(c);for(var i=0;i<l.length;i++){if(String(l[i].order_no)===n)return l[i].status;}return null;}

function tick(){
  var bar=document.getElementById('cff');
  var admin=typeof ME!=='undefined'&&ME&&(ME.role==='admin'||ME.role==='warehouse'||ME.role==='pharmacy');
  var list=admin?cards():[];
  if(!admin||!list.length){if(bar)bar.remove();F='all';last='';return;}
  var ords=(typeof ORD!=='undefined'&&Array.isArray(ORD))?ORD:[];
  var cn=counts(ords);
  var html='<div class="cff">'+KEYS.map(function(k){
    return '<button type="button" data-cff="'+k+'" class="'+(k===F?'on':'')+'">'+label(k)+'<b>'+cn[k]+'</b></button>';
  }).join('')+'</div><div class="cff-n" hidden></div>';
  if(!bar){
    bar=document.createElement('div'); bar.id='cff'; last='';
    var box=document.getElementById('os-box'),first=list[0];
    var ref=box||first;
    ref.parentNode.insertBefore(bar,ref);
  }
  if(html!==last){bar.innerHTML=html;last=html;}
  var shown=0;
  list.forEach(function(c){
    var s=stOf(c,ords),hide=!(F==='all'||(s&&inG(F,s)));
    c.classList.toggle('cff-h',hide);
    if(!hide)shown++;
  });
  var nt=bar.querySelector('.cff-n');
  if(nt){var empty=F!=='all'&&shown===0;nt.hidden=!empty;nt.textContent=empty?'لا توجد طلبات في الحالة دي.':'';}
}
var raf=0;
function sched(){if(!raf)raf=requestAnimationFrame(function(){raf=0;try{tick();}catch(e){}});}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-cff]');
  if(b){F=b.getAttribute('data-cff');last='';sched();return;}
  if(e.target.closest&&e.target.closest('[data-kv="go"],[data-act="tab"]')){F='all';last='';}
},true);
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
sched();
})();
