/* Kivra: kv-banners.js - بنرات الصفحة الرئيسية (شريط متحرك بنقط). الأدمن بيديرها من ⚙️ إعدادات ← 🖼️ إدارة البنرات */
(function(){try{
  var BAN=[], SIG='', LT=0, BZ=false, CUR=0, TOUCH=0, LIST=[], PICK=null;
  var HOME={pharmacy:'dist',warehouse:'ord',customer:'shops'};
  var AUD={pharmacy:'للصيدليات',warehouse:'للمخازن',customer:'للعملاء',all:'للكل'};
  var q=function(s){return document.querySelector(s)};
  var st=document.createElement('style');
  st.textContent='#kb-ban{margin:8px 10px 6px;direction:rtl}'
   +'.kb-tr{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;border-radius:16px;scrollbar-width:none;direction:rtl}.kb-tr::-webkit-scrollbar{display:none}'
   +'.kb-s{flex:0 0 100%;scroll-snap-align:start;aspect-ratio:1080/560;display:block;background:#e8eeed}.kb-s img{width:100%;height:100%;object-fit:cover;display:block}'
   +'.kb-d{display:flex;justify-content:center;gap:6px;margin-top:6px}.kb-d i{width:7px;height:7px;border-radius:50%;background:#c5d0cf}.kb-d i.on{background:#1F6F6B}'
   +'#kb-ov{position:fixed;inset:0;background:#f4f7f6;z-index:99995;overflow:auto;direction:rtl;padding:14px 14px 90px}'
   +'#kb-ov label{display:block;margin:10px 0;font-size:13px;font-weight:700}'
   +'#kb-ov input,#kb-ov select{width:100%;padding:10px;border:1.5px solid #cfd8d7;border-radius:10px;margin-top:4px;font-size:14px;background:#fff}'
   +'#kb-ov button{padding:10px 16px;border-radius:12px;font-weight:800;border:0;background:#1F6F6B;color:#fff}#kb-ov button.g{background:#fff;color:#1F6F6B;border:1.5px solid #1F6F6B}'
   +'.kb-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.kb-top b{font-size:18px;color:#1F6F6B}'
   +'.kb-box,.kb-c{background:#fff;border-radius:14px;padding:12px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.08)}'
   +'.kb-pv{aspect-ratio:1080/560;background:#e8eeed;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#6b7c7a;font-size:13px;margin-bottom:10px}'
   +'.kb-pv img{width:100%;height:100%;object-fit:cover;display:block}.kb-c img{width:100%;aspect-ratio:1080/560;object-fit:cover;border-radius:10px;display:block}'
   +'.kb-m{margin:8px 0;font-size:12px}.kb-p{display:inline-block;background:#e8f5f3;color:#1F6F6B;border-radius:10px;padding:2px 9px;font-weight:700;margin-inline-end:6px}.kb-p.ok{background:#d7f3e3;color:#0b6b3a}.kb-p.no{background:#eee;color:#666}'
   +'.kb-b{display:flex;gap:8px}#kb-ov button.kb-del{background:#fee2e2;color:#b91c1c}';
  document.head.appendChild(st);

  var pub=function(p){ try{ return sb.storage.from('banners').getPublicUrl(p).data.publicUrl; }catch(e){ return ''; } };
  var role=function(){ return (typeof ME!=='undefined'&&ME&&ME.role)||''; };
  var tab=function(){ try{ return typeof TAB!=='undefined'?TAB:''; }catch(e){ return ''; } };
  function want(){
    var r=role(); if(!HOME[r]||tab()!==HOME[r]) return false;
    if(r==='customer'&&!q('#cl')) return false;
    return !!q('#main');
  }

  /* ===== العرض ===== */
  function load(){
    if(BZ||Date.now()-LT<60000) return; BZ=true;
    Promise.resolve(sb.rpc('kv_active_banners')).then(function(r){
      LT=Date.now();
      var d=(r&&!r.error&&Array.isArray(r.data))?r.data:[], s=JSON.stringify(d);
      if(s!==SIG){ SIG=s; BAN=d; var o=q('#kb-ban'); if(o) o.remove(); }
    }).catch(function(){ LT=Date.now(); }).then(function(){ BZ=false; tick(); });
  }
  function dots(){ [].forEach.call(document.querySelectorAll('#kb-ban .kb-d i'),function(d,i){ d.className=i===CUR?'on':''; }); }
  function build(){
    var m=q('#main'); if(!m) return;
    var sl=BAN.map(function(b){
      var u=pub(b.image_path); if(!u) return '';
      var im='<img src="'+esc(u)+'" alt="" loading="lazy" draggable="false">';
      return /^https:\/\//.test(b.link_url||'')?'<a class="kb-s" href="'+esc(b.link_url)+'" target="_blank" rel="noopener noreferrer">'+im+'</a>':'<div class="kb-s">'+im+'</div>';
    }).join('');
    m.insertAdjacentHTML('beforebegin','<div id="kb-ban"><div class="kb-tr">'+sl+'</div><div class="kb-d">'+BAN.map(function(b,i){return '<i'+(i===0?' class="on"':'')+'></i>'}).join('')+'</div></div>');
    var tr=q('#kb-ban .kb-tr'); CUR=0;
    tr.addEventListener('scroll',function(){ clearTimeout(tr._t); tr._t=setTimeout(function(){ CUR=Math.max(0,Math.min(BAN.length-1,Math.round(Math.abs(tr.scrollLeft)/(tr.clientWidth||1)))); dots(); },80); });
    tr.addEventListener('touchstart',function(){ TOUCH=Date.now(); },{passive:true});
  }
  setInterval(function(){
    var tr=q('#kb-ban .kb-tr'); if(!tr||BAN.length<2||document.hidden||Date.now()-TOUCH<8000) return;
    var r=tr.getBoundingClientRect(); if(r.bottom<0||r.top>window.innerHeight) return;
    var s=tr.children[(CUR+1)%BAN.length]; if(s) s.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
  },4500);

  /* ===== الأدمن ===== */
  function adminBtn(){
    var o=q('#ast-ov'); if(!o||o.querySelector('[data-kba="open"]')||!o.querySelector('[data-astx="save"]')) return;
    o.insertAdjacentHTML('beforeend','<div style="margin-top:16px"><button type="button" class="g" data-kba="open" style="width:100%">🖼️ إدارة البنرات</button></div>');
  }
  function dt(s){ try{ return new Date(s).toLocaleDateString('ar-EG'); }catch(e){ return ''; } }
  function card(b){
    var exp=b.ends_at&&new Date(b.ends_at)<new Date();
    return '<div class="kb-c"><img src="'+esc(pub(b.image_path))+'" alt=""><div class="kb-m"><span class="kb-p">'+(AUD[b.audience]||'')+'</span>'
     +'<span class="kb-p '+(exp?'no':b.active?'ok':'no')+'">'+(exp?'منتهي':b.active?'شغال':'متوقف')+'</span>'+(b.ends_at?'<span class="muted">ينتهي '+esc(dt(b.ends_at))+'</span>':'')+'</div>'
     +'<div class="kb-b"><button type="button" class="g" data-kba="tog" data-id="'+Number(b.id)+'" data-on="'+(b.active?1:0)+'">'+(b.active?'إيقاف':'تفعيل')+'</button>'
     +'<button type="button" class="kb-del" data-kba="del" data-id="'+Number(b.id)+'">🗑 حذف</button></div></div>';
  }
  function shell(){
    var o=q('#kb-ov'); if(!o) return;
    o.innerHTML='<div class="kb-top"><b>🖼️ البنرات</b><button type="button" class="g" data-kba="close">إغلاق</button></div>'
     +'<div class="kb-box"><div class="kb-pv" id="kb-pv"><span>المقاس المناسب 1080×560</span></div>'
     +'<button type="button" class="g" data-kba="pick">📷 اختار صورة</button><input type="file" id="kb-f" accept="image/*" hidden>'
     +'<label>يظهر عند<select id="kb-a"><option value="pharmacy">الصيدليات</option><option value="warehouse">المخازن</option><option value="customer">العملاء</option><option value="all">الكل</option></select></label>'
     +'<label>رابط عند الضغط (اختياري، يبدأ بـ https)<input id="kb-l" type="url" placeholder="https://" style="direction:ltr;text-align:left"></label>'
     +'<label>ينتهي في (اختياري)<input id="kb-e" type="date"></label>'
     +'<button type="button" data-kba="add" style="width:100%">نشر البنر</button></div>'
     +'<h3 style="color:#1F6F6B">البنرات الحالية</h3><div id="kb-list"></div>';
    drawList();
  }
  function drawList(){ var l=q('#kb-list'); if(l) l.innerHTML=LIST.length?LIST.map(card).join(''):'<div class="muted">لسه مفيش بنرات.</div>'; }
  async function loadList(){
    var r=await sb.rpc('admin_list_banners'); if(r.error) throw new Error('تعذّر تحميل البنرات');
    LIST=Array.isArray(r.data)?r.data:[]; drawList();
  }
  function comp(file){
    return new Promise(function(res,rej){
      var im=new Image(), u=URL.createObjectURL(file);
      im.onload=function(){
        var w=Math.min(1080,im.naturalWidth), h=Math.round(im.naturalHeight*w/im.naturalWidth), c=document.createElement('canvas');
        c.width=w; c.height=h; var x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(im,0,0,w,h);
        URL.revokeObjectURL(u);
        c.toBlob(function(b){ b?res(b):rej(new Error('تعذّر تجهيز الصورة')); },'image/jpeg',0.82);
      };
      im.onerror=function(){ URL.revokeObjectURL(u); rej(new Error('الصورة مش مقروءة')); };
      im.src=u;
    });
  }
  async function add(){
    if(!PICK) throw new Error('اختار صورة الأول');
    var link=(q('#kb-l').value||'').trim(); if(link&&!/^https:\/\//i.test(link)) throw new Error('الرابط لازم يبدأ بـ https://');
    var e=q('#kb-e').value, ends=e?new Date(e+'T23:59:59').toISOString():null, aud=q('#kb-a').value;
    toast('جاري الرفع...');
    var blob=await comp(PICK), path='b/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
    var up=await sb.storage.from('banners').upload(path,blob,{contentType:'image/jpeg'});
    if(up.error) throw new Error('تعذّر رفع الصورة');
    var r=await sb.rpc('admin_add_banner',{p_path:path,p_audience:aud,p_link:link||null,p_ends:ends});
    if(r.error){ await sb.storage.from('banners').remove([path]); throw new Error('تعذّر الحفظ'); }
    PICK=null; LT=0; toast('تم النشر ✅'); shell(); await loadList();
  }
  async function tog(t){
    var r=await sb.rpc('admin_set_banner',{p_id:Number(t.getAttribute('data-id')),p_active:t.getAttribute('data-on')!=='1'});
    if(r.error) throw new Error('تعذّر التعديل'); LT=0; await loadList();
  }
  async function del(t){
    if(!confirm('تحذف البنر ده؟')) return;
    var r=await sb.rpc('admin_delete_banner',{p_id:Number(t.getAttribute('data-id'))});
    if(r.error) throw new Error('تعذّر الحذف');
    if(r.data) await sb.storage.from('banners').remove([r.data]);
    LT=0; await loadList();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-kba]'); if(!t) return;
    var a=t.getAttribute('data-kba');
    if(a==='open'){
      if(q('#kb-ov')) return; var o=document.createElement('div'); o.id='kb-ov'; document.body.appendChild(o); PICK=null; shell(); return run(loadList);
    }
    if(a==='close'){ var c=q('#kb-ov'); if(c) c.remove(); return; }
    if(a==='pick'){ var f=q('#kb-f'); if(f) f.click(); return; }
    if(a==='add') return run(add);
    if(a==='tog') return run(function(){ return tog(t); });
    if(a==='del') return run(function(){ return del(t); });
  });
  document.addEventListener('change',function(e){
    var f=e.target; if(!f||f.id!=='kb-f'||!f.files||!f.files[0]) return;
    PICK=f.files[0]; var pv=q('#kb-pv'); if(pv) pv.innerHTML='<img alt="" src="'+URL.createObjectURL(PICK)+'">';
  });

  function tick(){
    try{
      var w=want(), o=q('#kb-ban');
      if(w) load();
      if(!w||!BAN.length){ if(o) o.remove(); } else if(!o) build();
      adminBtn();
    }catch(e){ console.warn('kv-banners',e); }
  }
  var T=null;
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(tick,150); }).observe(document.body,{childList:true,subtree:true});
  tick();
}catch(e){ console.warn('kv-banners',e); }})();
