import { NextResponse } from 'next/server';
import { AUTH_CONFIGURED, getServerUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/2fa/enroll
 * Starts a TOTP enrollment. Returns { factorId, qr (data URI), secret, uri }.
 * Frontend shows QR + asks for the 6-digit code, then calls /verify.
 *
 * Uses Supabase Auth MFA. In demo mode (no auth), returns a stubbed payload so
 * the UI can be tested visually.
 */
export async function POST() {
  if (!AUTH_CONFIGURED) {
    // Demo stub — generates a fake otpauth:// URI + tiny SVG placeholder
    const secret = 'JBSWY3DPEHPK3PXP'; // RFC 6238 sample secret
    const issuer = 'PolskiePogrzeby';
    const label = 'demo@polskiepogrzeby.pl';
    const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    return NextResponse.json({
      mode: 'demo',
      factorId: 'demo-factor-id',
      secret,
      uri,
      qr: null,
      note: 'Tryb demo — kod weryfikacyjny nie jest sprawdzany. Podaj dowolne 6 cyfr.',
    });
  }

  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'PolskiePogrzeby Authenticator',
    });
    if (error) throw error;
    return NextResponse.json({
      mode: 'real',
      factorId: data.id,
      qr: data.totp.qr_code, // SVG data URI
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'enroll failed' }, { status: 500 });
  }
}
