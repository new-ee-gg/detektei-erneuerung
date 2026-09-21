'use strict';
/**
 * POST /api/contact – Kontakt- und Bewerbungsformular (Vercel Serverless Function, Node.js)
 *
 * Kette: Client-Validierung → POST (JSON oder Formular-Fallback ohne JS) → Server-Validierung →
 *        Spam-Schutz (Honeypot, Zeitfenster, optional Cloudflare Turnstile) → Rate-Limit →
 *        Mailversand (SMTP z. B. Microsoft 365, oder Resend) → bestätigter Erfolg.
 *
 * Erfolg (200 {ok:true}) wird NUR nach bestätigter Annahme durch den Mailserver gemeldet.
 *
 * Umgebungsvariablen (siehe .env.example):
 *   MAIL_TO                Empfängeradresse (Pflicht)
 *   MAIL_FROM              Absender (Standard: SMTP_USER bzw. MAIL_TO)
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE   – SMTP-Versand (Microsoft 365: smtp.office365.com / 587)
 *   RESEND_API_KEY         – alternativ Versand über Resend (https://resend.com)
 *   MAIL_TRANSPORT=stream  – nur für Tests: Mail wird nicht versendet, sondern zurückgegeben
 *   TURNSTILE_SECRET_KEY   – optional: serverseitige Prüfung eines Cloudflare-Turnstile-Tokens
 *   ALLOWED_ORIGINS        – optional: kommagetrennte Hosts (Standard: Produktionsdomain, *.vercel.app, localhost)
 */

const LIMITS = { name: 100, email: 200, telefon: 40, betreff: 150, message: 5000, bewerbung: 150, page: 200 };
const MIN_FORM_SECONDS = 3;              // Bots füllen schneller aus
const RATE = { perIp: 5, windowMs: 10 * 60 * 1000, global: 60, globalWindowMs: 60 * 1000 };
const DEFAULT_ORIGINS = ['www.detektei-weltweit.de', 'detektei-weltweit.de', 'localhost', '127.0.0.1'];

/* In-Memory-Rate-Limit: gilt pro Function-Instanz (best effort; harte Limits ergänzt Vercel Firewall/WAF). */
const ipBuckets = new Map();
const globalBucket = [];

function nowMs() { return Date.now(); }

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rateLimited(ip) {
  const t = nowMs();
  while (globalBucket.length && t - globalBucket[0] > RATE.globalWindowMs) globalBucket.shift();
  if (globalBucket.length >= RATE.global) return true;
  const list = (ipBuckets.get(ip) || []).filter((x) => t - x < RATE.windowMs);
  if (list.length >= RATE.perIp) { ipBuckets.set(ip, list); return true; }
  list.push(t); ipBuckets.set(ip, list); globalBucket.push(t);
  if (ipBuckets.size > 5000) ipBuckets.clear(); // Speicherschutz
  return false;
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // z. B. curl / Same-Origin ohne Origin-Header
  let host;
  try { host = new URL(origin).hostname; } catch (e) { return false; }
  const allowed = (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : DEFAULT_ORIGINS).map((s) => s.trim()).filter(Boolean);
  return allowed.includes(host) || host.endsWith('.vercel.app');
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') return parseRaw(req.body, req.headers['content-type'] || '');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 32 * 1024) throw Object.assign(new Error('Payload zu groß'), { status: 413 });
    chunks.push(chunk);
  }
  return parseRaw(Buffer.concat(chunks).toString('utf8'), req.headers['content-type'] || '');
}

function parseRaw(raw, contentType) {
  if (!raw) return {};
  if (contentType.includes('application/json')) return JSON.parse(raw);
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const out = {};
    for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
    return out;
  }
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

function str(v, max) {
  if (v === undefined || v === null) return '';
  return String(v).replace(/\0/g, '').slice(0, max + 1);
}

function validate(body) {
  const fields = {};
  const data = {
    name: str(body.name, LIMITS.name).trim(),
    email: str(body.email, LIMITS.email).trim(),
    telefon: str(body.telefon, LIMITS.telefon).trim(),
    betreff: str(body.betreff, LIMITS.betreff).trim(),
    message: str(body.message, LIMITS.message).trim(),
    bewerbung: str(body.bewerbung, LIMITS.bewerbung).trim(),
    page: str(body.page, LIMITS.page).trim(),
    dsgvo: body.dsgvo === true || body.dsgvo === 'true' || body.dsgvo === 'on' || body.dsgvo === '1'
  };
  if (data.name.length < 2 || data.name.length > LIMITS.name) fields.name = 'Bitte geben Sie Ihren Namen ein (2–100 Zeichen).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) || data.email.length > LIMITS.email) fields.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
  if (data.telefon.length > LIMITS.telefon) fields.telefon = 'Die Telefonnummer ist zu lang.';
  if (data.betreff.length > LIMITS.betreff) fields.betreff = 'Der Betreff ist zu lang.';
  if (data.message.length < 10 || data.message.length > LIMITS.message) fields.message = 'Bitte beschreiben Sie Ihr Anliegen (10–5000 Zeichen).';
  if (!data.dsgvo) fields.dsgvo = 'Bitte stimmen Sie der Datenschutzerklärung zu.';
  return { data, fields };
}

function isSpam(body) {
  if (str(body.website, 200).trim() !== '') return 'HONEYPOT';           // unsichtbares Feld ausgefüllt
  const ts = parseInt(body.ts, 10);
  if (Number.isFinite(ts) && nowMs() - ts < MIN_FORM_SECONDS * 1000) return 'TOO_FAST';
  return null;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip })
  });
  const json = await res.json().catch(() => ({}));
  return json.success === true;
}

function buildMail(data, ip) {
  const isBewerbung = !!data.bewerbung;
  const subjectCore = (data.betreff || (isBewerbung ? data.bewerbung : 'Kontaktanfrage')).replace(/[\r\n]+/g, ' ');
  const subject = `[Website] ${isBewerbung ? 'Bewerbung' : 'Anfrage'}: ${subjectCore}`.slice(0, 200);
  const lines = [
    `${isBewerbung ? 'Neue Bewerbung' : 'Neue Anfrage'} über www.detektei-weltweit.de`,
    '',
    `Name:      ${data.name}`,
    `E-Mail:    ${data.email}`,
    `Telefon:   ${data.telefon || '–'}`,
    `Betreff:   ${data.betreff || '–'}`,
    isBewerbung ? `Position:  ${data.bewerbung}` : null,
    '',
    'Nachricht:',
    '----------------------------------------',
    data.message,
    '----------------------------------------',
    '',
    `Datenschutzeinwilligung: ja (${new Date().toISOString()})`,
    `Seite: ${data.page || '–'} · IP: ${ip}`
  ].filter((l) => l !== null);
  return { subject, text: lines.join('\n') };
}

async function sendMail(mail, data) {
  const to = process.env.MAIL_TO;
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || to;
  const transportKind = process.env.MAIL_TRANSPORT || (process.env.SMTP_HOST ? 'smtp' : process.env.RESEND_API_KEY ? 'resend' : '');
  if (!to || !transportKind) {
    const err = new Error('Mailversand nicht konfiguriert (MAIL_TO / SMTP_* bzw. RESEND_API_KEY fehlen)');
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }
  const message = { from: `"Website Detektei Pappenberger" <${from}>`, to, replyTo: `"${data.name.replace(/"/g, '')}" <${data.email}>`, subject: mail.subject, text: mail.text };

  if (transportKind === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: message.from, to: [to], reply_to: data.email, subject: message.subject, text: message.text })
    });
    if (!res.ok) throw new Error(`Resend antwortete mit HTTP ${res.status}`);
    return { provider: 'resend', id: (await res.json().catch(() => ({}))).id };
  }

  const nodemailer = require('nodemailer');
  let transporter;
  if (transportKind === 'stream') {
    transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true });
  } else {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      requireTLS: true,
      connectionTimeout: 10000,
      socketTimeout: 15000
    });
  }
  const info = await transporter.sendMail(message);
  if (transportKind === 'stream') return { provider: 'stream', id: info.messageId, raw: info.message.toString() };
  if (info.rejected && info.rejected.length) throw new Error('Mailserver hat Empfänger abgelehnt');
  return { provider: 'smtp', id: info.messageId };
}

function wantsHtml(req) {
  const accept = req.headers.accept || '';
  return accept.includes('text/html') && !accept.includes('application/json');
}

function htmlPage(title, body) {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Detektei Pappenberger</title><style>body{font-family:system-ui,sans-serif;background:#0a0a0b;color:#d8d8e0;margin:0;padding:48px 20px;line-height:1.6}main{max-width:560px;margin:auto}h1{color:#f2f2f4;font-weight:500}a{color:#5B82D1}</style></head><body><main><h1>${title}</h1>${body}<p><a href="/kontakt.html">Zurück zum Kontaktformular</a> · <a href="/">Startseite</a></p></main></body></html>`;
}

function send(res, req, status, payload, html) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store');
  if (wantsHtml(req) && html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  } else {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
  }
}

const PHONE_HTML = '<p>Sie erreichen uns rund um die Uhr unter <a href="tel:+498974127886">+49 (0) 89 741 27 886</a>.</p>';

module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, req, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' }, htmlPage('Nicht erlaubt', '<p>Dieser Endpunkt nimmt nur Formulardaten per POST entgegen.</p>'));
  }
  if (!originAllowed(req)) return send(res, req, 403, { ok: false, code: 'FORBIDDEN_ORIGIN' }, htmlPage('Nicht erlaubt', '<p>Ungültige Herkunft der Anfrage.</p>'));

  const ip = clientIp(req);
  let body;
  try { body = await readBody(req); } catch (e) {
    return send(res, req, e.status || 400, { ok: false, code: e.status === 413 ? 'PAYLOAD_TOO_LARGE' : 'BAD_REQUEST' }, htmlPage('Fehler', '<p>Die Anfrage konnte nicht gelesen werden.</p>' + PHONE_HTML));
  }

  const spam = isSpam(body);
  if (spam) {
    // Bots bekommen bewusst eine unauffällige Antwort; nichts wird versendet.
    return send(res, req, 200, { ok: true, code: 'IGNORED' }, htmlPage('Vielen Dank', '<p>Ihre Nachricht wurde entgegengenommen.</p>'));
  }
  const { data, fields } = validate(body);
  if (Object.keys(fields).length) {
    return send(res, req, 400, { ok: false, code: 'VALIDATION', fields }, htmlPage('Bitte prüfen Sie Ihre Angaben', '<ul>' + Object.values(fields).map((m) => `<li>${m}</li>`).join('') + '</ul>'));
  }

  // Rate-Limit zählt nur versandfähige Anfragen (Validierungsfehler kosten keinen Mailversand)
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', '600');
    return send(res, req, 429, { ok: false, code: 'RATE_LIMITED' }, htmlPage('Zu viele Anfragen', '<p>Bitte versuchen Sie es in einigen Minuten erneut.</p>' + PHONE_HTML));
  }

  try {
    if (!(await verifyTurnstile(body.turnstileToken, ip))) {
      return send(res, req, 400, { ok: false, code: 'CAPTCHA_FAILED', fields: {} }, htmlPage('Prüfung fehlgeschlagen', '<p>Die Sicherheitsprüfung ist fehlgeschlagen. Bitte versuchen Sie es erneut.</p>' + PHONE_HTML));
    }
  } catch (e) {
    console.error('[contact] Turnstile-Prüfung fehlgeschlagen:', e.message);
    return send(res, req, 502, { ok: false, code: 'CAPTCHA_UNAVAILABLE' }, htmlPage('Fehler', '<p>Die Sicherheitsprüfung ist derzeit nicht erreichbar.</p>' + PHONE_HTML));
  }

  const mail = buildMail(data, ip);
  try {
    const result = await sendMail(mail, data);
    console.log(`[contact] gesendet via ${result.provider} id=${result.id || '-'} type=${data.bewerbung ? 'bewerbung' : 'anfrage'}`);
    const payload = { ok: true };
    if (result.provider === 'stream') payload.preview = result.raw; // nur im Testmodus
    return send(res, req, 200, payload, htmlPage('Vielen Dank', `<p>Ihre ${data.bewerbung ? 'Bewerbung' : 'Anfrage'} ist bei uns eingegangen. Wir melden uns zeitnah.</p>` + PHONE_HTML));
  } catch (e) {
    const code = e.code === 'MAIL_NOT_CONFIGURED' ? 'MAIL_NOT_CONFIGURED' : 'MAIL_FAILED';
    console.error(`[contact] ${code}:`, e.message);
    return send(res, req, 503, { ok: false, code }, htmlPage('Versand derzeit nicht möglich', '<p>Ihre Nachricht konnte nicht übermittelt werden. Bitte versuchen Sie es später erneut.</p>' + PHONE_HTML));
  }
};

module.exports.__test = { validate, isSpam, buildMail, rateLimited, RATE };
