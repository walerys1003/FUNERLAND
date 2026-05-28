import { NextResponse } from 'next/server';
import { AUTH_CONFIGURED, getServerUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/2fa/disable
 * Body: { factorId: string }
 * Unenrolls a TOTP factor.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const factorId = String(body?.factorId || '');
  if (!factorId) {
    return NextResponse.json({ error: 'Brak factorId.' }, { status: 400 });
  }

  if (!AUTH_CONFIGURED) {
    return NextResponse.json({ ok: true, mode: 'demo' });
  }

  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    return NextResponse.json({ ok: true, mode: 'real' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Disable failed' }, { status: 500 });
  }
}
