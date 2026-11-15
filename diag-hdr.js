/* Kivra: diag-hdr.js - أداة تشخيص مؤقتة. لما الهيدر الغلط يظهر عند المخزن بتطلّع صندوق أصفر فيه اسم الملف اللي رسمه. بتمسحها بعد ما نعرف. مبتغيّرش أي حاجة في التطبيق. */
(function(){try{
  var REP=[], box=null, last=0;
  function isWh(){ try{ return typeof ME!=='undefined'&&ME&&ME.role==='warehouse'; }catch(e){ return false; } }
  function files(stack){
    var o=[], re=/([A-Za-z0-9_\-]+\.js)(?:\?[^:\s)]*)?:(\d+):(\d+)/g, m;
    while((m=re.exec(stack||''))){ var f=m[1]+':'+m[2]; if(o.indexOf(f)<0) o.push(f); }
    return o.slice(0,8);
  }
  function info(){
    var s=[];
    try{ s.push('role='+(ME&&ME.role)); }catch(e){}
    try{ s.push('tab='+TAB); }catch(e){}
    try{ s.push('WHF='+(WHF?'set':'null')); }catch(e){}
    s.push('sf='+(document.getElementById('sf')?'yes':'no'));
    s.push('sx-hd='+(document.querySelector('#main .sx-hd')?'yes':'no'));
    return s.join(' | ');
  }
  function show(){
    if(!box){
      box=document.createElement('div');
      box.style.cssText='position:fixed;top:8px;left:8px;right:8px;z-index:99999;background:#fff7cc;border:2px solid #b45309;border-radius:12px;padding:10px;font:12px/1.5 monospace;direction:ltr;text-align:left;max-height:60vh;overflow:auto;color:#222';
      document.body.appendChild(box);
    }
    var txt=REP.join('\n\n');
    box.innerHTML='<b>DIAG: found the header source</b><pre style="white-space:pre-wrap;margin:6px 0"></pre><button id="dg-c" style="padding:8px 12px;margin-right:6px">Copy report</button><button id="dg-x" style="padding:8px 12px">Close</button>';
    box.querySelector('pre').textContent=txt;
    box.querySelector('#dg-c').onclick=function(){ try{ navigator.clipboard.writeText(txt); }catch(e){ prompt('Copy:',txt); } };
    box.querySelector('#dg-x').onclick=function(){ box.remove(); box=null; };
  }
  function add(how,target,html){
    var now=Date.now(); if(now-last<1500) return; last=now;
    var t=target&&target.tagName?(target.tagName.toLowerCase()+(target.id?'#'+target.id:'')+(target.className&&typeof target.className==='string'?'.'+target.className.trim().split(/\s+/).join('.'):'')):'?';
    REP.push('via: '+how+'\ntarget: '+t+'\nfiles: '+files(new Error().stack).join('  <-  ')+'\nhtml: '+String(html).replace(/\s+/g,' ').slice(0,260)+'\n'+info());
    show();
  }
  function bad(h){ return typeof h==='string'&&h.indexOf('⭐')>-1&&isWh(); }
  var P=Element.prototype;
  var ih=Object.getOwnPropertyDescriptor(P,'innerHTML'), oh=Object.getOwnPropertyDescriptor(P,'outerHTML'), ia=P.insertAdjacentHTML;
  if(ih&&ih.set) Object.defineProperty(P,'innerHTML',{get:ih.get,set:function(v){ if(bad(v)) add('innerHTML',this,v); return ih.set.call(this,v); },configurable:true});
  if(oh&&oh.set) Object.defineProperty(P,'outerHTML',{get:oh.get,set:function(v){ if(bad(v)) add('outerHTML',this,v); return oh.set.call(this,v); },configurable:true});
  P.insertAdjacentHTML=function(pos,h){ if(bad(h)) add('insertAdjacentHTML',this,h); return ia.call(this,pos,h); };
  /* احتياطي: لو الهيدر اتبنى بطريقة تانية، نعرض الكلاسات بتاعته */
  try{
    new MutationObserver(function(ms){
      if(!isWh()||Date.now()-last<1500) return;
      ms.forEach(function(m){ m.addedNodes.forEach(function(n){
        if(n.nodeType!==1||!n.textContent||n.textContent.indexOf('⭐')<0||Date.now()-last<1500) return;
        var cls={}; [n].concat([].slice.call(n.querySelectorAll('*'))).forEach(function(e){ String(e.className&&e.className.baseVal!==undefined?'':e.className).split(/\s+/).forEach(function(c){ if(c) cls[c]=1; }); });
        last=Date.now();
        REP.push('via: DOM node added (no html string seen)\nroot: '+n.tagName.toLowerCase()+'#'+(n.id||'')+'.'+String(n.className)+'\nclasses: '+Object.keys(cls).slice(0,25).join(' ')+'\n'+info());
        show();
      }); });
    }).observe(document.body,{childList:true,subtree:true});
  }catch(e){}
}catch(e){}})();
