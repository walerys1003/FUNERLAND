/**
 * Sentry server-side init (Node runtime).
 *
 * Wczytany przez `@sentry/nextjs` automatycznie (jeśli paczka zainstalowana).
 */

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.init({
      dsn,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_BUILD_SHA || undefined,
      // Wyłącz auto-instrumentation Prisma/Mongo (nie używamy)
      integrations: (defaults: any[]) =>
        defaults.filter(
          (i: any) => !['Prisma', 'Mongo', 'Mysql', 'Postgres'].includes(i.name)
        ),
    });
  } catch {
    // package not installed — silent fallback
  }
}

export {};
