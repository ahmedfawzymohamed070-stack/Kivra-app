/* Kivra 4ب-1: إضافة منتج للمخزن من الكتالوج */
(function(){
  let SEL=null, RES=[], NEW=false, DONE=false;
  const UU=/^[0-9a-f]{8}-[0-9a-f]{4}-/;
  const rid=r=>r.id??r.catalog_id??r.cid??Object.values(r).find(v=>typeof v==='string'&&UU.test(v));

  function resHtml(){
    if(!DONE) return '';
    if(!RES.length) return '<p class="muted">مفيش نتائج. اضغط «منتج جديد» عشان تضيفه للكتالوج.</p>';
    return RES.map(r=>`<div class="item"><div><b>${esc(r.name)}</b>
    <div class="muted">${esc(r.brand)} ${r.category?'· '+esc(r.category):''}${r.barcode?' · '+esc(r.barcode):''}</div></div>
    <button data-act="cpick" data-id="${esc(rid(r))}">اختيار</button></div>`).join('');
  }
  function boxHtml(){
    if(SEL) return `<div class="loc"><b>${esc(SEL.name)}</b>
    <div class="muted">${esc(SEL.brand)} ${SEL.category?'· '+esc(SEL.category):''}</div></div>
    <div class="grid"><label>السعر العام (ج.م)<input id="cp" type="number" min="0" step="0.01"></label>
    <label>خصمك % من السعر العام<input id="cd" type="number" min="0" max="100" step="0.01" value="0"></label>
    <label>الكمية المتاحة<input id="cs2" type="number" min="0" step="1"></label></div>
    <div class="row"><button data-act="caddw">إضافة لمنتجاتي</button><button class="ghost" data-act="cback">رجوع</button></div>`;
    if(NEW) return `<label>اسم المنتج<input id="nn"></label>
    <div class="grid"><label>الماركة<input id="nb"></label><label>القسم<input id="nc"></label></div>
    <label>الباركود (اختياري)<input id="nx" dir="ltr" inputmode="numeric"></label>
    <div class="row"><button data-act="ccreate">إنشاء المنتج</button><button class="ghost" data-act="cback">رجوع</button></div>`;
    return `<label>ابحث باسم المنتج أو الباركود<input id="cq" placeholder="مثال: كريم ترطيب"></label>
    <div class="row"><button data-act="csearch">بحث</button><button class="ghost" data-act="cnew">منتج جديد</button></div>
    <div id="cres">${resHtml()}</div>`;
  }
  function repaint(){ const b=$('#addbox'); if(b) b.innerHTML=boxHtml(); }

  V.warehouse.mine = async function(m){
    SEL=null; RES=[]; NEW=false; DONE=false;
    m.innerHTML = `<div class="card"><h2>إضافة منتج</h2><div id="addbox">${boxHtml()}</div></div>
    <div class="card"><h2>منتجاتي</h2><div id="mine"></div></div>`;
    await loadMine();
  };

  Object.assign(A,{
    csearch: async()=>{
      const q=$('#cq').value.trim();
      if(q.length<2) throw new Error('اكتب حرفين على الأقل');
      RES = ok(await sb.rpc('search_catalog',{p_q:q})) || [];
      DONE=true; repaint(); $('#cq').value=q;
    },
    cnew: async()=>{ NEW=true; repaint(); },
    cback: async()=>{ SEL=null; NEW=false; repaint(); },
    cpick: async el=>{
      const r=RES.find(x=>String(rid(x))===el.dataset.id);
      if(!r) throw new Error('اختار المنتج تاني');
      SEL={id:rid(r),name:r.name,brand:r.brand,category:r.category}; repaint();
    },
    ccreate: async()=>{
      const name=$('#nn').value.trim(), brand=$('#nb').value.trim(), cat=$('#nc').value.trim(), bc=$('#nx').value.trim();
      if(!name) throw new Error('اكتب اسم المنتج');
      const id=ok(await sb.rpc('add_catalog_product',{p_name:name,p_brand:brand,p_category:cat,p_barcode:bc||null,p_image:null}));
      SEL={id,name,brand,category:cat}; NEW=false;
      toast('تم إنشاء المنتج في الكتالوج، كمّل السعر والكمية'); repaint();
    },
    caddw: async()=>{
      const pp=parseFloat($('#cp').value), pd=parseFloat($('#cd').value||'0'), ps=parseInt($('#cs2').value,10);
      if(!(pp>=0)) throw new Error('السعر غير صحيح');
      if(!(pd>=0&&pd<=100)) throw new Error('الخصم لازم يكون بين 0 و 100');
      if(!(ps>=0)) throw new Error('الكمية غير صحيحة');
      ok(await sb.rpc('add_warehouse_product',{p_catalog:SEL.id,p_price:pp,p_discount:pd,p_stock:ps}));
      toast('تمت إضافة المنتج'); await show('mine');
    }
  });
})();
