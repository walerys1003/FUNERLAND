import { NextResponse } from 'next/server';
import { createPortalSession, isStripeEnabled } from '@/lib/stripe';
import { subscriptionRepo } from '@/lib/marketplace/repo';
import { rateLimit, RL_PRESETS } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/billing/portal
 * Tworzy sesję Stripe Customer Portal — pozwala firmie:
 *  - anulować subskrypcję
 *  - zmienić plan
 *  - zaktualizować metodę płatności
 *  - pobrać historię faktur
 *
 * Body: { companySlug: string, returnUrl?: string }
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, { ...RL_PRESETS.default, key: 'billing-portal' });
  if (!rl.ok) return rl.response;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy JSON' }, { status: 400 });
  }
  const companySlug = String(body?.companySlug || '').trim();
  const returnUrl =
    typeof body?.returnUrl === 'string' && body.returnUrl.startsWith('http')
      ? body.returnUrl
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/panel-firmy/platnosci`;

  if (!companySlug) {
    return NextResponse.json({ error: 'Wymagane: companySlug' }, { status: 400 });
  }

  // Znajdź aktywną subskrypcję firmy
  const sub = await subscriptionRepo.forCompany(companySlug);
  if (!sub || !sub.stripeSubscriptionId) {
    return NextResponse.json(
      { error: 'Brak aktywnej subskrypcji Stripe dla tej firmy', _demo: !isStripeEnabled() },
      { status: 404 }
    );
  }

  // Pobierz customerId — Stripe Subscription -> customer
  // (W demo mode zwracamy stub URL.)
  let customerId = (sub as any).stripeCustomerId;
  if (!customerId && isStripeEnabled()) {
    try {
      const { getStripe } = await import('@/lib/stripe');
      const stripe = getStripe();
      if (stripe) {
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
        customerId =
          typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer?.id;
      }
    } catch (e) {
      console.error('[billing/portal] cannot resolve customer:', e);
    }
  }

  if (!customerId) {
    // Demo mode — zwróć return URL
    return NextResponse.json({
      url: returnUrl,
      _demo: true,
      message: 'Demo mode — nie można utworzyć prawdziwej sesji Stripe Customer Portal',
    });
  }

  try {
    const session = await createPortalSession({ customerId, returnUrl });
    return NextResponse.json({ url: session.url, id: session.id, _demo: (session as any)._demo });
  } catch (err: any) {
    console.error('[billing/portal] error:', err);
    return NextResponse.json(
      { error: 'Nie udało się utworzyć sesji portalu klienta', details: err?.message },
      { status: 500 }
    );
  }
}
