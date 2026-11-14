/* Kivra: customer-profile.js - بروفايل العميل: ملخص (طلبات/مشتريات/نقاط) + آخر الطلبات + روابط تواصل معنا (من إعدادات الأدمن) */
(function(){try{
  var D=null,S={},LT=0,BZ=false;
  var ST={pending:'جديد',accepted:'مقبول',delivered:'اتسلّم',rejected:'مرفوض',cancelled:'ملغي'};
  var st=document.createElement('style');
  st.textContent='.kp-g{display:flex;gap:8px;margin:8px 0}.kp-g div{flex:1;background:#f4f7f6;border-radius:12px;padding:10px;text-align:center;font-size:12px}.kp-g b{display:block;font-size:18px;color:#1F6F6B}'
   +'.kp-pt{background:linear-gradient(135deg,#1F6F6B,#2A8780);color:#fff;border-radius:14px;padding:14px;text-align:center;margin:8px 0}.kp-pt b{display:block;font-size:30px}'
   +'.kp-o{display:flex;justify-content:space-between;border-top:1px solid #eef3f2;padding:8px 0;font-size:13px}'
   +'.kp-l{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.kp-l a{background:#1F6F6B;color:#fff!important;border-radius:12px;padding:10px 16px;font-weight:700;text-decoration:none;font-size:14px}';
  document.head.appendChild(st);
  var E=function(s){return esc(s==null?'':String(s))};
  var safe=function(u){return /^https:\/\//i.test(u||'')};

  function load(){
    if(D&&Date.now()-LT<8000) return Promise.resolve();
    return Promise.all([Promise.resolve(sb.rpc('my_customer_summary')),Promise.resolve(sb.rpc('kv_public_settings'))]).then(function(r){
      if(r[0]&&!r[0].error&&r[0].data) D=r[0].data;
      if(r[1]&&!r[1].error&&r[1].data) S=r[1].data;
      LT=Date.now();
    }).catch(function(){});
  }
  function head(t){
    var hs=document.querySelectorAll('.card h2,.card h3');
    for(var i=0;i<hs.length;i++){ if(hs[i].textContent.indexOf(t)>-1) return hs[i].closest('.card'); }
    return null;
  }
  function sumHtml(){
    var d=D||{}, rate=Number(d.rate)||0, rec=d.recent||[];
    var h='<h2>⭐ نقاطي ومشترياتي</h2>';
    h+=rate>0?'<div class="kp-pt"><b>'+E(d.points||0)+'</b>نقطة<div style="font-size:12px;margin-top:4px">كل '+E(rate)+' ج.م من مشترياتك = نقطة</div></div>':'<div class="muted">نظام النقاط هيتفعّل قريباً.</div>';
    h+='<div class="kp-g"><div><b>'+E(d.orders||0)+'</b>طلب</div><div><b>'+money(d.net_spent||0)+'</b>مشترياتك (بعد المرتجع)</div></div>';
    if(rate>0) h+='<div class="muted">النقاط بتتحسب من قيمة المنتجات المتسلّمة بعد خصم المرتجعات.'+(Number(d.point_value)>0?' كل نقطة = '+E(d.point_value)+' ج.م خصم، بتستخدمها من سلة الطلب.':' استبدال النقاط بخصم قريباً.')+'</div>';
    if(rec.length){
      h+='<h3 style="margin-top:12px">آخر طلباتك</h3>'+rec.map(function(o){return '<div class="kp-o"><span>#'+E(o.order_no)+' · '+E(ST[o.status]||o.status)+'</span><b>'+money(o.total)+'</b></div>'}).join('');
      h+='<div class="muted" style="margin-top:6px">كل طلباتك في تبويب «طلباتي».</div>';
    }
    return h;
  }
  function contactHtml(){
    var a=[];
    if(safe(S.contact_facebook)) a.push('<a href="'+E(S.contact_facebook)+'" target="_blank" rel="noopener noreferrer">فيسبوك</a>');
    if(safe(S.contact_instagram)) a.push('<a href="'+E(S.contact_instagram)+'" target="_blank" rel="noopener noreferrer">إنستجرام</a>');
    var w=String(S.contact_whatsapp||'').replace(/\D/g,'');
    if(w.length>=8) a.push('<a href="https://wa.me/'+w+'" target="_blank" rel="noopener noreferrer">واتساب</a>');
    if(S.contact_email&&String(S.contact_email).indexOf('@')>0) a.push('<a href="mailto:'+E(S.contact_email)+'">إيميل</a>');
    return a.length?'<div class="muted">لو عندك أي سؤال أو شكوى، كلمنا:</div><div class="kp-l">'+a.join('')+'</div>':'';
  }
  function tick(){
    if(!(typeof ME!=='undefined'&&ME&&ME.role==='customer')) return;
    var acc=head('بيانات الحساب'); if(!acc||BZ) return;
    var need=!document.getElementById('kv-sum'), ct=head('تواصل معنا'), needC=ct&&!ct.getAttribute('data-kvc');
    if(!need&&!needC) return;
    BZ=true;
    load().then(function(){
      var a2=head('بيانات الحساب');
      if(a2&&!document.getElementById('kv-sum')) a2.insertAdjacentHTML('afterend','<div class="card" id="kv-sum">'+sumHtml()+'</div>');
      var c2=head('تواصل معنا'), h=contactHtml();
      if(c2&&!c2.getAttribute('data-kvc')){
        c2.setAttribute('data-kvc','1');
        if(h){ var t=c2.querySelector('h2,h3'); while(t&&t.nextSibling) t.nextSibling.remove(); c2.insertAdjacentHTML('beforeend',h); }
      }
    }).then(function(){BZ=false},function(){BZ=false});
  }
  var T=null;
  new MutationObserver(function(){ clearTimeout(T); T=setTimeout(function(){ try{tick()}catch(e){console.warn('customer-profile',e)} },150); }).observe(document.body,{childList:true,subtree:true});
}catch(e){ console.warn('customer-profile',e); }})();
