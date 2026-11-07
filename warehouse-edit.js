/* Kivra: تعديل منتجات المخزن (السعر والخصم والكمية والصورة) */
(function(){
  let LIST=[], CM={}, OPENID=null, TGT=null;

  const url=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;

  async function shrink(f){
    const bm=await createImageBitmap(f), s=Math.min(1,800/Math.max(bm.width,bm.height));
    const c=document.createElement('canvas');
    c.width=Math.round(bm.width*s); c.height=Math.round(bm.height*s);
    c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(r,'image/jpeg',0.8));
  }

  async function loadList(){
    LIST=ok(await sb.from('products').select('*').eq('warehouse_id',ME.id).order('created_at',{ascending:false}))||[];
    const ids=[...new Set(LIST.map(x=>x.catalog_id).filter(Boolean))];
    CM={};
    if(ids.length){
      try{ (ok(await sb.from('catalog_products').select('*').in('id',ids))||[]).forEach(c=>{CM[c.id]=c}); }catch(e){}
    }
  }

  function draw(){
    const el=$('#mine'); if(!el) return;
    el.innerHTML=LIST.length?LIST.map(x=>{
      const c=CM[x.catalog_id]||{}, u=url(c.image_path??c.image??x.image_path), open=OPENID===x.id, id=esc(x.id);
      const net=Number(x.public_price)*(1-Number(x.warehouse_discount_pct)/100);
      return `<div class="pc"><div class="pi">${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=ph>🧴</div>'">`:'<div class="ph">🧴</div>'}</div>
      <div class="pb"><div class="pn">${esc(x.name)}</div>
      <div class="muted">${esc(x.brand)}${x.category?' · '+esc(x.category):''}${c.barcode?' · '+esc(c.barcode):''}</div>
      <div class="muted">سعر عام ${money(x.public_price)} · خصمك ${x.warehouse_discount_pct}% · صافيك ${money(net)}</div>
      <div class="muted">الكمية: ${x.stock}${x.hidden_by_admin?' · <span class="lock">مخفي بواسطة الإدارة</span>':''}</div>
      <div class="row"><button class="ghost" data-act="pedit" data-id="${id}">${open?'إغلاق':'✏️ تعديل'}</button>
      <button class="red" data-act="delp" data-id="${id}">حذف</button></div>
      ${open?`<div class="loc"><div class="grid">
      <label>السعر العام (ج.م)<input id="ep" type="number" min="0" step="0.01" value="${esc(x.public_price)}"></label>
      <label>خصمك %<input id="ed" type="number" min="0" max="100" step="0.01" value="${esc(x.warehouse_discount_pct)}"></label>
      <label>الكمية<input id="es" type="number" min="0" step="1" value="${esc(x.stock)}"></label></div>
      <div class="row"><button data-act="psave" data-id="${id}">حفظ</button><button class="ghost" data-act="pimg" data-id="${id}">📷 تغيير الصورة</button></div></div>`:''}
      </div></div>`;
    }).join(''):'<p class="muted">لسه مفيش منتجات.</p>';
  }

  loadMine=async function(){ await loadList(); draw(); };

  const pf=document.createElement('input');
  pf.type='file'; pf.accept='image/*'; pf.hidden=true; document.body.appendChild(pf);
  pf.onchange=()=>run(async()=>{
    const f=pf.files[0]; pf.value='';
    if(!f||!TGT) return;
    const x=LIST.find(p=>p.id===TGT);
    if(!x||!x.catalog_id) throw new Error('المنتج مش مربوط بالكتالوج');
    if(f.size>15*1024*1024) throw new Error('الصورة كبيرة جداً');
    toast('جاري رفع الصورة...');
    const blob=await shrink(f), path=ME.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
    ok(await sb.storage.from('product-images').upload(path,blob,{contentType:'image/jpeg'}));
    ok(await sb.rpc('set_catalog_image',{p_cid:x.catalog_id,p_image:path}));
    toast('تم تغيير الصورة'); await loadMine();
  });

  Object.assign(A,{
    pedit: async el=>{ OPENID=OPENID===el.dataset.id?null:el.dataset.id; draw(); },
    psave: async el=>{
      const pp=parseFloat($('#ep').value), pd=parseFloat($('#ed').value||'0'), ps=parseInt($('#es').value,10);
      if(!(pp>=0)) throw new Error('السعر غير صحيح');
      if(!(pd>=0&&pd<=100)) throw new Error('الخصم لازم يكون بين 0 و 100');
      if(!(ps>=0)) throw new Error('الكمية غير صحيحة');
      const r=ok(await sb.from('products').update({public_price:pp,warehouse_discount_pct:pd,stock:ps}).eq('id',el.dataset.id).eq('warehouse_id',ME.id).select('id'));
      if(!r||!r.length) throw new Error('لم يتم الحفظ');
      toast('تم حفظ التعديلات'); OPENID=null; await loadMine();
    },
    pimg: async el=>{ TGT=el.dataset.id; pf.click(); }
  });
})();
