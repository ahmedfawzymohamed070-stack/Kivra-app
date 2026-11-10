/* Kivra: واجهة متجر الصيدلية للعميل (بانرات + صفوف الماركات + أقسام + فلاتر). بترجع للقديم لو حصل خطأ */
(function(){
  const st=document.createElement('style');
  st.textContent=`
  #sf{margin-top:12px}
  .sf-bn{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;scrollbar-width:none;border-radius:16px}
  .sf-bn::-webkit-scrollbar{display:none}
  .sf-s{flex:0 0 100%;scroll-snap-align:start;min-height:132px;border-radius:16px;padding:18px;display:flex;flex-direction:column;justify-content:center;color:#fff;background:linear-gradient(135deg,#1F6F6B,#2A8780);cursor:pointer}
  .sf-s:nth-child(2){background:linear-gradient(135deg,#B9802F,#E3A857)}
  .sf-s:nth-child(3){background:linear-gradient(135deg,#17504d,#1F6F6B)}
  .sf-s b{font-size:22px;line-height:1.3}
  .sf-s span{opacity:.92;margin-top:6px;font-size:14px}
  .sf-d{display:flex;justify-content:center;gap:6px;margin:8px 0 4px}
  .sf-d i{width:8px;height:8px;border-radius:50%;background:#cfd8d7}
  .sf-d i.on{background:#2a3331}
  .sf-cats{display:flex;gap:12px;overflow-x:auto;padding:10px 2px;scrollbar-width:none}
  .sf-cats::-webkit-scrollbar{display:none}
  .sf-cat{flex:0 0 auto;width:68px;text-align:center;font-size:12px;color:#2a3331;background:none;padding:0;cursor:pointer}
  .sf-cat u{display:flex;align-items:center;justify-content:center;width:56px;height:56px;margin:0 auto 4px;border-radius:50%;background:#e6efee;font-size:26px;text-decoration:none;border:2px solid transparent}
  .sf-cat.on u{border-color:#1F6F6B;background:#d4e6e4}
  .sf-ctl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 4px}
  .sf-ctl input[type=search]{grid-column:1/3}
  .sf-chk{display:flex;gap:8px;align-items:center;margin:0!important}
  .sf-chk input{width:auto!important;margin:0!important}
  .sf-h{font-size:19px;font-weight:800;margin:20px 0 10px;color:#1c2423}
  .sf-h a{font-size:13px;font-weight:600;color:var(--p);float:left;cursor:pointer;margin-top:4px}
  .sf-r{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;padding-bottom:6px;scrollbar-width:none}
  .sf-r::-webkit-scrollbar{display:none}
  .sf-r .sf-c{flex:0 0 150px;scroll-snap-align:start}
  .sf-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .sf-c{background:#fff;border:1px solid #dfe8e7;border-radius:12px;overflow:hidden;padding-bottom:10px;min-width:0}
  .sf-i{aspect-ratio:1/1;background:#eceeee;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .sf-i img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
  .sf-i .ph{font-size:46px}
  .sf-b,.sf-n,.sf-p,.sf-l,.sf-c .muted{margin:6px 10px 0}
  .sf-b{font-weight:800;font-size:14px}
  .sf-n{font-size:13px;color:#4a5654;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em}
  .sf-l{display:inline-block;background:#c0152b;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px}
  .sf-p b{font-size:18px;color:#1c2423}
  .sf-p s{color:#7a8785;font-size:12px;margin-inline-start:6px}
  .sf-p .sf-o{color:#b3261e;font-size:12px;margin-inline-start:6px;font-weight:700}
  .sf-br{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}
  .sf-br::-webkit-scrollbar{display:none}
  .sf-bt{flex:0 0 auto;width:92px;text-align:center;font-size:12px;background:none;color:#2a3331;padding:0;cursor:pointer}
  .sf-bt u{display:flex;align-items:center;justify-content:center;width:84px;height:84px;margin:0 auto 4px;border-radius:16px;background:#eceeee;font-size:30px;font-weight:800;color:#1F6F6B;text-decoration:none}
  `;
  document.head.appendChild(st);

  const ICON={'الشعر':'💇','البشرة':'🧴','الجسم':'🛁','المكياج':'💄','العطور':'🌸','الفم والأسنان':'🦷','الأطفال':'🍼','الرجال':'🧔','أخرى':'✨'};
  const url=p=>!p?'':/^https?:/.test(p)?p:sb.storage.from('product-images').getPublicUrl(p).data.publicUrl;

  /* خصم اختياري: لو المنتج فيه old_price أكبر من price (و sale_ends لسه ماجاش) بيظهر مشطوب */
  function disc(x){
    const o=Number(x.old_price), p=Number(x.price);
    if(!(o>p) || !(p>=0)) return {off:0,old:0,ltd:false};
    if(x.sale_ends && new Date(x.sale_ends)<=new Date()) return {off:0,old:0,ltd:false};
    return {off:Math.round((1-p/o)*100), old:o, ltd:!!x.sale_ends};
  }
  function card(x){
    const d=disc(x), u=url(x.image_path);
    return `<div class="sf-c"><div class="sf-i">${u?`<img loading="lazy" src="${esc(u)}" alt="" onerror="this.outerHTML='<div class=ph>🧴</div>'">`:'<div class="ph">🧴</div>'}</div>
    <div class="sf-b">${esc(x.brand||'')}</div><div class="sf-n">${esc(x.name)}</div>
    ${d.ltd?'<span class="sf-l">عرض لفترة محدودة</span>':''}
    <div class="sf-p"><b>${money(x.price)}</b>${d.off?`<s>${money(d.old)}</s><span class="sf-o">(${d.off}% خصم)</span>`:''}</div>
    ${Number(x.stock)>0?'':'<div class="muted">نفدت الكمية</div>'}</div>`;
  }

  async function front(id){
    const main=$('#main'), box=$('#ci'), inp=$('#ci2');
    if(!main||!box||!inp) return;
    const items=ok(await sb.rpc('store_view',{p_pharmacy:id}))||[];
    const name=((main.querySelector('h2')||{}).textContent||'').trim();
    inp.remove(); box.outerHTML='<div id="sf"></div>';
    const S={q:'',cat:'',brand:'',sort:'',offers:false};
    const bk=x=>String(x.brand||'').trim()||'أخرى';
    const off=x=>disc(x).off;

    if(!items.length){ $('#sf').innerHTML='<p class="muted">لا توجد منتجات في المتجر دلوقتي.</p>'; return; }

    const bm={}; items.forEach(x=>{(bm[bk(x)]=bm[bk(x)]||[]).push(x)});
    const brands=Object.entries(bm).sort((a,b)=>b[1].length-a[1].length);
    const cats=[...new Set(items.map(x=>String(x.category||'').trim()).filter(Boolean))];
    cats.sort((a,b)=>{const ia=Object.keys(ICON).indexOf(a), ib=Object.keys(ICON).indexOf(b); return (ia<0?99:ia)-(ib<0?99:ib)});

    const slides=brands.slice(0,3).map(([b,l])=>{
      const m=Math.max(...l.map(off));
      return `<div class="sf-s" data-sf="brand" data-v="${esc(b)}"><b>${m>0?`خصم حتى ${m}% على ${esc(b)}`:`تسوّق ${esc(b)}`}</b><span>${l.length} منتج</span></div>`;
    }).join('');

    $('#sf').innerHTML=`<div class="sf-bn" id="sf-bn">${slides}</div><div class="sf-d" id="sf-d">${brands.slice(0,3).map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>
    ${cats.length?`<div class="sf-cats">${cats.map(c=>`<button type="button" class="sf-cat" data-sf="cat" data-v="${esc(c)}"><u>${ICON[c]||'🧴'}</u>${esc(c)}</button>`).join('')}</div>`:''}
    <div class="sf-ctl"><input type="search" id="sf-q" placeholder="ابحث في المتجر">
    <select id="sf-s"><option value="">الترتيب: الافتراضي</option><option value="low">الأقل سعراً</option><option value="off">الأعلى خصماً</option></select>
    <label class="sf-chk"><input type="checkbox" id="sf-o"> عروض بس</label></div><div id="sf-body"></div>`;

    function filtered(){
      let l=items.filter(x=>(!S.cat||String(x.category||'').trim()===S.cat)&&(!S.brand||bk(x)===S.brand)&&(!S.offers||off(x)>0)
        &&(!S.q||[x.name,x.brand,x.category].join(' ').toLowerCase().includes(S.q)));
      if(S.sort==='low') l=l.slice().sort((a,b)=>Number(a.price)-Number(b.price));
      if(S.sort==='off') l=l.slice().sort((a,b)=>off(b)-off(a));
      return l;
    }
    function row(title,l,link){
      return `<div class="sf-h">${link?`<a data-sf="brand" data-v="${esc(link)}">عرض الكل</a>`:''}${title}</div><div class="sf-r">${l.slice(0,12).map(card).join('')}</div>`;
    }
    function body(){
      const act=S.q||S.cat||S.brand||S.offers||S.sort, el=$('#sf-body'); if(!el) return;
      if(act){
        const f=filtered();
        el.innerHTML=`<div class="row" style="margin:10px 0">${S.cat?`<span class="badge">${esc(S.cat)}</span>`:''}${S.brand?`<span class="badge">${esc(S.brand)}</span>`:''}
        <button type="button" class="ghost" data-sf="clear">مسح الفلاتر</button><span class="muted">${f.length} منتج</span></div>
        ${f.length?`<div class="sf-g">${f.map(card).join('')}</div>`:'<p class="muted">لا توجد منتجات مطابقة.</p>'}`;
        return;
      }
      let h='';
      const hot=items.filter(x=>off(x)>0).sort((a,b)=>off(b)-off(a));
      if(hot.length) h+=row('الأكثر خصماً',hot);
      brands.slice(0,8).forEach(([b,l])=>{
        const m=Math.max(...l.map(off));
        h+=row(m>0?`خصم حتى ${m}% على ${esc(b)}`:esc(b),l.slice().sort((a,b2)=>off(b2)-off(a)),b);
      });
      h+=`<div class="sf-h">ماركات مميزة</div><div class="sf-br">${brands.slice(0,10).map(([b,l])=>`<button type="button" class="sf-bt" data-sf="brand" data-v="${esc(b)}"><u>${esc(b.charAt(0))}</u>${esc(b)}</button>`).join('')}</div>`;
      el.innerHTML=h;
    }
    body();

    const root=$('#sf');
    root.addEventListener('click',e=>{
      const t=e.target.closest('[data-sf]'); if(!t) return;
      const k=t.dataset.sf, v=t.dataset.v;
      if(k==='cat') S.cat=S.cat===v?'':v;
      else if(k==='brand') S.brand=S.brand===v?'':v;
      else if(k==='clear'){ S.q='';S.cat='';S.brand='';S.sort='';S.offers=false; $('#sf-q').value='';$('#sf-s').value='';$('#sf-o').checked=false; }
      root.querySelectorAll('.sf-cat').forEach(b=>b.classList.toggle('on',b.dataset.v===S.cat));
      body(); if(k!=='cat') root.querySelector('#sf-body').scrollIntoView({block:'start'});
    });
    $('#sf-q').oninput=e=>{S.q=e.target.value.trim().toLowerCase();body()};
    $('#sf-s').onchange=e=>{S.sort=e.target.value;body()};
    $('#sf-o').onchange=e=>{S.offers=e.target.checked;body()};

    const bn=$('#sf-bn'), sl=[...bn.children], dots=[...document.querySelectorAll('#sf-d i')];
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ const i=sl.indexOf(en.target); dots.forEach((d,j)=>d.classList.toggle('on',i===j)); } }),{root:bn,threshold:.6});
      sl.forEach(s=>io.observe(s));
    }
    let n=0;
    const tm=setInterval(()=>{
      if(!document.body.contains(bn)){ clearInterval(tm); return; }
      if(sl.length<2) return;
      n=(n+1)%sl.length; sl[n].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
    },4500);
    window.scrollTo(0,0);
  }

  function install(){
    if(typeof A==='undefined'||!A.cshop||A.cshop.__sf) return !!(A&&A.cshop&&A.cshop.__sf);
    const orig=A.cshop;
    const w=async el=>{ await orig(el); try{ await front(el.dataset.id); }catch(e){ console.warn('store-front',e); } };
    w.__sf=1; A.cshop=w; return true;
  }
  let tries=0; const iv=setInterval(()=>{ if(install()||++tries>40) clearInterval(iv); },200);
})();
