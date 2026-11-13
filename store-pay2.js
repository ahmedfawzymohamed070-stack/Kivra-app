/* Kivra: store-pay2.js - شعارات إنستا باي/المحفظة + رابط إنستا باي مباشر + رفع صورة التحويل. بيضيف على store-pay.js من غير ما يعدّل فيه */
(function(){try{
  var IMG={instapay:'data:image/png;base64,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',wallet:'data:image/png;base64,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'};
  var NAME={instapay:'إنستا باي',wallet:'محفظة إلكترونية'};
  var PR={}, PRT=0, BZ=false;
  var q=function(s){return document.querySelector(s)};
  var ic=function(k,s){return '<img src="'+IMG[k]+'" alt="" style="width:'+(s||26)+'px;height:'+(s||26)+'px;vertical-align:middle;margin-inline-end:6px;border-radius:6px">'};
  var isLink=function(v){return /^https?:\/\//i.test(v||'')};

  var st=document.createElement('style');
  st.textContent='.sp2-b{display:inline-block;margin:6px 4px;padding:10px 16px;border-radius:12px;background:#1F6F6B;color:#fff!important;font-weight:800;font-size:14px;text-decoration:none;border:0}'
   +'.sp2-up{display:inline-block;margin:6px 0;padding:8px 14px;border-radius:10px;background:#e8f5f3;color:#1F6F6B;font-weight:700;font-size:13px;border:1.5px solid #1F6F6B;cursor:pointer}'
   +'.sp2-ov{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px}'
   +'.sp2-ov img{max-width:100%;max-height:80vh;border-radius:10px;background:#fff}'
   +'.sp2-ov button{margin-top:12px;padding:10px 22px;border-radius:12px;font-weight:800}';
  document.head.appendChild(st);

  /* تصغير الصورة في المتصفح قبل الرفع */
  function shrink(file){
    return new Promise(function(res,rej){
      var fr=new FileReader();
      fr.onerror=function(){rej(new Error('read'))};
      fr.onload=function(){
        var im=new Image();
        im.onerror=function(){rej(new Error('img'))};
        im.onload=function(){
          var m=1100, r=Math.min(1,m/Math.max(im.width,im.height)), c=document.createElement('canvas');
          c.width=Math.round(im.width*r); c.height=Math.round(im.height*r);
          c.getContext('2d').drawImage(im,0,0,c.width,c.height);
          c.toBlob(function(b){ b?res(b):rej(new Error('blob')); },'image/jpeg',0.72);
        };
        im.src=fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  async function upload(file,oid){
    try{
      toast('جاري رفع الصورة...');
      var b=await shrink(file), path=ME.id+'/'+Date.now()+'.jpg';
      var u=await sb.storage.from('transfer-proofs').upload(path,b,{contentType:'image/jpeg'});
      if(u.error) throw u.error;
      var a={p_path:path}; if(oid) a.p_id=Number(oid);
      var r=await sb.rpc('store_set_order_proof',a);
      if(r&&r.error) throw r.error;
      toast('تم رفع صورة التحويل ✅'); PRT=0;
      [].forEach.call(document.querySelectorAll('[data-p2]'),function(c){ if(c.classList.contains('so-o')){ var x=c.querySelector('.sp2-row'); if(x) x.remove(); c.removeAttribute('data-p2'); } });
      var d=q('#sx-sheet .sp-done[data-p2]'); if(d){ var y=d.querySelector('.sp2-row'); if(y) y.innerHTML='<span class="sp-ok">✅ تم رفع صورة التحويل</span>'; }
      tick();
    }catch(e){ console.warn('store-pay2',e); toast('تعذّر رفع الصورة، حاول تاني'); }
  }
  function loadPR(){
    if(Date.now()-PRT<3000) return Promise.resolve(PR);
    return Promise.resolve(sb.rpc('store_orders_proof')).then(function(r){
      var d=r&&!r.error?r.data:null, m={}; (Array.isArray(d)?d:[]).forEach(function(x){ m[x.id]=x.proof_path; });
      PR=m; PRT=Date.now(); return m;
    }).catch(function(){ PRT=Date.now(); return PR; });
  }
  var fileBtn=function(oid){ return '<label class="sp2-up">📤 ارفع صورة التحويل<input type="file" accept="image/*" data-sp2f="'+(oid||'')+'" style="display:none"></label>'; };

  /* ===== 1) أزرار اختيار الطريقة في السلة ===== */
  function tickCart(){
    [].forEach.call(document.querySelectorAll('.sp-o[data-spm]:not([data-p2])'),function(b){
      var k=b.getAttribute('data-spm'); b.setAttribute('data-p2','1');
      if(IMG[k]) b.innerHTML=ic(k,28)+NAME[k];
    });
  }
  /* ===== 2) شاشة تم إرسال الطلب ===== */
  function tickDone(){
    [].forEach.call(document.querySelectorAll('.sp-done:not([data-p2])'),function(d){
      var t=d.textContent, k=t.indexOf('إنستا')>-1?'instapay':t.indexOf('محفظة')>-1?'wallet':'';
      d.setAttribute('data-p2','1'); if(!k) return;
      var n=d.querySelector('.sp-n'), v=n?n.textContent.trim():'';
      var h='<div class="sp2-row">';
      if(k==='instapay'&&isLink(v)){
        h+='<a class="sp2-b" target="_blank" rel="noopener noreferrer" href="'+esc(v)+'">'+ic('instapay',24)+'ادفع بإنستا باي</a><br>';
        if(n) n.style.display='none';
        var cp=d.querySelector('[data-spa="copy"]'); if(cp) cp.style.display='none';
        var tx=d.firstChild; 
      }
      h+='<div class="muted">بعد الدفع ارفع صورة التحويل عشان الصيدلية تتأكد:</div>'+fileBtn('')+'</div>';
      d.insertAdjacentHTML('beforeend',h);
      d.insertAdjacentHTML('afterbegin','<div>'+ic(k,34)+'</div>');
    });
  }
  /* ===== 3) كروت الطلبات (عميل وصيدلية) ===== */
  function tickCards(){
    [].forEach.call(document.querySelectorAll('.sp-pay span:first-child:not([data-p2])'),function(s){
      var t=s.textContent, k=t.indexOf('إنستا')>-1?'instapay':t.indexOf('محفظة')>-1?'wallet':'';
      s.setAttribute('data-p2','1'); if(k) s.innerHTML=ic(k,22)+NAME[k];
    });
    var cs=document.querySelectorAll('#so-root .so-o[data-sp]:not([data-p2]),#so-croot .so-o[data-sp]:not([data-p2])');
    if(!cs.length||BZ) return; BZ=true;
    loadPR().then(function(m){
      [].forEach.call(cs,function(c){
        var pay=c.querySelector('.sp-pay'); if(!pay) return;
        var tx=pay.textContent; if(tx.indexOf('إنستا')<0&&tx.indexOf('محفظة')<0){ c.setAttribute('data-p2','1'); return; }
        var b=c.querySelector('.so-h b'), id=b?parseInt(b.textContent.replace(/\D/g,''),10):0;
        var ph=!!c.closest('#so-root'), has=!!m[id], dead=!!c.querySelector('.st-rejected,.st-cancelled'), h='<div class="sp2-row">';
        if(has) h+= ph? '<button type="button" class="sp2-up" data-sp2v="'+id+'">🧾 عرض صورة التحويل</button>' : '<span class="sp-ok">✅ تم رفع صورة التحويل</span>';
        else if(!ph&&!dead) h+=fileBtn(id);
        else if(ph) h+='<span class="muted">لسه العميل مرفعش صورة التحويل</span>';
        c.setAttribute('data-p2','1');
        pay.insertAdjacentHTML('afterend',h+'</div>');
      });
    }).catch(function(){}).then(function(){ BZ=false; });
  }
  /* ===== 4) خانة إنستا باي عند الصيدلية ===== */
  function tickSet(){
    var i=q('#sp-card [data-spi="instapay"]:not([data-p2])'); if(!i) return;
    i.setAttribute('data-p2','1'); i.maxLength=150; i.placeholder='رابط دفع إنستا باي (ipn.eg/...) أو العنوان';
    var lb=i.closest('label'); if(lb&&lb.firstChild) lb.firstChild.textContent='رابط أو عنوان إنستا باي';
  }

  document.addEventListener('change',function(e){
    var f=e.target.closest&&e.target.closest('[data-sp2f]'); if(!f||!f.files||!f.files[0]) return;
    var file=f.files[0], oid=f.getAttribute('data-sp2f'); f.value='';
    upload(file,oid);
  });
  document.addEventListener('click',function(e){
    var v=e.target.closest('[data-sp2v]'); if(v){
      e.preventDefault(); var id=v.getAttribute('data-sp2v'), p=PR[id]; if(!p) return;
      Promise.resolve(sb.storage.from('transfer-proofs').createSignedUrl(p,300)).then(function(r){
        if(!r||r.error||!r.data) return toast('تعذّر عرض الصورة');
        var o=document.createElement('div'); o.className='sp2-ov';
        o.innerHTML='<img alt=""><button type="button">إغلاق</button>'; o.querySelector('img').src=r.data.signedUrl;
        o.addEventListener('click',function(){ o.remove(); }); document.body.appendChild(o);
      });
    }
  });

  var T=null;
  function tick(){ try{ tickCart(); tickDone(); tickCards(); tickSet(); }catch(e){ console.warn('store-pay2',e); } }
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(tick,120); }).observe(document.body,{childList:true,subtree:true});
  tick();
}catch(e){ console.warn('store-pay2',e); }})();
