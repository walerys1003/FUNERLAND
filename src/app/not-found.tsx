import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream flex items-center justify-center p-6">
      <div className="card p-8 md:p-10 max-w-md text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-green-light text-accent-green flex items-center justify-center">
          <Compass className="w-7 h-7" />
        </div>
        <div className="mt-4 font-heading text-[64px] leading-none text-text-muted">404</div>
        <h1 className="mt-1 font-heading text-[22px]">Nie znaleziono strony</h1>
        <p className="mt-2 text-[14px] text-text-secondary leading-relaxed">
          Strona, której szukasz, mogła zostać przeniesiona lub usunięta.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link href="/" className="btn-primary !py-2.5 inline-flex items-center gap-1.5">
            <Home className="w-4 h-4" />
            Strona główna
          </Link>
          <Link href="/firmy" className="btn-secondary !py-2.5 inline-flex items-center gap-1.5">
            <Search className="w-4 h-4" />
            Znajdź firmę
          </Link>
        </div>
        <div className="mt-6 text-[12px] text-text-secondary">
          Popularne strony:{' '}
          <Link href="/narzedzia" className="text-accent-green hover:underline">
            Narzędzia
          </Link>{' '}
          ·{' '}
          <Link href="/nekrologi" className="text-accent-green hover:underline">
            Nekrologi
          </Link>{' '}
          ·{' '}
          <Link href="/poradnik" className="text-accent-green hover:underline">
            Poradnik
          </Link>
        </div>
      </div>
    </div>
  );
}
