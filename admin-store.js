/* Kivra: admin-store.js - شاشة للأدمن بس: كل طلبات المتجر والتحويلات (قراءة فقط) */
(function(){try{
  var D=[], F='all', BTN=null;
  var q=function(s){return document.querySelector(s)};
  var ST={'new':'جديد',pending:'جديد',accepted:'مقبول',preparing:'بيتجهز',shipped:'في الطريق',delivered:'اتسلّم',done:'اتسلّم',rejected:'مرفوض',cancelled:'ملغي'};
  var PM={cod:'عند الاستلام',instapay:'إنستا باي',wallet:'محفظة'};
  var money=function(n){return (Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})};
  var dt=function(s){try{return new Date(s).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})}catch(e){return ''}};
  var pname=function(p){p=p||{};return p.pharmacy_name||p.name||p.full_name||p.store_name||p.email||'صيدلية'};
  var meth=function(o){return o.payment_method||'cod'};
  var conf=function(o){return o.payment_status==='confirmed'};
  var bad=function(o){return o.status==='rejected'||o.status==='cancelled'};

  var st=document.createElement('style');
  st.textContent='#as-ov{position:fixed;inset:0;background:#f4f7f6;z-index:99990;overflow:auto;direction:rtl;font-family:inherit;padding:12px 12px 80px}'
   +'#as-b{position:fixed;bottom:84px;left:12px;z-index:9990;background:#1F6F6B;color:#fff;border:0;border-radius:24px;padding:12px 16px;font-weight:800;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.25)}'
   +'.as-t{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.as-t b{font-size:18px;color:#1F6F6B}'
   +'.as-x{background:#fff;border:1.5px solid #1F6F6B;color:#1F6F6B;border-radius:10px;padding:7px 12px;font-weight:700;margin-inline-start:6px}'
   +'.as-s{display:flex;gap:8px;margin-bottom:10px}.as-s div{flex:1;background:#fff;border-radius:12px;padding:10px;text-align:center;font-size:12px}.as-s b{display:block;font-size:17px;color:#1F6F6B}'
   +'.as-f{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.as-f button{border:1.5px solid #1F6F6B;background:#fff;color:#1F6F6B;border-radius:18px;padding:6px 12px;font-weight:700;font-size:12px}.as-f button.on{background:#1F6F6B;color:#fff}'
   +'.as-c{background:#fff;border-radius:14px;padding:12px;margin-bottom:10px;font-size:13px;line-height:1.8;box-shadow:0 1px 4px rgba(0,0,0,.08)}'
   +'.as-c .h{display:flex;justify-content:space-between;font-weight:800}.as-c .m{color:#666;font-size:12px}'
   +'.as-p{display:inline-block;border-radius:10px;padding:2px 9px;font-size:12px;font-weight:700;background:#fff3cd;color:#8a6100}.as-p.ok{background:#d7f3e3;color:#0b6b3a}.as-p.no{background:#eee;color:#666}'
   +'.as-v{border:1.5px solid #1F6F6B;background:#e8f5f3;color:#1F6F6B;border-radius:10px;padding:6px 12px;font-weight:700;margin-top:4px}'
   +'.as-i{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px}.as-i img{max-width:100%;max-height:80vh;border-radius:10px;background:#fff}.as-i button{margin-top:12px;padding:10px 22px;border-radius:12px;font-weight:800}';
  document.head.appendChild(st);

  function filt(){
    return D.filter(function(o){
      if(F==='pend') return meth(o)!=='cod'&&!conf(o)&&!bad(o);
      if(F==='conf') return meth(o)!=='cod'&&conf(o);
      if(F==='proof') return !!o.proof_path;
      if(F==='cod') return meth(o)==='cod';
      return true;
    });
  }
  function draw(){
    var o=q('#as-ov'); if(!o) return;
    var ok=D.filter(function(x){return !bad(x)}), sum=ok.reduce(function(a,x){return a+(Number(x.total)||0)},0);
    var pend=D.filter(function(x){return meth(x)!=='cod'&&!conf(x)&&!bad(x)}).length;
    var L=filt(), h='<div class="as-t"><b>🛍️ طلبات المتجر</b><span><button class="as-x" data-as="r">🔄</button><button class="as-x" data-as="c">إغلاق</button></span></div>';
    h+='<div class="as-s"><div><b>'+D.length+'</b>طلب</div><div><b>'+money(sum)+'</b>إجمالي (من غير الملغي)</div><div><b>'+pend+'</b>تحويل معلّق</div></div>';
    h+='<div class="as-f">'+[['all','الكل'],['pend','تحويل معلّق'],['conf','تحويل مؤكد'],['proof','فيه صورة'],['cod','عند الاستلام']].map(function(a){return '<button data-asf="'+a[0]+'" class="'+(F===a[0]?'on':'')+'">'+a[1]+'</button>'}).join('')+'</div>';
    if(!L.length) h+='<div class="as-c">مفيش طلبات هنا.</div>';
    L.forEach(function(x){
      var m=meth(x), pc=m==='cod'?'<span class="as-p no">عند الاستلام</span>':(conf(x)?'<span class="as-p ok">✅ '+(PM[m]||m)+' - مؤكد</span>':'<span class="as-p">⏳ '+(PM[m]||m)+' - معلّق</span>');
      h+='<div class="as-c"><div class="h"><span>#'+esc(String(x.order_no||x.id))+'</span><span>'+money(x.total)+' ج.م</span></div>'
        +'<div class="m">'+dt(x.created_at)+' · '+esc(ST[x.status]||x.status||'')+'</div>'
        +'<div>🏪 '+esc(pname(x.pharmacy))+'</div>'
        +'<div>👤 '+esc(x.name||'')+(x.phone?' · <a href="tel:'+esc(x.phone)+'">'+esc(x.phone)+'</a>':'')+'</div>'
        +'<div>'+pc+'</div>'
        +(x.proof_path?'<button class="as-v" data-asv="'+esc(x.proof_path)+'">🧾 عرض صورة التحويل</button>':'')+'</div>';
    });
    o.innerHTML=h;
  }
  async function load(){
    var o=q('#as-ov'); if(o&&!D.length) o.innerHTML='<div class="as-c">جاري التحميل...</div>';
    try{
      var r=await sb.rpc('admin_store_orders',{p_limit:150});
      if(r.error) throw r.error;
      D=Array.isArray(r.data)?r.data:[]; draw();
    }catch(e){ console.warn('admin-store',e); toast('تعذّر تحميل الطلبات'); }
  }
  function open(){
    if(q('#as-ov')) return;
    var o=document.createElement('div'); o.id='as-ov'; document.body.appendChild(o); load();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('#as-b,[data-as],[data-asf],[data-asv]'); if(!t) return;
    if(t.id==='as-b') return open();
    var a=t.getAttribute('data-as'); if(a==='c'){ var o=q('#as-ov'); if(o) o.remove(); return; } if(a==='r') return load();
    var f=t.getAttribute('data-asf'); if(f){ F=f; return draw(); }
    var p=t.getAttribute('data-asv'); if(p){
      Promise.resolve(sb.storage.from('transfer-proofs').createSignedUrl(p,300)).then(function(r){
        if(!r||r.error||!r.data) return toast('تعذّر عرض الصورة');
        var v=document.createElement('div'); v.className='as-i'; v.innerHTML='<img alt=""><button type="button">إغلاق</button>';
        v.querySelector('img').src=r.data.signedUrl; v.addEventListener('click',function(){v.remove()}); document.body.appendChild(v);
      });
    }
  });
  var CK='';
  setInterval(function(){
    try{
      var adm=window.ME&&ME.id&&ME.role==='admin';
      if(adm&&CK!==ME.id){ CK=ME.id; }
      if(adm&&!BTN){ BTN=document.createElement('button'); BTN.id='as-b'; BTN.type='button'; BTN.textContent='🛍️ طلبات المتجر'; document.body.appendChild(BTN); }
      if(!adm&&BTN){ BTN.remove(); BTN=null; var o=q('#as-ov'); if(o) o.remove(); CK=''; }
    }catch(e){}
  },2000);
}catch(e){ console.warn('admin-store',e); }})();
