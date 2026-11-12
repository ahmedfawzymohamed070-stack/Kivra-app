/* Kivra: إذن تسليم مطبوع (PDF) للمخزن، وعليه رقم الطلب ذو الست خانات */
(function(){
  const st=document.createElement('style');
  st.textContent=`
  #opr{position:fixed;inset:0;z-index:9000;background:#eef3f2;overflow:auto;direction:rtl}
  #opr .opbar{position:sticky;top:0;z-index:2;display:flex;gap:8px;padding:calc(10px + env(safe-area-inset-top)) 12px 10px;background:#1F6F6B}
  #opr .opbar button{flex:1;padding:10px;font-size:15px}
  #opr .opbar .ghost{background:rgba(255,255,255,.2);color:#fff}
  #opr .opbar .go{background:#fff;color:#1F6F6B;font-weight:700}
  #opr .sheet{background:#fff;max-width:794px;margin:12px auto;padding:22px 20px;color:#111;font-size:14px;line-height:1.5}
  .op-h{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1F6F6B;padding-bottom:10px;margin-bottom:12px}
  .op-t{font-size:22px;font-weight:800;color:#1F6F6B}
  .op-n{text-align:left;direction:ltr}
  .op-n small{display:block;font-size:11px;color:#555}
  .op-n b{font-size:26px;letter-spacing:2px}
  .op-b{display:flex;gap:10px;margin-bottom:12px}
  .op-b div{flex:1;border:1px solid #cfdad8;border-radius:8px;padding:8px 10px}
  .op-b small{display:block;color:#5b7572;font-size:11px;margin-bottom:2px}
  .op-tb{width:100%;border-collapse:collapse;margin-bottom:10px}
  .op-tb th,.op-tb td{border:1px solid #cfdad8;padding:6px 8px;text-align:right}
  .op-tb th{background:#e3f0ee}
  .op-tot{display:flex;justify-content:space-between;align-items:center;background:#e3f0ee;border-radius:8px;padding:10px 12px;font-size:17px;font-weight:800;margin-bottom:8px}
  .op-nt{font-size:12px;color:#444;margin-bottom:14px}
  .op-sg{display:flex;gap:14px;margin-top:26px}
  .op-sg div{flex:1;border-top:1px solid #333;padding-top:6px;font-size:12px;text-align:center}
  .op-ft{margin-top:18px;font-size:11px;color:#777;text-align:center}
  @page{size:A4;margin:12mm}
  @media print{
    body>*:not(#opr){display:none!important}
    #opr{position:static!important;background:#fff!important;overflow:visible!important}
    #opr .opbar{display:none!important}
    #opr .sheet{margin:0;padding:0;max-width:none}
  }`;
  document.head.appendChild(st);

  const serial=n=>String(n==null?'':n).replace(/\D/g,'').padStart(6,'0');
  const when=d=>d?new Date(d).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}):'';

  async function driverOf(id,o){
    let n=o.driver_name||'', p=o.driver_phone||'';
    if(!n){
      try{
        const r=await sb.rpc('order_tracking_info');
        const x=(r.data||[]).find(t=>String(t.order_id)===String(id));
        if(x){ n=x.driver_name||''; p=x.driver_phone||''; }
      }catch(e){}
    }
    return {n,p};
  }

  function noteHtml(o,dv){
    const it=o.items||[], app=(typeof APP!=='undefined'&&APP)||'Kivra';
    const rows=it.map((i,k)=>`<tr><td>${k+1}</td><td>${esc(i.name)}</td><td>${esc(i.qty)}</td><td>${money(i.unit_price)}</td><td>${money(Number(i.qty)*Number(i.unit_price))}</td></tr>`).join('');
    const qty=it.reduce((s,i)=>s+Number(i.qty||0),0);
    return `<div class="sheet">
    <div class="op-h"><div><div class="op-t">إذن تسليم</div><div>${esc(when(o.created_at))}</div></div>
    <div class="op-n"><small>رقم الطلب</small><b>${serial(o.order_no)}</b></div></div>
    <div class="op-b"><div><small>من (المخزن)</small><b>${esc(o.warehouse||'')}</b><br>${esc(o.warehouse_phone||'')}</div>
    <div><small>إلى (الصيدلية)</small><b>${esc(o.pharmacy||'')}</b><br>${esc(o.pharmacy_phone||'')}${o.pharmacy_address?'<br>'+esc(o.pharmacy_address):''}</div></div>
    <table class="op-tb"><thead><tr><th>م</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="op-tot"><span>إجمالي المبلغ المستحق (${qty} قطعة)</span><span>${money(o.total)}</span></div>
    <div class="op-nt">الدفع يتم للمخزن مباشرة عند الاستلام. الرجاء مراجعة الأصناف والكميات قبل التوقيع.</div>
    ${dv.n?`<div class="op-nt">المندوب: <b>${esc(dv.n)}</b>${dv.p?' · '+esc(dv.p):''}</div>`:''}
    <div class="op-sg"><div>توقيع المخزن</div><div>اسم وتوقيع المستلم</div><div>التاريخ</div></div>
    <div class="op-ft">${esc(app)} · رقم الطلب ${serial(o.order_no)}</div></div>`;
  }

  A.oprint=async function(el){
    const o=(Array.isArray(ORD)?ORD:[]).find(x=>String(x.id)===String(el.dataset.id));
    if(!o) throw new Error('الطلب مش متحمّل، حدّث الصفحة وجرّب تاني');
    const dv=await driverOf(o.id,o);
    const old=document.getElementById('opr'); if(old) old.remove();
    const d=document.createElement('div'); d.id='opr';
    d.innerHTML=`<div class="opbar"><button type="button" class="go" data-opx="print">🖨️ طباعة / حفظ PDF</button><button type="button" class="ghost" data-opx="close">إغلاق</button></div>${noteHtml(o,dv)}`;
    d.addEventListener('click',e=>{
      const b=e.target.closest('[data-opx]'); if(!b) return;
      if(b.dataset.opx==='close') d.remove(); else window.print();
    });
    document.body.appendChild(d);
  };

  // زرار الطباعة على كروت طلبات المخزن (للطلبات المقبولة والمشحونة والمستلمة)
  function inject(){
    if(typeof ME==='undefined'||!ME||ME.role!=='warehouse') return;
    const list=Array.isArray(ORD)?ORD:[];
    document.querySelectorAll('.oc:not([data-opb])').forEach(c=>{
      const idEl=c.querySelector('[data-id]'); if(!idEl) return;
      c.dataset.opb='1';
      const o=list.find(x=>String(x.id)===String(idEl.dataset.id));
      if(!o||!['accepted','delivered','received'].includes(o.status)) return;
      const row=c.querySelector('.row'); if(!row) return;
      row.insertAdjacentHTML('beforeend','<button type="button" class="ghost" data-act="oprint" data-id="'+esc(o.id)+'">🖨️ إذن تسليم</button>');
    });
  }
  let tm=null;
  try{ new MutationObserver(()=>{ clearTimeout(tm); tm=setTimeout(inject,60); }).observe(document.body,{childList:true,subtree:true}); }catch(e){}
})();
