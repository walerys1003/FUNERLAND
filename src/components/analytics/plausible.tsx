'use client';

/**
 * Plausible Analytics — consent-aware loader.
 *
 * Logika:
 *  - Czyta NEXT_PUBLIC_PLAUSIBLE_DOMAIN z env. Jeśli pusty → nic nie wstaje.
 *  - Czyta zgodę z localStorage (`pp_cookie_consent`). Jeśli analytics=false → nic nie wstaje.
 *  - Nasłuchuje `pp:consent-changed` żeby load/unload dynamicznie po zmianie zgody.
 *  - Skrypt ładowany z https://plausible.io/js/script.js (lub PLAUSIBLE_SCRIPT z env).
 *
 * RODO/ePrivacy: Plausible jest cookie-less, ale i tak respektujemy decyzję usera.
 */

import { useEffect, useState } from 'react';
import { getStoredConsent } from '@/components/legal/CookieConsent';

const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const SCRIPT_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT || 'https://plausible.io/js/script.js';

export function PlausibleScript() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!DOMAIN) return;

    const update = () => {
      const consent = getStoredConsent();
      setEnabled(Boolean(consent?.categories.analytics));
    };
    update();

    const handler = () => update();
    window.addEventListener('pp:consent-changed', handler as any);
    return () => window.removeEventListener('pp:consent-changed', handler as any);
  }, []);

  if (!DOMAIN || !enabled) return null;

  return (
    <script
      defer
      data-domain={DOMAIN}
      src={SCRIPT_SRC}
      // dla bezpieczeństwa CSP — w razie aliasów własnego serwera
      crossOrigin="anonymous"
    />
  );
}

/**
 * Helper do trackowania custom eventów (np. lead_submitted, checkout_started).
 *
 * Użycie:
 *   import { trackEvent } from '@/components/analytics/plausible';
 *   trackEvent('lead_submitted', { plan: 'pro' });
 */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const plausible = (window as any).plausible;
  if (typeof plausible === 'function') {
    plausible(name, props ? { props } : undefined);
  }
}
