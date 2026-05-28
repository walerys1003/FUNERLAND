/**
 * Resend mailing helper — real implementation with 8 templates.
 *
 * Wymaga: `npm i resend` + RESEND_API_KEY w env.
 * W demo mode (brak API key) — loguje do konsoli i zwraca mock ID.
 *
 * Wszystkie maile mają polskie kopie + plain-text fallback.
 */

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'kontakt@polskie-pogrzeby.pl';
export const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Polskie Pogrzeby';
export const REPLY_TO = process.env.EMAIL_REPLY_TO || FROM_EMAIL;

type ResendLike = any;

let cachedClient: ResendLike | null = null;
let triedRequire = false;

function getResend(): ResendLike | null {
  if (cachedClient) return cachedClient;
  if (triedRequire) return null;
  triedRequire = true;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Resend } = require('resend');
    cachedClient = new Resend(apiKey);
    return cachedClient;
  } catch {
    console.warn('[resend] paczka `resend` niezainstalowana');
    return null;
  }
}

export type EmailTemplate =
  | 'family-confirmation'
  | 'family-offers-ready'
  | 'family-review-request'
  | 'company-new-lead'
  | 'company-payment-success'
  | 'company-payment-failed'
  | 'claim-verification'
  | 'admin-flagged-review'
  | 'booking-confirmation'
  | 'password-reset'
  | 'welcome';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Template rendering                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

function wrapHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#1a2332;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="background:#1a2332;color:#f5e9d4;padding:24px 32px;">
          <div style="font-size:22px;font-weight:600;letter-spacing:0.3px;">Polskie Pogrzeby</div>
          <div style="font-size:13px;opacity:0.7;margin-top:4px;">polskie-pogrzeby.pl</div>
        </td></tr>
        <tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#2a3548;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:#f5e9d4;padding:20px 32px;font-size:12px;color:#6b7280;text-align:center;border-top:1px solid #e8dfd0;">
          Polskie Pogrzeby Sp. z o.o.<br>
          <a href="https://polskie-pogrzeby.pl" style="color:#6b7280;">polskie-pogrzeby.pl</a> &middot;
          <a href="mailto:${FROM_EMAIL}" style="color:#6b7280;">${FROM_EMAIL}</a><br>
          <span style="opacity:0.7;">Otrzymujesz tę wiadomość, ponieważ skorzystałeś z naszego serwisu.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type TemplateData = Record<string, any>;

function render(template: EmailTemplate, data: TemplateData): { subject: string; html: string; text: string } {
  let subject = 'Polskie Pogrzeby';
  let body = '';

  switch (template) {
    case 'family-confirmation':
      subject = 'Otrzymaliśmy Twoje zapytanie';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:#1a2332;">Dziękujemy za Twoje zgłoszenie</h2>
        <p>Witaj ${escapeHtml(data.name || '')},</p>
        <p>Otrzymaliśmy Twoje zapytanie (nr <strong>${escapeHtml(data.leadId || '')}</strong>) i przekazujemy je do wybranych firm pogrzebowych w okolicy.</p>
        <p>W ciągu <strong>24 godzin</strong> skontaktują się z Tobą maksymalnie 3 zakłady z propozycjami i wyceną.</p>
        <p style="margin-top:24px;color:#6b7280;font-size:14px;">Jeśli sytuacja jest pilna, zadzwoń bezpośrednio: <a href="tel:+48800800800" style="color:#1a2332;">800 800 800</a></p>
      `;
      break;

    case 'family-offers-ready':
      subject = 'Twoje oferty są gotowe';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Otrzymałeś ${data.count || 3} propozycji</h2>
        <p>Witaj ${escapeHtml(data.name || '')},</p>
        <p>Firmy pogrzebowe odpowiedziały na Twoje zapytanie. Zobacz oferty:</p>
        <p style="margin:24px 0;text-align:center;">
          <a href="${escapeHtml(data.linkUrl || 'https://polskie-pogrzeby.pl/oferty')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Zobacz oferty</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">Link wygasa za 7 dni.</p>
      `;
      break;

    case 'family-review-request':
      subject = 'Podziel się swoją opinią';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Jak oceniasz obsługę?</h2>
        <p>Witaj ${escapeHtml(data.name || '')},</p>
        <p>Korzystałeś z usług firmy <strong>${escapeHtml(data.companyName || '')}</strong>. Twoja opinia pomoże innym rodzinom dokonać właściwego wyboru.</p>
        <p style="margin:24px 0;text-align:center;">
          <a href="${escapeHtml(data.reviewUrl || '#')}" style="display:inline-block;background:#7c8d54;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Dodaj opinię</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">Opinia jest anonimowa i moderowana.</p>
      `;
      break;

    case 'company-new-lead':
      subject = `Nowe zapytanie (lead score ${data.score || ''})`;
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Otrzymałeś nowe zapytanie</h2>
        <p><strong>Klient:</strong> ${escapeHtml(data.familyName || 'Anonim')}</p>
        <p><strong>Telefon:</strong> <a href="tel:${escapeHtml(data.familyPhone || '')}" style="color:#1a2332;">${escapeHtml(data.familyPhone || '—')}</a></p>
        <p><strong>Miasto:</strong> ${escapeHtml(data.city || '—')}</p>
        <p><strong>Budżet:</strong> ${escapeHtml(data.budget || '—')}</p>
        <p><strong>Pilność:</strong> ${escapeHtml(data.urgency || '—')}</p>
        ${data.message ? `<p><strong>Wiadomość:</strong><br>${escapeHtml(data.message)}</p>` : ''}
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${escapeHtml(data.leadUrl || '#')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Otwórz w panelu</a>
        </p>
        <p style="color:#9b1c1c;font-size:13px;margin-top:16px;">⏰ Odpowiedz w ciągu 30 minut — najwyższa konwersja.</p>
      `;
      break;

    case 'company-payment-success':
      subject = 'Płatność zaksięgowana — plan aktywny';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Dziękujemy za płatność</h2>
        <p>Plan <strong>${escapeHtml(data.plan || 'Pro')}</strong> jest aktywny.</p>
        <p><strong>Kwota:</strong> ${escapeHtml(String(data.amount || ''))} PLN</p>
        <p><strong>Następne odnowienie:</strong> ${escapeHtml(data.nextRenewal || '—')}</p>
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${escapeHtml(data.invoiceUrl || '#')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Pobierz fakturę</a>
        </p>
      `;
      break;

    case 'company-payment-failed':
      subject = '⚠️ Problem z płatnością — wymagane działanie';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:#9b1c1c;">Płatność nie powiodła się</h2>
        <p>Nie udało nam się pobrać opłaty za plan <strong>${escapeHtml(data.plan || '')}</strong>.</p>
        <p>Aby utrzymać aktywne konto, zaktualizuj metodę płatności w ciągu <strong>7 dni</strong>.</p>
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${escapeHtml(data.portalUrl || '#')}" style="display:inline-block;background:#9b1c1c;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Zaktualizuj płatność</a>
        </p>
      `;
      break;

    case 'booking-confirmation':
      subject = 'Potwierdzenie rezerwacji terminu';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Rezerwacja potwierdzona</h2>
        <p>Numer rezerwacji: <strong>${escapeHtml(data.bookingNumber || '')}</strong></p>
        <p><strong>Firma:</strong> ${escapeHtml(data.companyName || '')}</p>
        <p><strong>Termin:</strong> ${escapeHtml(data.date || '')} ${escapeHtml(data.slot || '')}</p>
        <p><strong>Usługa:</strong> ${escapeHtml(data.service || '')}</p>
        <p style="color:#6b7280;font-size:13px;margin-top:24px;">Aby anulować lub przełożyć — odpowiedz na ten e-mail lub zadzwoń do firmy.</p>
      `;
      break;

    case 'claim-verification':
      subject = 'Weryfikacja roszczenia o firmę';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Potwierdź swoje roszczenie</h2>
        <p>Otrzymaliśmy wniosek o przejęcie firmy <strong>${escapeHtml(data.companyName || '')}</strong>.</p>
        <p>Kliknij link, aby potwierdzić (ważny 48h):</p>
        <p style="margin:24px 0;text-align:center;">
          <a href="${escapeHtml(data.verifyUrl || '#')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Potwierdź roszczenie</a>
        </p>
      `;
      break;

    case 'admin-flagged-review':
      subject = `[ADMIN] Nowa opinia oznaczona (${data.score || '?'}/1.0)`;
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;color:#9b1c1c;">Wymaga moderacji</h2>
        <p><strong>Firma:</strong> ${escapeHtml(data.companySlug || '')}</p>
        <p><strong>Powody:</strong> ${escapeHtml(data.reasons || '')}</p>
        <p><strong>Score:</strong> ${escapeHtml(String(data.score || ''))}</p>
        <p style="background:#fef3f3;border-left:3px solid #9b1c1c;padding:12px;margin:16px 0;font-style:italic;">"${escapeHtml(data.body || '')}"</p>
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${escapeHtml(data.adminUrl || 'https://polskie-pogrzeby.pl/admin/opinie')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Otwórz panel admin</a>
        </p>
      `;
      break;

    case 'welcome':
      subject = 'Witamy w Polskich Pogrzebach';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Witaj ${escapeHtml(data.name || '')}</h2>
        <p>Konto zostało utworzone. Dziękujemy, że nam zaufałeś.</p>
        <p>Następne kroki:</p>
        <ul>
          <li>Uzupełnij profil w panelu</li>
          <li>Dodaj zdjęcia i opisy usług</li>
          <li>Włącz powiadomienia o nowych zapytaniach</li>
        </ul>
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${escapeHtml(data.dashboardUrl || 'https://polskie-pogrzeby.pl/panel-firmy')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Otwórz panel</a>
        </p>
      `;
      break;

    case 'password-reset':
      subject = 'Reset hasła';
      body = `
        <h2 style="margin:0 0 16px;font-size:20px;">Reset hasła</h2>
        <p>Kliknij link, aby ustawić nowe hasło (ważny 1h):</p>
        <p style="margin:24px 0;text-align:center;">
          <a href="${escapeHtml(data.resetUrl || '#')}" style="display:inline-block;background:#1a2332;color:#f5e9d4;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Ustaw nowe hasło</a>
        </p>
        <p style="color:#6b7280;font-size:13px;">Jeśli nie prosiłeś o reset — zignoruj tę wiadomość.</p>
      `;
      break;

    default:
      body = `<p>${escapeHtml(JSON.stringify(data))}</p>`;
  }

  const html = wrapHtml(subject, body);
  return { subject, html, text: htmlToText(html) };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Public API                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export async function sendEmail(opts: {
  to: string | string[];
  template: EmailTemplate;
  data: TemplateData;
  replyTo?: string;
}): Promise<{ id: string; _demo?: boolean }> {
  const { to, template, data, replyTo } = opts;
  const rendered = render(template, data);

  const client = getResend();
  if (!client) {
    console.log(`[mock-email] template=${template} to=${Array.isArray(to) ? to.join(',') : to} subject="${rendered.subject}"`);
    return { id: 'mock-' + Date.now(), _demo: true };
  }
  try {
    const res = await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo || REPLY_TO,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: [{ name: 'template', value: template }],
    });
    return { id: res.data?.id || 'unknown' };
  } catch (err: any) {
    console.error('[resend.send] error:', err?.message || err);
    throw err;
  }
}

export const isEmailEnabled = (): boolean => !!process.env.RESEND_API_KEY;
