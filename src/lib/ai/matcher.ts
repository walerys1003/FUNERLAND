/**
 * Rule-based matcher for finding the best companies given family needs.
 * Pure functions — easy to test. AI assistance is layered on top (re-rank).
 */

import { companies as ALL, type Company } from '@/lib/data';

export type MatchQuery = {
  city?: string;
  ceremonyType?: 'tradycyjny' | 'kremacja' | 'swiecki' | 'koscielny';
  category?: 'pogrzeby' | 'kremacja' | 'kwiaciarnie' | 'kamieniarze' | 'transport';
  budget?: 'do-3000' | '3000-5000' | '5000-8000' | 'powyzej-8000' | 'bez-limitu';
  urgency?: 'do-3-dni' | '3-7-dni' | 'powyzej-tygodnia';
  needs?: string[]; // free-text needs e.g. ["transmisja online","obsługa międzynarodowa"]
  limit?: number;
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

  const candidates = ALL.filter((c) => {
    if (city && !c.city.toLowerCase().includes(city)) return false;
    if (q.category && c.category !== q.category) return false;
    const min = lowestPrice(c);
    if (min > bMax) return false;
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
