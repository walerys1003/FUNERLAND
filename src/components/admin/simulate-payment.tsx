'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Zap } from 'lucide-react';

export default function SimulatePayment() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [companySlug, setCompanySlug] = useState('');
  const [plan, setPlan] = useState<'standard' | 'pro' | 'premium'>('pro');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function simulate() {
    setMsg(null);
    setErr(null);
    if (!companySlug.trim()) {
      setErr('Podaj slug firmy.');
      return;
    }
    try {
      const res = await fetch('/api/billing/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: true, companySlug: companySlug.trim(), plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMsg(`OK — utworzono subskrypcję ${data.subscription?.id}`);
      setCompanySlug('');
      startTransition(() => router.refresh());
    } catch (e: any) {
      setErr(e?.message || 'Błąd');
    }
  }

  return (
    <div className="bg-white border border-border-soft rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 inline-flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-[15px] text-navy">Symuluj wpłatę (tryb demo)</h3>
          <p className="text-[12.5px] text-text-secondary mt-0.5">
            Tworzy testową aktywną subskrypcję bez Stripe. Działa tylko gdy{' '}
            <code className="px-1 bg-stone-100 rounded">STRIPE_SECRET_KEY</code> nie jest ustawiony.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[11px] text-text-secondary mb-1">Slug firmy</label>
              <input
                type="text"
                value={companySlug}
                onChange={(e) => setCompanySlug(e.target.value)}
                placeholder="np. zaklad-pogrzebowy-kalla"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-secondary mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
              >
                <option value="standard">Standard (149 zł)</option>
                <option value="pro">Pro (349 zł)</option>
                <option value="premium">Premium (699 zł)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={simulate}
              disabled={pending}
              className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Symuluj
            </button>
          </div>
          {msg && <div className="mt-2 text-[12.5px] text-emerald-700">{msg}</div>}
          {err && <div className="mt-2 text-[12.5px] text-red-700">{err}</div>}
        </div>
      </div>
    </div>
  );
}
