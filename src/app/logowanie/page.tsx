import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/auth/login-form';
import { AUTH_CONFIGURED } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Logowanie · Polskie Pogrzeby',
  description: 'Zaloguj się do panelu firmy lub panelu rodziny.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-medium text-[#0F1B2D]" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>
            Polskie Pogrzeby
          </Link>
          <h1 className="mt-4 text-xl font-medium text-stone-900">Zaloguj się</h1>
          <p className="mt-1 text-sm text-stone-500">
            Wpisz e-mail, wyślemy link logujący (bez hasła).
          </p>
        </div>
        {!AUTH_CONFIGURED ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-6 text-center text-sm text-stone-700">
            <p className="font-medium text-amber-700 mb-2">Tryb demo</p>
            <p>
              Konfiguracja Supabase nie jest jeszcze aktywna. W trybie produkcyjnym tu pojawi
              się formularz logowania magic-link.
            </p>
            <p className="mt-3 text-xs text-stone-500">
              Aby aktywować: ustaw zmienne <code>NEXT_PUBLIC_SUPABASE_URL</code> i{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        ) : (
          <LoginForm />
        )}
        <p className="mt-6 text-center text-xs text-stone-500">
          Nie masz konta?{' '}
          <Link href="/rejestracja" className="text-[#2E4F3E] underline underline-offset-2">
            Załóż konto
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-stone-400">
          Logując się akceptujesz{' '}
          <Link href="/regulamin" className="underline">regulamin</Link> oraz{' '}
          <Link href="/polityka-prywatnosci" className="underline">politykę prywatności</Link>.
        </p>
      </div>
    </div>
  );
}
