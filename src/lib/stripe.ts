/**
 * Stripe helper — lazy-loaded klient z fallbackiem dla demo mode.
 *
 * - `getStripe()` zwraca klienta tylko jeśli `STRIPE_SECRET_KEY` jest ustawiony
 *   i paczka `stripe` zainstalowana.
 * - `verifyWebhook(rawBody, signature)` weryfikuje podpis Stripe webhook.
 * - PLANS — katalog planów subskrypcji (zgodny z DB enum: free|basic|standard|pro|premium|enterprise).
 */

export type PlanId = 'free' | 'basic' | 'standard' | 'pro' | 'premium' | 'enterprise';

export const PLANS = {
  free: {
    id: 'free' as const,
    name: 'Free',
    priceMonthly: 0,
    priceId: undefined,
    features: ['Profil podstawowy', 'Do 1 leada / miesiąc', 'Bez wyróżnień'],
  },
  basic: {
    id: 'basic' as const,
    name: 'Basic',
    priceMonthly: 199,
    priceId: process.env.STRIPE_PRICE_BASIC,
    features: ['Profil firmy ze zdjęciami', '3 leady miesięcznie', 'Standardowa pozycja', 'Email support'],
  },
  standard: {
    id: 'standard' as const,
    name: 'Standard',
    priceMonthly: 149,
    priceId: process.env.STRIPE_PRICE_STANDARD,
    features: ['Profil firmy', '5 leadów miesięcznie', 'Wyróżnienie w mieście'],
  },
  pro: {
    id: 'pro' as const,
    name: 'Pro',
    priceMonthly: 349,
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
    id: 'premium' as const,
    name: 'Premium',
    priceMonthly: 699,
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    features: [
      'Wszystko z Pro',
      'Unlimited leady',
      'Pozycja #1 w mieście',
      'Embedded widget na własnej stronie',
      'Dedykowany opiekun',
      'Transmisje online w panelu',
    ],
  },
  enterprise: {
    id: 'enterprise' as const,
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Lazy Stripe client                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

type StripeLike = any;

let cachedClient: StripeLike | null = null;
let triedRequire = false;

export function getStripe(): StripeLike | null {
  if (cachedClient) return cachedClient;
  if (triedRequire) return null;
  triedRequire = true;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  try {
    // dynamic require — pakiet opcjonalny
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    cachedClient = new Stripe(key, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
      maxNetworkRetries: 2,
      timeout: 10_000,
    });
    return cachedClient;
  } catch (err) {
    console.warn('[stripe] paczka `stripe` niezainstalowana — używam mocków');
    return null;
  }
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY) && getStripe() !== null;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Webhook verification                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export type WebhookVerifyResult =
  | { ok: true; event: any; error?: undefined }
  | { ok: false; error: string; event?: undefined };

export function verifyStripeWebhook(
  rawBody: string,
  signature: string | null
): WebhookVerifyResult {
  if (!signature) return { ok: false, error: 'Brak nagłówka stripe-signature' };
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    // Demo mode — przepuszczamy z parsem JSON, ale OZNACZAMY że nie zweryfikowane
    try {
      const event = JSON.parse(rawBody);
      console.warn('[stripe-webhook] BRAK WERYFIKACJI (demo mode)');
      return { ok: true, event: { ...event, _unverified: true } };
    } catch {
      return { ok: false, error: 'Demo mode + nieparsowalny body' };
    }
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    return { ok: true, event };
  } catch (err: any) {
    return { ok: false, error: `Podpis Stripe odrzucony: ${err.message || err}` };
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Convenience: utworzenie Checkout session                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export async function createCheckoutSession(opts: {
  plan: PlanId;
  companySlug: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  billingCycle?: 'monthly' | 'yearly';
}) {
  const stripe = getStripe();
  if (!stripe) {
    // Demo mode — zwracamy stub URL
    return {
      id: `cs_demo_${Date.now()}`,
      url: `${opts.successUrl}?demo=1&plan=${opts.plan}&company=${opts.companySlug}`,
      _demo: true,
    };
  }
  const plan = PLANS[opts.plan];
  if (!plan || !plan.priceId) {
    throw new Error(`Brak Stripe price ID dla planu ${opts.plan}`);
  }
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card', 'p24', 'blik'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${opts.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: opts.cancelUrl,
    customer_email: opts.customerEmail,
    client_reference_id: opts.companySlug,
    metadata: {
      companySlug: opts.companySlug,
      plan: opts.plan,
      billingCycle: opts.billingCycle ?? 'monthly',
    },
    subscription_data: {
      metadata: {
        companySlug: opts.companySlug,
        plan: opts.plan,
      },
    },
    locale: 'pl',
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    allow_promotion_codes: true,
  });
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Customer Portal — anulowanie / zmiana planu                                */
/* ────────────────────────────────────────────────────────────────────────── */

export async function createPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = getStripe();
  if (!stripe) {
    return { id: `bps_demo_${Date.now()}`, url: opts.returnUrl, _demo: true };
  }
  return stripe.billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: opts.returnUrl,
    locale: 'pl' as any,
  });
}
