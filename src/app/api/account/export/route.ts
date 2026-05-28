import { NextResponse } from 'next/server';
import { getServerUser, AUTH_CONFIGURED } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { bookingRepo } from '@/lib/marketplace/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/account/export — RODO art. 20 (prawo do przenoszenia danych).
 *
 * Returns a JSON file with ALL data associated with the current user:
 *  - profile (name, email, phone, city, role, created_at)
 *  - bookings (rezerwacje)
 *  - leads (zgłoszenia)
 *  - reviews (opinie)
 *  - obituaries (nekrologi)
 *  - condolences (kondolencje)
 *  - memories (wspomnienia)
 *  - companies (jeśli właściciel)
 */
export async function POST() {
  if (!AUTH_CONFIGURED) {
    return NextResponse.json(
      {
        error: 'Auth is not configured. Data export is unavailable in demo mode.',
      },
      { status: 501 },
    );
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exportData: Record<string, any> = {
    _meta: {
      generated_at: new Date().toISOString(),
      generator: 'PolskiePogrzeby.pl — RODO export (art. 15, 20)',
      user_id: user.id,
      note:
        'Plik zawiera wszystkie dane osobowe przetwarzane przez platformę PolskiePogrzeby.pl w związku z Twoim kontem.',
    },
    profile: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.fullName,
      phone: user.phone,
      city: user.city,
      avatar_url: user.avatarUrl,
    },
  };

  try {
    const supabase = await createClient();

    // Full profile row (including timestamps + RODO acceptance)
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (profileRow) exportData.profile_full = profileRow;

    // Bookings (rezerwacje) — by user id
    try {
      const bookings = await bookingRepo.listForUser(user.id);
      exportData.bookings = bookings;
    } catch {
      exportData.bookings = [];
    }

    // Leads — by contact_email
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('contact_email', user.email);
    exportData.leads = leads || [];

    // Reviews — by author_email
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('author_email', user.email);
    exportData.reviews = reviews || [];

    // Obituaries — by author_email
    const { data: obituaries } = await supabase
      .from('obituaries')
      .select('*')
      .eq('author_email', user.email);
    exportData.obituaries = obituaries || [];

    // Condolences — by author_email (if column exists)
    const { data: condolences } = await supabase
      .from('condolences')
      .select('*')
      .eq('author_email', user.email);
    exportData.condolences = condolences || [];

    // Memories — by author_email
    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('author_email', user.email);
    exportData.memories = memories || [];

    // Companies — if user is owner/member
    const { data: memberships } = await supabase
      .from('company_members')
      .select('role, companies(id, slug, name, city, created_at)')
      .eq('user_id', user.id);
    exportData.companies = (memberships || []).map((m: any) => ({
      role_in_company: m.role,
      ...m.companies,
    }));

    // Message threads where user is customer
    const { data: threads } = await supabase
      .from('message_threads')
      .select('*')
      .eq('customer_email', user.email);
    exportData.message_threads = threads || [];
  } catch (e: any) {
    exportData._errors = [e?.message || String(e)];
  }

  const body = JSON.stringify(exportData, null, 2);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="polskiepogrzeby-export-${stamp}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
