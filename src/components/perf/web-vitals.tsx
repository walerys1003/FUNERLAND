'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals reporter.
 *
 * Captures Core Web Vitals (CLS, FCP, FID, INP, LCP, TTFB) and:
 *  1. Logs them in development.
 *  2. Posts them to /api/vitals in production via navigator.sendBeacon.
 *  3. Forwards to gtag if Google Analytics is loaded.
 *
 * Rendered once from root layout — zero overhead on idle pages.
 */
export default function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
    });

    // 1) Dev log
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[web-vitals] ${metric.name}`, metric.value.toFixed(1), metric.rating);
      return;
    }

    // 2) sendBeacon to internal endpoint (non-blocking)
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.sendBeacon === 'function'
      ) {
        navigator.sendBeacon('/api/vitals', body);
      } else if (typeof fetch === 'function') {
        fetch('/api/vitals', {
          body,
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      }
    } catch {
      // swallow — perf reporting should never break the page
    }

    // 3) Forward to gtag (Google Analytics 4) if present
    try {
      const w = window as unknown as {
        gtag?: (...args: unknown[]) => void;
      };
      if (typeof w.gtag === 'function') {
        w.gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
          non_interaction: true,
        });
      }
    } catch {
      // ignore
    }
  });

  return null;
}
