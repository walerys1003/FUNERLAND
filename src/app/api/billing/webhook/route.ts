import { NextResponse } from 'next/server';
import { STRIPE_CONFIGURED } from '@/lib/billing/plans';
import { subscriptionStore, type Subscription } from '@/lib/billing/subscriptions-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/billing/webhook
 * Stripe webhook handler with signature verification.
 *
 * Events handled:
 *  - checkout.session.completed → create subscription record
 *  - customer.subscription.updated → update status / period
 *  - customer.subscription.deleted → mark canceled
 *  - invoice.payment_failed → mark past_due
 *
 * In demo mode (no STRIPE_SECRET_KEY), still accepts unsigned POSTs from /admin
 * "Symuluj wpłatę" tool — but only with a body containing `simulate: true`.
 */
export async function POST(req: Request) {
  // ----- Demo simulation path (no Stripe at all) -----
  if (!STRIPE_CONFIGURED) {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'invalid body (demo mode)' }, { status: 400 });
    }
    if (!body?.simulate) {
      return NextResponse.json(
        { error: 'Stripe nie jest skonfigurowane (brak STRIPE_SECRET_KEY).' },
        { status: 503 },
      );
    }
    const sub = subscriptionStore.simulate(
      String(body.companySlug || 'demo-firma'),
      body.plan || 'pro',
      body.companyName,
    );
    return NextResponse.json({ ok: true, simulated: true, subscription: sub });
  }

  // ----- Real Stripe webhook (signed) -----
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not set' }, { status: 500 });
  }

  const rawBody = await req.text();
  let event: any;
  try {
    // @ts-ignore — 'stripe' is an optional peer dep installed only in production
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const plan = session.metadata?.plan || 'pro';
        const companySlug = session.metadata?.company_slug || 'unknown';
        const sub: Subscription = {
          id: session.subscription || `sub_${session.id}`,
          companySlug,
          plan,
          status: 'active',
          amount: (session.amount_total || 0) / 100,
          period: 'monthly',
          currentPeriodEnd: new Date(Date.now() + 30 * 86400_000).toISOString(),
          createdAt: new Date().toISOString(),
          stripeSubscriptionId: session.subscription || undefined,
        };
        subscriptionStore.upsert(sub);
        break;
      }
      case 'customer.subscription.updated': {
        const s = event.data.object;
        subscriptionStore.upsert({
          id: s.id,
          companySlug: s.metadata?.company_slug || 'unknown',
          plan: s.metadata?.plan || 'pro',
          status: s.status === 'active' ? 'active' : s.status === 'past_due' ? 'past_due' : 'canceled',
          amount: (s.items?.data?.[0]?.price?.unit_amount || 0) / 100,
          period: 'monthly',
          currentPeriodEnd: new Date((s.current_period_end || 0) * 1000).toISOString(),
          createdAt: new Date((s.created || 0) * 1000).toISOString(),
          stripeSubscriptionId: s.id,
        });
        break;
      }
      case 'customer.subscription.deleted': {
        subscriptionStore.cancel(event.data.object.id);
        break;
      }
      case 'invoice.payment_failed': {
        const subId = event.data.object.subscription;
        const sub = subscriptionStore.get(subId);
        if (sub) {
          sub.status = 'past_due';
          subscriptionStore.upsert(sub);
        }
        break;
      }
      default:
        // ignore other events
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'webhook handler error' }, { status: 500 });
  }
}
