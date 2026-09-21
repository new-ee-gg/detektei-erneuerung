# Go-Live Readiness Audit — detektei-weltweit.de

**Stand:** 2026-09-21 · **Branch:** `feature/dark-light-mode` (Working Tree, unkommittiert) · **Methodik:** Read-only. Kein Code geändert, nichts deployed.
**Verifikationsquellen:** Quelltext aller 19 Seiten + CSS/JS · Link-/Anker-Crawler (Python) · Lighthouse 12 (mobile + desktop, index/detektei/kontakt, lokaler Server, Unsplash real geladen) · html-validate (19 Seiten) · WCAG-Kontrastrechnung aller Theme-Tokens · DNS/HTTP-Probe der Live-Domain · BKA-PKS-2024-Abgleich (Web).
**Nicht ausgeführt (Kundenwunsch: kein Playwright):** interaktiv-Tests (Tastatur, Mobile-Nav, JS-aus). Diese Punkte sind aus dem Code abgeleitet und als *code-verifiziert* markiert, nicht *browser-verifiziert*.

Status-Legende: **PASS** · **PARTIAL** · **FAIL** · **NOT VERIFIED** · **N/A**

---

## 1. Executive Summary

**Overall Go-Live Status: NO-GO.**

Die Seite ist inhaltlich und strukturell weit (SEO-Grundgerüst, Schema, Sitemap, Semantik, Dark/Light, self-hosted Fonts, kein Tracking). Sie ist **nicht launchfähig**, weil:

1. **Kein Deploy-Stand existiert.** Die gesamte finale Arbeit ist unkommittiert; `assets/` (Fonts, Logos, OG-Bild), `news/`, `wissenswertes/` sind untracked. Ein Deploy von `main`/`origin` liefert eine Seite **ohne Fonts, ohne Logo, ohne Unterseiten**.
2. **Das Kontaktformular sendet nichts** und zeigt eine Fake-Erfolgsmeldung. Zentrale Conversion tot.
3. **19 Unsplash-Hotlinks** liefern 5,1 MB Bilder von einem US-CDN → Startseite mobil LCP **14,3 s** (Lighthouse Perf 65), DSGVO-Datenabfluss ohne Nennung in der Datenschutzerklärung, Lizenz-/Ausfallrisiko.
4. **Falsche Kriminalstatistik auf der Startseite** mit BKA-Quellenangabe (Gewaltkriminalität laut BKA PKS 2024: 217.277 Fälle — Seite zeigt 133.882; Diebstahl laut BKA ~1,94 Mio — Seite zeigt 217.654).
5. **Impressum widerspricht Standortangaben** (Büro Ost: Bad Lauchstädt im Impressum vs. Merseburg auf Start-/Kontaktseite, andere Telefonnummer).
6. Keine Hosting-Konfiguration: keine Security-Header, kein HTTPS-/www-Redirect, keine 404-Seite. Live-Domain heute: HTTP ohne Redirect, Apex antwortet nicht.

Gegenüber dem Audit vom 16.07.2026 wurden behoben: PLZ Merseburg, tel-Link, `prefers-reduced-motion`, PKS-Werte in HTML ausgelagert, Heading-Sprung. **Nicht behoben:** alle P0/P1 von damals (Formular, Commit, Unsplash, Header, Deploy-Ausschluss).

Realistischer Aufwand bis GO: **~3–5 Arbeitstage** (Formular-Backend + Bilder + Hosting-Config + Datenkorrekturen + Regression), zzgl. Kundenfreigaben (Standorte, Statistik, Datenschutz).

---

## 2. System Overview (Systemkarte)

| Aspekt | Befund |
|---|---|
| Typ | Rein statische Website. Kein Framework, kein Build, kein Package Manager, kein Backend, keine DB, keine Auth, keine API. |
| Seiten | 19 HTML: 13 Root + `wissenswertes/`×4 + `news/`×2 |
| Styling | `css/reset.css` (0,8 KB) + `css/main.css` (58 KB / 11 KB gzip, 1.061 Zeilen). CSS-Custom-Properties, fluid `clamp()`, Dark-Default + `[data-theme="light"]`. |
| JS | `js/main.js` (17 KB / 5 KB gzip, IIFE, `'use strict'`): Theme-Toggle, Nav, Hero-/BG-Slideshows, Scroll-Reveal (IntersectionObserver), Counter, Formular-Validierung, Bewerbungs-Deeplink. Kein Framework, keine Libs. |
| Fonts | 12 × woff2 self-hosted (288 KB gesamt), `font-display: swap`, 2 Preloads. |
| Bilder | 13 lokale Assets (Logos/Zertifikate/OG, ~660 KB) + **19 externe Unsplash-URLs** (CSS-Backgrounds + 1 `<img>`). |
| Externe Dienste | Nur `images.unsplash.com` (Laufzeit). Google Maps nur als Links. Keine Analytics, kein Consent-Tool, keine Embeds, keine Google Fonts. |
| Formulare | 1 Kontakt-/Bewerbungsformular (`kontakt.html`), kein `action`, kein Backend. |
| SEO-Infra | `robots.txt` (Allow all + Sitemap), `sitemap.xml` (17 URLs, ohne noindex-Seiten), Canonicals absolut auf `https://www.detektei-weltweit.de/…`. |
| Structured Data | LocalBusiness (Start), Service+FAQ+Breadcrumb (6 Leistungen), EducationalOrganization+Course (Akademie), ContactPage, Article (6), FAQPage (9), BreadcrumbList (18). Alle JSON-LD syntaktisch valide. |
| Deployment | **Nicht konfiguriert.** Entscheidung (Audit 07/2026): Vercel. Keine `vercel.json`, kein `404.html`, keine Header/Redirects. Vercel CLI 59 global installiert. |
| Git | Remote `github.com/new-ee-gg/detektei-erneuerung`. `main` = Initial + robots/sitemap. Working Tree: 18 modifiziert, 7 untracked (`assets/`, `docs/`, `news/`, `wissenswertes/`, `FREIGABE.md`, 1 PDF, 1 JPG 447 KB). |
| Live-Domain heute | `www` → IONOS (217.160.0.41), HTTP 200 **ohne** HTTPS-Redirect; Apex `detektei-weltweit.de` **Timeout**. MX Microsoft 365, SPF `-all` vorhanden, **DMARC fehlt**, `google-site-verification` TXT vorhanden. |
| Nebenprojekt | `seo-tool/` (FastAPI, gitignored) mit `.env`: DataForSEO-Login/Passwort mit realistischer Länge (10/13 Zeichen) → als echt behandeln. |

### Informationsarchitektur (Ist)

```
/ (Start)
├── Leistungen (nur Anker #leistungen, keine eigene Seite)
│   ├── detektei.html          ├── objektschutz.html     ├── veranstaltungsschutz.html
│   ├── video-sicherheit.html  ├── sonderdienste.html    └── akademie.html
├── news.html → news/30-jahre-pappenberger.html, news/neuer-webauftritt.html
├── wissenswertes.html → 4 Ratgeber (Kosten, Rechte, Untreue, Beweise)
├── karriere.html (→ kontakt.html?bewerbung=…)
├── kontakt.html
└── impressum.html, datenschutz.html (noindex)
```
Crawl-Tiefe max. 2. Keine Orphans (min. 1 Inbound; News-Artikel nur 1 Inbound → schwach). Reziproke Verlinkung Leistungen ↔ Ratgeber vorhanden.

---

## 3. Go-Live Scorecard

| Bereich | Status | P0 | P1 | P2 | P3/P4 | Blocker |
|---|---|---|---|---|---|---|
| Functional | **FAIL** | 1 | 2 | 1 | 2 | Formular tot; JS-Fragilität |
| Technical SEO | PARTIAL | 0 | 0 | 2 | 3 | — |
| Google Indexability | PARTIAL | 0 | 1 | 1 | 0 | Deploy-Stand fehlt (nichts indexierbar) |
| On-Page SEO | PARTIAL | 0 | 0 | 0 | 3 | — |
| Structured Data | PASS | 0 | 0 | 0 | 3 | — |
| Performance | **FAIL** | 0 | 1 | 1 | 4 | LCP 14,3 s mobil (Unsplash) |
| Mobile | PARTIAL | 0 | 1 | 1 | 2 | Service-Links unsichtbar auf Touch |
| Accessibility | PARTIAL | 0 | 0 | 3 | 4 | — |
| Security | **FAIL** | 0 | 2 | 1 | 1 | Keine Header, kein HTTPS-Redirect |
| Privacy | **FAIL** | 0 | 2 | 1 | 1 | Unsplash + Datenschutztext unvollständig |
| Analytics | N/A→FAIL | 0 | 0 | 1 | 0 | Kein Measurement-Plan |
| UX/UI | PASS | 0 | 0 | 1 | 3 | — |
| Conversion | **FAIL** | 1 | 1 | 0 | 2 | Formular; Service-Links |
| Content | **FAIL** | 0 | 2 | 1 | 3 | Falsche PKS-Zahlen; NAP-Widerspruch |
| Code Quality | PASS | 0 | 0 | 0 | 5 | — |
| Production | **FAIL** | 1 | 2 | 2 | 1 | Unkommittiert; keine Config; keine 404 |

---

## 4. Findings

Format je Finding: **ID · Bereich · Severity · Status** — Betroffen — Problem — Beweis — Warum relevant — Lösung — Dateien — Aufwand — Abhängigkeiten — Verifikation.

### 4.1 P0 — Go-Live Blocker

**F-01 · Functional/Conversion · P0 · FAIL — Kontaktformular sendet nichts, zeigt Fake-Erfolg**
- Betroffen: `kontakt.html:173` (`<form … novalidate>` ohne `action`/`method`), `js/main.js:288-322`.
- Beweis: `e.preventDefault()`, Kommentar `/* ⚠ Backend-Integration ausstehend */`, danach statisches „Vielen Dank …". Kein `fetch`, kein POST. Kein Honeypot, kein Rate-Limit.
- Warum: Jede Anfrage geht verloren; Nutzer wird getäuscht. Fällt JS aus, sendet der Browser ein natives GET mit personenbezogenen Daten in der URL.
- Lösung: Backend wählen (Empfehlung Vercel-Function `/api/contact` mit Resend/SMTP über `info@…`, alternativ Web3Forms). `method="post"`, `fetch` mit Loading-/Error-State, Doppel-Submit-Sperre, Honeypot + Cloudflare Turnstile, serverseitige Validierung, Rate-Limit. Erfolg/Fehler mit `role="status"`/`aria-live`. Bewerbungs-Kontext (`?bewerbung=`) im Payload mitschicken.
- Aufwand: M. Abhängigkeiten: F-03 (Hosting), F-23 (Datenschutztext), F-38 (DMARC). 
- Verifikation: Testsendung → Mail beim Empfänger; ungültige Daten → Fehler; Netzwerk offline → sichtbarer Fehler, keine Erfolgsmeldung; Honeypot gefüllt → verworfen; 2× Klick → 1 Mail.

**F-02 · Production · P0 · FAIL — Gesamter Launch-Stand unkommittiert; `assets/`, `news/`, `wissenswertes/` untracked**
- Beweis: `git status`: 18 modifiziert, untracked `assets/ docs/ news/ wissenswertes/ FREIGABE.md "DSS Pappenberger Jubiläum.pdf" DSS_Pappenberger_30Jahre_Logo.jpg`. `git ls-files` enthält **keine** Fonts, Logos, Ratgeber, News. `main` = 2 Commits (Initial + robots).
- Warum: Git-basiertes Deploy liefert alte Version ohne Fonts/Logo/Unterseiten; Datenverlustrisiko.
- Lösung: `.gitignore` erweitern (F-10), dann strukturiert committen (assets → content → theme → seo), pushen, PR nach `main`.
- Aufwand: S. Abhängigkeiten: F-10. Verifikation: frischer Clone in Temp-Verzeichnis rendert identisch; `git status` clean.

### 4.2 P1 — Critical (vor Launch beheben)

**F-03 · Production/Security · P1 · FAIL — Keine Hosting-/Deploy-Konfiguration (Header, Redirects, 404)**
- Beweis: keine `vercel.json`, keine `_headers`, kein `404.html`. Live-Domain: `http://www…` → 200 ohne Redirect; Apex → Timeout (curl 15 s).
- Lösung: `vercel.json` mit `headers` (siehe §13), `redirects` (Apex→www 308, `/index.html`→`/` 308), `cleanUrls: false` (alle Canonicals enden auf `.html`), `trailingSlash: false`; `404.html` im Site-Design mit Suche/Links. HTTPS/HSTS liefert Vercel, HSTS trotzdem explizit setzen (`max-age=63072000; includeSubDomains; preload` erst nach Test ohne `preload`).
- Aufwand: S. Abhängigkeiten: DNS-Zugang (IONOS). Verifikation: `curl -I` für http/https × apex/www → alle enden 200 auf `https://www…`; securityheaders.com ≥ A; `/nope` → 404 mit Custom-Seite.

**F-04 · Privacy/Performance · P1 · FAIL — 19 Unsplash-Hotlinks (5,1 MB), LCP 14,3 s mobil, Datenabfluss an US-CDN**
- Betroffen: `css/main.css:284-288` (Hero ×5), `:483-486` (Quote ×4), `:508-510` (Trust ×3), `:527-529` (Krimi ×3), `:583-585` (CTA ×3); `index.html:191` (`<img>`).
- Beweis: Lighthouse index mobil: Perf **65**, LCP **14,3 s**, Total 5.645 KiB, davon 5.169 KiB `images.unsplash.com`; größte Datei 571 KiB. Desktop LCP 2,6 s. `datenschutz.html` nennt Unsplash nicht. Lizenzstatus NOT VERIFIED.
- Warum: Core Web Vitals klar verfehlt; IP-Übermittlung an Drittanbieter ohne Rechtsgrundlage/Hinweis (juristisch prüfen); Layout bricht, wenn Unsplash Bilder entfernt.
- Lösung: Echte Firmenfotos (oder lizenzgeklärte Stockfotos) lokal ablegen als AVIF/WebP, 3 Größen (800/1400/2000 px), ~120–250 KB je Hero-Bild. Hero-Slide 1 als `<img fetchpriority="high">` oder `<link rel="preload" as="image" imagesrcset>`; restliche Slides lazy nach `load`. Slider-Anzahl reduzieren (5 Hero-Slides + 13 BG-Slides sind zu viel Ballast; 3/2/2/2/2 reicht).
- Aufwand: M (Bildbeschaffung vom Kunden = L). Abhängigkeiten: Kunde (Fotos). Verifikation: `grep -r unsplash` leer; Lighthouse mobil LCP < 2,5 s, Perf ≥ 90; DevTools-Network nur First-Party.

**F-05 · Security · P1 · FAIL — Keine Security-Header**
- Beweis: HSTS/CSP/X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy nirgends definiert.
- Lösung (Vorschlag, vorher testen): 
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-<hash Inline-Theme-Script>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://<form-endpoint>; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://<form-endpoint>; object-src 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Frame-Options: DENY
  ```
  Hinweis: `style-src 'unsafe-inline'` nötig wegen 100+ Inline-Styles (F-31) — mittelfristig in Klassen überführen. Das Inline-Theme-Script ist auf allen 19 Seiten byte-identisch → ein Hash reicht. JSON-LD-Blöcke sind von CSP nicht betroffen.
- Aufwand: S. Abhängigkeiten: F-03, F-04 (img-src). Verifikation: keine CSP-Verstöße in Konsole auf allen 19 Seiten (Dark + Light, Formular-Submit); securityheaders.com A/A+.

**F-06 · Content/Trust · P1 · FAIL — Kriminalstatistik widerspricht der zitierten Quelle (BKA PKS 2024)**
- Betroffen: `index.html:356-380` („Polizeiliche Kriminalstatistik 2024", Quelle BKA, „bundesweit erfasste Fälle").
- Beweis: Seite: Gewaltkriminalität 133.882 · Computerkriminalität 95.210 · Diebstahl 217.654 · Straßenkriminalität 156.030. BKA PKS 2024: Gewaltkriminalität **217.277**, Diebstahl **> 1,94 Mio**, Straftaten gesamt 5.837.445. Die Seitenwerte passen weder zur Bundes- noch (Stichprobe) zur Bayern-Statistik.
- Warum: Falsche Zahlen mit Behördenquelle auf der Startseite einer Detektei = Glaubwürdigkeitsschaden; Abmahn-/Reputationsrisiko bei Fachpublikum (Anwälte).
- Lösung: Werte aus BKA-PKS-2024-Tabelle 01 übernehmen (Schlüssel 892000 Gewaltkriminalität, ***000 Diebstahl gesamt, 899000 Straßenkriminalität, Cybercrime 897000) oder Sektion entfernen. Jahreszahl + Quelle-Link (`bka.de`) ergänzen. Kundenfreigabe.
- Aufwand: XS. Verifikation: Zahlen 1:1 gegen PDF/Tabelle; Screenshot im Freigabeprotokoll.

**F-07 · Content/Legal/SEO · P1 · FAIL — Impressum vs. Standorte: Büro Ost widersprüchlich**
- Beweis: `impressum.html` „Büro Ost: Eislebenerstraße 43a, D-06246 Bad Lauchstädt, Tel +49 34636 757151". `index.html:404-416`, `kontakt.html:239-246`: „Filiale Ost – Merseburg, Hallesche Str. 118, 06217, Tel +49 3461 2492544". `news/30-jahre…`: „vier Standorte … Merseburg". Impressum listet weder Schliersee noch Nürnberg.
- Warum: Impressumspflicht (§ 5 DDG/TMG) verlangt korrekte Angaben; Google-NAP-Konsistenz; Nutzer rufen falsche Nummer. **Juristische Prüfung** der Impressumsvollständigkeit empfohlen (kein Rechtsrat).
- Lösung: Kunde bestätigt gültige Adressen/Nummern; eine Quelle der Wahrheit (z. B. `docs/nap.md`), alle Vorkommen angleichen (HTML, JSON-LD, Maps-Links).
- Aufwand: S. Abhängigkeiten: Kunde. Verifikation: `grep` auf Straßen/Telefonnummern liefert nur freigegebene Werte; Rich-Results-Test ohne Warnungen.

**F-08 · Functional/Robustheit · P1 · FAIL (code-verifiziert) — Gesamtes JS stirbt bei blockiertem `localStorage`; ohne JS bleibt Inhalt unsichtbar**
- Beweis: `js/main.js:64` `localStorage.getItem(THEME_KEY)` ohne try/catch (Inline-Head-Script hat try/catch, main.js nicht; auch `:28`, `:73`). Bei „Alle Cookies blockieren" (Chrome/Edge), Firefox `dom.storage.enabled=false` oder Safari-Storage-Restriktionen wirft der Zugriff `SecurityError` → IIFE bricht ab, **bevor** Mobile-Nav (`:95`), Slideshows, Reveal (`:223`), Formular-Validierung initialisiert werden. `.reveal` startet mit `opacity:0` (`main.css`) → **alle Sektionen unsichtbar**, Hamburger-Menü tot. Ohne JS (Bots, Reader-Modi, Fehler): identisch, kein `<noscript>`/`.no-js`-Fallback.
- Lösung: `safeStorage`-Wrapper (try/catch, Fallback in-memory). Reveal nur aktivieren, wenn `document.documentElement.classList.contains('js')` (Klasse im Head-Script setzen); CSS `.js .reveal { opacity:0 }`. Module in eigene try/catch-Blöcke kapseln, damit ein Fehler nicht alles stoppt.
- Aufwand: S. Verifikation: DevTools → Application → „Block third-party/all cookies" bzw. `--disable-local-storage`; Seite mit JS aus (Reader-Modus) zeigt alle Inhalte.

**F-09 · Conversion/A11y/Mobile · P1 · FAIL (code-verifiziert) — „Mehr erfahren"-Links der 6 Leistungs-Cards sind unsichtbar (opacity 0) außer bei `:hover`**
- Beweis: `css/main.css` `.service-link { opacity:0 }` / `.service-card:hover .service-link { opacity:1 }`. `.service-card { cursor:pointer }`, aber nur der Link ist klickbar. Auf Touch gibt es kein Hover; Tastaturfokus landet auf unsichtbarem Link.
- Warum: Startseiten-Kernpfad „Leistung → Detailseite" auf Mobile nicht erkennbar; WCAG 2.4.7 (Fokus sichtbar), 2.4.4.
- Lösung: Link immer sichtbar (Hover nur Farbwechsel/Pfeil-Shift) **oder** ganze Card als `<a>` mit sichtbarem Label; `:focus-within` ergänzen.
- Aufwand: XS. Verifikation: iPhone/Android Screenshot 375 px zeigt CTA; Tab-Fokus sichtbar.

**F-10 · Security/Production · P1 · FAIL — Interne Dateien würden mit-deployed**
- Beweis: Root enthält `FREIGABE.md`, `docs/` (interne Audits/Tasks), `DSS Pappenberger Jubiläum.pdf`, `DSS_Pappenberger_30Jahre_Logo.jpg` (447 KB, unoptimiert), `seo-tool/` (gitignored ✓, `.env` mit echten Zugangsdaten-Längen).
- Lösung: `.gitignore` + `.vercelignore`: `docs/`, `FREIGABE.md`, `*.pdf`, `seo-tool/`, Root-JPG verschieben/optimieren nach `assets/images/` (falls benötigt). DataForSEO-Passwort rotieren, wenn es je committed/geteilt wurde (NOT VERIFIED). 
- Aufwand: XS. Verifikation: `git ls-files | grep -E 'docs/|FREIGABE|pdf|seo-tool'` leer; Preview-URL `/FREIGABE.md`, `/docs/`, `/seo-tool/.env` → 404.

**F-23 · Privacy/Legal · P1 · PARTIAL — Datenschutzerklärung deckt die Ziel-Technik nicht ab (juristisch prüfen)**
- Beweis: `datenschutz.html` nennt: Logfiles, Kontakt, Formular, Maps-Links, SSL. Nennt **nicht**: Hosting-Provider (Vercel Inc., USA → AVV/DPF/SCC, Server-Logs), `localStorage` (Theme), Unsplash (solange vorhanden), Formular-Dienstleister/Mailversand (nach F-01), Spam-Schutz (Turnstile = Cloudflare). „Stand: Juli 2026".
- Lösung: Nach Festlegung von Hosting + Formular-Backend Text ergänzen; Aussage „keine Cookies/keine Tracker" + Hinweis auf funktionalen `localStorage` (§ 25 Abs. 2 TDDDG, kein Consent nötig — **Rechtsauffassung, prüfen lassen**).
- Aufwand: S (Text) + Anwalt. Abhängigkeiten: F-01, F-03, F-04. Verifikation: Text ↔ tatsächliche Requests (DevTools) deckungsgleich.

### 4.3 P2 — High

**F-11 · Security · P2 · FAIL — Kein Spam-/Missbrauchsschutz am Formular** (Honeypot, Turnstile, Rate-Limit, Payload-Limits, serverseitige Validierung). Mit F-01 umsetzen. XS–S.

**F-12 · Accessibility · P2 · FAIL — Kontrast des Akzentblaus im Dark-Mode**
- Beweis: `--gold: #3D63B2` auf `#0a0a0b/#111114/#16161a` = **3,42 / 3,25 / 3,12 : 1** (AA normal = 4,5). Betroffen als Text: `.section-label` (10 px), `.prose h3` (15 px), `.prose a`, `.footer-col-title`, `.location-badge`, `.form-required`, `.certs-group-label`, `.service-link`, `.kriminal-label`, `.news-card__date`, `.contact-info-block h4`. Lighthouse a11y 93–96, `color-contrast` FAIL auf allen 3 Seiten. Kontakt-24h-Banner: `#0a0a0b` auf `#3D63B2` = 3,42 (Dark) / **2,53** (Light). Fehlerfarbe `#e05a5a` auf Light-`--deep` = **2,86**. Light-Mode-Tokens sonst AA ✓ (dokumentiert in CSS).
- Lösung: Dark-Mode Text-Akzent auf `--gold2 #5B82D1` (4,8–5,2 : 1 ✓) oder ein `--accent-text`-Token einführen; `#3D63B2` nur als Fläche (weißer Text = 5,79 ✓). Banner: weißer Text auf Blau. Fehlerfarbe je Theme.
- Aufwand: S. Verifikation: axe/Lighthouse `color-contrast` = 0 Verstöße in beiden Themes.

**F-13 · Accessibility · P2 · FAIL (code-verifiziert) — Slider-Steuerungen nicht tastaturbedienbar, Touch-Ziele zu klein**
- Beweis: `.hero-thumb` (36×3 px, `div` mit click), `.bgs-dot` (8×8 px). Keine `button`, kein `tabindex`, kein `aria-label`, kein `aria-live` für Slide-Wechsel. WCAG 2.1.1, 2.5.8 (24×24), 4.1.2.
- Lösung: `<button aria-label="Bild 2 von 5">` mit 44×44-Trefferfläche (Pseudo-Element), Pause-Button für Auto-Play (WCAG 2.2.2 — Auto-Slideshow > 5 s ohne Pause = FAIL).
- Aufwand: S.

**F-14 · Accessibility · P2 · FAIL — ARIA-Fehlnutzung**
- Beweis (html-validate): 28× `aria-label`/`aria-labelledby` auf `<div>` ohne Rolle (`.intro`, `.stats-bar`, `.certs-section`, `.cta-section` …) → wirkungslos; 38× redundante `role="banner"/"contentinfo"`; `role="menu"/"menuitem"` auf Link-Dropdown ohne Arrow-Key-Modell (`index.html:78-84`, alle Seiten) → Screenreader kündigen „Menü" an, Tastatur verhält sich nicht wie Menü; **`index.html:275` Quote-Sektion `aria-hidden="true"` enthält Blockquote + CTA-Button „Jetzt Kontakt aufnehmen"** → für AT unsichtbar, aber fokussierbar (hidden-focusable).
- Lösung: `<div>`→`<section>`, `role="menu"` entfernen (einfache Liste + `aria-expanded` auf Trigger), `aria-hidden` nur auf die Bild-Container, nicht auf Inhalt.
- Aufwand: S.

**F-16 · Technical SEO · P2 · PARTIAL — Doppelte Homepage-URL `/` vs `/index.html`**
- Beweis: 132 interne Links auf `index.html`; Canonical `/`; Breadcrumb-JSON-LD `item: …/index.html#leistungen`. Ohne Redirect indexiert Google beide (Canonical mildert).
- Lösung: Interne Links auf `/` bzw. `/#leistungen`; Redirect `/index.html` → `/` (308) in `vercel.json`; Breadcrumb-Item „Leistungen" auf `https://www.detektei-weltweit.de/#leistungen` oder Ebene weglassen.
- Aufwand: XS (sed über 19 Dateien). Verifikation: `curl -I /index.html` → 308 → `/`.

**F-17 · Production/UX · P2 · FAIL — Keine Custom-404-Seite.** Vercel-Standard-404 (weiß, englisch). Lösung: `404.html` im Site-Layout mit Navigation, Suche-Ersatz (Leistungsliste), 24h-Nummer. XS.

**F-20 · Performance · P2 · PARTIAL — Weitere Perf-Defizite (auch ohne Unsplash)**
- Beweis (Lighthouse mobil): render-blocking CSS 1,5–1,8 s; FCP 2,4–3,1 s (langsame 4G-Simulation) auf Unterseiten **ohne** Unsplash-Hero; `logo-full.webp` 83 KB bei 810×340 (LCP-Element auf Unterseiten); unminified CSS/JS (−19 KiB); unused CSS 31–48 KiB; keine Cache-Header (Host-Config); 12 Font-Faces (Barlow 600 nirgends genutzt).
- Lösung: Kritisches CSS inline (Header/Hero/Page-Hero, ~6 KB) + Rest `media="print" onload`; CSS/JS minifizieren (Build-Schritt oder Vercel-Plugin); Logo als 2×-optimiertes WebP ≤ 20 KB + `width/height`; Cache-Control `immutable` für `/assets/*` (Dateinamen mit Hash oder Versions-Query); Barlow-600 entfernen; `content-visibility:auto` für Below-fold-Sektionen.
- Aufwand: M. Verifikation: Lighthouse mobil ≥ 90 auf index/detektei/kontakt; CLS < 0,1 (aktuell 0,001–0,027 ✓).

**F-38 · E-Mail · P2 · FAIL — DMARC fehlt für `detektei-weltweit.de`** (SPF `v=spf1 include:spf.protection.outlook.com -all` ✓, DKIM NOT VERIFIED). Vor Formular-Versand über eigene Domain: DKIM (M365) + `_dmarc` TXT `v=DMARC1; p=quarantine; rua=mailto:…`. Falls Formular-Mails über Drittanbieter (Resend/Web3Forms) mit `From: info@detektei-weltweit.de` gehen: deren SPF-Include + DKIM-CNAMEs ergänzen, sonst landen Anfragen im Spam. XS (DNS).

**F-37 · Security · P2 · NOT VERIFIED — `seo-tool/.env` enthält Zugangsdaten mit realistischer Länge.** Nicht im Git, nicht in Website-Assets. Sicherstellen: nie in Deploy-Artefakt (F-10), Rotation falls je geteilt.

**F-49 · Functional · P2 · FAIL (code-verifiziert) — Formular ohne `method="post"`**: bei JS-Ausfall natives GET → PII in URL/Logs. Mit F-01 beheben.

### 4.4 P3 — Medium (kurz nach Launch)

- **F-15 · A11y · P3** — Kein Skip-Link („Zum Inhalt"); `#main-content` existiert bereits. XS.
- **F-18 · SERP/Brand · P3** — Nur SVG-Favicon (`logo-badge.svg` 25 KB, zeigt „SEIT 1996"). Fehlend: `favicon.ico` (32), `apple-touch-icon.png` (180), `icon-192/512.png`, `site.webmanifest`, `theme-color` ✓ vorhanden. Google-SERP-Favicon benötigt ≥ 48×48 Raster oder valides SVG — NOT VERIFIED ob SVG akzeptiert wird. S.
- **F-19 · On-Page SEO · P3** — Startseiten-H1 „Diskretion. Präzision. Ergebnis." ohne Keyword/Entität; Title „Detektei München & bundesweit | Detektei Pappenberger" doppelt „Detektei". Lösung: H1 z. B. „Detektei München — Diskretion. Präzision. Ergebnis." XS.
- **F-22 · Structured Data · P3** — `Article.publisher.logo` verweist auf SVG (Google-Empfehlung: Raster, ≤ 60 px hoch, ≥ 600 px breit); `LocalBusiness` ohne `@id`, `priceRange`, `openingHoursSpecification`, `sameAs` (Akademie-Domain, Sicherheitszentrale-Domain, Google-Business-Profil); `image` = OG-Bild statt Geschäftsfoto. S.
- **F-24 · Content/Trust · P3** — Schwache/unbelegte Kennzahlen: „∞ Weltweites Netzwerk", „16 Bundesländer", „100 %", „1:1", „1–∞" (Stats-Bars auf 6 Seiten). Durch belegbare Fakten ersetzen (Mitarbeiterzahl, Einsätze/Jahr, Reaktionszeit, Zertifikat-Jahre) oder entfernen. S + Kunde.
- **F-26 · Content · P3** — „vier Standorte" (news ×2) vs. Impressum 3 Adressen; Logo-Badge „SEIT 1996" vs. Text 1995 (Kunde bestätigt 1995 → Badge-SVG ändern). XS.
- **F-31 · Security/Code · P3** — 100+ Inline-Styles (index 38) + Inline-Theme-Script erzwingen `style-src 'unsafe-inline'`. In Utility-Klassen überführen. M.
- **F-32 · Mobile/Safari · P3** — `.hero { height: 100vh }` → iOS-Safari-Adressleiste schneidet Hero-Controls ab; `100svh`/`100dvh` mit Fallback. XS.
- **F-47 · Navigation · P3** — Mobile-Nav auf `datenschutz.html` (5 Links, ohne Wissenswertes/Sub-Links) und `impressum.html` (6) unvollständig; alle anderen 13 Links. XS.
- **F-51 · A11y · P3** — Fehlermeldungen des Formulars ohne `aria-describedby`/`aria-invalid`/`role="alert"` (`js/main.js:366-377`); Fokus springt nicht zum ersten Fehler. XS.
- **F-52 · A11y · P3** — Auto-Slideshows ohne Pause-Kontrolle (WCAG 2.2.2), Ticker läuft endlos (aria-hidden ✓, aber Bewegung ohne Stopp außer reduced-motion). Mit F-13. S.
- **F-53 · UX · P3** — Sehr kleine Schriftgrade für UI-Text: 10 px (`.section-label`, `.form-label`, `.footer-col-title`, `.location-map-link`), 11 px Nav/Buttons in Versalien. Für Enterprise-Lesbarkeit min. 12 px. S.

### 4.5 P4 — Low / Technical Debt

- **F-21** — FAQPage-Schema auf 9 Seiten: seit 08/2023 keine Rich-Results für Unternehmensseiten; harmlos, aber Doppelpflege (bereits Abweichung JSON-LD ↔ Text in `was-kostet…`: „Bei der Detektei Pappenberger nicht" vs. „Bei uns nicht"). Entfernen oder synchron halten.
- **F-27** — 459× Leerzeichen in Telefonnummern (html-validate `tel-non-breaking`) → Nummern können umbrechen; `&nbsp;` oder `white-space:nowrap`.
- **F-30** — `css/reset.css` ist 1:1 in `main.css` Abschnitt 2 enthalten → redundanter Request; entfernen.
- **F-33** — `backdrop-filter` ohne `-webkit-` auf `.kriminal-card` (Safari < 18).
- **F-34** — Schließendes Anführungszeichen `"` statt `“` (5×); sonst konsistent „—" für Gedankenstriche.
- **F-40** — Kein README (Preview, Struktur, Deploy, Ausschlüsse, Redaktionsprozess).
- **F-42** — OG-Bild überall identisch; Artikel-spezifische Bilder für Ratgeber.
- **F-44** — `footer-logo__img` ohne `width/height` (Lighthouse unsized-images).
- **F-48** — Aktiv-Markierung in Nav nur auf news/karriere/kontakt; auf Leistungsseiten keine.
- **F-50** — Theme-Toggle ohne `aria-pressed`; Label statisch.
- **F-54** — `docs/pre-launch-audit.md` + `pre-launch-tasks.json` bleiben als Historie; neue Tasks in `pre-launch-tasks.json` nachziehen (Status-Feld).
- **F-55** — 1× rohes `&` (`wissenswertes/was-darf-ein-detektiv.html:186`).

---

## 5. Bereichsberichte

### 5.1 Functional QA
| Prüfpunkt | Status | Beleg |
|---|---|---|
| Interne Links (alle 19 Seiten) | PASS | Crawler: 0 broken, 0 fehlende Anker, 0 `href="#"` |
| Externe Links | PASS | 4× Maps, Google-Privacy, gesetze-im-internet, 2 Schwester-Domains; alle `rel="noopener noreferrer"` |
| tel:/mailto: | PARTIAL | Format korrekt; Nummern-Konflikt Büro Ost (F-07) |
| Navigation Desktop/Mobile | PARTIAL | Code korrekt (aria-expanded, Escape, Fokus-Rückgabe); Legal-Seiten unvollständig (F-47); Dropdown per `:focus-within` tastaturerreichbar ✓ |
| Formular | FAIL | F-01, F-11, F-49, F-51 |
| Bewerbungs-Deeplink `?bewerbung=` | PASS (code) | `js/main.js:330-362` setzt H1/Betreff/Vorlage |
| Slider/Accordion/Tabs/Modals/Suche/Downloads | N/A | nicht vorhanden (Slider: F-13) |
| 404 / 500 | FAIL / N/A | keine 404-Seite (F-17); statisch → kein 500 |
| Placeholder/TODO/Lorem/localhost | PASS | 0 Treffer; 6 `⚠`-Kommentare = bewusste Freigabe-Marker (vor Launch entfernen: `kontakt.html:168-172`, `js/main.js:316`) |
| Testdaten/Dev-URLs | PASS | keine |
| JS-Fehlerfall | FAIL | F-08 |

### 5.2 Technical SEO
| Prüfpunkt | Status | Beleg |
|---|---|---|
| Title je Seite | PASS | 19/19, 33–63 Zeichen, unique |
| Meta Description | PASS | 19/19, 53–169 Zeichen (2 Artikel > 160: `30-jahre` 169, `untreue` 167 → kürzen, P4) |
| Canonical | PASS | 19/19 absolut, https, www, self-referencing |
| Robots-Meta | PASS | index,follow + `max-image-preview:large`; Impressum/Datenschutz noindex,follow ✓ |
| H1 | PASS | genau 1 je Seite |
| Heading-Hierarchie | PASS | keine Sprünge (Sequenzen geprüft) |
| `lang="de"` | PASS | 19/19 |
| OG / Twitter | PASS | 17/17 indexierbare Seiten; Legal-Seiten ohne (ok) |
| hreflang | N/A | einsprachig |
| robots.txt | PASS | `Allow: /` + Sitemap-Verweis |
| sitemap.xml | PASS | 17 URLs = alle indexierbaren; valides XML; lastmod 07/2026 (bei Launch aktualisieren) |
| www/non-www, http→https | FAIL | nicht konfiguriert (F-03); Live-Apex Timeout |
| Trailing Slash / Case | PASS | konsistent `.html`, lowercase |
| Duplicate URLs | PARTIAL | `/` vs `/index.html` (F-16) |
| Breadcrumbs (sichtbar + JSON-LD) | PASS | 18/19 (Start ohne, korrekt) |
| Interne Verlinkung | PASS | Leistungen 58–65 Inbound, Ratgeber 4–7, News-Artikel nur 1 (schwach) |
| Redirect-Ketten/Loops | NOT VERIFIED | erst nach Hosting-Setup prüfbar |
| Thin Content | PASS | Leistungsseiten 950–1.100 Wörter, Ratgeber 540–630, News 290–300 (News dünn, aber Newscharakter) |

### 5.3 Google Visibility (Crawl → Index → Ranking)
- **Crawlability:** PASS — alle Inhalte serverseitig im HTML, keine JS-Abhängigkeit für Text (Reveal ist nur Opacity; Googlebot rendert JS, und ohne JS ist der Text im DOM). Keine Parameter-URLs außer `?bewerbung=` (Kontakt; Canonical zeigt auf Basis-URL ✓).
- **Indexability:** PASS nach Deploy — heute NOT APPLICABLE (nichts deployed). GSC-Verifikation per DNS-TXT vorhanden (NOT VERIFIED ob Property aktiv).
- **Ranking Readiness:** PARTIAL — starke Leistungsseiten; Startseite ohne Keyword-H1 (F-19); NAP-Inkonsistenz (F-07); keine Google-Business-Profil-Verknüpfung (`sameAs`); Performance mobil FAIL (F-04) → CWV-Ranking-Signal negativ.

### 5.4 On-Page SEO (Landingpages)
| Seite | Intent klar | Keyword in Title/H1/Intro | Bewertung |
|---|---|---|---|
| index | teils | Title ✓, H1 ✗ | Marken-/Übersichtsseite; H1 anpassen (F-19) |
| detektei | ✓ | ✓/✓/✓ | Gut; „Privatdetektiv München" vs. H1 „Detektei & Ermittlungsdienst" — ok |
| objektschutz / veranstaltungsschutz / video-sicherheit / sonderdienste / akademie | ✓ | ✓/✓/✓ | Einheitliches Muster (Intro, Leistungen, Ablauf, Kosten, Gebiet, FAQ, Ratgeber, CTA) |
| wissenswertes/* | ✓ | ✓ | Informational, sauber; kein Preis (Kundenvorgabe) |
| karriere | ✓ | ✓ | evergreen; JobPosting bewusst weggelassen ✓ |
| news/* | ✓ | ✓ | dünn, ok |
Kannibalisierung: keine (1 Seite = 1 Intent, vgl. `docs/leistungen-seo-map.md`).

### 5.5 Structured Data — PASS (alle 34 JSON-LD-Blöcke parsen)
Verbesserungen: F-22 (LocalBusiness-Felder, Logo-Raster), F-21 (FAQ-Doppelpflege), Breadcrumb-Fragment-URL (F-16). `Course`: Pflichtfelder ✓, `offers` ohne `price` (ok, da Preis auf Anfrage). Kein Schema-Spam.

### 5.6 Performance (Lighthouse 12, simuliertes 4G/Moto G, lokaler Server)
| Seite | Mobil Perf | LCP | FCP | CLS | Desktop Perf | LCP |
|---|---|---|---|---|---|---|
| index | **65** | **14,3 s** | 3,1 s | 0,023 | 86 | 2,6 s |
| detektei | 86 | 3,5 s | 2,9 s | 0,027 | 100 | 0,7 s |
| kontakt | 88 | 3,5 s | 2,4 s | 0,002 | 99 | 0,8 s |
TBT 0 ms überall ✓ (INP-Risiko gering). Payload index 5,6 MB (91 % Unsplash). Felddaten (CrUX) erst nach Launch messbar.

### 5.7 Image & Media
Lokale Assets ✓ mit `loading="lazy"`, `decoding="async"`, Alt-Texte ✓ (`vesd.png` alt „VESD – Verband" zu generisch). Kein AVIF/WebP außer Logo; `polizei-helfen.png` 153 KB; keine `srcset`/`sizes` (nur kleine Logos → akzeptabel). Hero-/BG-Bilder: F-04. CLS-sicher durch feste Container ✓.

### 5.8 Mobile / Responsive (statisch aus CSS abgeleitet; browser-verifiziert nur via Lighthouse-Mobile-Viewport)
- Breakpoints 1100/900/768/480 mit fluid `clamp()` ✓; `body { overflow-x:hidden }` maskiert potenzielle Überläufe (Symptombehandlung).
- Risiken: `white-space:nowrap` auf `.btn-primary/.btn-ghost` mit 40 px Padding bei 320 px („Beratungsgespräch anfragen" ≈ 250 px + Padding → passt knapp); `.hero-actions` stapelt < 480 ✓; Ticker ✓; Tabellen keine; lange E-Mails in Impressum umbrechen (`overflow-wrap` nur auf p/h ✓).
- Header 116 px / 92 px (< 480) mit 100 px Logo — hoch; Hero-Content bei 320×568 (iPhone SE) und `min-height:680px` → Hero scrollt, Controls unten rechts ✓.
- Touch-Targets: F-13; Footer-Links 13 px Text mit `line-height:1` → ~13 px Höhe + 12 px Abstand → knapp unter 24 px (2.5.8) — P3.
- **NOT VERIFIED** (kein Browser-Lauf): tatsächliche Überläufe je Breakpoint, Landscape, iOS-Safari-Rendering.

### 5.9 Browser QA (statisch)
Modernes CSS: `inset`, `clamp`, `:focus-visible`, `accent-color`, `padding-block`, `margin-inline` → Safari ≥ 15.4, Chrome ≥ 90, Firefox ≥ 89 ✓. Risiken: `100vh` iOS (F-32), `backdrop-filter` unprefixed (F-33), `String.padStart` ✓, `matchMedia.addListener`-Fallback ✓. Kein Polyfill nötig. **NOT VERIFIED** in realen Browsern.

### 5.10 Accessibility (WCAG 2.2 AA)
| Kriterium | Status |
|---|---|
| Semantik (header/nav/main/footer, section, article, address) | PASS (Ausnahme: `div` mit aria-label, F-14) |
| Heading-Hierarchie | PASS |
| Tastatur: Nav, Dropdown, Formular, Theme-Toggle | PASS (code) |
| Tastatur: Slider | FAIL (F-13) |
| Fokus sichtbar | PARTIAL — `:focus-visible` 2 px Blau (3,42 : 1 auf Schwarz, Grenzwert 3,0 ✓); unsichtbare Service-Links (F-09) |
| Skip-Link | FAIL (F-15) |
| ARIA | FAIL (F-14) |
| Labels/Formular | PARTIAL — Labels ✓, required ✓, Fehler-Semantik ✗ (F-51) |
| Alt-Texte | PASS |
| Kontrast Dark | FAIL (F-12) · Light: PASS |
| Reduced Motion | PASS (CSS + JS) |
| Zoom | PASS (kein `maximum-scale`) |
| Touch-Target 24×24 | FAIL (F-13) |
| Auto-Play Pause | FAIL (F-52) |
| Statusmeldungen | FAIL (Formular, F-51) |
| Screenreader-Test | NOT VERIFIED (manuell) |

### 5.11 Security
| Prüfpunkt | Status |
|---|---|
| HTTPS/TLS/HSTS | NOT VERIFIED (neuer Host) / Live heute: HTTP ohne Redirect → FAIL |
| CSP, XCTO, Referrer, Permissions, Frame | FAIL (F-05) |
| Cookies | N/A (keine) |
| XSS | PASS — kein `innerHTML` mit Nutzerdaten (`innerHTML` nur für statische SVG in `main.js:39`); URL-Parameter `?bewerbung=` wird nur in `.value`/`.textContent` geschrieben ✓ |
| CSRF/Injection/Open Redirect | N/A heute; nach Backend: CSRF-Token/Origin-Check, Input-Limits |
| Secrets im Frontend | PASS (keine) |
| Source Maps | N/A |
| Dependencies | N/A (keine) |
| Upload | N/A |
| Rate Limiting / Spam | FAIL (F-11) |
| Fehlerseiten/Stack Traces | N/A (statisch) |
| Interne Dateien | FAIL (F-10) |

### 5.12 Privacy & Compliance (technisch; **juristische Punkte markiert**)
- Impressum: inhaltlich vollständig (Inhaber, HRA, USt-ID, Aufsicht, Kammer, § 34a, Versicherung, MStV) — **aber Standort-Widerspruch F-07 (juristisch)**. Verweist noch auf „TMG" (seit 05/2024 DDG) — **juristisch prüfen**.
- Datenschutz: F-23 (Hosting, localStorage, Formular-Dienstleister, Unsplash) — **juristisch**.
- Consent: PASS — keine Tracker/Cookies → kein Banner nötig (Rechtsauffassung).
- Fonts self-hosted ✓, keine Embeds ✓, Maps nur Links ✓.
- Formular: Einwilligungs-Checkbox ✓, Datensparsamkeit ✓; Bewerbungsdaten (Art. 88 DSGVO/§ 26 BDSG) — Hinweis auf unverschlüsselte Mail vorhanden ✓.

### 5.13 Analytics & Measurement
Status: **kein Tracking** — bewusst, DSGVO-freundlich, aber keine Erfolgsmessung. Empfehlung: **Vercel Web Analytics** oder **Plausible (EU)** — cookielos, consent-frei (Rechtsauffassung prüfen), Datenschutztext ergänzen. Plus Google Search Console (kostenlos, Pflicht).

**Measurement Plan**
| Event | Trigger | Parameter | Business-Zweck |
|---|---|---|---|
| `page_view` | Seitenaufruf | path, referrer, theme | Traffic-Basis, Ratgeber-Reichweite |
| `cta_click` | Klick `.btn-primary/.nav-cta/.cta-actions a` | label, page, position (hero/cta/nav) | CTA-Wirksamkeit je Seite |
| `phone_click` | Klick `a[href^="tel:"]` | number (24h vs HQ), page | Wichtigster Lead-Kanal (Detektei = Anruf) |
| `email_click` | Klick `mailto:` | page | Sekundärkanal |
| `form_start` | erster Fokus im Formular | page, bewerbung=true/false | Funnel-Einstieg |
| `form_error` | Validierungsfehler | field | Friction |
| `form_submit` | erfolgreicher POST | type (anfrage/bewerbung), betreff | **Conversion** |
| `form_fail` | Backend-Fehler | code | Zustell-Monitoring |
| `map_click` | Maps-Link | location | Standort-Interesse |
| `service_card_click` | Leistungs-Card | service | Navigationspfad Start → Leistung |
| `js_error` | `window.onerror` | message, page | Robustheit (F-08) |

### 5.14 UX / UI (Enterprise Review)
- **Stärken:** klare, ruhige Marke (Cormorant + Barlow, Königsblau), einheitliches Seitenraster (Page-Hero → Content → FAQ → Ratgeber → CTA), konsistente Komponenten, Dark/Light sauber, CTA-Hierarchie (Primary Blau / Ghost), 24h-Nummer omnipräsent.
- **Schwächen:** Bild-Slider-Inflation (18 Slides auf der Startseite — wirkt unruhig, kostet Perf); Stock-Fotos statt echter Menschen/Orte (Trust); 10–11 px Versal-Labels (F-53); Service-Links unsichtbar (F-09); Kontrast Dark (F-12); Startseiten-Stats mit „∞" (F-24); Kontakt-Seite: Formular links, Info rechts ✓, aber kein Hinweis auf Reaktionszeit/Erreichbarkeit (Öffnungszeiten fehlen überall).
- Brand respektiert; keine Neugestaltung nötig. Änderungen begründet über Conversion/A11y.

### 5.15 Conversion
Journeys: (1) Privatperson mit Verdacht → Start/Ratgeber → detektei → Anruf/Formular. (2) Unternehmen → objektschutz/video → Formular. (3) Bewerber → karriere → kontakt?bewerbung. (4) Kursinteressent → akademie → Kontakt.
Abbruchpunkte: Formular sendet nicht (**alle Journeys**); Service-Cards auf Mobile ohne sichtbaren Link (Journey 1/2); keine Erreichbarkeitszeiten/Reaktionszusage; Akademie ohne Termine („auf Anfrage"); keine Referenzen/Testimonials (bewusst: Diskretion — stattdessen Zertifikate/Verbände ✓, nicht faken). Primary/Secondary CTA je Seite klar ✓. Empfehlung: Sticky-Mobile-Call-Bar (24h) unten, „Rückruf vereinbaren" führt heute auf dasselbe Formular ohne Rückruf-Feld (Feld „Telefon" + Wunschzeit ergänzen).

### 5.16 Content
Sprache professionell, präzise, kaum Buzzwords; Rechtstexte mit Disclaimer ✓; Preise bewusst weggelassen ✓. Fehler: F-06 (PKS), F-07/F-26 (Standorte/Jahr), F-34 (Anführungszeichen), 2 Descriptions > 160 Zeichen. Rechtschreibung/Grammatik: manuelle Stichprobe (7 Seiten) ohne Befund; vollständige Lektorat-Prüfung NOT VERIFIED. Firmenname konsistent „Detektei Security Service Pappenberger" (Impressum: „DETEKTEI-SECURITY-SERVICE JÖRG PAPPENBERGER e. K." = Rechtsträger, ok).

### 5.17 Code Quality
Einfach, robust, keine Abhängigkeiten ✓; keine `console.log` ✓; IIFE/strict ✓; Duplikate: Header/Footer/Nav in 19 Dateien hart kopiert (Änderung = 19 Edits; Fehleranfällig — siehe F-47 als Symptom). Empfehlung nach Launch: minimaler Build (z. B. Eleventy oder ein Node-Script mit Partials) → auch Minify/Hashing. Inline-Styles (F-31), reset-Duplikat (F-30), fehlende Fehlerisolation (F-08). Kein Typecheck/Lint möglich (kein Tooling) → html-validate liefert 527 Meldungen, davon 459 kosmetisch (tel-nbsp).

### 5.18 Production Readiness
Build: N/A (statisch). Env/Secrets: keine im Frontend ✓. Deploy: FAIL (F-02, F-03, F-10). Monitoring/Error-Tracking: keins (Vercel Logs + UptimeRobot + `js_error`-Event empfohlen). Rollback: Vercel Instant Rollback (nach Setup). Cache/CDN: Vercel Edge (nach Setup), Cache-Header zu definieren. DNS/SSL: Umzug von IONOS nötig; Apex heute tot. Backups: Git = Backup nach F-02. Health-Check: N/A.

### 5.19 Failure Testing (code-basiert)
| Szenario | Verhalten | Status |
|---|---|---|
| JS-Fehler vor Init / Storage blockiert | Inhalt unsichtbar, Nav tot | FAIL (F-08) |
| JS deaktiviert | dito; Formular GET mit PII | FAIL (F-08/F-49) |
| Unsplash nicht erreichbar | Hero/BG schwarz, Layout bleibt (Overlays) | PARTIAL |
| Bild fehlt (lokal) | Alt-Text, Cert-Box 76 px bleibt | PASS |
| Formular ungültig | Inline-Fehler | PASS (A11y F-51) |
| Formular doppelt absenden | Button disabled nach „Erfolg" | PASS (aber kein Versand) |
| Reload während Submit | N/A heute | NOT VERIFIED nach Backend |
| Langsames Netz | Fonts swap ✓, Reveal wartet auf IO ✓, Hero 14 s | FAIL (F-04) |
| 404 | Host-Default | FAIL (F-17) |

### 5.20 SEO Content-Gap (begründete Vorschläge, keine Blindproduktion)
| Seite | Intent | Begründung | Kannibalisierung |
|---|---|---|---|
| `wirtschaftsdetektei.html` | B2B kommerziell | Heute nur H3 in detektei; eigener Suchraum (Compliance, Mitarbeiterdiebstahl, Lohnfortzahlung) mit anderer Zielgruppe (Geschäftsführung/HR) | gering, wenn detektei auf Privat fokussiert |
| `wissenswertes/lohnfortzahlungsbetrug.html` | informational B2B | in FREIGABE bereits geplant; hohes Anwalts-/HR-Interesse; verlinkt Wirtschaftsdetektei | keine |
| `wissenswertes/observation-ablauf.html` | informational | „Wie läuft eine Observation ab" ist häufigste Vorfrage; in 3 Seiten angerissen | keine |
| `baustellenbewachung.html` | lokal-kommerziell | im Ticker beworben, keine Seite; eigener Intent (Bauunternehmen) | gering ggü. objektschutz (dort H3) |
| Standortseiten Nürnberg/Merseburg | lokal | **nur** wenn dort reale, besetzte Büros (F-07 klären); sonst Thin/Doorway-Risiko | mittel |
| `akademie/34a-unterrichtung.html` vs. `-sachkunde.html` | kommerziell | zwei unterschiedliche Suchintents (40-h-Unterrichtung vs. IHK-Prüfung) auf einer Seite; Termine/Preise „auf Anfrage" schwächen | mittel → nur mit Terminen/Konditionen |
| `ueber-uns.html` | Trust | Kein Team/Geschichte außerhalb News; E-E-A-T (Inhaber, Qualifikationen, seit 1995) | keine |

### 5.21 Favicon / Brand / SERP — PARTIAL (F-18, F-42). OG-Bild 1200×630 ✓, `og:image:width/height` ✓, `theme-color` ✓ je Schema.

### 5.22 E-Mail / Form Delivery — FAIL (Kette bricht bei „Backend")
Soll-Kette: User → Frontend-Validierung → POST `/api/contact` (Honeypot, Turnstile, Limits) → Mailversand (Resend/M365-SMTP) mit `From: no-reply@detektei-weltweit.de`, `Reply-To: <Absender>` → Empfänger (`info@sicherheitszentrale-muc.de`?) → Success-State + Bestätigungsmail an Absender (optional) → Event `form_submit`. DNS: SPF (Provider-Include), DKIM, DMARC (F-38). Fehlerzustände: 4xx (Validierung), 429 (Rate-Limit), 5xx (Mail-Provider) → jeweils sichtbare Meldung mit 24h-Nummer als Fallback.

---

## 6. Go-Live Entscheidungsmatrix

**MUST FIX BEFORE LAUNCH**
F-01 Formular-Backend · F-02 Commit/Push · F-03 Hosting-Config + Redirects + 404 · F-04 Unsplash raus / Bilder self-hosted · F-05 Security-Header · F-06 PKS-Zahlen · F-07 Standorte/Impressum · F-08 JS-Robustheit · F-09 Service-Links sichtbar · F-10 Deploy-Ausschluss · F-11 Spam-Schutz · F-23 Datenschutztext (mit Anwalt) · F-49 POST · F-16 index.html-Redirect · Freigabe-Kommentare entfernen.

**SHOULD FIX BEFORE LAUNCH**
F-12 Kontrast Dark · F-13 Slider-Tastatur/Touch · F-14 ARIA · F-15 Skip-Link · F-17 404 (in F-03) · F-18 Favicons · F-19 H1/Title · F-20 Perf-Feinschliff (Critical CSS, Minify, Logo, Cache) · F-26 Standort-Anzahl/Badge · F-38 DMARC/DKIM · F-47 Mobile-Nav Legal · F-51 Formular-A11y · F-52 Pause-Button.

**POST-LAUNCH IMPROVEMENTS**
F-21 FAQ-Schema · F-22 LocalBusiness-Felder · F-24 Kennzahlen · F-27 nbsp · F-30 reset.css · F-31 Inline-Styles → CSP ohne unsafe-inline · F-32 svh · F-33 prefix · F-34 Typografie · F-40 README · F-42 OG-Bilder · F-44/48/50/53/54/55 · Analytics-Einführung · Content-Gap-Seiten · Build-System mit Partials.

---

## 7. Execution Roadmap

| Phase | Tasks (Reihenfolge) | Dateien | Abhängigkeit | Exit Criteria |
|---|---|---|---|---|
| **0 Blocker-Vorbereitung** | F-10 Ignore-Regeln; Root-JPG/PDF verschieben; Freigabe-Kommentare entfernen; F-02 Commit + Push + PR | `.gitignore`, `.vercelignore`, alle | — | frischer Clone = Working Tree; `git status` clean |
| **1 Functional & Production** | F-03 `vercel.json` (redirects, cleanUrls:false), `404.html`; Vercel-Projekt anlegen, Preview-Deploy; F-16 Links `index.html`→`/`; F-08 safeStorage + `.js`-Gating; F-09; F-47 | `vercel.json`, `404.html`, `js/main.js`, `css/main.css`, 19 HTML | Phase 0 | Preview: alle 19 Seiten 200, `/index.html`→308, `/nope`→Custom-404, JS-aus zeigt Inhalte |
| **2 Formular** | F-01 Backend (`api/contact.js` oder Web3Forms), F-11 Honeypot+Turnstile+Rate-Limit, F-49 POST, F-51 A11y-Fehler, F-38 DNS (SPF/DKIM/DMARC) | `kontakt.html`, `js/main.js`, `api/`, DNS | Phase 1, Kunde (Zieladresse) | Testmail zugestellt (Inbox, nicht Spam); Fehlerpfade sichtbar; 2× Submit = 1 Mail |
| **3 Security** | F-05 Header in `vercel.json`, CSP-Hash für Inline-Script; F-37 Secret-Check | `vercel.json` | Phase 2 (connect-src), Phase 4 (img-src) | securityheaders.com ≥ A; 0 CSP-Violations auf 19 Seiten × 2 Themes |
| **4 Privacy & Bilder** | F-04 Fotos beschaffen (Kunde), AVIF/WebP, Preload Slide 1, Slider reduzieren; F-23 Datenschutztext (Anwalt); Impressum DDG-Check | `css/main.css`, `index.html`, `assets/images/`, `datenschutz.html`, `impressum.html` | Kunde, Anwalt | `grep unsplash` = 0; DevTools nur First-Party; Anwaltsfreigabe |
| **5 Content/Daten** | F-06 PKS; F-07 NAP + JSON-LD; F-26 Badge/„vier Standorte"; F-19 H1/Title; Descriptions kürzen | `index.html`, `kontakt.html`, `impressum.html`, `news/*`, `assets/images/logo-badge.svg`, 9 JSON-LD | Kundenfreigabe | Rich-Results-Test grün; Freigabeprotokoll |
| **6 SEO/Google** | F-18 Favicons/Manifest; F-22 LocalBusiness `@id`/`sameAs`; sitemap `lastmod` aktualisieren; GSC-Property prüfen | `<head>` 19×, `site.webmanifest`, `sitemap.xml` | Phase 5 | Rich-Results-Test, Sitemap valid |
| **7 Performance** | F-20 Critical CSS, Minify, Logo-Optimierung, Cache-Header, Font-Trim | `css/`, `js/`, `vercel.json`, `assets/` | Phase 4 | Lighthouse mobil ≥ 90 / LCP < 2,5 s auf 3 Kernseiten |
| **8 Accessibility** | F-12 Tokens; F-13/F-52 Slider-Buttons + Pause; F-14 ARIA; F-15 Skip-Link; F-53 Mindestgrößen | `css/main.css`, `js/main.js`, 19 HTML | Phase 1 | axe 0 Verstöße beide Themes; Tastatur-Durchlauf protokolliert |
| **9 Analytics** | Provider wählen, Events aus §5.13, Datenschutztext | `js/main.js`, `datenschutz.html` | Phase 4 (Anwalt) | Events sichtbar im Dashboard |
| **10 Final QA** | Regressions-Audit (dieses Dokument erneut), Cross-Browser (Safari iOS/macOS, Chrome Android, Firefox, Edge), Screenreader-Stichprobe (VoiceOver), Lighthouse, Link-Crawl, Rich-Results | — | alle | Scorecard ohne FAIL in Functional/Security/Privacy/Production |
| **11 Launch** | Checkliste §8 | DNS | Phase 10 | siehe §8 |
| **12 Post-Launch** | §9 | — | Launch | — |

---

## 8. Launch Day Checklist

- [ ] `main` enthält finalen Stand; Vercel-Production-Deploy grün; Preview vorher abgenommen
- [ ] Domain `www.detektei-weltweit.de` in Vercel primär; Apex hinzugefügt mit Redirect → www
- [ ] DNS bei IONOS: `www` CNAME → `cname.vercel-dns.com`, Apex A `76.76.21.21` (TTL vorher auf 300 s senken); MX/SPF/TXT (GSC, Zoho, MS) **unverändert** lassen
- [ ] SSL aktiv (Vercel auto), `curl -I http://detektei-weltweit.de` → 308 → `https://www…` → 200
- [ ] Redirects: `/index.html`→`/`; keine Ketten (`curl -IL` max. 1 Hop)
- [ ] `robots.txt` erreichbar, kein `noindex` außer Impressum/Datenschutz, `sitemap.xml` 200 mit aktuellem `lastmod`
- [ ] Security-Header live (securityheaders.com), 0 CSP-Fehler in Konsole
- [ ] `/FREIGABE.md`, `/docs/`, `/seo-tool/.env` → 404
- [ ] Formular: 1 echte Testanfrage + 1 Bewerbung → Zustellung + Reply-To korrekt; Spam-Ordner geprüft; Honeypot-Test
- [ ] tel:-Links auf iPhone/Android angetippt (24h, HQ, Büro Ost)
- [ ] 404-Seite, Dark + Light, Mobile-Nav auf 3 Seiten
- [ ] Lighthouse mobil auf Prod-URL (index/detektei/kontakt) ≥ 90
- [ ] Rich-Results-Test für index, detektei, akademie, 1 Artikel
- [ ] Search Console: Property bestätigt (DNS-TXT vorhanden), Sitemap eingereicht, URL-Prüfung + „Indexierung beantragen" für Start + 6 Leistungen
- [ ] Analytics-Events feuern (falls eingeführt); UptimeRobot-Monitor (60 s) auf `https://www…/` und `/kontakt.html`
- [ ] Alte IONOS-Seite: nach 48 h DNS-Propagation abschalten; Backup ziehen
- [ ] Rollback getestet: Vercel „Instant Rollback" auf vorherigen Deploy (Dummy-Deploy vorher)

## 9. Post-Launch Monitoring

**+1 h:** Alle 19 URLs 200 (Crawler-Script); HTTP→HTTPS, Apex→www; Formular-Testmail; Konsole ohne Fehler; GSC „URL-Prüfung" auf Start = „URL ist bei Google"-Anfrage gestellt; Uptime-Monitor grün.
**+24 h:** Vercel-Logs (4xx/5xx), Formular-Eingänge vs. Events, GSC Crawling-Statistik (Fehler 0), DNS weltweit propagiert (dnschecker), Spam-Aufkommen, CrUX noch leer (normal).
**+7 Tage:** GSC Seitenindexierung (17 indexiert, 0 „Duplikat ohne Canonical"), Sitemap-Status, CWV-Bericht (Felddaten beginnen), erste Rankings (Detektei München, Objektschutz München, §34a München), 404-Report, Formular-Zustellrate 100 %, DMARC-Reports.
**+30 Tage:** Rankings/Klicks/Impressions je Landingpage, Conversion-Rate (Anrufe + Formulare / Sessions), CWV-Felddaten „gut" auf allen 3 Metriken, Ratgeber-Traffic, Content-Gap-Seiten priorisieren, Security-Header-Recheck, Dependency-/Config-Review, Logo-Badge/Fotos-Nachlieferung abgeschlossen.

## 10. Google Search Console Readiness
Verifikation: DNS-TXT `google-site-verification=…` existiert → Domain-Property möglich (Status NOT VERIFIED). Nach Launch: Sitemap einreichen, URL-Prüfung Kernseiten, Berichte „Seitenindexierung", „Core Web Vitals", „Verbesserungen: Breadcrumbs/FAQ", „Sicherheit & manuelle Maßnahmen" wöchentlich; E-Mail-Benachrichtigungen aktivieren; Google-Business-Profil mit identischer NAP verknüpfen.

## 11. Verifikationsstatus (Abgrenzung)
- **Technisch verifiziert:** Quelltext, Links, Meta, JSON-LD-Syntax, Kontraste (berechnet), Lighthouse (3 Seiten), html-validate, DNS/HTTP Live-Domain, PKS-Abgleich.
- **Code-verifiziert, nicht im Browser:** Tastatur/Fokus, Mobile-Nav, JS-Ausfall, Overflow je Breakpoint, Safari-Rendering.
- **Extern zu verifizieren:** Unsplash-Lizenz, GSC-Property, DKIM, seo-tool-Secrets, Rechtsfragen (Impressum/DDG, Datenschutz, Consent-Freiheit von localStorage/Analytics).
- **Nach Deployment:** Header, Redirects, TLS, 404, Formular-Zustellung, Cache.
- **Nur mit echten Nutzerdaten:** CWV-Felddaten, Rankings, Conversion-Raten.

## 12. Fortune-500-Qualitätsgate — Antwort
**Nein, noch nicht.** Engineering-Basis und SEO-Struktur sind auf professionellem Niveau. Verhindernd sind operative Defizite (kein Deploy-Stand, kein funktionierendes Formular, keine Hosting-Härtung), messbare Qualitätsdefizite (LCP 14 s mobil, Kontrast, Slider-A11y) und Glaubwürdigkeitsfehler (falsche Statistik mit Behördenquelle, widersprüchliches Impressum). Nach Abarbeitung von MUST + SHOULD (§6) und dem Regressions-Audit ist ein GO realistisch.
