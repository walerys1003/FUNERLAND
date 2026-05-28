/**
 * In-memory subscription store for demo / dev (no Stripe configured).
 * Mirrors the shape we'd persist in the `company_subscriptions` Supabase table.
 *
 * When STRIPE_CONFIGURED === true, the webhook handler writes directly to Supabase
 * and this store is a no-op fallback for /admin/finanse demo listings.
 */

import type { PlanId } from './plans';

export type Subscription = {
  id: string;
  companySlug: string;
  companyName?: string;
  plan: PlanId;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number; // PLN per period
  period: 'monthly' | 'yearly';
  currentPeriodEnd: string; // ISO
  createdAt: string;
  stripeSubscriptionId?: string;
};

const subs = new Map<string, Subscription>();

// Seed with a couple of demo entries for the admin panel
function seed() {
  if (subs.size > 0) return;
  const now = Date.now();
  const month = 30 * 86400_000;
  const demoSubs: Subscription[] = [
    {
      id: 'sub_demo_1',
      companySlug: 'zaklad-pogrzebowy-kalla',
      companyName: 'Zakład Pogrzebowy Kalla',
      plan: 'premium',
      status: 'active',
      amount: 699,
      period: 'monthly',
      currentPeriodEnd: new Date(now + 12 * 86400_000).toISOString(),
      createdAt: new Date(now - 4 * month).toISOString(),
    },
    {
      id: 'sub_demo_2',
      companySlug: 'wieczna-pamiec',
      companyName: 'Wieczna Pamięć',
      plan: 'pro',
      status: 'active',
      amount: 349,
      period: 'monthly',
      currentPeriodEnd: new Date(now + 6 * 86400_000).toISOString(),
      createdAt: new Date(now - 2 * month).toISOString(),
    },
    {
      id: 'sub_demo_3',
      companySlug: 'spokoj-i-godnosc',
      companyName: 'Spokój i Godność',
      plan: 'standard',
      status: 'active',
      amount: 149,
      period: 'monthly',
      currentPeriodEnd: new Date(now + 22 * 86400_000).toISOString(),
      createdAt: new Date(now - month).toISOString(),
    },
    {
      id: 'sub_demo_4',
      companySlug: 'memoriam-warszawa',
      companyName: 'Memoriam Warszawa',
      plan: 'pro',
      status: 'past_due',
      amount: 349,
      period: 'monthly',
      currentPeriodEnd: new Date(now - 3 * 86400_000).toISOString(),
      createdAt: new Date(now - 3 * month).toISOString(),
    },
  ];
  demoSubs.forEach((s) => subs.set(s.id, s));
}

export const subscriptionStore = {
  list(): Subscription[] {
    seed();
    return Array.from(subs.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  get(id: string): Subscription | undefined {
    return subs.get(id);
  },
  upsert(sub: Subscription): Subscription {
    subs.set(sub.id, sub);
    return sub;
  },
  simulate(companySlug: string, plan: PlanId, companyName?: string): Subscription {
    const PRICES: Record<PlanId, number> = { free: 0, standard: 149, pro: 349, premium: 699 };
    const sub: Subscription = {
      id: `sub_sim_${Date.now()}`,
      companySlug,
      companyName,
      plan,
      status: 'active',
      amount: PRICES[plan],
      period: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 86400_000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    subs.set(sub.id, sub);
    return sub;
  },
  cancel(id: string): Subscription | null {
    const s = subs.get(id);
    if (!s) return null;
    s.status = 'canceled';
    subs.set(id, s);
    return s;
  },
  stats() {
    seed();
    const all = Array.from(subs.values());
    const active = all.filter((s) => s.status === 'active');
    const mrr = active.reduce(
      (a, s) => a + (s.period === 'monthly' ? s.amount : s.amount / 12),
      0,
    );
    return {
      total: all.length,
      active: active.length,
      pastDue: all.filter((s) => s.status === 'past_due').length,
      canceled: all.filter((s) => s.status === 'canceled').length,
      mrr: Math.round(mrr),
      byPlan: {
        premium: active.filter((s) => s.plan === 'premium').length,
        pro: active.filter((s) => s.plan === 'pro').length,
        standard: active.filter((s) => s.plan === 'standard').length,
      },
    };
  },
};
