/* Kivra: store-returns.js - مرتجعات المتجر (14 يوم) + جملة سياسة الاسترجاع في الريسيت ورسالة الطلب */
(function(){try{
  var POL='سياسة الاسترجاع: الاسترجاع متاح خلال 14 يوم من تاريخ الاستلام، ولا تُقبل طلبات الاسترجاع بعد انتهاء هذه المدة. الاسترجاع بالتنسيق مع الصيدلية.';
  var DAYS=14, R=[], O={}, LT=0, BZ=false;
  var q=function(s){return document.querySelector(s)};
  var SN={pending:'⏳ بانتظار الصيدلية',accepted:'✅ تم قبول المرتجع',rejected:'❌ اترفض'};

  var st=document.createElement('style');
  st.textContent='.sr-row{margin-top:6px;font-size:13px;line-height:1.7}.sr-b{display:inline-block;margin:4px 0;padding:7px 14px;border-radius:10px;background:#fff;border:1.5px solid #b3261e;color:#b3261e;font-weight:700;font-size:13px}'
   +'.sr-ok{background:#1F6F6B;border-color:#1F6F6B;color:#fff}.sr-in{width:70px;padding:6px;border:1.5px solid #1F6F6B;border-radius:8px;text-align:center;font-size:15px}'
   +'.sr-pol{margin-top:10px;font-size:12px;color:#555;background:#f4f7f6;border-radius:10px;padding:8px}';
  document.head.appendChild(st);

  function load(force){
    if(!force&&Date.now()-LT<4000) return Promise.resolve();
    return Promise.resolve(sb.rpc('store_returns_list')).then(function(r){
      var d=r&&!r.error&&r.data?r.data:{}; R=d.returns||[]; O={};
      (d.orders||[]).forEach(function(o){O[o.id]=o}); LT=Date.now();
    }).catch(function(){LT=Date.now()});
  }
  function left(o,id){
    var used={}; R.forEach(function(r){ if(r.order_id===id&&r.status!=='rejected') used[r.item_id]=(used[r.item_id]||0)+r.qty; });
    return (o.items||[]).map(function(it){ return {id:String(it.id),name:it.name,left:(Number(it.qty)||0)-(used[String(it.id)]||0)}; });
  }
  function inWindow(o){ return o&&o.delivered_at&&(Date.now()-new Date(o.delivered_at).getTime())<=DAYS*86400000; }
  function reset(){
    [].forEach.call(document.querySelectorAll('[data-sr]'),function(c){ var x=c.querySelector('.sr-row'); if(x) x.remove(); c.removeAttribute('data-sr'); });
  }
  function lines(id){
    return R.filter(function(r){return r.order_id===id}).map(function(r){ return esc(r.item_name||'')+' ×'+r.qty+' — '+(SN[r.status]||r.status)+(r.status==='accepted'&&Number(r.unit_price)?'':''); });
  }

  function tickCards(){
    var cs=document.querySelectorAll('#so-croot .so-o:not([data-sr]),#so-root .so-o:not([data-sr])');
    if(!cs.length||BZ) return; BZ=true;
    load(false).then(function(){
      [].forEach.call(cs,function(c){
        var b=c.querySelector('.so-h b'), id=b?parseInt(b.textContent.replace(/\D/g,''),10):0; if(!id) return;
        var ph=!!c.closest('#so-root'), h='';
        var ls=R.filter(function(r){return r.order_id===id});
        if(ph){
          ls.forEach(function(r){
            h+='<div>↩️ '+esc(r.item_name||'')+' ×'+r.qty+' — '+(SN[r.status]||r.status)+(r.reason?' ('+esc(r.reason)+')':'')+'</div>';
            if(r.status==='pending') h+='<button type="button" class="sr-b sr-ok" data-sra="acc" data-id="'+r.id+'">قبول المرتجع</button> <button type="button" class="sr-b" data-sra="rej" data-id="'+r.id+'">رفض</button>';
          });
        }else{
          var o=O[id];
          if(o){
            ls.forEach(function(r){ h+='<div>↩️ '+esc(r.item_name||'')+' ×'+r.qty+' — '+(SN[r.status]||r.status)+'</div>'; });
            var rem=left(o,id).some(function(x){return x.left>0});
            if(inWindow(o)&&rem) h+='<button type="button" class="sr-b" data-sra="open" data-id="'+id+'">↩️ طلب مرتجع</button>';
            else if(!inWindow(o)) h+='<div class="muted">انتهت مهلة الاسترجاع ('+DAYS+' يوم)</div>';
          }
        }
        c.setAttribute('data-sr','1');
        if(h) (c.querySelector('.sp-pay')||c.querySelector('.so-h')).insertAdjacentHTML('afterend','<div class="sr-row">'+h+'</div>');
      });
    }).then(function(){BZ=false},function(){BZ=false});
  }

  function openSheet(id){
    var o=O[id]; if(!o) return;
    var L=left(o,id).filter(function(x){return x.left>0});
    var d=document.createElement('div'); d.id='sr-sheet'; d.style.cssText='position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;direction:rtl';
    d.innerHTML='<div style="background:#fff;width:100%;max-height:88vh;overflow:auto;border-radius:20px 20px 0 0;padding:16px 16px 28px;max-width:760px;margin:0 auto">'
     +'<button type="button" class="sr-b" data-sra="close" style="float:left">✕</button><h2>↩️ طلب مرتجع — طلب #'+String(id).padStart(6,'0')+'</h2>'
     +'<p class="muted">اكتب كمية كل منتج عاوز ترجّعه. الفلوس بترجّعها الصيدلية لك مباشرة.</p>'
     +L.map(function(x){return '<div class="sx-ci" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1px solid #eef3f2"><div><b>'+esc(x.name)+'</b><div class="muted">المتاح للإرجاع: '+x.left+'</div></div><input class="sr-in" type="number" min="0" max="'+x.left+'" value="0" data-srq="'+esc(x.id)+'" data-n="'+esc(x.name)+'"></div>'}).join('')
     +'<label>سبب المرتجع<input data-srr placeholder="مثلاً: منتج غلط أو تالف"></label>'
     +'<button type="button" style="width:100%" data-sra="submit" data-id="'+id+'">إرسال طلب المرتجع</button><div class="sr-pol">'+esc(POL)+'</div></div>';
    document.body.appendChild(d);
  }
  async function submit(id){
    var d=q('#sr-sheet'); if(!d) return;
    var why=(d.querySelector('[data-srr]')||{}).value||'', n=0;
    var ins=[].slice.call(d.querySelectorAll('[data-srq]'));
    for(var i=0;i<ins.length;i++){
      var qn=parseInt(ins[i].value,10)||0; if(qn<1) continue;
      ok(await sb.rpc('store_request_return',{p_order:Number(id),p_item:ins[i].getAttribute('data-srq'),p_qty:qn,p_reason:why})); n++;
    }
    if(!n) throw new Error('اكتب كمية لمنتج واحد على الأقل');
    d.remove(); toast('تم إرسال طلب المرتجع ✅'); LT=0; reset(); await load(true); tickCards();
  }
  async function decide(id,acc){
    ok(await sb.rpc('store_decide_return',{p_id:Number(id),p_accept:acc}));
    toast(acc?'تم قبول المرتجع':'تم رفض المرتجع'); LT=0; reset(); await load(true); tickCards();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-sra]'); if(!t) return;
    e.preventDefault(); var a=t.getAttribute('data-sra'), id=t.getAttribute('data-id');
    if(a==='close'){ var d=q('#sr-sheet'); if(d) d.remove(); return; }
    run(async function(){
      if(a==='open') return openSheet(Number(id));
      if(a==='submit') return submit(id);
      if(a==='acc') return decide(id,true);
      if(a==='rej') return decide(id,false);
    });
  });

  /* جملة السياسة في رسالة العميل */
  function tickMsg(){
    var sh=q('#sx-sheet'); if(!sh||sh.querySelector('.sr-pol')) return;
    var p=sh.querySelector('.sx-p'); if(!p) return;
    var t=p.textContent;
    if(t.indexOf('تم إرسال طلبك')>-1||t.indexOf('إرسال الطلب للصيدلية')>-1) p.insertAdjacentHTML('beforeend','<div class="sr-pol">'+esc(POL)+'</div>');
  }
  /* جملة السياسة في الريسيت PDF (نافذة about:blank بتتفتح من التطبيق) */
  var _open=window.open;
  window.open=function(){
    var w=_open.apply(this,arguments);
    try{ if(w){ var n=0, T=setInterval(function(){
      try{ var d=w.document;
        if(d&&d.body&&d.body.textContent.indexOf('إذن تسليم')>-1&&d.body.textContent.indexOf('العميل')>-1){
          clearInterval(T);
          if(!d.getElementById('kv-pol')){
            var p=d.createElement('div'); p.id='kv-pol'; p.style.cssText='margin-top:16px;font-size:12px;color:#444;border-top:1px dashed #999;padding-top:8px;text-align:right';
            p.textContent=POL; var bt=d.querySelector('button'); if(bt&&bt.parentNode) bt.parentNode.insertBefore(p,bt); else d.body.appendChild(p);
          }
        }
      }catch(e){} if(++n>40) clearInterval(T);
    },150); } }catch(e){}
    return w;
  };

  var T2=null;
  new MutationObserver(function(){ clearTimeout(T2); T2=setTimeout(function(){ try{ tickCards(); tickMsg(); }catch(e){ console.warn('store-returns',e); } },120); }).observe(document.body,{childList:true,subtree:true});
}catch(e){ console.warn('store-returns',e); }})();
