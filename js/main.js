/* =========================================================
   main.js – Detektei Pappenberger v2
   Nav-Scroll · Hero-Slideshow · BG-Slideshows ·
   Scroll-Reveal · Counter · Mobile-Nav · Smooth-Scroll ·
   Kontaktformular-Validierung · Dark/Light Toggle
   ========================================================= */
(function () {
  'use strict';

  /* ──────────────────────────────────────
     DARK / LIGHT MODE TOGGLE
  ────────────────────────────────────── */
  var THEME_KEY = 'dp-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function injectToggleButton() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Hell/Dunkel-Modus wechseln');
    btn.setAttribute('title', 'Hell/Dunkel-Modus wechseln');
    btn.innerHTML =
      '<svg class="icon-moon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>' +
      '</svg>' +
      '<svg class="icon-sun" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="5"/>' +
        '<path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>' +
      '</svg>';

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'light' ? 'dark' : 'light');
    });

    // Einfügen: vor dem nav-cta oder am Ende des Headers
    var navCta = header.querySelector('.nav-cta');
    if (navCta) {
      header.insertBefore(btn, navCta);
    } else {
      header.appendChild(btn);
    }
  }

  // Gespeichertes Theme laden (Standard: dark)
  var savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
  injectToggleButton();

  /* ──────────────────────────────────────
     NAV SCROLL EFFECT
  ────────────────────────────────────── */
  var header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
    // initial check
    if (window.scrollY > 60) header.classList.add('scrolled');
  }

  /* ──────────────────────────────────────
     MOBILE NAVIGATION
  ────────────────────────────────────── */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  /* ──────────────────────────────────────
     SMOOTH SCROLL
  ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────
     HERO SLIDESHOW (5 slides, progress bar)
  ────────────────────────────────────── */
  var heroSlides   = document.querySelectorAll('.hero-slide');
  var heroThumbs   = document.querySelectorAll('.hero-thumb');
  var heroFills    = document.querySelectorAll('.hero-thumb-fill');
  var heroNumEl    = document.getElementById('heroCurrentNum');
  var HERO_DUR     = 5000;
  var heroIdx      = 0;
  var heroFillIv   = null;
  var heroFillStart = null;
  var heroAutoTimer = null;

  function heroGo(next) {
    if (!heroSlides.length) return;
    heroSlides[heroIdx].classList.remove('active');
    if (heroThumbs.length) heroThumbs[heroIdx].classList.remove('active');
    if (heroFills.length) heroFills[heroIdx].style.width = '0%';
    if (heroFillIv) clearInterval(heroFillIv);

    heroIdx = (next !== undefined) ? next : (heroIdx + 1) % heroSlides.length;

    heroSlides[heroIdx].classList.add('active');
    if (heroThumbs.length) heroThumbs[heroIdx].classList.add('active');
    if (heroNumEl) heroNumEl.textContent = String(heroIdx + 1).padStart(2, '0');

    heroFillStart = Date.now();
    if (heroFills.length) {
      heroFillIv = setInterval(function () {
        var pct = Math.min(100, ((Date.now() - heroFillStart) / HERO_DUR) * 100);
        heroFills[heroIdx].style.width = pct + '%';
        if (pct >= 100) clearInterval(heroFillIv);
      }, 40);
    }
  }

  if (heroSlides.length) {
    // start fill for slide 0
    heroFillStart = Date.now();
    if (heroFills.length) {
      heroFillIv = setInterval(function () {
        var pct = Math.min(100, ((Date.now() - heroFillStart) / HERO_DUR) * 100);
        heroFills[0].style.width = pct + '%';
        if (pct >= 100) clearInterval(heroFillIv);
      }, 40);
    }
    heroAutoTimer = setInterval(heroGo, HERO_DUR);

    heroThumbs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        clearInterval(heroAutoTimer);
        heroGo(i);
        heroAutoTimer = setInterval(heroGo, HERO_DUR);
      });
    });
  }

  /* ──────────────────────────────────────
     GENERIC BG SLIDESHOW
  ────────────────────────────────────── */
  function bgSlideshow(slideSelector, dotSelector, interval) {
    var els  = document.querySelectorAll(slideSelector);
    var dots = dotSelector ? document.querySelectorAll(dotSelector) : [];
    if (!els.length) return;
    var idx = 0;
    function go(next) {
      els[idx].classList.remove('active');
      if (dots.length) dots[idx].classList.remove('active');
      idx = (next !== undefined) ? next : (idx + 1) % els.length;
      els[idx].classList.add('active');
      if (dots.length) dots[idx].classList.add('active');
    }
    setInterval(go, interval);
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { go(i); });
    });
  }

  bgSlideshow('#bgs1 .bgs-slide', '#bgs1Dots .bgs-dot', 4500);
  bgSlideshow('.trust-img-slide', null, 4000);
  bgSlideshow('.kbg', null, 5000);
  bgSlideshow('.cbg', null, 5500);

  /* ──────────────────────────────────────
     SCROLL REVEAL
  ────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    // Fallback: show immediately
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ──────────────────────────────────────
     COUNTER ANIMATION (Kriminalstatistik)
  ────────────────────────────────────── */
  function animateCounter(el, target) {
    if (!el) return;
    var start = null;
    var dur = 2200;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / dur, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var krimSection = document.querySelector('.kriminal-section');
  if (krimSection && 'IntersectionObserver' in window) {
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCounter(document.getElementById('cnt1'), 133882);
          animateCounter(document.getElementById('cnt2'),  95210);
          animateCounter(document.getElementById('cnt3'), 217654);
          animateCounter(document.getElementById('cnt4'), 156030);
          cntObs.disconnect();
        }
      });
    }, { threshold: 0.2 });
    cntObs.observe(krimSection);
  }

  /* ──────────────────────────────────────
     KONTAKTFORMULAR VALIDIERUNG
  ────────────────────────────────────── */
  var contactForm = document.querySelector('.js-contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(contactForm);
      var valid = true;

      var name    = contactForm.querySelector('[name="name"]');
      var email   = contactForm.querySelector('[name="email"]');
      var message = contactForm.querySelector('[name="message"]');
      var dsgvo   = contactForm.querySelector('[name="dsgvo"]');

      if (name && name.value.trim().length < 2) {
        showError(name, 'Bitte geben Sie Ihren Namen ein.');
        valid = false;
      }
      if (email && !isValidEmail(email.value)) {
        showError(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        valid = false;
      }
      if (message && message.value.trim().length < 10) {
        showError(message, 'Bitte beschreiben Sie Ihr Anliegen (mind. 10 Zeichen).');
        valid = false;
      }
      if (dsgvo && !dsgvo.checked) {
        showError(dsgvo, 'Bitte stimmen Sie der Datenschutzerklärung zu.');
        valid = false;
      }

      if (valid) {
        /* ⚠ Backend-Integration ausstehend */
        var msg = document.createElement('div');
        msg.style.cssText = 'padding:1rem 1.5rem;background:rgba(184,152,90,.1);border:1px solid rgba(184,152,90,.35);color:#d8d8e0;font-size:.9rem;margin-top:1rem;line-height:1.6;font-family:Barlow,sans-serif;';
        msg.textContent = 'Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen.';
        contactForm.appendChild(msg);
        contactForm.querySelector('[type="submit"]').disabled = true;
      }
    });
  }

  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function showError(field, msg) {
    var wrap = field.closest('.form-group') || field.parentElement;
    var el = wrap.querySelector('.form-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-error';
      el.style.cssText = 'font-size:.8rem;color:#e05a5a;margin-top:.35rem;font-family:Barlow,sans-serif;';
      wrap.appendChild(el);
    }
    el.textContent = msg;
    field.style.borderColor = '#e05a5a';
  }

  function clearErrors(form) {
    form.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('.form-input, .form-textarea').forEach(function (el) {
      el.style.borderColor = '';
    });
  }

})();
