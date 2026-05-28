'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Root error boundary — caught by Next.js for any uncaught render/data error.
 * Polish, grief-safe tone. Avoids alarming red blast.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; in production this would go to Sentry / Logflare etc.
    console.error('Root error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream flex items-center justify-center p-6">
      <div className="card p-8 md:p-10 max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-warning/15 text-warning flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="mt-4 font-heading text-[24px]">Coś poszło nie tak</h1>
        <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">
          Przepraszamy — wystąpił błąd podczas wczytywania tej strony. Spróbuj jeszcze raz lub
          wróć na stronę główną.
        </p>
        {error.digest && (
          <p className="mt-3 text-[11px] text-text-muted font-mono">
            ID błędu: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={reset}
            className="btn-primary !py-2.5 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Spróbuj ponownie
          </button>
          <Link href="/" className="btn-secondary !py-2.5 inline-flex items-center gap-1.5">
            <Home className="w-4 h-4" />
            Strona główna
          </Link>
        </div>
        <p className="mt-6 text-[12px] text-text-muted">
          Jeśli problem się powtarza, napisz na{' '}
          <a href="mailto:kontakt@polskiepogrzeby.pl" className="text-accent-green underline">
            kontakt@polskiepogrzeby.pl
          </a>
        </p>
      </div>
    </div>
  );
}
