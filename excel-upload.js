/* Kivra: رفع منتجات المخزن من Excel */
(function(){
  const AR='٠١٢٣٤٥٦٧٨٩';
  const num=v=>parseFloat(String(v).replace(/[٠-٩]/g,d=>AR.indexOf(d)).replace(/[^\d.]/g,''));
  const norm=s=>String(s).toLowerCase().replace(/[\s%_]/g,'');
  const AL={
    name:['الاسم','اسمالمنتج','name','product'],
    brand:['الماركة','brand'],
    category:['القسم','category'],
    barcode:['الباركود','barcode'],
    price:['السعر','السعرالعام','price','publicprice'],
    discount:['الخصم','خصمالمخزن','discount'],
    stock:['الكمية','stock','qty','quantity']
  };
  const pick=(r,al)=>{ const k=Object.keys(r).find(x=>al.includes(norm(x))); return k===undefined?'':r[k]; };
  const rid=r=>r.id??r.catalog_id??r.cid??Object.values(r).find(v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(v));

  function lib(){
    return window.XLSX?Promise.resolve():new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload=res; s.onerror=()=>rej(new Error('تعذر تحميل مكتبة Excel، تأكد من النت'));
      document.head.appendChild(s);
    });
  }

  const _m=V.warehouse.mine;
  V.warehouse.mine=async function(m){
    await _m(m);
    const c=$('#mine').closest('.card');
    c.insertAdjacentHTML('beforebegin',`<div class="card"><h2>رفع منتجات من Excel</h2>
    <p class="muted">الأعمدة: الاسم، الماركة، القسم، الباركود، السعر العام، الخصم، الكمية. اكتب الباركود كنص. أقصى عدد 500 صف.</p>
    <div class="row"><button class="ghost" data-act="xtpl">⬇️ تحميل النموذج</button></div>
    <label>ملف Excel أو CSV<input id="xf" type="file" accept=".xlsx,.xls,.csv"></label>
    <button data-act="xgo">رفع المنتجات</button><div id="xres" class="muted" style="margin-top:8px"></div></div>`);
  };

  const cache={};
  async function catId(name,brand,cat,bc){
    const key=bc||(name+'|'+brand).toLowerCase();
    if(cache[key]) return cache[key];
    const res=ok(await sb.rpc('search_catalog',{p_q:bc||name}))||[];
    const hit=res.find(x=>bc?String(x.barcode||'')===bc
      :String(x.name).trim().toLowerCase()===name.toLowerCase()&&String(x.brand||'').trim().toLowerCase()===brand.toLowerCase());
    let id=hit?rid(hit):null;
    if(!id) id=ok(await sb.rpc('add_catalog_product',{p_name:name,p_brand:brand,p_category:cat,p_barcode:bc||null,p_image:null}));
    return cache[key]=id;
  }

  Object.assign(A,{
    xtpl: async()=>{
      await lib();
      const ws=XLSX.utils.aoa_to_sheet([
        ['الاسم','الماركة','القسم','الباركود','السعر العام','الخصم','الكمية'],
        ['كريم ترطيب 100 مل','Nivea','Skin care','6221234567890',120,35,50]
      ]);
      const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'products');
      XLSX.writeFile(wb,'kivra-products-template.xlsx');
    },
    xgo: async()=>{
      const f=$('#xf').files[0];
      if(!f) throw new Error('اختار ملف Excel الأول');
      await lib();
      const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
      const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false});
      if(!rows.length) throw new Error('الملف فاضي');
      if(rows.length>500) throw new Error('الحد الأقصى 500 صف في المرة');
      const out=$('#xres'); let good=0; const errs=[];
      for(let i=0;i<rows.length;i++){
        out.textContent='جاري المعالجة '+(i+1)+' من '+rows.length+'...';
        const r=rows[i];
        try{
          const name=String(pick(r,AL.name)).trim();
          if(!name){ if(Object.values(r).every(v=>!String(v).trim())) continue; throw new Error('الاسم ناقص'); }
          const price=num(pick(r,AL.price)), dRaw=pick(r,AL.discount), sRaw=pick(r,AL.stock);
          const disc=String(dRaw).trim()===''?0:num(dRaw), stock=String(sRaw).trim()===''?0:Math.round(num(sRaw));
          if(!(price>=0)) throw new Error('السعر غير صحيح');
          if(!(disc>=0&&disc<=100)) throw new Error('الخصم لازم يكون بين 0 و 100');
          if(!(stock>=0)) throw new Error('الكمية غير صحيحة');
          const id=await catId(name,String(pick(r,AL.brand)).trim(),String(pick(r,AL.category)).trim(),String(pick(r,AL.barcode)).trim());
          ok(await sb.rpc('add_warehouse_product',{p_catalog:id,p_price:price,p_discount:disc,p_stock:stock}));
          good++;
        }catch(e){ errs.push('صف '+(i+2)+': '+(e.message||e)); }
      }
      out.innerHTML='تمت إضافة <b>'+good+'</b> منتج'+(errs.length?' · فشل <b>'+errs.length+'</b>':'')
        +(errs.length?'<div class="lock" style="margin-top:6px">'+errs.slice(0,10).map(esc).join('<br>')+(errs.length>10?'<br>...':'')+'</div>':'');
      await loadMine();
    }
  });
})();
