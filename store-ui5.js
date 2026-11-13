/* Kivra: store-ui5.js - قايمة الصيدليات + هيدر صفحة الصيدلية (بيملك الـ markup بتاعه) ويخبّي زرار "متجري" العايم القديم */
(function(){try{
  var LAST='', PROF={}, PN=null, T=null;
  var _r=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){ if(n==='store_view'&&a&&a.p_pharmacy) LAST=a.p_pharmacy; return _r(n,a,o); };

  var st=document.createElement('style');
  st.textContent=`
  .sx-hd,.sx-bn{display:none!important}
  #sf{padding-bottom:120px}
  .sf-ctl{background:#fff;border:1px solid #e3ecea;border-radius:14px;padding:10px!important}
  .sf-h{font-size:17px!important}
  .u5c{background:#fff;border:1px solid #e3ecea;border-radius:18px;box-shadow:0 1px 6px rgba(16,60,56,.1);overflow:hidden;margin-bottom:14px;cursor:pointer}
  .u5c.cl{opacity:.72}
  .u5cv{height:96px;background:linear-gradient(135deg,#1F6F6B,#3aa59d) center/cover no-repeat;position:relative}
  .u5b{padding:0 12px 12px}
  .u5lg{width:56px;height:56px;border-radius:16px;background:#fff;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.18);margin-top:-28px;position:relative;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#1F6F6B;overflow:hidden}
  .u5lg img{width:100%;height:100%;object-fit:cover}
  .u5n{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
  .u5n b,.u5n h2{font-size:17px;font-weight:800;color:#1c2423;margin:0}
  .u5st{font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px}
  .u5st.on{background:#dcfce7;color:#166534}
  .u5st.off{background:#fee2e2;color:#b91c1c}
  .u5m{font-size:13px;color:#5b6b69;margin-top:4px}
  .u5ch{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .u5ch span{background:#eef6f5;color:#1F6F6B;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}
  .u5h{background:#fff;border:1px solid #e3ecea;border-radius:20px;box-shadow:0 1px 8px rgba(16,60,56,.1);overflow:hidden;margin-bottom:12px}
  .u5h .u5cv{height:150px}
  .u5bk{position:absolute;top:10px;right:10px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.94)!important;color:#1F6F6B!important;font-size:20px;font-weight:800;padding:0!important;border:0!important;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.2)}
  .u5ac{display:flex;gap:8px;margin-top:12px}
  .u5a{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;background:#e8f5f3;color:#1F6F6B}
  .u5a.p{background:#1F6F6B;color:#fff}
  .u5bn{display:flex;gap:10px;overflow-x:auto;padding:0 12px 12px;scroll-snap-type:x mandatory;scrollbar-width:none}
  .u5bn::-webkit-scrollbar{display:none}
  .u5bn img{flex:0 0 86%;height:120px;object-fit:cover;border-radius:14px;scroll-snap-align:start;background:#eef1f1}`;
  document.head.appendChild(st);

  var num=function(v){var n=Number(v);return isFinite(n)?n:0};
  var q=function(s){return document.querySelector(s)};
  function img(p){ if(!p) return ''; if(/^https?:/.test(p)) return p; try{ return sb.storage.from('product-images').getPublicUrl(p).data.publicUrl; }catch(e){ return ''; } }
  function cssu(u){ return 'url("'+String(u).replace(/[()"'\\]/g,function(c){return '%'+c.charCodeAt(0).toString(16)})+'")'; }

  /* بيانات بروفايل الصيدلية (غلاف/لوجو/توصيل/مفتوح..). لو الاستدعاء فشل بنكمل من غيرها */
  function prof(id){
    if(PROF[id]!==undefined) return Promise.resolve(PROF[id]);
    var names=PN?[PN]:['p_pharmacy','p_pharmacy_id','p_id'], i=0;
    function next(){
      if(i>=names.length){ PROF[id]=null; return Promise.resolve(null); }
      var nm=names[i++], a={}; a[nm]=id;
      return Promise.resolve(_r('store_public_profile',a)).then(function(r){
        if(r&&!r.error&&r.data){
          PN=nm; var d=Array.isArray(r.data)?r.data[0]:r.data;
          if(d&&d.store_public_profile) d=d.store_public_profile;
          PROF[id]=d?{p:d.profile||d,b:d.banners||[]}:null; return PROF[id];
        }
        return next();
      }).catch(next);
    }
    return next();
  }
  function chips(p){
    var a=[];
    if(p.delivery_time) a.push('⏱ '+esc(p.delivery_time));
    if(num(p.delivery_fee)>0) a.push('🛵 توصيل '+money(p.delivery_fee));
    if(num(p.min_order)>0) a.push('الحد الأدنى '+money(p.min_order));
    if(num(p.free_over)>0) a.push('مجاني فوق '+money(p.free_over));
    if(p.hours) a.push('🕒 '+esc(p.hours));
    return a.map(function(s){return '<span>'+s+'</span>'}).join('');
  }
  function stat(p){ return p.is_open===true?'<span class="u5st on">مفتوح</span>':p.is_open===false?'<span class="u5st off">مغلق</span>':''; }
  function paint(root,d){
    if(!root||!d) return; var p=d.p||{};
    var cv=root.querySelector('.u5cv'), lg=root.querySelector('.u5lg'), s=root.querySelector('.u5s'), c=root.querySelector('.u5ch'), tg=root.querySelector('.u5tg'), bn=root.querySelector('.u5bn');
    if(cv&&p.cover_url&&img(p.cover_url)) cv.style.backgroundImage=cssu(img(p.cover_url));
    if(lg&&p.logo_url&&img(p.logo_url)) lg.innerHTML='<img src="'+esc(img(p.logo_url))+'" alt="">';
    if(s) s.innerHTML=stat(p);
    if(c) c.innerHTML=chips(p);
    if(tg&&p.tagline) tg.textContent=p.tagline;
    if(root.classList.contains('u5c')&&p.is_open===false) root.classList.add('cl');
    if(bn&&d.b&&d.b.length) bn.innerHTML=d.b.map(function(b){ var u=img(b.image_url); return u?'<img loading="lazy" src="'+esc(u)+'" alt="'+esc(b.title||'')+'">':''; }).join('');
  }

  /* قايمة الصيدليات: بنقرا الكروت القديمة (#cl .wh) ونبدلها بكروت جديدة. الضغط بيفتح الصيدلية بنفس data-act القديم */
  function tickList(){
    var cl=q('#cl'); if(!cl) return;
    var olds=cl.querySelectorAll('.wh'); if(!olds.length) return;
    var arr=[].map.call(olds,function(w){
      var b=w.querySelector('[data-act="cshop"]'), m=w.querySelectorAll('.muted');
      return {id:b?b.getAttribute('data-id'):'', name:((w.querySelector('.in b')||{}).textContent||'').trim(), addr:((m[0]||{}).textContent||'').trim(), cnt:((m[1]||{}).textContent||'').trim()};
    }).filter(function(x){return x.id});
    if(!arr.length) return;
    cl.innerHTML=arr.map(function(x){
      return '<div class="u5c" data-act="cshop" data-id="'+esc(x.id)+'"><div class="u5cv"></div><div class="u5b">'
       +'<div class="u5lg">'+esc(x.name.charAt(0)||'؟')+'</div>'
       +'<div class="u5n"><b>'+esc(x.name)+'</b><span class="u5s"></span></div>'
       +'<div class="u5m">⭐ جديد'+(x.cnt?' · '+esc(x.cnt):'')+'</div>'
       +(x.addr?'<div class="u5m">📍 '+esc(x.addr)+'</div>':'')
       +'<div class="u5ch"></div></div></div>';
    }).join('');
    [].forEach.call(cl.querySelectorAll('.u5c'),function(el){ prof(el.getAttribute('data-id')).then(function(d){ paint(el,d); }); });
  }

  /* صفحة الصيدلية: بنبدّل الكارت القديم اللي فوق (رجوع + اسم + اتصال) بهيدر جديد منظم */
  function tickPage(){
    var m=q('#main'), c=m&&m.firstElementChild;
    if(!c||c.getAttribute('data-u5')||!c.querySelector('[data-act="cback"]')||!c.querySelector('h2')) return;
    var h2=c.querySelector('h2'), name=(h2.textContent||'').trim(), addr=((h2.nextElementSibling||{}).textContent||'').trim();
    var tel=c.querySelector('a[href^="tel:"]'), wa=c.querySelector('a[href^="https://wa.me/"]'), pid=LAST;
    var h='<div class="u5h" data-u5="1" data-pid="'+esc(pid)+'"><div class="u5cv"><button type="button" class="u5bk" data-act="cback" aria-label="رجوع">→</button></div>'
      +'<div class="u5b"><div class="u5lg">'+esc(name.charAt(0)||'؟')+'</div>'
      +'<div class="u5n"><h2>'+esc(name)+'</h2><span class="u5s"></span></div>'
      +'<div class="u5m u5tg"></div><div class="u5m">⭐ جديد</div>'
      +(addr?'<div class="u5m">📍 '+esc(addr)+'</div>':'')
      +'<div class="u5ch"></div>'
      +((tel||wa)?'<div class="u5ac">'+(tel?'<a class="u5a p" href="'+esc(tel.getAttribute('href'))+'">📞 اتصال</a>':'')+(wa?'<a class="u5a" href="'+esc(wa.getAttribute('href'))+'" target="_blank" rel="noopener">واتساب</a>':'')+'</div>':'')
      +'</div><div class="u5bn"></div></div>';
    c.outerHTML=h;
    if(pid) prof(pid).then(function(d){ paint(q('.u5h[data-pid="'+pid+'"]'),d); });
  }

  /* زرار "متجري" العايم القديم: بيتخبّى (مفيش حاجة بتتمسح، التبويب اللي تحت بدله) */
  function norm(e){ return (e.textContent||'').replace(/[\s\u200e\u200f]|🛍️|🛍/g,''); }
  function hideFab(){
    [].forEach.call(document.body.children,function(e){
      if(e.getAttribute('data-u5f')||(e.textContent||'').length>20) return;
      var l=[e].concat([].slice.call(e.querySelectorAll('button,a,div')));
      l.forEach(function(x){
        if(x.getAttribute('data-u5f')||norm(x)!=='متجري') return;
        if(getComputedStyle(x).position==='fixed'){ x.style.display='none'; x.setAttribute('data-u5f','1'); }
      });
    });
  }

  function tick(){ try{ tickList(); tickPage(); hideFab(); }catch(e){ console.warn('store-ui5',e); } }
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(tick,60); }).observe(document.body,{childList:true,subtree:true});
  tick();
}catch(e){ console.warn('store-ui5',e); }})();
