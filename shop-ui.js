/* Kivra 4ب-2: شكل قائمة المنتجات عند الصيدلية */
(function(){
  let CF='', FO=false, SO='name', OPEN=new Set(), FAV=new Set();
  try{FAV=new Set(JSON.parse(localStorage.getItem('kv_fav')||'[]'))}catch(e){}
  const saveFav=()=>{try{localStorage.setItem('kv_fav',JSON.stringify([...FAV]))}catch(e){}};

  const st=document.createElement('style');
  st.textContent=`
  .chips{display:flex;gap:6px;overflow-x:auto;padding:8px 0;margin:4px 0}
  .chip{background:var(--soft);color:var(--p);border-radius:99px;padding:6px 14px;font-size:13px;white-space:nowrap}
  .chip.on{background:linear-gradient(135deg,var(--p),var(--p2));color:#fff}
  .pc{display:flex;gap:12px;background:#fff;border:1px solid var(--bd);border-radius:18px;padding:12px;margin-bottom:12px;box-shadow:0 2px 12px rgba(166,61,158,.07)}
  .pi{width:96px;height:96px;flex:none;border-radius:14px;background:var(--soft);overflow:hidden;display:flex;align-items:center;justify-content:center}
  .pi img{width:100%;height:100%;object-fit:contain;background:#fff}
  .ph{font-size:36px}
  .pb{flex:1;min-width:0}
  .pn{font-weight:700;line-height:1.35}
  .pc .row{margin-top:8px}
  .pc .row button{padding:8px 12px;font-size:14px}
  .fv.on{color:#e0589a}
  #cat{padding-bottom:70px}
  #cbar{position:fixed;left:0;right:0;bottom:calc(62px + env(safe-area-inset-bottom));z-index:6;display:flex;justify-content:space-between;align-items:center;gap:10px;background:#fff;border-top:1px solid var(--bd);padding:8px 16px;box-shadow:0 -4px 14px rgba(166,61,158,.12)}
  .okm{color:#0a5a41;font-size:13px}
  #toast{bottom:calc(140px + env(safe-area-inset-bottom))!important}`;
  document.head.appendChild(st);

  const imgUrl=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;
  const cheap=(a,b)=>((a.price==null)-(b.price==null))||(Number(a.price)-Number(b.price));

  function groups(){
    const q=(($('#q')||{}).value||'').trim().toLowerCase(), g={};
    OFF.filter(o=>(!WHF||o.warehouse_id===WHF)&&(!CF||o.category===CF)&&(!FO||FAV.has(o.group_key))&&
      [o.name,o.brand,o.category,o.warehouse_name].join(' ').toLowerCase().includes(q))
      .forEach(o=>{(g[o.group_key]=g[o.group_key]||{k:o.group_key,n:o.name,b:o.brand,c:o.category,l:[]}).l.push(o)});
    const gs=Object.values(g);
    gs.forEach(x=>x.l.sort(cheap));
    gs.sort(SO==='price'?(a,b)=>cheap(a.l[0],b.l[0]):(a,b)=>String(a.n).localeCompare(String(b.n),'ar'));
    return gs;
  }
  function card(x){
    const o=x.l[0], im=x.l.find(r=>r.image||r.image_path)||{}, u=imgUrl(im.image||im.image_path), k=esc(x.k), f=FAV.has(x.k);
    return `<div class="pc"><div class="pi">${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=ph>🧴</div>'">`:'<div class="ph">🧴</div>'}</div>
    <div class="pb"><div class="pn">${esc(x.n)}</div><div class="muted">${esc(x.b)} ${x.c?'· '+esc(x.c):''}</div>
    <div>${o.price==null?'<span class="lock">🔒 بعد التفعيل</span>':`<span class="muted">يبدأ من</span> <span class="price">${money(o.price)}</span>`}</div>
    <div class="row"><button class="ghost" data-act="sptog" data-k="${k}">🏪 الموزعين (${x.l.length})</button>
    <button class="ghost fv${f?' on':''}" data-act="spfav" data-k="${k}">${f?'♥':'♡'}</button>
    <button data-act="spadd" data-k="${k}">إضافة</button></div>
    ${OPEN.has(x.k)?x.l.map((r,i)=>`<div class="offer"><div>${esc(r.warehouse_name)}${i===0&&r.price!=null&&x.l.length>1?' <span class="badge approved">الأقل سعراً</span>':''}
    <div class="muted">المتاح: ${r.stock}</div></div>
    <div>${r.price==null?'<span class="lock">🔒</span>':`<div class="price">${money(r.price)}</div>
    ${r.stock>0?`<div class="row"><input id="q-${esc(r.id)}" type="number" min="1" max="${r.stock}" value="1" style="width:64px;margin:0"><button data-act="addc" data-id="${esc(r.id)}">+ سلة</button></div>`:'<span class="muted">نفدت الكمية</span>'}`}</div></div>`).join(''):''}
    </div></div>`;
  }
  function chips(){
    const cs=[...new Set(OFF.map(o=>o.category).filter(Boolean))].sort();
    $('#chips').innerHTML=['',...cs].map(c=>`<button class="chip${CF===c?' on':''}" data-act="spcat" data-c="${esc(c)}">${c?esc(c):'الكل'}</button>`).join('')
      +`<button class="chip${FO?' on':''}" data-act="spfo">♥ المفضلة</button>`;
  }
  function draw(){
    const gs=groups();
    $('#cnt').textContent=gs.length+' نتيجة';
    $('#cat').innerHTML=gs.length?gs.map(card).join(''):'<p class="muted">لا توجد منتجات.</p>';
  }

  V.pharmacy.prod=async function(m){
    CF=''; FO=false; SO='name';
    OFF=ok(await sb.rpc('get_offers'));
    if(!WH.length) WH=ok(await sb.rpc('list_warehouses'));
    m.innerHTML=`<div class="card"><h2>المنتجات</h2>
    ${ME.status!=='approved'?'<p class="lock">🔒 الأسعار والطلب بعد تفعيل حسابك.</p>':''}
    ${WHF?`<div class="row" style="margin-bottom:8px"><span class="badge">المخزن: ${esc(whName(WHF))}</span><button class="ghost" data-act="whclear">كل المخازن</button></div>`:''}
    <input id="q" placeholder="ابحث باسم المنتج أو الماركة أو المخزن"><div class="chips" id="chips"></div>
    <div class="row" style="justify-content:space-between"><span class="muted" id="cnt"></span>
    <select id="so" style="width:auto;margin:0"><option value="name">ترتيب: الاسم</option><option value="price">ترتيب: الأقل سعراً</option></select></div></div><div id="cat"></div>`;
    $('#q').oninput=draw; $('#so').onchange=e=>{SO=e.target.value;draw()};
    chips(); draw();
  };

  Object.assign(A,{
    sptog: async el=>{const k=el.dataset.k; OPEN.has(k)?OPEN.delete(k):OPEN.add(k); draw()},
    spfav: async el=>{const k=el.dataset.k; FAV.has(k)?FAV.delete(k):FAV.add(k); saveFav(); draw()},
    spcat: async el=>{CF=el.dataset.c; chips(); draw()},
    spfo: async()=>{FO=!FO; chips(); draw()},
    spadd: async el=>{
      const all=OFF.filter(o=>o.group_key===el.dataset.k&&(!WHF||o.warehouse_id===WHF));
      if(all.some(o=>o.price==null)) throw new Error('الطلب بعد تفعيل حسابك');
      const o=all.filter(r=>r.stock>0).sort(cheap)[0];
      if(!o) throw new Error('نفدت الكمية');
      const cur=(CART[o.id]?CART[o.id].q:0)+1;
      if(cur>o.stock) throw new Error('الكمية المتاحة '+o.stock+' فقط');
      CART[o.id]={name:o.name,price:Number(o.price),wh:o.warehouse_name,whid:o.warehouse_id,q:cur};
      paintNav(); toast('تمت الإضافة من '+o.warehouse_name);
    }
  });

  /* شريط الإجمالي والحد الأدنى */
  const bar=document.createElement('div'); bar.id='cbar'; bar.hidden=true; document.body.appendChild(bar);
  function paintBar(){
    const e=Object.values(CART);
    if(!(ME&&ME.role==='pharmacy'&&TAB==='prod'&&e.length)){bar.hidden=true;return}
    const s={}; e.forEach(v=>{s[v.whid]=(s[v.whid]||0)+v.price*v.q});
    let tot=0, msg='';
    Object.entries(s).forEach(([wid,t])=>{
      tot+=t; const w=WH.find(x=>x.id===wid), min=Number(w?w.min_order:0);
      if(!msg&&min>0&&t<min) msg='أضف '+money(min-t)+' لتكمّل الحد الأدنى لطلب '+w.business_name;
    });
    bar.innerHTML=`<div><b>الإجمالي: ${money(tot)}</b><div class="${msg?'lock':'okm'}">${msg||'✓ جاهز للإرسال'}</div></div>
    <button data-act="tab" data-t="cart">السلة (${e.length})</button>`;
    bar.hidden=false;
  }
  const _pn=paintNav; paintNav=function(){_pn(); paintBar()};
})();
