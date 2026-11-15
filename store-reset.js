/* Kivra: store-reset.js - تنضيف الحالة بين الحسابات: بعد تسجيل الخروج الصفحة بتتحمل من الأول، عشان حاجات الحساب القديم (مخزن مختار، سلة، متجر مفتوح) متظهرش في الحساب الجديد */
(function(){try{
  if(typeof sb==='undefined'||!sb.auth) return;
  var had=false, going=false;
  sb.auth.onAuthStateChange(function(ev,ses){
    if(ses){ had=true; return; }
    if(ev==='SIGNED_OUT'&&had&&!going){
      had=false; going=true;
      setTimeout(function(){ location.reload(); },150);
    }
  });
}catch(e){}})();
