'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

type Props = {
  id: string;
  endpoint: '/api/admin/condolences' | '/api/admin/memories';
};

export default function ModerationRow({ id, endpoint }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: 'approve' | 'reject') {
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Błąd');
        return;
      }
      setDone(action === 'approve' ? 'approved' : 'rejected');
      startTransition(() => router.refresh());
    } catch (e: any) {
      setError(e?.message || 'Błąd sieci');
    }
  }

  if (done) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[12px] font-semibold ${
          done === 'approved' ? 'text-emerald-600' : 'text-stone-400'
        }`}
      >
        {done === 'approved' ? '✓ Zatwierdzono' : '× Odrzucono'}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => act('approve')}
        disabled={pending}
        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11.5px] inline-flex items-center gap-1 disabled:opacity-50"
      >
        {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Zatwierdź
      </button>
      <button
        type="button"
        onClick={() => act('reject')}
        disabled={pending}
        className="px-2.5 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-[11.5px] inline-flex items-center gap-1 disabled:opacity-50"
      >
        <X className="w-3 h-3" />
        Odrzuć
      </button>
      {error && (
        <span className="text-[10.5px] text-red-600 ml-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
