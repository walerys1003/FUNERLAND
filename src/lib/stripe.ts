// Stripe helper
// import Stripe from 'stripe';
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' });

export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 199,
    priceId: process.env.STRIPE_PRICE_BASIC,
    features: [
      'Profil firmy z zdjęciami',
      '3 leady miesięcznie',
      'Standardowa pozycja w wynikach',
      'Email support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 399,
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      'Wszystko z Basic',
      '10 leadów miesięcznie',
      'Wyróżniona pozycja TOP 3',
      'Galeria 20 zdjęć + video',
      'Priorytet wsparcia',
      'Statystyki w panelu',
    ],
    badge: 'Najpopularniejszy',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 799,
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    features: [
      'Wszystko z Pro',
      'Unlimited leady',
      'Pozycja #1 w mieście',
      'Własna kategoria-mini (5 stron)',
      'Dedykowany opiekun',
      'Transmisje online w panelu',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 1499,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: [
      'Wszystko z Premium',
      'Wiele oddziałów',
      'Białe etykiety formularzy',
      'API integracja z CRM',
      'SLA 99.9%',
      'Dedykowane szkolenia',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
