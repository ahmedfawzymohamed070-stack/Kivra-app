/* Kivra: store-ui4.js - كروت منتجات احترافية (خصم + سعر قبل وبعد + وقت انتهاء العرض + المخزون). بديل store-ui3.js */
(function(){try{
  var ITEMS=null, IID='', LAST='', BUSY=false;
  var st=document.createElement('style');
  st.textContent=`
  .u4g{display:grid!important;grid-template-columns:1fr 1fr;gap:10px;align-items:stretch}
  .u4g>*{min-width:0}
  .u4g>*:not(.u4c){grid-column:1/-1}
  .u4c{background:#fff;border:1px solid #e3ecea;border-radius:16px;box-shadow:0 1px 5px rgba(16,60,56,.08);overflow:hidden;display:flex;flex-direction:column;position:relative;padding:0!important;margin:0!important}
  .u4i{position:relative;aspect-ratio:1/1;background:#f3f6f6;display:flex;align-items:center;justify-content:center;font-size:46px;overflow:hidden}
  .u4i img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
  .u4b{position:absolute;top:8px;right:8px;background:#e11d48;color:#fff;font-style:normal;font-weight:800;font-size:13px;padding:3px 9px;border-radius:8px}
  .u4t{padding:8px 10px 0;flex:1}
  .u4c .sf-b{font-size:11px;color:#6b7c7a}
  .u4c .sf-n{font-size:14px;font-weight:700;line-height:1.4;color:#1c2423;min-height:2.8em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .u4p{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 8px;margin-top:6px}
  .u4p b{font-size:18px;font-weight:800;color:#1F6F6B}
  .u4p s{font-size:12px;color:#8a9694}
  .u4sv{display:inline-block;margin-top:4px;background:#dcfce7;color:#166534;font-weight:700;font-size:11px;padding:2px 8px;border-radius:6px}
  .u4e{margin-top:5px;font-size:12px;font-weight:700;color:#b45309;background:#fef3c7;border-radius:6px;padding:3px 8px;display:inline-block}
  .u4s{font-size:11px;color:#6b7c7a;margin-top:6px}
  .u4c .sx-add{background:#1F6F6B!important;color:#fff!important;font-weight:700;border-radius:12px!important;padding:10px!important;margin:8px 10px 10px!important;width:calc(100% - 20px)}
  .u4o{margin:8px 10px 10px;padding:10px;text-align:center;background:#eef1f1;color:#7b8887;border-radius:12px;font-weight:700;font-size:13px}
  #sx-bar{background:#1F6F6B;color:#fff;font-weight:800;border-radius:16px;box-shadow:0 6px 18px rgba(16,60,56,.35)}
  #sx-sheet .sx-p{border-radius:22px 22px 0 0}
  #cl .card{border-radius:18px;overflow:hidden;box-shadow:0 1px 6px rgba(16,60,56,.1);border:1px solid #e3ecea}`;
  document.head.appendChild(st);

  var num=function(v){var n=Number(v);return isFinite(n)?n:0};
  var key=function(x){return String(x.brand||'').trim()+'|'+String(x.name||'').trim()};
  function img(p){ if(!p) return ''; if(/^https?:/.test(p)) return p; try{ return sb.storage.from('product-images').getPublicUrl(p).data.publicUrl; }catch(e){ return ''; } }
  function disc(x){
    var o=num(x.old_price), p=num(x.price);
    if(!(o>p)) return {off:0,old:0,end:''};
    if(x.sale_ends && new Date(x.sale_ends)<=new Date()) return {off:0,old:0,end:''};
    return {off:Math.round((1-p/o)*100),old:o,end:x.sale_ends||''};
  }
  function left(iso){
    var ms=new Date(iso)-new Date(); if(!(ms>0)) return '';
    var m=Math.floor(ms/60000), d=Math.floor(m/1440), h=Math.floor(m%1440/60);
    return '⏳ ينتهي العرض '+(d>0?'بعد '+d+' يوم':h>0?'بعد '+h+' ساعة':'بعد '+m+' دقيقة');
  }
  function card(x){
    var d=disc(x), u=img(x.image_path), s=num(x.stock), sv=d.off?num(x.old_price)-num(x.price):0;
    return '<div class="sf-c u4c" data-sxp="1" data-sxk="'+esc(key(x))+'">'
     +'<div class="u4i">'+(u?'<img loading="lazy" src="'+esc(u)+'" alt="" onerror="this.remove()">':'<span>🧴</span>')+(d.off?'<em class="u4b">-'+d.off+'%</em>':'')+'</div>'
     +'<div class="u4t"><div class="sf-b">'+esc(x.brand||'')+'</div><div class="sf-n">'+esc(x.name||'')+'</div>'
     +'<div class="u4p"><b>'+money(x.price)+'</b>'+(d.off?'<s>'+money(d.old)+'</s>':'')+'</div>'
     +(d.off?'<span class="u4sv">وفّر '+money(sv)+'</span>':'')
     +(d.end?'<div class="u4e" data-end="'+esc(d.end)+'">'+left(d.end)+'</div>':'')
     +'<div class="u4s">'+(s>0?(s<=5?'باقي '+s+' فقط':'متوفر'):'غير متوفر')+'</div></div>'
     +(s>0?'<button type="button" class="sx-add" data-sxa="add">+ أضف للسلة</button>':'<div class="u4o">غير متوفر حالياً</div>')
     +'</div>';
  }
  function rebuild(){
    var olds=[].slice.call(document.querySelectorAll('#sf .sf-c:not(.u4c)'));
    if(!olds.length||!ITEMS||IID!==LAST) return;
    var keys={}, seen={};
    olds.forEach(function(c){ keys[((c.querySelector('.sf-b')||{}).textContent||'').trim()+'|'+((c.querySelector('.sf-n')||{}).textContent||'').trim()]=1; });
    var html=ITEMS.filter(function(x){ var k=key(x); if(!keys[k]||seen[k]) return false; seen[k]=1; return true; }).map(card).join('');
    if(!html) return;
    var g=olds[0].parentElement;
    olds.forEach(function(c){ c.remove(); });
    g.classList.add('u4g'); g.insertAdjacentHTML('beforeend',html);
  }
  var OLD='للطلب تواصل مع الصيدلية مباشرة', NEW='أضف المنتجات للسلة وأرسل طلبك من هنا، والصيدلية هتتواصل معاك';
  function fixText(){
    var m=document.getElementById('main'); if(!m) return;
    var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT,null), n;
    while((n=w.nextNode())){ if(n.nodeValue&&n.nodeValue.indexOf(OLD)>-1) n.nodeValue=n.nodeValue.replace(OLD+'.',NEW+'.').replace(OLD,NEW); }
  }
  function tick(){
    try{
      if(!document.getElementById('sf')) return;
      fixText();
      if(LAST&&IID!==LAST&&!BUSY){
        BUSY=true; var want=LAST;
        Promise.resolve(sb.rpc('store_view',{p_pharmacy:want})).then(function(r){ ITEMS=(r&&r.data)||null; IID=want; BUSY=false; tick(); }).catch(function(){ BUSY=false; });
        return;
      }
      rebuild();
    }catch(e){}
  }
  var _r=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){ if(n==='store_view'&&a&&a.p_pharmacy) LAST=a.p_pharmacy; return _r(n,a,o); };
  var t=null;
  new MutationObserver(function(){ clearTimeout(t); t=setTimeout(tick,80); }).observe(document.body,{childList:true,subtree:true});
  setInterval(function(){ document.querySelectorAll('.u4e[data-end]').forEach(function(e){ var s=left(e.getAttribute('data-end')); if(s) e.textContent=s; else e.remove(); }); },60000);
  tick();
}catch(e){}})();
