(function () {
  'use strict';

  var TOKEN_KEY = 'artosphere-admin-token';
  var token = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch (e) {}

  var loginShell = document.getElementById('loginShell');
  var adminShell = document.getElementById('adminShell');

  function showAdmin() {
    loginShell.style.display = 'none';
    adminShell.style.display = 'block';
    loadProjects();
    loadMessages();
  }
  function showLogin() {
    loginShell.style.display = 'block';
    adminShell.style.display = 'none';
  }

  function authFetch(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({}, opts.headers, { Authorization: 'Bearer ' + token });
    return fetch(url, opts).then(function (res) {
      if (res.status === 401) {
        try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
        token = null;
        showLogin();
        throw new Error('unauthorized');
      }
      return res;
    });
  }

  /* ---------------- ورود ---------------- */
  var loginForm = document.getElementById('loginForm');
  var loginError = document.getElementById('loginError');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      }),
    })
      .then(function (res) { return res.json().then(function (b) { return { ok: res.ok, body: b }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.body.error || 'خطا در ورود');
        token = r.body.token;
        try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
        showAdmin();
      })
      .catch(function (err) { loginError.textContent = err.message; });
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    token = null;
    showLogin();
  });

  /* ---------------- تب‌ها ---------------- */
  document.querySelectorAll('.admin-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('is-active'); });
      document.querySelectorAll('.admin-panel').forEach(function (p) { p.classList.remove('is-active'); });
      tab.classList.add('is-active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('is-active');
    });
  });

  /* ---------------- پروژه‌ها ---------------- */
  var projectForm = document.getElementById('projectForm');
  var projectFormError = document.getElementById('projectFormError');
  var newProjectBtn = document.getElementById('newProjectBtn');
  var cancelProjectBtn = document.getElementById('cancelProjectBtn');
  var tbody = document.getElementById('projectsTableBody');

  function resetForm() {
    projectForm.reset();
    document.getElementById('pf-id').value = '';
    document.getElementById('pf-slug').removeAttribute('disabled');
    projectFormError.textContent = '';
  }

  newProjectBtn.addEventListener('click', function () {
    resetForm();
    projectForm.style.display = 'block';
  });
  cancelProjectBtn.addEventListener('click', function () {
    projectForm.style.display = 'none';
    resetForm();
  });

  function fillForm(p) {
    document.getElementById('pf-id').value = p.id;
    document.getElementById('pf-slug').value = p.slug;
    document.getElementById('pf-slug').setAttribute('disabled', 'true');
    document.getElementById('pf-year').value = p.year || '';
    document.getElementById('pf-title-fa').value = p.title_fa || '';
    document.getElementById('pf-title-en').value = p.title_en || '';
    document.getElementById('pf-cat-fa').value = p.category_fa || '';
    document.getElementById('pf-cat-en').value = p.category_en || '';
    document.getElementById('pf-summary-fa').value = p.summary_fa || '';
    document.getElementById('pf-summary-en').value = p.summary_en || '';
    document.getElementById('pf-desc-fa').value = p.description_fa || '';
    document.getElementById('pf-desc-en').value = p.description_en || '';
    document.getElementById('pf-cover').value = p.cover_image || '';
    document.getElementById('pf-order').value = p.sort_order || 0;
    document.getElementById('pf-published').value = String(!!p.is_published);
    projectForm.style.display = 'block';
  }

  function loadProjects() {
    authFetch('/api/projects/admin/all')
      .then(function (res) { return res.json(); })
      .then(function (list) {
        tbody.innerHTML = list
          .map(function (p) {
            return (
              '<tr>' +
              '<td>' + escapeHtml(p.title_fa) + '<br><small style="color:var(--color-muted)">' + escapeHtml(p.title_en) + '</small></td>' +
              '<td>' + escapeHtml(p.slug) + '</td>' +
              '<td>' + (p.is_published ? 'منتشرشده' : 'پیش‌نویس') + '</td>' +
              '<td class="row-actions">' +
                '<button data-action="edit" data-id="' + p.id + '">ویرایش</button>' +
                '<button data-action="delete" data-id="' + p.id + '">حذف</button>' +
              '</td>' +
              '</tr>'
            );
          })
          .join('');

        tbody.querySelectorAll('button[data-action="edit"]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var project = list.find(function (p) { return String(p.id) === btn.dataset.id; });
            if (project) fillForm(project);
          });
        });
        tbody.querySelectorAll('button[data-action="delete"]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (!confirm('این پروژه حذف شود؟')) return;
            authFetch('/api/projects/' + btn.dataset.id, { method: 'DELETE' })
              .then(loadProjects)
              .catch(function () {});
          });
        });
      })
      .catch(function () {});
  }

  projectForm.addEventListener('submit', function (e) {
    e.preventDefault();
    projectFormError.textContent = '';

    var id = document.getElementById('pf-id').value;
    var payload = {
      slug: document.getElementById('pf-slug').value.trim(),
      year: document.getElementById('pf-year').value.trim(),
      title_fa: document.getElementById('pf-title-fa').value.trim(),
      title_en: document.getElementById('pf-title-en').value.trim(),
      category_fa: document.getElementById('pf-cat-fa').value.trim(),
      category_en: document.getElementById('pf-cat-en').value.trim(),
      summary_fa: document.getElementById('pf-summary-fa').value.trim(),
      summary_en: document.getElementById('pf-summary-en').value.trim(),
      description_fa: document.getElementById('pf-desc-fa').value.trim(),
      description_en: document.getElementById('pf-desc-en').value.trim(),
      cover_image: document.getElementById('pf-cover').value.trim(),
      sort_order: Number(document.getElementById('pf-order').value) || 0,
      is_published: document.getElementById('pf-published').value === 'true',
    };

    var request = id
      ? authFetch('/api/projects/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : authFetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    request
      .then(function (res) { return res.json().then(function (b) { return { ok: res.ok, body: b }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.body.error || 'خطا در ذخیره پروژه');
        projectForm.style.display = 'none';
        resetForm();
        loadProjects();
      })
      .catch(function (err) { projectFormError.textContent = err.message; });
  });

  /* ---------------- پیام‌ها ---------------- */
  var messagesTableBody = document.getElementById('messagesTableBody');

  function loadMessages() {
    authFetch('/api/contact')
      .then(function (res) { return res.json(); })
      .then(function (list) {
        messagesTableBody.innerHTML = list
          .map(function (m) {
            var date = new Date(m.created_at).toLocaleDateString('fa-IR');
            return (
              '<tr>' +
              '<td>' + (!m.is_read ? '<span class="unread-dot"></span>' : '') + escapeHtml(m.name) + '</td>' +
              '<td><a href="mailto:' + escapeHtml(m.email) + '">' + escapeHtml(m.email) + '</a></td>' +
              '<td style="max-width:320px;">' + escapeHtml(m.message) + (m.budget ? '<br><small style="color:var(--color-muted)">بودجه: ' + escapeHtml(m.budget) + '</small>' : '') + '</td>' +
              '<td>' + date + '</td>' +
              '<td>' + (!m.is_read ? '<button data-action="read" data-id="' + m.id + '">علامت به‌عنوان خوانده‌شده</button>' : '') + '</td>' +
              '</tr>'
            );
          })
          .join('');

        messagesTableBody.querySelectorAll('button[data-action="read"]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            authFetch('/api/contact/' + btn.dataset.id + '/read', { method: 'PUT' }).then(loadMessages).catch(function () {});
          });
        });
      })
      .catch(function () {});
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- شروع ---------------- */
  if (token) { showAdmin(); } else { showLogin(); }
})();
