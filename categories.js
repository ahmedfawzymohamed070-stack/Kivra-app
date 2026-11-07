/* Kivra: قايمة أقسام ثابتة للمنتجات الجديدة */
(function(){
  const CATS=['العناية بالشعر','العناية بالبشرة','العناية بالجسم','المكياج','العطور','العناية بالفم والأسنان','العناية بالأطفال','العناية بالرجال','أخرى'];
  const MAP=[
    [/hair|شعر/i,'العناية بالشعر'],
    [/skin|face|بشرة|وجه/i,'العناية بالبشرة'],
    [/body|جسم/i,'العناية بالجسم'],
    [/make.?up|مكياج|ميك/i,'المكياج'],
    [/perfume|fragrance|عطر|عطور/i,'العطور'],
    [/oral|dental|teeth|فم|اسنان|أسنان/i,'العناية بالفم والأسنان'],
    [/baby|kid|طفل|اطفال|أطفال/i,'العناية بالأطفال'],
    [/men|رجال/i,'العناية بالرجال']
  ];
  const norm=c=>{
    c=String(c||'').trim();
    if(!c) return '';
    if(CATS.includes(c)) return c;
    const m=MAP.find(x=>x[0].test(c));
    return m?m[1]:'أخرى';
  };

  // أي منتج جديد في الكتالوج (من الفورم أو Excel) قسمه يتظبط على القايمة
  const _rpc=sb.rpc.bind(sb);
  sb.rpc=function(name,args,opts){
    if(name==='add_catalog_product'&&args) args=Object.assign({},args,{p_category:norm(args.p_category)});
    return _rpc(name,args,opts);
  };

  // في فورم "منتج جديد": خانة القسم تبقى قايمة اختيار
  const _cn=A.cnew;
  A.cnew=async function(el){
    await _cn(el);
    const i=$('#nc');
    if(i&&i.tagName==='INPUT'){
      const s=document.createElement('select'); s.id='nc';
      s.innerHTML='<option value="">اختر القسم</option>'+CATS.map(c=>`<option value="${c}">${c}</option>`).join('');
      i.replaceWith(s);
    }
  };
})();
