/* Kivra: كارت "👥 موظفيني" في حساب المخزن (إضافة فقط). الموظف بيدخل من staff-wh.html بكود */
(function(){
const st=document.createElement('style');
st.textContent='.wst-r{border-top:1px solid #e3ecea;padding:10px 0}.wst-r label{display:flex;gap:8px;align-items:center;margin:4px 0;font-size:14px}.wst-r input[type=checkbox],#wst-add input[type=checkbox]{width:auto;display:inline-block;margin:0}.wst-cd{background:#fff8e1;border:1px solid #f0d58a;border-radius:12px;padding:10px;margin:10px 0}.wst-cd input{direction:ltr;font-size:13px}.wst-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.wst-row button{flex:1;min-width:100px}';
document.head.appendChild(st);
const E=s=>(typeof esc==='function'?esc(s==null?'':s):String(s==null?'':s));
const msg=t=>{try{toast(t)}catch(e){alert(t)}};
const PAGE=location.origin+'/staff-wh.html';
const tm=t=>{try{return t?new Date(t).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'}):'لسه ما دخلش'}catch(e){return ''}};
async function rpc(n,a){ const r=await sb.rpc(n,a||{}); if(r.error) throw r.error; const d=r.data; if(d&&d.ok===false) throw new Error(d.error||'حصل خطأ'); return d; }
function codeBox(code,name){
  const txt='كود دخول '+name+' على Kivra (المخزن)\nالصفحة: '+PAGE+'\nالكود: '+code;
  return '<div class="wst-cd"><b>كود الموظف: '+E(name)+'</b><div class="muted">الكود بيظهر مرة واحدة بس، انسخه وابعته له دلوقتي.</div><input readonly id="wst-code" value="'+E(code)+'"><div class="wst-row"><button type="button" data-wst="copy" data-t="'+E(txt)+'">نسخ</button><button type="button" class="ghost" data-wst="wa" data-t="'+E(txt)+'">إرسال واتساب</button></div></div>';
}
async function render(box,newCode){
  let list=[];
  try{ list=(await rpc('wh_staff_list'))||[]; if(list.ok===true) list=list.items||[]; }catch(e){ box.innerHTML='<p class="muted">الميزة مش متاحة دلوقتي.</p>'; return; }
  box.innerHTML=(newCode||'')+
  (list.length?list.map(s=>'<div class="wst-r" data-id="'+E(s.id)+'"><div><b>'+E(s.name)+'</b> <span class="badge '+(s.active?'approved':'rejected')+'">'+(s.active?'شغّال':'موقوف')+'</span><div class="muted">آخر دخول: '+tm(s.last_used_at)+'</div></div>'+
   '<label><input type="checkbox" data-wsp="orders"'+(s.orders?' checked':'')+'> يشوف طلبات المخزن</label>'+
   '<label><input type="checkbox" data-wsp="manage"'+(s.manage?' checked':'')+'> يقبل ويشحن ويسلّم</label>'+
   '<label><input type="checkbox" data-wsp="products"'+(s.products?' checked':'')+'> يضيف منتجات</label>'+
   '<label><input type="checkbox" data-wsp="reports"'+(s.reports?' checked':'')+'> يشوف التقارير</label>'+
   '<div class="wst-row"><button type="button" class="ghost" data-wst="toggle" data-a="'+(s.active?'0':'1')+'">'+(s.active?'إيقاف':'تشغيل')+'</button><button type="button" class="ghost" data-wst="newcode">كود جديد</button><button type="button" class="red" data-wst="del">حذف</button></div></div>').join(''):'<p class="muted">لسه ما أضفتش موظفين.</p>')+
  '<div id="wst-add" class="wst-r"><b>إضافة موظف</b><label>الاسم<input id="wst-n" placeholder="اسم الموظف"></label>'+
  '<label><input type="checkbox" id="wst-o" checked> يشوف طلبات المخزن</label><label><input type="checkbox" id="wst-m" checked> يقبل ويشحن ويسلّم</label><label><input type="checkbox" id="wst-p"> يضيف منتجات</label><label><input type="checkbox" id="wst-r"> يشوف التقارير</label>'+
  '<div class="wst-row"><button type="button" data-wst="add">إضافة وعمل كود</button></div></div>';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-wst]'); if(!b) return;
  const box=document.getElementById('wst-box'); if(!box) return;
  const k=b.dataset.wst, row=b.closest('.wst-r'), id=row&&row.dataset.id?Number(row.dataset.id):null;
  if(k==='open'){ b.remove(); render(box); return; }
  if(k==='copy'){ const i=document.getElementById('wst-code'); try{ navigator.clipboard.writeText(b.dataset.t).then(()=>msg('اتنسخ')).catch(()=>{i.select();document.execCommand('copy');msg('اتنسخ')}); }catch(x){ i.select(); document.execCommand('copy'); msg('اتنسخ'); } return; }
  if(k==='wa'){ window.open('https://wa.me/?text='+encodeURIComponent(b.dataset.t),'_blank'); return; }
  (async()=>{ try{
    if(k==='add'){
      const n=document.getElementById('wst-n').value.trim(); if(!n){msg('اكتب اسم الموظف');return;}
      const o=document.getElementById('wst-o').checked,m=document.getElementById('wst-m').checked,pp=document.getElementById('wst-p').checked,rr=document.getElementById('wst-r').checked;
      if(!o&&!pp&&!rr){msg('اختار صلاحية واحدة على الأقل');return;}
      const d=await rpc('wh_staff_add',{p_name:n,p_orders:o,p_manage:m,p_products:pp,p_reports:rr});
      await render(box,codeBox(d.code,n)); return;
    }
    if(k==='toggle'){ await rpc('wh_staff_update',{p_id:id,p_orders:null,p_manage:null,p_products:null,p_reports:null,p_active:b.dataset.a==='1'}); await render(box); return; }
    if(k==='newcode'){ if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='تأكيد؟ القديم هيبطل'; setTimeout(()=>{b.dataset.arm='0';b.textContent='كود جديد'},4000); return; }
      const nm=row.querySelector('b').textContent; const c=await rpc('wh_staff_new_code',{p_id:id}); await render(box,codeBox(c.code,nm)); return; }
    if(k==='del'){ if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='تأكيد الحذف؟'; setTimeout(()=>{b.dataset.arm='0';b.textContent='حذف'},4000); return; }
      await rpc('wh_staff_delete',{p_id:id}); msg('تم حذف الموظف'); await render(box); return; }
  }catch(err){ msg((err&&err.message)||'حصل خطأ'); } })();
});
document.addEventListener('change',e=>{
  const c=e.target.closest('[data-wsp]'); if(!c) return; const row=c.closest('.wst-r'); if(!row||!row.dataset.id) return;
  const g=k=>{const x=row.querySelector('[data-wsp="'+k+'"]');return x?x.checked:null};
  const o=g('orders'), m=g('manage'), pp=g('products'), rr=g('reports');
  if(!o&&!pp&&!rr){ c.checked=true; msg('لازم صلاحية واحدة على الأقل'); return; }
  rpc('wh_staff_update',{p_id:Number(row.dataset.id),p_orders:o,p_manage:m,p_products:pp,p_reports:rr,p_active:null}).then(()=>msg('تم الحفظ')).catch(()=>msg('مقدرتش أحفظ'));
});
let tmr=null;
new MutationObserver(()=>{ clearTimeout(tmr); tmr=setTimeout(()=>{
  try{
    if(typeof ME==='undefined'||!ME||ME.role!=='warehouse'||ME.status!=='approved') return;
    const main=document.getElementById('main'); if(!main||document.getElementById('wst-card')) return;
    if((main.textContent||'').indexOf('بيانات الحساب')<0) return;
    const card=document.createElement('div'); card.className='card'; card.id='wst-card';
    card.innerHTML='<h2>👥 موظفيني</h2><p class="muted">أضف موظفين للمخزن وحدد لكل واحد صلاحياته. الموظف بيدخل بكود من صفحة خاصة، من غير حساب ولا إيميل.</p><div id="wst-box"><button type="button" data-wst="open">عرض الموظفين</button></div>';
    main.insertBefore(card, main.children[1]||null);
  }catch(e){}
},80); }).observe(document.body,{childList:true,subtree:true});
})();
