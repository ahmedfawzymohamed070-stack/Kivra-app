/* Kivra: مميزات المتجر الاحترافية
   - الصيدلية: صورة غلاف ولوجو وبيانات توصيل وبانرات ورابط مشاركة (جوه "🛍️ متجري")
   - العميل: غلاف المتجر + بانرات الصيدلية + تفاصيل المنتج + سلة وإرسال الطلب واتساب
   بترجع للقديم لو حصل خطأ */
(function(){
  const SPID=new URLSearchParams(location.search).get('store')||'';
  let SPDONE=false;

  const st=document.createElement('style');
  st.textContent=`
  .sx-pg{height:8px;background:#e3ecea;border-radius:99px;overflow:hidden;margin:8px 0 4px}
  .sx-pg i{display:block;height:100%;background:linear-gradient(90deg,#1F6F6B,#E3A857);border-radius:99px}
  .sx-cvp{position:relative;height:120px;margin:10px 0 44px;border-radius:14px;background:#e6efee center/cover no-repeat;display:flex;align-items:center;justify-content:center}
  .sx-lgp{position:absolute;bottom:-34px;right:14px;width:68px;height:68px;border-radius:16px;border:3px solid #fff;background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#1F6F6B;box-shadow:0 2px 8px rgba(0,0,0,.15)}
  .sx-lgp img{width:100%;height:100%;object-fit:cover}
  .sx-up{display:inline-block;padding:10px 14px;border-radius:12px;background:var(--soft);color:var(--p);font-size:14px;cursor:pointer}
  .sx-tg{display:flex;gap:8px;align-items:center;margin:10px 0!important}
  .sx-tg input{width:auto!important;margin:0!important}
  .sx-bi{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #eef3f2}
  .sx-bi img{width:96px;height:48px;object-fit:cover;border-radius:8px;background:#eceeee}
  .sx-bi div{flex:1;min-width:0}
  .sx-lnk{direction:ltr;word-break:break-all;background:var(--soft);border-radius:10px;padding:8px 10px;font-size:12px;margin:6px 0}
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
  .sx-s{flex:0 0 100%;scroll-snap-align:start;height:150px;border-radius:16px;overflow:hidden;position:relative;background:#e6efee;cursor:pointer}
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
  .sx-sum div{display:flex;justify-content:space-between;padding:3px 0}
  `;
  document.head.appendChild(st);

  const num=v=>{const n=Number(v);return isFinite(n)?n:0};
  const waNum=p=>{let d=String(p||'').replace(/\D/g,''); if(d.startsWith('00')) d=d.slice(2); else if(d.startsWith('0')) d='20'+d.slice(1); return d};
  const imgUrl=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  function disc(x){
    const o=num(x.old_price), p=num(x.price);
    if(!(o>p)) return {off:0,old:0,ltd:false};
    if(x.sale_ends && new Date(x.sale_ends)<=new Date()) return {off:0,old:0,ltd:false};
    return {off:Math.round((1-p/o)*100),old:o,ltd:!!x.sale_ends};
  }
  function compress(file,max,q){
    return new Promise((res,rej)=>{
      const img=new Image(), u=URL.createObjectURL(file);
      img.onload=()=>{
        let w=img.width,h=img.height; const k=Math.min(1,max/Math.max(w,h)); w=Math.round(w*k); h=Math.round(h*k);
        const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
        URL.revokeObjectURL(u); c.toBlob(b=>b?res(b):rej(new Error('تعذر معالجة الصورة')),'image/jpeg',q);
      };
      img.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('الملف مش صورة صالحة'))};
      img.src=u;
    });
  }
  async function upload(file,kind,max){
    const b=await compress(file,max,.82), path=`${ME.id}/${kind}-${Date.now()}.jpg`;
    ok(await sb.storage.from('store-media').upload(path,b,{contentType:'image/jpeg'}));
    return sb.storage.from('store-media').getPublicUrl(path).data.publicUrl;
  }

  /* ================= جزء الصيدلية ================= */
  let PS=null, PB=[], PLOAD=false, PFAIL=false;
  const PDEF={tagline:'',delivery_time:'',delivery_fee:0,free_over:'',min_order:0,hours:'',is_open:true,pickup:true,logo_url:'',cover_url:'',bn_title:'',bn_brand:''};

  async function loadP(){
    if(PLOAD||PS||PFAIL) return; PLOAD=true;
    try{
      const p=ok(await sb.rpc('store_get_my_profile'))||{};
      PS=Object.assign({},PDEF,p); PB=ok(await sb.rpc('store_my_banners'))||[];
    }catch(e){ PS=null; PFAIL=true; toast('بيانات المتجر مش متاحة دلوقتي (تأكد إن SQL اتنفّذ)'); }
    PLOAD=false; paintP();
  }
  function pHtml(){
    const s=PS, ck=[s.logo_url,s.cover_url,s.tagline,s.delivery_time,s.hours,PB.length?1:''];
    const pct=Math.round(ck.filter(Boolean).length/ck.length*100);
    return `<div class="card" id="sx-card"><h2>🏬 بيانات متجرك للعملاء</h2>
    <div class="sx-pg"><i style="width:${pct}%"></i></div>
    <div class="muted">اكتمال المتجر ${pct}%${pct<100?' — كمّل الناقص عشان المتجر يبان احترافي':' ✓'}</div>
    <div class="sx-cvp" style="${s.cover_url?`background-image:url('${esc(s.cover_url)}')`:''}">${s.cover_url?'':'<span class="muted">مفيش صورة غلاف</span>'}
    <div class="sx-lgp">${s.logo_url?`<img src="${esc(s.logo_url)}" alt="">`:esc((ME.business_name||'?').trim().charAt(0))}</div></div>
    <div class="row"><label class="sx-up">📷 صورة الغلاف<input type="file" accept="image/*" data-sxf="cover" hidden></label>
    <label class="sx-up">🖼️ لوجو الصيدلية<input type="file" accept="image/*" data-sxf="logo" hidden></label></div>
    <label>وصف قصير<input data-sxk="tagline" maxlength="120" placeholder="مثال: صيدلية وعناية بالبشرة والشعر" value="${esc(s.tagline)}"></label>
    <div class="grid"><label>وقت التوصيل<input data-sxk="delivery_time" maxlength="40" placeholder="30-45 دقيقة" value="${esc(s.delivery_time)}"></label>
    <label>مواعيد العمل<input data-sxk="hours" maxlength="60" placeholder="يومياً 9 ص - 12 م" value="${esc(s.hours)}"></label>
    <label>رسوم التوصيل (ج.م)<input data-sxk="delivery_fee" type="number" min="0" step="0.5" value="${esc(s.delivery_fee)}"></label>
    <label>توصيل مجاني فوق (ج.م)<input data-sxk="free_over" type="number" min="0" step="1" placeholder="اختياري" value="${esc(s.free_over)}"></label>
    <label>أقل قيمة للطلب (ج.م)<input data-sxk="min_order" type="number" min="0" step="1" value="${esc(s.min_order)}"></label></div>
    <label class="sx-tg"><input type="checkbox" data-sxk="is_open" ${s.is_open?'checked':''}> المتجر مفتوح دلوقتي</label>
    <label class="sx-tg"><input type="checkbox" data-sxk="pickup" ${s.pickup?'checked':''}> الاستلام من الصيدلية متاح</label>
    <button type="button" data-sxa="save">حفظ بيانات المتجر</button>
    <h2 style="margin-top:18px">🔗 رابط متجرك</h2>
    <div class="muted">ابعته لعملائك أو حطه على واتساب وانستجرام، ويفتح متجرك علطول.</div>
    <div class="sx-lnk">${esc(location.origin+'/?store='+ME.id)}</div>
    <div class="row"><button type="button" class="ghost" data-sxa="copy">نسخ الرابط</button><button type="button" class="ghost" data-sxa="wa">مشاركة على واتساب</button></div>
    <h2 style="margin-top:18px">🖼️ بانرات متجرك (${PB.length}/5)</h2>
    ${PB.map(b=>`<div class="sx-bi"><img src="${esc(b.image_url)}" alt=""><div><b>${esc(b.title||'بدون عنوان')}</b><div class="muted">${b.brand?'ماركة: '+esc(b.brand):''}</div></div><button type="button" class="red" data-sxa="delb" data-id="${esc(b.id)}">حذف</button></div>`).join('')}
    ${PB.length<5?`<label>عنوان البانر (اختياري)<input data-sxk="bn_title" maxlength="60" value="${esc(s.bn_title)}"></label>
    <label>اسم ماركة يفتحها البانر (اختياري)<input data-sxk="bn_brand" maxlength="60" value="${esc(s.bn_brand)}"></label>
    <label class="sx-up">➕ اختيار صورة البانر وإضافته<input type="file" accept="image/*" data-sxf="banner" hidden></label>`:'<p class="muted">وصلت للحد الأقصى، احذف بانر لو عاوز تضيف.</p>'}
    </div>`;
  }
  function paintP(){
    const ab=document.querySelector('#stp .ab');
    if(!ab){ PFAIL=false; return; }
    if(document.getElementById('sx-card')) return;
    if(!PS){ if(!PLOAD&&!PFAIL) loadP(); return; }
    ab.insertAdjacentHTML('afterbegin',pHtml());
  }
  function refreshP(){ const c=document.getElementById('sx-card'); if(c) c.remove(); paintP(); }
  async function saveP(){
    const s=PS, fee=parseFloat(s.delivery_fee||0), mo=parseFloat(s.min_order||0);
    const fo=(s.free_over===''||s.free_over==null)?null:parseFloat(s.free_over);
    if(!(fee>=0)||!(mo>=0)||(fo!==null&&!(fo>=0))) throw new Error('الأرقام لازم تكون صحيحة');
    ok(await sb.rpc('store_save_my_profile',{p_logo:s.logo_url||'',p_cover:s.cover_url||'',p_tagline:s.tagline||'',p_delivery_time:s.delivery_time||'',
      p_delivery_fee:fee,p_free_over:fo,p_min_order:mo,p_hours:s.hours||'',p_is_open:!!s.is_open,p_pickup:!!s.pickup}));
  }

  document.addEventListener('input',e=>{
    const t=e.target, k=t&&t.dataset&&t.dataset.sxk; if(!k||!PS) return;
    PS[k]=t.type==='checkbox'?t.checked:t.value;
  });
  document.addEventListener('change',e=>{
    const t=e.target, k=t&&t.dataset&&t.dataset.sxk;
    if(k&&PS&&t.type==='checkbox') PS[k]=t.checked;
    const fk=t&&t.dataset&&t.dataset.sxf; if(!fk) return;
    const f=t.files&&t.files[0]; if(!f) return; t.value='';
    run(async()=>{
      if(!/^image\//.test(f.type)) throw new Error('اختار صورة');
      if(f.size>20*1024*1024) throw new Error('الصورة كبيرة قوي');
      toast('جاري رفع الصورة...');
      if(fk==='banner'){
        const u=await upload(f,'banner',1280);
        ok(await sb.rpc('store_add_banner',{p_image:u,p_title:(PS.bn_title||'').trim(),p_brand:(PS.bn_brand||'').trim()}));
        PS.bn_title='';PS.bn_brand=''; PB=ok(await sb.rpc('store_my_banners'))||[]; toast('تمت إضافة البانر');
      } else {
        const u=await upload(f,fk,fk==='cover'?1400:400);
        PS[fk==='cover'?'cover_url':'logo_url']=u; await saveP(); toast('تم رفع الصورة وحفظها');
      }
      refreshP();
    });
  });

  /* ================= جزء العميل ================= */
  let CS=null, MODE='delivery', CN='', DK='', DQ=1;
  const CARTS={};
  const keyOf=x=>String(x.brand||'').trim()+'|'+String(x.name||'').trim();
  const cartOf=()=>CS?(CARTS[CS.id]=CARTS[CS.id]||{}):{};
  const cartCount=()=>CS?Object.values(CARTS[CS.id]||{}).reduce((s,x)=>s+x.q,0):0;
  function totals(){
    const c=cartOf(), p=CS.prof; let sub=0,n=0;
    Object.values(c).forEach(x=>{sub+=num(x.it.price)*x.q;n+=x.q});
    let fee=0;
    if(MODE==='delivery'){ fee=num(p.delivery_fee); const fo=num(p.free_over); if(fo>0&&sub>=fo) fee=0; }
    return {sub,n,fee,tot:sub+fee};
  }
  function addCart(it,q){
    const c=cartOf(), cur=(c[it.id]?c[it.id].q:0)+q, mx=num(it.stock);
    if(cur>mx){ toast('الكمية المتاحة '+mx+' فقط'); }
    c[it.id]={it,q:Math.max(1,Math.min(cur,mx))}; paintBar();
  }

  async function enhance(id){
    const main=document.getElementById('main'), sf=document.getElementById('sf');
    if(!main||!sf||main.querySelector('.sx-hd')) return;
    const [pub,items]=await Promise.all([sb.rpc('store_public_profile',{p_pharmacy:id}),sb.rpc('store_view',{p_pharmacy:id})]);
    let prof={}, banners=[], cfg=false;
    if(!pub.error&&pub.data){ prof=pub.data.profile||{}; banners=pub.data.banners||[]; cfg=!!pub.data.configured; }
    const list=(items.error?[]:items.data)||[], map={};
    list.forEach(x=>{ if(!map[keyOf(x)]) map[keyOf(x)]=x; });
    const card0=main.querySelector('.card'), tel=main.querySelector('a[href^="tel:"]');
    const phone=tel?tel.getAttribute('href').slice(4):'';
    const name=((main.querySelector('h2')||{}).textContent||'').trim();
    const addr=((card0&&card0.querySelector('.muted'))||{}).textContent||'';
    CS={id,name,phone,prof:Object.assign({},prof,{_cfg:cfg}),map}; MODE=(prof.pickup===false)?'delivery':MODE;
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
    if(banners.length){
      sf.insertAdjacentHTML('afterbegin',`<div class="sx-bn" id="sx-bn">${banners.map(b=>`<div class="sx-s" data-sxb="${esc(b.brand||'')}"><img loading="lazy" src="${esc(b.image_url)}" alt="">${b.title?`<span>${esc(b.title)}</span>`:''}</div>`).join('')}</div>
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
  function sheet(html){
    closeSheet();
    const d=document.createElement('div'); d.id='sx-sheet';
    d.innerHTML=`<div class="sx-p">${html}</div>`;
    d.addEventListener('click',e=>{ if(e.target===d) closeSheet(); });
    document.body.appendChild(d);
  }
  function closeSheet(){ const d=document.getElementById('sx-sheet'); if(d) d.remove(); }

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
    const t=totals(), p=CS.prof, mo=num(p.min_order), low=t.sub<mo, pk=p.pickup!==false;
    sheet(`<button type="button" class="sx-x" data-sxa="close">✕</button><h2>🛒 سلتك من ${esc(CS.name)}</h2>
    ${c.map(x=>`<div class="sx-ci"><div style="flex:1;min-width:0"><b>${esc(x.it.name)}</b><div class="muted">${money(x.it.price)}</div></div
