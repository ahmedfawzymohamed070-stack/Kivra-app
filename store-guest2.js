/* Kivra: store-guest.js - تصفح المتجر بدون حساب، والتسجيل بيتطلب عند إرسال الطلب (وضع المعاينة بس) */
(function(){try{
  var pv=localStorage.getItem('kivra_preview');
  if(!pv||pv==='off'||pv==='0'||pv==='false') return;
  if(typeof sb==='undefined') return;
  var CARTP='', RUN=false, KEY='kivra_gx_cart', PH=[], CUR=null, PROF={}, MAP={}, CART={}, ov=null, btn=null, ITEMS=[];
  var st=document.createElement('style');
  st.textContent=`
  #gx{position:fixed;inset:0;z-index:70;background:#f4f8f7;overflow:auto;display:none}
  .gx-top{position:sticky;top:0;z-index:2;background:#1F6F6B;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top))}
  .gx-top button{background:rgba(255,255,255,.18);color:#fff;border:0;border-radius:10px;padding:8px 14px;font-size:16px}
  .gx-body{padding:12px;padding-bottom:110px;max-width:760px;margin:0 auto}
  .gx-ph{background:#fff;border:1px solid #e3ecea;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 1px 5px rgba(16,60,56,.08)}
  .gx-ph b{font-size:17px;color:#1c2423}.gx-m{color:#6b7c7a;font-size:13px;margin-top:3px}
  .gx-go{width:100%;margin-top:10px;background:#1F6F6B;color:#fff;border:0;border-radius:12px;padding:11px;font-weight:700;font-size:15px}
  .gx-ch{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.gx-ch span{background:#e8f3f1;color:#1F6F6B;border-radius:99px;padding:4px 10px;font-size:12px;font-weight:600}
  .gx-op{font-size:12px;font-weight:700;padding:2px 10px;border-radius:99px;margin-inline-start:8px}.gx-op.y{background:#d8f3e8;color:#0a5a41}.gx-op.n{background:#fde2de;color:#9b2a1d}
  .gx-sr{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dfe8e7;border-radius:12px;margin:8px 0;font-size:15px}
  .gx-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .gx-c{background:#fff;border:1px solid #e3ecea;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 5px rgba(16,60,56,.08)}
  .gx-i{position:relative;aspect-ratio:1/1;background:#f3f6f6;display:flex;align-items:center;justify-content:center;font-size:46px;overflow:hidden}
  .gx-i img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
  .gx-b{position:absolute;top:8px;right:8px;background:#e11d48;color:#fff;font-weight:800;font-size:13px;padding:3px 9px;border-radius:8px}
  .gx-t{padding:8px 10px 0;flex:1}.gx-br{font-size:11px;color:#6b7c7a}
  .gx-n{font-size:14px;font-weight:700;line-height:1.4;color:#1c2423;min-height:2.8em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .gx-p{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 8px;margin-top:6px}.gx-p b{font-size:18px;color:#1F6F6B}.gx-p s{font-size:12px;color:#8a9694}
  .gx-sv{display:inline-block;margin-top:4px;background:#dcfce7;color:#166534;font-weight:700;font-size:11px;padding:2px 8px;border-radius:6px}
  .gx-e{margin-top:5px;font-size:12px;font-weight:700;color:#b45309;background:#fef3c7;border-radius:6px;padding:3px 8px;display:inline-block}
  .gx-s{font-size:11px;color:#6b7c7a;margin-top:6px}
  .gx-a{margin:8px 10px 10px;background:#1F6F6B;color:#fff;border:0;border-radius:12px;padding:10px;font-weight:700;font-size:13px}
  .gx-a:disabled{background:#cfd8d7}
  .gx-bar{position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:3;background:#1F6F6B;color:#fff;border:0;border-radius:16px;padding:15px;font-weight:800;font-size:15px;box-shadow:0 6px 18px rgba(16,60,56,.35)}
  .gx-ci{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eef3f2}
  .gx-q{display:flex;gap:10px;align-items:center}.gx-q button{width:34px;height:34px;border-radius:10px;border:0;background:#e8f3f1;color:#1F6F6B;font-size:18px}
  .gx-tt{display:flex;justify-content:space-between;padding:4px 0}
  #gx-pr{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.45);display:flex;align-items:flex-end}
  .gx-pb{background:#fff;width:100%;max-width:760px;margin:0 auto;border-radius:22px 22px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom))}
  #gx-open{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:40;background:#1F6F6B;color:#fff;border:0;border-radius:16px;padding:15px;font-weight:800;font-size:16px;box-shadow:0 6px 18px rgba(16,60,56,.35)}
  #gx-note{position:fixed;top:0;left:0;right:0;z-index:80;background:#fef3c7;color:#92400e;text-align:center;padding:10px;font-weight:700;font-size:14px}`;
  document.head.appendChild(st);

  var num=function(v){var n=Number(v);return isFinite(n)?n:0};
  var E=function(s){return esc(s==null?'':s)};
  var M=function(v){try{return money(v)}catch(e){return num(v).toFixed(2)+' ج.م'}};
  var T=function(m){try{toast(m)}catch(e){}};
  var key=function(x){return String(x.brand||'').trim()+'|'+String(x.name||'').trim()};
  function img(p){ if(!p) return ''; if(/^https?:/.test(p)) return p; try{ return sb.storage.from('product-images').getPublicUrl(p).data.publicUrl; }catch(e){ return ''; } }
  function disc(x){ var o=num(x.old_price), p=num(x.price); if(!(o>p)) return {off:0,old:0,end:''}; if(x.sale_ends&&new Date(x.sale_ends)<=new Date()) return {off:0,old:0,end:''}; return {off:Math.round((1-p/o)*100),old:o,end:x.sale_ends||''}; }
  function left(iso){ var ms=new Date(iso)-new Date(); if(!(ms>0)) return ''; var m=Math.floor(ms/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60); return '⏳ ينتهي العرض '+(d>0?'بعد '+d+' يوم':h>0?'بعد '+h+' ساعة':'بعد '+m+' دقيقة'); }
  var count=function(){var n=0;Object.keys(CART).forEach(function(i){n+=CART[i].q});return n};
  var sub=function(){var s=0;Object.keys(CART).forEach(function(i){s+=num(CART[i].it.price)*CART[i].q});return s};

  function shell(title,back,inner){
    ov.innerHTML='<div class="gx-top">'+(back?'<button type="button" data-g="'+back+'">→</button>':'<span></span>')+'<b>'+title+'</b><button type="button" data-g="login">👤 دخول</button></div><div class="gx-body">'+inner+'</div>'+bar();
  }
  function bar(){ return (CUR&&count())?'<button type="button" class="gx-bar" data-g="cart">🛒 '+count()+' منتج · '+M(sub())+' — عرض السلة</button>':''; }
  function showOv(){ if(!ov){ ov=document.createElement('div'); ov.id='gx'; document.body.appendChild(ov); } ov.style.display='block'; if(btn) btn.style.display='none'; }
  function hideOv(){ if(ov) ov.style.display='none'; if(btn) btn.style.display=''; }

  async function loadList(){
    showOv(); shell('الصيدليات',null,'<p class="gx-m">جاري التحميل...</p>');
    var r=await sb.rpc('store_list_pharmacies');
    if(r.error){ shell('الصيدليات',null,'<div class="gx-ph">التصفح للزوار مش متاح دلوقتي.<div class="gx-m">'+E(r.error.message)+'</div></div>'); return; }
    PH=r.data||[]; CUR=null;
    shell('الصيدليات',null,PH.length?PH.map(function(p){return '<div class="gx-ph"><b>'+E(p.store_name)+'</b><div class="gx-m">'+E(p.address)+'</div><div class="gx-m">'+E(p.products_count)+' منتج</div><button type="button" class="gx-go" data-g="shop" data-id="'+E(p.id)+'">عرض المتجر</button></div>'}).join(''):'<p class="gx-m">لا توجد صيدليات متاحة دلوقتي.</p>');
  }
  async function loadShop(id){
    CUR=PH.find(function(p){return String(p.id)===String(id)}); if(!CUR) return loadList();
    if(CARTP!==CUR.id){ CART={}; CARTP=CUR.id; }
    shell(E(CUR.store_name),'list','<p class="gx-m">جاري التحميل...</p>');
    var res=await Promise.all([sb.rpc('store_view',{p_pharmacy:CUR.id}),sb.rpc('store_public_profile',{p_pharmacy:CUR.id})]);
    ITEMS=(res[0].error?[]:res[0].data)||[]; PROF=(!res[1].error&&res[1].data&&res[1].data.profile)||{};
    MAP={}; ITEMS.forEach(function(x){MAP[x.id]=x});
    drawShop('');
  }
  function drawShop(q){
    var open=PROF.is_open!==false, ch=[];
    if(PROF.delivery_time) ch.push('⏱ '+PROF.delivery_time);
    if(num(PROF.min_order)>0) ch.push('🛒 أقل طلب '+M(PROF.min_order));
    if(num(PROF.free_over)>0) ch.push('توصيل مجاني فوق '+M(PROF.free_over));
    var l=ITEMS.filter(function(x){return [x.name,x.brand,x.category].join(' ').toLowerCase().indexOf(q.toLowerCase())>-1});
    var h='<div class="gx-ph"><b>'+E(CUR.store_name)+'</b><span class="gx-op '+(open?'y':'n')+'">'+(open?'مفتوح':'مغلق حالياً')+'</span><div class="gx-m">'+E(CUR.address)+'</div>'+(ch.length?'<div class="gx-ch">'+ch.map(function(c){return '<span>'+E(c)+'</span>'}).join('')+'</div>':'')+'</div>'
      +'<input class="gx-sr" id="gx-q" placeholder="ابحث في المتجر" value="'+E(q)+'"><div class="gx-g" id="gx-g">'+(l.length?l.map(function(x){return card(x,open)}).join(''):'')+'</div>'+(l.length?'':'<p class="gx-m">لا توجد منتجات.</p>');
    shell(E(CUR.store_name),'list',h);
    var i=document.getElementById('gx-q'); if(i){ i.oninput=function(){ var v=i.value; drawShop(v); var n=document.getElementById('gx-q'); n.focus(); n.setSelectionRange(v.length,v.length); }; }
  }
  function card(x,open){
    var d=disc(x),u=img(x.image_path),s=num(x.stock),c=CART[x.id],sv=d.off?d.old-num(x.price):0;
    return '<div class="gx-c"><div class="gx-i">'+(u?'<img loading="lazy" src="'+E(u)+'" alt="" onerror="this.remove()">':'<span>🧴</span>')+(d.off?'<span class="gx-b">-'+d.off+'%</span>':'')+'</div>'
     +'<div class="gx-t"><div class="gx-br">'+E(x.brand||'')+'</div><div class="gx-n">'+E(x.name)+'</div>'
     +'<div class="gx-p"><b>'+M(x.price)+'</b>'+(d.off?'<s>'+M(d.old)+'</s>':'')+'</div>'
     +(d.off?'<span class="gx-sv">وفّر '+M(sv)+'</span>':'')+(d.end?'<div class="gx-e">'+left(d.end)+'</div>':'')
     +'<div class="gx-s">'+(s>0?(s<=5?'باقي '+s+' فقط':'متوفر'):'غير متوفر')+'</div></div>'
     +'<button type="button" class="gx-a" data-g="add" data-i="'+E(x.id)+'"'+((s>0&&open)?'':' disabled')+'>'+(s<=0?'غير متوفر':!open?'المتجر مغلق':c?'✓ في السلة ('+c.q+') — أضف':'+ أضف للسلة')+'</button></div>';
  }
  function openCart(){
    var rows=Object.keys(CART).map(function(i){var c=CART[i];return '<div class="gx-ci"><div style="flex:1;min-width:0"><b>'+E(c.it.name)+'</b><div class="gx-m">'+M(c.it.price)+'</div></div><div class="gx-q"><button type="button" data-g="cq" data-i="'+E(i)+'" data-d="-1">−</button><b>'+c.q+'</b><button type="button" data-g="cq" data-i="'+E(i)+'" data-d="1">+</button></div></div>'}).join('');
    var mo=num(PROF.min_order), low=sub()<mo;
    shell('سلتك','shopback',(rows||'<p class="gx-m">السلة فاضية.</p>')+'<div class="gx-tt"><span>المنتجات</span><b>'+M(sub())+'</b></div><div class="gx-m">رسوم التوصيل بتتحسب عند إتمام الطلب.</div>'
      +(low?'<p style="color:#9b2a1d;font-weight:700">أقل قيمة للطلب '+M(mo)+'</p>':'')
      +(rows?'<button type="button" class="gx-go" data-g="login">سجّل الدخول لإرسال الطلب</button><p class="gx-m">محتاج حساب عشان نبعت طلبك للصيدلية ونتابعه معاك.</p>':''));
  }
  function goLogin(){
    if(CUR&&count()){
      var items=Object.keys(CART).map(function(i){return {k:key(CART[i].it),q:CART[i].q}});
      try{ localStorage.setItem(KEY,JSON.stringify({pid:CUR.id,items:items})); }catch(e){}
    }
    hideOv();
    var n=document.getElementById('gx-note'); if(!n){ n=document.createElement('div'); n.id='gx-note'; n.textContent='سجّل الدخول أو أنشئ حساب (عميل)، وتقدر ترجع للمتجر من الزرار تحت'; document.body.appendChild(n); setTimeout(function(){n.remove()},9000); }
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('#gx [data-g]'); if(!b) return;
    var a=b.dataset.g, id=b.dataset.i;
    if(a==='exit') return hideOv();
    if(a==='list') return loadList();
    if(a==='shop') return loadShop(b.dataset.id);
    if(a==='shopback') return drawShop('');
    if(a==='cart') return openCart();
    if(a==='login') return goLogin();
    if(a==='add'){ var it=MAP[id]; if(!it) return; var c=CART[id], q=(c?c.q:0)+1; if(q>num(it.stock)){ T('الكمية المتاحة '+num(it.stock)+' فقط'); return; } CART[id]={it:it,q:q}; b.textContent='✓ في السلة ('+q+') — أضف'; var old=ov.querySelector('.gx-bar'); if(old) old.remove(); ov.insertAdjacentHTML('beforeend',bar()); return; }
    if(a==='cq'){ var c2=CART[id]; if(!c2) return; var nq=c2.q+Number(b.dataset.d); if(nq<=0) delete CART[id]; else c2.q=Math.min(nq,num(c2.it.stock)); if(count()) openCart(); else drawShop(''); return; }
  });

  function prompt(){
    if(sessionStorage.getItem('gx_pr')) return;
    try{ sessionStorage.setItem('gx_pr','1'); }catch(e){}
    var d=document.createElement('div'); d.id='gx-pr';
    d.innerHTML='<div class="gx-pb"><b style="font-size:18px">أهلاً بيك في Kivra 👋</b><p class="gx-m">سجّل الدخول أو أنشئ حساب عشان تقدر تبعت طلبك. وتقدر تتصفح الأول.</p><button type="button" class="gx-go" data-p="login">تسجيل الدخول / حساب جديد</button><button type="button" class="gx-go" style="background:#e8f3f1;color:#1F6F6B" data-p="skip">تصفح الأول</button></div>';
    d.onclick=function(e){ var a=e.target.dataset.p; if(a==='login'){ d.remove(); goLogin(); } else if(a==='skip'||e.target===d) d.remove(); };
    document.body.appendChild(d);
  }
  function startGuest(){
    loadList().then(function(){
      var sid=''; try{ sid=new URLSearchParams(location.search).get('store')||''; }catch(e){}
      if(sid&&PH.some(function(p){return String(p.id)===sid})) loadShop(sid);
      setTimeout(prompt,500);
    });
  }
  function showEntry(){
    if(btn||document.getElementById('gx-open')) return;
    btn=document.createElement('button'); btn.id='gx-open'; btn.type='button'; btn.textContent='🏪 العودة لتصفح الصيدليات'; btn.style.display='none';
    btn.onclick=function(){ if(ov&&ov.innerHTML) showOv(); else loadList(); }; document.body.appendChild(btn);
  }
  function clearEntry(){ if(btn){ btn.remove(); btn=null; } if(ov){ ov.remove(); ov=null; } var pr=document.getElementById('gx-pr'); if(pr) pr.remove(); }

  function restore(){
    var p=null; try{ p=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
    if(!p||!p.pid||RUN) return;
    RUN=true;
    var n=0, stage=0, t=setInterval(function(){
      n++; if(n>60){ clearInterval(t); return; }
      if(typeof ME==='undefined'||!ME) return;
      if(ME.role!=='customer'){ try{localStorage.removeItem(KEY)}catch(e){} clearInterval(t); return; }
      if(stage===0){ var b=document.querySelector('#cl [data-act="cshop"][data-id="'+p.pid+'"]'); if(b){ b.click(); stage=1; } return; }
      if(stage===1){
        if(!document.querySelector('#main .sx-hd')) return;
        var cards=[].slice.call(document.querySelectorAll('#sf .sf-c[data-sxk]')); if(!cards.length) return;
        p.items.forEach(function(it){ var c=cards.find(function(x){return x.dataset.sxk===it.k}); var ab=c&&c.querySelector('[data-sxa="add"]'); if(ab) for(var i=0;i<it.q;i++) ab.click(); });
        stage=2; return;
      }
      if(stage===2){ var bar2=document.getElementById('sx-bar'); if(bar2){ bar2.click(); } try{localStorage.removeItem(KEY)}catch(e){} T('رجّعنا سلتك'); clearInterval(t); }
    },400);
  }

  sb.auth.getSession().then(function(r){ if(!(r&&r.data&&r.data.session)){ showEntry(); startGuest(); } else restore(); }).catch(function(){});
  sb.auth.onAuthStateChange(function(ev,ses){
    if(ses){ clearEntry(); var nn=document.getElementById('gx-note'); if(nn) nn.remove(); restore(); }
    else if(ev==='SIGNED_OUT'){ showEntry(); startGuest(); }
  });
}catch(e){}})();
