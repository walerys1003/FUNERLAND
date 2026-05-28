import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo/json-ld';
import JsonLd from './json-ld';

type Props = {
  items: Crumb[];
  className?: string;
  /** When true, the first "Strona główna" item is auto-prepended. Default true. */
  withHome?: boolean;
};

/**
 * Accessible visible breadcrumb with auto-emitted BreadcrumbList JSON-LD.
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { name: 'Narzędzia', url: '/narzedzia' },
 *     { name: 'Koszt pogrzebu', url: '/narzedzia/koszt-pogrzebu' },
 *   ]} />
 */
export default function Breadcrumbs({ items, className = '', withHome = true }: Props) {
  const full: Crumb[] = withHome
    ? [{ name: 'Strona główna', url: '/' }, ...items]
    : items;

  return (
    <>
      <nav
        aria-label="Ścieżka nawigacji"
        className={`flex flex-wrap items-center gap-1 text-[12.5px] text-text-secondary ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-1">
          {full.map((c, i) => {
            const isLast = i === full.length - 1;
            return (
              <li key={c.url} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="w-3 h-3 text-text-muted" aria-hidden="true" />
                )}
                {isLast ? (
                  <span
                    className="font-medium text-text-primary"
                    aria-current="page"
                  >
                    {i === 0 && <Home className="w-3 h-3 inline mr-1" aria-hidden="true" />}
                    {c.name}
                  </span>
                ) : (
                  <Link
                    href={c.url}
                    className="hover:text-accent-green inline-flex items-center gap-1"
                  >
                    {i === 0 && <Home className="w-3 h-3" aria-hidden="true" />}
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(full)} />
    </>
  );
}
