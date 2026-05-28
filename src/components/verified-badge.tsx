import { ShieldCheck } from 'lucide-react';

export function VerifiedBadge({ year }: { year?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-green-light text-accent-green text-[11.5px] font-semibold tracking-wide">
      <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
      Zweryfikowany {year ?? ''}
    </span>
  );
}
