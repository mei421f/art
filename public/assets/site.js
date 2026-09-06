(function () {
  'use strict';

  var LOCALE_KEY = 'artosphere-locale';
  var html = document.documentElement;

  /* ---------------- زبان / جهت ---------------- */
  var SERVICE_OPTIONS = [
    { value: 'branding', fa: 'برندینگ و هویت بصری', en: 'Branding & Brand Identity' },
    { value: 'logo', fa: 'طراحی لوگو', en: 'Logo Design' },
    { value: 'packaging', fa: 'طراحی بسته‌بندی', en: 'Packaging Design' },
    { value: 'motion', fa: 'موشن دیزاین', en: 'Motion Design' },
    { value: 'social', fa: 'طراحی شبکه‌های اجتماعی', en: 'Social Media Design' },
    { value: 'direction', fa: 'کریتیو دایرکشن', en: 'Creative Direction' },
    { value: 'other', fa: 'سایر', en: 'Other' },
  ];

  function renderServiceOptions(locale) {
    var select = document.getElementById('cf-service');
    if (!select) return;
    var prevValue = select.value;
    select.innerHTML = SERVICE_OPTIONS.map(function (opt) {
      var label = locale === 'en' ? opt.en : opt.fa;
      return '<option value="' + opt.value + '">' + label + '</option>';
    }).join('');
    if (prevValue) select.value = prevValue;
  }

  function applyLocale(locale) {
    var dir = locale === 'en' ? 'ltr' : 'rtl';
    html.setAttribute('data-locale', locale);
    html.setAttribute('lang', locale);
    html.setAttribute('dir', dir);
    try { localStorage.setItem(LOCALE_KEY, locale); } catch (e) {}
    document.title =
      locale === 'en'
        ? 'Artosphere Branding — Kourosh Arezoumand'
        : 'Artosphere Branding — کوروش آرزومند';
    renderServiceOptions(locale);
  }

  function initLocale() {
    var saved = null;
    try { saved = localStorage.getItem(LOCALE_KEY); } catch (e) {}
    var preferred = saved || (navigator.language && navigator.language.startsWith('fa') ? 'fa' : 'fa');
    applyLocale(preferred);
  }

  var langSwitch = document.getElementById('langSwitch');
  if (langSwitch) {
    langSwitch.addEventListener('click', function () {
      var current = html.getAttribute('data-locale');
      applyLocale(current === 'fa' ? 'en' : 'fa');
    });
  }

  initLocale();

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
      if (window.innerWidth > 780 && mainNav.classList.contains('is-open')) closeNav();
    });
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
      container.innerHTML =
        '<p class="work-empty" data-fa="پروژه‌ای برای نمایش وجود ندارد." data-en="No projects to show yet.">پروژه‌ای برای نمایش وجود ندارد.</p>';
      return;
    }

    container.innerHTML = list
      .map(function (p) {
        return (
          '<a class="work-item" href="#work" data-slug="' + escapeHtml(p.slug) + '">' +
            '<div class="work-media">' +
              '<img src="' + escapeHtml(p.cover_image) + '" alt="' + escapeHtml(p.title_en) + '" loading="lazy" />' +
            '</div>' +
            '<div class="work-copy">' +
              '<span class="work-cat">' +
                '<span data-fa="' + escapeHtml(p.category_fa) + (p.year ? ' — ' + escapeHtml(p.year) : '') + '">' + escapeHtml(p.category_fa) + (p.year ? ' — ' + escapeHtml(p.year) : '') + '</span>' +
                '<span data-en="' + escapeHtml(p.category_en) + (p.year ? ' — ' + escapeHtml(p.year) : '') + '">' + escapeHtml(p.category_en) + (p.year ? ' — ' + escapeHtml(p.year) : '') + '</span>' +
              '</span>' +
              '<h3 class="work-title">' +
                '<span data-fa="' + escapeHtml(p.title_fa) + '">' + escapeHtml(p.title_fa) + '</span>' +
                '<span data-en="' + escapeHtml(p.title_en) + '">' + escapeHtml(p.title_en) + '</span>' +
              '</h3>' +
              '<p class="work-summary">' +
                '<span data-fa="' + escapeHtml(p.summary_fa) + '">' + escapeHtml(p.summary_fa) + '</span>' +
                '<span data-en="' + escapeHtml(p.summary_en) + '">' + escapeHtml(p.summary_en) + '</span>' +
              '</p>' +
              '<span class="work-link">' +
                '<span data-fa="مشاهده پروژه" data-en="View project">مشاهده پروژه</span>' +
              '</span>' +
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
      title_fa: 'روا — برندینگ عطر', title_en: 'ROVA — Perfume Branding',
      category_fa: 'برندینگ / بسته‌بندی', category_en: 'Branding / Packaging',
      year: '2024',
      summary_fa: 'هویت بصری و بسته‌بندی برای یک برند عطر مینیمال.',
      summary_en: 'Visual identity and packaging for a minimal perfume brand.',
      cover_image: '/assets/images/rova-cover.svg',
    },
    {
      slug: 'kova',
      title_fa: 'کووا — برندینگ مکمل ورزشی', title_en: 'KOVA — Sports Nutrition Branding',
      category_fa: 'برندینگ / هویت بصری', category_en: 'Branding / Identity',
      year: '2024',
      summary_fa: 'هویت بصری پرانرژی برای برند مکمل‌های ورزشی کووا.',
      summary_en: 'A high-energy visual identity for the KOVA sports nutrition brand.',
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

  function setStatus(state, faText, enText) {
    if (!status) return;
    status.dataset.state = state;
    status.setAttribute('data-fa', faText);
    status.setAttribute('data-en', enText);
    status.textContent = html.getAttribute('data-locale') === 'en' ? enText : faText;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('.form-submit');
      var locale = html.getAttribute('data-locale');
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
        locale: locale,
      };

      if (!data.name || !data.email || !rawMessage) {
        setStatus('error', 'لطفاً همه فیلدهای الزامی را پر کنید.', 'Please fill in all required fields.');
        return;
      }

      if (submitBtn) submitBtn.setAttribute('disabled', 'true');
      setStatus('pending', 'در حال ارسال…', 'Sending…');

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
          setStatus('ok', 'پیام شما ارسال شد. به‌زودی پاسخ می‌دهم.', 'Your message was sent. I\'ll get back to you soon.');
        })
        .catch(function () {
          setStatus('error', 'ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.', 'Something went wrong. Please try again.');
        })
        .finally(function () {
          if (submitBtn) submitBtn.removeAttribute('disabled');
        });
    });
  }
})();
