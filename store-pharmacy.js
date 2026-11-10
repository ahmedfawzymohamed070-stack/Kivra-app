/* Kivra: متجر الصيدلية للعملاء (زرار عايم 🛍️ متجري للصيدلية المفعّلة) + خصم اختياري بتاريخ انتهاء */
(function(){
  let LIST=[], RES=[], SEL=null, EDIT=null, DONE=false;

  const st=document.createElement('style');
  st.textContent=`
  #stfab{position:fixed;right:14px;bottom:calc(140px + env(safe-area-inset-bottom));z-index:40;padding:12px 18px;border-radius:99px;font-size:15px;box-shadow:0 4px 14px rgba(0,0,0,.25)}
  #stp{position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;padding-bottom:40px}
  #stp .ah{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:calc(12px + env(safe-area-inset-top)) 16px 12px;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;font-size:18px}
  #stp .ah button{background:rgba(255,255,255,.2);color:#fff;padding:8px 14px}
  #stp .ab{max-width:760px;margin:0 auto;padding:16px}`;
  document.head.appendChild(st);

  const UU=/^[0-9a-f]{8}-[0-9a-f]{4}-/;
  const rid=r=>r.id??r.catalog_id??r.cid??Object.values(r).find(v=>typeof v==='string'&&UU.test(v));
  const url=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  const thumb=p=>{const u=url(p);return `<div class="pi">${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=ph>🧴</div>'">`:'<div class="ph">🧴</div>'}</div>`};
  const p2=n=>String(n).padStart(2,'0');
  const ymd=d=>{const t=new Date(d);return t.getFullYear()+'-'+p2(t.getMonth()+1)+'-'+p2(t.getDate())};
  const expired=x=>!!(x.old_price!=null&&x.sale_ends&&new Date(x.sale_ends)<=new Date());

  /* بيقرا خانات الخصم (اختيارية) ويرجّع الباراميترز */
  function readDisc(oid,did,price){
    const oRaw=$(oid).value.trim(), dRaw=$(did).value;
    const old=oRaw===''?null:parseFloat(oRaw);
    if(old!==null && !(old>price)) throw new Error('السعر قبل الخصم لازم يكون أكبر من سعر البيع');
    let ends=null;
    if(dRaw){
      if(old===null) throw new Error('اكتب السعر قبل الخصم الأول');
      const e=new Date(dRaw+'T23:59:59');
      if(!(e>new Date())) throw new Error('تاريخ انتهاء الخصم لازم يكون في المستقبل');
      ends=e.toISOString();
    }
    return {p_old_price:old,p_sale_ends:ends};
  }

  function addHtml(){
    if(SEL) return `<div class="loc"><b>${esc(SEL.name)}</b><div class="muted">${esc(SEL.brand)} ${SEL.category?'· '+esc(SEL.category):''}</div></div>
    <div class="grid"><label>سعر البيع للعميل (ج.م)<input id="sp" type="number" min="0" step="0.01"></label>
    <label>الكمية المتاحة<input id="ss" type="number" min="0" step="1"></label>
    <label>السعر قبل الخصم (اختياري)<input id="so" type="number" min="0" step="0.01"></label>
    <label>انتهاء الخصم (اختياري)<input id="sd" type="date"></label></div>
    <div class="muted">لو كتبت سعر قبل الخصم هيظهر للعميل مشطوب مع نسبة الخصم. بعد تاريخ الانتهاء السعر بيرجع للسعر قبل الخصم لوحده.</div>
    <div class="row"><button type="button" data-x="add">إضافة للمتجر</button><button type="button" class="ghost" data-x="back">رجوع</button></div>`;
    return `<label>ابحث في الكتالوج بالاسم أو الباركود<input id="sq"></label>
    <button type="button" data-x="search">بحث</button>
    <div>${DONE?(RES.length?RES.map(r=>`<div class="item"><div><b>${esc(r.name)}</b><div class="muted">${esc(r.brand)} ${r.category?'· '+esc(r.category):''}${r.barcode?' · '+esc(r.barcode):''}</div></div>
    <button type="button" data-x="pick" data-id="${esc(rid(r))}">اختيار</button></div>`).join(''):'<p class="muted">مفيش نتائج. المنتج لازم يكون في الكتالوج.</p>'):''}</div>`;
  }

  function listHtml(){
    if(!LIST.length) return '<p class="muted">لسه مفيش منتجات في متجرك.</p>';
    return LIST.map(x=>{
      const id=esc(x.id), open=EDIT===x.id, ex=expired(x);
      const eff=ex?x.old_price:x.price;
      const has=!ex&&x.old_price!=null&&Number(x.old_price)>Number(x.price);
      const pct=has?Math.round((1-Number(x.price)/Number(x.old_price))*100):0;
      return `<div class="pc">${thumb(x.image_path)}<div class="pb"><div class="pn">${esc(x.name)}</div>
      <div class="muted">${esc(x.brand)} ${x.category?'· '+esc(x.category):''}</div>
      <div><span class="price">${money(eff)}</span> ${has?`<s class="muted">${money(x.old_price)}</s> <span class="badge approved">خصم ${pct}%</span>`:''} <span class="muted">· الكمية ${x.stock}</span> ${x.active?'':'<span class="badge rejected">متوقف</span>'}</div>
      ${has&&x.sale_ends?`<div class="muted">الخصم ينتهي ${fd(x.sale_ends)}</div>`:''}
      ${ex?'<div class="muted">انتهى الخصم، والسعر للعميل رجع للسعر قبل الخصم.</div>':''}
      <div class="row"><button type="button" class="ghost" data-x="edit" data-id="${id}">${open?'إغلاق':'✏️ تعديل'}</button>
      <button type="button" class="red" data-x="del" data-id="${id}">حذف</button></div>
      ${open?`<div class="loc"><div class="grid"><label>السعر<input id="ep" type="number" min="0" step="0.01" value="${esc(has?x.price:eff)}"></label>
      <label>الكمية<input id="es" type="number" min="0" step="1" value="${esc(x.stock)}"></label>
      <label>السعر قبل الخصم (اختياري)<input id="eo" type="number" min="0" step="0.01" value="${has?esc(x.old_price):''}"></label>
      <label>انتهاء الخصم (اختياري)<input id="ed" type="date" value="${has&&x.sale_ends?ymd(x.sale_ends):''}"></label></div>
      <label style="display:flex;gap:8px;align-items:center"><input id="ea" type="checkbox" style="width:auto;margin:0" ${x.active?'checked':''}> ظاهر للعملاء</label>
      <button type="button" data-x="save" data-id="${id}">حفظ</button></div>`:''}</div></div>`;
    }).join('');
  }

  function draw(){
    let p=$('#stp');
    if(!p){
      p=document.createElement('div'); p.id='stp'; document.body.appendChild(p);
      p.addEventListener('click',e=>{ const t=e.target.closest('[data-x]'); if(t) run(()=>act(t)); });
    }
    p.innerHTML=`<div class="ah"><b>🛍️ متجري للعملاء</b><button type="button" data-x="close">✕</button></div><div class="ab">
    <div class="card"><h2>إضافة منتج للمتجر</h2>${addHtml()}</div>
    <div class="card"><h2>منتجات متجري (${LIST.length})</h2>${listHtml()}</div></div>`;
  }

  async function load(){ LIST=ok(await sb.rpc('store_my_products'))||[]; }

  async function act(t){
    const k=t.dataset.x;
    if(k==='close'){ const p=$('#stp'); if(p) p.remove(); return; }
    if(k==='search'){
      const q=$('#sq').value.trim();
      if(q.length<2) throw new Error('اكتب حرفين على الأقل');
      RES=ok(await sb.rpc('search_catalog',{p_q:q}))||[]; DONE=true; draw(); $('#sq').value=q; return;
    }
    if(k==='pick'){
      const r=RES.find(x=>String(rid(x))===t.dataset.id); if(!r) throw new Error('اختار المنتج تاني');
      SEL={id:rid(r),name:r.name,brand:r.brand,category:r.category}; draw(); return;
    }
    if(k==='back'){ SEL=null; draw(); return; }
    if(k==='add'){
      const pp=parseFloat($('#sp').value), ps=parseInt($('#ss').value,10);
      if(!(pp>=0)) throw new Error('السعر غير صحيح');
      if(!(ps>=0)) throw new Error('الكمية غير صحيحة');
      const d=readDisc('#so','#sd',pp);
      ok(await sb.rpc('store_upsert_product',{p_catalog:SEL.id,p_price:pp,p_stock:ps,p_active:true,...d}));
      toast('تمت إضافة المنتج لمتجرك'); SEL=null; RES=[]; DONE=false; await load(); draw(); return;
    }
    if(k==='edit'){ EDIT=EDIT===t.dataset.id?null:t.dataset.id; draw(); return; }
    if(k==='save'){
      const x=LIST.find(r=>r.id===t.dataset.id), pp=parseFloat($('#ep').value), ps=parseInt($('#es').value,10);
      if(!(pp>=0)) throw new Error('السعر غير صحيح');
      if(!(ps>=0)) throw new Error('الكمية غير صحيحة');
      const d=readDisc('#eo','#ed',pp);
      ok(await sb.rpc('store_upsert_product',{p_catalog:x.catalog_id,p_price:pp,p_stock:ps,p_active:$('#ea').checked,...d}));
      toast('تم الحفظ'); EDIT=null; await load(); draw(); return;
    }
    if(k==='del'){
      if(!confirm('حذف المنتج من متجرك؟')) return;
      ok(await sb.rpc('store_delete_product',{p_id:t.dataset.id}));
      await load(); draw();
    }
  }

  async function open(){ SEL=null; RES=[]; DONE=false; EDIT=null; await load(); draw(); }

  function ensure(){
    const f=document.getElementById('stfab');
    if(!ME||ME.role!=='pharmacy'||ME.status!=='approved'||!document.querySelector('header')){ if(f) f.remove(); return; }
    if(f) return;
    const b=document.createElement('button');
    b.id='stfab'; b.type='button'; b.textContent='🛍️ متجري';
    b.onclick=()=>run(open);
    document.body.appendChild(b);
  }
  try{ new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true}); }catch(e){}
  ensure();
})();
