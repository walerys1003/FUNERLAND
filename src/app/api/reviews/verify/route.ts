import { NextResponse } from 'next/server';

/**
 * POST /api/reviews/verify
 * Weryfikuje opinię na podstawie tokenu wysłanego mailem po zakończonym zleceniu
 *
 * Flow:
 * 1. 7 dni po pogrzebie wysyłamy email "Jak oceniasz firmę?" z unikalnym tokenem
 * 2. Rodzina klika link → otwiera formularz
 * 3. Wystawia opinię + status = 'pending' (do moderacji)
 * 4. Po akceptacji przez moderatora → 'approved' + verified_purchase: true (green badge)
 *
 * Body: { token, rating, title, content }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.token || typeof body.token !== 'string') {
      return NextResponse.json({ error: 'Brak tokenu' }, { status: 400 });
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Ocena musi być od 1 do 5' }, { status: 400 });
    }

    if (!body.content || body.content.trim().length < 30) {
      return NextResponse.json(
        { error: 'Treść opinii musi mieć co najmniej 30 znaków' },
        { status: 400 }
      );
    }

    // ===== Sprawdź token =====
    // const supabase = supabaseAdmin();
    // const { data: tokenRecord } = await supabase
    //   .from('review_tokens')
    //   .select('*, leads(*, companies(*))')
    //   .eq('token', body.token)
    //   .gt('expires_at', new Date().toISOString())
    //   .is('used_at', null)
    //   .single();
    //
    // if (!tokenRecord) {
    //   return NextResponse.json({ error: 'Token nieprawidłowy lub wygasł' }, { status: 400 });
    // }

    // ===== Anti-spam =====
    // sprawdź duplikaty IP, treść, etc.
    const spamScore = await calculateSpamScore(body.content);
    const initialStatus = spamScore > 0.7 ? 'flagged' : 'pending';

    // ===== Wstaw opinię =====
    // const { data: review, error } = await supabase
    //   .from('reviews')
    //   .insert({
    //     company_id: tokenRecord.leads.company_id,
    //     author_user_id: tokenRecord.leads.family_user_id,
    //     author_name: tokenRecord.leads.family_name,
    //     author_email: tokenRecord.leads.family_email,
    //     rating: body.rating,
    //     title: body.title,
    //     content: body.content,
    //     verified_purchase: true,
    //     verification_lead_id: tokenRecord.lead_id,
    //     status: initialStatus,
    //   })
    //   .select()
    //   .single();
    //
    // // oznacz token jako zużyty
    // await supabase
    //   .from('review_tokens')
    //   .update({ used_at: new Date().toISOString() })
    //   .eq('token', body.token);

    // ===== Powiadom moderatorów (jeśli flagged) =====
    if (initialStatus === 'flagged') {
      // Slack webhook lub email do admina
    }

    return NextResponse.json({
      ok: true,
      message: 'Dziękujemy za opinię. Po krótkiej weryfikacji pojawi się publicznie.',
    });
  } catch (err: any) {
    console.error('[/api/reviews/verify] error:', err);
    return NextResponse.json(
      { error: 'Wystąpił błąd' },
      { status: 500 }
    );
  }
}

async function calculateSpamScore(content: string): Promise<number> {
  let score = 0;
  // Słowa-flagi
  const flags = ['kup', 'tani', 'klik', 'zniżk', 'darmow', 'www.', 'http'];
  for (const f of flags) {
    if (content.toLowerCase().includes(f)) score += 0.2;
  }
  // Wielkość liter
  const capsRatio = (content.match(/[A-Z]/g)?.length || 0) / content.length;
  if (capsRatio > 0.3) score += 0.3;
  // Powtórzenia
  if (/(.)\1{4,}/.test(content)) score += 0.3;
  return Math.min(score, 1);
}
