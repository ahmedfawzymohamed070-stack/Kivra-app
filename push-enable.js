/* push-enable.js — زرار "تفعيل الإشعارات". بيطلب الإذن، بيشترك في Web Push، ويحفظ الاشتراك في Supabase.
   لو حصل أي خطأ مفيش حاجة في التطبيق بتتأثر. لو مش عاجبك امسحه وسطر script بتاعه. */
(function () {
  var VAPID = 'BOz9e75LrHyl6gJCgli-_cD4ovHuarhexI2To-jJH8_zfLC0hfWlkZ1_cOdHrinCxskfhRtwoW4k9VUErwO5Ns4';

  var st = document.createElement('style');
  st.textContent =
    '#pushbtn{position:fixed;left:12px;bottom:78px;z-index:9998;background:var(--p,#a63d9e);color:#fff;border:0;border-radius:99px;padding:9px 14px;font-size:13px;font-weight:700;box-shadow:0 3px 12px rgba(0,0,0,.25);display:none}' +
    '#pushmsg{position:fixed;left:12px;right:12px;bottom:130px;z-index:9999;background:#2b2230;color:#fff;border-radius:12px;padding:10px 14px;font-size:13.5px;line-height:1.6;display:none}';
  document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'pushbtn';
  btn.textContent = '🔔 تفعيل الإشعارات';
  var msg = document.createElement('div');
  msg.id = 'pushmsg';
  document.body.appendChild(btn);
  document.body.appendChild(msg);

  var mt;
  function say(t, ms) {
    msg.textContent = t;
    msg.style.display = 'block';
    clearTimeout(mt);
    mt = setTimeout(function () { msg.style.display = 'none'; }, ms || 6000);
  }

  function keyBytes(b64) {
    var p = '='.repeat((4 - (b64.length % 4)) % 4);
    var s = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/'));
    var a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }

  function supported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  async function subscribeAndSave() {
    var reg = await navigator.serviceWorker.register('/sw.js');
    reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if (!sub) {
      try {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID) });
      } catch (e) {
        var old = await reg.pushManager.getSubscription();
        if (old) await old.unsubscribe();
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID) });
      }
    }
    var j = sub.toJSON();
    var r = await sb.rpc('save_push_subscription', {
      p_endpoint: j.endpoint,
      p_p256dh: j.keys.p256dh,
      p_auth: j.keys.auth
    });
    if (r && r.error) throw r.error;
    return true;
  }

  async function onClick() {
    try {
      if (!supported()) {
        say('الإشعارات مش متاحة في المتصفح ده. على الآيفون: من زرار المشاركة اختار "إضافة إلى الشاشة الرئيسية"، وافتح التطبيق من الأيقونة، وبعدها دوس الزرار تاني.', 10000);
        return;
      }
      if (Notification.permission === 'denied') {
        say('الإشعارات مقفولة للموقع. افتح إعدادات الموقع من المتصفح (علامة القفل جنب العنوان) واسمح بالإشعارات، وبعدها حاول تاني.', 10000);
        return;
      }
      var perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        say('لازم توافق على الإشعارات عشان توصلك الطلبات.');
        return;
      }
      await subscribeAndSave();
      btn.style.display = 'none';
      say('تم تفعيل الإشعارات ✅');
    } catch (e) {
      say('حصلت مشكلة في تفعيل الإشعارات. جرّب تاني، ولو اتكررت صوّرلي الرسالة.');
      try { console.error('push-enable', e); } catch (_) {}
    }
  }
  btn.onclick = onClick;

  async function refresh() {
    try {
      if (typeof sb === 'undefined') return;
      var s = await sb.auth.getSession();
      var logged = !!(s && s.data && s.data.session);
      if (!logged) { btn.style.display = 'none'; return; }
      if (supported() && Notification.permission === 'granted') {
        btn.style.display = 'none';
        try { await subscribeAndSave(); } catch (e) {}
        return;
      }
      btn.style.display = 'block';
    } catch (e) { /* مفيش تأثير على التطبيق */ }
  }

  var tries = 0;
  (function boot() {
    if (typeof sb === 'undefined') {
      if (++tries < 15) setTimeout(boot, 1000);
      return;
    }
    refresh();
    try { sb.auth.onAuthStateChange(function () { setTimeout(refresh, 300); }); } catch (e) {}
  })();
})();
