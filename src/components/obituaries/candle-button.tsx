'use client';

import { useState } from 'react';
import { Flame } from 'lucide-react';

export default function CandleButton({
  slug,
  initialCandles,
}: {
  slug: string;
  initialCandles: number;
}) {
  const [count, setCount] = useState(initialCandles);
  const [lit, setLit] = useState(false);
  const [loading, setLoading] = useState(false);

  async function light() {
    if (lit || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/obituaries/${slug}/candle`, { method: 'POST' });
      const data = await res.json();
      if (data.candles != null) setCount(data.candles);
      setLit(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={light}
      disabled={lit || loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition ${
        lit
          ? 'border-[#C9A65F] bg-[#C9A65F]/10 text-[#C9A65F]'
          : 'border-stone-300 hover:border-[#C9A65F] hover:bg-[#C9A65F]/5 text-stone-700'
      }`}
    >
      <Flame
        className={`h-5 w-5 ${lit ? 'text-[#C9A65F]' : 'text-stone-500'} ${
          lit ? 'animate-pulse' : ''
        }`}
        fill={lit ? 'currentColor' : 'none'}
      />
      <span className="text-sm font-medium">
        {lit ? 'Świeca zapalona' : 'Zapal świecę'} · {count}
      </span>
    </button>
  );
}
