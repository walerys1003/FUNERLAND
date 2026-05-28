// SMSAPI.pl helper
// docs: https://www.smsapi.pl/docs/

const SMSAPI_URL = 'https://api.smsapi.pl/sms.do';

export async function sendSMS({
  to,
  message,
  from = process.env.SMSAPI_SENDER || 'Pogrzeby',
}: {
  to: string;
  message: string;
  from?: string;
}) {
  if (!process.env.SMSAPI_TOKEN) {
    console.log(`[mock-sms] ${to}: ${message}`);
    return { id: 'mock-sms-' + Date.now() };
  }

  const cleaned = to.replace(/\s+/g, '').replace(/^\+/, '');
  if (!/^48[0-9]{9}$/.test(cleaned)) {
    throw new Error('Nieprawidłowy numer (wymagany format: +48xxxxxxxxx)');
  }

  const params = new URLSearchParams({
    to: cleaned,
    message: message.slice(0, 160), // 1 SMS = 160 znaków
    from,
    format: 'json',
    encoding: 'utf-8',
  });

  const res = await fetch(`${SMSAPI_URL}?${params}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SMSAPI_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`SMSAPI error: ${res.status}`);
  }

  return res.json();
}
