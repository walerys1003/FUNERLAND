/**
 * Meilisearch client + index configuration for PolskiePogrzeby.pl
 *
 * Indexes:
 *   - companies  (firmy: zakłady, kwiaciarnie, kamieniarze, transport, krematoria...)
 *   - articles   (poradnik / blog)
 *   - cities     (autocomplete miast)
 *   - obituaries (nekrologi — opcjonalny, public)
 *
 * Mock-friendly: jeśli MEILISEARCH_HOST nieustawiony → klient zwraca dane lokalne (in-memory),
 * dzięki czemu build i dev działają bez instancji Meilisearch.
 */

export type CompanyDocument = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  city: string;
  citySlug?: string;
  voivodeship?: string;
  categories: string[];
  services?: string[];
  priceFrom?: number;
  rating?: number;
  reviewsCount?: number;
  isVerified?: boolean;
  availability24h?: boolean;
  lat?: number;
  lng?: number;
  _geo?: { lat: number; lng: number };
};

export type ArticleDocument = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  date?: string;
  readingTime?: number;
};

export type SearchOptions = {
  filters?: string;
  limit?: number;
  offset?: number;
  sort?: string[];
  attributesToHighlight?: string[];
};

const HOST = process.env.MEILISEARCH_HOST || '';
const KEY = process.env.MEILISEARCH_API_KEY || '';

function isMeiliConfigured(): boolean {
  return Boolean(HOST && KEY);
}

async function meiliRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!isMeiliConfigured()) {
    throw new Error('Meilisearch not configured');
  }
  const res = await fetch(`${HOST}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Meilisearch ${path} → ${res.status}: ${t}`);
  }
  return res.json() as Promise<T>;
}

// ============== INDEX CONFIGURATION ==============

export const INDEX_SETTINGS = {
  companies: {
    searchableAttributes: ['name', 'description', 'city', 'categories', 'services'],
    filterableAttributes: ['citySlug', 'voivodeship', 'categories', 'isVerified', 'availability24h', 'priceFrom', 'rating', '_geo'],
    sortableAttributes: ['rating', 'priceFrom', 'reviewsCount', '_geo'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness', 'rating:desc'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    stopWords: ['i', 'oraz', 'w', 'na', 'do', 'z', 'a', 'jest', 'są'],
    synonyms: {
      pogrzeb: ['pożegnanie', 'ceremonia', 'uroczystość'],
      'zakład pogrzebowy': ['dom pogrzebowy', 'firma pogrzebowa'],
      kremacja: ['spopielenie'],
      'transport zwłok': ['transport ciała', 'przewóz'],
      nagrobek: ['pomnik', 'grobowiec'],
      kwiaty: ['wieńce', 'wiązanki', 'bukiety'],
    },
    faceting: { maxValuesPerFacet: 100 },
    pagination: { maxTotalHits: 1000 },
  },
  articles: {
    searchableAttributes: ['title', 'excerpt', 'category', 'tags'],
    filterableAttributes: ['category', 'tags'],
    sortableAttributes: ['date'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  },
  cities: {
    searchableAttributes: ['name', 'voivodeship'],
    filterableAttributes: ['voivodeship'],
    sortableAttributes: ['companies'],
  },
};

// ============== ADMIN: setup/sync ==============

export async function ensureIndex(name: keyof typeof INDEX_SETTINGS) {
  if (!isMeiliConfigured()) return null;
  try {
    await meiliRequest(`/indexes/${name}`, { method: 'GET' });
  } catch {
    await meiliRequest(`/indexes`, {
      method: 'POST',
      body: JSON.stringify({ uid: name, primaryKey: 'id' }),
    });
  }
  await meiliRequest(`/indexes/${name}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(INDEX_SETTINGS[name]),
  });
  return true;
}

export async function bulkUpsert<T extends { id: string | number }>(
  index: keyof typeof INDEX_SETTINGS,
  documents: T[]
) {
  if (!isMeiliConfigured() || documents.length === 0) return null;
  return meiliRequest(`/indexes/${index}/documents`, {
    method: 'POST',
    body: JSON.stringify(documents),
  });
}

export async function deleteDocument(index: keyof typeof INDEX_SETTINGS, id: string | number) {
  if (!isMeiliConfigured()) return null;
  return meiliRequest(`/indexes/${index}/documents/${id}`, { method: 'DELETE' });
}

// ============== SEARCH ==============

export async function searchCompanies(query: string, opts: SearchOptions = {}) {
  if (!isMeiliConfigured()) {
    return mockSearchCompanies(query, opts);
  }
  return meiliRequest<{ hits: CompanyDocument[]; estimatedTotalHits: number; processingTimeMs: number }>(
    `/indexes/companies/search`,
    {
      method: 'POST',
      body: JSON.stringify({
        q: query,
        filter: opts.filters,
        limit: opts.limit ?? 20,
        offset: opts.offset ?? 0,
        sort: opts.sort,
        attributesToHighlight: opts.attributesToHighlight || ['name', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      }),
    }
  );
}

export async function searchArticles(query: string, opts: SearchOptions = {}) {
  if (!isMeiliConfigured()) {
    return mockSearchArticles(query, opts);
  }
  return meiliRequest<{ hits: ArticleDocument[]; estimatedTotalHits: number; processingTimeMs: number }>(
    `/indexes/articles/search`,
    {
      method: 'POST',
      body: JSON.stringify({
        q: query,
        filter: opts.filters,
        limit: opts.limit ?? 10,
        offset: opts.offset ?? 0,
      }),
    }
  );
}

// ============== MOCK FALLBACK (build/dev safe) ==============

async function mockSearchCompanies(query: string, opts: SearchOptions = {}): Promise<any> {
  const { companies } = await import('@/lib/data');
  const q = query.toLowerCase().trim();
  const limit = opts.limit ?? 20;
  const filtered = (companies as any[]).filter((c) => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.categories || []).some((cat: string) => cat.toLowerCase().includes(q))
    );
  });
  return {
    hits: filtered.slice(0, limit),
    estimatedTotalHits: filtered.length,
    processingTimeMs: 1,
    mock: true,
  };
}

async function mockSearchArticles(query: string, opts: SearchOptions = {}): Promise<any> {
  const { articles } = await import('@/lib/data');
  const q = query.toLowerCase().trim();
  const filtered = (articles as any[]).filter((a) =>
    !q ? true : a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q)
  );
  return {
    hits: filtered.slice(0, opts.limit ?? 10),
    estimatedTotalHits: filtered.length,
    processingTimeMs: 1,
    mock: true,
  };
}

// ============== STATUS ==============

export function meilisearchStatus() {
  return {
    configured: isMeiliConfigured(),
    host: HOST ? HOST.replace(/^https?:\/\//, '').slice(0, 30) + '...' : null,
  };
}
