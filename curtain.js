/* curtain.js — الستارة: بتخفي المتجر والعميل عن الصيدليات والزوار لحد ما نخلّصهم.
   الأدمن بيشوف كل حاجة. وضع المعاينة على موبايلك: افتح الموقع بـ ?preview=on (وللإلغاء ?preview=off).
   ملحوظة: دي ستارة على مستوى الشاشة بس، مش حماية أمنية. */
(function () {
  const KEY = 'kivra_preview';
  const HIDE_TEXTS = ['متجري'];            // أي زرار نصه فيه الكلمة دي يتخفي
  const HIDE_OPTION_VALUES = ['customer']; // خيارات التسجيل اللي تتخفي

  // وضع المعاينة: بيتفعّل بالرابط ويتحفظ على الموبايل ده بس
  try {
    const u = new URL(location.href), p = u.searchParams.get('preview');
    if (p === 'on') localStorage.setItem(KEY, '1');
    if (p === 'off') localStorage.removeItem(KEY);
    if (p) { u.searchParams.delete('preview'); history.replaceState(null, '', u.pathname + (u.search || '') + u.hash); }
  } catch (e) {}
  const preview = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const role = () => { try { return ME && ME.role; } catch (e) { return null; } };
  const open = () => preview() || role() === 'admin';

  // شيل أي تبويب متجر من تبويبات الصيدلية (لو موجود)
  try {
    if (!preview() && typeof TABS !== 'undefined' && Array.isArray(TABS.pharmacy)) {
      TABS.pharmacy = TABS.pharmacy.filter(t => !/store|متجر/i.test(String(t[0]) + String(t[2])));
    }
  } catch (e) {}

  function badge() {
    let b = document.getElementById('kv-prev');
    if (preview()) {
      if (!b) {
        b = document.createElement('div');
        b.id = 'kv-prev';
        b.textContent = 'وضع المعاينة';
        b.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top) + 2px);left:50%;transform:translateX(-50%);z-index:60;background:#f5a623;color:#222;font-size:10px;padding:1px 10px;border-radius:99px;opacity:.9;pointer-events:none';
        document.body.appendChild(b);
      }
    } else if (b) b.remove();
  }

  function unhide() {
    document.querySelectorAll('[data-curtain]').forEach(el => {
      el.style.removeProperty('display');
      el.removeAttribute('data-curtain');
    });
  }

  function guardCustomer() {
    const g = document.getElementById('kv-curtain');
    if (role() === 'customer' && !preview()) {
      if (g) return;
      const o = document.createElement('div');
      o.id = 'kv-curtain';
      o.style.cssText = 'position:fixed;inset:0;z-index:90;background:var(--bg,#f4f7f6);display:flex;align-items:center;justify-content:center;padding:24px;direction:rtl;text-align:center';
      o.innerHTML = '<div style="max-width:320px"><div style="font-size:44px">🛠️</div>' +
        '<h2 style="margin:10px 0 6px;color:var(--p,#1f6f6b)">المتجر لسه تحت التجهيز</h2>' +
        '<p style="color:#667;font-size:14px;line-height:1.7">بنجهّز كل حاجة عشان تبقى تجربتك أحسن. هنفتحه قريباً بإذن الله.</p>' +
        '<button data-act="logout" style="margin-top:14px;padding:10px 22px;border:0;border-radius:12px;background:var(--p,#1f6f6b);color:#fff;font-size:14px">تسجيل الخروج</button></div>';
      document.body.appendChild(o);
    } else if (g) g.remove();
  }

  function apply() {
    badge();
    guardCustomer();
    if (open()) { unhide(); return; }
    document.querySelectorAll('button,a,[role="button"]').forEach(el => {
      if (el.hasAttribute('data-curtain')) return;
      const t = (el.textContent || '').trim();
      if (t.length <= 40 && HIDE_TEXTS.some(x => t.includes(x))) {
        el.setAttribute('data-curtain', '1');
        el.style.setProperty('display', 'none', 'important');
      }
    });
    document.querySelectorAll('select option').forEach(o => {
      if (HIDE_OPTION_VALUES.includes(o.value)) {
        const s = o.parentElement;
        o.remove();
        if (s && HIDE_OPTION_VALUES.includes(s.value)) { s.selectedIndex = 0; s.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    });
  }

  let raf = 0;
  const mo = new MutationObserver(() => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; apply(); });
  });
  function start() { mo.observe(document.body, { childList: true, subtree: true }); apply(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
