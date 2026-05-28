import { NextResponse } from 'next/server';
import { reviewRepo, bookingRepo } from '@/lib/marketplace/repo';
import { reviewStore } from '@/lib/marketplace/store';
import { requireRole } from '@/lib/auth/session';
import { moderateText, reasonLabel } from '@/lib/moderation/heuristics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/reviews?company=zaklad-kalla
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');
  if (!company) return NextResponse.json({ error: 'Brak parametru company' }, { status: 400 });
  const reviews = await reviewRepo.forCompany(company);
  const stats = await reviewRepo.averageForCompany(company);
  return NextResponse.json({ company, reviews, stats });
}

// POST /api/reviews — submit a review
export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.companySlug) {
      return NextResponse.json({ error: 'Brak companySlug' }, { status: 400 });
    }
    const rating = Number(data.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Ocena musi być 1–5' }, { status: 400 });
    }
    if (!data.title || data.title.length < 5 || data.title.length > 120) {
      return NextResponse.json({ error: 'Tytuł 5–120 znaków' }, { status: 400 });
    }
    if (!data.body || data.body.length < 30 || data.body.length > 2000) {
      return NextResponse.json({ error: 'Treść 30–2000 znaków' }, { status: 400 });
    }
    if (!data.authorName || !data.authorEmail) {
      return NextResponse.json({ error: 'Wymagane: authorName, authorEmail' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.authorEmail)) {
      return NextResponse.json({ error: 'Nieprawidłowy e-mail' }, { status: 400 });
    }
    if (!data.rodo) {
      return NextResponse.json({ error: 'Wymagana zgoda RODO' }, { status: 400 });
    }

    // Moderation AI (Agent 6) — analyze combined text
    const moderation = moderateText(`${data.title}\n${data.body}`);
    if (moderation.decision === 'reject') {
      const reasons = moderation.flags.map((f) => reasonLabel(f.reason)).join(', ');
      return NextResponse.json(
        {
          error: `Opinia nie przeszła moderacji (${reasons}). Spróbuj zmienić treść.`,
          moderation,
        },
        { status: 400 },
      );
    }

    // Verify booking number if provided
    if (data.bookingNumber && !(await bookingRepo.get(data.bookingNumber))) {
      return NextResponse.json({ error: 'Nieprawidłowy numer rezerwacji' }, { status: 400 });
    }

    const review = await reviewRepo.submit({
      companySlug: data.companySlug,
      rating,
      title: String(data.title).trim(),
      body: String(data.body).trim(),
      authorName: String(data.authorName).slice(0, 120),
      authorEmail: data.authorEmail,
      bookingNumber: data.bookingNumber,
      moderation,
    });

    if (!review) return NextResponse.json({ error: 'Firma nie istnieje' }, { status: 404 });

    // If moderation flagged for review, ensure status reflects that:
    //   - was 'published' → demote to 'flagged' (auto-flagged, needs admin look)
    //   - was 'pending'   → upgrade to 'flagged' so admin queue surfaces it first
    if (moderation.decision === 'review') {
      (review as any).status = 'flagged';
    }

    return NextResponse.json({
      ok: true,
      review,
      moderation,
      message:
        review.status === 'published'
          ? 'Dziękujemy za opinię. Została opublikowana.'
          : moderation.decision === 'review'
            ? 'Dziękujemy. Opinia oczekuje na moderację (wykryto potencjalne problemy).'
            : 'Dziękujemy za opinię. Po krótkiej weryfikacji pojawi się publicznie.',
    });
  } catch (e: any) {
    console.error('Review submit error:', e);
    return NextResponse.json({ error: 'Wystąpił błąd' }, { status: 500 });
  }
}

// PATCH /api/reviews — company reply OR moderator approve/reject
//  body: { id, action:'reply'|'approve'|'reject', body? }
export async function PATCH(req: Request) {
  try {
    const { id, action, body } = await req.json();
    if (!id || !action) return NextResponse.json({ error: 'Niepoprawne dane' }, { status: 400 });
    if (action === 'reply') {
      if (!body || body.length < 5 || body.length > 1500) {
        return NextResponse.json({ error: 'Odpowiedź 5–1500 znaków' }, { status: 400 });
      }
      // reply still uses store (low-traffic, single-process — Supabase migration follows)
      const r = reviewStore.reply(id, body.trim());
      if (!r) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
      return NextResponse.json({ ok: true, review: r });
    }
    if (action === 'approve') {
      const admin = await requireRole(['admin']);
      // In demo mode (no auth) we still allow approval
      const r = await reviewRepo.approve(id);
      if (!r) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
      return NextResponse.json({ ok: true, review: r, by: admin?.email || 'demo' });
    }
    if (action === 'reject') {
      const admin = await requireRole(['admin']);
      const r = await reviewRepo.reject(id);
      if (!r) return NextResponse.json({ error: 'Nie znaleziono' }, { status: 404 });
      return NextResponse.json({ ok: true, review: r, by: admin?.email || 'demo' });
    }
    return NextResponse.json({ error: 'Nieznana akcja' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Wystąpił błąd' }, { status: 500 });
  }
}
