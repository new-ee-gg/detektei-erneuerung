# Website Detektei Security Service Pappenberger

Statische Website (HTML/CSS/JS ohne Build-Schritt) + eine Serverless Function für das Kontaktformular. Hosting: Vercel.

## Struktur

| Pfad | Inhalt |
|---|---|
| `*.html` | 13 Seiten (Start, 6 Leistungen, Kontakt, Karriere, News, Wissenswertes, Impressum, Datenschutz) + `404.html` |
| `news/`, `wissenswertes/` | Artikel / Ratgeber |
| `css/main.css` | gesamtes Styling (Design-Tokens, Dark/Light, Responsive) |
| `js/main.js` | Progressive Enhancement: Theme, Navigation, Slider, Reveal, Formular |
| `api/contact.js` | Formular-Backend (Validierung, Spam-Schutz, Rate-Limit, Mailversand) |
| `assets/` | Fonts (self-hosted), Bilder, Icons |
| `vercel.json` | Redirects, Security-Header, Caching |
| `docs/` | Audits & Reports (wird **nicht** deployed, siehe `.vercelignore`) |

## Lokale Vorschau

```bash
npm run preview          # statisch: http://127.0.0.1:8000  (Formular-Backend nicht aktiv)
npm install && npm run dev   # mit Formular-Backend über Vercel CLI (vercel login nötig)
```

## Deployment

Git-basiert über Vercel (Production-Branch `main`). Umgebungsvariablen für das Formular: siehe `.env.example`.
Interne Dateien (`docs/`, `FREIGABE.md`, `seo-tool/`, Kundendateien) sind über `.gitignore`/`.vercelignore` ausgeschlossen.

## Pflegehinweise

- **Bilder:** Hero-/Hintergrundflächen sind aktuell neutrale Platzhalter (CSS). Echte Fotos als WebP/AVIF unter `assets/images/` ablegen und in `css/main.css` (Abschnitt „Bildflächen") bzw. `index.html` (Hero) eintragen. Hero-Bild 1 mit `fetchpriority="high"`, alle weiteren `loading="lazy"`.
- **Kriminalstatistik (Startseite):** Werte stehen in `index.html` als `data-count`. Jährlich gegen die BKA-PKS prüfen und Jahr + Quelle anpassen.
- **Neue Seite:** Head-Block (Title, Description, Canonical, OG, Icons), Header/Footer aus einer bestehenden Seite übernehmen, `sitemap.xml` ergänzen.
- **Firmendaten (Adressen, Telefon):** an allen Stellen identisch halten (HTML, JSON-LD, Impressum).
