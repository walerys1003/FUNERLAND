import { NextResponse } from 'next/server';
import { aiMatchRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/match/click
 *
 * Records a click on a matched company (used to compute CTR per position).
 * Body: { queryId: string; companySlug: string; position: number }
 *
 * Best-effort — always returns 200 unless input is malformed.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { queryId?: string; companySlug?: string; position?: number };
    if (!body.queryId || !body.companySlug || typeof body.position !== 'number') {
      return NextResponse.json({ error: 'queryId, companySlug, position required' }, { status: 400 });
    }
    const ok = await aiMatchRepo.markClick(body.queryId, body.companySlug, body.position);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
