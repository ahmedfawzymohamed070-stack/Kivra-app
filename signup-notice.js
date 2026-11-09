/* signup-notice.js — تنبيه في شاشة إنشاء الحساب: الصيدلية والمخزن لازم يرفعوا الرخصة أو ما يثبت النشاط.
   بيظهر بس لما نوع الحساب يكون صيدلية أو مخزن. لو حصل أي خطأ مفيش حاجة في التطبيق بتتأثر.
   بيتحمّل قبل polish-theme.js. */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '.rnote{background:#FFF7E6;border:1px solid #F0D9A8;color:#7a5b00;border-radius:12px;padding:9px 12px;font-size:13px;line-height:1.7;margin:8px 0}';
  document.head.appendChild(st);

  var NOTE = '⚠️ لو بتسجّل كصيدلية أو مخزن: لازم ترفع الرخصة أو ما يثبت نشاطك (سجل تجاري أو بطاقة ضريبية) بعد التسجيل من صفحة "حسابي". الحساب مش بيتفعّل، ولا بتظهر الأسعار ولا بتقدر تطلب، إلا بعد ما نراجع المستند ونوافق. أي بيانات غير صحيحة بتتسبب في رفض الحساب.';

  function sync(sel, note) {
    note.style.display = (sel.value === 'pharmacy' || sel.value === 'warehouse') ? '' : 'none';
  }

  function decorate() {
    var sel = document.getElementById('role');
    if (!sel || sel.getAttribute('data-rnote')) return;
    sel.setAttribute('data-rnote', '1');
    var label = sel.closest('label') || sel.parentNode;
    var note = document.createElement('div');
    note.className = 'rnote';
    note.textContent = NOTE;
    label.parentNode.insertBefore(note, label.nextSibling);
    sel.addEventListener('change', function () { sync(sel, note); });
    sync(sel, note);
  }

  try { decorate(); } catch (e) {}
  try {
    new MutationObserver(function () { try { decorate(); } catch (e) {} })
      .observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  } catch (e) {}
})();
