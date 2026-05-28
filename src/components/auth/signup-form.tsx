'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import GoogleButton from './google-button';

type Role = 'family' | 'company';

export default function SignupForm() {
  const [role, setRole] = useState<Role>('family');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rodo, setRodo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?role=${role}`,
          data: { full_name: fullName, phone, intended_role: role },
        },
      });
      if (err) throw err;
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Nie udało się utworzyć konta');
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
          Wysłaliśmy link aktywacyjny na <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <GoogleButton intendedRole={role} label="Zarejestruj przez Google" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-[11px] uppercase tracking-wide text-stone-400">lub e-mailem</span>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Wybierz typ konta"
      >
        <button
          type="button"
          onClick={() => setRole('family')}
          className={`p-3 rounded-lg border-2 text-sm ${
            role === 'family' ? 'border-[#2E4F3E] bg-[#2E4F3E]/5' : 'border-stone-200'
          }`}
        >
          <div className="font-medium">Rodzina</div>
          <div className="text-xs text-stone-500 mt-1">organizuję pożegnanie</div>
        </button>
        <button
          type="button"
          onClick={() => setRole('company')}
          className={`p-3 rounded-lg border-2 text-sm ${
            role === 'company' ? 'border-[#2E4F3E] bg-[#2E4F3E]/5' : 'border-stone-200'
          }`}
        >
          <div className="font-medium">Firma</div>
          <div className="text-xs text-stone-500 mt-1">prowadzę zakład / kwiaciarnię</div>
        </button>
      </div>

      <input
        type="text"
        required
        placeholder="Imię i nazwisko"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
      />

      <input
        type="email"
        required
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
      />

      <input
        type="tel"
        required
        placeholder="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:border-[#2E4F3E] focus:outline-none text-sm"
      />

      <label className="flex items-start gap-2 text-xs text-stone-600">
        <input
          type="checkbox"
          required
          checked={rodo}
          onChange={(e) => setRodo(e.target.checked)}
          className="mt-0.5"
        />
        <span>Akceptuję regulamin i wyrażam zgodę na przetwarzanie danych (RODO).</span>
      </label>

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
        Załóż konto
      </button>
    </form>
  );
}
