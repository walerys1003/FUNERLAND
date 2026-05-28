'use client';

/**
 * Cookie consent banner — RODO + ePrivacy compatible.
 *
 * Funkcje:
 *  - 3 kategorie: niezbędne (zawsze on), analityczne (Plausible), marketingowe
 *  - LocalStorage: `pp_cookie_consent` = JSON z timestampem
 *  - Re-prompt po 12 miesiącach (zgodność z polską UODO)
 *  - Banner pojawia się dopiero po pierwszym scrollu/interakcji (mniej intruzywny)
 *  - Trigger CustomEvent('pp:consent-changed') — inne komponenty mogą reagować
 */

import { useEffect, useState } from 'react';

type ConsentCategories = {
  necessary: true; // always
  analytics: boolean;
  marketing: boolean;
};

type StoredConsent = {
  version: 1;
  acceptedAt: string;
  categories: ConsentCategories;
};

const STORAGE_KEY = 'pp_cookie_consent';
const CONSENT_MAX_AGE_DAYS = 365;

function readConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    const acceptedTime = new Date(parsed.acceptedAt).getTime();
    const ageDays = (Date.now() - acceptedTime) / (1000 * 60 * 60 * 24);
    if (ageDays > CONSENT_MAX_AGE_DAYS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(categories: Omit<ConsentCategories, 'necessary'>) {
  if (typeof window === 'undefined') return;
  const stored: StoredConsent = {
    version: 1,
    acceptedAt: new Date().toISOString(),
    categories: { necessary: true, ...categories },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  // Eventy do innych komponentów (Plausible, Meta Pixel etc.)
  window.dispatchEvent(new CustomEvent('pp:consent-changed', { detail: stored }));
}

export function getStoredConsent(): StoredConsent | null {
  return readConsent();
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) return;
    // Pokaż banner po krótkiej chwili (mniej natychmiastowy)
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const acceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setShow(false);
  };
  const rejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
    setShow(false);
  };
  const saveSelected = () => {
    saveConsent({ analytics, marketing });
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-white border-t-2 border-navy-900 shadow-2xl"
      style={{
        backgroundColor: '#fff',
        borderTop: '2px solid #1a2332',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2
            id="cookie-title"
            style={{ fontSize: 18, fontWeight: 600, color: '#1a2332', margin: 0 }}
          >
            Pliki cookies i prywatność
          </h2>
          <p
            id="cookie-desc"
            style={{ fontSize: 14, color: '#374151', lineHeight: 1.5, margin: 0 }}
          >
            Używamy plików cookies do działania serwisu i — za Twoją zgodą — do analityki ruchu.
            Możesz w każdej chwili zmienić swoje preferencje w stopce strony.{' '}
            <a
              href="/polityka-prywatnosci"
              style={{ color: '#1a2332', textDecoration: 'underline' }}
            >
              Polityka prywatności
            </a>{' '}
            ·{' '}
            <a href="/regulamin" style={{ color: '#1a2332', textDecoration: 'underline' }}>
              Regulamin
            </a>
          </p>

          {details && (
            <div
              style={{
                background: '#faf7f2',
                padding: 12,
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'start', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked disabled style={{ marginTop: 3 }} />
                <span>
                  <strong>Niezbędne</strong> — zapamiętanie zgody, sesja zalogowania, koszyk.
                  Wymagane do działania serwisu (nie można wyłączyć).
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'start', gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <strong>Analityczne</strong> — Plausible Analytics (anonimowe statystyki ruchu).
                  Pomagają nam ulepszać serwis.
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'start', gap: 8, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <strong>Marketingowe</strong> — reklamy remarketingowe (obecnie nieaktywne).
                </span>
              </label>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setDetails((v) => !v)}
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {details ? 'Ukryj szczegóły' : 'Dostosuj'}
            </button>
            <button
              type="button"
              onClick={rejectAll}
              style={{
                background: '#fff',
                border: '1px solid #1a2332',
                color: '#1a2332',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Tylko niezbędne
            </button>
            {details ? (
              <button
                type="button"
                onClick={saveSelected}
                style={{
                  background: '#7c8d54',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Zapisz wybór
              </button>
            ) : (
              <button
                type="button"
                onClick={acceptAll}
                style={{
                  background: '#1a2332',
                  color: '#f5e9d4',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Akceptuj wszystkie
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
