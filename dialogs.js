/* dialogs.js — نوافذ تأكيد وتنبيه وتقييم داخل التطبيق بدل رسائل المتصفح */
(function () {
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const origConfirm = window.confirm.bind(window);
  let last = null, lastT = 0, pendingOK = false;

  const st = document.createElement('style');
  st.textContent = `
#kv-dlg{position:fixed;inset:0;z-index:100;background:rgba(10,30,28,.55);display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;animation:kvf .15s}
.kv-box{background:#fff;border-radius:18px;max-width:340px;width:100%;padding:20px 18px 16px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.25);animation:kvp .18s}
.kv-ic{font-size:30px;margin-bottom:6px}
.kv-t{font-size:15px;line-height:1.7;color:#1f2a2a;margin-bottom:16px;white-space:pre-line}
.kv-b{display:flex;gap:8px}
.kv-b button{flex:1;padding:11px;border-radius:12px;border:0;font-size:14px;font-weight:600;cursor:pointer}
.kv-no{background:#eef1f1;color:#334}
.kv-yes{background:linear-gradient(135deg,var(--p,#0f766e),var(--p2,#14b8a6));color:#fff}
.kv-red{background:#c0392b!important}
.kv-stars{display:flex;justify-content:center;gap:4px;margin:4px 0 10px;direction:ltr}
.kv-stars button{background:none!important;border:0;font-size:34px;line-height:1;padding:2px 4px;color:#d3d8d8;cursor:pointer}
.kv-stars button.on{color:#f5a623}
.kv-box textarea{width:100%;min-height:70px;border:1px solid #d9dede;border-radius:12px;padding:10px;font-size:14px;font-family:inherit;margin-bottom:14px;resize:none;box-sizing:border-box}
@keyframes kvf{from{opacity:0}to{opacity:1}}
@keyframes kvp{from{transform:scale(.94);opacity:.5}to{transform:scale(1);opacity:1}}`;
  document.head.appendChild(st);

  const closeDlg = () => { const o = document.getElementById('kv-dlg'); if (o) o.remove(); };
  function open(html, onClick) {
    closeDlg();
    const o = document.createElement('div');
    o.id = 'kv-dlg';
    o.innerHTML = '<div class="kv-box">' + html + '</div>';
    o.addEventListener('click', ev => { if (ev.target === o) { closeDlg(); return; } onClick(ev, o); });
    document.body.appendChild(o);
    return o;
  }

  function ask(msg, yes, danger) {
    open('<div class="kv-ic">' + (danger ? '⚠️' : '❔') + '</div><div class="kv-t">' + E(msg) + '</div>' +
      '<div class="kv-b"><button class="kv-no" data-no>إلغاء</button><button class="kv-yes' + (danger ? ' kv-red' : '') + '" data-yes>تأكيد</button></div>',
      ev => {
        if (ev.target.closest('[data-no]')) closeDlg();
        else if (ev.target.closest('[data-yes]')) { closeDlg(); yes(); }
      });
  }

  function info(msg) {
    open('<div class="kv-ic">ℹ️</div><div class="kv-t">' + E(msg) + '</div><div class="kv-b"><button class="kv-yes" data-ok>حسنًا</button></div>',
      ev => { if (ev.target.closest('[data-ok]')) closeDlg(); });
  }

  // تتبّع آخر زرار اتداس عليه (عشان نعيد تنفيذه بعد التأكيد)
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (el) {
      last = { act: el.dataset.act, id: el.dataset.id, st: el.dataset.st };
      lastT = Date.now();
    }
  }, true);

  function replay() {
    if (!last) return;
    let sel = '[data-act="' + last.act + '"]';
    if (last.id) sel += '[data-id="' + String(last.id).replace(/"/g, '') + '"]';
    if (last.st) sel += '[data-st="' + String(last.st).replace(/"/g, '') + '"]';
    const el = document.querySelector(sel);
    if (!el) return;
    pendingOK = true;
    el.click();
    setTimeout(() => { pendingOK = false; }, 600);
  }

  window.confirm = function (msg) {
    if (pendingOK) { pendingOK = false; return true; }
    if (!last || Date.now() - lastT > 1500) return origConfirm(msg);
    let text = String(msg || ''), danger = /حذف|مسح/.test(text);
    if (last.act === 'ostat' && text === 'متأكد؟') {
      if (last.st === 'rejected') { text = 'تأكيد رفض الطلب؟ الكمية هترجع للمخزن.'; danger = true; }
      else if (last.st === 'cancelled') { text = 'تأكيد إلغاء الطلب؟'; danger = true; }
    }
    ask(text, replay, danger);
    return false;
  };

  window.alert = function (msg) { info(msg); };

  // تقييم المخزن بنجوم بدل نافذة المتصفح
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act="rate"]');
    if (!b) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const oid = b.dataset.id;
    let stars = 0;
    open('<div class="kv-ic">⭐</div><div class="kv-t">قيّم المخزن</div>' +
      '<div class="kv-stars">' + [1, 2, 3, 4, 5].map(n => '<button data-s="' + n + '">★</button>').join('') + '</div>' +
      '<textarea id="kv-c" placeholder="تعليق (اختياري)"></textarea>' +
      '<div class="kv-b"><button class="kv-no" data-no>إلغاء</button><button class="kv-yes" data-send>إرسال</button></div>',
      async (ev, o) => {
        const s = ev.target.closest('[data-s]');
        if (s) {
          stars = +s.dataset.s;
          o.querySelectorAll('.kv-stars button').forEach(x => x.classList.toggle('on', +x.dataset.s <= stars));
          return;
        }
        if (ev.target.closest('[data-no]')) { closeDlg(); return; }
        if (ev.target.closest('[data-send]')) {
          if (!stars) { if (typeof toast === 'function') toast('اختار عدد النجوم'); return; }
          const c = (document.getElementById('kv-c').value || '').slice(0, 500);
          try {
            const r = await sb.rpc('rate_order', { p_oid: oid, p_stars: stars, p_comment: c });
            if (r.error) throw r.error;
            closeDlg();
            if (typeof toast === 'function') toast('شكراً لتقييمك');
            if (typeof show === 'function' && typeof TAB !== 'undefined') show(TAB);
          } catch (err) {
            if (typeof toast === 'function') toast(err.message || 'تعذر إرسال التقييم');
          }
        }
      });
  }, true);
})();
