/* =========================================================
   main.js – Detektei Pappenberger v3
   Theme-Toggle · Nav · Reveal (Text/Hairline) · Kontaktformular (POST /api/contact)
   Jedes Modul läuft isoliert (try/catch): ein Fehler legt
   weder Navigation noch Inhalte lahm.
   ========================================================= */
(function () {
  'use strict';

  /* ── Sicherer Storage-Zugriff (Safari Private, "alle Cookies blockieren") ── */
  var memoryStore = {};
  var storage = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return memoryStore[k] || null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { memoryStore[k] = v; } }
  };

  function mediaMatches(q) {
    try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (e) { return false; }
  }
  var prefersReducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');

  /* Modul-Runner: isoliert Fehler pro Modul */
  function run(name, fn) {
    try { fn(); } catch (err) {
      if (window.console && console.error) console.error('[main.js] Modul "' + name + '" fehlgeschlagen:', err);
    }
  }

  /* ──────────────────────────────────────
     DARK / LIGHT MODE
  ────────────────────────────────────── */
  run('theme', function () {
    var THEME_KEY = 'dp-theme';
    var root = document.documentElement;

    function systemTheme() { return mediaMatches('(prefers-color-scheme: light)') ? 'light' : 'dark'; }
    function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
    function labelFor(theme) { return theme === 'light' ? 'Dunkles Design aktivieren' : 'Helles Design aktivieren'; }

    var btn = null;
    function applyTheme(theme, persist) {
      root.setAttribute('data-theme', theme);
      if (persist) storage.set(THEME_KEY, theme);
      if (btn) { btn.setAttribute('aria-label', labelFor(theme)); btn.setAttribute('title', labelFor(theme)); }
    }

    var stored = storage.get(THEME_KEY);
    applyTheme(stored === 'light' || stored === 'dark' ? stored : systemTheme(), false);

    var header = document.getElementById('site-header');
    if (header) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle';
      btn.innerHTML =
        '<svg class="icon-moon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>' +
        '<svg class="icon-sun" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="5"/>' +
          '<path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      btn.setAttribute('aria-label', labelFor(current()));
      btn.setAttribute('title', labelFor(current()));
      btn.addEventListener('click', function () { applyTheme(current() === 'light' ? 'dark' : 'light', true); });
      var navCta = header.querySelector('.nav-cta');
      if (navCta) header.insertBefore(btn, navCta); else header.appendChild(btn);
    }

    // Ohne bewusste Wahl: OS-Wechsel live übernehmen
    try {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var onChange = function (e) { if (!storage.get(THEME_KEY)) applyTheme(e.matches ? 'light' : 'dark', false); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    } catch (e) { /* matchMedia nicht verfügbar */ }
  });

  /* ──────────────────────────────────────
     NAV SCROLL EFFECT
  ────────────────────────────────────── */
  run('nav-scroll', function () {
    var header = document.getElementById('site-header');
    if (!header) return;
    var update = function () { header.classList.toggle('scrolled', window.scrollY > 60); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  });

  /* ──────────────────────────────────────
     MOBILE NAVIGATION
  ────────────────────────────────────── */
  run('mobile-nav', function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Navigation schließen' : 'Navigation öffnen');
      document.body.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  });

  /* ──────────────────────────────────────
     MOTION – wenige begründete Prinzipien
     a) .reveal: Textblöcke erscheinen dezent nach ihrem Kontextlabel
     b) .reveal-rule: Hairlines zeichnen sich beim Eintritt in die Sektion
     Inhalte sind ohne JS vollständig sichtbar (Regeln greifen nur unter html.js).
  ────────────────────────────────────── */
  run('reveal', function () {
    var els = document.querySelectorAll('.reveal, .reveal-rule, .reveal-img');
    if (!els.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { obs.observe(el); });
  });

  /* ──────────────────────────────────────
     KONTAKT-/BEWERBUNGSFORMULAR
  ────────────────────────────────────── */
  run('contact-form', function () {
    var form = document.querySelector('.js-contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';
    var tsField = form.querySelector('[name="ts"]');
    if (tsField) tsField.value = String(Date.now());
    var isSubmitting = false;

    /* Bewerbungs-Kontext: kontakt.html?bewerbung=<Position> */
    var bewerbung = '';
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.has('bewerbung')) {
        var pos = (params.get('bewerbung') || '').trim();
        var isInitiativ = !pos || pos === '1' || /initiativ/i.test(pos);
        bewerbung = isInitiativ ? 'Initiativbewerbung' : pos;
        var heroH1 = document.querySelector('.page-hero h1');
        var heroLead = document.querySelector('.page-hero p');
        var heading = document.getElementById('kontakt-heading');
        var betreff = document.getElementById('betreff');
        var msg = document.getElementById('nachricht');
        var note = document.querySelector('.form-note');
        var hidden = form.querySelector('[name="bewerbung"]');
        if (heroH1) heroH1.textContent = 'Bewerbung';
        if (heroLead) heroLead.textContent = 'Senden Sie uns Ihre Bewerbung – alle Angaben werden streng vertraulich behandelt. Wir melden uns zeitnah bei Ihnen.';
        if (heading) heading.textContent = 'Ihre Bewerbung';
        if (betreff) betreff.value = isInitiativ ? 'Initiativbewerbung' : ('Bewerbung: ' + pos);
        if (hidden) hidden.value = bewerbung;
        if (msg && !msg.value) {
          msg.value = (isInitiativ ? 'Initiativbewerbung\n\n' : ('Bewerbung als ' + pos + '\n\n')) +
            'Kurz zu mir:\n• Verfügbar ab: \n• §34a-Sachkunde vorhanden: ja / nein\n• Führerschein Klasse B: ja / nein\n\nÜber mich:\n';
        }
        if (note) note.textContent = 'Lebenslauf und Zeugnisse können Sie nach erster Rückmeldung per E-Mail nachreichen. Mit * gekennzeichnete Felder sind Pflichtfelder.';
        try { document.title = 'Bewerbung | Detektei Pappenberger'; } catch (e) {}
      }
    } catch (e) { /* URLSearchParams nicht verfügbar – Formular bleibt Kontaktformular */ }

    function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 200; }

    function fieldWrap(field) { return field.closest('.form-group') || field.parentElement; }
    function showError(field, msg) {
      var wrap = fieldWrap(field);
      var id = 'err-' + (field.id || field.name);
      var el = wrap.querySelector('.form-error');
      if (!el) { el = document.createElement('p'); el.className = 'form-error'; el.id = id; wrap.appendChild(el); }
      el.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
      var desc = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (desc.indexOf(id) === -1) desc.push(id);
      field.setAttribute('aria-describedby', desc.join(' '));
    }
    function clearErrors() {
      form.querySelectorAll('.form-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('[aria-invalid="true"]').forEach(function (f) {
        f.removeAttribute('aria-invalid');
        var desc = (f.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (d) { return d.indexOf('err-') !== 0; });
        if (desc.length) f.setAttribute('aria-describedby', desc.join(' ')); else f.removeAttribute('aria-describedby');
      });
      setStatus('', '');
    }
    function setStatus(kind, html) {
      if (!status) return;
      status.className = 'form-status' + (kind ? ' form-status--' + kind : '');
      status.innerHTML = html;
    }
    function setLoading(loading) {
      isSubmitting = loading;
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
      submitBtn.textContent = loading ? 'Wird gesendet …' : submitLabel;
    }

    var ERROR_FALLBACK = 'Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an: ' +
      '<a href="tel:+498974127886">+49&nbsp;(0)&nbsp;89&nbsp;741&nbsp;27&nbsp;886</a> (24h).';

    function validate() {
      var first = null, ok = true;
      function fail(field, msg) { showError(field, msg); if (!first) first = field; ok = false; }
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var telefon = form.querySelector('[name="telefon"]');
      var message = form.querySelector('[name="message"]');
      var dsgvo = form.querySelector('[name="dsgvo"]');
      if (name && (name.value.trim().length < 2 || name.value.length > 100)) fail(name, 'Bitte geben Sie Ihren Namen ein (2–100 Zeichen).');
      if (email && !isValidEmail(email.value.trim())) fail(email, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      if (telefon && telefon.value.length > 40) fail(telefon, 'Die Telefonnummer ist zu lang.');
      if (message && (message.value.trim().length < 10 || message.value.length > 5000)) fail(message, 'Bitte beschreiben Sie Ihr Anliegen (10–5000 Zeichen).');
      if (dsgvo && !dsgvo.checked) fail(dsgvo, 'Bitte stimmen Sie der Datenschutzerklärung zu.');
      if (first) first.focus();
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isSubmitting) return;
      clearErrors();
      if (!validate()) { setStatus('error', 'Bitte korrigieren Sie die markierten Felder.'); return; }

      var payload = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit') return;
        payload[el.name] = el.type === 'checkbox' ? el.checked : el.value;
      });
      payload.bewerbung = bewerbung;
      payload.page = window.location.pathname;

      if (!window.fetch) { form.removeEventListener('submit', arguments.callee); form.submit(); return; }

      setLoading(true);
      setStatus('info', 'Ihre Nachricht wird gesendet …');
      var controller = ('AbortController' in window) ? new AbortController() : null;
      var timeout = setTimeout(function () { if (controller) controller.abort(); }, 20000);

      fetch(form.getAttribute('action') || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        return res.json().catch(function () { return { ok: false, code: 'BAD_RESPONSE' }; }).then(function (data) { return { status: res.status, data: data }; });
      }).then(function (r) {
        clearTimeout(timeout);
        if (r.status === 200 && r.data && r.data.ok === true) {
          form.querySelectorAll('.form-group, .form-note, [type="submit"]').forEach(function (el) { el.hidden = true; });
          setStatus('success', '<strong>Vielen Dank – Ihre ' + (bewerbung ? 'Bewerbung' : 'Anfrage') + ' ist bei uns eingegangen.</strong><br>' +
            'Wir melden uns zeitnah bei Ihnen. In dringenden Fällen erreichen Sie uns rund um die Uhr unter ' +
            '<a href="tel:+498974127886">+49&nbsp;(0)&nbsp;89&nbsp;741&nbsp;27&nbsp;886</a>.');
          status.focus();
          isSubmitting = true; // Formular bleibt nach Erfolg gesperrt (Doppelversand)
          return;
        }
        setLoading(false);
        var d = r.data || {};
        if (r.status === 400 && d.fields) {
          Object.keys(d.fields).forEach(function (k) { var f = form.querySelector('[name="' + k + '"]'); if (f) showError(f, d.fields[k]); });
          var firstInvalid = form.querySelector('[aria-invalid="true"]'); if (firstInvalid) firstInvalid.focus();
          setStatus('error', 'Bitte korrigieren Sie die markierten Felder.');
        } else if (r.status === 429) {
          setStatus('error', 'Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in einigen Minuten erneut oder rufen Sie uns an: <a href="tel:+498974127886">+49&nbsp;(0)&nbsp;89&nbsp;741&nbsp;27&nbsp;886</a>.');
        } else {
          setStatus('error', ERROR_FALLBACK);
        }
        if (status) status.focus();
      }).catch(function () {
        clearTimeout(timeout);
        setLoading(false);
        setStatus('error', ERROR_FALLBACK);
        if (status) status.focus();
      });
    });
  });

})();
