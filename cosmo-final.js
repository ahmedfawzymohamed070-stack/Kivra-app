/* cosmo-final.js: تنظيف نهائي للهوية (CosmoFast) + شيل لوجو K القديم + إخفاء التبويبات السفلية */
(function(){
  'use strict';
  if(window.__cfFinal)return; window.__cfFinal=1;
  var TEST=/Kivra|كيفرا|كيڤرا|كييفرا/i, ALL=/Kivra|كيفرا|كيڤرا|كييفرا/gi, GREEN='#0A4A40';
  var st=document.createElement('style');
  st.textContent='html.cf-nonav #nav{display:none!important}html.cf-nonav main{padding-bottom:28px!important}html.cf-nonav #toast{bottom:24px!important}'+
    '#app header::before,#app header::after{content:none!important;display:none!important}'+
    /* ستايلات كانت في polish-theme.js وبنحافظ عليها */
    'a{color:var(--p)!important}label{color:#3d5754}input,select{border-color:#cfe0dd}'+
    '.item,.wh{border-top-color:#e4efed}.card{box-shadow:0 2px 12px rgba(31,111,107,.08)}.oc,.dc{box-shadow:0 1px 6px rgba(31,111,107,.08)}'+
    '.ow,.dm span{color:#3d5754}.dm span{background:#f1f7f6;border-color:#d4e5e2}'+
    '#toast,#pushmsg{background:#17302E}.narrow .logo{display:none}'+
    '.narrow.card{background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#bfe0db,#fff 45%,#f3dcc0) border-box!important}';
  document.head.appendChild(st);

  function hide(x){x.style.setProperty('display','none','important');}
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
    Array.prototype.forEach.call(t,function(x){if(x.content!==GREEN)x.content=GREEN;});
    var a=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(a&&a.content!=='CosmoFast')a.content='CosmoFast';
  }
  function role(){
    try{return (typeof ME!=='undefined'&&ME)?ME.role:null;}catch(e){return null;}
  }
  function isStaff(){var r=role();return r==='admin'||r==='warehouse'||r==='pharmacy';}

  /* شاشة الدخول: شيل الكارت الغامق (لوجو K القديم) وسيب لوجو COSMOFAST */
  function gfx(x){return x.querySelectorAll('img,svg,canvas').length;}
  function loginPass(){
    var app=document.getElementById('app');
    if(!app||app.querySelector('header'))return;
    var w=document.createTreeWalker(app,NodeFilter.SHOW_TEXT,null,false),n,tg=null;
    while((n=w.nextNode())){if(n.nodeValue.indexOf('كوزمتكس بالجملة')>-1){tg=n.parentNode;break;}}
    if(!tg)return;
    var e=tg;
    while(e.parentNode&&e.parentNode!==app){
      var p=e.parentNode;
      if(p.querySelector('input,form,select,textarea'))break;
      if(gfx(p)!==gfx(e))break;
      e=p;
    }
    if(e!==app)hide(e);
  }

  /* الهيدر: شيل أي لوجو/صورة قديمة غير لوجو CosmoFast وزر القائمة */
  function headerPass(){
    var h=document.querySelector('#app header'); if(!h)return;
    Array.prototype.forEach.call(h.querySelectorAll('img,svg,canvas,picture,i'),function(x){
      if(x.closest('.kv-menu')||x.closest('.cf-lg')||x.closest('button'))return;
      hide(x);
      var p=x.parentNode;
      if(p&&p!==h&&!(p.textContent||'').trim()&&!p.querySelector('.cf-lg')&&!p.closest('.cf-lg'))hide(p);
    });
    Array.prototype.forEach.call(h.querySelectorAll('*'),function(x){
      if(x.closest('.kv-menu')||x.closest('.cf-lg'))return;
      var bg=getComputedStyle(x).backgroundImage;
      if(bg&&bg!=='none'&&bg.indexOf('gradient')<0)hide(x);
    });
  }

  /* الزرّين الطايرين (المتجر / الإعدادات): نخفيهم وننقلهم للقائمة الجانبية */
  function fixedBtns(){
    var r=[];
    Array.prototype.forEach.call(document.querySelectorAll('button'),function(b){
      if(b.closest('#kv-drawer')||b.closest('header')||b.closest('#nav')||b.classList.contains('kv-menu'))return;
      var t=(b.textContent||'').trim(),k=null;
      if(t.length>30)return;
      if(/المتجر/.test(t))k='المتجر';else if(/إعدادات|اعدادات/.test(t))k='الإعدادات';
      if(!k)return;
      var f=null,e=b;
      while(e&&e!==document.body&&e.nodeType===1){
        if(getComputedStyle(e).position==='fixed'){f=e;break;}
        e=e.parentNode;
      }
      if(f)r.push({k:k,b:b,f:f});
    });
    return r;
  }
  function floatPass(){
    var list=fixedBtns();
    list.forEach(function(o){
      hide(o.b);
      if(o.f!==o.b&&o.f.querySelectorAll('button').length===1)hide(o.f);
    });
    var dl=document.querySelector('#kv-drawer .kv-dl'); if(!dl)return;
    var seen={};
    list.forEach(function(o){
      if(seen[o.k])return; seen[o.k]=1;
      if(dl.querySelector('[data-cf="'+o.k+'"]'))return;
      var b=document.createElement('button');
      b.type='button'; b.setAttribute('data-cf',o.k);
      b.innerHTML='<span class="kv-emo">'+(o.k==='المتجر'?'🛍️':'⚙️')+'</span><span class="kv-lb">'+o.k+'</span>';
      dl.appendChild(b);
    });
  }
  document.addEventListener('click',function(e){
    var x=e.target.closest&&e.target.closest('[data-cf]'); if(!x)return;
    e.preventDefault(); e.stopPropagation();
    var k=x.getAttribute('data-cf');
    document.body.classList.remove('kv-open');
    var l=fixedBtns().filter(function(o){return o.k===k;})[0];
    if(l)l.b.click();
  },true);

  function tick1(){
    sweep(document.body); metas(); loginPass();
    var on=isStaff();
    document.documentElement.classList.toggle('cf-nonav',on);
    if(on){headerPass();floatPass();}
  }
  var busy=false;
  function tick(){
    if(busy)return; busy=true;
    requestAnimationFrame(function(){busy=false;try{tick1();}catch(e){}});
  }
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  tick();
})();
