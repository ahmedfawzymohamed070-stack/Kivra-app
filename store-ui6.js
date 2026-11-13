/* Kivra: store-ui6.js - شريط تصنيفات أفقي في صفحة الصيدلية (بيفلتر الكروت من غير ما يلمس markup بتاعها) */
(function(){try{
  var LAST='', MAP={}, SEL={}, T=null;
  var _r=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){ if(n==='store_view'&&a&&a.p_pharmacy) LAST=a.p_pharmacy; return _r(n,a,o); };

  var st=document.createElement('style');
  st.textContent=`
  .u6s{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 10px;margin:0 0 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .u6s::-webkit-scrollbar{display:none}
  .u6c{flex:0 0 auto;border:1px solid #cfe3e0!important;background:#fff!important;color:#1F6F6B!important;border-radius:999px!important;padding:7px 14px!important;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer;box-shadow:none!important}
  .u6c.on{background:#1F6F6B!important;color:#fff!important;border-color:#1F6F6B!important}
  .u6c i{font-style:normal;opacity:.7;font-weight:600;margin-right:4px}
  .u6h{display:none!important}`;
  document.head.appendChild(st);

  var q=function(s){return document.querySelector(s)};
  var nk=function(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase()};
  var OTHER='أخرى';

  function load(pid){
    if(MAP[pid]) return Promise.resolve(MAP[pid]);
    return Promise.resolve(_r('store_view',{p_pharmacy:pid})).then(function(r){
      var d=r&&!r.error?r.data:null;
      if(d&&!Array.isArray(d)) d=d.store_view||d.items||[];
      var m={}; (d||[]).forEach(function(x){ m[nk((x.brand||'')+'|'+(x.name||''))]=String(x.category||'').trim()||OTHER; });
      MAP[pid]=m; return m;
    }).catch(function(){ MAP[pid]={}; return MAP[pid]; });
  }
  function cardCat(c,m){
    var k=c.getAttribute('data-sxk');
    if(!k){ var b=c.querySelector('.sf-b'), n=c.querySelector('.sf-n'); k=((b&&b.textContent)||'')+'|'+((n&&n.textContent)||''); }
    return m[nk(k)]||null;
  }
  function apply(m,sel){
    [].forEach.call(document.querySelectorAll('.sf-c'),function(c){
      var cat=cardCat(c,m);
      c.classList.toggle('u6h', !!sel && sel!=='all' && cat!==sel);
    });
  }
  function build(pid,m){
    var cards=document.querySelectorAll('.sf-c'); if(!cards.length) return;
    var cnt={}, order=[];
    [].forEach.call(cards,function(c){ var k=cardCat(c,m); if(!k) return; if(!cnt[k]){cnt[k]=0;order.push(k);} cnt[k]++; });
    var old=q('.u6s'); if(old) old.remove();
    if(order.length<2) return;
    var sel=SEL[pid]||'all'; if(sel!=='all'&&!cnt[sel]) sel='all';
    var tot=cards.length;
    var s=document.createElement('div'); s.className='u6s'; s.setAttribute('data-pid',pid);
    s.innerHTML='<button type="button" class="u6c'+(sel==='all'?' on':'')+'" data-c="all">الكل<i>'+tot+'</i></button>'
      +order.map(function(k){ return '<button type="button" class="u6c'+(sel===k?' on':'')+'" data-c="'+esc(k)+'">'+esc(k)+'<i>'+cnt[k]+'</i></button>'; }).join('');
    var grid=cards[0].parentElement; if(!grid||!grid.parentNode) return;
    grid.parentNode.insertBefore(s,grid);
    s.addEventListener('click',function(e){
      var b=e.target.closest('.u6c'); if(!b) return; e.stopPropagation();
      var v=b.getAttribute('data-c'); SEL[pid]=v;
      [].forEach.call(s.querySelectorAll('.u6c'),function(x){ x.classList.toggle('on',x===b); });
      apply(m,v);
    });
    apply(m,sel);
  }
  function tick(){
    var cards=document.querySelectorAll('.sf-c');
    var s=q('.u6s');
    if(!cards.length){ if(s) s.remove(); return; }
    var pid=LAST; if(!pid) return;
    if(s&&s.getAttribute('data-pid')===String(pid)&&s.nextElementSibling&&s.nextElementSibling.contains(cards[0])){ apply(MAP[pid]||{},SEL[pid]); return; }
    load(pid).then(function(m){ if(LAST===pid) build(pid,m); });
  }
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(tick,80); }).observe(document.body,{childList:true,subtree:true});
  tick();
}catch(e){ console.warn('store-ui6',e); }})();
