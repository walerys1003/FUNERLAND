import { NextResponse } from 'next/server';
import { companies as allCompanies } from '@/lib/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MatchRequest = {
  city: string;
  ceremonyType?: 'tradycyjny' | 'kremacja' | 'swiecki' | 'koscielny';
  budget?: 'do-3000' | '3000-5000' | '5000-8000' | 'powyzej-8000' | 'bez-limitu';
  urgency?: 'do-3-dni' | '3-7-dni' | 'powyzej-tygodnia';
  religion?: string;
  needs?: string[];
};

const BUDGET_RANGES: Record<string, [number, number]> = {
  'do-3000': [0, 3000],
  '3000-5000': [3000, 5000],
  '5000-8000': [5000, 8000],
  'powyzej-8000': [8000, 99999],
  'bez-limitu': [0, 99999],
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MatchRequest;
    const { city, budget = 'bez-limitu', urgency, ceremonyType, needs = [] } = body;

    if (!city) {
      return NextResponse.json({ error: 'Wymagane: city' }, { status: 400 });
    }

    const cityLower = city.toLowerCase();
    const [budgetMin, budgetMax] = BUDGET_RANGES[budget] || [0, 99999];

    // Filter & score candidates (rule-based — AI optional via OpenAI)
    const candidates = allCompanies
      .filter((c: any) => {
        const cityMatch = (c.city || '').toLowerCase().includes(cityLower) || cityLower.includes((c.city || '').toLowerCase());
        if (!cityMatch) return false;
        const priceOk = !c.priceFrom || (c.priceFrom <= budgetMax);
        return priceOk;
      })
      .map((c: any) => {
        let score = 50;
        // Rating boost (each 0.5 rating = +5)
        if (c.rating) score += Math.round((c.rating - 3) * 10);
        // Verified
        if (c.isVerified || c.verified) score += 15;
        // 24h availability when urgent
        if (urgency === 'do-3-dni' && (c.availability24h || c.is24h)) score += 10;
        // Budget fit (sweet spot — not too cheap, not too expensive)
        if (c.priceFrom && c.priceFrom >= budgetMin) score += 8;
        // Services overlap with "needs"
        const servicesArr: string[] = c.services || c.categories || [];
        const overlap = needs.filter((n) => servicesArr.some((s) => s.toLowerCase().includes(n.toLowerCase()))).length;
        score += overlap * 5;
        // Cap
        score = Math.max(0, Math.min(100, score));

        const rationale: string[] = [];
        if (c.isVerified || c.verified) rationale.push('zweryfikowana firma');
        if (c.rating && c.rating >= 4.5) rationale.push(`opinie ${c.rating}/5`);
        if (urgency === 'do-3-dni' && (c.availability24h || c.is24h)) rationale.push('dostępność 24h');
        if (overlap > 0) rationale.push(`pokrywa ${overlap} z ${needs.length} potrzeb`);
        if (rationale.length === 0) rationale.push('dobrze dopasowana do lokalizacji i budżetu');

        return {
          companyId: c.id || c.slug,
          slug: c.slug,
          name: c.name,
          city: c.city,
          rating: c.rating,
          priceFrom: c.priceFrom,
          isVerified: c.isVerified || c.verified,
          matchScore: score,
          rationale: rationale.join(', '),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    const summary =
      candidates.length === 0
        ? `Nie znaleźliśmy firm dopasowanych do podanych kryteriów w ${city}. Spróbuj rozszerzyć budżet lub okolicę.`
        : candidates.length < 3
        ? `Znaleźliśmy ${candidates.length} dopasowane firmy w ${city}. Wszystkie spełniają Państwa wymagania budżetowe i lokalizacyjne.`
        : `Wybraliśmy 3 najlepiej dopasowane firmy w ${city} — uwzględniamy opinie, weryfikację, budżet i pilność.`;

    return NextResponse.json({
      matches: candidates,
      summary,
      query: { city, ceremonyType, budget, urgency, needs },
    });
  } catch (e: any) {
    console.error('AI match error:', e);
    return NextResponse.json(
      { error: 'Wystąpił błąd matchingu. Spróbuj proszę ponownie.' },
      { status: 500 }
    );
  }
}
