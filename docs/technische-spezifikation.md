# Technische Spezifikation — detektei-weltweit.de

Stand: 2026-09-21 (Visual System v3 „Investigative Editorial Authority“) · Branch `feature/dark-light-mode` · Quelle der Wahrheit: `css/main.css`

## 1. Stack

| Bereich | Umsetzung |
|---|---|
| Seiten | 20 statische HTML-Dateien (13 Root, `news/` ×2, `wissenswertes/` ×4, `404.html`), kein Framework, kein Build |
| Styling | `css/main.css` (~48 KB roh), Custom Properties, Dark-Default + Light via `data-theme`, Sektions-Token-Override für dunkle Sektionen |
| Script | `js/main.js` (~15 KB), IIFE, Progressive Enhancement, Module isoliert: Theme, Nav, Reveal, Formular |
| Backend | `api/contact.js` (Vercel Serverless, Node 22, `nodemailer`) |
| Hosting | Vercel; `vercel.json` (Header, Redirects, Cache); Brotli |
| Fonts | 8 × WOFF2 self-hosted, `font-display: swap`, metrik-angepasste System-Fallbacks (`size-adjust`) |
| Icons/Manifest | `favicon.ico` 32, `favicon.svg`, Apple-Touch 180, PNG 192/512, `site.webmanifest` |

## 2. Gestaltungsgrammatik

| Fläche | Bedeutung | Umsetzung |
|---|---|---|
| **Light** (`--bg`) | Information, Lesen, Vergleichen | Standard-Sektionen |
| **Tint** (`--bg-2`, `.section--tint`) | leichte Gliederung | Leistungen, Standorte, Zertifikate, Seiten-Hero |
| **Dark** (`.section-dark`, `.cta-section`, `.site-footer`) | Bedeutung, Fokus, Abschluss | Statement/Statistik, CTA, Footer – in **beiden** Themes dunkel |
| **Blau** (`--brand`, `--brand-text`) | Aktion, Orientierung | Primary-Button, Textlinks, aktiver Nav-Zustand, Fokus, Eyebrow, Hairline-Akzente |

Glas (Backdrop-Blur) nur: Header im gescrollten Zustand, Dropdown, Mobile-Navigation. Keine Karten als Standard; Inhalte werden über Hairlines, Raster, Weißraum und Typografie gruppiert.

## 3. Farben

| Token | Dark (Standard) | Light | Dunkle Sektion (beide Themes) |
|---|---|---|---|
| `--bg` | `#15161b` | `#F0EEE9` | `#0c0d10` |
| `--bg-2` | `#1b1c22` | `#E7E4DE` | `#111216` |
| `--bg-3` | `#22232b` | `#DEDBD4` | `#17181d` |
| `--line` | `#30313a` | `#CFCBC1` | `#26272f` |
| `--line-strong` | `#474854` | `#AFAA9E` | `#3b3c46` |
| `--ink` (Fließtext) | `#e4e4e9` | `#1A1917` | `#e4e4e9` |
| `--ink-2` (sekundär) | `#b6b7c1` | `#3E3C39` | `#b6b7c1` |
| `--ink-3` (Meta) | `#9294a0` | `#5E5B57` | `#9a9ba7` |
| `--heading` | `#f4f4f6` | `#0A0A0B` | `#f6f6f8` |
| `--brand` (Fläche) | `#3D63B2` | `#2A4E9E` | `#3D63B2` |
| `--brand-strong` (Hover) | `#2F4F94` | `#213F82` | `#2F4F94` |
| `--brand-text` (Text) | `#86A8E8` | `#2A4E9E` | `#8FB0EA` |

Kontraste: alle Text/Grund-Kombinationen ≥ 4,5:1 (axe WCAG 2.2 AA, beide Themes, 0 Verstöße). Legacy-Aliase (`--black`, `--deep`, `--muted`, `--gold`, …) zeigen auf die neuen Tokens.

## 4. Typografie

### Schriften (`assets/fonts/`, 8 Dateien à ~23 KB)

| Rolle | Familie | Schnitt |
|---|---|---|
| Display / Hero | Cormorant Garamond | 300 |
| Sektions- und Seitenüberschriften, Einträge | Cormorant Garamond | 400 (600 nur in Ausnahmen) |
| Fließtext | Barlow | 400 (`strong` 600) |
| UI / Meta / Navigation / Buttons | Barlow Condensed | 600 (500 Mobile-Sub-Navigation, 700 reserviert) |

Fallbacks metrik-angepasst: Georgia 87,5 % / Times 96,8 % → Cormorant; Arial 96,9 % → Barlow; Arial Narrow 90,1 % bzw. Arial 74 % → Condensed. Preload je Seite: `cormorant-garamond-300`, `barlow-400`, `barlow-condensed-600`.

### Skala

| Token | Wert | Einsatz |
|---|---|---|
| `--display` | `clamp(48px, 7vw, 104px)` | Hero-H1 (Kicker 0,34em) |
| `--h1` | `clamp(38px, 5vw, 68px)` | Seiten-H1 |
| `--h2` | `clamp(30px, 3.6vw, 50px)` | Sektionen, Prose-H2, CTA |
| `--h3` | `clamp(22px, 2vw, 28px)` | Zeilen-Titel, Standorte, Stories, Jobs |
| `--text-lead` | `clamp(17px, 1rem + .35vw, 20px)` | Einleitungen, Seiten-Intro |
| `--text-base` | `clamp(16px, .95rem + .2vw, 17px)` | Fließtext, Listen |
| `--text-sm` | 14 px | Teaser, Meta-Zeilen, Footer, Formular-Hinweise |
| `--text-xs` | 12 px | Labels, Eyebrows, Navigation, Buttons (`--track-ui` 0,12em, Versalien) |
| `--lh-body` / `--measure` | 1,7 / 74ch | Zeilenhöhe / max. Zeilenlänge |

Große Zahlen: Proof-Leiste `clamp(38px, 4vw, 56px)`, Statement `clamp(64px, 9vw, 128px)`, Statistik-Zeilen `clamp(30px, 3vw, 44px)` – alle Cormorant 300.

## 5. Layout & Abstände

| Token | Wert |
|---|---|
| `--container-max` | 1280 px |
| `--pad` (Seitenrand) | `clamp(20px, 4.5vw, 64px)` |
| `--header-h` | 88 px (≤ 560: 72 px); Logo 60 px (≤ 560: 48 px) |
| `--section-y` / `--section-y-sm` | `clamp(72px, 9vw, 136px)` / `clamp(56px, 7vw, 104px)` |
| `--gap` (Spaltenabstand) | `clamp(32px, 4.5vw, 72px)` |
| `--row-y` (Editorial Rows) | `clamp(24px, 2.6vw, 36px)` |
| Radien | `--r-ui` 2 px (Buttons, Felder) · `--r-panel` 6 px (Dropdown) · `--r-overlay` 10 px |

### Breakpoints

| Breite | Änderung |
|---|---|
| ≤ 1100 px | Footer 2 Spalten, Proof-/Stats-Leiste 2×2, Standort-Zeilen 3 Spalten |
| ≤ 900 px | Hero, Sektionsköpfe, Statement, Ratgeber, Zertifikate, CTA, Kontakt: 1 Spalte; Rows 2 Spalten (Nummer + Inhalt) |
| ≤ 768 px | Hamburger-Navigation; Standorte/Stories/Jobs gestapelt; Hero-Fakten 1 Spalte |
| ≤ 560 px | Header 72 px; Proof-/Stats-Leiste 1 Spalte; Buttons volle Breite; Footer 1 Spalte |

## 6. Komponenten

| Komponente | Spezifikation |
|---|---|
| Primary-Button | Markenblau, weiß, 15 × 26 px, Radius 2 px, Condensed 600 12 px; Hover: dunkleres Blau (keine Verschiebung) |
| Ghost-Button | Outline 1 px `--line-strong`, Hover: Kante in `--heading` |
| Textlink (`.link-arrow`) | Condensed 600 12 px, Blau, Pfeil „→“ verschiebt sich 4 px |
| Navigation | Textlinks, 2-px-Unterstrich in Blau für Hover/aktiv; Kontakt als Primary-Button; Toggle 36 px rund |
| Dropdown | Panel 6 px Radius, Hairline, Schatten, Blur 14 px |
| Editorial Row (`.row`) | Grid `56px · 0.9fr · 1.2fr · auto`, Hairline oben/unten, Hover: Titel blau |
| Story Row (`.story`, `.news-card__body`) | Grid `110px · 1fr · auto`: Label · Titel + Teaser · Pfeil/Link |
| Proof-/Stats-Leiste | 4 Spalten mit vertikalen Hairlines, Zahl Cormorant 300 + Erklärung |
| Standort-Zeile | `120px · 0.8fr · 1fr · 0.9fr · auto`: Badge · Ort · Adresse · Telefon · Karte |
| Zertifikate (`.marks`) | Hairline-Raster `minmax(150px,1fr)`, weiße Logo-Kachel 112 × 64 px, Name + Untertitel, keine Hover-Effekte |
| Formular | Felder 14 × 16 px, 16 px Text, Radius 2 px, Kante `--line-strong`, Fokus: blaue Kante + 3-px-Ring; Statusbox mit linker 3-px-Kante |
| Hinweisbox (`.legal-notice`) | linke 2-px-Kante in Blau, kein Hintergrund |
| Touch-Ziele | ≥ 24 × 24 px |

## 7. Motion

Zwei Prinzipien: `.reveal` (12 px, 600 ms, `cubic-bezier(.2,.7,.2,1)`, optional `--late` +120 ms) für Sektionsköpfe und Textblöcke; `.reveal-rule` (Hairline zeichnet sich, 900 ms). Hover: Farbwechsel, Pfeil 4–6 px. Keine Slider, kein Ticker, keine Zähler, kein Parallax. `prefers-reduced-motion` deaktiviert alles; ohne JavaScript sind alle Inhalte sichtbar.

## 8. Assets

| Datei | Maße | Größe | Zweck |
|---|---|---|---|
| `assets/images/logo-full.webp` / `-480.webp` | 810 × 382 / 480 × 227 | 88 / 41 KB | Header/Footer (transparent; Dark: Filter weiß) |
| `assets/images/logo-publisher.png` | 600 × 283 | 26 KB | Schema.org `logo` |
| `assets/images/og-image.png` | 1200 × 630 | 82 KB | Open Graph |
| `assets/images/logo-full.svg`, `logo-badge.svg` | Vektor | 57 / 25 KB | Quellen (Badge „SEIT 1996“) |
| Zertifikate/Verbände `*.webp` (9) | 250–500 px | 2,5–29 KB | Trust-Raster |
| `assets/icons/*` | 180 / 192 / 512, SVG | 8–30 KB | Icons |

Fotografie (`assets/images/photos/`, **Platzhalter** unter Unsplash-Lizenz, selbst gehostet – vor Launch durch eigene Fotos ersetzen oder Freigabe dokumentieren):

| Datei | Motiv | Quelle (Unsplash-ID) | Einsatz |
|---|---|---|---|
| `muenchen-siegestor-{800,1200,1800}.webp` | Siegestor München bei Nacht | photo-1735599308342-7ea38adabfd5 | Startseite: seitenweiter fixierter Hintergrund (`figure.page-bg`, `position: fixed`, `fetchpriority="high"`); Sektionen darüber halbtransparent (hell 76 % / Tint 82 % / dunkel 84 % / Footer 90 %), Reduced Motion → statisch |
| `strasse-nacht-{1000,1800}.webp` | Straße bei Nacht/Regen | photo-1716908331958-dfe8e734e560 | derzeit ungenutzt (Statement-Sektion zeigt jetzt das Siegestor-Foto durch) |
| `muenchen-isar-{600,900}.webp` | Isar München, Abenddämmerung | photo-1673460655608-e75424d9dfa8 | „Warum Pappenberger“ (420 px), Seiten-Hero Detektei (`fetchpriority="high"`) |

Regeln: `srcset` + `sizes`, `width/height`, unterhalb der Falz `loading="lazy"`, dekorative Hintergründe `alt=""`, subtiler Reveal-Zoom 1,04 → 1 (`.reveal-img`). Das Layout funktioniert auch ohne Bilder.

Altbestand ohne Referenz (löschbar): `bvsw.png`, `iso-45001.png`, `polizei-helfen.png`, `vesd.png`, `*.jpg` der Zertifikatslogos.

## 9. Performance (Lighthouse mobil, lokal mit gzip)

| Seite | Perf | LCP | CLS |
|---|---|---|---|
| `/` | 98–99 | 2,1–2,3 s | 0 |
| `/detektei.html` | 98 | 2,3 s | 0,001 |
| `/kontakt.html` | 98 | 2,3 s | 0 |

Transfer Startseite ~196 KB, 11 Requests, nur First-Party. Caching (`vercel.json`): Fonts 1 Jahr immutable · Bilder/Icons 7 Tage + SWR · CSS/JS 1 h + SWR · API `no-store`.

## 10. Sicherheit & Barrierefreiheit

CSP `default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; manifest-src 'self'; upgrade-insecure-requests` · HSTS · nosniff · DENY · Referrer strict-origin-when-cross-origin · Permissions-Policy · COOP. Keine Inline-Styles.

WCAG 2.2 AA: Skip-Link, Landmarks, `aria-current`, sichtbarer Fokus (2 px Blau), Links im Fließtext unterstrichen, Formular mit `aria-invalid`/`aria-describedby`/`role="status"`, Touch-Ziele ≥ 24 px, Kontraste AA in beiden Themes, Reduced Motion.

## 11. Browser-Support

Chrome/Edge ≥ 105, Safari ≥ 15.4, Firefox ≥ 121. Features: `backdrop-filter` (mit Prefix), `clamp()`, `size-adjust`, `:focus-visible`, `inset`. Ohne JavaScript: alle Inhalte sichtbar, Formular sendet per klassischem POST mit HTML-Antwort.
