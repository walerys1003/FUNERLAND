import { NextResponse } from 'next/server';
import { searchCompanies, searchArticles } from '@/lib/search/meilisearch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'all';
  const city = url.searchParams.get('city');
  const category = url.searchParams.get('category');
  const verified = url.searchParams.get('verified');
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  // Build filter string for Meilisearch
  const filters: string[] = [];
  if (city) filters.push(`citySlug = "${city}"`);
  if (category) filters.push(`categories = "${category}"`);
  if (verified === 'true') filters.push(`isVerified = true`);
  const filterStr = filters.length > 0 ? filters.join(' AND ') : undefined;

  try {
    if (type === 'companies') {
      const result = await searchCompanies(q, { filters: filterStr, limit });
      return NextResponse.json(result);
    }
    if (type === 'articles') {
      const result = await searchArticles(q, { limit });
      return NextResponse.json(result);
    }

    // Federated (all)
    const [companies, articles] = await Promise.all([
      searchCompanies(q, { filters: filterStr, limit: 10 }),
      searchArticles(q, { limit: 5 }),
    ]);
    return NextResponse.json({
      companies,
      articles,
      query: q,
    });
  } catch (e: any) {
    console.error('Search error:', e);
    return NextResponse.json(
      { error: 'Wyszukiwanie chwilowo niedostępne.' },
      { status: 500 }
    );
  }
}
