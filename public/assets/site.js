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
  /* ---------------- نوار پیشرفت اسکرول ---------------- */
  var progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------------- بازگشت به بالا ---------------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() {
      backToTop.classList.toggle('is-visible', window.scrollY > 480);
    }
    document.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- شمارنده‌های آماری ---------------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    if (prefersReducedMotion) { el.textContent = target; return; }
    var start = null;
    var duration = 1300;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && statNumbers.length) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(function (el) { statIo.observe(el); });
  } else {
    statNumbers.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
  }

  /* ---------------- افکت کج‌شدگی سه‌بعدی روی کارت پروژه‌ها ---------------- */
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !prefersReducedMotion) {
    document.addEventListener('mousemove', function (e) {
      var card = e.target.closest ? e.target.closest('.work-item') : null;
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        'translateY(-6px) rotateX(' + (relY * -8) + 'deg) rotateY(' + (relX * 10) + 'deg)';
    }, { passive: true });
    document.addEventListener('mouseleave', function (e) {
      var card = e.target.closest ? e.target.closest('.work-item') : null;
      if (card) card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    }, true);
  }

  /* ---------------- هاله‌ی نور دنبال‌کننده‌ی نشانگر ---------------- */
  var cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && canHover && !prefersReducedMotion) {
    var glowX = 0, glowY = 0, curX = 0, curY = 0, glowActive = false;
    document.addEventListener('mousemove', function (e) {
      glowX = e.clientX; glowY = e.clientY;
      if (!glowActive) { glowActive = true; cursorGlow.classList.add('is-active'); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      glowActive = false; cursorGlow.classList.remove('is-active');
    });
    (function raf() {
      curX += (glowX - curX) * 0.12;
      curY += (glowY - curY) * 0.12;
      cursorGlow.style.transform = 'translate3d(' + curX + 'px,' + curY + 'px,0)';
      requestAnimationFrame(raf);
    })();
  }

  /* ---------------- کهکشان پس‌زمینه (کانواس) ---------------- */
  var starCanvas = document.getElementById('starfield');
  if (starCanvas && starCanvas.getContext) {
    var ctx = starCanvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [];
    var shooters = [];
    var W = 0, H = 0;

    function sizeCanvas() {
      W = window.innerWidth; H = window.innerHeight;
      starCanvas.width = W * dpr;
      starCanvas.height = H * dpr;
      starCanvas.style.width = W + 'px';
      starCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeStars() {
      var count = Math.round((W * H) / 4200);
      count = Math.max(120, Math.min(count, 340));
      stars = [];
      for (var i = 0; i < count; i++) {
        var big = Math.random() < 0.12;
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: big ? (Math.random() * 1.6 + 1.4) : (Math.random() * 1.1 + 0.35),
          glow: big,
          baseAlpha: Math.random() * 0.45 + 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.22 + 0.05,
          drift: (Math.random() - 0.5) * 0.08,
        });
      }
    }

    function spawnShooter() {
      var startX = Math.random() * W * 0.7;
      var startY = Math.random() * H * 0.35;
      var angle = (Math.random() * 18 + 24) * (Math.PI / 180);
      var speed = Math.random() * 9 + 11;
      shooters.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 42 + Math.random() * 18,
      });
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = prefersReducedMotion ? s.baseAlpha : s.baseAlpha + Math.sin(t * 0.001 * s.speed + s.phase) * 0.35;
        tw = Math.max(0, Math.min(1, tw));
        if (s.glow) {
          var grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5.5);
          grd.addColorStop(0, 'rgba(217, 182, 115,' + (tw * 0.55) + ')');
          grd.addColorStop(1, 'rgba(217, 182, 115, 0)');
          ctx.beginPath();
          ctx.fillStyle = grd;
          ctx.arc(s.x, s.y, s.r * 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(247, 243, 232,' + tw + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!prefersReducedMotion) {
          s.y += s.drift;
          if (s.y < -4) s.y = H + 4;
          if (s.y > H + 4) s.y = -4;
        }
      }

      if (!prefersReducedMotion) {
        if (Math.random() < 0.012 && shooters.length < 2) spawnShooter();
        for (var j = shooters.length - 1; j >= 0; j--) {
          var sh = shooters[j];
          sh.x += sh.vx; sh.y += sh.vy; sh.life++;
          var fade = 1 - sh.life / sh.maxLife;
          if (fade <= 0) { shooters.splice(j, 1); continue; }
          var tailX = sh.x - sh.vx * 6;
          var tailY = sh.y - sh.vy * 6;
          var trail = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
          trail.addColorStop(0, 'rgba(247, 243, 232,' + fade + ')');
          trail.addColorStop(1, 'rgba(217, 182, 115, 0)');
          ctx.strokeStyle = trail;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }
      }
    }

    sizeCanvas();
    makeStars();
    drawFrame(0);

    if (!prefersReducedMotion) {
      (function loop(t) {
        drawFrame(t);
        requestAnimationFrame(loop);
      })(0);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        sizeCanvas();
        makeStars();
        drawFrame(0);
      }, 150);
    });
  }
})();
