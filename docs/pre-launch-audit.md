# Pre-Launch-Audit — detektei-weltweit (Detektei Pappenberger)

**Stand:** 2026-07-16 · **Branch:** `feature/dark-light-mode` · **Methodik:** read-only Analyse (3 parallele Explore-Agenten + manuelle Checks). Es wurde **kein Code geändert und nichts deployed**. Die eigentlichen Fixes sind ein separater Folgeauftrag.

**Getroffene Entscheidungen (Kundenrückfrage):** Hosting = **Vercel / Static-Host**. Formular-Backend = **später** (Optionen unten, Empfehlung Web3Forms _oder_ Vercel Serverless Function).

---

## 1. Executive Summary

**Gesamtreifegrad: ~70 %.** Frontend, Inhalt und technisches SEO sind auf Launch-Niveau. Die verbleibenden Lücken liegen ausschließlich bei **Formular-Funktion, Datenschutz (externe Bilder), Deploy-Konfiguration und Security-Headern** — alle klar umgrenzt und vor dem Launch behebbar. Keine Grundsatz- oder Architekturprobleme.

**Kann die Seite aktuell live gehen? Nein — CONDITIONAL GO.** Vier Blocker müssen zuerst behoben werden (siehe §5).

### Score-Zusammensetzung (gewichtet nach Launch-Kritikalität)

| Bereich | Reife | Kommentar |
|---|---|---|
| Inhalt & Copy | 90 % | Sauber; offen: Gründungsjahr 1995/1996, Preisspanne-Freigabe, PLZ-/Telefon-Typos |
| Technisches SEO | 92 % | Canonicals, JSON-LD, Sitemap, robots — sehr gut; kleinere NAP-/Favicon-Lücken |
| Frontend/Design/UX | 90 % | Poliert, Dark/Light sauber, FOUC-frei |
| Barrierefreiheit | 80 % | Gute Semantik; Heading-Sprung, `prefers-reduced-motion` fehlt, Kontraste prüfen |
| Datenschutz/DSGVO | 55 % | Kein Tracking/Consent nötig = gut, ABER ~20 Unsplash-Hotlinks undokumentiert |
| Security (Infra) | 30 % | Keine Security-Header, keine Host-Konfig |
| Formular-Funktion | 20 % | Formular sendet NICHTS (nur Fake-Erfolgsmeldung) |
| Deploy/Infra | 40 % | Keine Konfig; gesamte Arbeit unkommittiert |
| Performance | 75 % | Self-hosted Fonts gut; 20 externe Hero-Bilder + kein WebP schaden LCP |

**Größte Risiken:** (1) Leads gehen verloren (Formular ohne Backend), (2) DSGVO-Abmahnrisiko durch externe Bild-CDN ohne Hinweis/Einwilligung, (3) Datenverlust bzw. altes Deployment durch unkommittierte Arbeit, (4) fehlende Security-Header.

**Bereits gut umgesetzt:** Kein Tracking, keine Cookies, keine externen Skripte, Fonts self-hosted; saubere semantische HTML-Struktur; vollständige & konsistente Canonicals/Sitemap/robots; umfangreiches strukturiertes Markup (Service/LocalBusiness/Article/FAQ/Breadcrumb); rechtlich vollständiges Impressum (§5 TMG) und strukturierte Datenschutzerklärung; FOUC-freier Dark/Light-Modus; keine Secrets im ausgelieferten Code.

---

## 2. Technische Architektur

- **Typ:** rein statische Website. Kein Framework, kein Build-System, kein Backend, keine Datenbank, kein Paketmanager im ausgelieferten Teil.
- **Stack:** HTML5 (19 Seiten: 13 Root + `wissenswertes/`×4 + `news/`×2), ein CSS (`css/main.css` ~1035 Zeilen + `css/reset.css` 54 Zeilen), ein JS (`js/main.js`, 334 Zeilen, IIFE, `'use strict'`).
- **Rendering:** statisch ausgeliefert; clientseitiges JS nur zur Progressive Enhancement (Nav, Slideshows, Scroll-Reveal, Counter, Formular-Validierung, Theme-Toggle). Inhalte liegen ohne JS im HTML vor → suchmaschinen- und screenreader-freundlich.
- **Externe Laufzeit-Abhängigkeiten:** genau eine Kategorie — `images.unsplash.com` (19 CSS-Hintergrundbilder + 1 Inline-`<img>`). Sonst nichts: keine Analytics/Tag-Manager/Pixel, keine externen Fonts/CDNs, keine iframes/Embeds. Google Maps nur als anklickbare Links (`rel="noopener noreferrer"`, neues Fenster).
- **Datenfluss:** aktuell keiner. Kontaktformular wird per `e.preventDefault()` abgefangen und sendet nichts. Theme-Präferenz in `localStorage['dp-theme']` (first-party, funktional).
- **Deployment-Modell:** noch nicht konfiguriert; lokal nur `python3 -m http.server` (Preview). **Entschieden: Vercel/Static-Host** → git-basiertes Deploy, Auto-HTTPS/HSTS, Header/Redirects via `vercel.json`. Vorteil ggü. rsync: gitignorierte Pfade (`seo-tool/`) werden automatisch **nicht** deployed.
- **Nebenprojekt `seo-tool/`:** separates FastAPI-Keyword-Tool (DataForSEO/OpenAI/GSC), git-ignored & untracked, `.env` enthält nur Platzhalter (keine Live-Secrets). Nicht Teil der Website.

**Verzeichnisübersicht:** `/*.html` Seiten · `css/` Styles · `js/` Verhalten · `assets/images/` Logos/Zertifikate/OG-Bild · `assets/fonts/` self-hosted woff2 (12 Dateien) · `news/` + `wissenswertes/` Artikel · `seo-tool/` internes Tool (nicht ausliefern) · `robots.txt` + `sitemap.xml`.

---

## 3. Festgestellte Probleme

Priorität: **P0** kritischer Go-live-Blocker · **P1** vor Launch beheben · **P2** vor/kurz nach Launch · **P3** Optimierung · **P4** optional.

| ID | Kategorie | Titel | Datei / Stelle | Auswirkung | Wahrsch. | Prio |
|---|---|---|---|---|---|---|
| **A1** | Funktion | Kontaktformular ohne Backend — sendet nichts, zeigt Fake-Erfolg | `kontakt.html:167` (kein `action`), `js/main.js:301-308`, Kommentar `js/main.js:302` | Leads gehen still verloren; Nutzer getäuscht („Wir melden uns zeitnah") | Sicher | **P0** |
| **A2** | Deploy/Git | Gesamte finale Arbeit unkommittiert; Branch trügerisch | 16 modif. + untracked `assets/`,`news/`,`wissenswertes/`,`FREIGABE.md`,`PHOTO-…jpg`; `feature/dark-light-mode` ↔ `main` = nur robots+sitemap | Clean-Checkout/Deploy liefert alte, fehlerhafte Version (FOUC, Theme-Force-Persist-Bug) + verliert Unterseiten/Assets | Hoch (bei Deploy) | **P0** |
| **A3** | Datenschutz | ~20 Unsplash-Bilder laden ohne Einwilligung/Hinweis von US-CDN | `css/main.css:280-284,477-480,502-504,521-523,577-579` (19 Backgrounds) + `index.html:182` (Inline) | IP-Übermittlung an Dritten, in `datenschutz.html` nicht abgedeckt → Abmahnrisiko; zusätzlich Perf-/Ausfallrisiko | Mittel | **P1** |
| **A4** | Security | Keine Security-Header konfiguriert | keine `vercel.json`/`_headers`/Meta | Kein Clickjacking-/MIME-/XSS-Härtungsschutz (CSP/HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy fehlen) | Niedrig–Mittel | **P1** |
| **A5** | Deploy/Sicherheit | Interne Dateien könnten mitpubliziert werden | `FREIGABE.md`, `seo-tool/` (SQLite-DB, `.env`), `PHOTO-…jpg` | Interna/interne Checkliste öffentlich erreichbar | Mittel | **P1** |
| **B1** | Daten | Falsche PLZ Merseburg `86217` (korrekt `06217`) | `index.html:394`, `index.html:398` (Maps-Link), `kontakt.html:236` | Falsche Adresse, falscher Maps-Link, lokales SEO | Sicher | **P2** |
| **B2** | Daten | Defekter `tel:`-Link (fehlende Ziffer): `tel:+493461249254` vs. Anzeige `+49 (0) 3461 2492544` | `index.html:396`, `kontakt.html:237` | Klick wählt falsche/unvollständige Nummer | Sicher | **P2** |
| **B3** | Daten/SEO | NAP-Inkonsistenz: JSON-LD `telephone +4989720150030` vs. 24h-Nr. `+498974127886` | alle 9 Business-Seiten, z.B. `index.html:45`, `kontakt.html:44` (LocalBusiness) vs. `56` (ContactPoint) | Google-NAP-Matching/Rich-Results-Warnungen | Sicher | **P2** |
| **B4** | Inhalt | Gründungsjahr 1995 (Text) vs. „SEIT 1996" (Logo-Badge) | site-weit vs. `assets/images/logo-badge.svg`; `FREIGABE.md` | Widersprüchliche Kernaussage | Sicher | **P2** |
| **B5** | Spam | Formular ohne Spam-Schutz (kein Honeypot/Captcha) | `kontakt.html` Form | Nach Backend-Anbindung Missbrauch/Spam-Mails | Mittel | **P2** |
| **B6** | Inhalt | Kriminalstatistik-Zahlen hardcodiert (`133882, 95210, 217654, 156030`) | `js/main.js:257-260` | Ggf. veraltet/unbelegt | Mittel | **P2** |
| **C1** | SEO/Icons | Favicon-/PWA-Lücken: nur SVG-Icon, kein `apple-touch-icon`, kein PNG-Fallback, kein `site.webmanifest` | alle Seiten `<head>` | iOS-Homescreen/ältere Crawler ohne Icon | Sicher | **P3** |
| **C2** | A11y | Heading-Sprung h2→h4 (h3 übersprungen) | `index.html` (Statistik/Feature-Block) | Screenreader-Semantik | Sicher | **P3** |
| **C3** | A11y | Kein `prefers-reduced-motion` für Auto-Slideshow/Counter | `js/main.js` (Hero/BG-Slideshow, Counter), `css/main.css` | Nutzer mit Bewegungsempfindlichkeit | Sicher | **P3** |
| **C4** | Perf | Keine modernen Bildformate (nur JPG/PNG/SVG) | `assets/images/*` | Größere Downloads, schwächere LCP | Sicher | **P3** |
| **C5** | SEO/Social | Generisches OG-/Article-Bild überall gleich | alle Seiten + Article-`ImageObject` (`assets/images/og-image.png`) | Schwächere Social-CTR | Sicher | **P3** |
| **C6** | Perf | 20 Hero-/BG-Bilder in voller Auflösung (auch nach Self-Host viele große Bilder) | `css/main.css` Slides | LCP/Bandbreite | Sicher | **P3** |
| **D1** | SEO | Uneinheitliche Title-Brand-Suffixe (5 Varianten) | alle `<title>` | Markenkonsistenz | Sicher | **P4** |
| **D2** | Datenschutz | `mailto:info@…` unobfusziert (Spam-Harvesting) | `impressum.html:86`, `datenschutz.html:79` | Mehr Spam (im Impressum rechtlich nötig) | Mittel | **P4** |
| **D3** | SEO | „München"-Branding vs. `addressLocality: Neuried` in JSON-LD | alle Business-JSON-LD | Schwächeres München-Lokalsignal | Sicher | **P4** |
| **D4** | Doku | Kein README/Deploy-Doku | Repo-Root | Wartbarkeit | Sicher | **P4** |

**Rechtlich zu prüfen (kein Rechtsrat — nur markiert):** Unsplash-Bildnutzung/-Lizenz & DSGVO-Abdeckung (A3); Preisaussagen & rechtliche Aussagen in `wissenswertes/` (siehe `FREIGABE.md`); Vollständigkeit der Datenschutzerklärung nach finaler Technik.

---

## 4. Risikomatrix

| Risiko | Wahrsch. | Auswirkung | Stufe | Gegenmaßnahme | Bereich |
|---|---|---|---|---|---|
| Kontaktanfragen gehen verloren (Formular tot) | Hoch | Hoch | **Kritisch** | Backend anbinden + Zustellung testen (A1) | Dev |
| DSGVO-Abmahnung wg. externem Bild-CDN | Mittel | Hoch | **Hoch** | Unsplash self-hosten (A3) | Dev/Recht |
| Deploy liefert alte Version / Datenverlust | Hoch (bei Deploy) | Hoch | **Hoch** | Alles committen vor Deploy (A2) | Dev |
| Interne Dateien öffentlich (FREIGABE/seo-tool) | Mittel | Mittel–Hoch | **Hoch** | git-Deploy + `.gitignore` verifizieren (A5) | DevOps |
| Fehlende Security-Header ausgenutzt | Niedrig–Mittel | Mittel | **Mittel** | `vercel.json`-Header-Set (A4) | DevOps |
| Falsche Adresse/Telefon (PLZ, tel, NAP) | Sicher | Mittel | **Mittel** | Daten korrigieren (B1–B3) | Inhalt |
| Unsplash entfernt/limitiert Bilder → Layout kaputt | Mittel | Mittel | **Mittel** | Self-Host (A3) beseitigt Abhängigkeit | Dev |
| Spam-Flut nach Formular-Livegang | Mittel | Niedrig–Mittel | **Mittel** | Honeypot/Captcha (B5) | Dev |
| Schwache LCP durch große Bilder | Mittel | Niedrig | **Niedrig** | WebP + Kompression (C4/C6) | Perf |

---

## 5. Go-live-Blocker

Nur diese Punkte verhindern den Launch:

1. **A1 — Kontaktformular anbinden.** Ohne Backend keine Anfragen → Kerngeschäft. Backend wählen (Empfehlung: Web3Forms-Endpoint _oder_ Vercel Serverless Function `/api/contact` + Mailversand z.B. via Resend/SMTP), `action`/`fetch` einbauen, echte Zustellung + Erfolg-/Fehler-States testen. Fake-Erfolgsmeldung (`js/main.js:303-306`) durch echten Flow ersetzen.
2. **A2 — Alles committen & pushen.** Finale Theme-Arbeit + alle Unterseiten + `assets/` sind unkommittiert; Vercel deployt nur Committetes. Ohne diesen Schritt liefert der erste Deploy die alte, fehlerhafte Version.
3. **A3 — Unsplash-Bilder self-hosten.** 20 externe Bilder lokal ablegen und CSS/HTML umstellen; behebt DSGVO- **und** Ausfall-/Perf-Risiko. Minimum-Alternative: in Datenschutzerklärung sauber deklarieren — Self-Host ist klar vorzuziehen.
4. **A4 — Security-Header + HTTPS-Erzwingung** via `vercel.json`. HSTS ist auf Vercel automatisch; CSP muss den Inline-Theme-`<script>` (jede Seite, Zeile 12) und die Inline-JSON-LD-Blöcke berücksichtigen (Nonce/Hash oder kontrolliertes `'unsafe-inline'`); `img-src 'self' data:` sobald Unsplash entfernt ist.

Zusätzlich vor Freigabe empfohlen (formal P2, aber schnell & sichtbar): **A5** (Deploy-Ausschluss verifizieren) und **B1–B4** (Daten-Typos + Gründungsjahr, letzteres mit Kundenfreigabe).

---

## 6. Umsetzungsplan (geordnet nach Phasen)

Format je Aufgabe: **Ziel · Dateien · Änderung · Prio · Abhängigkeiten · Ergebnis · Test · Rollback.** Die maschinenlesbare Vollfassung steht in `docs/pre-launch-tasks.json`.

### Phase A — Sofortige Sicherheit / Datenhoheit
- **A5 Deploy-Ausschluss.** Ziel: keine Interna publik. Dateien: `.gitignore`, optional `.vercelignore`. Änderung: `FREIGABE.md`, `PHOTO-…jpg`, `seo-tool/` sicher ausschließen (git-Deploy ignoriert Untracked/Ignored ohnehin — verifizieren). Prio P1. Abh.: —. Ergebnis: nur Website-Dateien deploybar. Test: `git ls-files` + Preview-URL auf `/FREIGABE.md`, `/seo-tool/` → 404. Rollback: n/a (Konfig).

### Phase B — Technische Stabilisierung
- **A2 Commit.** Ziel: Deploy-Konsistenz. Dateien: alle modif./untracked (außer A5-Ausschlüsse). Änderung: strukturiert committen (SEO-Daten, Theme, Content, Assets) + push. Prio P0. Abh.: A5. Ergebnis: git = Wahrheit. Test: `git status` clean; `git diff main` = vollständige Theme-/Content-Arbeit. Rollback: Branch/Revert.
- **B1/B2/B3/B4 Datenkorrekturen.** Ziel: korrekte NAP/Kerndaten. Dateien: `index.html`, `kontakt.html`, JSON-LD-Blöcke, `assets/images/logo-badge.svg`. Änderung: `86217→06217` (3×); fehlende tel-Ziffer ergänzen; eine kanonische Firmennummer festlegen (HQ vs. 24h-Hotline klar trennen); 1995/1996 vereinheitlichen (Kunde bestätigt). Prio P2. Abh.: Kundenfreigabe (B4). Ergebnis: konsistente NAP. Test: Rich-Results-Test, Maps-Link, tel-Wählprobe. Rollback: git revert.

### Phase C — Datenschutz & Tracking
- **A3 Unsplash self-hosten.** Ziel: 0 Dritt-CDN-Requests. Dateien: `css/main.css` (19 `url()`), `index.html:182`, `assets/images/`. Änderung: Bilder herunterladen (Lizenz prüfen!), als WebP + Fallback lokal ablegen, Pfade umstellen; echtes Firmenfoto (`PHOTO-…jpg`) als Hero prüfen. Prio P1. Abh.: A2. Ergebnis: keine externen Bild-Requests. Test: DevTools-Network nur First-Party; `grep unsplash` leer. Rollback: git revert.
- **Datenschutz-Text abgleichen.** Dateien: `datenschutz.html`. Änderung: nach Self-Host bestätigen, dass keine Dritt-Dienste mehr laden; `localStorage`-Theme optional erwähnen. Prio P2. Test: Text ↔ Technik deckungsgleich. **Rechtlich prüfen lassen.**

### Phase D — SEO & URLs
- **Vercel-URL-Strategie.** Ziel: keine Canonical/Sitemap-Drift. Dateien: `vercel.json`. Änderung: **`cleanUrls` NICHT aktivieren** (Canonicals/Sitemap/interne Links committen alle auf `.html`), `trailingSlash` konsistent, Redirect Apex→`www`. Prio P1. Abh.: Domain-Setup. Ergebnis: eine kanonische URL-Form. Test: `curl -I` Apex→301→www; `/seite.html` liefert 200. Rollback: Konfig zurück.
- **C1 Favicons/Manifest, C5 OG-Bilder, D1 Titles, D3 Locality.** Prio P3/P4, iterativ nach Launch.

### Phase E — Performance
- **C4/C6 Bilder.** WebP/AVIF + Kompression + `loading`/`fetchpriority` für Hero. Prio P3. Test: Lighthouse LCP < 2,5 s.
- **Font-Preloads** auf kritische Schnitte begrenzen (Preloads bereits vorhanden: `cormorant-garamond-600`, `barlow-400`). Prio P4.

### Phase F — Qualitätssicherung
- **B5 Spam-Schutz** (Honeypot + optional Captcha) zusammen mit A1. Prio P2.
- **C2 Heading-Hierarchie, C3 reduced-motion.** Prio P3.
- Manuelle Go-live-Checkliste (§7) + Lighthouse/axe/Rich-Results-Test.

### Phase G — Deployment & Go-live (Vercel)
- Vercel-Projekt mit Repo verbinden; Domain `www.detektei-weltweit.de` als primär + Apex-Redirect; HTTPS/HSTS aktiv; `vercel.json` (Header + Redirects). Prio P1. Abh.: A1–A5. Test: Preview→Prod, alle Seiten 200, Header via `curl -I`/securityheaders.com. Rollback: Vercel „Instant Rollback".

### Phase H — Monitoring nach Launch
- Siehe §9.

---

## 7. Go-live-Checkliste

**Build/Deploy**
- [ ] Working Tree committed & gepusht (A2)
- [ ] Vercel-Prod-Deploy grün, alle 19 Seiten liefern 200
- [ ] `seo-tool/`, `FREIGABE.md`, `PHOTO-…jpg` liefern 404 (A5)
- [ ] Instant-Rollback getestet

**Security**
- [ ] `vercel.json`-Header live: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy (A4)
- [ ] HTTPS erzwungen (HTTP→HTTPS 301)
- [ ] securityheaders.com Bewertung ≥ A

**Secrets**
- [ ] Keine Secrets im ausgelieferten Code
- [ ] `seo-tool/.env` nicht öffentlich erreichbar

**Datenschutz / Cookies**
- [ ] Keine externen Requests außer bewusst gewählten (Unsplash entfernt/deklariert, A3)
- [ ] Datenschutzerklärung ↔ tatsächliche Technik deckungsgleich
- [ ] Impressum & Datenschutz im Footer aller Seiten (bestätigt vorhanden)
- [ ] DSGVO-Checkbox im Formular pflicht (vorhanden)

**SEO**
- [ ] Sitemap in Google Search Console eingereicht
- [ ] robots.txt erreichbar
- [ ] Canonicals konsistent (www, https, `.html`)
- [ ] noindex nur auf Impressum & Datenschutz
- [ ] Rich-Results-Test fehlerfrei

**URLs / Weiterleitungen**
- [ ] Apex→www 301
- [ ] HTTP→HTTPS 301
- [ ] keine Redirect-Loops/-Ketten
- [ ] 404-Verhalten definiert (ggf. Custom-404-Seite)

**Formulare**
- [ ] Kontaktformular sendet real (A1)
- [ ] Erfolg-/Fehler-States sichtbar
- [ ] Zustellung/Bestätigung getestet
- [ ] Spam-Schutz aktiv (B5)

**E-Mails**
- [ ] Zustelladresse korrekt & getestet
- [ ] Absenderdomain SPF/DKIM/DMARC (falls Serverless/PHP-Mail)
- [ ] Keine Test-Empfänger im Prod-Code

**Daten**
- [ ] Merseburg PLZ 06217 (B1)
- [ ] tel-Link vollständig (B2)
- [ ] NAP/Telefon konsistent (B3)
- [ ] Gründungsjahr einheitlich (B4)

**Performance / Mobile / Accessibility**
- [ ] Lighthouse geprüft (LCP/CLS/TBT im Ziel)
- [ ] 320–1440 px ohne horizontales Scrollen
- [ ] Tastaturbedienung, sichtbarer Fokus, `prefers-reduced-motion`

**Domain / DNS / SSL / Monitoring**
- [ ] DNS auf Vercel korrekt
- [ ] SSL aktiv + Auto-Renew
- [ ] Uptime-, Fehler-, CWV-Monitoring eingerichtet (§9)
- [ ] Finale inhaltliche Kundenfreigabe (`FREIGABE.md` abgearbeitet)

---

## 8. Launch-Entscheidung

**CONDITIONAL GO.** Qualität von Inhalt, Design und technischem SEO ist launchreif. Blockiert wird der Launch ausschließlich durch klar umgrenzte, schnell behebbare Punkte.

**Bedingungen (vor Livegang zwingend):**
1. **A1** Kontaktformular real versendend + getestet.
2. **A2** gesamte Arbeit committed & gepusht.
3. **A3** Unsplash-Bilder self-hosted (oder — Minimum — datenschutzrechtlich sauber deklariert).
4. **A4** Security-Header + HTTPS-Erzwingung via `vercel.json` aktiv.
5. **A5** verifiziert, dass `seo-tool/`, `FREIGABE.md`, `PHOTO-…jpg` nicht öffentlich sind.
6. **B1–B4** Datenkorrekturen (PLZ, tel-Link, NAP, Gründungsjahr — Gründungsjahr mit Kundenfreigabe).

Nach Erfüllung dieser sechs Punkte → **GO**. P3/P4-Punkte iterativ nach Launch.

---

## 9. Monitoring-Konzept (nach Launch)

| Was | Tool (Vorschlag) | Schwellenwert / Trigger | Alarm an | Reaktion |
|---|---|---|---|---|
| Uptime | Vercel Analytics / UptimeRobot | HTTP ≠ 200 > 2 Min | Betreiber-Mail | sofort prüfen |
| HTTP-/Serverfehler | Vercel Logs | 5xx-Anstieg | Betreiber | zeitnah |
| Formular-Zustellung | Web3Forms/Provider-Dashboard bzw. Function-Logs | Fehlgeschlagene Submissions | Betreiber | tgl. Kontrolle in Anfangsphase |
| Core Web Vitals | PageSpeed/CrUX | LCP > 2,5 s | Review | wöchentlich |
| Indexierung / 404 | Google Search Console | Crawling-/Abdeckungsfehler | SEO | wöchentlich |
| SSL-/Domain-Ablauf | Vercel (SSL auto) / Domain-Registrar | < 30 Tage | Betreiber | erneuern |
| Sicherheitsvorfälle | securityheaders.com Recheck bei Deploys | Header-Downgrade | DevOps | fixen |

Nach Livegang: Sitemap in GSC einreichen, wichtige Seiten per „URL-Prüfung" indexieren lassen, erste Woche Formular-Zustellung engmaschig kontrollieren.

---

## Anhang — Positiv-Befunde (nicht zu ändern)

- Kein Analytics/GTM/Meta-Pixel/Hotjar/Matomo/Cookiebot — keine Consent-Pflicht durch Tracker.
- Fonts self-hosted (`assets/fonts/*.woff2`), keine Google-Fonts-Requests.
- Keine iframes/Embeds; Google Maps nur als Links.
- Canonicals/OG/Sitemap/robots durchgängig `https://www.detektei-weltweit.de`, konsistent, kein localhost/staging/http.
- Sitemap listet alle indexierbaren Seiten, schließt die zwei `noindex`-Rechtsseiten korrekt aus.
- Impressum §5 TMG vollständig (Inhaber, Anschrift, USt-IdNr, HR, Aufsicht, §34a/BewachV, §18 MStV-Verantwortlicher).
- Dark/Light-Modus: FOUC-freier Inline-Pre-Paint-Snippet, `localStorage`-Persistenz nur bei bewusster Wahl, respektiert `prefers-color-scheme`.
- Mobile-Nav mit `aria-expanded`, Escape-Handling, Fokus-Rückgabe; Scroll-Reveal mit IntersectionObserver-Fallback.
- Keine `console.log`/Debug-Statements, keine Secrets im ausgelieferten Code.
