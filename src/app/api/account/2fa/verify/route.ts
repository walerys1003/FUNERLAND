import { NextResponse } from 'next/server';
import { AUTH_CONFIGURED, getServerUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/2fa/verify
 * Body: { factorId: string, code: string }
 * Confirms the TOTP enrollment by submitting the first 6-digit code.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const factorId = String(body?.factorId || '');
  const code = String(body?.code || '').replace(/\s/g, '');

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Kod musi mieć 6 cyfr.' }, { status: 400 });
  }
  if (!factorId) {
    return NextResponse.json({ error: 'Brak factorId.' }, { status: 400 });
  }

  if (!AUTH_CONFIGURED) {
    // Demo: accept any 6-digit code
    return NextResponse.json({
      ok: true,
      mode: 'demo',
      message: 'Tryb demo — 2FA "włączone" wirtualnie.',
    });
  }

  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    // Challenge the factor, then verify
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, mode: 'real', aal: data?.access_token ? 'aal2' : 'aal1' });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Nieprawidłowy kod 2FA.' },
      { status: 400 },
    );
  }
}
