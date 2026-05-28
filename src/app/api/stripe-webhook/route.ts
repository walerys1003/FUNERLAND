import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/lib/stripe';
import { subscriptionRepo } from '@/lib/marketplace/repo';
import { toDbPlan } from '@/lib/billing/plan-mapping';
import type { PlanId } from '@/lib/billing/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe-webhook
 * Stripe webhook handler — subscriptions, lead reveals, premium obituaries.
 *
 * Bezpieczeństwo: weryfikuje podpis przez `stripe.webhooks.constructEvent`.
 * W demo mode (brak STRIPE_WEBHOOK_SECRET) przepuszcza body z flagą `_unverified`.
 *
 * Idempotentność: zapis przez `subscriptionRepo.upsert` używa `stripe_subscription_id`
 * jako unikalnego klucza, więc duplikaty zdarzeń nie tworzą duplikatów wierszy.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = (await headers()).get('stripe-signature');

  const verified = verifyStripeWebhook(rawBody, signature);
  if (!verified.ok) {
    console.error('[stripe-webhook]', verified.error);
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  const event = verified.event;
  if (event._unverified) {
    console.warn('[stripe-webhook] event przyjęty bez weryfikacji (demo)');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log('[stripe-webhook] unhandled event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[stripe-webhook] handler error:', err);
    return NextResponse.json({ error: 'Handler failed', details: err?.message }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  HANDLERS                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

const PRICES: Record<PlanId, number> = { free: 0, standard: 149, pro: 349, premium: 699 };

function planFromMetadata(meta: any): PlanId {
  const p = String(meta?.plan || 'pro').toLowerCase();
  if (p === 'free' || p === 'standard' || p === 'pro' || p === 'premium') return p as PlanId;
  // legacy aliases
  if (p === 'basic') return 'standard';
  if (p === 'enterprise') return 'premium';
  return 'pro';
}

async function handleCheckoutCompleted(session: any) {
  const { metadata, mode, subscription, client_reference_id } = session;
  if (mode !== 'subscription' || !subscription) return;

  const companySlug = client_reference_id || metadata?.companySlug;
  if (!companySlug) {
    console.warn('[stripe-webhook] checkout.completed bez companySlug');
    return;
  }
  const plan = planFromMetadata(metadata);

  await subscriptionRepo.upsert({
    id: `sub_${Date.now()}`,
    companySlug,
    plan,
    status: 'active',
    amount: PRICES[plan] ?? 0,
    period: 'monthly',
    currentPeriodEnd: new Date(Date.now() + 30 * 86400_000).toISOString(),
    createdAt: new Date().toISOString(),
    stripeSubscriptionId: typeof subscription === 'string' ? subscription : subscription?.id,
  });
  console.log('[stripe-webhook] subscription created via checkout', companySlug, plan);
  await (subscriptionRepo as any).logEvent?.({
    type: 'checkout.session.completed',
    companySlug,
    plan,
    stripeSubscriptionId: typeof subscription === 'string' ? subscription : subscription?.id,
  });
}

async function handleSubscriptionChange(sub: any) {
  const companySlug = sub.metadata?.companySlug;
  if (!companySlug) {
    console.warn('[stripe-webhook] subscription.updated bez companySlug');
    return;
  }
  const plan = planFromMetadata(sub.metadata);
  const status: 'active' | 'past_due' | 'canceled' | 'trialing' = sub.status;

  await subscriptionRepo.upsert({
    id: `sub_${sub.id}`,
    companySlug,
    plan,
    status: ['active', 'past_due', 'canceled', 'trialing'].includes(status) ? status : 'active',
    amount: PRICES[plan] ?? 0,
    period: 'monthly',
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 86400_000).toISOString(),
    createdAt: sub.created
      ? new Date(sub.created * 1000).toISOString()
      : new Date().toISOString(),
    stripeSubscriptionId: sub.id,
  });
  await (subscriptionRepo as any).logEvent?.({
    type: 'customer.subscription.updated',
    companySlug,
    plan,
    stripeSubscriptionId: sub.id,
    status,
  });
}

async function handleSubscriptionDeleted(sub: any) {
  const companySlug = sub.metadata?.companySlug;
  if (!companySlug) return;
  await subscriptionRepo.upsert({
    id: `sub_${sub.id}`,
    companySlug,
    plan: 'free' as PlanId,
    status: 'canceled',
    amount: 0,
    period: 'monthly',
    currentPeriodEnd: new Date().toISOString(),
    createdAt: sub.created
      ? new Date(sub.created * 1000).toISOString()
      : new Date().toISOString(),
    stripeSubscriptionId: sub.id,
  });
  await (subscriptionRepo as any).logEvent?.({
    type: 'customer.subscription.deleted',
    companySlug,
    stripeSubscriptionId: sub.id,
  });
}

async function handlePaymentSucceeded(invoice: any) {
  await (subscriptionRepo as any).logEvent?.({
    type: 'invoice.payment_succeeded',
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    companySlug: invoice.subscription_details?.metadata?.companySlug,
  });
}

async function handlePaymentFailed(invoice: any) {
  await (subscriptionRepo as any).logEvent?.({
    type: 'invoice.payment_failed',
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    companySlug: invoice.subscription_details?.metadata?.companySlug,
  });
  // TODO Sprint 2: wysłać email do firmy (Resend)
}

// Suppress unused-import lint
void toDbPlan;
