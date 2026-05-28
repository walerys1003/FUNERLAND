import { Star } from 'lucide-react';

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            width={size}
            height={size}
            strokeWidth={1.4}
            className={filled ? 'fill-gold text-gold' : 'text-border-line'}
          />
        );
      })}
    </span>
  );
}
