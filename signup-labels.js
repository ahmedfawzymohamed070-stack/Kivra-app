/* Kivra: عنوان خانة الاسم في التسجيل بيتغيّر حسب نوع الحساب */
(function(){
  const T={customer:'الاسم',pharmacy:'اسم الصيدلية',warehouse:'اسم المخزن'};
  function fix(){
    const r=document.getElementById('role'), b=document.getElementById('bn');
    if(!r||!b) return;
    const l=b.closest('label'); if(!l) return;
    const t=T[r.value]||'الاسم', n=l.firstChild;
    if(n&&n.nodeType===3&&n.nodeValue!==t) n.nodeValue=t;
    if(!r.dataset.kvl){ r.dataset.kvl='1'; r.addEventListener('change',fix); }
  }
  try{ new MutationObserver(fix).observe(document.body,{childList:true,subtree:true}); }catch(e){}
  fix();
})();
