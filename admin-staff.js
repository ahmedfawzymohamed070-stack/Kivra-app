/* admin-staff.js (v2) — المشرفون وصلاحياتهم، وإنشاء حساب الموظف من التطبيق نفسه.
   - المشرف الرئيسي (إنت) بيشوف تبويب "🛡️ المشرفون": يضيف موظف (إيميل + باسورد مؤقت + صلاحيات)، يعدّل الصلاحيات، يغيّر الباسورد، أو يشيله.
   - المشرف المحدود بيشوف التبويبات المسموحة له بس، والداتابيز بتمنعه من الكتابة في اللي مش مسموح له.
   محتاج Edge Function اسمها staff-admin. بيتحمّل قبل polish-theme.js وبعد admin-catalog.js. لو حصل أي خطأ التطبيق بيشتغل زي ما هو. */
(function () {
  var LABELS = {
    accounts: 'الحسابات (الموافقة على الصيدليات والمخازن)',
    orders: 'الطلبات (مشاهدة)',
    commission: 'العمولة والدفعات والتقارير',
    catalog: 'الكتالوج',
    announce: 'العروض والإشعارات'
  };
  var MAP = { acct: 'accounts', ord: 'orders', comm: 'commission', cat: 'catalog' };

  if (typeof TABS === 'undefined' || !TABS.admin || typeof V === 'undefined' || !V.admin || typeof show !== 'function') return;

  var ORIG = TABS.admin.slice();
  var PERMS = null, PERMS_FOR = null;

  async function loadPerms() {
    var p = { is_admin: true, is_super: true, perms: [] };
    try {
      var r = await sb.rpc('my_admin_perms');
      if (!r.error && r.data && r.data.is_admin) {
        p = { is_admin: true, is_super: !!r.data.is_super, perms: Array.isArray(r.data.perms) ? r.data.perms : [] };
      }
    } catch (e) {}
    return p;
  }

  function applyTabs() {
    var keep = ORIG.filter(function (x) {
      if (PERMS.is_super) return true;
      var need = MAP[x[0]];
      return !!need && PERMS.perms.indexOf(need) >= 0;
    });
    if (PERMS.is_super) keep.push(['staff', '🛡️', 'المشرفون']);
    if (!keep.length) keep.push(['none', '⛔', 'لا صلاحيات']);
    TABS.admin.length = 0;
    keep.forEach(function (x) { TABS.admin.push(x); });
  }

  var _show = show;
  show = async function (t) {
    try {
      if (typeof ME !== 'undefined' && ME && ME.role === 'admin') {
        if (!PERMS || PERMS_FOR !== ME.id) {
          PERMS = await loadPerms();
          PERMS_FOR = ME.id;
        }
        applyTabs();
        var keys = TABS.admin.map(function (x) { return x[0]; });
        if (keys.indexOf(t) < 0) t = keys[0];
      }
    } catch (e) {}
    return _show(t);
  };

  V.admin.none = async function (m) {
    m.innerHTML = '<div class="card"><h2>مفيش صلاحيات</h2><p class="muted">حسابك مشرف بس لسه ما اتحددتلوش صلاحيات. كلّم المشرف الرئيسي.</p></div>';
  };

  async function callStaff(body) {
    var r = await sb.functions.invoke('staff-admin', { body: body });
    if (r.error) {
      var msg = r.error.message || 'تعذر تنفيذ الطلب';
      try {
        if (r.error.context && r.error.context.json) {
          var j = await r.error.context.json();
          if (j && j.error) msg = j.error;
        }
      } catch (e) {}
      if (/not found|404/i.test(msg)) msg = 'دالة staff-admin مش منشورة لسه على Supabase';
      throw new Error(msg);
    }
    if (r.data && r.data.error) throw new Error(r.data.error);
    return r.data;
  }

  function permBoxes() {
    return Object.keys(LABELS).map(function (k) {
      return '<label style="display:flex;gap:8px;align-items:center;margin:6px 0">' +
        '<input type="checkbox" data-perm="' + k + '" style="width:auto;display:inline-block;margin:0">' +
        '<span>' + esc(LABELS[k]) + '</span></label>';
    }).join('');
  }

  V.admin.staff = async function (m) {
    if (!PERMS || !PERMS.is_super) {
      m.innerHTML = '<div class="card"><p class="muted">الصفحة دي للمشرف الرئيسي بس.</p></div>';
      return;
    }
    var r = await sb.rpc('admin_list_admins');
    if (r.error) throw r.error;
    var list = r.data || [];
    var editing = null;

    var cards = list.map(function (a, i) {
      var perms = (a.perms || []).map(function (k) { return LABELS[k] || k; });
      return '<div class="card"><div><b>' + esc(a.name || '—') + '</b> ' +
        (a.is_super ? '<span class="badge approved">رئيسي</span>' : '<span class="badge pending">مشرف</span>') + '</div>' +
        '<div class="muted" dir="ltr" style="text-align:right">' + esc(a.email) + '</div>' +
        (a.is_super ? '<div class="muted">كل الصلاحيات</div>' :
          '<div class="muted">' + (perms.length ? esc(perms.join(' · ')) : 'من غير صلاحيات') + '</div>' +
          '<div class="row" style="margin-top:8px"><button type="button" class="ghost" data-sedit="' + i + '">تعديل الصلاحيات</button>' +
          '<button type="button" class="ghost" data-spw="' + i + '">🔑 باسورد جديد</button>' +
          '<button type="button" class="red" data-sdel="' + i + '">إزالة</button></div>' +
          '<div class="row" data-spwrow="' + i + '" style="margin-top:8px" hidden>' +
          '<input data-spwin="' + i + '" type="text" dir="ltr" placeholder="الباسورد الجديد (8 حروف على الأقل)" style="flex:1;margin:0">' +
          '<button type="button" data-spwgo="' + i + '">حفظ</button></div>') + '</div>';
    }).join('');

    m.innerHTML =
      '<div class="card"><h2>🛡️ المشرفون</h2><div class="muted">أضف موظفين وحدد لكل واحد صلاحياته. الإخفاء بيحصل في الشاشات، والكتابة (الموافقات والدفعات والكتالوج والعروض) بتتمنع من الداتابيز نفسها. مشاهدة الطلبات بتتحجب من الشاشة بس.</div></div>' +
      cards +
      '<div class="card" id="stform"><h2 id="sttitle">إضافة موظف</h2>' +
      '<div class="muted" id="sthint">اكتب إيميل الموظف وباسورد مؤقت، والحساب بيتعمل تلقائياً. ابعتله الإيميل والباسورد وهو يغيّره بعد أول دخول.</div>' +
      '<label>الإيميل<input id="stem" type="email" dir="ltr" placeholder="staff@example.com"></label>' +
      '<label>الاسم<input id="stnm" placeholder="اسم الموظف"></label>' +
      '<label id="stpwl">باسورد مؤقت (8 حروف على الأقل)<input id="stpw" type="text" dir="ltr" autocomplete="off"></label>' +
      '<div><b>الصلاحيات</b>' + permBoxes() + '</div>' +
      '<div class="row" style="margin-top:8px"><button id="stsave">حفظ</button><button id="stcancel" class="ghost" type="button" hidden>إلغاء التعديل</button></div>' +
      '<div class="muted" style="margin-top:6px">لو غيّرت صلاحيات موظف شغال، لازم يسجّل خروج ويدخل تاني.</div></div>';

    function setForm(a) {
      editing = a || null;
      m.querySelector('#stem').value = a ? a.email : '';
      m.querySelector('#stem').readOnly = !!a;
      m.querySelector('#stnm').value = a ? (a.name || '') : '';
      m.querySelector('#stpw').value = '';
      m.querySelector('#stpwl').hidden = !!a;
      m.querySelector('#sttitle').textContent = a ? 'تعديل صلاحيات الموظف' : 'إضافة موظف';
      m.querySelector('#sthint').hidden = !!a;
      m.querySelector('#stcancel').hidden = !a;
      m.querySelectorAll('[data-perm]').forEach(function (c) {
        c.checked = !!(a && (a.perms || []).indexOf(c.getAttribute('data-perm')) >= 0);
      });
      var f = m.querySelector('#stform');
      if (f && f.scrollIntoView) f.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    m.querySelectorAll('[data-sedit]').forEach(function (b) {
      b.onclick = function () { setForm(list[Number(b.getAttribute('data-sedit'))]); };
    });
    m.querySelector('#stcancel').onclick = function () { setForm(null); };

    m.querySelectorAll('[data-spw]').forEach(function (b) {
      b.onclick = function () {
        var row = m.querySelector('[data-spwrow="' + b.getAttribute('data-spw') + '"]');
        if (row) row.hidden = !row.hidden;
      };
    });
    m.querySelectorAll('[data-spwgo]').forEach(function (b) {
      b.onclick = function () {
        run(async function () {
          var i = b.getAttribute('data-spwgo');
          var a = list[Number(i)];
          var pw = m.querySelector('[data-spwin="' + i + '"]').value;
          if (pw.length < 8) throw new Error('الباسورد لازم 8 حروف على الأقل');
          await callStaff({ action: 'reset_password', user_id: a.user_id, password: pw });
          toast('تم تغيير الباسورد');
          await show('staff');
        });
      };
    });

    m.querySelectorAll('[data-sdel]').forEach(function (b) {
      b.onclick = function () {
        if (b.getAttribute('data-armed') !== '1') {
          b.setAttribute('data-armed', '1');
          b.textContent = 'تأكيد الإزالة؟';
          setTimeout(function () { b.setAttribute('data-armed', '0'); b.textContent = 'إزالة'; }, 4000);
          return;
        }
        run(async function () {
          var a = list[Number(b.getAttribute('data-sdel'))];
          var x = await sb.rpc('admin_revoke', { p_user: a.user_id });
          if (x.error) throw x.error;
          toast('تمت إزالة الموظف');
          await show('staff');
        });
      };
    });

    m.querySelector('#stsave').onclick = function () {
      run(async function () {
        var email = m.querySelector('#stem').value.trim();
        if (!email) throw new Error('اكتب الإيميل');
        var perms = [];
        m.querySelectorAll('[data-perm]').forEach(function (c) { if (c.checked) perms.push(c.getAttribute('data-perm')); });
        var name = m.querySelector('#stnm').value.trim();
        if (editing) {
          var x = await sb.rpc('admin_grant', { p_email: email, p_perms: perms, p_name: name || null });
          if (x.error) throw x.error;
          toast('تم حفظ الصلاحيات');
        } else {
          var pw = m.querySelector('#stpw').value;
          if (pw.length < 8) throw new Error('الباسورد المؤقت لازم 8 حروف على الأقل');
          await callStaff({ action: 'create', email: email, password: pw, name: name, perms: perms });
          toast('تم إنشاء حساب الموظف');
        }
        await show('staff');
      });
    };
  };
})();
