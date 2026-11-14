/* Kivra: admin-settings.js - إعدادات الأدمن: روابط التواصل + نظام النقاط */
(function(){try{
  var BTN=null, F=[['contact_facebook','رابط صفحة الفيسبوك (https://...)','url'],['contact_instagram','رابط الإنستجرام (https://...)','url'],['contact_whatsapp','رقم واتساب الدعم (مثال 201012345678)','tel'],['contact_email','إيميل الدعم','email'],['points_egp_per_point','كل كام جنيه = نقطة؟ (اكتب 0 لإيقاف النقاط)','number'],['point_value_egp','قيمة النقطة الواحدة بالجنيه عند الاستبدال (مثال 0.5)','number']];
  var q=function(s){return document.querySelector(s)};
  var st=document.createElement('style');
  st.textContent='#ast-b{position:fixed;bottom:84px;left:140px;z-index:9990;background:#fff;color:#1F6F6B;border:2px solid #1F6F6B;border-radius:24px;padding:10px 14px;font-weight:800;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.2)}'
   +'#ast-ov{position:fixed;inset:0;background:#f4f7f6;z-index:99991;overflow:auto;direction:rtl;padding:14px 14px 80px}#ast-ov label{display:block;margin:10px 0;font-size:13px;font-weight:700}#ast-ov input{width:100%;padding:10px;border:1.5px solid #cfd8d7;border-radius:10px;margin-top:4px;font-size:14px;direction:ltr;text-align:left}'
   +'#ast-ov button{padding:10px 18px;border-radius:12px;font-weight:800;border:0;background:#1F6F6B;color:#fff;margin-inline-end:8px}#ast-ov button.g{background:#fff;color:#1F6F6B;border:1.5px solid #1F6F6B}';
  document.head.appendChild(st);
  function open(){
    if(q('#ast-ov')) return;
    var o=document.createElement('div'); o.id='ast-ov'; o.innerHTML='<h2 style="color:#1F6F6B">⚙️ إعدادات التواصل والنقاط</h2><div class="muted">جاري التحميل...</div>'; document.body.appendChild(o);
    Promise.resolve(sb.rpc('kv_public_settings')).then(function(r){
      var s=(r&&!r.error&&r.data)?r.data:{};
      o.innerHTML='<h2 style="color:#1F6F6B">⚙️ إعدادات التواصل والنقاط</h2><p class="muted">اللي تسيبه فاضي مش هيظهر للعملاء.</p>'
        +F.map(function(f){return '<label>'+f[1]+'<input data-ast="'+f[0]+'" type="'+(f[2]==='number'?'text':f[2])+'" inputmode="'+(f[2]==='number'?'decimal':'')+'" value="'+esc(s[f[0]]||'')+'"></label>'}).join('')
        +'<button type="button" data-astx="save">حفظ</button><button type="button" class="g" data-astx="close">إغلاق</button>';
    });
  }
  async function save(){
    var ins=[].slice.call(document.querySelectorAll('#ast-ov [data-ast]'));
    for(var i=0;i<ins.length;i++){
      var r=await sb.rpc('admin_set_setting',{p_key:ins[i].getAttribute('data-ast'),p_value:ins[i].value});
      if(r&&r.error) throw new Error(r.error.message||'تعذّر الحفظ');
    }
    toast('تم الحفظ ✅');
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('#ast-b,[data-astx]'); if(!t) return;
    if(t.id==='ast-b') return open();
    var a=t.getAttribute('data-astx');
    if(a==='close'){ var o=q('#ast-ov'); if(o) o.remove(); return; }
    if(a==='save') run(save);
  });
  setInterval(function(){
    try{
      var adm=(typeof ME!=='undefined')&&ME&&ME.id&&ME.role==='admin';
      if(adm&&!BTN){ BTN=document.createElement('button'); BTN.id='ast-b'; BTN.type='button'; BTN.textContent='⚙️ إعدادات'; document.body.appendChild(BTN); }
      if(!adm&&BTN){ BTN.remove(); BTN=null; var o=q('#ast-ov'); if(o) o.remove(); }
    }catch(e){}
  },2000);
}catch(e){ console.warn('admin-settings',e); }})();
