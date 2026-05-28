/**
 * Rule-based matcher for finding the best companies given family needs.
 * Pure functions — easy to test. AI assistance is layered on top (re-rank).
 *
 * v2 (Phase 3): adds FilterState-shape inputs (features[], verifiedOnly, phone24hOnly,
 * ratingMin, priceMax, plan, query) and richer scoring breakdown.
 */

import { companies as ALL, type Company } from '@/lib/data';
import type { FilterState, SortKey } from '@/lib/marketplace/filters';

export type MatchQuery = {
  city?: string;
  ceremonyType?: 'tradycyjny' | 'kremacja' | 'swiecki' | 'koscielny';
  category?: 'pogrzeby' | 'kremacja' | 'kwiaciarnie' | 'kamieniarze' | 'transport';
  budget?: 'do-3000' | '3000-5000' | '5000-8000' | 'powyzej-8000' | 'bez-limitu';
  urgency?: 'do-3-dni' | '3-7-dni' | 'powyzej-tygodnia';
  needs?: string[]; // free-text needs e.g. ["transmisja online","obsługa międzynarodowa"]
  limit?: number;
  /** v2: structured feature tags (intersection scored against company.features). */
  features?: string[];
  /** v2: hard filter — only verified companies. */
  verifiedOnly?: boolean;
  /** v2: hard filter — only 24/7 phone availability. */
  phone24hOnly?: boolean;
  /** v2: minimum rating (0..5). */
  ratingMin?: number;
  /** v2: max price filter (uses min company service price). */
  priceMax?: number;
  /** v2: exact plan match (rarely used by family, mostly internal). */
  plan?: Company['plan'];
  /** v2: free-text query across name/description/district. */
  query?: string;
};

export type Match = {
  companyId: string;
  slug: string;
  name: string;
  city: string;
  rating: number;
  priceFrom?: number;
  isVerified: boolean;
  plan: string;
  matchScore: number;
  scoreBreakdown: { label: string; points: number }[];
  rationale: string[];
};

const BUDGET_RANGES: Record<string, [number, number]> = {
  'do-3000': [0, 3000],
  '3000-5000': [3000, 5000],
  '5000-8000': [5000, 8000],
  'powyzej-8000': [8000, 99999],
  'bez-limitu': [0, 99999],
};

function lowestPrice(c: Company): number {
  const arr = c.services?.map((s) => s.from).filter((n) => Number.isFinite(n)) || [];
  return arr.length > 0 ? Math.min(...arr) : 0;
}

export function findMatches(q: MatchQuery): {
  matches: Match[];
  summary: string;
  query: MatchQuery;
} {
  const city = (q.city || '').toLowerCase();
  const [bMin, bMax] = BUDGET_RANGES[q.budget || 'bez-limitu'];
  const limit = q.limit ?? 3;

  const queryText = (q.query || '').toLowerCase().trim();

  const candidates = ALL.filter((c) => {
    if (city && !c.city.toLowerCase().includes(city) && c.citySlug !== q.city) return false;
    if (q.category && c.category !== q.category) return false;
    const min = lowestPrice(c);
    if (min > bMax) return false;
    // v2 hard filters
    if (q.verifiedOnly && !c.isVerified) return false;
    if (q.phone24hOnly && !c.phone24h) return false;
    if (q.plan && c.plan !== q.plan) return false;
    if (q.ratingMin && c.rating < q.ratingMin) return false;
    if (q.priceMax && q.priceMax > 0) {
      const p = lowestPrice(c);
      if (p === 0 || p > q.priceMax) return false;
    }
    if (queryText) {
      const hay = `${c.name} ${c.description || ''} ${c.city} ${c.district || ''}`.toLowerCase();
      if (!hay.includes(queryText)) return false;
    }
    return true;
  });

  const scored: Match[] = candidates.map((c) => {
    const breakdown: { label: string; points: number }[] = [];
    let score = 50;
    breakdown.push({ label: 'baza', points: 50 });

    // Rating boost: each 0.1 above 3.0 = +1 point (max +20)
    const ratingPoints = Math.min(20, Math.max(0, Math.round((c.rating - 3) * 10)));
    if (ratingPoints) {
      score += ratingPoints;
      breakdown.push({ label: `opinie ${c.rating.toFixed(1)}/5`, points: ratingPoints });
    }

    // Reviews count credibility (sqrt scaling, max +10)
    const revPoints = Math.min(10, Math.round(Math.sqrt(c.reviewsCount)));
    if (revPoints) {
      score += revPoints;
      breakdown.push({ label: `${c.reviewsCount} opinii`, points: revPoints });
    }

    // Verified
    if (c.isVerified) {
      score += 8;
      breakdown.push({ label: 'firma zweryfikowana', points: 8 });
    }

    // 24h availability when urgent
    if (q.urgency === 'do-3-dni' && c.phone24h) {
      score += 12;
      breakdown.push({ label: 'dostępność 24/7', points: 12 });
    }

    // Plan tier bonus (premium has higher quality SLA)
    const planBonus = c.plan === 'premium' ? 6 : c.plan === 'pro' ? 4 : c.plan === 'standard' ? 2 : 0;
    if (planBonus) {
      score += planBonus;
      breakdown.push({ label: `plan ${c.plan}`, points: planBonus });
    }

    // Budget fit (sweet spot — within range = +6, very close to top = -2 penalty)
    const min = lowestPrice(c);
    if (min >= bMin && min <= bMax) {
      score += 6;
      breakdown.push({ label: 'cena w budżecie', points: 6 });
    }

    // Experience
    if (c.yearsActive >= 20) {
      score += 4;
      breakdown.push({ label: `${c.yearsActive} lat doświadczenia`, points: 4 });
    }

    // v2: structured features intersection (each match +4, capped +20)
    if (q.features && q.features.length > 0) {
      const have = new Set((c.features || []).map((f) => f.toLowerCase()));
      const matched = q.features.filter((f) => have.has(f.toLowerCase()));
      if (matched.length > 0) {
        const pts = Math.min(20, matched.length * 4);
        score += pts;
        breakdown.push({
          label: `features: ${matched.join(', ')}`,
          points: pts,
        });
      }
    }

    // Free-text needs vs features/services
    if (q.needs && q.needs.length > 0) {
      const hay = [
        ...(c.features || []),
        ...(c.services || []).map((s) => `${s.name} ${s.description || ''}`),
        c.description || '',
      ]
        .join(' ')
        .toLowerCase();
      let hits = 0;
      for (const n of q.needs) {
        if (hay.includes(n.toLowerCase())) hits++;
      }
      if (hits > 0) {
        const pts = hits * 5;
        score += pts;
        breakdown.push({ label: `pokrywa ${hits}/${q.needs.length} potrzeb`, points: pts });
      }
    }

    score = Math.max(0, Math.min(100, score));

    const rationale: string[] = [];
    if (c.isVerified) rationale.push('zweryfikowana firma');
    if (c.rating >= 4.5) rationale.push(`opinie ${c.rating}/5 (${c.reviewsCount})`);
    if (q.urgency === 'do-3-dni' && c.phone24h) rationale.push('dostępność 24h');
    if (c.yearsActive >= 20) rationale.push(`${c.yearsActive} lat na rynku`);
    if (q.features && q.features.length > 0) {
      const have = new Set((c.features || []).map((f) => f.toLowerCase()));
      const matched = q.features.filter((f) => have.has(f.toLowerCase()));
      if (matched.length === q.features.length && matched.length > 0) {
        rationale.push(`spełnia wszystkie ${matched.length} wymagań`);
      } else if (matched.length > 0) {
        rationale.push(`spełnia ${matched.length}/${q.features.length} wymagań`);
      }
    }
    if (rationale.length === 0) rationale.push('dobrze dopasowana lokalnie');

    return {
      companyId: c.slug,
      slug: c.slug,
      name: c.name,
      city: c.city,
      rating: c.rating,
      priceFrom: min || undefined,
      isVerified: c.isVerified,
      plan: c.plan,
      matchScore: score,
      scoreBreakdown: breakdown,
      rationale,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  const top = scored.slice(0, limit);

  const summary =
    top.length === 0
      ? `Nie znaleźliśmy firm dopasowanych do podanych kryteriów${q.city ? ' w ' + q.city : ''}. Spróbuj rozszerzyć budżet lub okolicę.`
      : top.length < limit
        ? `Znaleźliśmy ${top.length} dopasowane firmy${q.city ? ' w ' + q.city : ''}. Wszystkie spełniają Państwa wymagania.`
        : `Wybraliśmy ${limit} najlepiej dopasowanych firm${q.city ? ' w ' + q.city : ''} — uwzględniamy opinie, weryfikację, budżet i pilność.`;

  return { matches: top, summary, query: q };
}

/**
 * v2: Accept FilterState-shape input (used by /firmy listing + /asystent panel).
 * Translates FilterState into MatchQuery and runs findMatches() with all v2 features.
 *
 * Differs from filterCompanies():
 *   - Returns scored Match[] with rationale + breakdown
 *   - Limited to top N (default 5)
 *   - Adds AI-style summary text
 */
export function findMatchesV2(
  state: Partial<FilterState> & { needs?: string[]; limit?: number; urgency?: MatchQuery['urgency']; ceremonyType?: MatchQuery['ceremonyType']; budget?: MatchQuery['budget'] },
): { matches: Match[]; summary: string; query: MatchQuery; appliedFilters: string[] } {
  const applied: string[] = [];
  if (state.city) applied.push(`miasto: ${state.city}`);
  if (state.category) applied.push(`kategoria: ${state.category}`);
  if (state.features && state.features.length) applied.push(`features: ${state.features.join(', ')}`);
  if (state.verifiedOnly) applied.push('tylko zweryfikowane');
  if (state.phone24hOnly) applied.push('24/7');
  if (state.ratingMin) applied.push(`min ocena ${state.ratingMin}`);
  if (state.priceMax) applied.push(`max ${state.priceMax} zł`);
  if (state.plan) applied.push(`plan: ${state.plan}`);
  if (state.query) applied.push(`fraza: "${state.query}"`);

  const q: MatchQuery = {
    city: state.city,
    category: state.category as MatchQuery['category'],
    features: state.features,
    verifiedOnly: state.verifiedOnly,
    phone24hOnly: state.phone24hOnly,
    ratingMin: state.ratingMin,
    priceMax: state.priceMax,
    plan: state.plan,
    query: state.query,
    needs: state.needs,
    limit: state.limit ?? 5,
    urgency: state.urgency,
    ceremonyType: state.ceremonyType,
    budget: state.budget,
  };

  const result = findMatches(q);

  // Override summary to be more filter-aware
  const summary =
    result.matches.length === 0
      ? `Nie znaleźliśmy firm spełniających kryteria${applied.length ? ` (${applied.join(', ')})` : ''}. Spróbuj odpiąć część filtrów lub rozszerzyć budżet/miasto.`
      : `Wybraliśmy ${result.matches.length} najlepiej dopasowanych firm${applied.length ? ` wg kryteriów: ${applied.join(', ')}` : ''}. Ranking uwzględnia opinie, weryfikację, plan oraz dopasowanie do features.`;

  return { matches: result.matches, summary, query: q, appliedFilters: applied };
}

/**
 * Recommended sort key based on query intent — used by v2 caller to render
 * "AI suggests sorting by X" hint.
 */
export function recommendedSort(q: MatchQuery): SortKey {
  if (q.urgency === 'do-3-dni') return 'recommended'; // verified + 24/7 first
  if (q.priceMax || q.budget === 'do-3000') return 'price-asc';
  if (q.ratingMin && q.ratingMin >= 4.5) return 'rating-desc';
  return 'recommended';
}
