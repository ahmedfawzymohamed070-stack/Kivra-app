/* receipt-bw.js — تصميم أبيض وأسود بسيط للإيصال وإذن التسليم.
   بيغيّر الشكل بس (ألوان وخطوط وجداول) ومبيلمسش أي وظيفة.
   مفيش أي ألوان أو تدرجات أو ظلال. مناسب للطباعة وتوفير الحبر.
   شعار Kivra بيفضل زي ما هو بلونه الأصلي.
   لو حصل أي خطأ التطبيق بيشتغل زي ما هو. */
(function () {
  try {
    var S = 'html body #rcpt';
    var css =
      S + '{background:#fff!important;color:#111!important;box-shadow:none!important}' +
      S + ' *{box-shadow:none!important;text-shadow:none!important;background-image:none!important}' +

      /* شريط الأزرار (على الشاشة فقط) */
      S + ' .rc-bar{background:#fff!important;border-bottom:1px solid #d9d9d9!important}' +
      S + ' .rc-bar button{background:#111!important;color:#fff!important}' +
      S + ' .rc-bar button.g{background:#fff!important;color:#111!important;border:1px solid #bdbdbd!important}' +
      S + ' .rc-tip{color:#555!important}' +

      /* الصفحة */
      S + ' .rc-page{background:#fff!important;color:#111!important}' +

      /* الرأس: اسم التطبيق وبيانات الطلب */
      S + ' .rc-head{border-bottom:2px solid #000!important;padding-bottom:12px!important}' +
      S + ' .rc-brand{color:#000!important;font-weight:800!important;letter-spacing:.3px}' +
      S + ' .rc-meta{color:#333!important}' +
      S + ' .rc-meta b{color:#000!important;font-size:15px}' +

      /* المخزن والصيدلية */
      S + ' .rc-box{background:#fff!important;border:1px solid #cfcfcf!important;border-radius:4px!important;color:#222!important}' +
      S + ' .rc-box b{color:#000!important;font-weight:800!important}' +

      /* الجدول */
      S + ' table{border-top:1px solid #000!important}' +
      S + ' th{background:#fff!important;color:#000!important;font-weight:800!important;border-bottom:2px solid #000!important}' +
      S + ' td{color:#222!important;border-bottom:1px solid #e0e0e0!important}' +

      /* الإجمالي */
      S + ' .rc-total{background:#fff!important;color:#000!important;border-top:2px solid #000!important;border-bottom:1px solid #cfcfcf!important;border-radius:0!important;font-weight:800!important}' +

      /* المندوب والتوقيعات */
      S + ' .rc-drv{border:1px dashed #b5b5b5!important;border-radius:4px!important;color:#222!important;background:#fff!important}' +
      S + ' .rc-sign div{border:1px solid #cfcfcf!important;border-radius:4px!important;color:#555!important;background:#fff!important}' +

      /* الملاحظات السفلية */
      S + ' .rc-foot{color:#555!important;border-top:1px solid #e0e0e0;padding-top:10px}' +

      /* الطباعة: أبيض وأسود بالكامل */
      '@media print{' + S + ',' + S + ' *{background:#fff!important;box-shadow:none!important}' +
      S + ' .rc-bar button{display:none!important}}';

    var st = document.createElement('style');
    st.id = 'receipt-bw-style';
    st.textContent = css;
    document.head.appendChild(st);
  } catch (e) {}
})();
