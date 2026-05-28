import { NextResponse } from 'next/server';
import { embeddingIndex } from '@/lib/ai/embeddings';
import { companies } from '@/lib/data';
import { getAllArticles } from '@/lib/articles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureIndex() {
  if (embeddingIndex.built) return;
  const companyItems = companies.map((c) => ({
    id: `co:${c.slug}`,
    kind: 'company' as const,
    refId: c.slug,
    text: [
      c.name,
      c.city,
      c.district,
      c.description,
      ...(c.features || []),
      ...(c.services || []).map((s) => `${s.name} ${s.description || ''}`),
    ].join(' \n '),
    meta: { city: c.city, category: c.category, rating: c.rating, plan: c.plan },
  }));

  let articleItems: any[] = [];
  try {
    const arts = getAllArticles();
    articleItems = arts.map((a: any) => ({
      id: `art:${a.slug}`,
      kind: 'article' as const,
      refId: a.slug,
      text: `${a.title || ''} ${a.description || a.excerpt || ''} ${a.content || a.body || ''}`.slice(0, 4000),
      meta: { title: a.title, slug: a.slug },
    }));
  } catch {
    /* listArticles may not be available — ignore */
  }

  await embeddingIndex.build([...companyItems, ...articleItems]);
}

// GET /api/ai/semantic-search?q=transmisja+online+warszawa&kind=company&k=5
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const kind = (searchParams.get('kind') as any) || undefined;
  const k = Math.min(parseInt(searchParams.get('k') || '5', 10) || 5, 20);
  if (!q) return NextResponse.json({ error: 'Brak parametru q' }, { status: 400 });

  await ensureIndex();
  const results = await embeddingIndex.search(q, { kind, topK: k });
  return NextResponse.json({
    query: q,
    indexSize: embeddingIndex.entries.length,
    results: results.map((r) => ({
      id: r.id,
      kind: r.kind,
      refId: r.refId,
      score: Math.round(r.score * 1000) / 1000,
      meta: r.meta,
    })),
  });
}

// POST /api/ai/semantic-search — same as GET but with body for safer long queries
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = (body.q || '').trim();
  const kind = body.kind || undefined;
  const k = Math.min(parseInt(body.k || '5', 10) || 5, 20);
  if (!q) return NextResponse.json({ error: 'Brak parametru q' }, { status: 400 });
  await ensureIndex();
  const results = await embeddingIndex.search(q, { kind, topK: k });
  return NextResponse.json({
    query: q,
    indexSize: embeddingIndex.entries.length,
    results: results.map((r) => ({
      id: r.id,
      kind: r.kind,
      refId: r.refId,
      score: Math.round(r.score * 1000) / 1000,
      meta: r.meta,
    })),
  });
}
