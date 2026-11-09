/* Kivra: شاشة العميل (تسجيل عميل + تصفح متاجر الصيدليات + اتصال/واتساب) */
(function(){
  TABS.customer=[['shops','🏪','الصيدليات'],['acc','👤','حسابي']];
  ROLE.customer='عميل';
  let PH=[], CUR=null, ITEMS=[];

  const url=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  const wa=p=>{ let d=String(p||'').replace(/\D/g,''); if(d.startsWith('00')) d=d.slice(2); else if(d.startsWith('0')) d='20'+d.slice(1); return d; };
  const thumb=p=>{const u=url(p);return `<div class="pi">${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=ph>🧴</div>'">`:'<div class="ph">🧴</div>'}</div>`};

  // خيار "عميل" في شاشة إنشاء الحساب
  function opt(){
    const r=document.getElementById('role');
    if(r&&!r.querySelector('option[value="customer"]')) r.insertAdjacentHTML('beforeend','<option value="customer">عميل (مشتري)</option>');
  }
  try{ new MutationObserver(opt).observe(document.body,{childList:true,subtree:true}); }catch(e){}

  function drawShops(){
    const q=(($('#cq')||{}).value||'').trim().toLowerCase();
    const l=PH.filter(p=>[p.store_name,p.address].join(' ').toLowerCase().includes(q));
    $('#cl').innerHTML=l.length?l.map(p=>`<div class="wh"><div class="av">${esc((p.store_name||'?').trim().charAt(0))}</div>
    <div class="in"><b>${esc(p.store_name)}</b><div class="muted">${esc(p.address)}</div>
    <div class="muted">${p.products_count} منتج</div>
    <button class="ghost" style="margin-top:6px" data-act="cshop" data-id="${esc(p.id)}">عرض المتجر</button></div></div>`).join('')
    :'<p class="muted">لا توجد صيدليات متاحة دلوقتي.</p>';
  }
  function drawItems(){
    const q=(($('#ci2')||{}).value||'').trim().toLowerCase();
    const l=ITEMS.filter(x=>[x.name,x.brand,x.category].join(' ').toLowerCase().includes(q));
    $('#ci').innerHTML=l.length?l.map(x=>`<div class="pc">${thumb(x.image_path)}<div class="pb"><div class="pn">${esc(x.name)}</div>
    <div class="muted">${esc(x.brand)} ${x.category?'· '+esc(x.category):''}</div>
    <div><span class="price">${money(x.price)}</span> <span class="muted">· متوفر ${x.stock}</span></div></div></div>`).join('')
    :'<p class="muted">لا توجد منتجات.</p>';
  }

  async function showShops(m){
    CUR=null;
    PH=ok(await sb.rpc('store_list_pharmacies'))||[];
    m.innerHTML=`<div class="card"><h2>صيدليات متاحة</h2>
    <input id="cq" placeholder="ابحث باسم الصيدلية أو العنوان"><div id="cl" style="margin-top:8px"></div></div>`;
    $('#cq').oninput=drawShops; drawShops();
  }

  V.customer={
    shops:showShops,
    acc:async m=>{ m.innerHTML=(typeof infoCard==='function'?infoCard():'')+(typeof extraCards==='function'?extraCards():''); }
  };

  Object.assign(A,{
    cshop: async el=>{
      CUR=PH.find(p=>String(p.id)===el.dataset.id); if(!CUR) throw new Error('اختار الصيدلية تاني');
      ITEMS=ok(await sb.rpc('store_view',{p_pharmacy:CUR.id}))||[];
      const ph=String(CUR.phone||'').trim();
      $('#main').innerHTML=`<div class="card"><button type="button" class="ghost" data-act="cback">→ رجوع للصيدليات</button>
      <h2 style="margin-top:10px">${esc(CUR.store_name)}</h2><div class="muted">${esc(CUR.address)}</div>
      ${ph?`<div class="row" style="margin-top:8px"><a href="tel:${esc(ph)}"><button type="button">📞 اتصال</button></a>
      <a href="https://wa.me/${esc(wa(ph))}" target="_blank" rel="noopener"><button type="button" class="ghost">واتساب</button></a></div>`:''}
      <p class="muted">للطلب تواصل مع الصيدلية مباشرة.</p>
      <input id="ci2" placeholder="ابحث في المتجر"></div><div id="ci"></div>`;
      $('#ci2').oninput=drawItems; drawItems(); window.scrollTo(0,0);
    },
    cback: async()=>{ await showShops($('#main')); }
  });
})();
