/* Kivra 4ب-4: تبويب الكتالوج للأدمن (تغيير الصور وإخفاء/إظهار المنتجات) */
(function(){
  TABS.admin.push(['cat','🗂️','الكتالوج']);
  let LIST=[], TGT=null;

  const url=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  const img=r=>r.image_path??r.image??'';
  const hid=r=>!!(r.hidden??r.hidden_by_admin);

  async function shrink(f){
    const bm=await createImageBitmap(f), s=Math.min(1,800/Math.max(bm.width,bm.height));
    const c=document.createElement('canvas');
    c.width=Math.round(bm.width*s); c.height=Math.round(bm.height*s);
    c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(r,'image/jpeg',0.8));
  }

  function draw(){
    const q=(($('#aq')||{}).value||'').trim().toLowerCase();
    const l=LIST.filter(r=>[r.name,r.brand,r.category,r.barcode].join(' ').toLowerCase().includes(q));
    $('#acnt').textContent=l.length+' منتج';
    $('#alist').innerHTML=l.length?l.map(r=>{
      const u=url(img(r)), h=hid(r);
      return `<div class="pc"><div class="pi">${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=ph>🧴</div>'">`:'<div class="ph">🧴</div>'}</div>
      <div class="pb"><div class="pn">${esc(r.name)}</div>
      <div class="muted">${esc(r.brand)} ${r.category?'· '+esc(r.category):''}${r.barcode?' · '+esc(r.barcode):''}</div>
      ${h?'<span class="badge rejected">مخفي</span>':''}
      <div class="row"><button class="ghost" data-act="cimg" data-id="${esc(r.id)}">📷 الصورة</button>
      <button class="${h?'':'red'}" data-act="chide" data-id="${esc(r.id)}">${h?'إظهار':'إخفاء'}</button></div></div></div>`;
    }).join(''):'<p class="muted">لا توجد منتجات.</p>';
  }

  async function setImg(f){
    if(!f||!TGT) return;
    if(f.size>15*1024*1024) throw new Error('الصورة كبيرة جداً');
    toast('جاري رفع الصورة...');
    const blob=await shrink(f);
    const path=ME.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
    ok(await sb.storage.from('product-images').upload(path,blob,{contentType:'image/jpeg'}));
    ok(await sb.rpc('set_catalog_image',{p_cid:TGT,p_image:path}));
    toast('تم تغيير الصورة'); await show('cat');
  }

  V.admin.cat=async function(m){
    LIST=ok(await sb.from('catalog_products').select('*').order('name').limit(300));
    m.innerHTML=`<div class="card"><h2>الكتالوج</h2>
    <input id="aq" placeholder="ابحث بالاسم أو الماركة أو الباركود">
    <div class="muted" id="acnt" style="margin-top:6px"></div>
    <input id="cf" type="file" accept="image/*" hidden></div><div id="alist"></div>`;
    $('#aq').oninput=draw;
    $('#cf').onchange=e=>run(()=>setImg(e.target.files[0]));
    draw();
  };

  Object.assign(A,{
    cimg: async el=>{ TGT=el.dataset.id; const f=$('#cf'); f.value=''; f.click(); },
    chide: async el=>{
      const r=LIST.find(x=>String(x.id)===el.dataset.id), h=hid(r);
      ok(await sb.rpc('set_catalog_hidden',{p_cid:el.dataset.id,p_hide:!h}));
      toast(h?'تم إظهار المنتج':'تم إخفاء المنتج'); await show('cat');
    }
  });
})();
