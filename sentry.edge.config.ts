/**
 * Sentry edge-runtime init (Vercel Edge functions / middleware).
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
    });
  } catch {
    // package not installed — silent fallback
  }
}

export {};
