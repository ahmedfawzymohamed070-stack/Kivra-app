/* Kivra 4ب-3: رفع صورة المنتج عند إنشاء منتج جديد في الكتالوج */
(function(){
  let PENDING=null;

  // أي طلب لإنشاء منتج في الكتالوج بياخد مسار الصورة اللي اترفعت
  const _rpc=sb.rpc.bind(sb);
  sb.rpc=function(name,args,opts){
    if(name==='add_catalog_product'&&PENDING) args=Object.assign({},args,{p_image:PENDING});
    return _rpc(name,args,opts);
  };

  async function shrink(f){
    const bm=await createImageBitmap(f), s=Math.min(1,800/Math.max(bm.width,bm.height));
    const c=document.createElement('canvas');
    c.width=Math.round(bm.width*s); c.height=Math.round(bm.height*s);
    c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
    return await new Promise(r=>c.toBlob(r,'image/jpeg',0.8));
  }

  const _cn=A.cnew;
  A.cnew=async function(el){
    await _cn(el);
    const b=document.querySelector('#addbox [data-act="ccreate"]');
    if(b&&!$('#nimg')) b.parentElement.insertAdjacentHTML('beforebegin',
      '<label>صورة المنتج (اختياري)<input id="nimg" type="file" accept="image/*"></label>');
  };

  const _cc=A.ccreate;
  A.ccreate=async function(el){
    const inp=$('#nimg'), f=inp&&inp.files&&inp.files[0];
    if(f){
      if(!$('#nn').value.trim()) throw new Error('اكتب اسم المنتج');
      if(f.size>15*1024*1024) throw new Error('الصورة كبيرة جداً');
      toast('جاري رفع الصورة...');
      const blob=await shrink(f);
      const path=ME.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
      ok(await sb.storage.from('product-images').upload(path,blob,{contentType:'image/jpeg'}));
      PENDING=path;
    }
    try{ await _cc(el); } finally { PENDING=null; }
  };
})();
