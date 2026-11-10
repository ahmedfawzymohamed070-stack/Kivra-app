/* Kivra: متجر العميل الاحترافي (غلاف وبانرات + تفاصيل المنتج + سلة + إرسال الطلب على واتساب) */
(function(){
  const SPID=new URLSearchParams(location.search).get('store')||'';
  let SPDONE=false, LAST='', BUSY=false;
  let CS=null, MODE='delivery', DK='', DQ=1;
  const CARTS={}, CF={n:'',p:'',a:'',t:''};

  const st=document.createElement('style');
  st.textContent=`
  .sx-hd{background:#fff;border:1px solid #dfe8e7;border-radius:18px;overflow:hidden;margin-bottom:12px}
  .sx-cv{height:130px;background:linear-gradient(135deg,#1F6F6B,#2A8780) center/cover no-repeat;position:relative}
  .sx-cv button{position:absolute;top:10px;right:10px;background:rgba(255,255,255,.92);color:#1F6F6B;padding:8px 14px}
  .sx-in{padding:0 14px 14px}
  .sx-lg{width:68px;height:68px;border-radius:16px;border:3px solid #fff;background:#fff;margin-top:-34px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#1F6F6B;box-shadow:0 2px 8px rgba(0,0,0,.15)}
  .sx-lg img{width:100%;height:100%;object-fit:cover}
  .sx-nm{font-size:20px;font-weight:800;margin-top:8px;color:#1c2423}
  .sx-op{display:inline-block;font-size:12px;font-weight:700;padding:2px 10px;border-radius:99px;margin-inline-start:8px;vertical-align:middle}
  .sx-op.y{background:#d8f3e8;color:#0a5a41}.sx-op.n{background:#fde2de;color:#9b2a1d}
  .sx-ch{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
  .sx-ch span{background:#eef5f4;color:#1F6F6B;border-radius:99px;padding:4px 10px;font-size:12px}
  .sx-bn{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;scrollbar-width:none;border-radius:16px}
  .sx-bn::-webkit-scrollbar{display:none}
  .sx-s{flex:0 0 100%;scroll-snap-align:start;height:150px;border-radius:16px;overflow:hidden;position:relative;background:#e6efee}
  .sx-s img{width:100%;height:100%;object-fit:cover}
  .sx-s span{position:absolute;bottom:0;right:0;left:0;padding:22px 14px 10px;color:#fff;font-weight:800;font-size:18px;background:linear-gradient(transparent,rgba(0,0,0,.6))}
  .sx-d{display:flex;justify-content:center;gap:6px;margin:8px 0 4px}
  .sx-d i{width:8px;height:8px;border-radius:50%;background:#cfd8d7}
  .sx-d i.on{background:#2a3331}
  .sf-c{position:relative}
  .sx-add{display:block;width:calc(100% - 20px);margin:8px 10px 0;padding:8px;font-size:13px;border-radius:10px}
  #sx-bar{position:fixed;left:12px;right:12px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:30;padding:14px;font-size:15px;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,.25)}
  #sx-sheet{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:flex-end}
  #sx-sheet .sx-p{background:#fff;width:100%;max-height:88vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px 16px calc(20px + env(safe-area-inset-bottom));max-width:760px;margin:0 auto}
  .sx-x{float:left;background:var(--soft);color:var(--p);padding:6px 12px}
  .sx-big{aspect-ratio:1/1;max-height:300px;background:#eceeee;border-radius:14px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin:10px 0}
  .sx-big img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
  .sx-q{display:flex;gap:10px;align-items:center;justify-content:center;margin:10px 0}
  .sx-q button{width:40px;height:40px;padding:0;font-size:20px}
  .sx-q b{min-width:30px;text-align:center;font-size:18px}
  .sx-ci{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid #eef3f2}
  .sx-ci .sx-q{margin:0}.sx-ci .sx-q button{width:32px;height:32px;font-size:16px}
  .sx-seg{display:flex;gap:8px;margin:10px 0}
  .sx-seg button{flex:1;background:var(--soft);color:var(--p)}
  .sx-seg button.on{background:linear-gradient(135deg,var(--p),var(--p2));color:#fff}
  .sx-sum div{display:flex;justify-content:space-between;padding:3px 0}`;
  document.head.appendChild(st);

  const num=v=>{const n=Number(v);return isFinite(n)?n:0};
  const waNum=p=>{let d=String(p||'').replace(/\D/g,''); if(d.startsWith('00')) d=d.slice(2); else if(d.startsWith('0')) d='20'+d.slice(1); return d};
  const imgUrl=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  const keyOf=x=>String(x.brand||'').trim()+'|'+String(x.name||'').trim();
  const cartOf=()=>CS?(CARTS[CS.id]=CARTS[CS.id]||{}):{};
  const cartCount=()=>CS?Object.values(CARTS[CS.id]||{}).reduce((s,x)=>s+x.q,0):0;
  function disc(x){
    const o=num(x.old_price), p=num(x.price);
    if(!(o>p)) return {off:0,old:0,ltd:false};
    if(x.sale_ends && new Date(x.sale_ends)<=new Date()) return {off:0,old:0,ltd:false};
    return {off:Math.round((1-p/o)*100),old:o,ltd:!!x.sale_ends};
  }
  function totals(){
    const c=cartOf(), p=CS.prof; let sub=0,n=0;
    Object.values(c).forEach(x=>{sub+=num(x.it.price)*x.q;n+=x.q});
    let fee=0;
    if(MODE==='delivery'){ fee=num(p.delivery_fee); const fo=num(p.free_over); if(fo>0&&sub>=fo) fee=0; }
    return {sub,n,fee,tot:sub+fee};
  }
  function addCart(it,q){
    const c=cartOf(), cur=(c[it.id]?c[it.id].q:0)+q, mx=num(it.stock);
    if(cur>mx) toast('الكمية المتاحة '+mx+' فقط');
    c[it.id]={it,q:Math.max(1,Math.min(cur,mx))}; paintBar();
  }

  async function enhance(id){
    const main=document.getElementById('main'), sf=document.getElementById('sf');
    if(!main||!sf||main.querySelector('.sx-hd')) return;
    const [pub,items]=await Promise.all([sb.rpc('store_public_profile',{p_pharmacy:id}),sb.rpc('store_view',{p_pharmacy:id})]);
    if(!document.getElementById('sf')||main.querySelector('.sx-hd')) return;
    let prof={}, banners=[], cfg=false;
    if(!pub.error&&pub.data){ prof=pub.data.profile||{}; banners=pub.data.banners||[]; cfg=!!pub.data.configured; }
    const list=(items.error?[]:items.data)||[], map={};
    list.forEach(x=>{ if(!map[keyOf(x)]) map[keyOf(x)]=x; });
    const card0=main.querySelector('.card'), tel=main.querySelector('a[href^="tel:"]');
    const phone=tel?tel.getAttribute('href').slice(4):'';
    const name=((main.querySelector('h2')||{}).textContent||'').trim();
    const addr=((card0&&card0.querySelector('.muted'))||{}).textContent||'';
    CS={id,name,phone,prof:Object.assign({},prof),map};
    if(prof.pickup===false) MODE='delivery';
    if(typeof ME!=='undefined'&&ME){ CF.n=CF.n||ME.business_name||''; CF.p=CF.p||ME.phone||''; CF.a=CF.a||ME.address||''; }
    const open=prof.is_open!==false, ch=[];
    if(prof.delivery_time) ch.push('⏱ '+prof.delivery_time);
    if(cfg) ch.push('🛵 '+(num(prof.delivery_fee)>0?money(prof.delivery_fee):'توصيل مجاني'));
    if(num(prof.free_over)>0) ch.push('مجاني فوق '+money(prof.free_over));
    if(num(prof.min_order)>0) ch.push('🛒 أقل طلب '+money(prof.min_order));
    if(prof.hours) ch.push('🕘 '+prof.hours);
    const hd=`<div class="sx-hd"><div class="sx-cv" style="${prof.cover_url?`background-image:url('${esc(prof.cover_url)}')`:''}"><button type="button" data-act="cback">→ الصيدليات</button></div>
    <div class="sx-in"><div class="sx-lg">${prof.logo_url?`<img src="${esc(prof.logo_url)}" alt="">`:esc(name.charAt(0)||'؟')}</div>
    <div class="sx-nm">${esc(name)}<span class="sx-op ${open?'y':'n'}">${open?'مفتوح':'مغلق حالياً'}</span></div>
    ${prof.tagline?`<div class="muted">${esc(prof.tagline)}</div>`:''}${addr?`<div class="muted">${esc(addr)}</div>`:''}
    ${ch.length?`<div class="sx-ch">${ch.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
    ${phone?`<div class="row"><a href="tel:${esc(phone)}"><button type="button">📞 اتصال</button></a>
    <a href="https://wa.me/${esc(waNum(phone))}" target="_blank" rel="noopener"><button type="button" class="ghost">واتساب</button></a></div>`:''}</div></div>`;
    if(card0) card0.outerHTML=hd; else main.insertAdjacentHTML('afterbegin',hd);
    const sf2=document.getElementById('sf');
    if(banners.length&&sf2){
      sf2.insertAdjacentHTML('afterbegin',`<div class="sx-bn" id="sx-bn">${banners.map(b=>`<div class="sx-s"><img loading="lazy" src="${esc(b.image_url)}" alt="">${b.title?`<span>${esc(b.title)}</span>`:''}</div>`).join('')}</div>
      <div class="sx-d" id="sx-d">${banners.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>`);
      const bn=document.getElementById('sx-bn'), sl=[...bn.children], dots=[...document.querySelectorAll('#sx-d i')];
      if('IntersectionObserver' in window){
        const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ const i=sl.indexOf(en.target); dots.forEach((d,j)=>d.classList.toggle('on',i===j)); } }),{root:bn,threshold:.6});
        sl.forEach(s=>io.observe(s));
      }
      let n=0; const tm=setInterval(()=>{
        if(!document.body.contains(bn)){ clearInterval(tm); return; }
        if(sl.length<2) return;
        n=(n+1)%sl.length; sl[n].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
      },4500);
    }
    patchCards(); paintBar(); window.scrollTo(0,0);
  }

  function patchCards(){
    const sf=document.getElementById('sf'); if(!sf||!CS) return;
    sf.querySelectorAll('.sf-c:not([data-sxp])').forEach(c=>{
      c.dataset.sxp='1';
      const k=((c.querySelector('.sf-b')||{}).textContent||'').trim()+'|'+((c.querySelector('.sf-n')||{}).textContent||'').trim();
      const it=CS.map[k]; if(!it) return; c.dataset.sxk=k;
      if(num(it.stock)>0) c.insertAdjacentHTML('beforeend','<button type="button" class="sx-add" data-sxa="add">+ أضف للسلة</button>');
    });
  }
  function paintBar(){
    const bar=document.getElementById('sx-bar');
    if(!CS||!document.getElementById('sf')||cartCount()===0){ if(bar) bar.remove(); return; }
    const t=totals(), txt='🛒 '+t.n+' منتج · '+money(t.sub)+' — عرض السلة';
    if(bar){ if(bar.textContent!==txt) bar.textContent=txt; return; }
    const b=document.createElement('button'); b.id='sx-bar'; b.type='button'; b.dataset.sxa='cart'; b.textContent=txt; document.body.appendChild(b);
  }
  function closeSheet(){ const d=document.getElementById('sx-sheet'); if(d) d.remove(); }
  function sheet(html){
    closeSheet();
    const d=document.createElement('div'); d.id='sx-sheet';
    d.innerHTML=`<div class="sx-p">${html}</div>`;
    d.addEventListener('click',e=>{ if(e.target===d) closeSheet(); });
    document.body.appendChild(d);
  }

  function openDetail(k){
    const it=CS&&CS.map[k]; if(!it) return; DK=k; DQ=1;
    const d=disc(it), u=imgUrl(it.image_path);
    sheet(`<button type="button" class="sx-x" data-sxa="close">✕</button>
    <div class="sx-big">${u?`<img src="${esc(u)}" alt="" onerror="this.outerHTML='<div style=font-size:60px>🧴</div>'">`:'<div style="font-size:60px">🧴</div>'}</div>
    <div class="sf-b" style="margin:0">${esc(it.brand||'')}</div><h2 style="color:#1c2423;margin:4px 0">${esc(it.name)}</h2>
    <div class="muted">${esc(it.category||'')}</div>
    ${d.ltd?'<span class="sf-l" style="margin:8px 0 0">عرض لفترة محدودة</span>':''}
    <div class="sf-p" style="margin:8px 0"><b>${money(it.price)}</b>${d.off?`<s>${money(d.old)}</s><span class="sf-o">(${d.off}% خصم)</span>`:''}</div>
    <div class="muted">المتاح: ${esc(it.stock)}</div>
    <div class="sx-q"><button type="button" data-sxa="dq" data-d="-1">−</button><b id="sx-dq">1</b><button type="button" data-sxa="dq" data-d="1">+</button></div>
    <button type="button" style="width:100%" data-sxa="dadd">أضف للسلة</button>`);
  }
  function openCart(){
    if(!CS) return;
    const c=Object.values(cartOf());
    if(!c.length){ closeSheet(); return; }
    const t=totals(), p=CS.prof, mo=num(p.min_order), low=t.sub<mo, pk=p.pickup!==false, dl=MODE==='delivery';
    sheet(`<button type="button" class="sx-x" data-sxa="close">✕</button><h2>🛒 سلتك من ${esc(CS.name)}</h2>
    ${c.map(x=>`<div class="sx-ci"><div style="flex:1;min-width:0"><b>${esc(x.it.name)}</b><div class="muted">${money(x.it.price)}</div></div>
    <div class="sx-q"><button type="button" data-sxa="cq" data-i="${esc(x.it.id)}" data-d="-1">−</button><b>${x.q}</b><button type="button" data-sxa="cq" data-i="${esc(x.it.id)}" data-d="1">+</button></div></div>`).join('')}
    ${pk?`<div class="sx-seg"><button type="button" class="${dl?'on':''}" data-sxa="mode" data-m="delivery">🛵 توصيل</button><button type="button" class="${dl?'':'on'}" data-sxa="mode" data-m="pickup">🏬 استلام من الصيدلية</button></div>`:''}
    <label>اسمك<input data-sxi="n" value="${esc(CF.n)}"></label>
    <label>رقم موبايلك<input data-sxi="p" type="tel" value="${esc(CF.p)}"></label>
    ${dl?`<label>عنوان التوصيل<input data-sxi="a" value="${esc(CF.a)}"></label>`:''}
    <label>ملاحظات (اختياري)<input data-sxi="t" value="${esc(CF.t)}"></label>
    <div class="sx-sum"><div><span>المنتجات</span><span>${money(t.sub)}</span></div>
    ${dl?`<div><span>التوصيل</span><span>${t.fee?money(t.fee):'مجاني'}</span></div>`:''}
    <div><b>الإجمالي</b><b>${money(t.tot)}</b></div></div>
    ${low?`<p class="lock">أقل قيمة للطلب ${money(mo)}، ناقص ${money(mo-t.sub)}</p>`:''}
    <button type="button" style="width:100%" data-sxa="send">إرسال الطلب على واتساب</button>
    <p class="muted">الطلب بيتبعت للصيدلية على واتساب، والدفع والتأكيد معاها مباشرة.</p>`);
  }
  function send(){
    const c=Object.values(cartOf()), t=totals(), p=CS.prof, dl=MODE==='delivery', mo=num(p.min_order);
    if(!c.length) throw new Error('السلة فاضية');
    if(p.is_open===false) throw new Error('المتجر مغلق حالياً');
    if(t.sub<mo) throw new Error('أقل قيمة للطلب '+money(mo));
    if(!CF.n.trim()) throw new Error('اكتب اسمك');
    if(String(CF.p).replace(/\D/g,'').length<8) throw new Error('اكتب رقم موبايل صحيح');
    if(dl&&!CF.a.trim()) throw new Error('اكتب عنوان التوصيل');
    const to=waNum(CS.phone); if(!to) throw new Error('رقم الصيدلية مش متاح');
    const L=['طلب جديد من Kivra 🛒','الصيدلية: '+CS.name,'الاسم: '+CF.n.trim(),'الموبايل: '+CF.p.trim(),dl?'التوصيل إلى: '+CF.a.trim():'استلام من الصيدلية','','المنتجات:'];
    c.forEach(x=>L.push('- '+x.it.name+' × '+x.q+' = '+money(num(x.it.price)*x.q)));
    L.push('','المنتجات: '+money(t.sub)); if(dl) L.push('التوصيل: '+(t.fee?money(t.fee):'مجاني'));
    L.push('الإجمالي: '+money(t.tot)); if(CF.t.trim()) L.push('ملاحظات: '+CF.t.trim());
    window.open('https://wa.me/'+to+'?text='+encodeURIComponent(L.join('\n')),'_blank');
    CARTS[CS.id]={}; closeSheet(); paintBar(); toast('كمّل إرسال الطلب من واتساب');
  }
  function act(a){
    const k=a.dataset.sxa;
    if(k==='close') return closeSheet();
    if(k==='cart') return openCart();
    if(!CS) return;
    if(k==='add'){ const c=a.closest('.sf-c'), it=c&&CS.map[c.dataset.sxk]; if(it){ addCart(it,1); toast('تمت الإضافة للسلة'); } return; }
    if(k==='dq'){ const it=CS.map[DK]; if(!it) return; DQ=Math.max(1,Math.min(num(it.stock),DQ+Number(a.dataset.d))); document.getElementById('sx-dq').textContent=DQ; return; }
    if(k==='dadd'){ const it=CS.map[DK]; if(it){ addCart(it,DQ); closeSheet(); toast('تمت الإضافة للسلة'); } return; }
    if(k==='cq'){
      const c=cartOf(), x=c[a.dataset.i]; if(!x) return;
      const q=x.q+Number(a.dataset.d);
      if(q<=0) delete c[a.dataset.i]; else x.q=Math.min(q,num(x.it.stock));
      paintBar(); openCart(); return;
    }
    if(k==='mode'){ MODE=a.dataset.m; openCart(); return; }
    if(k==='send') return send();
  }

  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-sxa]');
    if(a){ e.preventDefault(); run(async()=>act(a)); return; }
    const c=e.target.closest('#sf .sf-c[data-sxk]');
    if(c&&!e.target.closest('button,a,input')) openDetail(c.dataset.sxk);
  });
  document.addEventListener('input',e=>{
    const k=e.target&&e.target.dataset&&e.target.dataset.sxi; if(k) CF[k]=e.target.value;
  });

  // نمسك رقم الصيدلية من نداء store_view علشان نعرف أنهي متجر مفتوح
  const _rpc=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){ if(n==='store_view'&&a&&a.p_pharmacy) LAST=a.p_pharmacy; return _rpc(n,a,o); };

  function openDeep(){
    if(!SPID||SPDONE||typeof ME==='undefined'||!ME||ME.role!=='customer'||typeof A.cshop!=='function') return;
    if(!document.getElementById('cl')) return;
    SPDONE=true; run(()=>A.cshop({dataset:{id:SPID}}));
  }
  function tick(){
    const sf=document.getElementById('sf');
    if(!sf){ if(CS){ CS=null; closeSheet(); paintBar(); } openDeep(); return; }
    if(CS){ patchCards(); paintBar(); return; }
    if(LAST&&!BUSY&&!document.querySelector('#main .sx-hd')){
      BUSY=true; enhance(LAST).catch(()=>{}).then(()=>{BUSY=false});
    }
  }
  let tm=null;
  try{ new MutationObserver(()=>{ clearTimeout(tm); tm=setTimeout(tick,60); }).observe(document.body,{childList:true,subtree:true}); }catch(e){}
})();
