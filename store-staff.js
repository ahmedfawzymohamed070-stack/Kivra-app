/* Kivra: كارت "👥 موظفيني" في حساب الصيدلية (إضافة فقط). الموظف بيدخل من staff.html بكود */
(function(){
const st=document.createElement('style');
st.textContent='.sst-r{border-top:1px solid #e3ecea;padding:10px 0}.sst-r label{display:flex;gap:8px;align-items:center;margin:4px 0;font-size:14px}.sst-r input[type=checkbox],#sst-add input[type=checkbox]{width:auto;display:inline-block;margin:0}.sst-cd{background:#fff8e1;border:1px solid #f0d58a;border-radius:12px;padding:10px;margin:10px 0}.sst-cd input{direction:ltr;font-size:13px}.sst-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.sst-row button{flex:1;min-width:100px}';
document.head.appendChild(st);
const E=s=>(typeof esc==='function'?esc(s==null?'':s):String(s==null?'':s));
const msg=t=>{try{toast(t)}catch(e){alert(t)}};
const PAGE=location.origin+'/staff.html';
const tm=t=>{try{return t?new Date(t).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'}):'لسه ما دخلش'}catch(e){return ''}};
const ERRS={'login required':'لازم تسجّل دخول','not allowed':'مش مسموح لك بالعملية دي','name required':'اكتب اسم الموظف','max 10 staff':'الحد الأقصى 10 موظفين'};
async function rpc(n,a){ const r=await sb.rpc(n,a||{}); if(r.error) throw new Error(ERRS[r.error.message]||r.error.message||'حصل خطأ'); const d=r.data; if(d&&d.ok===false) throw new Error(d.error||'حصل خطأ'); return d; }
function codeBox(code,name){
  const txt='كود دخول '+name+' على Kivra (الصيدلية)\nالصفحة: '+PAGE+'\nالكود: '+code;
  return '<div class="sst-cd"><b>كود الموظف: '+E(name)+'</b><div class="muted">الكود بيظهر مرة واحدة بس، انسخه وابعته له دلوقتي.</div><input readonly id="sst-code" value="'+E(code)+'"><div class="sst-row"><button type="button" data-sst="copy" data-t="'+E(txt)+'">نسخ</button><button type="button" class="ghost" data-sst="wa" data-t="'+E(txt)+'">إرسال واتساب</button></div></div>';
}
function pLabels(s,pre){
  const L=[['orders','يشوف طلبات المتجر'],['manage','يقبل ويشحن ويسلّم'],['products','يضيف ويعدّل منتجات المتجر'],['buy','يشتري من المخازن'],['reports','يشوف التقارير']];
  return L.map(x=>'<label><input type="checkbox" '+(s?'data-ssp="'+x[0]+'"':'id="sst-'+x[0]+'"')+((s?s[x[0]]:(x[0]==='orders'||x[0]==='manage'))?' checked':'')+'> '+x[1]+'</label>').join('');
}
async function render(box,newCode){
  let list=[];
  try{ list=(await rpc('store_staff_list'))||[]; if(!Array.isArray(list)) list=list.items||[]; }catch(e){ box.innerHTML='<p class="muted">الميزة مش متاحة دلوقتي.</p>'; return; }
  box.innerHTML=(newCode||'')+
  (list.length?list.map(s=>'<div class="sst-r" data-id="'+E(s.id)+'"><div><b>'+E(s.name)+'</b> <span class="badge '+(s.active?'approved':'rejected')+'">'+(s.active?'شغّال':'موقوف')+'</span><div class="muted">آخر دخول: '+tm(s.last_used_at)+'</div></div>'+
   pLabels(s)+
   '<div class="sst-row"><button type="button" class="ghost" data-sst="toggle" data-a="'+(s.active?'0':'1')+'">'+(s.active?'إيقاف':'تشغيل')+'</button><button type="button" class="ghost" data-sst="newcode">كود جديد</button><button type="button" class="red" data-sst="del">حذف</button></div></div>').join(''):'<p class="muted">لسه ما أضفتش موظفين.</p>')+
  '<div id="sst-add" class="sst-r"><b>إضافة موظف</b><label>الاسم<input id="sst-n" placeholder="اسم الموظف"></label>'+pLabels(null)+
  '<div class="sst-row"><button type="button" data-sst="add">إضافة وعمل كود</button></div></div>';
}
function read(row){ const g=k=>{const x=row.querySelector('[data-ssp="'+k+'"]');return x?x.checked:null}; return {o:g('orders'),m:g('manage'),p:g('products'),b:g('buy'),r:g('reports')}; }
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-sst]'); if(!b) return;
  const box=document.getElementById('sst-box'); if(!box) return;
  const k=b.dataset.sst, row=b.closest('.sst-r'), id=row&&row.dataset.id?Number(row.dataset.id):null;
  if(k==='open'){ b.remove(); render(box); return; }
  if(k==='copy'){ const i=document.getElementById('sst-code'); try{ navigator.clipboard.writeText(b.dataset.t).then(()=>msg('اتنسخ')).catch(()=>{i.select();document.execCommand('copy');msg('اتنسخ')}); }catch(x){ i.select(); document.execCommand('copy'); msg('اتنسخ'); } return; }
  if(k==='wa'){ window.open('https://wa.me/?text='+encodeURIComponent(b.dataset.t),'_blank'); return; }
  (async()=>{ try{
    if(k==='add'){
      const n=document.getElementById('sst-n').value.trim(); if(!n){msg('اكتب اسم الموظف');return;}
      const c=x=>document.getElementById('sst-'+x).checked;
      const o=c('orders'),m=c('manage'),p=c('products'),bu=c('buy'),r=c('reports');
      if(!o&&!p&&!bu&&!r){msg('اختار صلاحية واحدة على الأقل');return;}
      const d=await rpc('store_staff_add2',{p_name:n,p_orders:o,p_manage:m,p_reports:r,p_products:p,p_buy:bu});
      await render(box,codeBox(d.code,n)); return;
    }
    if(k==='toggle'){ await rpc('store_staff_update2',{p_id:id,p_orders:null,p_manage:null,p_reports:null,p_active:b.dataset.a==='1',p_products:null,p_buy:null}); await render(box); return; }
    if(k==='newcode'){ if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='تأكيد؟ القديم هيبطل'; setTimeout(()=>{b.dataset.arm='0';b.textContent='كود جديد'},4000); return; }
      const nm=row.querySelector('b').textContent; const d=await rpc('store_staff_new_code',{p_id:id});
      const code=(typeof d==='string')?d:(d&&(d.code||d.new_code));
      if(!code){ msg('مقدرتش أجيب الكود الجديد'); return; }
      await render(box,codeBox(code,nm)); return; }
    if(k==='del'){ if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='تأكيد الحذف؟'; setTimeout(()=>{b.dataset.arm='0';b.textContent='حذف'},4000); return; }
      await rpc('store_staff_delete',{p_id:id}); msg('تم حذف الموظف'); await render(box); return; }
  }catch(err){ msg((err&&err.message)||'حصل خطأ'); } })();
});
document.addEventListener('change',e=>{
  const c=e.target.closest('[data-ssp]'); if(!c) return; const row=c.closest('.sst-r'); if(!row||!row.dataset.id) return;
  const v=read(row);
  if(!v.o&&!v.p&&!v.b&&!v.r){ c.checked=true; msg('لازم صلاحية واحدة على الأقل'); return; }
  rpc('store_staff_update2',{p_id:Number(row.dataset.id),p_orders:v.o,p_manage:v.m,p_reports:v.r,p_active:null,p_products:v.p,p_buy:v.b}).then(()=>msg('تم الحفظ')).catch(()=>msg('مقدرتش أحفظ'));
});
let tmr=null;
new MutationObserver(()=>{ clearTimeout(tmr); tmr=setTimeout(()=>{
  try{
    if(typeof ME==='undefined'||!ME||ME.role!=='pharmacy'||ME.status!=='approved') return;
    const main=document.getElementById('main'); if(!main||document.getElementById('sst-card')) return;
    const tx=main.textContent||'';
    if(tx.indexOf('بيانات الحساب')<0) return;
    if(tx.indexOf('موظفيني')>=0||tx.indexOf('موظفين')>=0) return;
    const card=document.createElement('div'); card.className='card'; card.id='sst-card';
    card.innerHTML='<h2>👥 موظفيني</h2><p class="muted">أضف موظفين للصيدلية وحدد لكل واحد صلاحياته. الموظف بيدخل بكود من صفحة خاصة، من غير حساب ولا إيميل.</p><div id="sst-box"><button type="button" data-sst="open">عرض الموظفين</button></div>';
    main.insertBefore(card, main.children[1]||null);
  }catch(e){}
},80); }).observe(document.body,{childList:true,subtree:true});
})();
