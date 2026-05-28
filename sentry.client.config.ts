/**
 * Sentry client-side init.
 *
 * Wczytany przez `@sentry/nextjs` automatycznie (jeśli paczka zainstalowana).
 * Jeśli SENTRY_DSN nie jest ustawiony — robi no-op.
 *
 * UWAGA: ten plik jest wczytywany TYLKO gdy `@sentry/nextjs` jest zainstalowany.
 * Build nie pęknie bez niego — pakiet jest w `optionalDependencies`.
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn,
      tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_RATE || '0.1'),
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_BUILD_SHA || undefined,
      ignoreErrors: [
        // Browser noise
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Stripe Elements
        /IntegrationError/,
      ],
      beforeSend(event: any) {
        // Filtruj PII z URL
        if (event.request?.url) {
          event.request.url = event.request.url.replace(/email=[^&]+/g, 'email=***');
        }
        return event;
      },
    });
  } catch {
    // package not installed — silent fallback
  }
}

export {};
