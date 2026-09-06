(function () {
  'use strict';

  var html = document.documentElement;

  /* ---------------- خدمات فرم تماس ---------------- */
  var SERVICE_OPTIONS = [
    { value: 'branding', fa: 'برندینگ و هویت بصری' },
    { value: 'logo', fa: 'طراحی لوگو' },
    { value: 'packaging', fa: 'طراحی بسته‌بندی' },
    { value: 'motion', fa: 'موشن دیزاین' },
    { value: 'social', fa: 'طراحی شبکه‌های اجتماعی' },
    { value: 'direction', fa: 'کریتیو دایرکشن' },
    { value: 'other', fa: 'سایر' },
  ];

  function renderServiceOptions() {
    var select = document.getElementById('cf-service');
    if (!select) return;
    select.innerHTML = SERVICE_OPTIONS.map(function (opt) {
      return '<option value="' + opt.value + '">' + opt.fa + '</option>';
    }).join('');
  }

  renderServiceOptions();

  /* ---------------- هدر هنگام اسکرول ---------------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- منوی موبایل ---------------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  var navBackdrop = document.getElementById('navBackdrop');

  function openNav() {
    mainNav.classList.add('is-open');
    if (navBackdrop) navBackdrop.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeNav() {
    mainNav.classList.remove('is-open');
    if (navBackdrop) navBackdrop.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.contains('is-open');
      if (isOpen) { closeNav(); } else { openNav(); }
    });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) closeNav();
    });
    // اگر با تغییر اندازه صفحه از حالت موبایل خارج شدیم، منو را ببند
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && mainNav.classList.contains('is-open')) closeNav();
    });
  }

  /* ---------------- برجسته‌سازی لینک فعال منو هنگام اسکرول ---------------- */
  var navLinks = mainNav
    ? Array.prototype.slice.call(mainNav.querySelectorAll('a[href^="#"]:not(.main-nav-cta)'))
    : [];
  var navSections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function setActiveNavLink(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && navSections.length) {
    var navIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveNavLink(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    navSections.forEach(function (section) { navIo.observe(section); });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealTargets = document.querySelectorAll(
    '.service-item, .process-item, .about-grid, .contact-grid'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- بارگذاری پروژه‌ها از API ---------------- */
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderProjects(list) {
    var container = document.getElementById('workList');
    if (!container) return;

    if (!list || !list.length) {
      container.innerHTML = '<p class="work-empty">پروژه‌ای برای نمایش وجود ندارد.</p>';
      return;
    }

    container.innerHTML = list
      .map(function (p) {
        var catLine = escapeHtml(p.category_fa) + (p.year ? ' — ' + escapeHtml(p.year) : '');
        return (
          '<a class="work-item" href="#work" data-slug="' + escapeHtml(p.slug) + '">' +
            '<div class="work-media">' +
              '<img src="' + escapeHtml(p.cover_image) + '" alt="' + escapeHtml(p.title_fa) + '" loading="lazy" />' +
            '</div>' +
            '<div class="work-copy">' +
              '<span class="work-cat">' + catLine + '</span>' +
              '<h3 class="work-title">' + escapeHtml(p.title_fa) + '</h3>' +
              '<p class="work-summary">' + escapeHtml(p.summary_fa) + '</p>' +
              '<span class="work-link">مشاهده پروژه</span>' +
            '</div>' +
          '</a>'
        );
      })
      .join('');
  }

  // نمونه پروژه‌ها به‌عنوان جایگزین، برای زمانی که بک‌اند/دیتابیس در دسترس نیست
  var FALLBACK_PROJECTS = [
    {
      slug: 'rova',
      title_fa: 'روا — برندینگ عطر',
      category_fa: 'برندینگ / بسته‌بندی',
      year: '2024',
      summary_fa: 'هویت بصری و بسته‌بندی برای یک برند عطر مینیمال.',
      cover_image: '/assets/images/rova-cover.svg',
    },
    {
      slug: 'kova',
      title_fa: 'کووا — برندینگ مکمل ورزشی',
      category_fa: 'برندینگ / هویت بصری',
      year: '2024',
      summary_fa: 'هویت بصری پرانرژی برای برند مکمل‌های ورزشی کووا.',
      cover_image: '/assets/images/kova-cover.svg',
    },
  ];

  function loadProjects() {
    var container = document.getElementById('workList');
    fetch('/api/projects')
      .then(function (res) {
        if (!res.ok) throw new Error('bad response');
        return res.json();
      })
      .then(function (list) {
        renderProjects(list && list.length ? list : FALLBACK_PROJECTS);
      })
      .catch(function () {
        // بک‌اند در دسترس نیست؛ به‌جای خالی گذاشتن بخش کارها، نمونه‌کارها را نمایش بده
        renderProjects(FALLBACK_PROJECTS);
      });
  }

  loadProjects();

  /* ---------------- فرم تماس ---------------- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  function setStatus(state, text) {
    if (!status) return;
    status.dataset.state = state;
    status.textContent = text;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('.form-submit');
      var serviceSelect = document.getElementById('cf-service');
      var serviceLabel = serviceSelect && serviceSelect.selectedOptions.length
        ? serviceSelect.selectedOptions[0].textContent
        : '';
      var rawMessage = form.message.value.trim();
      var messageWithService = serviceLabel
        ? '[' + serviceLabel + '] ' + rawMessage
        : rawMessage;

      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        budget: form.budget.value.trim(),
        message: messageWithService,
        locale: 'fa',
      };

      if (!data.name || !data.email || !rawMessage) {
        setStatus('error', 'لطفاً همه فیلدهای الزامی را پر کنید.');
        return;
      }

      if (submitBtn) submitBtn.setAttribute('disabled', 'true');
      setStatus('pending', 'در حال ارسال…');

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().then(function (body) { return { ok: res.ok, body: body }; });
        })
        .then(function (result) {
          if (!result.ok) throw new Error((result.body && result.body.error) || 'error');
          form.reset();
          renderServiceOptions();
          setStatus('ok', 'پیام شما ارسال شد. به‌زودی پاسخ می‌دهم.');
        })
        .catch(function () {
          setStatus('error', 'ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
        })
        .finally(function () {
          if (submitBtn) submitBtn.removeAttribute('disabled');
        });
    });
  }
})();
