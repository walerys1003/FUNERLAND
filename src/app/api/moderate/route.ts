import { NextResponse } from 'next/server';
import { moderateText } from '@/lib/moderation/heuristics';
import { rateLimit, RL_PRESETS } from '@/lib/security/rate-limit';
import { ModerateSchema, validationError } from '@/lib/validation/schemas';

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
  const rl = await rateLimit(req, RL_PRESETS.moderate);
  if (!rl.ok) return rl.response;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = ModerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed as any), { status: 400 });
  }
  const result = moderateText((parsed.data as any).text);
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
