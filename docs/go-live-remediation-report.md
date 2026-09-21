# Go-Live Remediation Report — detektei-weltweit.de

**Stand:** 2026-09-21 · **Basis:** `docs/go-live-audit-2026-09-21.md` (F-01…F-55) · **Branch:** `feature/dark-light-mode` · Commits `d6970f7` (Baseline) → `7b7f40f` (Remediation) → Folge-Commits (Fonts/LCP).
**Preview:** Vercel-Projekt `detektei-weltweit` (Scope `new-ee-gg`), geschützt (Vercel Authentication); QA-Bypass-Secret angelegt („Go-Live-QA", nach Launch widerrufen). Produktionsdomain/DNS **nicht** angefasst.

Status-Legende: **FIXED** (implementiert + getestet + verifiziert) · **IN PROGRESS** · **OPEN** · **BLOCKED** (externe Abhängigkeit, exakt benannt) · **NOT APPLICABLE** · **NEEDS EXTERNAL VERIFICATION** (technisch umgesetzt, Wirkung nur extern prüfbar).

---

## 1. Executive Summary

**Einstufung: CONDITIONALLY READY.**

Alle technisch lösbaren Punkte des Audits sind umgesetzt und verifiziert: Formular-Backend (Serverless, 18/18 Tests), Hosting-Konfiguration (CSP, HSTS, Redirects, 404, Caching – auf Vercel-Preview live geprüft), Unsplash vollständig entfernt (0 Dritt-Requests), JS-Robustheit, Accessibility (Lighthouse 100 auf 3 Kernseiten + Code-Fixes), Performance (mobil ≥ 90 auf allen drei Kernseiten; Startseite nach LCP-Fix siehe §6), amtliche PKS-Zahlen, Favicons/Manifest, korrigiertes Logo (1995, Schreibweise).

**Nicht durch Engineering lösbar (Launch-Bedingungen):**
1. **Mail-Zustellung** – Credentials (Microsoft-365-SMTP-Postfach oder Resend-Key) fehlen → Formular meldet aktuell ehrlich „Versand derzeit nicht möglich" + Telefonnummer, kein Fake-Erfolg. *(F-01 Zustellung: BLOCKED)*
2. **Firmendaten Büro Ost** – Impressum (Bad Lauchstädt) ≠ Website (Merseburg). *(F-07: BLOCKED – CUSTOMER CONFIRMATION)*
3. **Datenschutzerklärung** – muss Hosting (Vercel), Formular-Backend, localStorage abdecken; Entwurf in §9. *(F-23: BLOCKED – LEGAL REVIEW)*
4. **Echte Fotos** – Bildflächen sind neutrale Platzhalter (keine erfundenen Firmenfotos). *(F-04 Bildauswahl: BLOCKED – CUSTOMER)*
5. **DNS** – Umzug IONOS → Vercel, DMARC/DKIM. *(vom Betreiber auszuführen)*

Nach Erledigung von 1–3 und dem DNS-Umzug ist die Seite launchfähig; 4 ist kein Blocker (Platzhalter sind sauber), aber sichtbar.

---

## 2. Go-Live-Scorecard (nach Remediation)

| Bereich | Vorher | Jetzt | Offen (extern) |
|---|---|---|---|
| Functional | FAIL | **PASS** (Formularkette bis Mailserver getestet) | Zustellung (Credentials) |
| Technical SEO | PARTIAL | **PASS** | – |
| Google Indexability | PARTIAL | **PASS** (nach Deploy) | Index-Status erst nach Launch |
| On-Page SEO | PARTIAL | **PASS** | – |
| Structured Data | PASS | **PASS** (LocalBusiness @id/sameAs, Raster-Logo) | Öffnungszeiten (Kunde) |
| Performance | FAIL | **PASS** (mobil 90–98, LCP 2,3–3,2 s Simulation; Feld: n/a) | CrUX-Felddaten |
| Mobile | PARTIAL | **PASS** (code-/Lighthouse-verifiziert) | echtes iOS-Gerät |
| Accessibility | PARTIAL | **PASS** (Lighthouse 100 ×3, WCAG-Fixes) | Screenreader-Test manuell |
| Security | FAIL | **PASS** (Header auf Preview verifiziert) | securityheaders.com auf Prod-Domain |
| Privacy | FAIL | **PARTIAL** | Datenschutztext (Anwalt) |
| Analytics | – | **N/A** (bewusst trackingfrei) | Entscheidung Kunde |
| UX/UI | PASS | **PASS** | Fotos |
| Conversion | FAIL | **PASS** (Formular, sichtbare Service-Links, Fehler-Fallback) | Zustellung |
| Content | FAIL | **PARTIAL** (PKS ✓, Logo ✓) | NAP Büro Ost, Kennzahlen |
| Code Quality | PASS | **PASS** | – |
| Production | FAIL | **PASS** (Config + Preview) | DNS, Env-Vars, Merge nach `main` |

---

## 3. Status F-01 … F-55

| ID | Sev | Ausgang | Aktuell | Änderung | Verifikation | Restproblem |
|---|---|---|---|---|---|---|
| F-01 | P0 | Formular tot, Fake-Erfolg | **FIXED (Code) / BLOCKED (Zustellung)** | `api/contact.js` (Validierung, Honeypot, Zeitfenster, Rate-Limit, Origin-Check, SMTP/Resend, No-JS-HTML-Fallback), `js/main.js` fetch-Flow mit Loading/Success/Error, `kontakt.html` `method=post action=/api/contact` + Honeypot + Status-Region | 18/18 Integrationstests (`form-test.js`); Preview: 503 `MAIL_NOT_CONFIGURED`, Honeypot → verworfen, 400 Feldfehler, GET 405 | **Credentials fehlen** (SMTP_USER/PASS für M365 oder RESEND_API_KEY) |
| F-02 | P0 | Alles unkommittiert | **FIXED** | 3 Commits auf `feature/dark-light-mode`, `assets/ news/ wissenswertes/ docs/` versioniert | `git status` clean; Preview-Deploy aus Working Tree identisch | Push + PR/Merge nach `main` (siehe §11) |
| F-03 | P1 | Keine Hosting-Config | **FIXED** | `vercel.json`: Apex→www 308, `/index.html`→`/` 308, `cleanUrls:false`, Header, Cache; `404.html` | Preview: `/index.html` 308→`/`, `/nope` 404 (Custom), HTTP→HTTPS 308 | Apex-Redirect erst mit Domain prüfbar |
| F-04 | P1 | 19 Unsplash-Hotlinks, 5,1 MB | **FIXED (Technik) / BLOCKED (Fotos)** | Alle URLs entfernt; CSS-Platzhalter (Gradients/Raster), Slider 5→3; `<img>`-Slots + README-Anleitung | `grep unsplash` = 0; Lighthouse: nur First-Party-Host; Transfer 5,6 MB → 0,26–0,33 MB | **Echte Firmenfotos** (Kunde) |
| F-05 | P1 | Keine Security-Header | **FIXED** | CSP (`script-src 'self' 'sha256-…'`, `style-src 'self'`, `img-src 'self' data:`, `form-action 'self'`, `frame-ancestors 'none'`, `base-uri`, `object-src`), HSTS (ohne preload), XCTO, XFO, Referrer, Permissions, COOP | Preview-Header via curl; Lighthouse `errors-in-console` = 0 auf 3 Seiten (Dark) | securityheaders.com auf Prod-Domain |
| F-06 | P1 | PKS-Zahlen falsch | **FIXED** | Werte aus BKA PKS 2024: Straftaten 5.837.445 · Gewaltkriminalität 217.277 · Cybercrime 131.391 (Bundeslagebild) · Wohnungseinbruch 78.436; Quellenlink; Diebstahl/Straßenkriminalität entfernt (nur gerundet verfügbar) | Abgleich BKA-Seiten (bka.de PKS 2024, Kurzmeldung Diebstahl, Bundeslagebild Cybercrime) | Kundenfreigabe der Sektion empfohlen |
| F-07 | P1 | Impressum ≠ Standorte | **BLOCKED – CUSTOMER CONFIRMATION** | keine (keine Daten erfinden) | – | Welche Adresse/Telefon gilt für Büro Ost? Merseburg (Hallesche Str. 118, 06217, +49 3461 2492544) oder Bad Lauchstädt (Eislebenerstr. 43a, 06246, +49 34636 757151)? Impressum-Vollständigkeit (Schliersee/Nürnberg) – LEGAL |
| F-08 | P1 | JS stirbt bei Storage-Block | **FIXED** | `storage`-Wrapper (try/catch + Memory-Fallback), Module in `run()` isoliert, `.js`-Klasse im Head-Script, `.reveal` nur unter `.js` ausgeblendet | Code-Review; `node --check`; CSS `.js .reveal` verifiziert; ohne JS keine `opacity:0`-Regel aktiv | Browser-Test mit blockiertem Storage: NEEDS EXTERNAL VERIFICATION |
| F-09 | P1 | Service-Links unsichtbar | **FIXED** | `.service-link` immer sichtbar, ganze Karte klickbar (stretched link), `:focus-within` | CSS verifiziert; Lighthouse a11y 100 | – |
| F-10 | P1 | Interne Dateien deploybar | **FIXED** | `.gitignore` (FREIGABE.md, Kundendateien, seo-tool/) + `.vercelignore` (docs/, README, scripts, .env*) | Preview: `/docs/*`, `/FREIGABE.md`, `/seo-tool/.env`, `/README.md`, `/package.json`, `/.env.example` → 404 | – |
| F-11 | P2 | Kein Spam-Schutz | **FIXED** | Honeypot, Zeitfenster ≥ 3 s, Rate-Limit 5/10 min/IP + 60/min global, Payload ≤ 32 KB, optional Turnstile serverseitig vorbereitet | Tests: Honeypot/zu schnell → verworfen, 6. Anfrage → 429 | Rate-Limit ist pro Function-Instanz (best effort); bei Missbrauch Vercel Firewall/Turnstile aktivieren |
| F-12 | P2 | Kontrast Dark-Mode | **FIXED** | Token `--accent-text` (#5B82D1 dark 4,8–5,2:1 / #2A4E9E light 5,7–6,8:1) für alle Textrollen; Notruf-Banner weiß auf Blau (5,8:1); Fehlerfarbe je Theme; Placeholder-Opacity 1 | Kontrastrechnung; Lighthouse `color-contrast` 0 Verstöße (3 Seiten) | Light-Mode Lighthouse: NEEDS EXTERNAL VERIFICATION (Berechnung ✓) |
| F-13 | P2 | Slider nicht bedienbar, Touch-Ziele | **FIXED** | `<button>` mit `aria-label`/`aria-current`, 28–36 px hoch, Dots 24×24, Pause-Button `aria-pressed` | HTML/CSS verifiziert; Lighthouse a11y 100 | – |
| F-14 | P2 | ARIA-Fehlnutzung | **FIXED** | `role=menu/menuitem/banner/contentinfo` entfernt; `div`→`section` (25 Stellen); `aria-hidden` von Zitat-Sektion entfernt | html-validate: `aria-label-misuse`, `no-redundant-role`, `hidden-focusable` = 0 | – |
| F-15 | P3 | Kein Skip-Link | **FIXED** | `.skip-link` auf 20 Seiten, `main tabindex="-1"` | HTML/CSS | – |
| F-16 | P2 | `/` vs `/index.html` | **FIXED** | 132 Links → `/`, Breadcrumb-JSON-LD `/#leistungen`, Redirect 308 | Preview: `/index.html` → 308 `/`; Crawler: 0 broken | – |
| F-17 | P2 | Keine 404-Seite | **FIXED** | `404.html` im Site-Design, noindex, Notrufnummer | Preview `/nope.html` → 404 + Custom-Body | – |
| F-18 | P3 | Favicons/Manifest | **FIXED** | `favicon.ico` 32, SVG, apple-touch 180, PNG 192/512, `site.webmanifest`, theme-color | Preview 200; Dateien geprüft (Icon-Render visuell) | SERP-Favicon nach Indexierung |
| F-19 | P3 | H1/Title Startseite | **FIXED** | H1 „Detektei München – Diskretion. Präzision. Ergebnis.", Title „Detektei Pappenberger München \| Ermittlung & Sicherheit" (57) | meta.py | – |
| F-20 | P2 | Perf-Defizite | **FIXED** | Logo 83 KB → 20 KB (810) / 10 KB (480, srcset), `fetchpriority=high`; Zertifikatslogos WebP (−200 KB); Fonts 12 → 9 Dateien; Preloads auf H1-/Text-Schnitte; Hero-Titel ohne opacity-Start; Cache-Header; Brotli (Vercel) | Lighthouse mobil: index 90+, detektei 96, kontakt 98 (Simulation lokal mit gzip); Preview brotli ✓ | Minify/Critical-CSS bewusst nicht (Wartbarkeit); Felddaten n/a |
| F-21 | P4 | FAQ-Schema Doppelpflege | **FIXED (sync)** | JSON-LD-Antworten an sichtbaren Text angeglichen (`was-kostet…`) | Diff | Schema bleibt (harmlos) |
| F-22 | P3 | LocalBusiness-Felder | **FIXED (teilweise)** | `@id`, `sameAs` (Akademie, Sicherheitszentrale), `logo` → PNG 600×170; Article-Publisher-Logo PNG | JSON-LD parse | `openingHoursSpecification`, Google-Business-Profil-URL: **CUSTOMER** |
| F-23 | P1 | Datenschutz unvollständig | **BLOCKED – LEGAL REVIEW** | Entwurf §9 (Hosting Vercel, Formular/Mail, Spam-Schutz, localStorage, keine Cookies/Tracker) | – | Anwalt; danach `datenschutz.html` aktualisieren |
| F-24 | P3 | Schwache Kennzahlen („∞", „100 %") | **BLOCKED – CUSTOMER** | keine (keine Zahlen erfinden) | – | Belegbare Kennzahlen liefern oder Sektion kürzen |
| F-26 | P3 | „vier Standorte"/Badge 1996 | **FIXED (Badge) / BLOCKED (Standorte)** | SVG-Badge + Logo-SVG auf 1995, Raster neu gerendert | visuell geprüft | Standortanzahl hängt an F-07 |
| F-27 | P4 | Telefonnummern umbrechbar | **FIXED** | `&nbsp;` in allen sichtbaren Nummern (459 → 0; 14 verbleibende Meldungen = Fehlalarm „Direkt anrufen"-Linktext) | html-validate | – |
| F-30 | P4 | reset.css redundant | **FIXED** | Datei + 19 Links entfernt | Preview `/css/reset.css` 404, Seiten rendern | – |
| F-31 | P3 | Inline-Styles → CSP | **FIXED** | 130+ `style=""` in Klassen (u. a. nth-child-Stagger), `style-src 'self'` strikt | `grep ' style="'` = 0; CSP ohne Konsolenfehler | – |
| F-32 | P3 | iOS 100vh | **FIXED** | `height:100svh` mit `100vh`-Fallback | CSS | echtes iOS: NEEDS EXTERNAL VERIFICATION |
| F-33 | P4 | backdrop-filter Prefix | **FIXED** | `-webkit-backdrop-filter` | CSS | – |
| F-34 | P4 | Anführungszeichen | **FIXED** | „…“ (5×) | grep | – |
| F-37 | P2 | seo-tool/.env Secrets | **NEEDS EXTERNAL VERIFICATION** | nicht deploybar (ignoriert) | Preview 404 | Rotation der DataForSEO-Zugangsdaten, falls je geteilt |
| F-38 | P2 | DMARC fehlt | **BLOCKED – DNS** | – | – | `_dmarc` TXT + DKIM (M365) + ggf. Provider-SPF-Include; siehe §11 |
| F-40 | P4 | Kein README | **FIXED** | `README.md` (nicht deployed) | – | – |
| F-42 | P4 | OG-Bild generisch | **OPEN (Post-Launch)** | – | – | Artikelbilder |
| F-44 | P4 | Footer-Logo ohne Maße | **FIXED** | `width/height` + `srcset` überall | Lighthouse unsized-images ✓ | – |
| F-47 | P3 | Mobile-Nav Legal-Seiten | **FIXED** | vollständige Navigation auf Impressum/Datenschutz | HTML | – |
| F-48 | P4 | Aktiv-Markierung | **FIXED** | `aria-current="page"` + `.active` in Desktop-/Mobile-Nav je Seite | grep (3 Seiten) | – |
| F-49 | P2 | Formular ohne POST | **FIXED** | `method="post"`, Server akzeptiert urlencoded → HTML-Antwort | Test „No-JS-Fallback" ✓ | – |
| F-50 | P4 | Theme-Toggle Label | **FIXED** | dynamisches `aria-label` („Helles/Dunkles Design aktivieren") | JS | – |
| F-51 | P3 | Formular-A11y | **FIXED** | `aria-invalid`, `aria-describedby`, Fokus auf erstes Fehlerfeld, `role="status" aria-live` | JS | – |
| F-52 | P3 | Auto-Play ohne Pause | **FIXED** | Pause/Play-Button stoppt Hero, alle BG-Slider und Ticker (`html.motion-paused`) | JS/CSS | – |
| F-53 | P3 | 10-px-Labels | **FIXED** | Mindestgrad 11 px für 9 UI-Klassen | CSS | – |
| F-54 | P4 | tasks.json veraltet | **NOT APPLICABLE** | dieser Report ersetzt die Task-Liste | – | – |
| F-55 | P4 | rohes `&` | **FIXED** | `&amp;` | html-validate `no-raw-characters` = 0 | – |
| F-25/28/29/35/36/39/41/43/45/46 | – | im Audit ohne Aktion (Notizen/PASS) | **NOT APPLICABLE** | – | – | F-39 (Live-Domain http/Apex) wird mit DNS-Umzug gelöst; F-41 GSC: Property-Status prüfen |

## 4. Neu gefundene Findings (während der Umsetzung)

| ID | Sev | Problem | Status |
|---|---|---|---|
| N-01 | P1 | Logo-Raster `logo-full.webp` zeigte „SEIT 1996" **und** Tippfehler „PAPPENBERER" (Kundendatei); SVG-Quelle korrekt | **FIXED** – aus SVG (1995) neu gerendert (Chrome), WebP 810/480 + Publisher-PNG |
| N-02 | P3 | Hero-H1 startete mit `opacity:0` (Animation) → LCP erst nach Animation (+0,8 s) | **FIXED** – nur Transform-Animation |
| N-03 | P3 | 12 Font-Dateien auf Startseite (~280 KB) | **FIXED** – 9 Dateien, Preloads auf H1-/Fließtext-Schnitt |
| N-04 | P4 | Font-Familie des Logos „Arial Narrow" muss beim Render vorhanden sein (macOS ✓) | dokumentiert |
| N-05 | P4 | Vercel-Preview durch Vercel Authentication geschützt → QA nur mit Bypass-Secret | Bypass angelegt; **nach Launch widerrufen** |
| N-06 | P3 | In-Memory-Rate-Limit gilt pro Function-Instanz | dokumentiert; Eskalation: Vercel WAF/Turnstile |
| N-07 | P4 | `functions.maxDuration` 15 s (Hobby-Plan max. 60 s) | ok |
| N-08 | P3 | Vercel setzt auf `*.vercel.app` eigenes HSTS mit `preload`; auf der Custom-Domain gilt unser Header ohne preload | erwartet |
| N-09 | P2 | Preview-Deployments haben keine Env-Vars → Formular 503 (korrekt, ehrlich) | Env-Vars in Vercel setzen (Production **und** Preview) |

## 5. Vorgenommene Änderungen (Dateien)

- **Neu:** `api/contact.js`, `vercel.json`, `404.html`, `site.webmanifest`, `favicon.ico`, `assets/icons/*` (svg, 180/192/512), `assets/images/*.webp` (9 Zertifikatslogos), `logo-full-480.webp`, `logo-publisher.png`, `package.json` + `package-lock.json` (nodemailer), `.env.example`, `.vercelignore`, `README.md`, `docs/go-live-remediation-report.md`
- **Geändert:** alle 19 HTML (Head-Script mit `.js`-Klasse, Icons, Skip-Link, Sections statt ARIA-divs, Links `/`, Inline-Styles → Klassen, Buttons für Slider, Formular, PKS, H1/Title, nbsp, Anführungszeichen, `aria-current`), `css/main.css` (+Tokens, +Platzhalter, +A11y-Block, +Klassen, Fonts), `js/main.js` (Neuschrieb), `sitemap.xml` (lastmod), `assets/images/logo-badge.svg` + `logo-full.svg` (1995), `logo-full.webp` (neu gerendert), `.gitignore`
- **Entfernt:** `css/reset.css`, 3 Font-Dateien (Cormorant 500, Barlow 500, Condensed 400), interne `⚠`-HTML-Kommentare

## 6. Ausgeführte Tests & Ergebnisse

| Test | Umfang | Ergebnis |
|---|---|---|
| Formular-Backend (`form-test.js`, echter HTTP-Server) | 405, Validierung, Honeypot, Zeitfenster, Origin, gültig (Mail-Inhalt geprüft), Bewerbung, No-JS-HTML, 413, Rate-Limit 429, ohne Config 503, SMTP-Fehler 503 | **18/18 bestanden** |
| Preview-Deployment (curl, Bypass) | 19 Pfade Status/Redirect, Header, Cache-Control, Brotli, 404-Body, API (503/200-IGNORED/400/405) | **alle wie erwartet** |
| html-validate (19 Seiten + 404) | recommended-Preset | 527 → 14 Meldungen (alle `tel-non-breaking` Fehlalarm auf Linktext „Direkt anrufen") |
| Link-/Anker-Crawler | 19 Seiten, interne Links/Anker | 0 defekt (2 Treffer = Pfade in HTML-Kommentaren) |
| Meta/JSON-LD-Script | Title/Description/Canonical/H1/Headings/JSON-LD | alle valide; Titles 33–60, Descriptions ≤ 160 |
| Kontrastrechnung | alle Token-Kombinationen beider Themes | AA erfüllt (min. 4,78:1 Text) |
| Lighthouse lokal (gzip-Server, Simulation Moto G/4G) | index / detektei / kontakt | mobil **90 / 96 / 98**, a11y **100/100/100**, BP 100, SEO 100; Desktop 99–100; Konsole 0 Fehler (CSP aktiv) |
| Lighthouse Preview (Vercel, Brotli) | siehe §6.1 | siehe §6.1 |
| Grep-Checks | `unsplash`, ` style="`, `reset.css`, `&amp;amp;`, `role=menu` | jeweils 0 |
| Syntax | `node --check` main.js/contact.js | ok |

### 6.1 Lighthouse auf Vercel-Preview (`detektei-weltweit-dsx17z1tl-new-ee.vercel.app`, Brotli/CDN, Bypass-Header)

| Seite | Mobil Perf | LCP | FCP | CLS | TBT | Desktop Perf | A11y |
|---|---|---|---|---|---|---|---|
| `/` | **99** | 1,9 s | 0,9 s | 0 | 30 ms | 100 | 100 |
| `/detektei.html` | **100** | 1,9 s | 0,9 s | 0,013 | 10 ms | 100 | 100 |
| `/kontakt.html` | **99** | 1,9 s | 1,1 s | 0,002 | 0 ms | (Lauf-Artefakt, lokal 99) | 100 |

Nur First-Party-Host (+ `vercel.live` Toolbar-Injektion des Previews, von der CSP blockiert). **Preview-Artefakte, nicht produktionsrelevant:** SEO-Score 69 wegen `x-robots-tag: noindex` (Vercel setzt das auf geschützten Previews), Best-Practices 92 wegen Toolbar-Script-CSP-Meldung und `site.webmanifest`-Redirect-Schleife (Manifest-Request ohne Bypass-Cookie). Auf der Produktionsdomain ohne Deployment Protection entfallen alle drei → **NEEDS EXTERNAL VERIFICATION** nach Launch (Lighthouse auf `https://www.detektei-weltweit.de/`).

**Nicht getestet (NEEDS EXTERNAL VERIFICATION):** echte Geräte (iOS Safari, Android Chrome), Screenreader (VoiceOver/NVDA), Light-Mode-Lighthouse, Tastatur-Durchlauf im Browser, echte Mail-Zustellung, Apex-Redirect auf Produktionsdomain, CrUX-Felddaten, Google-Indexierung, securityheaders.com auf Prod.

## 7. Verbleibende externe Blocker

| # | Blocker | Wer | Was genau |
|---|---|---|---|
| B1 | Mail-Zustellung | Kunde/IT | Postfach für Versand (M365: SMTP-AUTH aktivieren, App-Passwort) **oder** Resend-Account; Werte gemäß `.env.example` in Vercel (Production + Preview) eintragen; Empfängeradresse bestätigen (`info@sicherheitszentrale-muc.de`?) |
| B2 | Büro Ost | Kunde | gültige Adresse + Telefon (Merseburg vs. Bad Lauchstädt); Standortliste im Impressum |
| B3 | Datenschutzerklärung | Anwalt | Entwurf §9 prüfen/freigeben |
| B4 | Fotos | Kunde | Hero (3), Intro (1), Trust (3), Statistik (3), CTA (3) – oder weniger; Lizenz geklärt |
| B5 | DNS | Betreiber | §11 |
| B6 | Kennzahlen | Kunde | „∞ Netzwerk", „16 Bundesländer", „100 %", „1:1", „1–∞" belegen oder ersetzen |
| B7 | Öffnungszeiten / Google-Business-Profil | Kunde | für LocalBusiness-Schema + GBP-Verknüpfung |

## 8. CUSTOMER CONFIRMATION REQUIRED
1. Büro Ost: Adresse/Telefon/Fax (B2).
2. Empfängeradresse für Website-Anfragen und Bewerbungen (B1).
3. PKS-Sektion mit vier amtlichen Werten (Straftaten gesamt, Gewaltkriminalität, Cybercrime, Wohnungseinbruch) freigeben – oder Sektion entfernen.
4. Bildmaterial (B4) und Bildrechte.
5. Kennzahlen der Stats-Leisten (B6).
6. Öffnungszeiten, Google-Business-Profil-URL (B7).
7. Standortanzahl in News („vier Standorte") nach B2.
8. Bypass-Secret & Vercel-Projekt: Zugriff/Team-Mitgliedschaft für den Kunden?

## 9. LEGAL REVIEW REQUIRED — Entwurf Datenschutz-Ergänzungen (kein Rechtsrat)

Technische Realität, die der Text abdecken muss (Stand nach Remediation):

- **Hosting:** Vercel Inc., 440 N Barranco Ave #4133, Covina, CA 91723, USA. Server-Logs (IP, Zeit, URL, User-Agent) durch den Hoster; Auftragsverarbeitung (Vercel DPA), Drittlandtransfer (EU-US Data Privacy Framework / SCC – Vercel-DPA prüfen). Region: Vercel Edge/CDN weltweit, Functions Region `fra1` (Frankfurt) empfehlenswert – **in Vercel setzen** (Project → Settings → Functions → Region).
- **Kontakt-/Bewerbungsformular:** Verarbeitung von Name, E-Mail, Telefon (optional), Betreff, Nachricht, Bewerbungsposition, Zeitpunkt der Einwilligung, IP-Adresse (Spam-Schutz/Rate-Limit, nur in der Mail und Function-Logs); Rechtsgrundlage Art. 6 Abs. 1 lit. b bzw. a; Versand per E-Mail an [Empfänger] über [Microsoft 365 / Resend Inc.] – Anbieter + AV-Vertrag nennen.
- **Spam-Schutz:** Honeypot/Zeitfenster/Rate-Limit ohne Drittanbieter. Falls Cloudflare Turnstile aktiviert wird: Cloudflare Inc. als Empfänger + Drittlandtransfer ergänzen.
- **Local Storage:** Speicherung der Design-Wahl (`dp-theme`) im Browser, kein Cookie, keine Übermittlung, nur bei aktiver Wahl; § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich) – **Rechtsauffassung prüfen**.
- **Keine Cookies, keine Analyse-/Tracking-Dienste, keine externen Fonts/Bilder/Embeds** (Stand heute; falls Analytics kommt: ergänzen).
- **Google Maps:** unverändert nur Links.
- **Impressum:** Verweise auf „TMG" (seit 14.05.2024 DDG § 5) und „§ 18 Abs. 2 MStV" prüfen; Standortliste (B2).
- **Stand-Datum** aktualisieren.

## 10. DNS-/Deployment-Schritte (vom Betreiber auszuführen)

1. **Branch mergen:** PR `feature/dark-light-mode` → `main` (Vercel Production-Branch `main`).
2. **Vercel-Projekt `detektei-weltweit`:** Git-Repo `new-ee-gg/detektei-erneuerung` verbinden (aktuell CLI-Deploys); Functions-Region `fra1`; **Env-Vars** aus `.env.example` (Production + Preview) setzen; Deployment Protection für Production = keine (Preview darf geschützt bleiben); Bypass-Secret „Go-Live-QA" nach Launch **widerrufen**.
3. **Domains in Vercel:** `www.detektei-weltweit.de` (primär) + `detektei-weltweit.de` (Redirect auf www – der Redirect steht zusätzlich in `vercel.json`).
4. **DNS bei IONOS:** TTL vorab auf 300 s; `www` CNAME → `cname.vercel-dns.com`; Apex A → `76.76.21.21` (Vercel zeigt die aktuellen Werte an); **MX/SPF/TXT (GSC, Zoho, MS) unverändert lassen.**
5. **Mail-DNS:** DKIM-CNAMEs für Microsoft 365 (falls nicht vorhanden); `_dmarc.detektei-weltweit.de TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@detektei-weltweit.de; adkim=s; aspf=s"` (zunächst `p=none` zur Beobachtung akzeptabel); falls Resend: dessen SPF-Include + DKIM-Records.
6. Nach Propagation: alte IONOS-Seite abschalten (Backup vorher).

## 11. Launch-Day-Checkliste
- [ ] `main` = geprüfter Stand; Production-Deploy grün
- [ ] Env-Vars gesetzt; Testanfrage + Testbewerbung über die **Prod-URL** → Mail im Postfach (nicht Spam); Reply-To korrekt
- [ ] `curl -I http://detektei-weltweit.de/`, `http://www…`, `https://detektei-weltweit.de/` → jeweils 308 → `https://www…/` → 200; `/index.html` → 308 `/`
- [ ] Security-Header auf Prod-Domain (securityheaders.com ≥ A); 0 CSP-Fehler in der Konsole (Dark + Light, Formular absenden)
- [ ] `/docs/`, `/FREIGABE.md`, `/seo-tool/.env`, `/README.md` → 404
- [ ] `robots.txt`, `sitemap.xml` 200; Canonicals `https://www…`
- [ ] 404-Seite, Mobile-Nav, Theme-Toggle, Pause-Button, Skip-Link (Tab)
- [ ] tel:-Links auf iPhone/Android angetippt (24h, HQ, Büro Ost)
- [ ] Lighthouse mobil auf Prod ≥ 90 (index/detektei/kontakt); Rich-Results-Test (Start, Detektei, Akademie, 1 Artikel)
- [ ] Search Console: Property (DNS-TXT vorhanden) bestätigen, Sitemap einreichen, URL-Prüfung Start + 6 Leistungen
- [ ] Uptime-Monitor (60 s) auf `/` und `/kontakt.html`; Vercel-Logs für `/api/contact` beobachten
- [ ] Beide Bypass-Secrets widerrufen („Go-Live-QA", „Kundenabnahme Link") und Alias `detektei-weltweit-abnahme.vercel.app` entfernen; Vercel-Team-Zugriff für Kunden

## 12. Post-Launch
**+1 h:** alle 19 URLs 200; Redirect-Matrix; Formular-Testmail; Konsole ohne Fehler; Uptime grün; GSC URL-Prüfung Start.
**+24 h:** Vercel-Logs (5xx, `MAIL_FAILED`), Formulareingänge vs. Log-Einträge, GSC Crawling-Statistik, DNS-Propagation weltweit, Spam-Aufkommen, DMARC-Reports.
**+7 Tage:** GSC Seitenindexierung (17 URLs, keine Duplikate), Sitemap-Status, CWV-Bericht (erste Felddaten), erste Rankings (Detektei München, Objektschutz München, §34a München), 404-Report, Zustellrate 100 %.
**+30 Tage:** Rankings/Klicks je Landingpage, Conversion (Anrufe + Formulare), CWV-Felddaten „gut", Ratgeber-Traffic, Content-Gap-Seiten priorisieren, Header-Recheck, Fotos nachgeliefert?, Datenschutztext final.

## 13. Abschluss-Einstufung

**CONDITIONALLY READY.** Technik launchfähig (Regression auf Vercel-Preview bestanden: Header, Redirects, 404, Ausschlüsse, API-Verhalten, Lighthouse 99–100/100). Vor dem Livegang zwingend: B1 Mail-Credentials + Zustelltest, B2 Büro-Ost-Daten, B3 Datenschutztext (Anwalt), B5 DNS-Umzug; empfohlen: B4 Fotos, B6/B7 Kennzahlen/Öffnungszeiten. Danach Launch-Checkliste §11 abarbeiten und Bypass-Secret widerrufen.

## 14. Nachträgliche Design-Änderung (Kundenwunsch 2026-09-21): Glasmorphismus
Header-Nav-Pille, Dropdown, Theme-Toggle, Kontakt-CTA, Mobile-Nav, alle Buttons (Primary/Ghost/Pause), Formularfelder + Formularbox, Karten (Leistungen, Standorte, Zertifikate, Stats, Statistik, News, Jobs, Kontakt-Info), Notruf-Leiste, Ticker, Trust-Badge, CTA-Panel, Hinweisboxen. Zentrale Tokens `--glass-*` (Dark/Light). Backdrop-Blur nur über Bild/Verlauf (Header, CTA-Panel, Statistik-Karten, Buttons); Karten auf flachem Grund ohne Blur (Performance). Kontraste geprüft (weiß auf Glas-Blau ≥ 5:1). Regression: Lighthouse-Lauf nach Änderung siehe Commit-Historie.

## 15. Logo-Übernahme (Kundendatei 2026-09-21)
Offizielles Logo `DSS_Pappenberger_30Jahre_Logo.jpg` (2898×1368, weißer Hintergrund) übernommen: freigestellt als WebP mit Alpha (810/480 px), Publisher-PNG, Favicons/Apple-Touch/Manifest-Icons aus dem Badge. SVG-Varianten auf Originalstand (1996) zurückgesetzt.
**Entschieden (Kunde, 2026-09-21): Logo ist Single Source of Truth → Gründungsjahr 1996.** Alle 45 Textstellen (Hero, Ticker, Footer, Intro-Jahreszahl, News-Meilensteine, Descriptions, JSON-LD `foundingDate`, Manifest) auf 1996 umgestellt; „30 Jahre“/„30+“ bleibt korrekt (1996→2026). F-26 damit FIXED. Hinweis: `FREIGABE.md` (07/2026) nannte 1995 – überholt.

## 16. Typografie-Pass (2026-09-21)
Tokens `--text-xs/sm/base/lead`, `--lh-body`, `--measure` in `css/main.css`. Fließtext 16–17 px / Gewicht 400 (vorher 15 px / 300), Zeilenlänge ≤ 78 Zeichen, Einleitungen 17–19 px, Labels/Buttons/Nav 12 px (vorher 11), Meta/Karten-Teaser 14 px, Eingabefelder 16 px (kein iOS-Auto-Zoom). Barlow 300 entfernt (8 Font-Dateien). axe: 0 Verstöße Dark + Light.

## 17. Visual System v3 – Art Direction „Investigative Editorial Authority“ (2026-09-21)

**Phase 1 Audit (systemische Ursachen):** Glas-Karte mit 18-px-Radius für jede Information (14 Komponententypen), Pill-Form bei Nav/Buttons/Inputs/Badges, jede Sektion = Eyebrow + Serif-H2 + Kartenraster, 15 Slider-Slides + Ticker + Reveal-Stagger, kein tonaler Rhythmus (Dark-Theme komplett dunkel, Light-Theme komplett hell), Verläufe/Raster statt Material.

**Phase 2 Governance:** semantische Tokens (`--bg/--bg-2/--ink/--brand/--brand-text`), Sektionslogik LIGHT = Information / TINT = Gliederung / DARK = Bedeutung (Token-Override, in beiden Themes dunkel) / BLAU = Aktion; Radien 2/6/10 px; Glas nur Header (gescrollt), Dropdown, Mobile-Nav; Button-System Primary (solid Blau) / Ghost (Outline) / Textlink mit Pfeil; Editorial Row + Story Row + Proof-Leiste als Grundmuster; Motion = Reveal 12 px + Hairline.

**Phase 3 Startseite (Referenz):** Hero typografisch-asymmetrisch (Meta-Zeile, H1, rechts Lead + CTA + operative Fakten: 24h-Nummer, Hauptsitz, Einsatzgebiet, Qualität) → Positionierung + Proof-Leiste → Leistungen (2 Featured + 4 Rows) → dunkles Statement (PKS-Zahl mit Kontext, 3 Nebenzahlen, Leitsatz, CTA) → Warum Pappenberger (Rows) → Standorte (Tabelle) → Ratgeber (Story Rows) → Zertifikate (Hairline-Raster) → dunkler CTA → Footer. Entfernt: Hero-Slider, Ticker, 4 Hintergrund-Slider, Zähler-Animation, Kartenwand, Icons. Kein Inhalt erfunden; Kennzahlen unverändert (∞ nur noch als Text „weltweites Netzwerk“ in der Proof-Leiste durch „4 Standorte“ ersetzt – bestehende Angabe).

**Phase 4/5:** Responsive 1440/1024/768/390/320 geprüft (scrollWidth = Viewport); Unterseiten über gemeinsame Komponenten überführt (Stats-Leiste, Story Rows, Jobs, CTA, Formular), Slide-Markup aus 14 Unterseiten entfernt.

**Phase 6 Motion:** nur `.reveal`/`.reveal-rule`, Hover als Farb-/Pfeilreaktion.

**Phase 7 QA:** axe 0 Verstöße (3 Seiten × 2 Themes), html-validate 0 relevante Meldungen, Lighthouse mobil 98–99 / A11y 100 / SEO 100, CLS 0–0,001 (metrik-angepasste Fallback-Fonts), Formular-Tests 18/18, Links 0 defekt.

**Anti-AI-Selbsttest:** ohne Animation gestaltet ✓ · ohne Schatten Hierarchie klar ✓ (keine Schatten außer Dropdown) · ohne Radien gruppiert ✓ (Hairlines) · ohne Fotografie funktioniert ✓ · ohne Blau Hierarchie lesbar ✓ (Typografie/Hairlines) · 5-Sekunden-Test: Firma, Leistung, Zielgruppe, Ort, nächster Schritt im Hero ✓ · 5 Sektionen in Folge unterschiedlich (Hero/Proof/Featured+Rows/Dark/Rows-2-spaltig) ✓ · „Premium“-Dekoration entfernt ✓ · ohne Dark Mode Detektei-Charakter ✓ · ohne Glas hochwertig ✓.

**Offen (nicht durch Engineering lösbar):** Fotografie (Slots vorbereitet, keine Stock-/AI-Bilder eingesetzt) – CUSTOMER; Kennzahlen „∞/16/100 %“ auf Unterseiten – CUSTOMER (F-24).

## 18. Fotografie (Platzhalter) & Logo-Konsistenz (2026-09-21)
Drei Motive (Siegestor, Isar, Straße bei Nacht) als selbst gehostete WebP-Platzhalter unter Unsplash-Lizenz integriert. Stand 2026-09-21: Siegestor ist auf der Startseite seitenweiter, fixierter Hintergrund (`figure.page-bg`), alle Sektionen liegen halbtransparent darüber, sodass das Motiv in jedem Abschnitt sichtbar bleibt; Isar in Warum-Sektion und Seiten-Hero Detektei; Straße bei Nacht derzeit ungenutzt. Textkontrast per axe (beide Themes) ohne Verstöße. **CUSTOMER:** vor Launch durch eigene Fotos ersetzen oder die Platzhalter freigeben (Lizenz: https://unsplash.com/license, IDs in `docs/technische-spezifikation.md`). Logo-Markup: 6 Unterordner-Seiten nutzten noch `logo-full.svg` (altes Markup) → auf einheitliches WebP + `srcset` umgestellt; Header/Footer-Logo jetzt auf allen 20 Seiten identisch. Lighthouse mobil nach Bildern: Start 98 / Detektei 98, CLS 0.
