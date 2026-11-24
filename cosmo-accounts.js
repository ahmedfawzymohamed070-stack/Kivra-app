/* cosmo-accounts.js: صفحة «الحسابات» عند الأدمن: بحث + فلاتر الحالة والنوع + كل حساب في كارت مستقل.
   عرض بس: بيخفي ويظهر الصفوف على الشاشة. أزرار الموافقة والرفض وعرض الرخصة ما بتتلمسش ومفيش DB. للرجوع: امسح سطره. */
(function(){
'use strict';
if(window.__cfAcc)return; window.__cfAcc=1;
var S='all',R='all',Q='',lastS='',lastR='';
var st=document.createElement('style');
st.id='cosmo-accounts';
st.textContent=[
'html body .card.cfa-card{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}',
'.cfa-card>h2{font-size:22px!important;margin:4px 2px 12px!important}',
'.cfa-card .item{background:#fff;border:1px solid #dcebe7!important;border-radius:14px;padding:12px 14px!important;margin-bottom:10px;box-shadow:0 1px 6px rgba(10,74,64,.05)}',
'.cfa-card .item:first-of-type{border-top:1px solid #dcebe7!important}',
'#cfa input{margin:0 0 8px}',
'.cfa-ch{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;-webkit-overflow-scrolling:touch}',
'html body .cfa-ch button{flex:none;display:flex;align-items:center;gap:6px;background:#fff!important;color:#0A4A40!important;border:1px solid #dcebe7!important;border-radius:99px!important;padding:7px 13px!important;font-size:13px!important;font-weight:600;white-space:nowrap}',
'.cfa-ch button b{background:#E6F2EF;color:#0A4A40;border-radius:99px;padding:0 7px;font-size:12px}',
'html body .cfa-ch button.on{background:#0F6B5B!important;color:#fff!important;border-color:#0F6B5B!important}',
'.cfa-ch button.on b{background:rgba(255,255,255,.22);color:#fff}',
'.cfa-n{color:#566663;font-size:13px;padding:6px 2px}',
'.cfa-h{display:none!important}'
].join('');
document.head.appendChild(st);

function info(row){
  var s=null,r=null;
  [].forEach.call(row.querySelectorAll('.badge'),function(b){
    var m=/\b(pending|approved|rejected)\b/.exec(b.className||'');
    if(m)s=m[1]; else if(!r)r=(b.textContent||'').trim();
  });
  return {st:s,rl:r,tx:(row.textContent||'').toLowerCase()};
}
function counts(infos){
  var c={all:infos.length,pending:0,approved:0,rejected:0},roles=[],rc={};
  infos.forEach(function(i){
    if(c[i.st]!==undefined)c[i.st]++;
    if(i.rl){if(rc[i.rl]===undefined){rc[i.rl]=0;roles.push(i.rl);}rc[i.rl]++;}
  });
  return {c:c,roles:roles,rc:rc};
}
function show(i){return (S==='all'||i.st===S)&&(R==='all'||i.rl===R)&&(!Q||i.tx.indexOf(Q)>-1);}
function lab(k){
  var T=(typeof STATUS!=='undefined'&&STATUS)||{};
  return k==='all'?'الكل':(T[k]||({pending:'قيد المراجعة',approved:'مفعّل',rejected:'مرفوض'})[k]);
}
function esc2(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function findCard(){
  var l=document.querySelectorAll('#main .card');
  for(var i=0;i<l.length;i++){var h=l[i].querySelector('h2');if(h&&h.textContent.trim()==='الحسابات')return l[i];}
  return null;
}
function tick(){
  var bar=document.getElementById('cfa');
  var admin=typeof ME!=='undefined'&&ME&&ME.role==='admin';
  var tab=(typeof TAB!=='undefined')?TAB:'';
  if(!admin||tab!=='acct'){if(bar)bar.remove();S='all';R='all';Q='';lastS='';lastR='';return;}
  var c=findCard(); if(!c){return;}
  var rows=[].slice.call(c.querySelectorAll('.item'));
  if(!rows.length){if(bar)bar.remove();return;}
  c.classList.add('cfa-card');
  var infos=rows.map(info),k=counts(infos);
  if(!bar){
    bar=document.createElement('div'); bar.id='cfa';
    bar.innerHTML='<input id="cfa-q" type="search" placeholder="ابحث باسم الحساب أو رقم الموبايل"><div class="cfa-ch" id="cfa-s"></div><div class="cfa-ch" id="cfa-r"></div><div class="cfa-n" id="cfa-n" hidden>لا توجد حسابات مطابقة.</div>';
    rows[0].parentNode.insertBefore(bar,rows[0]);
    bar.querySelector('#cfa-q').value=Q;
    lastS='';lastR='';
  }
  var hs=['all','pending','approved','rejected'].map(function(x){
    return '<button type="button" data-cfa-s="'+x+'" class="'+(x===S?'on':'')+'">'+esc2(lab(x))+'<b>'+k.c[x]+'</b></button>';
  }).join('');
  if(hs!==lastS){bar.querySelector('#cfa-s').innerHTML=hs;lastS=hs;}
  var hr=k.roles.length>1?(['all'].concat(k.roles)).map(function(x){
    return '<button type="button" data-cfa-r="'+esc2(x)+'" class="'+(x===R?'on':'')+'">'+(x==='all'?'كل الأنواع':esc2(x))+'<b>'+(x==='all'?k.c.all:k.rc[x])+'</b></button>';
  }).join(''):'';
  if(hr!==lastR){bar.querySelector('#cfa-r').innerHTML=hr;lastR=hr;}
  var shown=0;
  rows.forEach(function(r,i){var v=show(infos[i]);r.classList.toggle('cfa-h',!v);if(v)shown++;});
  bar.querySelector('#cfa-n').hidden=shown>0;
}
var raf=0;
function sched(){if(!raf)raf=requestAnimationFrame(function(){raf=0;try{tick();}catch(e){}});}
document.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('[data-cfa-s],[data-cfa-r]'); if(!t)return;
  if(t.hasAttribute('data-cfa-s'))S=t.getAttribute('data-cfa-s'); else R=t.getAttribute('data-cfa-r');
  lastS='';lastR='';sched();
},true);
document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='cfa-q'){Q=(e.target.value||'').trim().toLowerCase();sched();}
});
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
sched();
})();
