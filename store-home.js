/* Kivra: الصفحة الرئيسية للعميل (كروت الصيدليات) + فلتر الأقرب والأعلى تقييماً. بترجع للقديم لو حصل خطأ */
(function(){
const st=document.createElement('style');
st.textContent=`
.sh-hero{background:linear-gradient(135deg,#1F6F6B,#2A8780);border-radius:18px;padding:16px;color:#fff}
.sh-hero b{display:block;font-size:22px;margin-bottom:10px}
.sh-hero input{margin:0;border:0;border-radius:99px;padding:13px 18px;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.sh-loc{display:flex;gap:10px;align-items:center;background:#fff;border:1px solid #dfe8e7;border-radius:14px;padding:12px 14px;margin:12px 0;cursor:pointer}
.sh-loc small{display:block;color:#7a8785;font-size:12px}
.sh-loc b{font-size:14px;color:#1F6F6B}
.sh-h{font-size:26px;font-weight:800;margin:18px 0 10px;color:#1c2423}
.sh-tiles{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
.sh-tiles::-webkit-scrollbar{display:none}
.sh-tile{flex:0 0 auto;width:92px;text-align:center;font-size:13px;color:#2a3331;background:none;padding:0;cursor:pointer}
.sh-tile u{display:flex;align-items:center;justify-content:center;width:84px;height:84px;margin:0 auto 6px;border-radius:20px;background:#e6efee;font-size:36px;text-decoration:none;border:2px solid transparent}
.sh-tile.on u{border-color:#1F6F6B;background:#d4e6e4}
.sh-card{background:#fff;border:1px solid #dfe8e7;border-radius:18px;overflow:hidden;margin:14px 0;cursor:pointer}
.sh-cv{position:relative;height:170px;background:linear-gradient(135deg,#d4e6e4,#eef5f4);display:flex;align-items:center;justify-content:center;overflow:hidden}
.sh-cv img{width:100%;height:100%;object-fit:contain;background:#fff}
.sh-cv .in{font-size:72px;font-weight:800;color:#1F6F6B;opacity:.85}
.sh-bd{position:absolute;top:10px;left:10px;background:#fff;border-radius:99px;padding:5px 12px;font-size:13px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.15)}
.sh-in{padding:12px 14px}
.sh-rt{display:flex;justify-content:space-between;align-items:center}
.sh-nm{font-size:18px;font-weight:800;color:#1c2423}
.sh-st{color:#c78a2c;font-weight:700;font-size:14px;white-space:nowrap}
.sh-tg{color:#1F6F6B;font-size:14px;margin-top:4px}
.sh-ds{color:#1F6F6B;font-weight:700;font-size:13px;margin-top:4px}
.sh-note{background:#f4f8f7;border-radius:12px;padding:10px 12px;font-size:13px;color:#5b6866;margin:8px 0}
`;
document.head.appendChild(st);
const logo=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('logos').getPublicUrl(p).data.publicUrl;
const cover=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
function km(a,b,c,d){const t=x=>x*Math.PI/180,dl=t(c-a),dg=t(d-b);
const h=Math.sin(dl/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dg/2)**2;return 2*6371*Math.asin(Math.sqrt(h));}
function fmtKm(x){return x<1?Math.round(x*1000)+' م':x.toFixed(1)+' كم';}
function card(p){
const nm=String(p.store_name||'').trim(), u=p.cover_path?cover(p.cover_path):logo(p.logo_path);
const r=Number(p.rating), rc=Number(p.rating_count);
return `<div class="sh-card" data-act="cshop" data-id="${esc(p.id)}"><div class="sh-cv">
${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=in>${esc(nm.charAt(0))}</div>'">`:`<div class="in">${esc(nm.charAt(0)||'؟')}</div>`}
<span class="sh-bd">${p.delivery_time?esc(p.delivery_time):p.products_count+' منتج'}</span></div>
<div class="sh-in"><div class="sh-rt"><div class="sh-nm">${esc(nm)}</div>${r>0?`<div class="sh-st">★ ${r.toFixed(1)}${rc>0?' ('+rc+')':''}</div>`:''}</div>
<div class="muted">${esc(p.city||p.address||'')}</div>
${p._d!=null?`<div class="sh-ds">📍 ${fmtKm(p._d)} منك</div>`:''}
<div class="sh-tg">${p.products_count} منتج متاح</div></div></div>`;
}
async function loadList(){
let r=await sb.rpc('store_list_pharmacies2');
if(!r.error&&Array.isArray(r.data)) return r.data;
return ok(await sb.rpc('store_list_pharmacies'))||[];
}
function getPos(){
return new Promise(res=>{
const my=(ME&&Number(ME.lat)&&Number(ME.lng))?{lat:Number(ME.lat),lng:Number(ME.lng)}:null;
if(!navigator.geolocation) return res(my);
navigator.geolocation.getCurrentPosition(
p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),
()=>res(my),{timeout:8000,maximumAge:600000});
});
}
async function home(m){
const list=await loadList();
const S={q:'',mode:'all',pos:null};
m.innerHTML=`<div class="sh-hero"><b>Kivra</b><input id="sh-q" type="search" placeholder="ابحث عن صيدلية"></div>
<div class="sh-loc" data-act="tab" data-t="acc"><span style="font-size:24px">📍</span><div><small>التوصيل إلى</small><b>${esc((ME&&ME.address)||'حدد عنوانك من حسابي')}</b></div></div>
<div class="sh-h">الصيدليات</div>
<div class="sh-tiles"><button type="button" class="sh-tile on" data-sh="all"><u>🏪</u>كل الصيدليات</button>
<button type="button" class="sh-tile" data-sh="near"><u>📍</u>الأقرب ليا</button>
<button type="button" class="sh-tile" data-sh="rated"><u>⭐</u>الأعلى تقييماً</button>
<button type="button" class="sh-tile" data-sh="top"><u>📦</u>الأكثر منتجات</button></div><div id="sh-l"></div>`;
function draw(){
let l=list.filter(p=>[p.store_name,p.address,p.city].join(' ').toLowerCase().includes(S.q)).map(p=>Object.assign({},p));
let note='';
if(S.mode==='near'&&S.pos){
l.forEach(p=>{const a=Number(p.lat),b=Number(p.lng);p._d=(a&&b)?km(S.pos.lat,S.pos.lng,a,b):null;});
l.sort((x,y)=>(x._d==null)-(y._d==null)||(x._d-y._d));
if(l.some(p=>p._d==null)) note='الصيدليات من غير موقع متسجّل ظاهرة في الآخر.';
}
if(S.mode==='rated'){
l.sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0)||(Number(b.rating_count)||0)-(Number(a.rating_count)||0));
if(!l.some(p=>Number(p.rating)>0)) note='لسه مفيش تقييمات للصيدليات.';
}
if(S.mode==='top') l.sort((a,b)=>Number(b.products_count)-Number(a.products_count));
$('#sh-l').innerHTML=(note?`<div class="sh-note">${note}</div>`:'')+(l.length?l.map(card).join(''):'<p class="muted">لا توجد صيدليات متاحة دلوقتي.</p>');
}
function setOn(b){m.querySelectorAll('.sh-tile').forEach(x=>x.classList.toggle('on',x===b));}
draw();
$('#sh-q').oninput=e=>{S.q=e.target.value.trim().toLowerCase();draw()};
m.querySelectorAll('[data-sh]').forEach(b=>b.onclick=async()=>{
const k=b.dataset.sh;
if(k==='near'){
b.querySelector('u').style.opacity='.5';
S.pos=await getPos();
b.querySelector('u').style.opacity='';
if(!S.pos){
try{toast('مش قادر أحدد موقعك. فعّل الموقع للمتصفح وجرّب تاني')}catch(e){}
return;
}
}
S.mode=k;setOn(b);draw();
});
}
function install(){
if(typeof V==='undefined'||!V.customer||typeof A==='undefined'||!A.cback) return false;
if(V.customer.shops.__sh) return true;
const o1=V.customer.shops, o2=A.cback;
const w1=async m=>{ await o1(m); try{ await home(m); }catch(e){ console.warn('store-home',e); } };
const w2=async()=>{ await o2(); try{ await home($('#main')); }catch(e){ console.warn('store-home',e); } };
w1.__sh=1; V.customer.shops=w1; A.cback=w2; return true;
}
let t=0; const iv=setInterval(()=>{ if(install()||++t>40) clearInterval(iv); },200);
})();
