/**
 * Custom Polskie Pogrzeby SVG Icons
 * Style: outline, stroke 1.6, rounded caps, dignified
 * Designed by: Agent 2 — Design System
 * Palette: currentColor (uses parent text-color)
 */

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const base = (size = 24, strokeWidth = 1.6) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/** Trumna — coffin (sześciokątna sylwetka z krzyżem) */
export function CoffinIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M9 3h6l4 6-4 12H9L5 9l4-6z" />
      <line x1="12" y1="9" x2="12" y2="17" />
      <line x1="9.5" y1="12" x2="14.5" y2="12" />
    </svg>
  );
}

/** Urna — urn (kremacja) */
export function UrnIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M8 6h8l-0.5 3" />
      <path d="M7.5 9C7 12 7 16 9 19h6c2-3 2-7 1.5-10" />
      <path d="M9 19c0 1 .5 1.5 1.5 1.5h3c1 0 1.5-.5 1.5-1.5" />
      <path d="M11 13l1 1.5L13 13" />
    </svg>
  );
}

/** Krematorium — flame inside building */
export function CrematoriumIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M3 20V9l9-5 9 5v11" />
      <path d="M3 20h18" />
      <path d="M9 20v-5h6v5" />
      <path d="M12 7c-1 1.5-1.5 3-0.5 4 0.5-0.5 0.8-1 1-1.5 0.5 0.8 1 1.5 0 2.5-1 0.5-2 0-2-1 0-1 0.5-1.5 1.5-4z" />
    </svg>
  );
}

/** Ceremonia — chairs/altar (uroczystość) */
export function CeremonyIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M3 20h18" />
      <path d="M12 4v8" />
      <path d="M9 7h6" />
      <rect x="4" y="15" width="5" height="3" rx="0.5" />
      <rect x="15" y="15" width="5" height="3" rx="0.5" />
      <line x1="5" y1="20" x2="5" y2="22" />
      <line x1="8" y1="20" x2="8" y2="22" />
      <line x1="16" y1="20" x2="16" y2="22" />
      <line x1="19" y1="20" x2="19" y2="22" />
    </svg>
  );
}

/** Transmisja online — kamera/play */
export function StreamIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <rect x="3" y="6" width="14" height="12" rx="2" />
      <path d="M17 10l4-2v8l-4-2" />
      <path d="M9 10v4l4-2-4-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Transport zwłok — karawan */
export function TransportIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M2 16V9l3-3h10l3 4h4v6" />
      <line x1="2" y1="16" x2="22" y2="16" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <line x1="11" y1="9" x2="11" y2="13" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  );
}

/** Nagrobek — kamieniarz */
export function GravestoneIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M6 20V11a6 6 0 0 1 12 0v9" />
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="12" y1="10" x2="12" y2="16" />
      <line x1="10" y1="12.5" x2="14" y2="12.5" />
    </svg>
  );
}

/** Chłodnia — refrigeration (medical) */
export function MorgueIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <circle cx="7.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <path d="M9.5 7l-1 1m-1 1l-1 1m4-2l-1 1" />
    </svg>
  );
}

/** Bonus: Świeca pamięci — used in obituaries */
export function CandleIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M12 2c-1 1.5-1.5 3-0.5 4 0.5-0.5 0.8-1 1-1.5 0.5 0.8 1 1.5 0 2.5-1 0.5-2 0-2-1 0-1 0.5-2 1.5-4z" />
      <rect x="9" y="8" width="6" height="12" rx="0.5" />
      <line x1="7" y1="20" x2="17" y2="20" />
    </svg>
  );
}

/** Bonus: Kwiat — kwiaciarnia pogrzebowa */
export function FlowerIcon({ className, size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <circle cx="12" cy="8" r="2.5" />
      <circle cx="7" cy="11" r="2.5" />
      <circle cx="17" cy="11" r="2.5" />
      <circle cx="9.5" cy="14.5" r="2.5" />
      <circle cx="14.5" cy="14.5" r="2.5" />
      <circle cx="12" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <path d="M12 16v6" />
      <path d="M9 22h6" />
    </svg>
  );
}

// Mapowanie po slug kategorii dla łatwego użycia
export const CATEGORY_ICONS = {
  'zaklady-pogrzebowe': CoffinIcon,
  'kremacja': UrnIcon,
  'krematorium': CrematoriumIcon,
  'kwiaciarnie-pogrzebowe': FlowerIcon,
  'kamieniarze': GravestoneIcon,
  'transport-zwlok': TransportIcon,
  'transmisje-online': StreamIcon,
  'mistrzowie-ceremonii': CeremonyIcon,
  'chlodnia': MorgueIcon,
} as const;
