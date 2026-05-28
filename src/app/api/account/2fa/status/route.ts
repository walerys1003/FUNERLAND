import { NextResponse } from 'next/server';
import { AUTH_CONFIGURED, getServerUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/account/2fa/status
 * Returns list of enrolled TOTP factors (id, friendly_name, verified status).
 */
export async function GET() {
  if (!AUTH_CONFIGURED) {
    return NextResponse.json({ mode: 'demo', factors: [], enabled: false });
  }

  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    const factors = (data?.totp || []).map((f: any) => ({
      id: f.id,
      friendlyName: f.friendly_name,
      status: f.status,
      createdAt: f.created_at,
    }));
    return NextResponse.json({
      mode: 'real',
      factors,
      enabled: factors.some((f) => f.status === 'verified'),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'status failed' }, { status: 500 });
  }
}
