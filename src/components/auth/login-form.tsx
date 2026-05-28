'use client';

import { useState } from 'react';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'magic-link' | 'password';

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>('magic-link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      if (mode === 'magic-link') {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (err) throw err;
        setSent(true);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        window.location.href = '/';
      }
    } catch (e: any) {
      setError(e.message || 'Nie udało się zalogować');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-white border border-emerald-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-lg font-medium text-stone-900 mb-1">Sprawdź skrzynkę</h2>
        <p className="text-sm text-stone-600">
          Wysłaliśmy link logujący na <strong>{email}</strong>. Kliknij w niego, by się zalogować.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('magic-link')}
          className={`flex-1 text-xs py-1.5 px-3 rounded-full ${
            mode === 'magic-link' ? 'bg-[#2E4F3E] text-white' : 'bg-stone-100 text-stone-600'
          }`}
        >
          Magic link
        </button>
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`flex-1 text-xs py-1.5 px-3 rounded-full ${
            mode === 'password' ? 'bg-[#2E4F3E] text-white' : 'bg-stone-100 text-stone-600'
          }`}
        >
          Hasło
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-700 mb-1">E-mail</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
            placeholder="email@example.com"
          />
        </div>
      </div>

      {mode === 'password' && (
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Hasło</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
          />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#2E4F3E] text-white font-medium hover:bg-[#26412F] transition disabled:opacity-60 inline-flex items-center justify-center gap-2 text-sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {mode === 'magic-link' ? 'Wyślij magic link' : 'Zaloguj'}
      </button>
    </form>
  );
}
