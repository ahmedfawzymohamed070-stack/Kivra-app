/* cosmo-clean.js: يشيل بواقي Kivra ويخفي شريط التبويبات السفلي */
(function(){
  var TEST=/Kivra|كيفرا|كيڤرا|كييفرا/i, ALL=/Kivra|كيفرا|كيڤرا|كييفرا/gi;
  var st=document.createElement('style');
  st.textContent='html.cf-nonav #nav{display:none!important}html.cf-nonav main{padding-bottom:28px!important}html.cf-nonav #toast{bottom:24px!important}';
  document.head.appendChild(st);
  function fix(s){return s.replace(ALL,function(m){return /[A-Za-z]/.test(m)?'CosmoFast':'كوزمو فاست';});}
  function sweep(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),n,list=[];
    while((n=w.nextNode())){
      var p=n.parentNode&&n.parentNode.nodeName;
      if(p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA'||p==='TITLE')continue;
      if(TEST.test(n.nodeValue))list.push(n);
    }
    list.forEach(function(x){x.nodeValue=fix(x.nodeValue);});
  }
  function metas(){
    if(document.title!=='CosmoFast')document.title='CosmoFast';
    var t=document.querySelectorAll('meta[name="theme-color"]');
    if(!t.length){var m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);t=[m];}
    Array.prototype.forEach.call(t,function(x){if(x.content!=='#0d4d45')x.content='#0d4d45';});
    var a=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(a&&a.content!=='CosmoFast')a.content='CosmoFast';
  }
  function nav(){
    var r=null;
    try{r=(typeof ME!=='undefined'&&ME)?ME.role:null;}catch(e){}
    var on=r==='admin'||r==='warehouse'||r==='pharmacy';
    document.documentElement.classList.toggle('cf-nonav',on);
  }
  var busy=false;
  function tick(){
    if(busy)return; busy=true;
    requestAnimationFrame(function(){
      busy=false;
      try{sweep(document.body);metas();nav();}catch(e){}
    });
  }
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  tick();
})();
