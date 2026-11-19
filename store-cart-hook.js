/* Kivra: إصلاح ظهور الغلاف واللوجو والبانرات جوه المتجر (إضافة فقط، مش بيعدّل store-cart.js).
   بيتأكد إن store-cart.js عرف أنهي متجر اتفتح، ولو الهيدر لسه ما اتبدلش بيحاول تاني ويعرض سبب المشكلة. */
(function(){
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const has=()=>!!document.querySelector('#main .sx-hd');
  const nudge=()=>{ try{ const i=document.createElement('i'); document.body.appendChild(i); i.remove(); }catch(e){} };
  const say=t=>{ try{ toast(t); }catch(e){} try{ console.warn('[store-cart-hook]',t); }catch(e){} };
  async function diag(id){
    try{
      const r=await sb.rpc('store_public_profile',{p_pharmacy:id});
      if(r.error){ say('الغلاف: خطأ في بيانات المتجر: '+String(r.error.message||r.error.code||'').slice(0,70)); return; }
      const p=(r.data&&r.data.profile)||{};
      say('بيانات المتجر وصلت · لوجو: '+(p.logo_url?'موجود':'مفيش')+' · غلاف: '+(p.cover_url?'موجود':'مفيش'));
    }catch(e){ say('الغلاف: تعذر قراءة بيانات المتجر'); }
  }
  async function watch(id){
    await sleep(1500);
    if(has()) return;
    try{ await sb.rpc('store_view',{p_pharmacy:id}); }catch(e){}
    nudge();
    await sleep(2500);
    if(has()) return;
    nudge();
    await sleep(1500);
    if(has()) return;
    diag(id);
  }
  function install(){
    if(typeof A==='undefined'||!A||typeof A.cshop!=='function') return false;
    if(A.cshop.__hook) return true;
    const orig=A.cshop;
    const w=function(b){
      const id=b&&b.dataset&&b.dataset.id;
      const r=orig.apply(this,arguments);
      if(id) watch(id);
      return r;
    };
    w.__hook=1; A.cshop=w; return true;
  }
  let t=0; const iv=setInterval(()=>{ if(install()||++t>60) clearInterval(iv); },250);
})();
