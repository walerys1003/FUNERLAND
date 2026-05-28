import { NextResponse } from 'next/server';
import { findMatches, type MatchQuery } from '@/lib/ai/matcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MatchQuery;
    if (!body.city && !body.category) {
      return NextResponse.json(
        { error: 'Wymagany przynajmniej city lub category' },
        { status: 400 },
      );
    }
    const result = findMatches({
      city: body.city,
      category: body.category,
      ceremonyType: body.ceremonyType,
      budget: body.budget,
      urgency: body.urgency,
      needs: Array.isArray(body.needs) ? body.needs : [],
      limit: body.limit ?? 3,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('AI match error:', e);
    return NextResponse.json(
      { error: 'Wystąpił błąd matchingu. Spróbuj proszę ponownie.' },
      { status: 500 },
    );
  }
}

// GET for quick testing
export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get('city') || 'Warszawa';
  const result = findMatches({ city, limit: 3 });
  return NextResponse.json(result);
}
