import { NextResponse } from 'next/server';
import {
  generateSlotsForRange,
  getSlotKindForCategory,
} from '@/lib/marketplace/availability';
import { bookingStore } from '@/lib/marketplace/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/availability?category=zaklady-pogrzebowe&company=zaklad-kalla&days=14
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const company = searchParams.get('company') || undefined;
  const days = Math.min(parseInt(searchParams.get('days') || '14', 10) || 14, 30);
  const from = searchParams.get('from');

  if (!category) {
    return NextResponse.json({ error: 'Brak parametru category' }, { status: 400 });
  }

  const start = from ? new Date(from) : new Date();
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Niepoprawna data from' }, { status: 400 });
  }
  start.setHours(0, 0, 0, 0);

  const kind = getSlotKindForCategory(category);
  const bookedSlotStarts = company ? bookingStore.bookedSlotsForCompany(company) : [];
  const range = generateSlotsForRange(start, days, kind, {
    companySlug: company,
    bookedSlotStarts,
  });

  const availableCount = range.reduce(
    (a, d) => a + d.slots.filter((s) => s.available).length,
    0,
  );

  return NextResponse.json({
    category,
    company: company || null,
    kind,
    from: start.toISOString(),
    days: range.length,
    availableCount,
    range,
  });
}
