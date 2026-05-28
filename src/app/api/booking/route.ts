import { NextResponse } from 'next/server';
import { bookingStore, leadStore, messagingStore } from '@/lib/marketplace/store';
import {
  getSlotKindForCategory,
  validateSlot,
} from '@/lib/marketplace/availability';
import { companies } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type BookingRequest = {
  category: string;
  companySlug?: string;
  companyName?: string;
  slotStart?: string;
  slotEnd?: string;
  data: Record<string, any>;
  submittedAt: string;
};

// Rate limit (in-memory; replace with Upstash in production)
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.data.email)) {
    return { ok: false, error: 'Nieprawidłowy format e-mail' };
  }
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
        { status: 429 },
      );
    }

    const body = (await req.json()) as BookingRequest;
    const validation = validate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // If a slot was selected, verify it against availability rules
    if (body.slotStart) {
      const kind = getSlotKindForCategory(body.category);
      const bookedStarts = body.companySlug
        ? bookingStore.bookedSlotsForCompany(body.companySlug)
        : [];
      const v = validateSlot(body.slotStart, kind, {
        companySlug: body.companySlug,
        bookedSlotStarts: bookedStarts,
      });
      if (!v.ok) {
        return NextResponse.json({ error: v.reason }, { status: 409 });
      }
    }

    const number = generateBookingNumber();
    const booking = bookingStore.create({
      number,
      category: body.category,
      companySlug: body.companySlug,
      companyName: body.companyName,
      slotStart: body.slotStart,
      slotEnd: body.slotEnd,
      data: body.data,
      ip,
    });

    // Create lead record(s)
    if (body.companySlug) {
      leadStore.create({
        companySlug: body.companySlug,
        category: body.category,
        city: body.data.city,
        name: body.data.name,
        email: body.data.email,
        phone: body.data.phone,
        message: body.data.notes,
        source: 'booking',
        bookingNumber: number,
      });

      // Open a messaging thread so the family can chat with the company
      messagingStore.ensureThread({
        companySlug: body.companySlug,
        customerEmail: body.data.email,
        customerName: body.data.name,
        subject: `Rezerwacja ${number}`,
        bookingNumber: number,
      });
    } else {
      // No specific company → distribute to top-3 matches in the same city/category
      const cityMatch = (c: any) =>
        !body.data.city ||
        (c.city || '').toLowerCase().includes(body.data.city.toLowerCase());
      const cats: Record<string, string> = {
        'zaklady-pogrzebowe': 'pogrzeby',
        krematoria: 'kremacja',
        'kwiaciarnie-pogrzebowe': 'kwiaciarnie',
        kamieniarze: 'kamieniarze',
        transport: 'transport',
      };
      const targetCat = cats[body.category];
      const matches = companies
        .filter((c) => cityMatch(c) && (!targetCat || c.category === targetCat))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
      for (const m of matches) {
        leadStore.create({
          companySlug: m.slug,
          category: body.category,
          city: body.data.city,
          name: body.data.name,
          email: body.data.email,
          phone: body.data.phone,
          message: body.data.notes,
          source: 'booking',
          bookingNumber: number,
        });
      }
    }

    // TODO: send confirmation email via Resend
    // TODO: send SMS via SMSAPI.pl
    console.log(`[booking] ${number} | ${body.category} | ${body.data.email}`);

    return NextResponse.json({
      ok: true,
      bookingNumber: number,
      booking: {
        number: booking.number,
        category: booking.category,
        companySlug: booking.companySlug,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
        status: booking.status,
      },
      message: 'Zgłoszenie przyjęte. Skontaktujemy się w ciągu 2 godzin.',
    });
  } catch (e: any) {
    console.error('Booking error:', e);
    return NextResponse.json(
      { error: 'Wystąpił błąd. Spróbuj proszę ponownie.' },
      { status: 500 },
    );
  }
}

// GET /api/booking?number=PP-... → return booking summary
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get('number');
  if (!number) return NextResponse.json({ error: 'Brak numeru' }, { status: 400 });
  const b = bookingStore.get(number);
  if (!b) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  return NextResponse.json({
    number: b.number,
    category: b.category,
    companySlug: b.companySlug,
    companyName: b.companyName,
    slotStart: b.slotStart,
    slotEnd: b.slotEnd,
    status: b.status,
    createdAt: b.createdAt,
    contact: {
      name: b.data.name,
      email: b.data.email,
      phone: b.data.phone,
    },
  });
}
