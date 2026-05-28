/**
 * Subscription plans for marketplace companies.
 * Used in /admin/finanse, /dla-firm, and Stripe checkout.
 */

export type PlanId = 'free' | 'standard' | 'pro' | 'premium';

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // monthly, PLN
  priceYearly?: number;
  /** Stripe price ID (set via env var when going live) */
  stripePriceId?: string;
  features: string[];
  highlights?: string[];
  leadsPerMonth: number | 'unlimited';
  popular?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    leadsPerMonth: 0,
    features: ['Wizytówka', 'Podstawowe info', 'Brak leadów'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 149,
    priceYearly: 1490,
    stripePriceId: process.env.STRIPE_PRICE_STANDARD,
    leadsPerMonth: 10,
    features: ['10 leadów / mies.', 'Statystyki', 'Wsparcie e-mail', 'Galeria do 8 zdjęć'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 349,
    priceYearly: 3490,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    leadsPerMonth: 50,
    popular: true,
    highlights: ['Priorytet w wynikach', 'API leads'],
    features: [
      '50 leadów / mies.',
      'Priorytet w wynikach wyszukiwania',
      'API leads (webhook)',
      'Galeria bez limitu',
      'Statystyki konwersji',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 699,
    priceYearly: 6990,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM,
    leadsPerMonth: 'unlimited',
    highlights: ['Account manager', 'White-label widget'],
    features: [
      'Bez limitu leadów',
      'Dedykowany account manager',
      'White-label widget na stronę firmy',
      'Wyróżnienie premium (złota ramka)',
      'SLA odpowiedzi 2h w godz. roboczych',
    ],
  },
];

export function getPlan(id: PlanId | string | undefined | null): Plan | undefined {
  if (!id) return undefined;
  return PLANS.find((p) => p.id === id);
}

export const STRIPE_CONFIGURED = Boolean(process.env.STRIPE_SECRET_KEY);
