import { NextResponse } from 'next/server';
import { getPlan, STRIPE_CONFIGURED } from '@/lib/billing/plans';
import { subscriptionStore } from '@/lib/billing/subscriptions-store';
import { createCheckoutSession, isStripeEnabled } from '@/lib/stripe';
import { rateLimit } from '@/lib/security/rate-limit';
import { CheckoutSchema, validationError } from '@/lib/validation/schemas';
import { audit, requestContext } from '@/lib/audit/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/billing/checkout
 *
 * Body: { plan, companySlug, billingCycle?, successUrl?, cancelUrl? }
 *
 * - Z STRIPE_SECRET_KEY: tworzy prawdziwą sesję Stripe Checkout.
 * - Bez Stripe: zwraca demo URL i upsertuje subskrypcję w in-memory store
 *   (dzięki czemu /admin/finanse pokazuje progres).
 *
 * Sekurytka:
 *  - rate-limit 10/min
 *  - Zod walidacja
 *  - audit log
 */
export async function POST(req: Request) {
  const rl = await rateLimit(req, { limit: 10, windowMs: 60_000, key: 'checkout' });
  if (!rl.ok) return rl.response;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(validationError(parsed as any), { status: 400 });
  }
  const data: any = parsed.data;
  const planId = String(data.plan).toLowerCase();
  const companySlug = String(data.companySlug).toLowerCase();
  const companyName = body?.companyName ? String(body.companyName) : undefined;
  const billingCycle: 'monthly' | 'yearly' = data.billingCycle || 'monthly';

  const plan = getPlan(planId);
  if (!plan || plan.id === 'free') {
    return NextResponse.json({ error: 'Nieprawidłowy plan' }, { status: 400 });
  }

  const { origin } = new URL(req.url);
  const successUrl = data.successUrl || `${origin}/platnosc/sukces`;
  const cancelUrl = data.cancelUrl || `${origin}/dla-firm?cancelled=1`;

  // ----- Demo mode -----
  if (!STRIPE_CONFIGURED || !isStripeEnabled()) {
    const sub = subscriptionStore.simulate(companySlug, plan.id, companyName);
    audit({
      action: 'billing.checkout.completed',
      resourceType: 'subscription',
      resourceId: sub.id,
      ...requestContext(req),
      meta: { plan: plan.id, companySlug, demo: true },
    }).catch(() => {});
    return NextResponse.json({
      url: `${successUrl}?demo=1&plan=${plan.id}&firma=${encodeURIComponent(companySlug)}&sub=${sub.id}`,
      mode: 'demo',
      subscription: sub,
    });
  }

  // ----- Real Stripe -----
  try {
    const session = await createCheckoutSession({
      plan: plan.id as any,
      companySlug,
      successUrl,
      cancelUrl,
      billingCycle,
    });
    audit({
      action: 'billing.checkout.completed',
      resourceType: 'checkout_session',
      resourceId: session.id,
      ...requestContext(req),
      meta: { plan: plan.id, companySlug, billingCycle },
    }).catch(() => {});
    return NextResponse.json({ url: session.url, mode: 'stripe', id: session.id });
  } catch (e: any) {
    console.error('[checkout] Stripe error:', e);
    return NextResponse.json(
      { error: e?.message || 'Stripe error', mode: 'stripe-error' },
      { status: 500 },
    );
  }
}
