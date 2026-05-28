import { NextResponse } from 'next/server';
import { obituaryStore } from '@/lib/marketplace/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/obituaries/:slug/candle — light a virtual candle (dedupe by IP)
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const obit = obituaryStore.getBySlug(slug);
  if (!obit) return NextResponse.json({ error: 'Nie znaleziono nekrologu' }, { status: 404 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const res = obituaryStore.lightCandle(obit.id, ip);
  if (!res) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, candles: res.candles, message: 'Już zapaliłeś świecę.' },
      { status: 200 },
    );
  }
  return NextResponse.json({ ok: true, candles: res.candles });
}
