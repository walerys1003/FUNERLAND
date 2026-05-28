'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

export default function ModerationActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: 'approve' | 'reject') {
    setError(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Błąd');
        return;
      }
      setDone(action === 'approve' ? 'approved' : 'rejected');
      // Refresh the server data after a short delay
      startTransition(() => router.refresh());
    } catch (e: any) {
      setError(e.message || 'Błąd sieci');
    }
  }

  if (done) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[12px] font-semibold ${
          done === 'approved' ? 'text-accent-green' : 'text-text-muted'
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
        className="px-2.5 py-1 bg-accent-green text-white rounded-md text-[11.5px] inline-flex items-center gap-1 disabled:opacity-50"
        title="Zatwierdź"
      >
        {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Zatwierdź
      </button>
      <button
        type="button"
        onClick={() => act('reject')}
        disabled={pending}
        className="px-2.5 py-1 border border-error/40 text-error rounded-md text-[11.5px] inline-flex items-center gap-1 disabled:opacity-50"
        title="Odrzuć"
      >
        <X className="w-3 h-3" />
        Odrzuć
      </button>
      {error && (
        <span className="text-[10.5px] text-error ml-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
