'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  /** Optional role to set on signup ('family' | 'company'). For login, leave undefined. */
  intendedRole?: 'family' | 'company';
  label?: string;
};

export default function GoogleButton({ intendedRole, label }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = intendedRole
        ? `${origin}/api/auth/callback?role=${intendedRole}`
        : `${origin}/api/auth/callback`;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (err) throw err;
      // Browser will redirect to Google
    } catch (e: any) {
      setError(e?.message || 'Nie udało się połączyć z Google');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={loading}
        className="w-full py-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 font-medium hover:bg-stone-50 transition disabled:opacity-60 inline-flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.7 39.7 16.3 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.6 36.3 44 30.7 44 24c0-1.3-.1-2.4-.4-3.5z"
            />
          </svg>
        )}
        {label || 'Kontynuuj z Google'}
      </button>
      {error && (
        <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
