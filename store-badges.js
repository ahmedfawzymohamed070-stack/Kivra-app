/* Kivra: شارات الأرقام الحمراء على التبويبات السفلية (إضافة فقط، بتلف حوالين paintNav من غير ما تغيّر منطقها) */
(function(){
const COUNTS={};
let last=0, busy=false;
const st=document.createElement('style');
st.textContent='nav button .sbd{position:absolute;top:2px;left:50%;margin-left:6px;background:#e24b4a;color:#fff;border-radius:99px;font-size:11px;font-weight:700;min-width:18px;height:18px;line-height:18px;padding:0 5px;text-align:center}';
document.head.appendChild(st);

function apply(){
  try{
    const nav=document.getElementById('nav'); if(!nav) return;
    nav.querySelectorAll('.sbd').forEach(x=>x.remove());
    Object.keys(COUNTS).forEach(k=>{
      const n=COUNTS[k]; if(!(n>0)) return;
      const b=nav.querySelector('[data-t="'+k+'"]'); if(!b) return;
      const s=document.createElement('span'); s.className='sbd'; s.textContent=n>99?'99+':String(n);
      b.appendChild(s);
    });
  }catch(e){}
}

async function rows(name){
  try{ const r=await sb.rpc(name); return (r&&!r.error&&Array.isArray(r.data))?r.data:[]; }catch(e){ return []; }
}

async function refresh(){
  if(busy) return; if(typeof ME==='undefined'||!ME||!ME.role||ME.guest) return;
  busy=true; last=Date.now();
  try{
    const role=ME.role;
    Object.keys(COUNTS).forEach(k=>delete COUNTS[k]);
    if(role==='warehouse'){
      COUNTS.ord=(await rows('my_orders')).filter(o=>o.status==='pending').length;
    }else if(role==='pharmacy'){
      COUNTS.ord=(await rows('my_orders')).filter(o=>o.status==='delivered').length;
      COUNTS.store=(await rows('store_orders_for_pharmacy')).filter(o=>o.status==='pending').length;
    }else if(role==='customer'){
      const list=await rows('store_my_orders'), key='kivra_seen_'+ME.id;
      let seen=null; try{ seen=JSON.parse(localStorage.getItem(key)||'null'); }catch(e){}
      const cur={}; list.forEach(o=>cur[o.id]=o.status);
      if(!seen||(typeof TAB!=='undefined'&&TAB==='sord')){
        try{ localStorage.setItem(key,JSON.stringify(cur)); }catch(e){}
        COUNTS.sord=0;
      }else{
        COUNTS.sord=list.filter(o=>seen[o.id]!==o.status).length;
      }
    }else if(role==='admin'){
      try{
        const r=await sb.from('profiles').select('id',{count:'exact',head:true}).eq('status','pending').neq('role','admin');
        COUNTS.acct=(r&&r.count)||0;
      }catch(e){}
    }
  }catch(e){ console.warn('store-badges',e); }
  busy=false; apply();
}

function wrap(){
  if(typeof window.paintNav!=='function'||window.paintNav.__sb) return false;
  const orig=window.paintNav;
  const w=function(){ const r=orig.apply(this,arguments); apply(); if(Date.now()-last>8000) refresh(); return r; };
  w.__sb=1; window.paintNav=w; return true;
}
let t=0; const iv=setInterval(()=>{ if(wrap()||++t>50) clearInterval(iv); },200);
setInterval(()=>{ if(!document.hidden) refresh(); },40000);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) refresh(); });
})();
