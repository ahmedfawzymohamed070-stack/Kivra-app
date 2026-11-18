/* Kivra: فلتر المخازن بالمحافظة والمنطقة. المخزن يحدد منطقته من حسابي، والصيدلية تفلتر من الموزعين (إضافة فقط) */
(function(){
const GOVS=['القاهرة','الجيزة','الإسكندرية','القليوبية','الشرقية','الدقهلية','الغربية','المنوفية','البحيرة','كفر الشيخ','دمياط','بورسعيد','الإسماعيلية','السويس','شمال سيناء','جنوب سيناء','الفيوم','بني سويف','المنيا','أسيوط','سوهاج','قنا','الأقصر','أسوان','البحر الأحمر','الوادي الجديد','مطروح'];
const SUG={'القاهرة':['مدينة نصر','مصر الجديدة','المعادي','التجمع الخامس','الشروق','مدينتي','الرحاب','شبرا','وسط البلد','الزمالك','المقطم','حلوان','عين شمس','المطرية','السيدة زينب','العباسية','الزيتون','النزهة','حدائق القبة','البساتين','دار السلام','المرج'],
'الجيزة':['الدقي','المهندسين','العجوزة','الهرم','فيصل','6 أكتوبر','الشيخ زايد','إمبابة','بولاق الدكرور','العمرانية','الوراق','المنيب','حدائق الأهرام','أوسيم','كرداسة'],
'الإسكندرية':['سموحة','المنتزه','العجمي','المندرة','سيدي جابر','محرم بك','العصافرة','سيدي بشر','ميامي','الإبراهيمية','كامب شيزار','الشاطبي','لوران','الأنفوشي','برج العرب','العطارين'],
'القليوبية':['بنها','شبرا الخيمة','قليوب','الخانكة','العبور','الخصوص','كفر شكر','طوخ','القناطر الخيرية']};
const nz=s=>String(s||'').replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim().toLowerCase();
const E=s=>(typeof esc==='function'?esc(s==null?'':s):String(s==null?'':s));
const msg=t=>{try{toast(t)}catch(e){alert(t)}};
const st=document.createElement('style');
st.textContent='.rg select,#rg-card select,#rg-card input{display:block;width:100%;padding:11px;border:1px solid #cfdcda;border-radius:12px;font-size:16px;margin:6px 0;background:#fff}.rg .muted{margin:4px 0 8px}';
document.head.appendChild(st);
let MAP=null, MAP_AT=0, RG={g:'',a:''};
async function loadMap(){
  if(MAP&&Date.now()-MAP_AT<60000) return MAP;
  const r=await sb.rpc('list_warehouses2'); if(r.error||!Array.isArray(r.data)) return null;
  MAP={}; r.data.forEach(w=>{MAP[String(w.id)]={g:w.governorate||'',a:w.area||'',n:nz(w.area)};}); MAP_AT=Date.now(); return MAP;
}
function whId(el){ const b=el.querySelector('[data-id]'); return b?String(b.getAttribute('data-id')):null; }
function apply(main){
  const els=[...main.querySelectorAll('.wh')], n=$count(els);
  function $count(list){ let c=0; list.forEach(el=>{ const m=MAP&&MAP[whId(el)]||{g:'',a:'',n:''};
    const show=(!RG.g||m.g===RG.g)&&(!RG.a||m.n===RG.a); el.style.display=show?'':'none'; if(show) c++; }); return c; }
  const note=document.getElementById('rg-n'); if(note) note.textContent=(RG.g||RG.a)?(n?('المخازن المعروضة: '+n):'مفيش مخازن في الاختيار ده'):'';
}
function opts(list,all){ return '<option value="">'+all+'</option>'+list.map(x=>'<option value="'+E(x)+'"'+'>'+E(x)+'</option>').join(''); }
async function injectPharmacy(main){
  const h=[...main.querySelectorAll('h2')].find(x=>(x.textContent||'').indexOf('الموزعين')>-1); if(!h||document.getElementById('rg-box')) return;
  if(!main.querySelector('.wh')) return;
  const map=await loadMap(); if(!map||document.getElementById('rg-box')) return;
  const govs=[...new Set(Object.values(map).map(x=>x.g).filter(Boolean))].sort((a,b)=>GOVS.indexOf(a)-GOVS.indexOf(b));
  if(!govs.length) return;
  const box=document.createElement('div'); box.id='rg-box'; box.className='rg';
  box.innerHTML='<select id="rg-g">'+opts(govs,'كل المحافظات')+'</select><select id="rg-a" hidden></select><div id="rg-n" class="muted"></div>';
  h.parentNode.insertBefore(box,h.nextSibling);
  const g=box.querySelector('#rg-g'), a=box.querySelector('#rg-a');
  function fillAreas(){ const seen={}; Object.values(map).filter(x=>x.g===RG.g&&x.n).forEach(x=>{ if(!seen[x.n]) seen[x.n]=x.a; });
    const keys=Object.keys(seen).sort((p,q)=>seen[p].localeCompare(seen[q],'ar'));
    a.innerHTML='<option value="">كل المناطق</option>'+keys.map(k=>'<option value="'+E(k)+'">'+E(seen[k])+'</option>').join('');
    a.hidden=!(RG.g&&keys.length); a.value=RG.a; }
  g.value=RG.g; fillAreas();
  g.onchange=()=>{ RG.g=g.value; RG.a=''; fillAreas(); apply(main); };
  a.onchange=()=>{ RG.a=a.value; apply(main); };
  apply(main);
}
async function injectWarehouse(main){
  if(document.getElementById('rg-card')||(main.textContent||'').indexOf('بيانات الحساب')<0) return;
  const card=document.createElement('div'); card.className='card'; card.id='rg-card';
  card.innerHTML='<h2>📍 منطقة التغطية</h2><p class="muted">الصيدليات هتقدر تلاقيك بالمحافظة والمنطقة.</p><select id="rgw-g">'+opts(GOVS,'اختار المحافظة')+'</select><input id="rgw-a" list="rgw-l" placeholder="المنطقة (اكتب أو اختار من الاقتراحات)" maxlength="60"><datalist id="rgw-l"></datalist><button type="button" id="rgw-s">حفظ</button>';
  main.insertBefore(card,main.children[1]||null);
  try{ const r=await sb.rpc('wh_my_region'); if(r.data){ if(r.data.governorate){ card.querySelector('#rgw-g').value=r.data.governorate; card.querySelector('#rgw-g').dispatchEvent(new Event('change')); } if(r.data.area) card.querySelector('#rgw-a').value=r.data.area; } }catch(e){}
  const gsel=card.querySelector('#rgw-g'), dl=card.querySelector('#rgw-l');
  const sug=()=>{ dl.innerHTML=((window.KIVRA_AREAS&&window.KIVRA_AREAS[gsel.value])||SUG[gsel.value]||[]).map(x=>'<option value="'+E(x)+'">').join(''); };
  gsel.onchange=sug; sug();
  card.querySelector('#rgw-s').onclick=async()=>{
    const g=card.querySelector('#rgw-g').value, a=card.querySelector('#rgw-a').value.trim();
    if(!g){ msg('اختار المحافظة'); return; }
    const r=await sb.rpc('wh_set_region',{p_gov:g,p_area:a||null});
    msg(r.error?'مقدرتش أحفظ، جرّب تاني':'تم حفظ منطقة التغطية'); MAP=null;
  };
}
let tmr=null;
new MutationObserver(()=>{ clearTimeout(tmr); tmr=setTimeout(()=>{
  try{
    if(typeof ME==='undefined'||!ME) return; const main=document.getElementById('main'); if(!main) return;
    if(ME.role==='pharmacy') injectPharmacy(main); else if(ME.role==='warehouse') injectWarehouse(main);
  }catch(e){}
},100); }).observe(document.body,{childList:true,subtree:true});
})();
