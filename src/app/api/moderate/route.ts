import { NextResponse } from 'next/server';
import { moderateText } from '@/lib/moderation/heuristics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/moderate
 * Body: { text: string, context?: 'review' | 'condolence' | 'memory' | 'message' }
 *
 * Returns moderation flags + suggested decision.
 * Used both server-side (before persisting) and from admin tools to re-evaluate
 * existing items.
 *
 * No auth required — this is a lightweight read-only utility endpoint.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const text = String(body?.text || '');
  if (!text || text.length > 10_000) {
    return NextResponse.json(
      { error: text.length > 10_000 ? 'Tekst zbyt długi (max 10000 znaków).' : 'Brak tekstu.' },
      { status: 400 },
    );
  }
  const result = moderateText(text);
  return NextResponse.json({
    ok: true,
    ...result,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    description: 'POST { text } to receive moderation flags.',
    flags: ['profanity', 'spam', 'pii', 'all-caps', 'off-topic', 'link-spam', 'gibberish'],
  });
}
