import Link from 'next/link';

export function Logo({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const color = variant === 'light' ? 'text-white' : 'text-navy';
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${color}`} aria-label="Polskie Pogrzeby">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-current/30">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3c-2.5 3 -4 6 -4 9a4 4 0 0 0 8 0c0 -3 -1.5 -6 -4 -9z" />
          <path d="M12 14v7" />
          <path d="M9 21h6" />
        </svg>
      </span>
      <span className="font-heading text-[17px] leading-tight tracking-tight">
        <span className="block font-semibold">Polskie</span>
        <span className="block font-semibold -mt-1">Pogrzeby</span>
      </span>
    </Link>
  );
}
