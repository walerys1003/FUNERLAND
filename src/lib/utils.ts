/**
 * Tiny class-name combiner — no dependencies needed.
 * Accepts strings, falsy values, arrays. Filters empty values.
 */
export function cn(...inputs: Array<string | false | null | undefined | (string | false | null | undefined)[]>): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      for (const v of input) if (v) out.push(v);
    } else {
      out.push(input);
    }
  }
  return out.join(' ');
}

/** Format Polish currency without decimals. */
export function fmtPLN(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Human-readable time-ago in Polish. */
export function timeAgo(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'przed chwilą';
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} dni temu`;
  return d.toLocaleDateString('pl-PL');
}
