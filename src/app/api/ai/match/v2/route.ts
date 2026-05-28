import { NextResponse } from 'next/server';
import { findMatchesV2, recommendedSort } from '@/lib/ai/matcher';
import { aiMatchRepo } from '@/lib/marketplace/repo';
import type { FilterState } from '@/lib/marketplace/filters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/match/v2
 *
 * Dedicated v2 endpoint that accepts a FilterState-shape payload plus optional
 * AI hints (needs[], urgency, ceremonyType, budget). Returns ranked matches with
 * appliedFilters list and suggested sort key.
 *
 * Body:
 *   {
 *     city?, category?, features?[], verifiedOnly?, phone24hOnly?,
 *     ratingMin?, priceMax?, plan?, query?,
 *     needs?[], urgency?, ceremonyType?, budget?, limit?
 *   }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<FilterState> & {
      needs?: string[];
      urgency?: 'do-3-dni' | '3-7-dni' | 'powyzej-tygodnia';
      ceremonyType?: 'tradycyjny' | 'kremacja' | 'swiecki' | 'koscielny';
      budget?: 'do-3000' | '3000-5000' | '5000-8000' | 'powyzej-8000' | 'bez-limitu';
      limit?: number;
    };

    // Permissive validation — v2 allows query-only or features-only searches
    const hasAny =
      body.city ||
      body.category ||
      body.query ||
      (body.features && body.features.length > 0) ||
      body.verifiedOnly ||
      body.phone24hOnly ||
      (body.needs && body.needs.length > 0);

    if (!hasAny) {
      return NextResponse.json(
        {
          error:
            'Wymagany przynajmniej jeden filtr: city, category, query, features[], verifiedOnly, phone24hOnly lub needs[].',
        },
        { status: 400 },
      );
    }

    const result = findMatchesV2({
      city: body.city,
      category: body.category,
      features: body.features,
      verifiedOnly: body.verifiedOnly,
      phone24hOnly: body.phone24hOnly,
      ratingMin: body.ratingMin,
      priceMax: body.priceMax,
      plan: body.plan,
      query: body.query,
      needs: body.needs,
      urgency: body.urgency,
      ceremonyType: body.ceremonyType,
      budget: body.budget,
      limit: body.limit ?? 5,
    });

    // Fire-and-forget log (returns null in demo mode)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
    const sessionId = req.headers.get('x-pp-session') || undefined;
    const queryId = await aiMatchRepo.log({
      query: body.query,
      filterState: result.query,
      resultsCount: result.matches.length,
      sessionId,
      ip,
    });

    return NextResponse.json({
      ...result,
      suggestedSort: recommendedSort(result.query),
      queryId, // null when Supabase not configured
      version: 'v2',
    });
  } catch (e: any) {
    console.error('AI match v2 error:', e);
    return NextResponse.json(
      { error: 'Wystąpił błąd matchingu v2. Spróbuj proszę ponownie.' },
      { status: 500 },
    );
  }
}

// GET discovery — exposes accepted fields
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/match/v2',
    method: 'POST',
    fields: {
      city: 'string (citySlug or city name)',
      category: 'pogrzeby | kremacja | kwiaciarnie | kamieniarze | transport',
      features: 'string[] (e.g. ["chłodnia","24/7","transmisja"])',
      verifiedOnly: 'boolean — hard filter',
      phone24hOnly: 'boolean — hard filter',
      ratingMin: 'number 0..5',
      priceMax: 'number (PLN, applied to min service price)',
      plan: 'free | standard | pro | premium',
      query: 'string — free text across name/description/district',
      needs: 'string[] — free-text needs (e.g. ["transmisja online"])',
      urgency: 'do-3-dni | 3-7-dni | powyzej-tygodnia',
      ceremonyType: 'tradycyjny | kremacja | swiecki | koscielny',
      budget: 'do-3000 | 3000-5000 | 5000-8000 | powyzej-8000 | bez-limitu',
      limit: 'number (default 5)',
    },
    returns: {
      matches: 'Match[] — { companyId, slug, name, city, rating, priceFrom, isVerified, plan, matchScore, scoreBreakdown[], rationale[] }',
      summary: 'string',
      query: 'normalized MatchQuery',
      appliedFilters: 'string[] — human-readable filter labels',
      suggestedSort: 'SortKey',
      version: 'v2',
    },
  });
}
