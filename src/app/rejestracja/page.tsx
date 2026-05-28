import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from '@/components/auth/signup-form';
import { AUTH_CONFIGURED } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Rejestracja · Polskie Pogrzeby',
  description: 'Załóż konto rodziny lub konto firmy w marketplace.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-2xl font-medium text-[#0F1B2D]"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Polskie Pogrzeby
          </Link>
          <h1 className="mt-4 text-xl font-medium text-stone-900">Załóż konto</h1>
          <p className="mt-1 text-sm text-stone-500">Bezpłatnie · bez karty · 1 minuta</p>
        </div>

        {!AUTH_CONFIGURED ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-6 text-center text-sm text-stone-700">
            <p className="font-medium text-amber-700 mb-2">Tryb demo</p>
            <p>
              Konfiguracja Supabase nie jest jeszcze aktywna. W trybie produkcyjnym tu pojawi
              się formularz rejestracji.
            </p>
          </div>
        ) : (
          <SignupForm />
        )}

        <p className="mt-6 text-center text-xs text-stone-500">
          Masz już konto?{' '}
          <Link href="/logowanie" className="text-[#2E4F3E] underline underline-offset-2">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
