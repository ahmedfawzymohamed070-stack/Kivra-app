/* Kivra: store-guest2.js - الزائر يشوف شاشة العميل الحقيقية (بانر + صيدليات + متجر)، والتسجيل بيتطلب عند إرسال الطلب أو فتح طلباتي/حسابي */

(function(){try{

if(typeof sb==='undefined'||typeof app==='undefined') return;

var KEY='kivra_gx_cart', PID='', RUN=false;

/* نخبي الشاشة لحد ما نقرر (زائر ولا مسجّل) عشان صفحة الدخول ما تلمعش */

var hs=document.createElement('style'); hs.id='gx-h'; hs.textContent='#app{visibility:hidden}'; document.head.appendChild(hs);

function unhide(){ var h=document.getElementById('gx-h'); if(h) h.remove(); }

setTimeout(unhide,3500);

var T=function(m){ try{ if(m) toast(m); }catch(e){} };

/* نمسك رقم الصيدلية المفتوحة عشان نرجّع السلة بعد الدخول */

var _r=sb.rpc.bind(sb);

sb.rpc=function(n,a,o){ if((n==='store_view'||n==='store_public_profile')&&a&&a.p_pharmacy) PID=a.p_pharmacy; return _r(n,a,o); };

/* رسايل "not authenticated" ما تظهرش للزائر */

try{ var _t=toast; toast=function(m){ if(typeof ME!=='undefined'&&ME&&ME.guest&&/not authenticated|jwt|permission denied/i.test(String(m))) return; return _t(m); }; }catch(e){}

async function guestBoot(){

if(typeof ME!=='undefined'&&ME&&!ME.guest) return;

ME={id:null,role:'customer',status:'approved',business_name:'',phone:'',address:'',guest:true}; GEO=null;

app.innerHTML='<header><b>'+APP+'</b><span></span><button data-act="glogin">👤 دخول</button></header><main id="main"></main><nav id="nav"></nav>';

unhide();

await show('shops');

deep();

}

function deep(){

var sid=''; try{ sid=new URLSearchParams(location.search).get('store')||''; }catch(e){}

if(!sid) return;

var n=0, t=setInterval(function(){ n++; var b=document.querySelector('[data-act="cshop"][data-id="'+sid+'"]'); if(b){ clearInterval(t); b.click(); } else if(n>25) clearInterval(t); },300);

}

function saveCart(){

var sh=document.getElementById('sx-sheet'), items=[];

if(!sh||!PID) return;

var cards=[].slice.call(document.querySelectorAll('#sf .sf-c[data-sxk]'));

sh.querySelectorAll('.sx-ci').forEach(function(r){

var nb=r.querySelector('b'), qb=r.querySelector('.sx-q b');

var name=nb?nb.textContent.trim():'', q=parseInt(qb?qb.textContent:'0',10);

var c=cards.find(function(x){ var n=x.querySelector('.sf-n'); return n&&n.textContent.trim()===name; });

if(c&&q>0) items.push({k:c.dataset.sxk,q:q});

});

if(items.length){ try{ localStorage.setItem(KEY,JSON.stringify({pid:PID,items:items})); }catch(e){} }

}

function toLogin(msg,save){

if(save) saveCart();

var s=document.getElementById('sx-sheet'); if(s) s.remove();

authView('login');

T(msg);

}

/* اعتراض الأزرار اللي محتاجة حساب (بيشتغل قبل باقي الملفات) */

window.addEventListener('click',function(e){

if(!(typeof ME!=='undefined'&&ME&&ME.guest)) return;

var tg=e.target; if(!tg||!tg.closest) return;

if(tg.closest('[data-sxa="send"]')){ e.preventDefault(); e.stopImmediatePropagation(); toLogin('سجّل الدخول أو أنشئ حساب (عميل) لإرسال طلبك، وهنرجّع سلتك',true); return; }

var t=tg.closest('[data-act="tab"]');

if(t&&t.dataset.t!=='shops'){ e.preventDefault(); e.stopImmediatePropagation(); toLogin('سجّل الدخول لمتابعة طلباتك وحسابك',false); }

},true);

A.glogin=function(){ toLogin('',false); };

A.gbrowse=function(){ return guestBoot(); };

/* رابط "تصفح بدون حساب" في صفحة الدخول */

try{ new MutationObserver(function(){

var c=document.querySelector('main.narrow');

if(c&&!c.querySelector('[data-act="gbrowse"]')) c.insertAdjacentHTML('beforeend','<p><a href="#" data-act="gbrowse" style="color:var(--p)">تصفح الصيدليات بدون حساب</a></p>');

}).observe(document.body,{childList:true,subtree:true}); }catch(e){}

/* بعد الدخول: نرجّع السلة ونفتح نافذة السلة */

function restore(){

var p=null; try{ p=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}

if(!p||!p.pid||RUN) return;

RUN=true;

var n=0, stage=0, t=setInterval(function(){

n++; if(n>60){ clearInterval(t); return; }

if(typeof ME==='undefined'||!ME||ME.guest) return;

if(ME.role!=='customer'){ try{localStorage.removeItem(KEY)}catch(e){} clearInterval(t); return; }

if(stage===0){ var b=document.querySelector('[data-act="cshop"][data-id="'+p.pid+'"]'); if(b){ b.click(); stage=1; } return; }

if(stage===1){

if(!document.querySelector('#main .sx-hd')) return;

var cards=[].slice.call(document.querySelectorAll('#sf .sf-c[data-sxk]')); if(!cards.length) return;

p.items.forEach(function(it){ var c=cards.find(function(x){return x.dataset.sxk===it.k}); var ab=c&&c.querySelector('[data-sxa="add"]'); if(ab) for(var i=0;i<it.q;i++) ab.click(); });

stage=2; return;

}

if(stage===2){ var bar2=document.getElementById('sx-bar'); if(bar2){ bar2.click(); } try{localStorage.removeItem(KEY)}catch(e){} T('رجّعنا سلتك'); clearInterval(t); }

},400);

}

sb.auth.getSession().then(function(r){

if(r&&r.data&&r.data.session){ unhide(); restore(); return; }

setTimeout(guestBoot,250);

}).catch(unhide);

sb.auth.onAuthStateChange(function(ev,ses){ if(ses) restore(); });

}catch(e){ try{ var h=document.getElementById('gx-h'); if(h) h.remove(); }catch(_){} }})();
