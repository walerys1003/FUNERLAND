import Link from 'next/link';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/85 mt-24">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <div className="text-white">
              <Logo variant="light" />
            </div>
            <p className="mt-4 text-[14px] text-white/65 max-w-xs leading-relaxed">
              Pożegnaj godnie. Bez presji. Bez ukrytych kosztów. Marketplace zweryfikowanych firm
              pogrzebowych w Polsce.
            </p>
            <div className="mt-6 flex items-center gap-3 text-[12px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green-light" /> RODO compliant
              </span>
              <span>•</span>
              <span>847 zweryfikowanych firm</span>
            </div>
          </div>
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-4">Dla rodzin</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><Link className="hover:text-white" href="/kalkulator">Kalkulator kosztów</Link></li>
              <li><Link className="hover:text-white" href="/warszawa/zaklady-pogrzebowe">Znajdź firmę</Link></li>
              <li><Link className="hover:text-white" href="/nekrologi">Nekrologi</Link></li>
              <li><Link className="hover:text-white" href="/poradnik">Poradnik</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-4">Dla firm</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><Link className="hover:text-white" href="/dla-firm">Pakiety</Link></li>
              <li><Link className="hover:text-white" href="/panel-firmy">Panel firmy</Link></li>
              <li><Link className="hover:text-white" href="/dla-firm#claim">Przejmij profil</Link></li>
              <li><Link className="hover:text-white" href="/admin">Panel admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[14px] font-semibold mb-4">Polskie Pogrzeby</h4>
            <ul className="space-y-2.5 text-[14px]">
              <li><Link className="hover:text-white" href="/o-nas">O nas</Link></li>
              <li><Link className="hover:text-white" href="/regulamin">Regulamin</Link></li>
              <li><Link className="hover:text-white" href="/prywatnosc">Polityka prywatności</Link></li>
              <li><Link className="hover:text-white" href="/kontakt">Kontakt</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-[12px] text-white/50">
          <p>© 2026 Polskie Pogrzeby. Wszelkie prawa zastrzeżone.</p>
          <p>Wsparcie 24/7: <a href="tel:+48800123456" className="underline hover:text-white">800 123 456</a></p>
        </div>
      </div>
    </footer>
  );
}
