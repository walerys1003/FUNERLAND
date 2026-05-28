#!/usr/bin/env node
/**
 * Meilisearch sync worker — full re-index from Supabase to Meili
 * Run: node workers/meili-sync.mjs
 * Cron: every 6h (or trigger via Supabase webhook on companies INSERT/UPDATE)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://meilisearch:7700';
const MEILI_KEY = process.env.MEILISEARCH_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !MEILI_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEILISEARCH_API_KEY');
  process.exit(1);
}

async function supabaseQuery(table, select = '*', filter = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status}`);
  return res.json();
}

async function meiliUpsert(index, docs) {
  const res = await fetch(`${MEILI_HOST}/indexes/${index}/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MEILI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(docs),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Meili upsert ${index}: ${res.status} - ${t}`);
  }
  return res.json();
}

async function ensureIndex(uid, primaryKey = 'id', settings = {}) {
  // create if not exists
  await fetch(`${MEILI_HOST}/indexes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MEILI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, primaryKey }),
  });
  // apply settings
  if (Object.keys(settings).length > 0) {
    await fetch(`${MEILI_HOST}/indexes/${uid}/settings`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${MEILI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
  }
}

async function syncCompanies() {
  console.log('[sync] Fetching companies from Supabase...');
  const companies = await supabaseQuery(
    'companies',
    '*,city:cities(slug,name,voivodeship),services:company_services(*)'
  );
  console.log(`[sync] Got ${companies.length} companies`);

  const docs = companies.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    city: c.city?.name || '',
    citySlug: c.city?.slug || '',
    voivodeship: c.city?.voivodeship,
    categories: c.categories || [],
    services: (c.services || []).map((s) => s.name),
    priceFrom: c.price_from,
    rating: c.rating,
    reviewsCount: c.reviews_count,
    isVerified: c.is_verified,
    availability24h: c.availability_24h,
    lat: c.lat,
    lng: c.lng,
    _geo: c.lat && c.lng ? { lat: c.lat, lng: c.lng } : undefined,
  }));

  await ensureIndex('companies', 'id', {
    searchableAttributes: ['name', 'description', 'city', 'categories', 'services'],
    filterableAttributes: ['citySlug', 'voivodeship', 'categories', 'isVerified', 'availability24h', 'priceFrom', 'rating', '_geo'],
    sortableAttributes: ['rating', 'priceFrom', 'reviewsCount', '_geo'],
    typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
    synonyms: {
      pogrzeb: ['pożegnanie', 'ceremonia'],
      'zakład pogrzebowy': ['dom pogrzebowy', 'firma pogrzebowa'],
      kremacja: ['spopielenie'],
    },
  });

  await meiliUpsert('companies', docs);
  console.log(`[sync] Indexed ${docs.length} companies`);
}

async function syncCities() {
  console.log('[sync] Fetching cities from Supabase...');
  const cities = await supabaseQuery('cities');
  console.log(`[sync] Got ${cities.length} cities`);

  await ensureIndex('cities', 'id', {
    searchableAttributes: ['name', 'voivodeship'],
    sortableAttributes: ['population'],
  });
  await meiliUpsert('cities', cities);
  console.log(`[sync] Indexed ${cities.length} cities`);
}

async function main() {
  const start = Date.now();
  try {
    await syncCompanies();
    await syncCities();
    console.log(`[sync] DONE in ${Date.now() - start}ms`);
  } catch (e) {
    console.error('[sync] FAILED:', e.message);
    process.exit(1);
  }
}

// Run once or loop based on env
if (process.env.MEILI_SYNC_INTERVAL) {
  const intervalMs = parseInt(process.env.MEILI_SYNC_INTERVAL, 10) * 1000;
  console.log(`[sync] Running every ${intervalMs}ms`);
  main();
  setInterval(main, intervalMs);
} else {
  main();
}
