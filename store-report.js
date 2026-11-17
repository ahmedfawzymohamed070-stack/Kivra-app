/* Kivra: تقرير مبيعات المتجر + حساب الصيدلية مع المنصة (زرار "📊 التقارير" جوه متجري). قراءة بس، إضافة فقط */
(function(){
const st=document.createElement('style');
st.textContent=`
.r2-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.r2-k{background:#f5f9f8;border-radius:12px;padding:10px 12px}
.r2-k small{display:block;color:#7a8785;font-size:12px}.r2-k b{font-size:17px;color:#1c2423}
.r2-k.m{background:#e6efee}.r2-k.m b{color:#1F6F6B}
.r2-in{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end;margin:8px 0}.r2-in label{flex:1;min-width:120px;margin:0;font-size:12px}
.r2-o{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px dashed #e3ecea;font-size:13px}
.r2-h{font-size:15px;font-weight:800;margin:16px 0 6px;color:#1c2423}
.r2-ch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.r2-ch button{padding:8px 14px;border-radius:99px;background:#eef5f4;color:#1F6F6B;font-size:13px}.r2-ch button.on{background:#1F6F6B;color:#fff}
.r2-ac{display:flex;gap:8px;margin-top:8px}.r2-ac button{flex:1}
`;
document.head.appendChild(st);
const E=s=>(typeof esc==='function'?esc(s==null?'':s):String(s==null?'':s));
const M=n=>(typeof money==='function'?money(n):Number(n||0).toFixed(2)+' ج.م');
const SL={delivered:'تم التسليم',pending:'جديد',accepted:'مقبول',shipped:'تم الشحن',rejected:'مرفوض',cancelled:'ملغي'};
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const tm=t=>{try{return t?new Date(t).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'}):''}catch(e){return ''}};
let RANGE='today', CF=ymd(new Date()), CT=ymd(new Date()), LAST=null;
function span(){
  if(RANGE==='custom') return [CF,CT];
  const t=new Date(), to=ymd(t); let from=to;
  if(RANGE==='week'){const d=new Date(t);d.setDate(d.getDate()-6);from=ymd(d);}
  if(RANGE==='month') from=to.slice(0,8)+'01';
  return [from,to];
}
async function render(box){
  box.innerHTML='<p class="muted">جاري تحميل التقرير...</p>';
  const [a,b]=span();
  let r1,r2;
  try{
    r1=await sb.rpc('store_sales_report',{p_from:a,p_to:b});
    r2=await sb.rpc('store_my_commission');
  }catch(e){ r1={error:e}; r2={}; }
  if(r1.error||!r1.data){ box.innerHTML='<p class="muted">التقرير مش متاح دلوقتي. جرّب تاني.</p>'; return; }
  const d=r1.data, c=(r2&&r2.data)||{}, ords=d.orders||[], pays=c.payments||[];
  LAST={a,b,d,c};
  const chip=(k,l)=>`<button type="button" data-r2="${k}" class="${RANGE===k?'on':''}">${l}</button>`;
  const net=Number(d.sales||0)-Number(d.commission||0);
  box.innerHTML=
  `<div class="r2-ch">${chip('today','اليوم')}${chip('week','آخر 7 أيام')}${chip('month','الشهر')}${chip('custom','تاريخ محدد')}</div>`+
  (RANGE==='custom'?`<div class="r2-in"><label>من<input type="date" id="r2f" value="${E(CF)}"></label><label>إلى<input type="date" id="r2t" value="${E(CT)}"></label><button type="button" data-r2="go">عرض</button></div>`:'')+
  `<div class="muted">الفترة: ${E(a)} ← ${E(b)}</div>
  <div class="r2-g">
   <div class="r2-k m"><small>مبيعات مسلّمة</small><b>${M(d.sales)}</b></div>
   <div class="r2-k"><small>طلبات مسلّمة</small><b>${E(d.delivered)}</b></div>
   <div class="r2-k"><small>طلبات وصلت</small><b>${E(d.received)}</b></div>
   <div class="r2-k"><small>ملغية / مرفوضة</small><b>${E(d.cancelled)}</b></div>
   <div class="r2-k"><small>عمولة المنصة (الفترة)</small><b>${M(d.commission)}</b></div>
   <div class="r2-k"><small>الباقي بعد العمولة</small><b>${M(net)}</b></div>
  </div>
  <div class="r2-h">💼 حسابك مع المنصة (من الأول)</div>
  <div class="r2-g">
   <div class="r2-k"><small>العمولة المستحقة</small><b>${M(c.due)}</b></div>
   <div class="r2-k"><small>اللي اتدفع</small><b>${M(c.paid)}</b></div>
   <div class="r2-k m" style="grid-column:1/-1"><small>المتبقي عليك</small><b>${M(c.balance)}</b></div>
  </div>
  ${pays.length?'<div class="muted">آخر الدفعات:</div>'+pays.map(p=>`<div class="r2-o"><span>${tm(p.created_at)}${p.note?' · '+E(p.note):''}</span><b>${M(p.amount)}</b></div>`).join(''):''}
  <div class="r2-h">📦 طلبات الفترة (${ords.length})</div>
  ${ords.length?ords.map(o=>`<div class="r2-o"><span><b>#${E(o.order_no)}</b> · ${E(SL[o.status]||o.status)} · ${o.mode==='delivery'?'توصيل':'استلام'}<br><span class="muted">${tm(o.delivered_at||o.created_at)}</span></span><span style="text-align:left"><b>${M(o.total)}</b>${Number(o.commission_amt)>0?'<br><span class="muted">عمولة '+M(o.commission_amt)+'</span>':''}</span></div>`).join(''):'<p class="muted">مفيش طلبات في الفترة دي.</p>'}
  <div class="r2-ac"><button type="button" class="ghost" data-r2="print">🖨️ طباعة التقرير</button></div>`;
}
function printRep(){
  if(!LAST) return; const {a,b,d,c}=LAST, ords=d.orders||[];
  const w=window.open('','_blank'); if(!w){ try{toast('اسمح بالنوافذ المنبثقة عشان الطباعة')}catch(e){} return; }
  const rows=ords.map(o=>`<tr><td>${E(o.order_no)}</td><td>${E(SL[o.status]||o.status)}</td><td>${tm(o.delivered_at||o.created_at)}</td><td>${M(o.total)}</td><td>${M(o.commission_amt)}</td></tr>`).join('');
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير المتجر</title><style>body{font-family:Tahoma,Arial,sans-serif;font-size:14px;color:#111}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #999;padding:6px;text-align:center}th{background:#eef5f4}@media print{.pb{display:none}}</style></head><body>
  <h2>${E((typeof ME!=='undefined'&&ME&&ME.business_name)||'الصيدلية')} — تقرير مبيعات المتجر</h2><div>الفترة: ${E(a)} ← ${E(b)}</div>
  <p>مبيعات مسلّمة: <b>${M(d.sales)}</b> · طلبات مسلّمة: <b>${E(d.delivered)}</b> · عمولة المنصة (الفترة): <b>${M(d.commission)}</b></p>
  <p>حسابك مع المنصة: مستحق <b>${M(c.due)}</b> · مدفوع <b>${M(c.paid)}</b> · متبقي <b>${M(c.balance)}</b></p>
  <table><tr><th>رقم الطلب</th><th>الحالة</th><th>الوقت</th><th>الإجمالي</th><th>العمولة</th></tr>${rows}</table>
  <button class="pb" onclick="window.print()">🖨️ طباعة / حفظ PDF</button></body></html>`);
  w.document.close();
}
document.addEventListener('click',e=>{
  const op=e.target.closest('[data-r2open]');
  if(op){ const box=document.getElementById('r2-box'); if(box){ op.remove(); render(box); } return; }
  const b=e.target.closest('[data-r2]'); if(!b) return;
  const k=b.dataset.r2, box=document.getElementById('r2-box'); if(!box) return;
  if(k==='print'){ printRep(); return; }
  if(k==='go'){ const f=document.getElementById('r2f'), t=document.getElementById('r2t'); if(f&&f.value) CF=f.value; if(t&&t.value) CT=t.value; render(box); return; }
  RANGE=k; render(box);
});
let tmr=null;
new MutationObserver(()=>{ clearTimeout(tmr); tmr=setTimeout(()=>{
  try{
    if(typeof ME==='undefined'||!ME||ME.role!=='pharmacy'||typeof TAB==='undefined'||TAB!=='acc') return;
    const main=document.getElementById('main'); if(!main||document.getElementById('r2-card')) return;
    if(!main.querySelector('.card')) return;
    const card=document.createElement('div'); card.className='card'; card.id='r2-card';
    card.innerHTML='<h2>📊 تقارير المتجر</h2><p class="muted">مبيعات المتجر وطلبات اليوم وحسابك مع المنصة.</p><div id="r2-box"><button type="button" data-r2open="1">عرض التقرير</button></div>';
    main.insertBefore(card, main.children[1]||null);
  }catch(e){}
},80); }).observe(document.body,{childList:true,subtree:true});
})();
