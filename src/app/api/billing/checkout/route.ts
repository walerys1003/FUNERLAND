import { NextResponse } from 'next/server';
import { getPlan, STRIPE_CONFIGURED } from '@/lib/billing/plans';
import { subscriptionStore } from '@/lib/billing/subscriptions-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/billing/checkout
 * Body: { plan: 'standard'|'pro'|'premium', companySlug: string, companyName?: string, period?: 'monthly'|'yearly' }
 *
 * - With STRIPE_SECRET_KEY: creates a real Stripe Checkout session and returns `url`.
 * - Without Stripe: returns demo URL pointing to /platnosc/sukces?demo=1&plan=...
 *   AND immediately upserts a demo subscription so /admin/finanse shows progress.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const planId = String(body?.plan || '').toLowerCase();
  const companySlug = String(body?.companySlug || '').toLowerCase();
  const companyName = body?.companyName ? String(body.companyName) : undefined;

  const plan = getPlan(planId);
  if (!plan || plan.id === 'free') {
    return NextResponse.json({ error: 'Nieprawidłowy plan' }, { status: 400 });
  }
  if (!companySlug) {
    return NextResponse.json({ error: 'Brak companySlug' }, { status: 400 });
  }

  const { origin } = new URL(req.url);

  // ----- Demo mode -----
  if (!STRIPE_CONFIGURED) {
    const sub = subscriptionStore.simulate(companySlug, plan.id, companyName);
    return NextResponse.json({
      url: `${origin}/platnosc/sukces?demo=1&plan=${plan.id}&firma=${encodeURIComponent(companySlug)}&sub=${sub.id}`,
      mode: 'demo',
      subscription: sub,
    });
  }

  // ----- Real Stripe -----
  if (!plan.stripePriceId) {
    return NextResponse.json(
      { error: `Brak STRIPE_PRICE_${plan.id.toUpperCase()} w env` },
      { status: 500 },
    );
  }
  try {
    // Lazy import — keeps build fast & avoids requiring stripe pkg in demo
    // @ts-ignore — 'stripe' is an optional peer dep installed only in production
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${origin}/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dla-firm?cancelled=1`,
      metadata: {
        plan: plan.id,
        company_slug: companySlug,
      },
      subscription_data: {
        metadata: { plan: plan.id, company_slug: companySlug },
      },
      allow_promotion_codes: true,
      locale: 'pl' as any,
    });
    return NextResponse.json({ url: session.url, mode: 'stripe', id: session.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Stripe error', mode: 'stripe-error' },
      { status: 500 },
    );
  }
}
