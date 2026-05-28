import { NextResponse } from 'next/server';
import { obituaryRepo } from '@/lib/marketplace/repo';
import { createHash } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/obituaries/:slug/candle — light a virtual candle (dedupe by IP)
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const ipHash = createHash('sha256').update(ip + (process.env.SALT || 'pp')).digest('hex');
  const res = await obituaryRepo.lightCandle(slug, ipHash);
  if (!res) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, candles: res.candles, message: 'Już zapaliłeś świecę.' },
      { status: 200 },
    );
  }
  return NextResponse.json({ ok: true, candles: res.candles });
}
