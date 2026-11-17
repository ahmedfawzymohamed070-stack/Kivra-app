/* v2 — Kivra: كارت "👥 موظفيني" في حسابي عند الصيدلية (إضافة فقط). الموظف بيدخل من staff.html بكود */
(function(){
const st=document.createElement('style');
st.textContent='.st-r{border-top:1px solid #e3ecea;padding:10px 0}.st-r label{display:flex;gap:8px;align-items:center;margin:4px 0;font-size:14px}.st-r input[type=checkbox],#st-add input[type=checkbox]{width:auto;display:inline-block;margin:0}.st-cd{background:#fff8e1;border:1px solid #f0d58a;border-radius:12px;padding:10px;margin:10px 0}.st-cd input{direction:ltr;font-size:13px}.st-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.st-row button{flex:1;min-width:100px}';
document.head.appendChild(st);
const E=s=>(typeof esc==='function'?esc(s==null?'':s):String(s==null?'':s));
const msg=t=>{try{toast(t)}catch(e){alert(t)}};
const PAGE=location.origin+'/staff.html';
const tm=t=>{try{return t?new Date(t).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'}):'لسه ما دخلش'}catch(e){return ''}};
async function rpc(n,a){ const r=await sb.rpc(n,a); if(r.error) throw r.error; return r.data; }
function codeBox(code,name){
  const txt='كود دخول '+name+' على Kivra\nالصفحة: '+PAGE+'\nالكود: '+code;
  return '<div class="st-cd"><b>كود الموظف: '+E(name)+'</b><div class="muted">الكود بيظهر مرة واحدة بس، انسخه وابعته له دلوقتي.</div><input readonly id="st-code" value="'+E(code)+'"><div class="st-row"><button type="button" data-st="copy" data-t="'+E(txt)+'">نسخ</button><button type="button" class="ghost" data-st="wa" data-t="'+E(txt)+'">إرسال واتساب</button></div></div>';
}
async function render(box,newCode){
  let list=[];
  try{ list=await rpc('store_staff_list')||[]; }catch(e){ box.innerHTML='<p class="muted">الميزة مش متاحة دلوقتي.</p>'; return; }
  box.innerHTML=(newCode||'')+
  (list.length?list.map(s=>'<div class="st-r" data-id="'+E(s.id)+'"><div><b>'+E(s.name)+'</b> <span class="badge '+(s.active?'approved':'rejected')+'">'+(s.active?'شغّال':'موقوف')+'</span><div class="muted">آخر دخول: '+tm(s.last_used_at)+'</div></div>'+
   '<label><input type="checkbox" data-sp="orders"'+(s.orders?' checked':'')+'> يشوف طلبات المتجر</label>'+
   '<label><input type="checkbox" data-sp="manage"'+(s.manage?' checked':'')+'> يقبل ويشحن ويسلّم</label>'+
   '<label><input type="checkbox" data-sp="products"'+(s.products?' checked':'')+'> يعدّل المنتجات (سعر وكمية، من غير صور)</label>'+
   '<label><input type="checkbox" data-sp="buy"'+(s.buy?' checked':'')+'> يطلب من المخازن ⚠️ بيلزم الصيدلية بفلوس</label>'+
   '<label><input type="checkbox" data-sp="reports"'+(s.reports?' checked':'')+'> يشوف التقارير</label>'+
   '<div class="st-row"><button type="button" class="ghost" data-st="toggle" data-a="'+(s.active?'0':'1')+'">'+(s.active?'إيقاف':'تشغيل')+'</button><button type="button" class="ghost" data-st="newcode">كود جديد</button><button type="button" class="red" data-st="del">حذف</button></div></div>').join(''):'<p class="muted">لسه ما أضفتش موظفين.</p>')+
  '<div id="st-add" class="st-r"><b>إضافة موظف</b><label>الاسم<input id="st-n" placeholder="اسم الموظف"></label>'+
  '<label><input type="checkbox" id="st-o" checked> يشوف طلبات المتجر</label><label><input type="checkbox" id="st-m"> يقبل ويشحن ويسلّم</label><label><input type="checkbox" id="st-p"> يعدّل المنتجات (سعر وكمية، من غير صور)</label><label><input type="checkbox" id="st-b"> يطلب من المخازن ⚠️</label><label><input type="checkbox" id="st-r"> يشوف التقارير</label>'+
  '<div class="st-row"><button type="button" data-st="add">إضافة وعمل كود</button></div></div>';
}
function flags(row){ const g=k=>{const c=row.querySelector('[data-sp="'+k+'"]');return c?c.checked:null}; return {o:g('orders'),m:g('manage'),r:g('reports'),p:g('products'),b:g('buy')}; }
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-st]'); if(!b) return;
  const box=document.getElementById('st-box'); if(!box) return;
  const k=b.dataset.st, row=b.closest('.st-r'), id=row&&row.dataset.id?Number(row.dataset.id):null;
  if(k==='open'){ b.remove(); render(box); return; }
  if(k==='copy'){ const i=document.getElementById('st-code'); try{ navigator.clipboard.writeText(b.dataset.t).then(()=>msg('اتنسخ')).catch(()=>{i.select();document.execCommand('copy');msg('اتنسخ')}); }catch(x){ i.select(); document.execCommand('copy'); msg('اتنسخ'); } return; }
  if(k==='wa'){ window.open('https://wa.me/?text='+encodeURIComponent(b.dataset.t),'_blank'); return; }
  (async()=>{ try{
    if(k==='add'){
      const n=document.getElementById('st-n').value.trim(); if(!n){msg('اكتب اسم الموظف');return;}
      const o=document.getElementById('st-o').checked,m=document.getElementById('st-m').checked,r=document.getElementById('st-r').checked,p=document.getElementById('st-p').checked,bb=document.getElementById('st-b').checked;
      if(!o&&!r&&!p&&!bb){msg('اختار صلاحية واحدة على الأقل');return;}
      const d=await rpc('store_staff_add2',{p_name:n,p_orders:o,p_manage:m,p_reports:r,p_products:p,p_buy:bb});
      await render(box,codeBox(d.code,n)); return;
    }
    if(k==='toggle'){ await rpc('store_staff_update2',{p_id:id,p_orders:null,p_manage:null,p_reports:null,p_active:b.dataset.a==='1',p_products:null,p_buy:null}); await render(box); return; }
    if(k==='newcode'){ if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='تأكيد؟ القديم هيبطل'; setTimeout(()=>{b.dataset.arm='0';b.textContent='كود جديد'},4000); return; }
      const nm=row.querySelector('b').textContent; const c=await rpc('store_staff_new_code',{p_id:id}); await render(box,codeBox(c,nm)); return; }
    if(k==='del'){ if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='تأكيد الحذف؟'; setTimeout(()=>{b.dataset.arm='0';b.textContent='حذف'},4000); return; }
      await rpc('store_staff_delete',{p_id:id}); msg('تم حذف الموظف'); await render(box); return; }
  }catch(err){ msg((err&&err.message)||'حصل خطأ'); } })();
});
document.addEventListener('change',e=>{
  const c=e.target.closest('[data-sp]'); if(!c) return; const row=c.closest('.st-r'); if(!row||!row.dataset.id) return;
  const f=flags(row);
  if(!f.o&&!f.r&&!f.p&&!f.b){ c.checked=true; msg('لازم صلاحية واحدة على الأقل'); return; }
  rpc('store_staff_update2',{p_id:Number(row.dataset.id),p_orders:f.o,p_manage:f.m,p_reports:f.r,p_active:null,p_products:f.p,p_buy:f.b}).then(()=>msg('تم الحفظ')).catch(()=>msg('مقدرتش أحفظ'));
});
let tmr=null;
new MutationObserver(()=>{ clearTimeout(tmr); tmr=setTimeout(()=>{
  try{
    if(typeof ME==='undefined'||!ME||ME.role!=='pharmacy'||ME.status!=='approved') return;
    const main=document.getElementById('main'); if(!main||document.getElementById('st-card')) return;
    if((main.textContent||'').indexOf('بيانات الحساب')<0) return;
    const card=document.createElement('div'); card.className='card'; card.id='st-card';
    card.innerHTML='<h2>👥 موظفيني</h2><p class="muted">أضف موظفين وحدد لكل واحد صلاحياته. الموظف بيدخل بكود من صفحة خاصة، من غير حساب ولا إيميل.</p><div id="st-box"><button type="button" data-st="open">عرض الموظفين</button></div>';
    const ref=document.getElementById('r2-card'); const after=ref?ref.nextSibling:(main.children[1]||null);
    main.insertBefore(card, after||null);
  }catch(e){}
},80); }).observe(document.body,{childList:true,subtree:true});
})();
