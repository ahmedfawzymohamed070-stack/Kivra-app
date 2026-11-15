/* Kivra: store-guest2.js - أي زائر يشوف المتجر بنفس شكل العميل، والتسجيل بيتطلب عند إرسال الطلب بس */

(function(){try{

if(typeof sb==='undefined') return;

var CARTP='', RUN=false, KEY='kivra_gx_cart', PH=[], CUR=null, PROF={}, BAN=[], CFG=false, MAP={}, CART={}, ov=null, btn=null, ITEMS=[], HQ='';

var st=document.createElement('style');

st.textContent=`

#gx{position:fixed;inset:0;z-index:70;background:#f4f8f7;overflow:auto;display:none}

.gx-top{position:sticky;top:0;z-index:2;background:#1F6F6B;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top))}

.gx-top button{background:rgba(255,255,255,.18);color:#fff;border:0;border-radius:10px;padding:8px 14px;font-size:16px}

.gx-top b{font-size:18px}.gx-lgo{width:34px;height:34px;border-radius:10px;background:#fff;color:#1F6F6B;display:flex;align-items:center;justify-content:center;font-size:20px}

.gx-body{padding:12px;padding-bottom:150px;max-width:760px;margin:0 auto}

.gx-hero{background:linear-gradient(135deg,#1F6F6B,#2A8780);border-radius:18px;padding:16px;color:#fff}

.gx-hero b{display:block;font-size:22px;margin-bottom:10px}

.gx-hero input{width:100%;box-sizing:border-box;border:0;border-radius:99px;padding:13px 18px;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.15)}

.gx-h{font-size:24px;font-weight:800;margin:18px 0 10px;color:#1c2423}

.gx-pc{background:#fff;border:1px solid #dfe8e7;border-radius:18px;overflow:hidden;margin:14px 0;cursor:pointer}

.gx-cv{position:relative;height:170px;background:linear-gradient(135deg,#d4e6e4,#eef5f4);display:flex;align-items:center;justify-content:center;overflow:hidden}

.gx-cv img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}

.gx-in0{font-size:72px;font-weight:800;color:#1F6F6B;opacity:.85}

.gx-bd{position:absolute;top:10px;left:10px;background:#fff;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.15)}

.gx-pi{padding:12px 14px}.gx-rt{display:flex;justify-content:space-between;align-items:center}

.gx-nm{font-size:18px;font-weight:800;color:#1c2423}.gx-sr2{color:#c78a2c;font-weight:700;font-size:14px;white-space:nowrap}

.gx-tg{color:#1F6F6B;font-size:14px;margin-top:4px}

.gx-ph{background:#fff;border:1px solid #e3ecea;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 1px 5px rgba(16,60,56,.08)}

.gx-m{color:#6b7c7a;font-size:13px;margin-top:3px}

.gx-go{width:100%;margin-top:10px;background:#1F6F6B;color:#fff;border:0;border-radius:12px;padding:11px;font-weight:700;font-size:15px}

.gx-hd{background:#fff;border:1px solid #dfe8e7;border-radius:18px;overflow:hidden;margin-bottom:12px}

.gx-cvr{height:130px;background:linear-gradient(135deg,#1F6F6B,#2A8780) center/cover no-repeat}

.gx-hin{padding:0 14px 14px}

.gx-lg{width:68px;height:68px;border-radius:16px;border:3px solid #fff;background:#fff;margin-top:-34px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#1F6F6B;box-shadow:0 2px 8px rgba(0,0,0,.15)}

.gx-lg img{width:100%;height:100%;object-fit:cover}

.gx-nm2{font-size:20px;font-weight:800;margin-top:8px;color:#1c2423}

.gx-ch{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.gx-ch span{background:#e8f3f1;color:#1F6F6B;border-radius:99px;padding:4px 10px;font-size:12px;font-weight:600}

.gx-row{display:flex;gap:8px;flex-wrap:wrap}.gx-row a{text-decoration:none}.gx-row button{background:#1F6F6B;color:#fff;border:0;border-radius:12px;padding:9px 16px;font-size:14px}.gx-row button.g{background:#e8f3f1;color:#1F6F6B}

.gx-op{font-size:12px;font-weight:700;padding:2px 10px;border-radius:99px;margin-inline-start:8px}.gx-op.y{background:#d8f3e8;color:#0a5a41}.gx-op.n{background:#fde2de;color:#9b2a1d}

.gx-bn{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;scrollbar-width:none;border-radius:16px;margin-bottom:10px}

.gx-bn::-webkit-scrollbar{display:none}

.gx-bs{flex:0 0 100%;scroll-snap-align:start;height:150px;border-radius:16px;overflow:hidden;position:relative;background:#e6efee}

.gx-bs img{width:100%;height:100%;object-fit:cover}

.gx-bs span{position:absolute;bottom:0;right:0;left:0;padding:22px 14px 10px;color:#fff;font-weight:800;font-size:18px;background:linear-gradient(transparent,rgba(0,0,0,.6))}

.gx-sr{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dfe8e7;border-radius:12px;margin:8px 0;font-size:15px}

.gx-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}

.gx-c{background:#fff;border:1px solid #e3ecea;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 5px rgba(16,60,56,.08)}

.gx-i{position:relative;aspect-ratio:1/1;background:#f3f6f6;display:flex;align-items:center;justify-content:center;font-size:46px;overflow:hidden}

.gx-i img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}

.gx-b{position:absolute;top:8px;right:8px;background:#e11d48;color:#fff;font-weight:800;font-size:13px;padding:3px 9px;border-radius:8px}

.gx-t{padding:8px 10px 0;flex:1}.gx-br{font-size:11px;color:#6b7c7a}

.gx-n{font-size:14px;font-weight:700;line-height:1.4;color:#1c2423;min-height:2.8em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.gx-p{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 8px;margin-top:6px}.gx-p b{font-size:18px;color:#1F6F6B}.gx-p s{font-size:12px;color:#8a9694}

.gx-sv{display:inline-block;margin-top:4px;background:#dcfce7;color:#166534;font-weight:700;font-size:11px;padding:2px 8px;border-radius:6px}

.gx-e{margin-top:5px;font-size:12px;font-weight:700;color:#b45309;background:#fef3c7;border-radius:6px;padding:3px 8px;display:inline-block}

.gx-s{font-size:11px;color:#6b7c7a;margin-top:6px}

.gx-a{margin:8px 10px 10px;background:#1F6F6B;color:#fff;border:0;border-radius:12px;padding:10px;font-weight:700;font-size:13px}

.gx-a:disabled{background:#cfd8d7}

.gx-bar{position:fixed;left:12px;right:12px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:3;background:#1F6F6B;color:#fff;border:0;border-radius:16px;padding:15px;font-weight:800;font-size:15px;box-shadow:0 6px 18px rgba(16,60,56,.35)}

.gx-nav{position:fixed;left:0;right:0;bottom:0;z-index:3;display:flex;background:#fff;border-top:1px solid #dfe8e7;padding-bottom:env(safe-area-inset-bottom)}

.gx-nav button{flex:1;background:none;border:0;color:#6b7c7a;padding:8px 2px;font-size:12px;display:flex;flex-direction:column;align-items:center}

.gx-nav button span{font-size:22px;line-height:1.2}.gx-nav button.on{color:#1F6F6B;font-weight:700}

.gx-ci{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eef3f2}

.gx-q{display:flex;gap:10px;align-items:center}.gx-q button{width:34px;height:34px;border-radius:10px;border:0;background:#e8f3f1;color:#1F6F6B;font-size:18px}

.gx-tt{display:flex;justify-content:space-between;padding:4px 0}

#gx-open{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:40;background:#1F6F6B;color:#fff;border:0;border-radius:16px;padding:15px;font-weight:800;font-size:16px;box-shadow:0 6px 18px rgba(16,60,56,.35)}

#gx-note{position:fixed;top:0;left:0;right:0;z-index:80;background:#fef3c7;color:#92400e;text-align:center;padding:10px;font-weight:700;font-size:14px}`;

document.head.appendChild(st);

var num=function(v){var n=Number(v);return isFinite(n)?n:0};

var E=function(s){return esc(s==null?'':s)};

var M=function(v){try{return money(v)}catch(e){return num(v).toFixed(2)+' ج.م'}};

var T=function(m){try{toast(m)}catch(e){}};

var key=function(x){return String(x.brand||'').trim()+'|'+String(x.name||'').trim()};

var waNum=function(p){var d=String(p||'').replace(/\D/g,''); if(d.indexOf('00')===0) d=d.slice(2); else if(d.charAt(0)==='0') d='20'+d.slice(1); return d};

function pub(p,bucket){ if(!p) return ''; if(/^https?:/.test(p)) return p; try{ return sb.storage.from(bucket).getPublicUrl(p).data.publicUrl; }catch(e){ return ''; } }

function img(p){ return pub(p,'product-images'); }

function disc(x){ var o=num(x.old_price), p=num(x.price); if(!(o>p)) return {off:0,old:0,end:''}; if(x.sale_ends&&new Date(x.sale_ends)<=new Date()) return {off:0,old:0,end:''}; return {off:Math.round((1-p/o)*100),old:o,end:x.sale_ends||''}; }

function left(iso){ var ms=new Date(iso)-new Date(); if(!(ms>0)) return ''; var m=Math.floor(ms/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60); return '⏳ ينتهي العرض '+(d>0?'بعد '+d+' يوم':h>0?'بعد '+h+' ساعة':'بعد '+m+' دقيقة'); }

var count=function(){var n=0;Object.keys(CART).forEach(function(i){n+=CART[i].q});return n};

var sub=function(){var s=0;Object.keys(CART).forEach(function(i){s+=num(CART[i].it.price)*CART[i].q});return s};

function nav(){ return '<div class="gx-nav"><button type="button" class="on" data-g="list"><span>🏪</span>الصيدليات</button><button type="button" data-g="need"><span>📦</span>طلباتي</button><button type="button" data-g="need"><span>👤</span>حسابي</button></div>'; }

function bar(){ return (CUR&&count())?'<button type="button" class="gx-bar" data-g="cart">🛒 '+count()+' منتج · '+M(sub())+' — عرض السلة</button>':''; }

function shell(title,back,inner){

ov.innerHTML='<div class="gx-top">'+(back?'<button type="button" data-g="'+back+'">→</button>':'<span class="gx-lgo">K</span>')+'<b>'+title+'</b><button type="button" data-g="login">👤 دخول</button></div><div class="gx-body">'+inner+'</div>'+bar()+nav();

}

function showOv(){ if(!ov){ ov=document.createElement('div'); ov.id='gx'; document.body.appendChild(ov); } ov.style.display='block'; if(btn) btn.style.display='none'; }

function hideOv(){ if(ov) ov.style.display='none'; if(btn) btn.style.display=''; }

function cardP(p){

var u=pub(p.cover_path,'product-images')||pub(p.logo_path,'logos'), nm=String(p.store_name||'').trim(), r=Number(p.rating), rc=Number(p.rating_count);

return '<div class="gx-pc" data-g="shop" data-id="'+E(p.id)+'"><div class="gx-cv"><span class="gx-in0">'+E(nm.charAt(0)||'؟')+'</span>'+(u?'<img loading="lazy" src="'+E(u)+'" alt="" onerror="this.remove()">':'')

+'<span class="gx-bd">'+(p.delivery_time?E(p.delivery_time):E(p.products_count)+' منتج')+'</span></div>'

+'<div class="gx-pi"><div class="gx-rt"><div class="gx-nm">'+E(nm)+'</div>'+(r>0?'<div class="gx-sr2">★ '+r.toFixed(1)+(rc>0?' ('+rc+')':'')+'</div>':'')+'</div>'

+'<div class="gx-m">'+E(p.city||p.address||'')+'</div><div class="gx-tg">'+E(p.products_count)+' منتج متاح</div></div></div>';

}

function fillList(){

var l=PH.filter(function(p){return [p.store_name,p.address,p.city].join(' ').toLowerCase().indexOf(HQ)>-1});

var el=document.getElementById('gx-l'); if(el) el.innerHTML=l.length?l.map(cardP).join(''):'<p class="gx-m">لا توجد صيدليات متاحة دلوقتي.</p>';

}

function drawHome(){

CUR=null;

shell('Kivra',null,'<div class="gx-hero"><b>Kivra</b><input id="gx-hq" type="search" placeholder="ابحث عن صيدلية" value="'+E(HQ)+'"></div><div class="gx-h">الصيدليات</div><div id="gx-l"></div>');

var i=document.getElementById('gx-hq'); if(i) i.oninput=function(){ HQ=i.value.trim().toLowerCase(); fillList(); };

fillList();

}

async function loadList(){

showOv();

if(PH.length){ drawHome(); return; }

shell('Kivra',null,'<p class="gx-m">جاري التحميل...</p>');

var r=await sb.rpc('store_list_pharmacies');

if(r.error){ shell('Kivra',null,'<div class="gx-ph">مش قادرين نحمّل الصيدليات دلوقتي.<div class="gx-m">'+E(r.error.message)+'</div><button type="button" class="gx-go" data-g="reload">حاول تاني</button></div>'); return; }

PH=r.data||[]; drawHome();

}

async function loadShop(id){

CUR=PH.find(function(p){return String(p.id)===String(id)}); if(!CUR) return loadList();

if(CARTP!==CUR.id){ CART={}; CARTP=CUR.id; }

shell(E(CUR.store_name),'list','<p class="gx-m">جاري التحميل...</p>');

var res=await Promise.all([sb.rpc('store_view',{p_pharmacy:CUR.id}),sb.rpc('store_public_profile',{p_pharmacy:CUR.id})]);

ITEMS=(res[0].error?[]:res[0].data)||[];

var pd=(!res[1].error&&res[1].data)||{}; PROF=pd.profile||{}; BAN=pd.banners||[]; CFG=!!pd.configured;

MAP={}; ITEMS.forEach(function(x){MAP[x.id]=x});

drawShop('');

}

function drawShop(q){

var open=PROF.is_open!==false, ch=[], nm=String(CUR.store_name||'').trim(), ph=String(CUR.phone||'').trim();

if(PROF.delivery_time) ch.push('⏱ '+PROF.delivery_time);

if(CFG) ch.push('🛵 '+(num(PROF.delivery_fee)>0?M(PROF.delivery_fee):'توصيل مجاني'));

if(num(PROF.free_over)>0) ch.push('مجاني فوق '+M(PROF.free_over));

if(num(PROF.min_order)>0) ch.push('🛒 أقل طلب '+M(PROF.min_order));

if(PROF.hours) ch.push('🕘 '+PROF.hours);

var l=ITEMS.filter(function(x){return [x.name,x.brand,x.category].join(' ').toLowerCase().indexOf(q.toLowerCase())>-1});

var h='<div class="gx-hd"><div class="gx-cvr"'+(PROF.cover_url?' style="background-image:url(\''+E(PROF.cover_url)+'\')"':'')+'></div><div class="gx-hin"><div class="gx-lg">'+(PROF.logo_url?'<img src="'+E(PROF.logo_url)+'" alt="">':E(nm.charAt(0)||'؟'))+'</div>'

+'<div class="gx-nm2">'+E(nm)+'<span class="gx-op '+(open?'y':'n')+'">'+(open?'مفتوح':'مغلق حالياً')+'</span></div>'

+(PROF.tagline?'<div class="gx-m">'+E(PROF.tagline)+'</div>':'')+(CUR.address?'<div class="gx-m">'+E(CUR.address)+'</div>':'')

+(ch.length?'<div class="gx-ch">'+ch.map(function(c){return '<span>'+E(c)+'</span>'}).join('')+'</div>':'')

+(ph?'<div class="gx-row"><a href="tel:'+E(ph)+'"><button type="button">📞 اتصال</button></a><a href="https://wa.me/'+E(waNum(ph))+'" target="_blank" rel="noopener"><button type="button" class="g">واتساب</button></a></div>':'')+'</div></div>'

+(BAN.length?'<div class="gx-bn">'+BAN.map(function(b){return '<div class="gx-bs"><img loading="lazy" src="'+E(b.image_url)+'" alt="">'+(b.title?'<span>'+E(b.title)+'</span>':'')+'</div>'}).join('')+'</div>':'')

+'<input class="gx-sr" id="gx-q" placeholder="ابحث في المتجر" value="'+E(q)+'"><div class="gx-g" id="gx-g">'+(l.length?l.map(function(x){return card(x,open)}).join(''):'')+'</div>'+(l.length?'':'<p class="gx-m">لا توجد منتجات.</p>');

shell(E(nm),'list',h);

var i=document.getElementById('gx-q'); if(i){ i.oninput=function(){ var v=i.value; drawShop(v); var n=document.getElementById('gx-q'); n.focus(); n.setSelectionRange(v.length,v.length); }; }

}

function card(x,open){

var d=disc(x),u=img(x.image_path),s=num(x.stock),c=CART[x.id],sv=d.off?d.old-num(x.price):0;

return '<div class="gx-c"><div class="gx-i">'+(u?'<img loading="lazy" src="'+E(u)+'" alt="" onerror="this.remove()">':'<span>🧴</span>')+(d.off?'<span class="gx-b">-'+d.off+'%</span>':'')+'</div>'

+'<div class="gx-t"><div class="gx-br">'+E(x.brand||'')+'</div><div class="gx-n">'+E(x.name)+'</div>'

+'<div class="gx-p"><b>'+M(x.price)+'</b>'+(d.off?'<s>'+M(d.old)+'</s>':'')+'</div>'

+(d.off?'<span class="gx-sv">وفّر '+M(sv)+'</span>':'')+(d.end?'<div class="gx-e">'+left(d.end)+'</div>':'')

+'<div class="gx-s">'+(s>0?(s<=5?'باقي '+s+' فقط':'متوفر'):'غير متوفر')+'</div></div>'

+'<button type="button" class="gx-a" data-g="add" data-i="'+E(x.id)+'"'+((s>0&&open)?'':' disabled')+'>'+(s<=0?'غير متوفر':!open?'المتجر مغلق':c?'✓ في السلة ('+c.q+') — أضف':'+ أضف للسلة')+'</button></div>';

}

function openCart(){

var rows=Object.keys(CART).map(function(i){var c=CART[i];return '<div class="gx-ci"><div style="flex:1;min-width:0"><b>'+E(c.it.name)+'</b><div class="gx-m">'+M(c.it.price)+'</div></div><div class="gx-q"><button type="button" data-g="cq" data-i="'+E(i)+'" data-d="-1">−</button><b>'+c.q+'</b><button type="button" data-g="cq" data-i="'+E(i)+'" data-d="1">+</button></div></div>'}).join('');

var mo=num(PROF.min_order), low=sub()<mo;

shell('سلتك','shopback',(rows||'<p class="gx-m">السلة فاضية.</p>')+'<div class="gx-tt"><span>المنتجات</span><b>'+M(sub())+'</b></div><div class="gx-m">رسوم التوصيل بتتحسب عند إتمام الطلب.</div>'

+(low?'<p style="color:#9b2a1d;font-weight:700">أقل قيمة للطلب '+M(mo)+'</p>':'')

+(rows?'<button type="button" class="gx-go" data-g="login">سجّل الدخول لإرسال الطلب</button><p class="gx-m">محتاج حساب عشان نبعت طلبك للصيدلية ونتابعه معاك.</p>':''));

}

function goLogin(msg){

if(CUR&&count()){

var items=Object.keys(CART).map(function(i){return {k:key(CART[i].it),q:CART[i].q}});

try{ localStorage.setItem(KEY,JSON.stringify({pid:CUR.id,items:items})); }catch(e){}

}

hideOv();

var n=document.getElementById('gx-note'); if(!n){ n=document.createElement('div'); n.id='gx-note'; document.body.appendChild(n); setTimeout(function(){ if(n.parentNode) n.remove(); },9000); }

n.textContent=msg||'سجّل الدخول أو أنشئ حساب (عميل)، وهنرجّع سلتك';

}

document.addEventListener('click',function(e){

var b=e.target.closest('#gx [data-g]'); if(!b) return;

var a=b.dataset.g, id=b.dataset.i;

if(a==='list') return loadList();

if(a==='reload'){ PH=[]; return loadList(); }

if(a==='shop') return loadShop(b.dataset.id);

if(a==='shopback') return drawShop('');

if(a==='cart') return openCart();

if(a==='login') return goLogin();

if(a==='need') return goLogin('سجّل الدخول لمتابعة طلباتك وحسابك');

if(a==='add'){ var it=MAP[id]; if(!it) return; var c=CART[id], q=(c?c.q:0)+1; if(q>num(it.stock)){ T('الكمية المتاحة '+num(it.stock)+' فقط'); return; } CART[id]={it:it,q:q}; b.textContent='✓ في السلة ('+q+') — أضف'; var old=ov.querySelector('.gx-bar'); if(old) old.remove(); ov.insertAdjacentHTML('beforeend',bar()); return; }

if(a==='cq'){ var c2=CART[id]; if(!c2) return; var nq=c2.q+Number(b.dataset.d); if(nq<=0) delete CART[id]; else c2.q=Math.min(nq,num(c2.it.stock)); if(count()) openCart(); else drawShop(''); return; }

});

function startGuest(){

loadList().then(function(){

var sid=''; try{ sid=new URLSearchParams(location.search).get('store')||''; }catch(e){}

if(sid&&PH.some(function(p){return String(p.id)===sid})) loadShop(sid);

});

}

function showEntry(){

if(btn||document.getElementById('gx-open')) return;

btn=document.createElement('button'); btn.id='gx-open'; btn.type='button'; btn.textContent='🏪 العودة لتصفح الصيدليات'; btn.style.display='none';

btn.onclick=function(){ if(ov&&ov.innerHTML) showOv(); else loadList(); }; document.body.appendChild(btn);

}

function clearEntry(){ if(btn){ btn.remove(); btn=null; } if(ov){ ov.remove(); ov=null; } }

function restore(){

var p=null; try{ p=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}

if(!p||!p.pid||RUN) return;

RUN=true;

var n=0, stage=0, t=setInterval(function(){

n++; if(n>60){ clearInterval(t); return; }

if(typeof ME==='undefined'||!ME) return;

if(ME.role!=='customer'){ try{localStorage.removeItem(KEY)}catch(e){} clearInterval(t); return; }

if(stage===0){ var b=document.querySelector('#cl [data-act="cshop"][data-id="'+p.pid+'"]'); if(b){ b.click(); stage=1; } return; }

if(stage===1){

if(!document.querySelector('#main .sx-hd')) return;

var cards=[].slice.call(document.querySelectorAll('#sf .sf-c[data-sxk]')); if(!cards.length) return;

p.items.forEach(function(it){ var c=cards.find(function(x){return x.dataset.sxk===it.k}); var ab=c&&c.querySelector('[data-sxa="add"]'); if(ab) for(var i=0;i<it.q;i++) ab.click(); });

stage=2; return;

}

if(stage===2){ var bar2=document.getElementById('sx-bar'); if(bar2){ bar2.click(); } try{localStorage.removeItem(KEY)}catch(e){} T('رجّعنا سلتك'); clearInterval(t); }

},400);

}

sb.auth.getSession().then(function(r){ if(!(r&&r.data&&r.data.session)){ showEntry(); startGuest(); } else restore(); }).catch(function(){});

sb.auth.onAuthStateChange(function(ev,ses){

if(ses){ clearEntry(); var nn=document.getElementById('gx-note'); if(nn) nn.remove(); restore(); }

else if(ev==='SIGNED_OUT'){ PH=[]; showEntry(); startGuest(); }

});

}catch(e){}})();
