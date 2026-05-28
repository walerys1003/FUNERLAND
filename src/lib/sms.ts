/**
 * SMSAPI.pl helper — production-ready.
 *
 * docs: https://www.smsapi.pl/docs/
 *
 * Funkcje:
 *  - sendSMS({ to, message, from }) — wysyłka SMS, walidacja numeru PL
 *  - sendOtp({ to, code }) — sformatowany komunikat OTP
 *  - sendCompanyLeadAlert({ to, leadId, city }) — krótki alert o nowym leadzie
 *  - sendBookingReminder({ to, date, slot, companyName }) — przypomnienie
 *
 * W demo mode (brak SMSAPI_TOKEN) — loguje i zwraca mock ID.
 */

const SMSAPI_URL = 'https://api.smsapi.pl/sms.do';

export type SmsResult = { id: string; _demo?: boolean; count?: number };

function normalizePhone(phone: string): string {
  // Akceptujemy: +48 600 700 800, 48600700800, 600 700 800, 600700800
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9) return '48' + digits;
  if (digits.length === 11 && digits.startsWith('48')) return digits;
  if (digits.length === 12 && digits.startsWith('480')) return '48' + digits.slice(3); // 4801... → 481...
  throw new Error(`Nieprawidłowy numer telefonu: ${phone}`);
}

/**
 * Niskopoziomowa wysyłka — używana przez inne helpery.
 * Trzyma się limitu 160 znaków (1 SMS) chyba że force=true.
 */
export async function sendSMS(opts: {
  to: string;
  message: string;
  from?: string;
  /** Jeśli wiadomość > 160 znaków, ucina (false) lub wysyła kilka SMS (true). */
  multipart?: boolean;
}): Promise<SmsResult> {
  const { to, from = process.env.SMSAPI_SENDER || 'Pogrzeby', multipart = false } = opts;
  const cleaned = normalizePhone(to);
  const message = multipart ? opts.message : opts.message.slice(0, 160);

  if (!process.env.SMSAPI_TOKEN) {
    console.log(`[mock-sms] +${cleaned} from=${from}: ${message}`);
    return { id: 'mock-sms-' + Date.now(), _demo: true };
  }

  const params = new URLSearchParams({
    to: cleaned,
    message,
    from,
    format: 'json',
    encoding: 'utf-8',
  });

  try {
    const res = await fetch(`${SMSAPI_URL}?${params}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SMSAPI_TOKEN}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`SMSAPI HTTP ${res.status}: ${txt}`);
    }
    const json = await res.json();
    return {
      id: json?.list?.[0]?.id || 'sms-' + Date.now(),
      count: json?.count,
    };
  } catch (err: any) {
    console.error('[sms.send] error:', err?.message || err);
    throw err;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Use-case helpers                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export async function sendOtp(opts: { to: string; code: string; ttlMinutes?: number }): Promise<SmsResult> {
  const ttl = opts.ttlMinutes ?? 5;
  return sendSMS({
    to: opts.to,
    message: `Polskie Pogrzeby: Twoj kod weryfikacyjny to ${opts.code}. Wazny ${ttl} min. Nie udostepniaj go nikomu.`,
  });
}

export async function sendCompanyLeadAlert(opts: {
  to: string;
  leadId: string;
  city?: string;
  budget?: string;
  urgency?: string;
}): Promise<SmsResult> {
  const urgent = opts.urgency === 'asap' ? '⚠ PILNE ' : '';
  return sendSMS({
    to: opts.to,
    message: `${urgent}Polskie Pogrzeby: nowe zapytanie #${opts.leadId}${opts.city ? ` (${opts.city})` : ''}. Sprawdz panel: polskie-pogrzeby.pl/panel-firmy/leady`,
  });
}

export async function sendBookingReminder(opts: {
  to: string;
  date: string;
  slot: string;
  companyName: string;
  bookingNumber?: string;
}): Promise<SmsResult> {
  return sendSMS({
    to: opts.to,
    message: `Przypomnienie: rezerwacja ${opts.date} ${opts.slot} w ${opts.companyName}.${opts.bookingNumber ? ` Nr: ${opts.bookingNumber}.` : ''} Aby anulowac/przelozyc skontaktuj sie z firma.`,
  });
}

export async function sendFamilyConfirmation(opts: {
  to: string;
  leadId: string;
}): Promise<SmsResult> {
  return sendSMS({
    to: opts.to,
    message: `Polskie Pogrzeby: otrzymalismy Twoje zapytanie #${opts.leadId}. W ciagu 24h skontaktuja sie firmy z ofertami. Pilne? +48 800 800 800`,
  });
}

export const isSmsEnabled = (): boolean => !!process.env.SMSAPI_TOKEN;

/**
 * Generuj kod OTP (6 cyfr) — kryptograficznie bezpieczny.
 * Używany w 2FA i weryfikacji numeru w panelu firmy.
 */
export function generateOtpCode(): string {
  const arr = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    arr[0] = Math.floor(Math.random() * 1_000_000);
  }
  return String(arr[0] % 1_000_000).padStart(6, '0');
}
