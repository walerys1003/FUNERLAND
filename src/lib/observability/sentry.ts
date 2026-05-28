/**
 * Sentry initialization — lazy, optional.
 *
 * Sentry jest opcjonalną zależnością. Ten moduł wystawia `captureException`
 * i `captureMessage`, które działają niezależnie od tego czy `@sentry/nextjs`
 * jest zainstalowany. Jeśli SENTRY_DSN jest ustawiony i paczka jest dostępna,
 * inicjalizuje klienta przy pierwszym wywołaniu i przekazuje błędy dalej.
 *
 * W trybie demo (brak Sentry) — loguje do konsoli z prefiksem.
 */

type SentryLike = {
  init?: (opts: any) => void;
  captureException?: (err: any, ctx?: any) => string | undefined;
  captureMessage?: (msg: string, level?: any) => string | undefined;
  setUser?: (user: any) => void;
};

let sentry: SentryLike | null = null;
let attempted = false;

function load(): SentryLike | null {
  if (attempted) return sentry;
  attempted = true;

  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@sentry/nextjs');
    mod.init?.({
      dsn,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: parseFloat(process.env.SENTRY_REPLAYS_ON_ERROR || '1.0'),
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_BUILD_SHA || undefined,
      enabled: process.env.NODE_ENV === 'production',
    });
    sentry = mod;
    return sentry;
  } catch {
    console.warn('[sentry] paczka @sentry/nextjs niezainstalowana — logi tylko do console');
    return null;
  }
}

export function captureException(err: unknown, context?: Record<string, any>): void {
  const client = load();
  if (client?.captureException) {
    try {
      client.captureException(err, context ? { extra: context } : undefined);
      return;
    } catch {
      /* fallthrough */
    }
  }
  console.error('[exception]', err, context || '');
}

export function captureMessage(
  msg: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, any>
): void {
  const client = load();
  if (client?.captureMessage) {
    try {
      client.captureMessage(msg, level as any);
      return;
    } catch {
      /* fallthrough */
    }
  }
  // eslint-disable-next-line no-console
  console[level === 'error' || level === 'fatal' ? 'error' : level === 'warning' ? 'warn' : 'log'](
    `[${level}]`,
    msg,
    context || ''
  );
}

export function setUserContext(user: { id?: string; email?: string; role?: string }): void {
  const client = load();
  client?.setUser?.(user);
}

export const sentryReady = () => load() !== null;
