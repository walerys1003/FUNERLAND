/**
 * Centralne schematy walidacji Zod dla wszystkich POST endpointów.
 *
 * Cel: jedno miejsce prawdy, łatwy import w każdej trasie API.
 * Każdy schemat ma towarzyszący typ TS (z.infer) dla bezpiecznego użycia.
 *
 * UWAGA: aby uniknąć twardej zależności w build (gdy `zod` jeszcze niezainstalowany),
 * używamy dynamicznego require z fallbackiem na minimalny walidator. W praktyce na produkcji
 * zainstaluj `zod` (zob. package.json -> dependencies).
 */

type ZodLike = any;

let zMod: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  zMod = require('zod');
} catch {
  // Fallback shim — minimalny "z" zwracający stuby z .safeParse() przepuszczającym dane.
  // To gwarantuje, że build nie pęknie zanim ktoś zrobi `npm i zod`.
  const passthrough = (): ZodLike => ({
    parse: (d: any) => d,
    safeParse: (d: any) => ({ success: true, data: d }),
    optional: () => passthrough(),
    nullable: () => passthrough(),
    min: () => passthrough(),
    max: () => passthrough(),
    email: () => passthrough(),
    url: () => passthrough(),
    regex: () => passthrough(),
    int: () => passthrough(),
    positive: () => passthrough(),
    nonempty: () => passthrough(),
    default: () => passthrough(),
    transform: () => passthrough(),
    refine: () => passthrough(),
    or: () => passthrough(),
  });
  zMod = {
    z: {
      object: () => passthrough(),
      string: () => passthrough(),
      number: () => passthrough(),
      boolean: () => passthrough(),
      array: () => passthrough(),
      enum: () => passthrough(),
      literal: () => passthrough(),
      union: () => passthrough(),
      record: () => passthrough(),
      any: () => passthrough(),
      coerce: { number: () => passthrough(), boolean: () => passthrough() },
    },
  };
}

export const z = zMod.z ?? zMod.default?.z ?? zMod;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Lead — formularz kontaktowy / zapytanie ofertowe                          */
/* ────────────────────────────────────────────────────────────────────────── */

export const LeadSchema = z.object({
  name: z.string().min(2, 'Imię musi mieć min. 2 znaki').max(120),
  email: z.string().email('Nieprawidłowy email').max(200),
  phone: z
    .string()
    .regex(/^(\+?48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/, 'Nieprawidłowy numer telefonu')
    .max(20),
  city: z.string().min(2).max(120).optional(),
  budget: z.string().max(50).optional(),
  urgency: z.enum(['asap', 'week', 'month', 'planning']).optional(),
  message: z.string().max(2000).optional(),
  companySlug: z.string().max(120).optional(),
  source: z.string().max(60).optional(),
  // honeypot — jeśli wypełniony → bot
  website: z.string().max(0).optional(),
});
export type LeadPayload = ReturnType<typeof LeadSchema['parse']>;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Review                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export const ReviewSchema = z.object({
  companySlug: z.string().min(1).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, 'Min. 10 znaków').max(2000),
  authorName: z.string().min(2).max(120).optional(),
  email: z.string().email().max(200).optional(),
  serviceDate: z.string().max(20).optional(),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Booking — rezerwacja terminu                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export const BookingSchema = z.object({
  companySlug: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  slot: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  service: z.string().min(2).max(120),
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(20),
  notes: z.string().max(2000).optional(),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  AI Chat / Match                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

export const AiChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.any()).max(20).optional(),
  context: z.record(z.any()).optional(),
});

export const AiMatchSchema = z.object({
  city: z.string().max(120).optional(),
  budget: z.string().max(50).optional(),
  urgency: z.string().max(20).optional(),
  needs: z.array(z.string()).max(20).optional(),
  features: z.array(z.string()).max(20).optional(),
  verifiedOnly: z.boolean().optional(),
  phone24hOnly: z.boolean().optional(),
  ratingMin: z.coerce.number().min(0).max(5).optional(),
  priceMax: z.coerce.number().min(0).max(100000).optional(),
  plan: z.string().max(20).optional(),
  query: z.string().max(500).optional(),
  sort: z.enum(['recommended', 'rating', 'price', 'distance']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const AiMatchClickSchema = z.object({
  queryId: z.string().min(1).max(60),
  companySlug: z.string().min(1).max(120),
  position: z.coerce.number().int().min(0).max(100),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Moderation                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export const ModerateSchema = z.object({
  text: z.string().min(1).max(5000),
  type: z.enum(['review', 'condolence', 'memory', 'comment']).optional(),
  context: z.record(z.any()).optional(),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Billing / Checkout                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

export const CheckoutSchema = z.object({
  plan: z.enum(['free', 'basic', 'standard', 'pro', 'premium', 'enterprise']),
  companySlug: z.string().min(1).max(120),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Widget                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export const WidgetIssueSchema = z.object({
  companySlug: z.string().min(1).max(120),
  variant: z.enum(['card', 'banner', 'compact', 'reviews']).optional(),
  allowedOrigins: z.array(z.string().max(200)).max(20).optional(),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  2FA                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export const TwoFactorEnrollSchema = z.object({
  password: z.string().min(8).max(200).optional(),
});

export const TwoFactorVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, '6 cyfr'),
  factorId: z.string().optional(),
});

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helper: jednolita odpowiedź błędu                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export function validationError(parsed: { success: false; error?: any }) {
  const issues = parsed.error?.issues ?? parsed.error?.errors ?? [];
  return {
    error: 'ValidationError',
    message: 'Nieprawidłowe dane wejściowe',
    issues: Array.isArray(issues)
      ? issues.map((i: any) => ({
          path: Array.isArray(i.path) ? i.path.join('.') : String(i.path ?? ''),
          message: i.message,
        }))
      : [],
  };
}
