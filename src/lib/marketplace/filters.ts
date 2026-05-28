/**
 * Marketplace filter + sort helpers.
 *
 * Single source of truth for /firmy listing page, /porownaj comparison page,
 * and any other surface that filters companies.
 */

import { companies as ALL_COMPANIES, type Company } from '@/lib/data';

export type SortKey =
  | 'recommended' // verified + plan + rating
  | 'rating-desc'
  | 'reviews-desc'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc';

export type FilterState = {
  city?: string; // citySlug
  category?: Company['category'];
  features?: string[]; // ANY-of match (chłodnia, kaplica, 24/7, transmisja, transport-miedzynarodowy)
  ratingMin?: number; // 0..5
  priceMax?: number; // PLN — minimum service price from
  plan?: Company['plan']; // exact
  verifiedOnly?: boolean;
  phone24hOnly?: boolean;
  query?: string; // text search across name/description/district
  sort?: SortKey;
};

const PLAN_RANK: Record<Company['plan'], number> = {
  premium: 4,
  pro: 3,
  standard: 2,
  free: 1,
};

/** Return min service "from" price for a company. */
export function minPrice(c: Company): number {
  if (!c.services?.length) return 0;
  return Math.min(...c.services.map((s) => s.from || 0).filter((n) => n > 0)) || 0;
}

/** All feature tags present across the dataset (deduped, sorted). */
export function allFeatures(): string[] {
  const set = new Set<string>();
  ALL_COMPANIES.forEach((c) => c.features?.forEach((f) => set.add(f)));
  return Array.from(set).sort();
}

/** Distinct cities present in companies dataset. */
export function citiesInUse(): { slug: string; name: string; count: number }[] {
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const c of ALL_COMPANIES) {
    const entry = map.get(c.citySlug) || { slug: c.citySlug, name: c.city, count: 0 };
    entry.count++;
    map.set(c.citySlug, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function categoriesInUse(): { slug: string; name: string; count: number }[] {
  const labels: Record<Company['category'], string> = {
    pogrzeby: 'Zakłady pogrzebowe',
    kremacja: 'Kremacja',
    kwiaciarnie: 'Kwiaciarnie pogrzebowe',
    kamieniarze: 'Kamieniarze',
    transport: 'Transport',
  };
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const c of ALL_COMPANIES) {
    const entry = map.get(c.category) || {
      slug: c.category,
      name: labels[c.category],
      count: 0,
    };
    entry.count++;
    map.set(c.category, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/** Apply filters to the full company dataset. */
export function filterCompanies(state: FilterState): Company[] {
  let out = ALL_COMPANIES.slice();
  if (state.city) out = out.filter((c) => c.citySlug === state.city);
  if (state.category) out = out.filter((c) => c.category === state.category);
  if (state.verifiedOnly) out = out.filter((c) => c.isVerified);
  if (state.phone24hOnly) out = out.filter((c) => c.phone24h);
  if (state.plan) out = out.filter((c) => c.plan === state.plan);
  if (state.ratingMin && state.ratingMin > 0) {
    out = out.filter((c) => c.rating >= (state.ratingMin || 0));
  }
  if (state.priceMax && state.priceMax > 0) {
    out = out.filter((c) => {
      const p = minPrice(c);
      return p > 0 && p <= (state.priceMax || Infinity);
    });
  }
  if (state.features && state.features.length > 0) {
    const want = new Set(state.features);
    out = out.filter((c) => c.features?.some((f) => want.has(f)));
  }
  if (state.query && state.query.trim()) {
    const q = state.query.toLowerCase().trim();
    out = out.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q),
    );
  }
  return sortCompanies(out, state.sort || 'recommended');
}

export function sortCompanies(arr: Company[], sort: SortKey): Company[] {
  const out = arr.slice();
  switch (sort) {
    case 'rating-desc':
      return out.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    case 'reviews-desc':
      return out.sort((a, b) => b.reviewsCount - a.reviewsCount);
    case 'price-asc':
      return out.sort((a, b) => (minPrice(a) || 99999) - (minPrice(b) || 99999));
    case 'price-desc':
      return out.sort((a, b) => (minPrice(b) || 0) - (minPrice(a) || 0));
    case 'name-asc':
      return out.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    case 'recommended':
    default:
      return out.sort((a, b) => {
        // 1) verified first
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        // 2) plan rank
        const planDiff = PLAN_RANK[b.plan] - PLAN_RANK[a.plan];
        if (planDiff !== 0) return planDiff;
        // 3) rating
        if (b.rating !== a.rating) return b.rating - a.rating;
        // 4) reviews count
        return b.reviewsCount - a.reviewsCount;
      });
  }
}

/** Polish-friendly labels for known feature tags. */
export const FEATURE_LABELS: Record<string, string> = {
  'chłodnia': 'Chłodnia',
  'kaplica': 'Kaplica',
  '24/7': 'Czynne 24/7',
  'transmisja': 'Transmisja online',
  'transport-miedzynarodowy': 'Transport międzynarodowy',
  'parking': 'Parking',
  'wheelchair': 'Dostęp dla niepełnosprawnych',
};

export function featureLabel(key: string): string {
  return FEATURE_LABELS[key] || key;
}

/** Parse FilterState from URLSearchParams. */
export function filterStateFromParams(sp: URLSearchParams | Record<string, string | undefined>): FilterState {
  const get = (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) || undefined;
    return (sp as any)[k] || undefined;
  };
  const features = get('features');
  return {
    city: get('miasto'),
    category: (get('kategoria') as any) || undefined,
    features: features ? features.split(',').filter(Boolean) : undefined,
    ratingMin: get('rating') ? Number(get('rating')) : undefined,
    priceMax: get('cena') ? Number(get('cena')) : undefined,
    plan: (get('plan') as any) || undefined,
    verifiedOnly: get('verified') === '1',
    phone24hOnly: get('24h') === '1',
    query: get('q'),
    sort: (get('sort') as SortKey) || 'recommended',
  };
}

/** Serialize FilterState → URLSearchParams for ?-style links. */
export function filterStateToQuery(state: FilterState): string {
  const sp = new URLSearchParams();
  if (state.city) sp.set('miasto', state.city);
  if (state.category) sp.set('kategoria', state.category);
  if (state.features && state.features.length) sp.set('features', state.features.join(','));
  if (state.ratingMin) sp.set('rating', String(state.ratingMin));
  if (state.priceMax) sp.set('cena', String(state.priceMax));
  if (state.plan) sp.set('plan', state.plan);
  if (state.verifiedOnly) sp.set('verified', '1');
  if (state.phone24hOnly) sp.set('24h', '1');
  if (state.query) sp.set('q', state.query);
  if (state.sort && state.sort !== 'recommended') sp.set('sort', state.sort);
  return sp.toString();
}
