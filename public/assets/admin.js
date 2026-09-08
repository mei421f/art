(function () {
  'use strict';

  var TOKEN_KEY = 'artosphere-admin-token';
  var token = null;
  try { token = localStorage.getItem(TOKEN_KEY); } catch (e) {}

  var state = {
    projects: [],
    messages: [],
    media: [],
  };

  /* ==================== عناصر پایه ==================== */
  var loginScreen = document.getElementById('loginScreen');
  var adminApp = document.getElementById('adminApp');

  function showAdmin() {
    loginScreen.hidden = true;
    adminApp.hidden = false;
    loadEverything();
  }
  function showLogin() {
    loginScreen.hidden = false;
    adminApp.hidden = true;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtSize(bytes) {
    if (!bytes) return '0 KB';
    var kb = bytes / 1024;
    if (kb < 1024) return Math.round(kb) + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return iso; }
  }

  /* ==================== toast ==================== */
  var toastStack = document.getElementById('toastStack');
  function toast(message, type) {
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = message;
    toastStack.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 220ms ease';
      setTimeout(function () { el.remove(); }, 240);
    }, 3200);
  }

  /* ==================== fetch با احراز هویت ==================== */
  function authFetch(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({}, opts.headers, { Authorization: 'Bearer ' + token });
    return fetch(url, opts).then(function (res) {
      if (res.status === 401) {
        try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
        token = null;
        showLogin();
        throw new Error('نشست شما منقضی شده؛ دوباره وارد شوید.');
      }
      return res;
    });
  }

  function authJson(url, opts) {
    return authFetch(url, opts).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.error || 'خطای ناشناخته رخ داد.');
        return body;
      });
    });
  }

  /* ==================== ورود / خروج ==================== */
  var loginForm = document.getElementById('loginForm');
  var loginError = document.getElementById('loginError');

  function setBtnLoading(btn, loading) {
    var label = btn.querySelector('.btn-label');
    var spinner = btn.querySelector('.spinner');
    btn.disabled = loading;
    if (spinner) spinner.hidden = !loading;
    if (label) label.style.opacity = loading ? '0.6' : '1';
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';
    var submitBtn = loginForm.querySelector('button[type="submit"]');
    setBtnLoading(submitBtn, true);

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
      .catch(function (err) { loginError.textContent = err.message; })
      .finally(function () { setBtnLoading(submitBtn, false); });
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    token = null;
    showLogin();
  });

  /* ==================== تب‌ها ==================== */
  document.querySelectorAll('.admin-nav-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.admin-nav-item').forEach(function (b) { b.classList.remove('is-active'); });
      document.querySelectorAll('.admin-panel').forEach(function (p) { p.classList.remove('is-active'); });
      btn.classList.add('is-active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('is-active');
    });
  });

  function loadEverything() {
    loadProjects();
    loadMessages();
    loadMedia();
    loadTelegramStatus();
  }

  /* ==================== آپلود فایل (مشترک) ====================
     یک XHR با نوار پیشرفت؛ برای هم کاور پروژه و هم تب رسانه‌ها استفاده می‌شود. */
  function uploadFile(file, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/uploads');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = function () {
        var body = {};
        try { body = JSON.parse(xhr.responseText); } catch (e) {}
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body.error || 'خطا در آپلود فایل.'));
      };
      xhr.onerror = function () { reject(new Error('خطای شبکه هنگام آپلود فایل.')); };
      var fd = new FormData();
      fd.append('file', file);
      xhr.send(fd);
    });
  }

  /* ==================== پروژه‌ها ==================== */
  var projectsGrid = document.getElementById('projectsGrid');
  var projectsEmpty = document.getElementById('projectsEmpty');
  var projectsSummary = document.getElementById('projectsSummary');
  var projectStats = document.getElementById('projectStats');

  function loadProjects() {
    authJson('/api/projects/admin/all')
      .then(function (list) {
        state.projects = list || [];
        renderProjects();
      })
      .catch(function (err) { toast(err.message, 'error'); });
  }

  function renderProjects() {
    var list = state.projects;
    projectsSummary.textContent = list.length + ' پروژه';
    projectsEmpty.hidden = list.length > 0;

    var published = list.filter(function (p) { return p.is_published; }).length;
    projectStats.innerHTML =
      '<span class="stat-chip">کل <strong>' + list.length + '</strong></span>' +
      '<span class="stat-chip">منتشرشده <strong>' + published + '</strong></span>' +
      '<span class="stat-chip">پیش‌نویس <strong>' + (list.length - published) + '</strong></span>';

    projectsGrid.innerHTML = list.map(function (p) {
      var media = p.cover_image
        ? (p.cover_type === 'video'
            ? '<video src="' + escapeHtml(p.cover_image) + '" muted loop playsinline preload="metadata"></video>'
            : '<img src="' + escapeHtml(p.cover_image) + '" alt="" loading="lazy" />')
        : '<div class="no-media">بدون کاور</div>';

      return (
        '<article class="project-card" data-id="' + p.id + '">' +
          '<div class="project-card-media">' + media +
            '<span class="media-type-tag">' + (p.cover_type === 'video' ? 'ویدیو' : 'عکس') + '</span>' +
            '<span class="status-tag ' + (p.is_published ? 'published' : 'draft') + '">' + (p.is_published ? 'منتشرشده' : 'پیش‌نویس') + '</span>' +
          '</div>' +
          '<div class="project-card-body">' +
            '<span class="project-card-title">' + escapeHtml(p.title_fa) + '</span>' +
            '<span class="project-card-sub">' + escapeHtml(p.slug) + (p.year ? ' · ' + escapeHtml(p.year) : '') + '</span>' +
          '</div>' +
          '<div class="project-card-actions">' +
            '<button class="btn btn-secondary btn-sm" data-action="edit">ویرایش</button>' +
            '<button class="btn btn-danger btn-sm" data-action="delete">حذف</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    projectsGrid.querySelectorAll('.project-card').forEach(function (card) {
      var id = card.dataset.id;
      card.querySelector('[data-action="edit"]').addEventListener('click', function (e) {
        e.stopPropagation();
        openProjectModal(state.projects.find(function (p) { return String(p.id) === id; }));
      });
      card.querySelector('[data-action="delete"]').addEventListener('click', function (e) {
        e.stopPropagation();
        deleteProject(id);
      });
      card.addEventListener('click', function () {
        openProjectModal(state.projects.find(function (p) { return String(p.id) === id; }));
      });
    });
  }

  function deleteProject(id) {
    if (!confirm('این پروژه برای همیشه حذف شود؟')) return;
    authJson('/api/projects/' + id, { method: 'DELETE' })
      .then(function () { toast('پروژه حذف شد.', 'success'); loadProjects(); })
      .catch(function (err) { toast(err.message, 'error'); });
  }

  /* -------- مودال فرم پروژه -------- */
  var projectModalOverlay = document.getElementById('projectModalOverlay');
  var projectModalTitle = document.getElementById('projectModalTitle');
  var projectForm = document.getElementById('projectForm');
  var projectFormError = document.getElementById('projectFormError');
  var deleteProjectBtn = document.getElementById('deleteProjectBtn');
  var coverPreview = document.getElementById('coverPreview');
  var uploadProgress = document.getElementById('uploadProgress');
  var uploadProgressBar = document.getElementById('uploadProgressBar');

  function updateCoverPreview() {
    var url = document.getElementById('pf-cover').value;
    var type = document.getElementById('pf-cover-type').value;
    if (!url) {
      coverPreview.innerHTML = '<span class="cover-preview-empty">بدون کاور</span>';
      return;
    }
    coverPreview.innerHTML = type === 'video'
      ? '<video src="' + escapeHtml(url) + '" muted loop autoplay playsinline></video>'
      : '<img src="' + escapeHtml(url) + '" alt="" />';
  }

  function resetProjectForm() {
    projectForm.reset();
    document.getElementById('pf-id').value = '';
    document.getElementById('pf-slug').removeAttribute('disabled');
    document.getElementById('pf-cover').value = '';
    document.getElementById('pf-cover-type').value = 'image';
    document.getElementById('pf-accent').value = '#d9b673';
    projectFormError.textContent = '';
    updateCoverPreview();
    uploadProgress.hidden = true;
  }

  function openProjectModal(project) {
    resetProjectForm();
    if (project) {
      projectModalTitle.textContent = 'ویرایش پروژه';
      deleteProjectBtn.hidden = false;
      deleteProjectBtn.dataset.id = project.id;
      document.getElementById('pf-id').value = project.id;
      document.getElementById('pf-slug').value = project.slug;
      document.getElementById('pf-slug').setAttribute('disabled', 'true');
      document.getElementById('pf-year').value = project.year || '';
      document.getElementById('pf-order').value = project.sort_order || 0;
      document.getElementById('pf-published').value = String(!!project.is_published);
      document.getElementById('pf-accent').value = project.accent_color || '#d9b673';
      document.getElementById('pf-title-fa').value = project.title_fa || '';
      document.getElementById('pf-title-en').value = project.title_en || '';
      document.getElementById('pf-cat-fa').value = project.category_fa || '';
      document.getElementById('pf-cat-en').value = project.category_en || '';
      document.getElementById('pf-summary-fa').value = project.summary_fa || '';
      document.getElementById('pf-summary-en').value = project.summary_en || '';
      document.getElementById('pf-desc-fa').value = project.description_fa || '';
      document.getElementById('pf-desc-en').value = project.description_en || '';
      document.getElementById('pf-cover').value = project.cover_image || '';
      document.getElementById('pf-cover-type').value = project.cover_type || 'image';
      updateCoverPreview();
    } else {
      projectModalTitle.textContent = 'پروژه جدید';
      deleteProjectBtn.hidden = true;
    }
    projectModalOverlay.hidden = false;
  }

  function closeProjectModal() { projectModalOverlay.hidden = true; }

  document.getElementById('newProjectBtn').addEventListener('click', function () { openProjectModal(null); });
  document.getElementById('closeProjectModal').addEventListener('click', closeProjectModal);
  projectModalOverlay.addEventListener('click', function (e) { if (e.target === projectModalOverlay) closeProjectModal(); });

  deleteProjectBtn.addEventListener('click', function () {
    var id = deleteProjectBtn.dataset.id;
    closeProjectModal();
    deleteProject(id);
  });

  document.getElementById('clearCoverBtn').addEventListener('click', function () {
    document.getElementById('pf-cover').value = '';
    document.getElementById('pf-cover-type').value = 'image';
    updateCoverPreview();
  });

  document.getElementById('coverFileInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    uploadProgress.hidden = false;
    uploadProgressBar.style.width = '0%';
    uploadFile(file, function (pct) { uploadProgressBar.style.width = pct + '%'; })
      .then(function (media) {
        document.getElementById('pf-cover').value = media.url;
        document.getElementById('pf-cover-type').value = media.media_type || 'image';
        updateCoverPreview();
        toast('فایل آپلود شد.', 'success');
        loadMedia();
      })
      .catch(function (err) { toast(err.message, 'error'); })
      .finally(function () { uploadProgress.hidden = true; e.target.value = ''; });
  });

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
      cover_type: document.getElementById('pf-cover-type').value,
      accent_color: document.getElementById('pf-accent').value,
      sort_order: Number(document.getElementById('pf-order').value) || 0,
      is_published: document.getElementById('pf-published').value === 'true',
    };

    var submitBtn = projectForm.querySelector('button[type="submit"]');
    setBtnLoading(submitBtn, true);

    var request = id
      ? authJson('/api/projects/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : authJson('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    request
      .then(function () {
        toast(id ? 'پروژه به‌روزرسانی شد.' : 'پروژه ساخته شد.', 'success');
        closeProjectModal();
        loadProjects();
      })
      .catch(function (err) { projectFormError.textContent = err.message; })
      .finally(function () { setBtnLoading(submitBtn, false); });
  });

  /* ==================== انتخاب از کتابخانه رسانه (برای کاور) ==================== */
  var libraryModalOverlay = document.getElementById('libraryModalOverlay');
  var libraryGrid = document.getElementById('libraryGrid');
  var libraryEmpty = document.getElementById('libraryEmpty');

  document.getElementById('pickFromLibraryBtn').addEventListener('click', function () {
    libraryModalOverlay.hidden = false;
    libraryGrid.innerHTML = '';
    libraryEmpty.hidden = true;
    libraryGrid.innerHTML = '<p class="modal-loading">در حال بارگذاری…</p>';

    authJson('/api/uploads')
      .then(function (list) {
        state.media = list || [];
        libraryGrid.innerHTML = '';
        if (!state.media.length) {
          libraryEmpty.hidden = false;
          return;
        }
        try {
          renderMediaGrid(libraryGrid, state.media, {
            selectable: true,
            onSelect: function (item) {
              document.getElementById('pf-cover').value = item.url;
              document.getElementById('pf-cover-type').value = item.media_type;
              updateCoverPreview();
              libraryModalOverlay.hidden = true;
            },
          });
        } catch (renderErr) {
          console.error('خطا در نمایش کتابخانه رسانه:', renderErr);
          libraryGrid.innerHTML = '';
          libraryEmpty.hidden = false;
        }
      })
      .catch(function (err) {
        libraryGrid.innerHTML = '';
        libraryEmpty.hidden = false;
        toast(err.message || 'خطا در بارگذاری کتابخانه رسانه.', 'error');
      });
  });
  document.getElementById('closeLibraryModal').addEventListener('click', function () { libraryModalOverlay.hidden = true; });
  libraryModalOverlay.addEventListener('click', function (e) { if (e.target === libraryModalOverlay) libraryModalOverlay.hidden = true; });

  /* ==================== تب رسانه‌ها ==================== */
  var mediaGrid = document.getElementById('mediaGrid');
  var mediaEmpty = document.getElementById('mediaEmpty');
  var mediaUploadInput = document.getElementById('mediaUploadInput');

  function loadMedia() {
    authJson('/api/uploads')
      .then(function (list) {
        state.media = list || [];
        mediaEmpty.hidden = state.media.length > 0;
        renderMediaGrid(mediaGrid, state.media, { selectable: false, deletable: true });
      })
      .catch(function (err) { toast(err.message, 'error'); });
  }

  function renderMediaGrid(container, list, opts) {
    opts = opts || {};
    if (!list.length) { container.innerHTML = ''; return; }
    container.innerHTML = list.map(function (m) {
      var thumb = m.media_type === 'video'
        ? '<video src="' + escapeHtml(m.url) + '" muted preload="metadata"></video><span class="media-item-play">▶</span>'
        : '<img src="' + escapeHtml(m.url) + '" alt="" loading="lazy" />';
      return (
        '<div class="media-item" data-id="' + m.id + '" data-url="' + escapeHtml(m.url) + '" data-type="' + m.media_type + '">' +
          '<div class="media-item-thumb">' + thumb + '</div>' +
          '<div class="media-item-foot">' +
            '<span class="media-item-name">' + fmtSize(m.size_bytes) + '</span>' +
            (opts.deletable ? '<button class="media-item-del" data-action="del" title="حذف">✕</button>' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');

    container.querySelectorAll('.media-item').forEach(function (el) {
      if (opts.selectable) {
        el.addEventListener('click', function (e) {
          if (e.target.dataset.action === 'del') return;
          var item = list.find(function (m) { return String(m.id) === el.dataset.id; });
          if (item && opts.onSelect) opts.onSelect(item);
        });
      }
      var delBtn = el.querySelector('[data-action="del"]');
      if (delBtn) {
        delBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!confirm('این فایل حذف شود؟')) return;
          authJson('/api/uploads/' + el.dataset.id, { method: 'DELETE' })
            .then(function () { toast('فایل حذف شد.', 'success'); loadMedia(); })
            .catch(function (err) { toast(err.message, 'error'); });
        });
      }
    });
  }

  document.getElementById('mediaUploadBtn').addEventListener('click', function () { mediaUploadInput.click(); });
  mediaUploadInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    toast('در حال آپلود…');
    uploadFile(file)
      .then(function () { toast('فایل آپلود شد.', 'success'); loadMedia(); })
      .catch(function (err) { toast(err.message, 'error'); })
      .finally(function () { e.target.value = ''; });
  });

  /* ==================== پیام‌ها ==================== */
  var messagesList = document.getElementById('messagesList');
  var messagesEmpty = document.getElementById('messagesEmpty');
  var messagesSummary = document.getElementById('messagesSummary');
  var navUnreadBadge = document.getElementById('navUnreadBadge');

  function loadMessages() {
    authJson('/api/contact')
      .then(function (list) {
        state.messages = list || [];
        renderMessages();
      })
      .catch(function (err) { toast(err.message, 'error'); });
  }

  function renderMessages() {
    var list = state.messages;
    var unread = list.filter(function (m) { return !m.is_read; }).length;

    messagesSummary.textContent = list.length + ' پیام' + (unread ? ' · ' + unread + ' خوانده‌نشده' : '');
    messagesEmpty.hidden = list.length > 0;
    navUnreadBadge.hidden = unread === 0;
    navUnreadBadge.textContent = unread;

    messagesList.innerHTML = list.map(function (m) {
      return (
        '<article class="msg-card ' + (m.is_read ? '' : 'is-unread') + '" data-id="' + m.id + '">' +
          '<div class="msg-card-top">' +
            '<span class="msg-who">' + (!m.is_read ? '<span class="unread-dot"></span>' : '') + escapeHtml(m.name) + '<span class="msg-email">— ' + escapeHtml(m.email) + '</span></span>' +
            '<span class="msg-date">' + fmtDate(m.created_at) + '</span>' +
          '</div>' +
          (m.budget ? '<div class="msg-budget">💰 بودجه: ' + escapeHtml(m.budget) + '</div>' : '') +
          '<div class="msg-body">' + escapeHtml(m.message) + '</div>' +
          '<div class="msg-actions">' +
            '<a class="btn btn-secondary btn-sm" href="mailto:' + escapeHtml(m.email) + '">پاسخ با ایمیل</a>' +
            (!m.is_read ? '<button class="btn btn-ghost btn-sm" data-action="read">علامت به‌عنوان خوانده‌شده</button>' : '') +
          '</div>' +
        '</article>'
      );
    }).join('');

    messagesList.querySelectorAll('[data-action="read"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.closest('.msg-card').dataset.id;
        authJson('/api/contact/' + id + '/read', { method: 'PUT' })
          .then(loadMessages)
          .catch(function (err) { toast(err.message, 'error'); });
      });
    });
  }

  /* ==================== وضعیت تلگرام ==================== */
  var telegramBanner = document.getElementById('telegramBanner');
  function loadTelegramStatus() {
    authJson('/api/admin/status')
      .then(function (s) {
        telegramBanner.hidden = false;
        if (s.telegramConfigured) {
          telegramBanner.className = 'telegram-banner on';
          telegramBanner.textContent = '✅ ارسال پیام‌های جدید به تلگرام فعال است.';
        } else {
          telegramBanner.className = 'telegram-banner off';
          telegramBanner.textContent = 'ارسال به تلگرام غیرفعال است — برای فعال‌سازی، TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID را در تنظیمات سرور اضافه کنید.';
        }
      })
      .catch(function () { telegramBanner.hidden = true; });
  }

  /* ==================== شروع ==================== */
  if (token) { showAdmin(); } else { showLogin(); }
})();
