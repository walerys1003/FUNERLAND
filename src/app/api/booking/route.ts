import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BookingRequest = {
  category: string;
  companySlug?: string;
  companyName?: string;
  data: Record<string, any>;
  submittedAt: string;
};

// Same rate limiting as /api/ai/chat but stricter (booking = high-value)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function validate(body: BookingRequest): { ok: boolean; error?: string } {
  if (!body.category) return { ok: false, error: 'Brak kategorii' };
  if (!body.data) return { ok: false, error: 'Brak danych' };
  if (!body.data.name) return { ok: false, error: 'Imię i nazwisko są wymagane' };
  if (!body.data.phone) return { ok: false, error: 'Telefon jest wymagany' };
  if (!body.data.email) return { ok: false, error: 'E-mail jest wymagany' };
  if (!body.data.rodo) return { ok: false, error: 'Wymagana jest zgoda RODO' };
  // Email check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.data.email)) {
    return { ok: false, error: 'Nieprawidłowy format e-mail' };
  }
  // Phone check (PL +48 or 9 digits)
  const phoneClean = body.data.phone.replace(/\D/g, '');
  if (phoneClean.length < 9 || phoneClean.length > 11) {
    return { ok: false, error: 'Nieprawidłowy numer telefonu' };
  }
  return { ok: true };
}

function generateBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PP-${ts}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Zbyt wiele zgłoszeń. Spróbuj proszę za chwilę.' },
        { status: 429 }
      );
    }

    const body = (await req.json()) as BookingRequest;
    const validation = validate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bookingNumber = generateBookingNumber();

    // TODO: persist to Supabase
    // await supabaseAdmin.from('bookings').insert({
    //   number: bookingNumber,
    //   category: body.category,
    //   company_slug: body.companySlug,
    //   payload: body.data,
    //   submitted_at: body.submittedAt,
    //   ip,
    //   status: 'new',
    // });

    // TODO: send notification email to user
    // await sendEmail({
    //   to: body.data.email,
    //   template: 'booking-confirmation',
    //   data: { bookingNumber, category: body.category, ... }
    // });

    // TODO: route to companies (if no specific company chosen → top 3 match)

    console.log(`[booking] ${bookingNumber} | ${body.category} | ${body.data.email}`);

    return NextResponse.json({
      ok: true,
      bookingNumber,
      message: 'Zgłoszenie przyjęte. Skontaktujemy się w ciągu 2 godzin.',
    });
  } catch (e: any) {
    console.error('Booking error:', e);
    return NextResponse.json(
      { error: 'Wystąpił błąd. Spróbuj proszę ponownie.' },
      { status: 500 }
    );
  }
}
