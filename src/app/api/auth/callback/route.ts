import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/callback?code=...&role=family|company
 *
 * Exchanges the magic-link code for a session, then upgrades the profile role
 * if `intended_role` was set during signup.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const intendedRole = searchParams.get('role');
  const next = searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/logowanie?error=missing-code`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    // Upgrade role if user intended to be 'company'
    if (data.user && intendedRole && ['family', 'company'].includes(intendedRole)) {
      await supabase
        .from('profiles')
        .update({ role: intendedRole, rodo_accepted_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    // Redirect to appropriate dashboard
    let destination = next;
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile?.role === 'company') destination = '/panel-firmy';
      else if (profile?.role === 'admin') destination = '/admin';
      else destination = next.startsWith('/') ? next : '/panel-rodziny';
    }
    return NextResponse.redirect(`${origin}${destination}`);
  } catch (e: any) {
    return NextResponse.redirect(`${origin}/logowanie?error=${encodeURIComponent(e.message || 'auth-failed')}`);
  }
}
