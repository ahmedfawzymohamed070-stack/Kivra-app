/* Kivra: store-pay.js - طرق الدفع (عند الاستلام / إنستا باي / محفظة) + أرقام الصيدلية + تأكيد التحويل. بيضيف على الموجود من غير ما يعدّل فيه */
(function(){try{
  var PH='', PAY='cod', SNAP=null, PI={}, PINF={}, PM={}, PMT=0, T=null;
  var _r=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){ if((n==='store_view'||n==='store_public_profile')&&a&&a.p_pharmacy) PH=a.p_pharmacy; return _r(n,a,o); };
  var LBL={cod:'💵 الدفع عند الاستلام',instapay:'📲 إنستا باي',wallet:'👛 محفظة إلكترونية'};
  var q=function(s){return document.querySelector(s)};

  var st=document.createElement('style');
  st.textContent=`
  .sp-sel{margin:12px 0;padding:10px;border:1px solid #dfe8e7;border-radius:14px;background:#fafdfc}
  .sp-t{font-weight:800;margin-bottom:8px;color:#1c2423}
  .sp-o{display:block;width:100%;text-align:right;margin:6px 0;padding:11px 12px;border-radius:12px;font-size:14px;font-weight:700;background:#fff!important;color:#1F6F6B!important;border:1.5px solid #cfe3e0!important;box-shadow:none!important}
  .sp-o.on{background:#e8f5f3!important;border-color:#1F6F6B!important}
  .sp-o.on:before{content:"● ";color:#1F6F6B}
  .sp-h{font-size:12px;color:#5b6b69;margin-top:6px;line-height:1.7}
  .sp-pay{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;padding:8px 10px;background:#f5f9f8;border-radius:10px;font-size:13px}
  .sp-pay b{color:#1c2423}
  .sp-pay button{padding:7px 12px;font-size:13px;border-radius:10px}
  .sp-ok{color:#0a5a41;font-weight:700}.sp-wt{color:#8a5a00;font-weight:700}
  .sp-done{margin:12px 0;padding:12px;background:#eef6f5;border-radius:14px;text-align:right;line-height:1.9;font-size:14px}
  .sp-n{direction:ltr;display:inline-block;font-size:18px;font-weight:800;color:#1F6F6B;word-break:break-all}`;
  document.head.appendChild(st);

  /* أرقام الدفع بتاعة صيدلية (بتتحمّل مرة وتتخزن) */
  function info(pid){
    if(PI[pid]) return PI[pid];
    if(PINF[pid]) return null;
    PINF[pid]=1;
    Promise.resolve(_r('store_get_pay_info',{p_pharmacy:pid})).then(function(r){
      var d=r&&!r.error?r.data:null; if(Array.isArray(d)) d=d[0];
      if(d&&d.store_get_pay_info) d=d.store_get_pay_info;
      PI[pid]=d||{}; tick();
    }).catch(function(){ PI[pid]={}; tick(); });
    return null;
  }

  /* ===== العميل: اختيار طريقة الدفع في السلة ===== */
  function hint(pi){
    if(PAY==='instapay') return 'بعد إرسال الطلب هتلاقي رقم إنستا باي الصيدلية تحوّل عليه.';
    if(PAY==='wallet') return 'بعد إرسال الطلب هتلاقي رقم المحفظة تحوّل عليه'+(pi.note?' ('+esc(pi.note)+')':'')+'.';
    return 'هتدفع للمندوب أو في الصيدلية وقت الاستلام.';
  }
  function tickCart(){
    var sh=q('#sx-sheet'); if(!sh||!PH) return;
    var sum=sh.querySelector('.sx-sum'); if(!sum||sh.querySelector('.sp-sel')) return;
    var pi=info(PH); if(!pi) return;
    var o=[['cod']]; if(pi.instapay) o.push(['instapay']); if(pi.wallet) o.push(['wallet']);
    if(!o.some(function(x){return x[0]===PAY})) PAY='cod';
    sum.insertAdjacentHTML('beforebegin','<div class="sp-sel"><div class="sp-t">طريقة الدفع</div>'
      +o.map(function(x){ return '<button type="button" class="sp-o'+(PAY===x[0]?' on':'')+'" data-spm="'+x[0]+'">'+LBL[x[0]]+'</button>'; }).join('')
      +'<div class="sp-h">'+hint(pi)+'</div></div>');
  }
  /* لقطة لحظة الضغط على إرسال (الإجمالي وطريقة الدفع) */
  document.addEventListener('click',function(e){
    if(!e.target.closest('[data-sxa="send"]')) return;
    var sh=q('#sx-sheet'), sm=sh&&sh.querySelector('.sx-sum'), l=sm&&sm.lastElementChild, sp=l&&l.querySelectorAll('span,b');
    SNAP={pay:PAY,ph:PH,total:(sp&&sp.length)?sp[sp.length-1].textContent.trim():''};
  },true);
  /* شاشة "تم إرسال طلبك": نسجّل طريقة الدفع ونعرض تعليمات الدفع */
  function tickDone(){
    var sh=q('#sx-sheet'); if(!sh||sh.getAttribute('data-sp')||!SNAP) return;
    var p=sh.querySelector('.sx-p'); if(!p||p.textContent.indexOf('تم إرسال طلبك')<0) return;
    sh.setAttribute('data-sp','1');
    var s=SNAP; SNAP=null; PAY='cod';
    Promise.resolve(_r('store_set_order_pay',{p_pay:s.pay})).catch(function(){});
    var pi=PI[s.ph]||{}, num=s.pay==='instapay'?pi.instapay:s.pay==='wallet'?pi.wallet:'', h;
    if(num){
      h='<div class="sp-done">'+LBL[s.pay]+'<br>حوّل <b>'+esc(s.total)+'</b> على:<br><span class="sp-n">'+esc(num)+'</span><br>'
        +'<button type="button" data-spa="copy" data-v="'+esc(num)+'" style="padding:7px 14px;font-size:13px">نسخ الرقم</button>'
        +(s.pay==='wallet'&&pi.note?'<div class="muted">'+esc(pi.note)+'</div>':'')
        +'<div class="muted">الصيدلية هتأكد استلام التحويل وتجهّز طلبك.</div></div>';
    } else h='<div class="sp-done">💵 هتدفع <b>'+esc(s.total)+'</b> عند الاستلام.</div>';
    var b=p.querySelector('[data-sxa="close"]');
    if(b) b.insertAdjacentHTML('beforebegin',h); else p.insertAdjacentHTML('beforeend',h);
  }

  /* ===== الصيدلية: أرقام الدفع جوه بروفايل المتجر ===== */
  function tickSet(){
    var h=q('#sx-host'); if(!h||q('#sp-card')||typeof ME==='undefined'||!ME||ME.role!=='pharmacy') return;
    var pi=info(ME.id); if(!pi) return;
    h.insertAdjacentHTML('beforeend','<div class="card" id="sp-card"><h2>💳 طرق الدفع</h2>'
      +'<div class="muted">العميل بيحوّل لرقمك مباشرة. سيب الخانة فاضية لو مش بتقبل الطريقة دي. الدفع عند الاستلام متاح دايماً.</div>'
      +'<label>رقم أو عنوان إنستا باي<input data-spi="instapay" maxlength="80" placeholder="مثال: name@instapay" value="'+esc(pi.instapay||'')+'"></label>'
      +'<label>رقم المحفظة الإلكترونية<input data-spi="wallet" type="tel" maxlength="30" value="'+esc(pi.wallet||'')+'"></label>'
      +'<label>ملاحظة للعميل (اختياري)<input data-spi="note" maxlength="80" placeholder="مثال: فودافون كاش" value="'+esc(pi.note||'')+'"></label>'
      +'<button type="button" data-spa="savepay">حفظ طرق الدفع</button></div>');
  }

  /* ===== شارة الدفع على كروت الطلبات (صيدلية وعميل) ===== */
  function loadPM(){
    if(Date.now()-PMT<3000) return Promise.resolve(PM);
    return Promise.resolve(_r('store_orders_pay')).then(function(r){
      var d=r&&!r.error?r.data:null; if(d&&!Array.isArray(d)&&d.store_orders_pay) d=d.store_orders_pay;
      var m={}; (Array.isArray(d)?d:[]).forEach(function(x){ m[x.id]=x; }); PM=m; PMT=Date.now(); return m;
    }).catch(function(){ PMT=Date.now(); return PM; });
  }
  var SEL='#so-root .so-o:not([data-sp]),#so-croot .so-o:not([data-sp])', BUSY=false;
  function tickCards(){
    if(BUSY||!document.querySelector(SEL)) return;
    BUSY=true;
    loadPM().then(function(m){
      [].forEach.call(document.querySelectorAll(SEL),function(c){
        var b=c.querySelector('.so-h b'), id=b?parseInt(b.textContent.replace(/\D/g,''),10):0, x=m[id], hd=c.querySelector('.so-h');
        if(!x||!hd) return;
        c.setAttribute('data-sp','1');
        var cod=x.payment_method==='cod'||!x.payment_method, done=x.payment_status==='confirmed', ph=!!c.closest('#so-root');
        var dead=!!c.querySelector('.st-rejected,.st-cancelled');
        var t='<div class="sp-pay"><span>'+(LBL[x.payment_method]||LBL.cod)+'</span>';
        if(!cod) t+=done?'<span class="sp-ok">✅ تم تأكيد الدفع</span>':'<span class="sp-wt">⏳ '+(ph?'في انتظار تأكيدك':'في انتظار تأكيد الصيدلية')+'</span>';
        if(ph&&!cod&&!done&&!dead) t+='<button type="button" data-spa="confirm" data-id="'+id+'">✅ تأكيد استلام التحويل</button>';
        hd.insertAdjacentHTML('afterend',t+'</div>');
      });
    }).catch(function(){}).then(function(){ BUSY=false; });
  }

  /* ===== الأزرار ===== */
  document.addEventListener('click',function(e){
    var m=e.target.closest('.sp-o');
    if(m){ e.preventDefault(); PAY=m.getAttribute('data-spm'); var s=q('.sp-sel'); if(s) s.remove(); tickCart(); return; }
    var b=e.target.closest('[data-spa]'); if(!b) return;
    var k=b.getAttribute('data-spa');
    if(k==='copy'){ try{ navigator.clipboard.writeText(b.getAttribute('data-v')); toast('تم نسخ الرقم'); }catch(x){ toast(b.getAttribute('data-v')); } return; }
    if(k==='savepay') run(async function(){
      var v=function(n){ var e=q('#sp-card [data-spi="'+n+'"]'); return e?e.value.trim():''; };
      var d={instapay:v('instapay'),wallet:v('wallet'),note:v('note')};
      ok(await _r('store_set_pay_info',{p_instapay:d.instapay,p_wallet:d.wallet,p_note:d.note}));
      PI[ME.id]=d; toast('تم حفظ طرق الدفع');
    });
    if(k==='confirm') run(async function(){
      ok(await _r('store_set_payment_status',{p_id:Number(b.getAttribute('data-id')),p_status:'confirmed'}));
      toast('تم تأكيد الدفع'); PMT=0;
      [].forEach.call(document.querySelectorAll('.so-o[data-sp]'),function(c){ var p=c.querySelector('.sp-pay'); if(p) p.remove(); c.removeAttribute('data-sp'); });
      tick();
    });
  });

  function tick(){ try{ tickCart(); tickDone(); tickSet(); tickCards(); }catch(e){ console.warn('store-pay',e); } }
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(tick,80); }).observe(document.body,{childList:true,subtree:true});
  tick();
}catch(e){ console.warn('store-pay',e); }})();
