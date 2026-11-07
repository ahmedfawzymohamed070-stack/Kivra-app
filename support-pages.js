/* support-pages.js — تواصل معنا (واتساب) + الشروط والأحكام + سياسة الخصوصية
   بيتحمّل في آخر index.html بعد باقي الملفات. */
(function () {
  const WA = '201206968613';
  const waLink = () => {
    let name = '';
    try { name = (ME && ME.business_name) || ''; } catch (e) {}
    const t = 'مرحباً، أنا ' + (name || 'مستخدم') + ' من تطبيق Kivra وعندي استفسار:';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
  };

  const TERMS = {
    title: 'الشروط والأحكام',
    body: `
<h3>1. التعريفات</h3>
<p>المنصة: تطبيق Kivra. المخزن: شركة أو مورد مسجّل على المنصة لعرض منتجاته. الصيدلية: منشأة مسجّلة على المنصة لشراء المنتجات. الطلب: طلب شراء ترسله الصيدلية إلى مخزن عبر المنصة.</p>
<h3>2. دور المنصة</h3>
<p>المنصة وسيط تقني يربط المخازن بالصيدليات. عقد البيع يتم بين المخزن والصيدلية مباشرة، والمنصة ليست طرفاً فيه، ولا تبيع المنتجات ولا تخزنها ولا توصلها، ولا تضمن جودتها أو توفرها.</p>
<h3>3. الحسابات والتفعيل</h3>
<p>يلتزم المستخدم بتقديم بيانات صحيحة ورخصة سارية. يظهر لأي حساب مسجّل المنتجات وصورها، بينما تظهر الأسعار والخصومات وخاصية الطلب بعد موافقة الإدارة على الحساب. للمنصة حق قبول أو رفض أو إيقاف أي حساب. المستخدم مسؤول عن سرية كلمة المرور وعن كل ما يتم من خلال حسابه.</p>
<h3>4. المنتجات</h3>
<p>المنصة مخصصة لمنتجات الكوزمتكس والعناية الشخصية. يُحظر عرض الأدوية أو أي منتج غير مرخص أو مقلّد أو منتهي الصلاحية. المخزن مسؤول عن صحة بيانات منتجاته وأسعارها وكمياتها وترخيصها وصلاحيتها.</p>
<h3>5. الطلبات</h3>
<p>تُثبَّت الأسعار وقت إرسال الطلب ولا تتغير بتغير الأسعار لاحقاً. تُقسَّم السلة إلى طلب لكل مخزن، ويخضع كل طلب للحد الأدنى الذي يحدده المخزن. تُحجز الكميات عند إرسال الطلب وتعود للمخزن عند الرفض أو الإلغاء. يمكن للصيدلية إلغاء الطلب قبل قبول المخزن له. بعد تسليم الطلب تؤكد الصيدلية الاستلام، وإن لم تؤكد يُعتبر الطلب مستلماً تلقائياً بعد 7 أيام من التسليم.</p>
<h3>6. الدفع</h3>
<p>يتم الدفع مباشرة بين الصيدلية والمخزن خارج المنصة. المنصة لا تستلم أموال الصيدليات ولا تحتفظ بها.</p>
<h3>7. عمولة المنصة</h3>
<p>تستحق المنصة عمولة عن الطلبات التي تم استلامها، ويظهر مقدارها وكشف حساب العمولة للمخزن في حسابه. يلتزم المخزن بسداد العمولة المستحقة للمنصة وفق كشف الحساب. يحظر على المخزن الالتفاف على المنصة، ومن ذلك تسجيل طلب بحالة غير حقيقية أو إتمام الصفقة خارج المنصة بعد التعارف عليها من خلالها، ويحق للمنصة إيقاف الحساب عند المخالفة.</p>
<h3>8. المرتجعات</h3>
<p>تُتفق المرتجعات بين الصيدلية والمخزن مباشرة، وستتاح لاحقاً آلية لطلب المرتجعات داخل المنصة.</p>
<h3>9. التقييمات</h3>
<p>يمكن للصيدلية تقييم المخزن بعد استلام الطلب فقط. يُمنع المحتوى المسيء أو الكاذب، وللمنصة حذفه.</p>
<h3>10. الاستخدام المحظور</h3>
<p>يُمنع إدخال بيانات كاذبة، أو انتحال صفة، أو محاولة اختراق المنصة أو الإضرار بها أو بمستخدميها، أو استخدامها لغرض غير مشروع.</p>
<h3>11. إيقاف الحساب</h3>
<p>للمستخدم طلب إغلاق حسابه في أي وقت بعد تسوية أي التزامات قائمة، وللمنصة إيقاف الحساب عند مخالفة هذه الشروط.</p>
<h3>12. حدود المسؤولية</h3>
<p>تقدم المنصة خدمتها كما هي، وفي حدود ما يسمح به القانون لا تتحمل المسؤولية عن الخسائر الناتجة عن التعامل بين الصيدلية والمخزن، أو عن انقطاع الخدمة لأسباب خارجة عن إرادتها.</p>
<h3>13. تعديل الشروط</h3>
<p>قد تُعدَّل هذه الشروط من وقت لآخر، ويُعدّ استمرار الاستخدام بعد التعديل موافقة عليه.</p>
<h3>14. القانون الواجب التطبيق</h3>
<p>تخضع هذه الشروط للقانون المصري، وتختص المحاكم المصرية بنظر أي نزاع.</p>
<h3>15. التواصل</h3>
<p>للاستفسار تواصل معنا عبر واتساب من صفحة حسابي.</p>`
  };

  const PRIV = {
    title: 'سياسة الخصوصية',
    body: `
<h3>1. البيانات التي نجمعها</h3>
<p>بيانات الحساب (اسم المنشأة ورقم الموبايل والإيميل والعنوان)، وموقع الصيدلية (إحداثيات أو رابط خرائط جوجل)، وملف الرخصة وتاريخ انتهائها، وبيانات الطلبات والتقييمات، وبيانات تقنية بسيطة لتشغيل التطبيق.</p>
<h3>2. لماذا نستخدمها</h3>
<p>لتشغيل حسابك، والتحقق من الرخص، وتنفيذ الطلبات والتوصيل، وحساب العمولة وكشوف الحساب، والتواصل معك، وتحسين الخدمة وحماية المنصة.</p>
<h3>3. من يطّلع على بياناتك</h3>
<p>المخزن صاحب الطلب يرى اسم الصيدلية ورقمها وعنوانها وموقعها لتنفيذ الطلب فقط. الصيدلية ترى اسم المخزن ورقمه. الإدارة تطلع على بيانات الحسابات والرخص للتفعيل والمراجعة. لا نبيع بياناتك لأي جهة.</p>
<h3>4. الرخص والصور</h3>
<p>تُحفظ ملفات الرخص في تخزين خاص ولا يطلع عليها إلا الإدارة. أما صور المنتجات فهي متاحة لمن يملك رابطها.</p>
<h3>5. مزودو الخدمة</h3>
<p>نستخدم مزودين لخدمات الاستضافة وقواعد البيانات والتخزين لتشغيل المنصة، وقد تُحفظ البيانات على خوادم خارج مصر.</p>
<h3>6. مدة الاحتفاظ</h3>
<p>نحتفظ ببياناتك ما دام حسابك نشطاً، وبعد الإغلاق للمدة اللازمة للسجلات المالية والقانونية.</p>
<h3>7. حقوقك</h3>
<p>يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر واتساب، مع مراعاة ما يلزم الاحتفاظ به قانونياً أو محاسبياً.</p>
<h3>8. الأمان</h3>
<p>نستخدم اتصالاً مشفراً وصلاحيات وصول لحماية بياناتك، ومع ذلك لا يوجد نظام آمن بنسبة 100%، فاحرص على سرية كلمة المرور.</p>
<h3>9. التعديل والتواصل</h3>
<p>قد نحدّث هذه السياسة من وقت لآخر. وللاستفسار تواصل معنا عبر واتساب.</p>`
  };

  const st = document.createElement('style');
  st.textContent = '.lg h3{margin:14px 0 4px;font-size:16px;color:#a63d9e}.lg p{margin:0 0 6px;font-size:14px;line-height:1.8}';
  document.head.appendChild(st);

  function showLegal(kind) {
    const d = kind === 'terms' ? TERMS : PRIV;
    const old = document.getElementById('legal-ov'); if (old) old.remove();
    const o = document.createElement('div');
    o.id = 'legal-ov';
    o.style.cssText = 'position:fixed;inset:0;background:rgba(42,24,48,.55);z-index:30;display:flex;align-items:flex-end;justify-content:center';
    o.innerHTML = '<div style="background:#fff;width:100%;max-width:760px;max-height:88vh;overflow:auto;border-radius:18px 18px 0 0;padding:18px 18px calc(24px + env(safe-area-inset-bottom));direction:rtl">' +
      '<div class="row" style="justify-content:space-between"><h2 style="margin:0">' + d.title + '</h2><button class="ghost" data-close>إغلاق</button></div>' +
      '<div style="margin:6px 0 10px;color:#9b6b00;font-size:13px">نسخة تجريبية قيد المراجعة القانونية.</div>' +
      '<div class="lg">' + d.body + '</div></div>';
    o.addEventListener('click', ev => { if (ev.target === o || ev.target.closest('[data-close]')) o.remove(); });
    document.body.appendChild(o);
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-legal]');
    if (!a) return;
    e.preventDefault();
    showLegal(a.dataset.legal);
  });

  const supportCards = () =>
    '<div class="card"><h2>تواصل معنا</h2><p class="muted">للدعم أو الاستفسار أو طلب تعديل بياناتك.</p>' +
    '<a href="' + waLink() + '" target="_blank" rel="noopener"><button type="button">💬 تواصل عبر واتساب</button></a></div>' +
    '<div class="card"><h2>الشروط والخصوصية</h2><div class="row">' +
    '<button type="button" class="ghost" data-legal="terms">الشروط والأحكام</button>' +
    '<button type="button" class="ghost" data-legal="privacy">سياسة الخصوصية</button></div></div>';

  // صفحة حسابي للصيدلية والمخزن: نشيل الكروت المؤقتة ونحط الجديدة
  ['pharmacy', 'warehouse'].forEach(role => {
    const orig = V[role] && V[role].acc;
    if (!orig) return;
    V[role].acc = async function (m) {
      await orig(m);
      m.querySelectorAll('.card').forEach(c => {
        const h = c.querySelector('h2');
        if (h && h.textContent.trim() === 'تواصل معنا') c.remove();
        else if (!h && c.querySelector('details') && /الشروط والأحكام/.test(c.textContent)) c.remove();
      });
      m.insertAdjacentHTML('beforeend', supportCards());
    };
  });

  // شاشة الدخول والتسجيل: روابط + موافقة إجبارية عند إنشاء حساب
  if (typeof authView === 'function') {
    const origAuth = authView;
    window.authView = function (mode) {
      origAuth(mode);
      try {
        const f = document.querySelector('#af');
        if (!f) return;
        if (f.querySelector('#role')) {
          const btn = f.querySelector('button');
          const lab = document.createElement('label');
          lab.innerHTML = '<input type="checkbox" id="agree" style="display:inline-block;width:auto;margin:0 0 0 8px"> أوافق على <a href="#" data-legal="terms" style="color:#a63d9e">الشروط والأحكام</a> و<a href="#" data-legal="privacy" style="color:#a63d9e">سياسة الخصوصية</a>';
          f.insertBefore(lab, btn);
          const prev = f.onsubmit;
          f.onsubmit = function (e) {
            if (!document.getElementById('agree').checked) {
              e.preventDefault();
              toast('لازم توافق على الشروط والأحكام وسياسة الخصوصية');
              return false;
            }
            return prev.call(this, e);
          };
        }
        const p = document.createElement('p');
        p.className = 'muted';
        p.innerHTML = '<a href="#" data-legal="terms" style="color:#a63d9e">الشروط والأحكام</a> · <a href="#" data-legal="privacy" style="color:#a63d9e">سياسة الخصوصية</a> · <a href="' + waLink() + '" target="_blank" rel="noopener" style="color:#a63d9e">تواصل معنا</a>';
        f.parentElement.appendChild(p);
      } catch (err) { /* لو الشكل اتغيّر، الصفحة تفضل شغالة عادي */ }
    };
  }
})();
