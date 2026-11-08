/* Kivra: إظهار نسبة الخصم والسعر العام للصيدلية المفعّلة */
(function(){
  let DM={}, GM={};   // DM: رقم المنتج -> السعر العام والخصم | GM: مفتاح المجموعة -> أرخص عرض

  const _rpc=sb.rpc.bind(sb);
  sb.rpc=function(name,args,opts){
    const q=_rpc(name,args,opts);
    if(name!=='get_offers') return q;
    return Promise.resolve(q).then(async r=>{
      try{
        if(!r.error&&Array.isArray(r.data)&&ME&&ME.role==='pharmacy'&&ME.status==='approved'){
          const d=await _rpc('get_offer_discounts');
          if(!d.error&&Array.isArray(d.data)){
            DM={}; GM={};
            d.data.forEach(x=>{DM[String(x.id)]={pub:Number(x.public_price),disc:Number(x.disc)}});
            r.data.forEach(o=>{
              if(o.price==null) return;
              const b=GM[o.group_key];
              if(!b||Number(o.price)<b.price) GM[o.group_key]={id:String(o.id),price:Number(o.price)};
            });
            paint();
          }
        }
      }catch(e){}
      return r;
    });
  };

  const fmt=n=>(+Number(n).toFixed(1))+'%';
  const html=d=>d.disc>0
    ?` <s class="muted">${money(d.pub)}</s> <span class="badge approved">خصم ${fmt(d.disc)}</span>`:'';

  function paint(){
    if(!Object.keys(DM).length) return;
    // كارت المنتج: خصم أرخص عرض
    document.querySelectorAll('#cat .pc').forEach(c=>{
      const btn=c.querySelector('[data-act="spadd"]'), p=c.querySelector('.pb .price');
      if(!btn||!p) return;
      const box=p.parentElement; if(box.dataset.dsc) return;
      const g=GM[btn.dataset.k], d=g&&DM[g.id];
      if(d){ box.dataset.dsc='1'; box.insertAdjacentHTML('beforeend',html(d)); }
    });
    // صفوف الموزعين
    document.querySelectorAll('#cat .offer').forEach(o=>{
      const b=o.querySelector('[data-act="addc"]'), p=o.querySelector('.price');
      if(!b||!p||p.dataset.dsc) return;
      const d=DM[b.dataset.id];
      if(d){ p.dataset.dsc='1'; p.insertAdjacentHTML('afterend',html(d)); }
    });
  }

  let t=null;
  new MutationObserver(()=>{ clearTimeout(t); t=setTimeout(paint,30); })
    .observe(document.body,{childList:true,subtree:true});
})();
