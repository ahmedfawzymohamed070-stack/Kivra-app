/* Kivra: points-use.js - استخدام نقاط العميل كخصم في السلة (الخصم بيتحمّله الأدمن من عمولته، وبحد أقصى عمولة الطلب) */
(function(){try{
  var PH='', Q={}, USE=false, BZ=false;
  var _r=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){ if((n==='store_view'||n==='store_public_profile')&&a&&a.p_pharmacy) PH=a.p_pharmacy; return _r(n,a,o); };
  var st=document.createElement('style');
  st.textContent='.kp-use{background:#fff8e1;border:1.5px solid #f0c040;border-radius:12px;padding:10px;margin:10px 0;font-size:13px;line-height:1.7}.kp-use label{display:flex;gap:8px;align-items:flex-start;font-weight:700}.kp-use input{width:20px;height:20px;margin:2px 0 0}.kp-d{color:#0b6b3a;font-weight:700}';
  document.head.appendChild(st);
  var pn=function(t){ t=String(t||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}); return parseFloat(t.replace(/[^\d.]/g,''))||0; };
  function rowOf(sum,label){
    var rs=sum.children; for(var i=0;i<rs.length;i++){ var s=rs[i].querySelector('span,b'); if(s&&s.textContent.trim()===label) return rs[i]; } return null;
  }
  function tick(){
    var sh=document.getElementById('sx-sheet'), sum=sh&&sh.querySelector('.sx-sum');
    if(!sum||!PH||!(typeof ME!=='undefined'&&ME&&ME.role==='customer')) return;
    var sr=rowOf(sum,'المنتجات'); if(!sr) return;
    var vals=sr.querySelectorAll('span,b'), sub=pn(vals[vals.length-1].textContent);
    var last=sum.lastElementChild, lv=last.querySelectorAll('span,b'), valEl=lv[lv.length-1];
    if(!sum.getAttribute('data-kvo')) sum.setAttribute('data-kvo',valEl.textContent);
    var key=PH+'|'+sub, q=Q[key];
    if(!q){
      if(BZ) return; BZ=true;
      Promise.resolve(_r('store_points_quote',{p_pharmacy:PH,p_sub:sub})).then(function(r){ Q[key]=(r&&!r.error&&r.data)?r.data:{max_disc:0,max_points:0}; }).catch(function(){ Q[key]={max_disc:0,max_points:0}; }).then(function(){ BZ=false; tick(); });
      return;
    }
    var box=sh.querySelector('.kp-use');
    if(!(q.max_disc>0&&q.max_points>0)){ if(box) box.remove(); return; }
    if(!box){
      sum.insertAdjacentHTML('beforebegin','<div class="kp-use"><label><input type="checkbox" data-kvu data-pts="'+q.max_points+'"'+(USE?' checked':'')+'><span>⭐ استخدم نقاطك: خصم '+money(q.max_disc)+' على الطلب ده<br><span class="muted" style="font-weight:400">هنستخدم '+q.max_points+' نقطة من رصيدك ('+q.points+' نقطة)</span></span></label></div>');
    }
    var on=!!(sh.querySelector('[data-kvu]')||{}).checked, dr=sum.querySelector('.kp-d'), orig=pn(sum.getAttribute('data-kvo'));
    if(on){
      if(!dr) last.insertAdjacentHTML('beforebegin','<div class="kp-d"><span>خصم النقاط</span><span>−'+money(q.max_disc)+'</span></div>');
      var t=money(Math.max(orig-q.max_disc,0)); if(valEl.textContent!==t) valEl.textContent=t;
    }else{
      if(dr) dr.remove();
      var o2=sum.getAttribute('data-kvo'); if(valEl.textContent!==o2) valEl.textContent=o2;
    }
  }
  document.addEventListener('change',function(e){
    var c=e.target.closest&&e.target.closest('[data-kvu]'); if(!c) return;
    USE=c.checked; tick();
  });
  var T=null;
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(function(){ try{tick()}catch(e){console.warn('points-use',e)} },100); }).observe(document.body,{childList:true,subtree:true});
}catch(e){ console.warn('points-use',e); }})();
