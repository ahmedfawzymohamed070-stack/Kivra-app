/* Kivra: أي رسالة عروض يبعتها الأدمن تطلع كمان إشعار على موبايلات العملاء */
(function(){
  const _rpc=sb.rpc.bind(sb);
  sb.rpc=function(name,args,opts){
    const q=_rpc(name,args,opts);
    if(name!=='send_announcement') return q;
    return Promise.resolve(q).then(r=>{
      if(!r.error&&r.data){
        sb.functions.invoke('push-announce',{body:{id:r.data}})
          .then(x=>{ if(x.error) throw x.error; toast('وصل إشعار لـ '+((x.data&&x.data.sent)||0)+' موبايل'); })
          .catch(()=>toast('الرسالة اتبعتت، لكن الإشعار ما اتبعتش'));
      }
      return r;
    });
  };
})();
