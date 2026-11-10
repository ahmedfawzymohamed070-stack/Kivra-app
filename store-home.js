/* Kivra: الصفحة الرئيسية للعميل (قايمة الصيدليات بشكل كروت كبيرة). بترجع للقديم لو حصل خطأ */
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
  `;
  document.head.appendChild(st);

  const logo=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('logos').getPublicUrl(p).data.publicUrl;
  const cover=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;

  function card(p){
    const nm=String(p.store_name||'').trim(), u=p.cover_path?cover(p.cover_path):logo(p.logo_path);
    const r=Number(p.rating), rc=Number(p.rating_count);
    return `<div class="sh-card" data-act="cshop" data-id="${esc(p.id)}"><div class="sh-cv">
    ${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=in>${esc(nm.charAt(0))}</div>'">`:`<div class="in">${esc(nm.charAt(0)||'؟')}</div>`}
    <span class="sh-bd">${p.delivery_time?esc(p.delivery_time):p.products_count+' منتج'}</span></div>
    <div class="sh-in"><div class="sh-rt"><div class="sh-nm">${esc(nm)}</div>${r>0?`<div class="sh-st">★ ${r.toFixed(1)}${rc>0?' ('+rc+')':''}</div>`:''}</div>
    <div class="muted">${esc(p.city||p.address||'')}</div>
    <div class="sh-tg">${p.products_count} منتج متاح</div></div></div>`;
  }

  async function home(m){
    const list=ok(await sb.rpc('store_list_pharmacies'))||[];
    const S={q:'',top:false};
    m.innerHTML=`<div class="sh-hero"><b>Kivra</b><input id="sh-q" type="search" placeholder="ابحث عن صيدلية"></div>
    <div class="sh-loc" data-act="tab" data-t="acc"><span style="font-size:24px">📍</span><div><small>التوصيل إلى</small><b>${esc((ME&&ME.address)||'حدد عنوانك من حسابي')}</b></div></div>
    <div class="sh-h">الصيدليات</div>
    <div class="sh-tiles"><button type="button" class="sh-tile on" data-sh="all"><u>🏪</u>كل الصيدليات</button>
    <button type="button" class="sh-tile" data-sh="top"><u>📦</u>الأكثر منتجات</button></div><div id="sh-l"></div>`;
    function draw(){
      let l=list.filter(p=>[p.store_name,p.address,p.city].join(' ').toLowerCase().includes(S.q));
      if(S.top) l=l.slice().sort((a,b)=>Number(b.products_count)-Number(a.products_count));
      $('#sh-l').innerHTML=l.length?l.map(card).join(''):'<p class="muted">لا توجد صيدليات متاحة دلوقتي.</p>';
    }
    draw();
    $('#sh-q').oninput=e=>{S.q=e.target.value.trim().toLowerCase();draw()};
    m.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{
      S.top=b.dataset.sh==='top';
      m.querySelectorAll('.sh-tile').forEach(x=>x.classList.toggle('on',x===b)); draw();
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
