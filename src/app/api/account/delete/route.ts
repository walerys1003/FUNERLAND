import { NextResponse } from 'next/server';
import { getServerUser, AUTH_CONFIGURED } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/delete — RODO art. 17 (prawo do usunięcia danych).
 *
 * Body: { confirmEmail: string }
 *
 * Strategy:
 *  1. Sanity check that confirmEmail matches user email.
 *  2. Soft-delete: scrub PII from profile row + mark deleted_at.
 *  3. Anonymize user-generated public content (reviews, condolences, memories) by
 *     replacing author_name/author_email with "Anonim".
 *  4. Sign out.
 *  Hard auth.users deletion would require service-role key admin API call —
 *  done in background by ops, or via Supabase Edge Function in future iteration.
 */
export async function POST(req: Request) {
  if (!AUTH_CONFIGURED) {
    return NextResponse.json(
      { error: 'Auth nie jest skonfigurowane (tryb demo). Usunięcie konta niedostępne.' },
      { status: 501 },
    );
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let confirmEmail = '';
  try {
    const body = await req.json();
    confirmEmail = String(body?.confirmEmail || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (confirmEmail.toLowerCase() !== (user.email || '').toLowerCase()) {
    return NextResponse.json({ error: 'E-mail potwierdzający nie zgadza się.' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const anonName = 'Konto usunięte';
    const anonEmail = `deleted-${user.id.slice(0, 8)}@deleted.local`;
    const now = new Date().toISOString();

    // 1) Anonymize profile
    await supabase
      .from('profiles')
      .update({
        full_name: anonName,
        phone: null,
        city: null,
        avatar_url: null,
        email: anonEmail,
        deleted_at: now,
      })
      .eq('id', user.id);

    // 2) Anonymize public reviews
    await supabase
      .from('reviews')
      .update({ author_name: anonName, author_email: anonEmail })
      .eq('author_email', user.email);

    // 3) Anonymize condolences
    await supabase
      .from('condolences')
      .update({ author_name: anonName, author_email: anonEmail })
      .eq('author_email', user.email);

    // 4) Anonymize memories
    await supabase
      .from('memories')
      .update({ author_name: anonName, author_email: anonEmail })
      .eq('author_email', user.email);

    // 5) Sign out current session
    await supabase.auth.signOut();

    return NextResponse.json({
      ok: true,
      message:
        'Konto zostało usunięte. Dane osobowe zostały zanonimizowane. W ciągu 30 dni rekord auth zostanie ostatecznie skasowany.',
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Wystąpił błąd podczas usuwania konta.' },
      { status: 500 },
    );
  }
}
