/* Kivra: زرار "قيّم الصيدلية" في طلباتي للعميل (إضافة فقط، مش بيغيّر أي ملف تاني) */
(function(){
const st=document.createElement('style');
st.textContent=`
.sr-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:flex-end;justify-content:center}
.sr-bx{background:#fff;width:100%;max-width:520px;border-radius:20px 20px 0 0;padding:18px 16px 24px;direction:rtl}
.sr-bx h3{margin:0 0 4px;font-size:18px;color:#1c2423}
.sr-bx p{margin:0 0 10px;color:#7a8785;font-size:13px}
.sr-st{display:flex;justify-content:center;gap:6px;margin:10px 0}
.sr-st button{font-size:38px;line-height:1;background:none;border:0;color:#cfd8d7;padding:0 2px;cursor:pointer}
.sr-st button.on{color:#e0a020}
.sr-bx textarea{width:100%;min-height:70px;border:1px solid #dfe8e7;border-radius:12px;padding:10px;font-size:14px;box-sizing:border-box;font-family:inherit}
.sr-ac{display:flex;gap:8px;margin-top:12px}.sr-ac button{flex:1}
.sr-done{color:#c78a2c;font-weight:700}
`;
document.head.appendChild(st);
const E=s=>(typeof esc==='function'?esc(s==null?'':s):String(s==null?'':s));
const msg=t=>{try{toast(t)}catch(e){alert(t)}};
let ORD={}, RATED={}, busy=false;
async function load(){
  const r1=await sb.rpc('store_my_orders'); const r2=await sb.rpc('store_my_ratings');
  const list=(r1&&r1.data)||[]; ORD={}; list.forEach(o=>{ORD[String(o.order_no)]=o;});
  RATED=(r2&&r2.data&&typeof r2.data==='object')?r2.data:{};
}
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n);}
async function decorate(){
  const root=document.getElementById('so-croot'); if(!root||busy) return;
  const cards=[...root.querySelectorAll('.so-o')].filter(c=>!c.dataset.sr);
  if(!cards.length) return;
  cards.forEach(c=>c.dataset.sr='1'); busy=true;
  try{
    await load();
    cards.forEach(c=>{
      const b=c.querySelector('.so-h b'); if(!b) return;
      const o=ORD[b.textContent.replace('#','').trim()];
      if(!o||o.status!=='delivered') return;
      const my=Number(RATED[String(o.id)])||0;
      const d=document.createElement('div'); d.className='so-ac';
      d.innerHTML=my?`<button type="button" class="ghost" data-srate="${E(o.id)}"><span class="sr-done">${stars(my)}</span> تعديل تقييمك</button>`
                    :`<button type="button" data-srate="${E(o.id)}">⭐ قيّم الصيدلية</button>`;
      c.appendChild(d);
    });
  }catch(e){console.warn('store-rate',e);} finally{busy=false;}
}
function sheet(id){
  const o=Object.values(ORD).find(x=>String(x.id)===String(id)); if(!o) return;
  let val=Number(RATED[String(o.id)])||0;
  const ov=document.createElement('div'); ov.className='sr-ov';
  ov.innerHTML=`<div class="sr-bx"><h3>قيّم ${E(o.pharmacy||'الصيدلية')}</h3><p>تقييمك بيساعد العملاء التانيين</p>
  <div class="sr-st">${[1,2,3,4,5].map(i=>`<button type="button" data-v="${i}">★</button>`).join('')}</div>
  <textarea placeholder="تعليق (اختياري)"></textarea>
  <div class="sr-ac"><button type="button" data-send>إرسال التقييم</button><button type="button" class="ghost" data-close>إلغاء</button></div></div>`;
  document.body.appendChild(ov);
  const paint=()=>ov.querySelectorAll('.sr-st button').forEach(b=>b.classList.toggle('on',Number(b.dataset.v)<=val));
  paint();
  ov.addEventListener('click',async e=>{
    if(e.target===ov||e.target.closest('[data-close]')){ov.remove();return;}
    const sb1=e.target.closest('.sr-st button'); if(sb1){val=Number(sb1.dataset.v);paint();return;}
    if(e.target.closest('[data-send]')){
      if(!val){msg('اختار عدد النجوم الأول');return;}
      const btn=e.target.closest('[data-send]'); btn.disabled=true;
      const r=await sb.rpc('store_rate_order',{p_order:Number(o.id),p_stars:val,p_comment:ov.querySelector('textarea').value.trim()||null});
      btn.disabled=false;
      if(r&&r.error){msg('مقدرتش أحفظ التقييم، جرّب تاني');return;}
      RATED[String(o.id)]=val; msg('شكراً على تقييمك ⭐'); ov.remove();
      const bt=document.querySelector(`[data-srate="${o.id}"]`);
      if(bt){bt.className='ghost';bt.innerHTML=`<span class="sr-done">${stars(val)}</span> تعديل تقييمك`;}
    }
  });
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-srate]'); if(b) sheet(b.dataset.srate);});
let tm=null;
new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(decorate,80);}).observe(document.body,{childList:true,subtree:true});
})();
