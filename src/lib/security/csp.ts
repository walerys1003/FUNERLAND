/**
 * Content-Security-Policy builder.
 *
 * Polityka dopasowana do stacku PolskiePogrzeby.pl:
 *  - Next.js (inline styles dla styled-jsx, czasem inline scripts dev)
 *  - Supabase (auth + storage + realtime)
 *  - Stripe (checkout)
 *  - Plausible (analytics)
 *  - Sentry (error reporting)
 *  - Resend / OpenAI / SMSAPI — tylko server-side, nie wpływa na CSP frontu
 *  - Embed widget — `frame-ancestors *` na ścieżce /widget/* (osobno w next.config headers)
 */

export function buildCsp(opts: { isDev?: boolean; nonce?: string } = {}): string {
  const isDev = opts.isDev ?? process.env.NODE_ENV !== 'production';
  const nonce = opts.nonce ? `'nonce-${opts.nonce}'` : '';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Next.js w produkcji buduje inline scripts (hydratation) — można je owijać w nonce,
      // ale dla uproszczenia na razie pozwalamy 'unsafe-inline' tylko w dev.
      isDev ? "'unsafe-inline'" : nonce || "'self'",
      isDev ? "'unsafe-eval'" : '',
      'https://js.stripe.com',
      'https://plausible.io',
      'https://*.plausible.io',
      'https://browser.sentry-cdn.com',
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Tailwind + styled-jsx wymaga
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://images.unsplash.com',
      'https://plus.unsplash.com',
      'https://*.supabase.co',
      'https://lh3.googleusercontent.com',
      'https://res.cloudinary.com',
      'https://www.genspark.ai',
    ],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.stripe.com',
      'https://plausible.io',
      'https://*.plausible.io',
      'https://*.sentry.io',
      'https://*.ingest.sentry.io',
      isDev ? 'ws://localhost:*' : '',
    ].filter(Boolean),
    'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    'media-src': ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'https://checkout.stripe.com'],
    'frame-ancestors': ["'self'"], // /widget/* override przez next.config.js
    'upgrade-insecure-requests': [],
  };

  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}
