/* Kivra: store-ui3.js - شكل احترافي للمتجر (شبكة منتجات زي جوميا + سلة + كروت). CSS بس وتعديلات بسيطة */
(function(){try{
  var st=document.createElement('style');
  st.textContent=[
  '#sf .sf-c{background:#fff;border:1px solid #e3ecea;border-radius:16px;box-shadow:0 1px 5px rgba(16,60,56,.08);overflow:hidden}',
  '.u3g{display:grid!important;grid-template-columns:1fr 1fr;gap:10px;align-items:stretch}',
  '.u3g>*{min-width:0}',
  '.u3g>*:not(.sf-c){grid-column:1/-1}',
  '.u3g>.sf-c{display:flex!important;flex-direction:column!important;padding:0!important;margin:0!important}',
  '.u3g>.sf-c>*:first-child{width:100%!important;max-width:100%!important;height:auto!important;aspect-ratio:1/1;border:0!important;border-radius:0!important;background:#f3f6f6;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:44px}',
  '.u3g>.sf-c img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}',
  '.u3g>.sf-c>*:not(:first-child){margin-left:10px!important;margin-right:10px!important}',
  '.u3g .sf-b{font-size:11px;color:#6b7c7a;margin-top:8px}',
  '.u3g .sf-n{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;font-weight:700;line-height:1.4;min-height:2.8em;color:#1c2423}',
  '.u3g .sf-p{margin-top:6px;display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}',
  '.u3g .sf-p b{font-size:18px;color:#1F6F6B;font-weight:800}',
  '.u3g .sf-p s{font-size:12px;color:#8a9694}',
  '.sf-o{background:#16a34a;color:#fff!important;border-radius:6px;padding:1px 7px;font-size:12px;font-weight:800}',
  '.sx-add{background:#1F6F6B!important;color:#fff!important;font-weight:700;border-radius:12px!important;padding:10px!important;margin:8px 10px 10px!important;width:calc(100% - 20px)}',
  '#sx-bar{background:#1F6F6B;color:#fff;font-weight:800;border-radius:16px;box-shadow:0 6px 18px rgba(16,60,56,.35)}',
  '#sx-sheet .sx-p{border-radius:22px 22px 0 0}',
  '.sx-hd{box-shadow:0 1px 6px rgba(16,60,56,.08)}',
  '.sx-ch span{background:#e8f3f1;font-weight:600}',
  '#cl .card{border-radius:18px;overflow:hidden;box-shadow:0 1px 6px rgba(16,60,56,.1);border:1px solid #e3ecea}'
  ].join('\n');
  document.head.appendChild(st);

  var OLD='للطلب تواصل مع الصيدلية مباشرة', NEW='أضف المنتجات للسلة وأرسل طلبك من هنا، والصيدلية هتتواصل معاك';
  function fix(){
    try{
      var f=document.querySelector('#sf .sf-c');
      if(f&&f.parentElement&&!f.parentElement.classList.contains('u3g')) f.parentElement.classList.add('u3g');
      var m=document.getElementById('main'); if(!m) return;
      var w=document.createTreeWalker(m,NodeFilter.SHOW_TEXT,null), n;
      while((n=w.nextNode())){ if(n.nodeValue&&n.nodeValue.indexOf(OLD)>-1) n.nodeValue=n.nodeValue.replace(OLD+'.',NEW+'.').replace(OLD,NEW); }
    }catch(e){}
  }
  var t=null;
  new MutationObserver(function(){ clearTimeout(t); t=setTimeout(fix,80); }).observe(document.body,{childList:true,subtree:true});
  fix();
}catch(e){}})();
