# Technische Spezifikation — detektei-weltweit.de

Stand: 2026-09-21 · Branch `feature/dark-light-mode` · Quelle der Wahrheit: `css/main.css` (Tokens in `:root` und `[data-theme="light"]`)

## 1. Stack

| Bereich | Umsetzung |
|---|---|
| Seiten | 20 statische HTML-Dateien (13 Root, `news/` ×2, `wissenswertes/` ×4, `404.html`), kein Framework, kein Build |
| Styling | `css/main.css` (78 KB roh / 14,8 KB gzip), Custom Properties, Dark-Default + Light via `data-theme` |
| Script | `js/main.js` (21 KB / 6,3 KB gzip), IIFE, Progressive Enhancement, Module isoliert |
| Backend | `api/contact.js` (Vercel Serverless, Node 22, `nodemailer`) |
| Hosting | Vercel; `vercel.json` (Header, Redirects, Cache); Brotli |
| Fonts | 8 × WOFF2 self-hosted, `font-display: swap` |
| Icons/Manifest | `favicon.ico` 32, `favicon.svg`, Apple-Touch 180, PNG 192/512, `site.webmanifest` |
| Theme-Wechsel | Inline-Head-Script (CSP-Hash), `localStorage['dp-theme']`, Fallback `prefers-color-scheme` |

## 2. Farben

### Dark (Standard)

| Token | Wert | Verwendung |
|---|---|---|
| `--black` | `#0a0a0b` | Seitengrund |
| `--deep` | `#111114` | Sektionen, Intro, Standorte, Footer |
| `--panel` | `#16161a` | Hover-Flächen |
| `--border` | `#2a2a30` | Linien, Trenner |
| `--muted` | `#9a9aa9` | Sekundärtext (≥ 5,4:1 auf Glas-Karten) |
| `--silver` | `#b8b8c8` | Footer-Links, Copyright |
| `--light` | `#d8d8e0` | Fließtext |
| `--white` | `#f2f2f4` | Überschriften |
| `--gold` | `#3D63B2` | Markenblau als Fläche (Buttons, Linien, Ticker) |
| `--gold2` | `#5B82D1` | Hover-Fläche |
| `--accent-text` | `#6A90DA` | Markenblau als Text (≥ 5,2:1 auf Karten) |

### Light

| Token | Wert |
|---|---|
| `--black` | `#F0EEE9` (Ivory-Grund) |
| `--deep` | `#E7E4DE` |
| `--panel` | `#DEDBD4` |
| `--border` | `#C9C5BB` |
| `--muted` | `#5E5B57` |
| `--silver` | `#3E3C39` |
| `--light` | `#1A1917` (Fließtext) |
| `--white` | `#0A0A0B` (Überschriften) |
| `--gold` | `#2A4E9E` |
| `--gold2` | `#3563B5` |
| `--accent-text` | `#2A4E9E` |

Kontraste: alle Text/Grund-Kombinationen ≥ 4,5:1 (axe WCAG 2.2 AA, beide Themes, 0 Verstöße). Weiß auf Markenblau 5,8:1 (Dark) / 7,8:1 (Light).

### Glas-Tokens

| Token | Dark | Light |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,.06)` | `rgba(255,255,255,.58)` |
| `--glass-bg-hover` | `rgba(255,255,255,.10)` | `rgba(255,255,255,.70)` |
| `--glass-border` | `rgba(255,255,255,.12)` | `rgba(10,26,52,.12)` |
| `--glass-highlight` (Innenkante oben) | `rgba(255,255,255,.10)` | `rgba(255,255,255,.85)` |
| `--glass-shadow` | `0 10px 34px rgba(0,0,0,.35)` | `0 10px 34px rgba(0,0,0,.08)` |
| `--glass-blur` | `blur(18px) saturate(150%)` | gleich |
| `--glass-radius` | `18px` | gleich |
| `--glass-accent-bg` (Primary-Button) | `rgba(61,99,178,.30)` | `rgba(42,78,158,.88)` |
| `--glass-accent-border` | `rgba(91,130,209,.55)` | `rgba(42,78,158,.55)` |
| `--glass-input-bg` | `rgba(255,255,255,.04)` | `rgba(255,255,255,.55)` |

Backdrop-Blur nur über Bild/Verlauf (Header, Dropdown, Mobile-Nav, Buttons, CTA-Panel, Statistik-Karten). Karten auf flachem Grund nutzen die Glas-Optik ohne Blur (Performance).

## 3. Typografie

### Schriften (self-hosted, `assets/fonts/`)

| Familie | Schnitte | Rolle |
|---|---|---|
| Cormorant Garamond | 300, 400, 600 | Display/Überschriften (Serif) |
| Barlow | 400, 600 | Fließtext, Meta, `strong` |
| Barlow Condensed | 500, 600, 700 | Labels, Navigation, Buttons, Zahlen-Labels (Versalien) |

Fallbacks: `Georgia, serif` · `system-ui, sans-serif`. Preload je Seite: `cormorant-garamond-300` + `barlow-400` (Startseite zusätzlich `cormorant-garamond-600`).

### Skala (Tokens)

| Token | Wert | Einsatz |
|---|---|---|
| `--text-xs` | 12 px | Labels, Eyebrows, Buttons, Nav, Breadcrumb, Badges |
| `--text-sm` | 14 px | Karten-Teaser, Footer-Links, Hinweisboxen, Checkbox-Label |
| `--text-base` | `clamp(16px, .95rem + .2vw, 17px)` | Fließtext, Listen, CTA-Text |
| `--text-lead` | `clamp(17px, 1rem + .3vw, 19px)` | Hero-Sub, Seiten-Intro, Über-uns |
| `--lh-body` | 1,7 | Zeilenhöhe Fließtext |
| `--measure` | 78ch | max. Zeilenlänge (`.prose`: `min(780px, 78ch)`) |

### Überschriften & Display

| Element | Familie/Gewicht | Größe | Zeilenhöhe |
|---|---|---|---|
| Hero-H1 (`.hero-title`) | Cormorant 300, Claim in `em` 600 | `clamp(52px, 7.5vw, 96px)`, Kicker 0,4em | 1,0 |
| Seiten-H1 (`.page-hero h1`) | Cormorant 300 | `clamp(36px, 5vw, 72px)` | 1,1 |
| Sektions-H2 (`h2.section-title`) | Cormorant 400 | `clamp(34px, 4.5vw, 58px)` (≤ 768: `clamp(28px, 7vw, 42px)`) | 1,1 |
| Prose-H2 | Cormorant 400 | `clamp(26px, 3vw, 40px)` | – |
| Prose-H3 | Condensed 600, Versalien, 0,1em | 15 px | – |
| CTA-H2 | Cormorant 400 | `clamp(32px, 4vw, 52px)` | 1,15 |
| Zitat | Cormorant 300 | `clamp(24px, 3.5vw, 44px)` | 1,35 |
| Karten-Titel (Leistung) | Cormorant 600 | 24 px | 1,2 |
| Karten-Titel (Standort/News/Job) | Cormorant 400 | 22 px | 1,2 |
| Stats-Zahl / Statistik-Zahl / Jahreszahl | Cormorant 300 | 64 / 60 (≤ 768: 44) / 80 (≤ 768: 56) px | 1 |
| Telefon CTA (`.cta-tel`) | Condensed 600 | 28 px (≤ 768: 22) | – |
| Notruf-Leiste | Condensed 700, 0,12em | 13 px | – |

Laufweiten: Labels 0,16–0,22em, Nav 0,12em, Buttons 0,16em, Eyebrow 0,2em.

## 4. Layout & Abstände

| Token / Regel | Wert |
|---|---|
| `--container-max` | 1280 px |
| `--container-pad` (Seitenrand) | `clamp(20px, 4.5vw, 60px)` |
| `--header-height` | 116 px (≤ 480: 92 px); Header fixed, Glas beim Scrollen |
| Logo im Header | Höhe 100 px (≤ 480: 74 px), Breite auto (Seitenverhältnis 2,12) |
| `--section-y` / `-sm` / `-xs` | `clamp(64px, 8.5vw, 120px)` / `clamp(52px, 6.5vw, 100px)` / `clamp(48px, 5vw, 80px)` |
| `--grid-gap` (2-spaltig) | `clamp(36px, 4.5vw, 60px)` |
| `--card-pad` | `clamp(32px, 3.4vw, 52px)` |
| Karten-Abstand in Rastern | 14 px (≤ 768: 12 px) |
| Hero | `100svh` (Fallback `100vh`), min. 640 px |
| Zitat-Sektion / CTA-Sektion | 520 px / 540 px (≤ 768: auto), CTA auf Unterseiten 380 px |
| `scroll-margin-top` für Anker | Header + 16 px |

### Breakpoints

| Breite | Änderung |
|---|---|
| ≤ 1100 px | Footer 2 Spalten, Stats 2×2, 4er-Kartenraster → 2×2 |
| ≤ 900 px | Leistungen 2 Spalten, Trust/Intro/Kontakt 1 Spalte, Standorte 2, Statistik 2 |
| ≤ 768 px | Desktop-Nav → Hamburger + Glas-Overlay, Leistungen/Standorte/Zertifikate 1 Spalte, Job-Karten gestapelt |
| ≤ 560 px | 4er-Kartenraster 1 Spalte |
| ≤ 480 px | Header 92 px, Hero-/CTA-Buttons gestapelt, Statistik 1 Spalte |

Kartenraster: `repeat(auto-fit, minmax(min(260px, 100%), 1fr))`; Raster mit genau 4 Karten deterministisch 4 → 2×2 → 1 (`:has()`); Abschluss-Elemente (Links/Badges/Untertitel) in allen Karten unten bündig.

## 5. Komponenten-Maße

| Komponente | Maße |
|---|---|
| Primary-Button | Pille (999 px), 16 × 40 px Innenabstand, 12 px Condensed 700, Glas-Blau + Blur, Hover heller/−1 px |
| Ghost-Button | wie Primary, Glas-Weiß, max. 250 px |
| Nav-Pille | 5 × 6 px Innenabstand, Links 10 × 20 px, Radius 999 px, Blur 18 px |
| Dropdown | 240 px min, Radius 18 px, Blur 24 px, Einträge 11 × 16 px |
| Theme-Toggle / Pause-Button | 38 × 38 px bzw. 36 × 36 px, rund, Glas |
| Hero-Slider-Balken | Buttons 36 × 28 px (aktiv 60 px), Balken 3 px, Fortschritt 6 s |
| Zitat-Punkte | Buttons 24 × 24 px, Punkt 8 px |
| Karten | Radius 18 px, 1 px Glas-Kante, Schatten `--glass-shadow`, Innenabstand `--card-pad` |
| Formularfelder | 14 × 16 px Innenabstand, 16 px Text, Radius 12 px, Fokus: blaue Kante + 3 px Ring |
| Skip-Link | erscheint bei Fokus oben links, Pille, Markenblau |
| Touch-Ziele | ≥ 24 × 24 px (Footer-/Breadcrumb-Links mit 5–6 px vertikalem Padding) |

## 6. Assets

| Datei | Maße | Größe | Zweck |
|---|---|---|---|
| `assets/images/logo-full.webp` | 810 × 382 | 88 KB | Header/Footer (transparent; Dark: per Filter weiß) |
| `assets/images/logo-full-480.webp` | 480 × 227 | 41 KB | `srcset` ≤ 2× DPR |
| `assets/images/logo-publisher.png` | 600 × 283 | 26 KB | Schema.org `logo` (Raster, weiß) |
| `assets/images/og-image.png` | 1200 × 630 | 82 KB | Open Graph / Twitter |
| `assets/images/logo-full.svg`, `logo-badge.svg` | 2800 × 1000 / 700 × 700 | 57 / 25 KB | Vektorquellen (Badge „SEIT 1996“) |
| Zertifikate/Verbände `*.webp` (9) | 250–500 px | 2,5–29 KB | Trust-Sektion |
| `assets/icons/favicon.svg` | 700 × 700 | 25 KB | Tab-Icon (modern) |
| `favicon.ico` | 32 × 32 | 4 KB | Fallback |
| `assets/icons/apple-touch-icon.png` | 180 × 180 | 9 KB | iOS |
| `assets/icons/icon-192.png` / `icon-512.png` | 192 / 512 | 9 / 30 KB | Manifest |
| `assets/fonts/*.woff2` (8) | – | ~23 KB je Datei | Schriften |

Bildflächen (Hero ×3, Zitat ×3, Trust ×3, Statistik ×3, CTA ×3, Intro): aktuell CSS-Verläufe mit Rasterlinien, theme-abhängig; echte Fotos als `<img>` in die Slide-Container (Hero-Bild 1 `fetchpriority="high"`, weitere `loading="lazy"`).

Altbestand ohne Referenz (kann entfernt werden): `bvsw.png`, `iso-45001.png`, `polizei-helfen.png`, `vesd.png`, `*.jpg` der Zertifikatslogos.

## 7. Performance

| Messung (Lighthouse, mobil, Vercel-Preview) | Wert |
|---|---|
| Startseite / Detektei / Kontakt Performance | 99 / 100 / 99 |
| LCP | 1,9 s |
| CLS | 0–0,013 |
| Transfer Startseite | ~260 KB (davon Fonts ~160 KB, Logo 41 KB, CSS 15 KB, JS 6 KB) |
| Requests Startseite | ≤ 16, nur First-Party |

Caching (`vercel.json`): Fonts 1 Jahr immutable · Bilder/Icons 7 Tage + SWR · CSS/JS 1 h + SWR · API `no-store`.

## 8. Sicherheit

CSP: `default-src 'self'; script-src 'self' 'sha256-Vn2Ot0A3rUY/cvc4PTUgYrDYyp+qyRf2BpD9q84ZqFI='; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; manifest-src 'self'; upgrade-insecure-requests` · HSTS 2 Jahre inkl. Subdomains (ohne preload) · `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` · `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy` (Kamera, Mikro, Geo, Payment, USB aus) · COOP `same-origin`. Keine Inline-Styles, kein `unsafe-inline`.

Formular: Client- und Server-Validierung, Honeypot, Zeitfenster ≥ 3 s, Rate-Limit 5/10 min pro IP, Origin-Prüfung, Payload ≤ 32 KB, Versand nur nach Bestätigung des Mailservers.

## 9. Barrierefreiheit

WCAG 2.2 AA orientiert: Skip-Link, semantische Landmarks, `aria-current` in der Navigation, Slider als `<button>` mit Labels und Pause/Play (`aria-pressed`), `prefers-reduced-motion` (CSS + JS), Formular mit `aria-invalid`/`aria-describedby`/`role="status"`, sichtbarer Fokusring 2 px Markenblau, Links im Fließtext unterstrichen, Touch-Ziele ≥ 24 px, Kontraste AA in beiden Themes.

## 10. Browser-Support

Chrome/Edge ≥ 105, Safari ≥ 15.4 (iOS 15.4+), Firefox ≥ 121. Verwendete Features: `backdrop-filter` (mit `-webkit-`), `:has()` (nur für 4er-Raster, Fallback auto-fit), `clamp()`, `100svh` (Fallback `100vh`), `:focus-visible`, `inset`, `padding-block`. Ohne JavaScript: alle Inhalte sichtbar, Formular sendet per klassischem POST mit HTML-Antwort.
