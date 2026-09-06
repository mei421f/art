(function () {
  'use strict';

  var LOCALE_KEY = 'artosphere-locale';
  var html = document.documentElement;

  /* ---------------- زبان / جهت ---------------- */
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
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
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

  function loadProjects() {
    var container = document.getElementById('workList');
    fetch('/api/projects')
      .then(function (res) {
        if (!res.ok) throw new Error('bad response');
        return res.json();
      })
      .then(renderProjects)
      .catch(function () {
        if (container) {
          container.innerHTML =
            '<p class="work-empty" data-fa="در حال حاضر امکان بارگذاری پروژه‌ها نیست." data-en="Projects can\'t be loaded right now.">در حال حاضر امکان بارگذاری پروژه‌ها نیست.</p>';
        }
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
      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        budget: form.budget.value.trim(),
        message: form.message.value.trim(),
        locale: html.getAttribute('data-locale'),
      };

      if (!data.name || !data.email || !data.message) {
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
