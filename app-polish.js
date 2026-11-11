/* app-polish.js — لمسات سرعة وحركة احترافية + زرار تثبيت التطبيق.
   CSS وأحداث بس، ما بيلمسش أي منطق في التطبيق. لو مش عاجبك امسح سطره من index.html والشكل يرجع. */
(function () {
  /* 1) اتصال مسبق بـ Supabase (بيوفّر وقت أول طلب) */
  try {
    if (typeof SUPABASE_URL === 'string') {
      const l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = SUPABASE_URL;
      l.crossOrigin = '';
      document.head.appendChild(l);
    }
  } catch (e) { /* تجاهل */ }

  /* 2) الشكل والحركة */
  const css = `
html{-webkit-tap-highlight-color:transparent}
button,a,input,select,textarea,[data-act]{touch-action:manipulation}
button{transition:transform .12s ease,opacity .15s ease,box-shadow .15s ease}
button:active:not(:disabled){transform:scale(.96)}
button:disabled{opacity:.6}
@keyframes ap-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
main.ap-in{animation:ap-in .22s ease-out}
.pc,.oc,.dc{content-visibility:auto;contain-intrinsic-size:auto 130px}
@keyframes ap-sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
.ap-sk{display:block;height:84px;border-radius:14px;margin:0 0 10px;background:linear-gradient(90deg,#e9efee 25%,#f6f9f8 37%,#e9efee 63%);background-size:400% 100%;animation:ap-sh 1.3s ease infinite}
.ap-sk.s{height:44px}
nav button.on::before{content:'';position:absolute;top:0;left:28%;right:28%;height:3px;border-radius:0 0 4px 4px;background:var(--p,#1F6F6B)}
#ap-inst{position:fixed;left:10px;right:10px;bottom:calc(72px + env(safe-area-inset-bottom));z-index:20;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--bd,#dfe8e7);border-radius:14px;padding:10px 12px;box-shadow:0 6px 24px rgba(0,0,0,.18);direction:rtl;animation:ap-in .25s ease-out}
#ap-inst span{flex:1;font-size:13px;line-height:1.5;color:#33403f}
#ap-inst button{padding:8px 14px!important;border-radius:10px;font-size:13px!important}
#ap-inst .x{background:#eef1f1!important;color:#556!important;padding:8px 10px!important}
@media (prefers-reduced-motion:reduce){main.ap-in,.ap-sk,#ap-inst{animation:none}button{transition:none}}
`;
  const st = document.createElement('style');
  st.id = 'app-polish';
  st.textContent = css;
  document.head.appendChild(st);

  /* الهيكل العظمي أثناء التحميل + حركة دخول الصفحة + صور غير معطّلة للعرض */
  let loading = false, raf = 0;
  function tick() {
    raf = 0;
    const m = document.getElementById('main');
    if (m) {
      const only = m.children.length === 1 ? m.firstElementChild : null;
      if (only && only.tagName === 'P' && /جاري التحميل/.test(only.textContent)) {
        m.innerHTML = '<i class="ap-sk"></i><i class="ap-sk"></i><i class="ap-sk s"></i><i class="ap-sk"></i>';
        loading = true;
      } else if (loading && m.firstElementChild && !m.firstElementChild.classList.contains('ap-sk')) {
        loading = false;
        m.classList.remove('ap-in');
        void m.offsetWidth;
        m.classList.add('ap-in');
      }
    }
    document.querySelectorAll('img:not([decoding])').forEach(i => { i.decoding = 'async'; });
  }
  new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(tick); }).observe(document.body, { childList: true, subtree: true });

  /* اهتزاز خفيف عند الضغط على التبويبات (أندرويد) */
  document.addEventListener('click', e => {
    if (navigator.vibrate && e.target.closest && e.target.closest('nav button')) navigator.vibrate(8);
  }, true);

  /* 3) زرار تثبيت التطبيق */
  const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const KEY = 'kv_inst_x';
  const dismissed = () => { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < 7 * 864e5; } catch (e) { return false; } };
  const hide = () => { const b = document.getElementById('ap-inst'); if (b) b.remove(); };
  let DEF = null;

  function show(text, withBtn) {
    if (standalone || dismissed() || document.getElementById('ap-inst')) return;
    const b = document.createElement('div');
    b.id = 'ap-inst';
    b.innerHTML = '<span>' + text + '</span>' + (withBtn ? '<button data-i="go">تثبيت</button>' : '') + '<button class="x" data-i="x">✕</button>';
    b.addEventListener('click', async ev => {
      const t = ev.target.closest('[data-i]');
      if (!t) return;
      if (t.dataset.i === 'x') {
        try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* تجاهل */ }
        hide();
        return;
      }
      if (DEF) {
        DEF.prompt();
        try { await DEF.userChoice; } catch (e) { /* تجاهل */ }
        DEF = null;
        hide();
      }
    });
    document.body.appendChild(b);
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    DEF = e;
    show('📲 ثبّت Kivra على موبايلك: أسرع وبيفتح زي أي تطبيق', true);
  });
  window.addEventListener('appinstalled', () => { DEF = null; hide(); });
  if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
    setTimeout(() => show('📲 للتثبيت: دوس زرار المشاركة ⬆️ في Safari ثم «إضافة إلى الشاشة الرئيسية»', false), 2500);
  }
})();
