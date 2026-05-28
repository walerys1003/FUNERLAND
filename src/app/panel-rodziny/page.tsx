import Link from 'next/link';
import { FileText, Bookmark, Calculator, Bell, Settings2, ChevronDown, User, Heart } from 'lucide-react';

export default function PanelRodzinyPage() {
  return (
    <div className="bg-cream min-h-[calc(100vh-68px)]">
      <div className="bg-navy h-32" />
      <div className="container-page -mt-20 pb-16">
        <div className="card p-7 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-[36px]">Witaj, Pani Anno</h1>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-cream border border-border-soft flex items-center justify-center">
                <User className="w-4 h-4 text-text-secondary" />
              </button>
              <button className="w-10 h-10 rounded-full bg-cream border border-border-soft flex items-center justify-center">
                <Bell className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-8">
            <aside className="space-y-1">
              <NavItem icon={FileText} active>
                Moje zapytania
              </NavItem>
              <NavItem icon={Bookmark}>Zapisane firmy</NavItem>
              <NavItem icon={Calculator}>Mój kalkulator</NavItem>
              <NavItem icon={Bell}>Powiadomienia</NavItem>
              <NavItem icon={Settings2}>Ustawienia konta</NavItem>
            </aside>

            <div>
              <h2 className="font-heading text-[24px]">Twoje zapytania – historia wyceny</h2>

              <div className="mt-5 card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[12.5px] text-text-secondary">15 maja 2026</div>
                    <h3 className="font-heading text-[19px] mt-1">
                      Pogrzeb tradycyjny <br /> w Warszawie-Mokotowie
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-accent-green-light text-accent-green text-[12px] font-semibold whitespace-nowrap">
                    ✓ Otrzymano 3 oferty
                  </span>
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                </div>
                <p className="mt-3 text-[13.5px] text-text-secondary max-w-xl">
                  Kompleksowa organizacja pogrzebu. Preferowany cmentarz: Komunalny Północny. Termin
                  orientacyjny: maj 2026.
                </p>

                <h4 className="mt-6 font-semibold text-[15px]">Otrzymane oferty</h4>
                <div className="mt-3 grid md:grid-cols-3 gap-3">
                  {[
                    { name: 'Dom Pogrzebowy „Spokój"', trumna: 1200, cer: 2800, tra: 400, total: 4400, rating: 4.8, opinie: 120 },
                    { name: 'Firma Pogrzebowa „Wieczność"', trumna: 800, cer: 2500, tra: 1200, total: 4800, rating: 4.6, opinie: 95, items: { Urna: 800, Ceremonia: 2500, Kremacja: 1200, Transport: 300 } },
                    { name: 'Zakład Pogrzebowy „Harmonia"', trumna: 1500, cer: 3000, tra: 500, total: 5000, rating: 4.9, opinie: 150 },
                  ].map((o) => (
                    <div key={o.name} className="rounded-2xl border border-border-soft p-5">
                      <div className="font-semibold text-[14px]">{o.name}</div>
                      <div className="mt-3 space-y-1 text-[13px] text-text-secondary">
                        <div className="flex justify-between">
                          <span>Trumna</span>
                          <span>{o.trumna}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Ceremonia</span>
                          <span>{o.cer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Transport</span>
                          <span>{o.tra}</span>
                        </div>
                      </div>
                      <div className="mt-3 font-heading text-[19px]">{o.total.toLocaleString('pl-PL')} zł</div>
                      <div className="mt-2 text-[12px] text-gold">
                        {'★'.repeat(Math.round(o.rating))} <span className="text-text-muted">{o.rating}/5 ({o.opinie})</span>
                      </div>
                      <button className="mt-3 w-full btn-primary !py-2 text-[13px]">Skontaktuj się</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 card p-5 flex items-center justify-between">
                <div>
                  <div className="text-[12.5px] text-text-secondary">20 kwietnia 2026</div>
                  <h3 className="font-heading text-[18px] mt-1">Kremacja z pożegnaniem w Krakowie</h3>
                  <p className="text-[13px] text-text-secondary mt-1">
                    Organizacja kremacji, uroczystość w kaplicy. Preferowany termin: kwiecień 2026.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-md bg-warning/15 text-warning text-[12px] font-semibold">
                    ⌛ 1 firma odpowiedziała
                  </span>
                  <button className="btn-secondary !py-2">Zobacz oferty</button>
                </div>
              </div>

              <div className="mt-4 card p-5 flex items-center justify-between bg-cream/50">
                <div>
                  <div className="text-[12.5px] text-text-muted">10 marca 2026</div>
                  <h3 className="font-heading text-[18px] mt-1 text-text-secondary">Pogrzeb wyznaniowy w Gdańsku</h3>
                  <p className="text-[13px] text-text-muted mt-1">
                    Organizacja pogrzebu katolickiego, cmentarz parafialny. Termin: marzec 2026.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-md bg-border-soft text-text-muted text-[12px] font-semibold">
                    Zarchiwizowane
                  </span>
                  <button className="btn-secondary !py-2">Zobacz szczegóły</button>
                </div>
              </div>

              <button className="mt-6 w-full btn-primary !py-4">
                <Heart className="w-4 h-4" />
                Wystaw opinię po zakończonym pogrzebie – pomóż innym rodzinom
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[12.5px] text-text-muted flex justify-center gap-6">
          <Link href="/regulamin">Regulamin</Link>
          <Link href="/prywatnosc">Polityka Prywatności</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, children, active }: any) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] cursor-pointer ${
        active ? 'bg-accent-green text-white' : 'text-navy/85 hover:bg-cream'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}
