import { NextResponse } from 'next/server';
import { findMatches, findMatchesV2, type MatchQuery } from '@/lib/ai/matcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/match
 *
 * Backward-compatible: accepts legacy MatchQuery shape (city/category/budget/...)
 * AND v2 FilterState shape (features[]/verifiedOnly/phone24hOnly/ratingMin/priceMax/query).
 *
 * If body contains any v2 field, we route to findMatchesV2() and include appliedFilters.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MatchQuery & {
      features?: string[];
      verifiedOnly?: boolean;
      phone24hOnly?: boolean;
      ratingMin?: number;
      priceMax?: number;
      query?: string;
      plan?: MatchQuery['plan'];
    };

    if (!body.city && !body.category && !body.query) {
      return NextResponse.json(
        { error: 'Wymagany przynajmniej city, category lub query' },
        { status: 400 },
      );
    }

    const hasV2Fields =
      Array.isArray(body.features) ||
      body.verifiedOnly !== undefined ||
      body.phone24hOnly !== undefined ||
      body.ratingMin !== undefined ||
      body.priceMax !== undefined ||
      body.plan !== undefined ||
      body.query !== undefined;

    if (hasV2Fields) {
      const result = findMatchesV2({
        city: body.city,
        category: body.category as any,
        features: body.features,
        verifiedOnly: body.verifiedOnly,
        phone24hOnly: body.phone24hOnly,
        ratingMin: body.ratingMin,
        priceMax: body.priceMax,
        plan: body.plan,
        query: body.query,
        needs: Array.isArray(body.needs) ? body.needs : undefined,
        urgency: body.urgency,
        ceremonyType: body.ceremonyType,
        budget: body.budget,
        limit: body.limit ?? 5,
      });
      return NextResponse.json({ ...result, version: 'v2' });
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
    return NextResponse.json({ ...result, version: 'v1' });
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
  return NextResponse.json({ ...result, version: 'v1' });
}
