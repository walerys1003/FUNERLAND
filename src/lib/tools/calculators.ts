/**
 * Calculator engine — pure functions for funeral cost / benefit estimation.
 *
 * Data sources: ZUS (zasiłek pogrzebowy), public price benchmarks 2026,
 * standard credit amortization. All numbers are best-effort estimates and
 * MUST be shown with a disclaimer in the UI ("szacunek, nie oferta").
 */

// --- ZUS zasiłek pogrzebowy ---------------------------------------------------

/** ZUS funeral benefit (zasiłek pogrzebowy) — flat amount since 2011, plans to raise in 2026. */
export const ZUS_BENEFIT_PLN = 4000;
export const ZUS_BENEFIT_FAMILY_PLN = 4000; // for family
export const ZUS_BENEFIT_NON_FAMILY_PLN = 4000; // capped at actual costs

export type ZasilekInput = {
  isFamily: boolean; // członek rodziny ZUS-owca
  isInsured: boolean; // zmarły ubezpieczony / emeryt / rencista
  actualCosts?: number; // koszty pogrzebu w zł (dla osób spoza rodziny)
};

export type ZasilekResult = {
  eligible: boolean;
  amount: number;
  reason: string;
  documents: string[];
  deadline: string;
};

export function calcZasilek(input: ZasilekInput): ZasilekResult {
  const docs = [
    'Wniosek o wypłatę zasiłku (Z-12) – dostępny w ZUS',
    'Skrócony odpis aktu zgonu',
    'Oryginały faktur dokumentujących koszty pogrzebu (na nazwisko wnioskodawcy)',
    'Dokumenty potwierdzające pokrewieństwo (jeśli rodzina)',
    'Zaświadczenie płatnika składek o ubezpieczeniu zmarłego (lub legitymacja emeryta/rencisty)',
  ];

  if (!input.isInsured) {
    return {
      eligible: false,
      amount: 0,
      reason:
        'Zasiłek pogrzebowy z ZUS przysługuje tylko jeśli zmarły był ubezpieczony, pobierał emeryturę/rentę lub spełniał warunki do jednego z tych świadczeń.',
      documents: docs,
      deadline: '12 miesięcy od dnia śmierci',
    };
  }

  if (input.isFamily) {
    return {
      eligible: true,
      amount: ZUS_BENEFIT_FAMILY_PLN,
      reason:
        'Pełna kwota zasiłku przysługuje członkom rodziny (małżonek, dzieci, rodzice, dziadkowie, wnuki, rodzeństwo).',
      documents: docs,
      deadline: '12 miesięcy od dnia śmierci',
    };
  }

  // not family — capped at actual costs
  const actual = Math.max(0, input.actualCosts || 0);
  return {
    eligible: true,
    amount: Math.min(ZUS_BENEFIT_NON_FAMILY_PLN, actual),
    reason:
      actual >= ZUS_BENEFIT_NON_FAMILY_PLN
        ? 'Dla osób spoza rodziny — kwota ograniczona do 4 000 zł (lub do wysokości udokumentowanych kosztów).'
        : `Dla osób spoza rodziny — kwota nie może przekroczyć poniesionych kosztów (${actual.toLocaleString('pl-PL')} zł).`,
    documents: docs,
    deadline: '12 miesięcy od dnia śmierci',
  };
}

// --- Koszt pogrzebu ----------------------------------------------------------

export type FuneralType = 'tradycyjny' | 'kremacja' | 'ekologiczny';
export type CoffinTier = 'standard' | 'sredni' | 'premium' | 'luksus';

export type FuneralCostInput = {
  type: FuneralType;
  city: string; // free-text; we lookup multiplier by name
  coffin: CoffinTier;
  ceremony: boolean; // kaplica + ksiądz
  flowers: boolean;
  transport: boolean;
  stipa: boolean; // stypa / catering
  cemetery: boolean; // opłata cmentarna
  attendees?: number; // dla stypy
};

export type CostLine = {
  label: string;
  amount: number;
  note?: string;
};

export type FuneralCostResult = {
  lines: CostLine[];
  subtotal: number;
  zusBenefit: number;
  total: number;
  outOfPocket: number;
  cityMultiplier: number;
};

// City cost multipliers (rough benchmark 2026)
const CITY_MULT: Record<string, number> = {
  warszawa: 1.25,
  krakow: 1.15,
  kraków: 1.15,
  wroclaw: 1.1,
  wrocław: 1.1,
  poznan: 1.05,
  poznań: 1.05,
  gdansk: 1.1,
  gdańsk: 1.1,
  lodz: 1.0,
  łódź: 1.0,
  szczecin: 0.95,
  bydgoszcz: 0.95,
  lublin: 0.95,
  katowice: 1.05,
  bialystok: 0.9,
  białystok: 0.9,
  default: 0.9,
};

function cityMult(city: string): number {
  const key = city.toLowerCase().trim();
  return CITY_MULT[key] ?? CITY_MULT.default;
}

const COFFIN_PRICE: Record<CoffinTier, number> = {
  standard: 1200,
  sredni: 2400,
  premium: 4500,
  luksus: 9000,
};

const URN_PRICE: Record<CoffinTier, number> = {
  standard: 350,
  sredni: 700,
  premium: 1400,
  luksus: 2800,
};

export function calcFuneralCost(input: FuneralCostInput): FuneralCostResult {
  const mult = cityMult(input.city || '');
  const lines: CostLine[] = [];

  // base service (zakład pogrzebowy)
  const baseService = input.type === 'kremacja' ? 1800 : input.type === 'ekologiczny' ? 2400 : 2200;
  lines.push({
    label: input.type === 'kremacja' ? 'Kremacja + obsługa zakładu' : 'Obsługa zakładu pogrzebowego',
    amount: Math.round(baseService * mult),
  });

  // coffin or urn
  if (input.type === 'kremacja') {
    lines.push({
      label: `Urna (${input.coffin})`,
      amount: URN_PRICE[input.coffin],
    });
  } else {
    lines.push({
      label: `Trumna (${input.coffin})`,
      amount: COFFIN_PRICE[input.coffin],
    });
  }

  if (input.ceremony) {
    lines.push({
      label: 'Ceremonia religijna / świecka',
      amount: Math.round(800 * mult),
      note: 'kaplica + celebrant',
    });
  }
  if (input.flowers) {
    lines.push({
      label: 'Kwiaty (wieniec + dekoracje)',
      amount: Math.round(450 * mult),
    });
  }
  if (input.transport) {
    lines.push({
      label: 'Transport zmarłego i karawan',
      amount: Math.round(600 * mult),
    });
  }
  if (input.cemetery) {
    lines.push({
      label: 'Opłata cmentarna (grób / nisza)',
      amount: input.type === 'kremacja' ? 800 : Math.round(2400 * mult),
      note: input.type === 'kremacja' ? 'nisza w kolumbarium' : 'grób ziemny / murowany',
    });
  }
  if (input.stipa) {
    const attendees = Math.max(10, Math.min(input.attendees || 30, 300));
    lines.push({
      label: `Stypa (${attendees} osób, ok. 70 zł/os.)`,
      amount: Math.round(attendees * 70 * mult),
    });
  }

  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const zusBenefit = ZUS_BENEFIT_PLN;
  const outOfPocket = Math.max(0, subtotal - zusBenefit);

  return {
    lines,
    subtotal,
    zusBenefit,
    total: subtotal,
    outOfPocket,
    cityMultiplier: mult,
  };
}

// --- Kredyt / raty -----------------------------------------------------------

export type LoanInput = {
  amount: number;
  months: number; // 6..60
  annualRate: number; // % e.g. 12.5
};

export type LoanResult = {
  monthly: number;
  totalPaid: number;
  totalInterest: number;
  rrso: number; // approximation
};

export function calcLoan(input: LoanInput): LoanResult {
  const P = Math.max(500, input.amount);
  const n = Math.max(1, Math.min(input.months, 120));
  const r = Math.max(0, input.annualRate) / 100 / 12;
  let monthly: number;
  if (r === 0) {
    monthly = P / n;
  } else {
    monthly = (P * r) / (1 - Math.pow(1 + r, -n));
  }
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - P;
  // simple RRSO approximation: APR with no fees, equals nominal here
  const rrso = input.annualRate;
  return {
    monthly: Math.round(monthly * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    rrso,
  };
}

// --- Porównanie ofert (3 zakłady) -------------------------------------------

export type OfferInput = {
  name: string;
  service: number;
  coffin: number;
  ceremony: number;
  extras: number;
  rating?: number; // 1..5
  responseHours?: number; // SLA odpowiedzi
};

export type OfferScored = OfferInput & {
  total: number;
  scoreValue: number; // 0..100 — niższy koszt = wyżej
  scoreQuality: number; // 0..100 — wyższa ocena = wyżej
  scoreSpeed: number; // 0..100 — niższe godziny = wyżej
  scoreOverall: number; // 0..100
  rank: number;
  recommendation?: string;
};

export function compareOffers(offers: OfferInput[]): OfferScored[] {
  const withTotals = offers.map((o) => ({
    ...o,
    total: (o.service || 0) + (o.coffin || 0) + (o.ceremony || 0) + (o.extras || 0),
  }));
  if (withTotals.length === 0) return [];

  const minTotal = Math.min(...withTotals.map((o) => o.total));
  const maxTotal = Math.max(...withTotals.map((o) => o.total));
  const maxRating = Math.max(...withTotals.map((o) => o.rating || 0), 5);
  const minSpeed = Math.min(...withTotals.map((o) => o.responseHours ?? 24));
  const maxSpeed = Math.max(...withTotals.map((o) => o.responseHours ?? 24));

  const scored: OfferScored[] = withTotals.map((o) => {
    const range = maxTotal - minTotal || 1;
    const scoreValue = Math.round(100 - ((o.total - minTotal) / range) * 100);
    const scoreQuality = Math.round(((o.rating || 0) / maxRating) * 100);
    const speedRange = maxSpeed - minSpeed || 1;
    const scoreSpeed = Math.round(100 - (((o.responseHours ?? 24) - minSpeed) / speedRange) * 100);
    const scoreOverall = Math.round(scoreValue * 0.4 + scoreQuality * 0.4 + scoreSpeed * 0.2);
    return {
      ...o,
      scoreValue,
      scoreQuality,
      scoreSpeed,
      scoreOverall,
      rank: 0,
    };
  });

  scored.sort((a, b) => b.scoreOverall - a.scoreOverall);
  scored.forEach((s, i) => {
    s.rank = i + 1;
    if (i === 0) s.recommendation = 'Najlepszy stosunek jakości do ceny';
    else if (s.total === minTotal) s.recommendation = 'Najniższa cena';
    else if ((s.rating || 0) >= 4.5) s.recommendation = 'Najwyżej oceniany';
  });

  return scored;
}

// --- Formatery ---------------------------------------------------------------

export function fmtPLN(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function fmtPLN2(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
