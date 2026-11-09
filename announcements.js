/* Kivra: العروض والرسائل جوه التطبيق (جرس فوق + عدّاد غير مقروء + إرسال من الأدمن) */
(function(){
  const KEY='kv_ann_seen';
  let LIST=[], OPEN=false;

  const st=document.createElement('style');
  st.textContent=`
  .bell{position:relative;padding:8px 12px!important}
  .bdot{position:absolute;top:-4px;left:-4px;background:#E3A857;color:#17302E;border-radius:99px;font-size:11px;min-width:18px;padding:0 5px;text-align:center;line-height:18px}
  #annp{position:fixed;inset:0;z-index:50;background:var(--bg);overflow:auto;padding-bottom:40px}
  #annp .ah{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:calc(12px + env(safe-area-inset-top)) 16px 12px;background:linear-gradient(135deg,var(--p),var(--p2));color:#fff;font-size:18px}
  #annp .ah button{background:rgba(255,255,255,.2);color:#fff;padding:8px 14px}
  #annp .ab{max-width:760px;margin:0 auto;padding:16px}
  .am{white-space:pre-wrap;margin:6px 0}
  textarea{display:block;width:100%;margin-top:4px;padding:11px;border:1px solid #cfe0dd;border-radius:12px;font-size:16px;font-family:inherit;background:#fff;color:inherit}`;
  document.head.appendChild(st);

  const seen=()=>{try{return localStorage.getItem(KEY)||''}catch(e){return ''}};
  const setSeen=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};
  const unread=()=>LIST.filter(a=>a.created_at>seen()).length;
  const AUD={all:'الكل',pharmacy:'الصيدليات',warehouse:'المخازن'};

  function paintBadge(){
    const d=document.querySelector('#bell .bdot'); if(!d) return;
    const n=unread(); d.textContent=n>9?'9+':n; d.hidden=!n;
  }
  async function load(){
    if(!ME) return;
    const r=await sb.rpc('my_announcements');
    if(r.error) return;
    LIST=r.data||[]; paintBadge();
  }

  function drawPanel(){
    let p=$('#annp');
    if(!p){
      p=document.createElement('div'); p.id='annp'; document.body.appendChild(p);
      p.addEventListener('click',e=>{ const t=e.target.closest('[data-x]'); if(t) run(()=>act(t)); });
    }
    const adm=ME.role==='admin';
    p.innerHTML=`<div class="ah"><b>🔔 العروض والرسائل</b><button type="button" data-x="close">✕</button></div><div class="ab">
    ${adm?`<div class="card"><h2>إرسال رسالة جديدة</h2>
    <label>العنوان<input id="at"></label>
    <label>الرسالة<textarea id="am" rows="4"></textarea></label>
    <label>لمين؟<select id="au"><option value="all">الكل</option><option value="pharmacy">الصيدليات</option><option value="warehouse">المخازن</option></select></label>
    <button type="button" data-x="send">إرسال</button></div>`:''}
    ${LIST.length?LIST.map(a=>`<div class="card"><b>${esc(a.title)}</b><div class="am">${esc(a.body)}</div>
    <div class="muted">${new Date(a.created_at).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})}${adm?' · '+esc(AUD[a.audience]||''):''}</div>
    ${adm?`<button type="button" class="red" data-x="del" data-id="${esc(a.id)}" style="margin-top:8px">حذف</button>`:''}</div>`).join('')
    :'<p class="muted">لا توجد رسائل بعد.</p>'}</div>`;
  }

  async function act(t){
    const k=t.dataset.x;
    if(k==='close'){ OPEN=false; const p=$('#annp'); if(p) p.remove(); return; }
    if(k==='send'){
      const title=$('#at').value.trim(), body=$('#am').value.trim();
      if(!title||!body) throw new Error('اكتب العنوان والرسالة');
      ok(await sb.rpc('send_announcement',{p_title:title,p_body:body,p_audience:$('#au').value}));
      toast('تم إرسال الرسالة'); await load(); drawPanel(); return;
    }
    if(k==='del'){
      if(!confirm('حذف الرسالة؟')) return;
      ok(await sb.rpc('delete_announcement',{p_id:t.dataset.id}));
      await load(); drawPanel();
    }
  }

  async function openPanel(){
    OPEN=true; await load(); drawPanel();
    if(LIST[0]){ setSeen(LIST[0].created_at); paintBadge(); }
  }

  function ensure(){
    const h=document.querySelector('header');
    if(!h||!ME||h.querySelector('#bell')) return;
    LIST=[];
    const b=document.createElement('button');
    b.id='bell'; b.type='button'; b.className='bell'; b.innerHTML='🔔<span class="bdot" hidden></span>';
    b.onclick=()=>run(openPanel);
    h.insertBefore(b,h.querySelector('[data-act="logout"]')||null);
    load();
  }

  try{ new MutationObserver(ensure).observe(document.body,{childList:true,subtree:true}); }catch(e){}
  setInterval(()=>{ if(ME) load(); },60000);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&ME) load(); });
})();
