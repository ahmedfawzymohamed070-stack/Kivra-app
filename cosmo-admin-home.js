/* cosmo-admin-home.js: الرئيسية الجديدة للأدمن والمخزن (كروت + رسم آخر 7 أيام + توزيع الطلبات + آخر الطلبات)
   بتقرأ من نفس my_orders اللي موجودة. مفيش تغيير في Business Logic أو DB. بتتحمّل بعد kivra-shell.js */
(function(){
'use strict';
if(window.__cfAdminHome)return; window.__cfAdminHome=1;
if(typeof V==='undefined'||!V.admin)return;

var VALID={pending:1,accepted:1,delivered:1,received:1};
var D={
  money:'M12 3v18M16 7c-1-1.4-2.6-2-4-2-2.4 0-4 1-4 3s1.6 3 4 3 4 1 4 3-1.6 3-4 3c-1.4 0-3-.6-4-2',
  today:'M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  box:'M12 3l8 4v10l-8 4-8-4V7zM12 12l8-5M12 12v9M12 12L4 7',
  users:'M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M17 5.2a3 3 0 0 1 0 5.6'
};
function ic(d,s){
  return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
}
var css='.cfd-t{margin:4px 2px 14px;font-size:22px;font-weight:700;color:#14302b}'+
'.cfd-k{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}'+
'.cfd-c{background:#fff;border:1px solid #dcebe7;border-radius:16px;box-shadow:0 2px 10px rgba(10,74,64,.07);padding:14px}'+
'button.cfd-c{display:block;width:100%;text-align:start;color:inherit;font:inherit}'+
'.cfd-k .cfd-c{display:flex;flex-direction:column;gap:4px;position:relative}'+
'.cfd-i{width:34px;height:34px;border-radius:10px;background:#E6F2EF;color:#0F6B5B;display:flex;align-items:center;justify-content:center;margin-bottom:4px}'+
'.cfd-l{font-size:12px;color:#566663}.cfd-v{font-size:20px;font-weight:700;color:#0A4A40;word-break:break-word}'+
'.cfd-g{display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px}'+
'.cfd-h{margin:0 0 10px;font-size:15px;font-weight:700;color:#14302b}'+
'.cfd-ch{direction:ltr}.cfd-ch svg{width:100%;height:auto;display:block}'+
'.cfd-dn{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.cfd-dn svg{width:130px;height:130px;flex:none}'+
'.cfd-lg{flex:1;min-width:130px;display:flex;flex-direction:column;gap:6px;font-size:13px}'+
'.cfd-lg div{display:flex;align-items:center;gap:8px}.cfd-lg i{width:10px;height:10px;border-radius:50%;flex:none}'+
'.cfd-lg b{margin-inline-start:auto;color:#0A4A40}'+
'.cfd-row{display:flex!important;justify-content:space-between;align-items:center;gap:10px;background:none!important;color:inherit!important;border-radius:0!important;padding:11px 2px!important;border-top:1px solid #e4efed!important;width:100%;text-align:start}'+
'.cfd-row:first-of-type{border-top:0!important}.cfd-row .muted{font-size:12px}'+
'.cfd-em{color:#566663;font-size:13px;padding:10px 0}'+
'@media(min-width:1024px){.cfd-k{grid-template-columns:repeat(4,1fr)}.cfd-g{grid-template-columns:2fr 1fr}}';
var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

function dkey(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function card(icon,label,val,go){
  var inner='<span class="cfd-i">'+ic(D[icon],20)+'</span><span class="cfd-l">'+label+'</span><span class="cfd-v">'+val+'</span>';
  return go?'<button type="button" class="cfd-c" data-kv="go" data-t="'+go+'">'+inner+'</button>':'<div class="cfd-c">'+inner+'</div>';
}
function lineChart(days,vals){
  var max=Math.max.apply(null,vals);
  if(!(max>0))return '<div class="cfd-em">لا توجد طلبات في آخر 7 أيام.</div>';
  var W=300,H=130,L=14,R=14,T=14,B=26,n=vals.length,pts=[];
  vals.forEach(function(v,i){pts.push([L+i*((W-L-R)/(n-1)),T+(H-T-B)*(1-v/max)]);});
  var line=pts.map(function(p,i){return(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ');
  var area=line+' L'+pts[n-1][0].toFixed(1)+' '+(H-B)+' L'+pts[0][0].toFixed(1)+' '+(H-B)+' Z';
  var lbl=days.map(function(d,i){return '<text x="'+pts[i][0].toFixed(1)+'" y="'+(H-8)+'" font-size="9" fill="#566663" text-anchor="middle">'+d.getDate()+'/'+(d.getMonth()+1)+'</text>';}).join('');
  var dots=pts.map(function(p){return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3" fill="#0F6B5B"/>';}).join('');
  return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="قيمة الطلبات آخر 7 أيام"><path d="'+area+'" fill="#0F6B5B" opacity=".12"/><path d="'+line+'" fill="none" stroke="#0F6B5B" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'+dots+lbl+
    '<text x="'+L+'" y="10" font-size="9" fill="#566663">'+Math.round(max)+'</text></svg>';
}
function donut(segs,total){
  var r=42,C=2*Math.PI*r,acc=0,rings='';
  segs.forEach(function(s){
    var dash=s.n/total*C;
    rings+='<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="'+s.c+'" stroke-width="16" stroke-dasharray="'+dash.toFixed(2)+' '+(C-dash).toFixed(2)+'" stroke-dashoffset="'+(-acc).toFixed(2)+'"/>';
    acc+=dash;
  });
  var svg='<svg viewBox="0 0 120 120" role="img" aria-label="توزيع الطلبات"><g transform="rotate(-90 60 60)">'+rings+'</g><text x="60" y="58" text-anchor="middle" font-size="20" font-weight="700" fill="#0A4A40">'+total+'</text><text x="60" y="74" text-anchor="middle" font-size="9" fill="#566663">إجمالي الطلبات</text></svg>';
  var lg=segs.map(function(s){return '<div><i style="background:'+s.c+'"></i>'+s.l+'<b>'+Math.round(s.n/total*100)+'%</b></div>';}).join('');
  return '<div class="cfd-dn">'+svg+'<div class="cfd-lg">'+lg+'</div></div>';
}

async function vHome(m){
  var isAdmin=ME.role==='admin';
  var o=[],fail=false,pa=0;
  try{o=ok(await sb.rpc('my_orders'))||[];}catch(e){fail=true;}
  if(isAdmin)try{
    var r=await sb.from('profiles').select('id',{count:'exact',head:true}).eq('status','pending').neq('role','admin');
    pa=r.count||0;
  }catch(e){}
  var now=new Date(),tk=dkey(now);
  var valid=o.filter(function(x){return VALID[x.status];});
  var total=valid.reduce(function(s,x){return s+Number(x.total||0);},0);
  var today=o.filter(function(x){return x.created_at&&dkey(new Date(x.created_at))===tk;}).length;
  var pend=o.filter(function(x){return x.status==='pending';}).length;
  var days=[],vals=[];
  for(var i=6;i>=0;i--){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);days.push(d);vals.push(0);}
  valid.forEach(function(x){
    if(!x.created_at)return;
    var k=dkey(new Date(x.created_at));
    for(var j=0;j<7;j++){if(dkey(days[j])===k){vals[j]+=Number(x.total||0);break;}}
  });
  var G=[['pending',OST.pending||'بانتظار المخزن','#E3A857'],['accepted',OST.accepted||'مقبول','#1E8A76'],['delivered',OST.delivered||'تم التسليم','#5BB5A5'],['received',OST.received||'تم الاستلام','#0A4A40']];
  var segs=G.map(function(g){return{n:o.filter(function(x){return x.status===g[0];}).length,l:g[1],c:g[2]};});
  var bad=o.filter(function(x){return x.status==='rejected'||x.status==='cancelled';}).length;
  segs.push({n:bad,l:'ملغي / مرفوض',c:'#C0392B'});
  segs=segs.filter(function(s){return s.n>0;});
  var acc=o.filter(function(x){return x.status==='accepted';}).length;
  var latest=o.slice().sort(function(a,b){return new Date(b.created_at||0)-new Date(a.created_at||0);}).slice(0,5);
  var rows=latest.map(function(x){
    var cls=x.status==='received'?'approved':(x.status==='rejected'||x.status==='cancelled')?'rejected':'pending';
    return '<button type="button" class="cfd-row" data-kv="go" data-t="ord"><span><b>طلب #'+esc(x.order_no)+'</b><div class="muted">'+(isAdmin?esc(x.pharmacy)+' ← '+esc(x.warehouse):esc(x.pharmacy))+' · '+esc(fd(x.created_at))+'</div></span>'+
      '<span style="text-align:end"><b>'+esc(money(x.total))+'</b><div><span class="badge '+cls+'">'+esc(OST[x.status]||x.status)+'</span></div></span></button>';
  }).join('');
  var h='<div class="cfd-t">الرئيسية</div>';
  if(fail)h+='<div class="kv-note">تعذر تحميل بيانات الطلبات، جرّب تفتح الصفحة تاني.</div>';
  h+='<div class="cfd-k">'+card('money','إجمالي قيمة الطلبات',esc(money(total)))+card('today','طلبات اليوم',today)+card('box','طلبات جديدة',pend,'ord')+(isAdmin?card('users','حسابات للمراجعة',pa,'acct'):card('users',esc(OST.accepted||'قيد التجهيز'),acc,'ord'))+'</div>';
  h+='<div class="cfd-g"><div class="cfd-c"><h3 class="cfd-h">قيمة الطلبات خلال آخر 7 أيام</h3><div class="cfd-ch">'+lineChart(days,vals)+'</div></div>'+
     '<div class="cfd-c"><h3 class="cfd-h">توزيع الطلبات</h3>'+(segs.length?donut(segs,o.length):'<div class="cfd-em">لا توجد طلبات بعد.</div>')+'</div></div>';
  h+='<div class="cfd-c" style="margin-top:12px"><h3 class="cfd-h">آخر الطلبات</h3>'+(rows||'<div class="cfd-em">لا توجد طلبات بعد.</div>')+'</div>';
  m.innerHTML=h;
}
V.admin.home=vHome;
if(V.warehouse)V.warehouse.home=vHome;
})();
