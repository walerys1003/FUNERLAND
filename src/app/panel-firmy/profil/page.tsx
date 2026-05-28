import { Check, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';

export default function PanelProfilPage() {
  return (
    <div className="max-w-[1100px]">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-heading text-[32px]">
            Profil firmy · <span className="text-text-secondary">Zakład Pogrzebowy Kalla</span>
          </h1>
        </div>
        <div className="text-[12px] text-text-secondary max-w-xs text-right">
          ⓘ Wysoki stopień uzupełnienia profilu poprawia widoczność i pozycję w wynikach wyszukiwania
        </div>
      </div>

      <div className="mt-6 card !p-4 flex items-center gap-4">
        <div className="flex-1 h-9 bg-navy rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 bg-accent-green" style={{ width: '73%' }} />
          <span className="relative z-10 text-white text-[13px] font-medium pl-5 leading-9">
            Wypełniono 73%
          </span>
        </div>
        <span className="text-[12.5px] text-text-secondary">uzupełnij aby awansować w rankingu</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 mt-6 items-start">
        <div className="space-y-3">
          <CollapsedSection title="Dane podstawowe" status="complete" />
          <CollapsedSection title="Opis firmy" status="complete" />

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-[18px]">
                Usługi i cennik <span className="text-warning text-[12px] ml-2">(in progress)</span>
              </h3>
              <ChevronDown className="w-5 h-5 text-text-muted" />
            </div>

            <div className="mt-6">
              <h4 className="text-[15px] font-semibold mb-4">Dodaj nową usługę</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Wybierz kategorię</label>
                  <select className="input">
                    <option>Ceremonia pogrzebowa</option>
                    <option>Transport</option>
                    <option>Opieka</option>
                    <option>Trumny i urny</option>
                  </select>
                </div>
                <div>
                  <label className="label">Nazwa usługi</label>
                  <input className="input" placeholder="np. Ceremonia urnowa" />
                </div>
                <div>
                  <label className="label">Cena od (zł)</label>
                  <div className="relative">
                    <input className="input pr-10" placeholder="Wpisz kwotę" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]">zł</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Opis usługi</label>
                <textarea
                  className="input !h-24 py-3"
                  placeholder="Opisz szczegóły i warianty usługi, np. co wchodzi w skład ceny podstawowej."
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[12px] text-text-muted">0/500 znaków</span>
                  <button className="btn-primary !py-2 !px-4 text-[13px]">
                    <Plus className="w-4 h-4" /> Dodaj usługę
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-[15px] font-semibold mb-3">Dodane usługi</h4>
              <div className="divide-y divide-border-soft">
                {[
                  ['Pogrzeb tradycyjny', 'od 4 200 zł'],
                  ['Kremacja', 'od 3 800 zł'],
                  ['Transport zwłok 24/7', 'dostępny'],
                ].map(([n, p]) => (
                  <div key={n} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-[14px] font-medium">{n}</div>
                      <div className="text-[12.5px] text-text-muted">{p}</div>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary text-[13px]">
                      <button className="inline-flex items-center gap-1 hover:text-navy">
                        <Pencil className="w-3.5 h-3.5" /> Edytuj
                      </button>
                      <button className="inline-flex items-center gap-1 hover:text-error">
                        <Trash2 className="w-3.5 h-3.5" /> Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="w-full btn-primary !py-4">Zapisz zmiany</button>
        </div>

        <aside className="card p-6">
          <div className="text-[13px] text-text-secondary">Twój ranking w mieście</div>
          <div className="font-heading text-[56px] leading-none mt-2">
            #14 <span className="text-[18px] text-text-secondary">z 47</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-sm ${i < 9 ? 'bg-accent-green' : 'bg-border-soft'}`}
              />
            ))}
          </div>
          <div className="mt-5 text-[13px] text-text-secondary">
            Dodaj cennik aby <br />
            awansować <span className="text-accent-green">+8 pozycji ↑</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CollapsedSection({ title, status }: { title: string; status: 'complete' | 'incomplete' }) {
  return (
    <div className="card p-5 flex items-center justify-between cursor-pointer hover:bg-cream/30">
      <div className="flex items-center gap-3">
        <span className="font-heading text-[17px]">{title}</span>
        <span className={`text-[12px] ${status === 'complete' ? 'text-accent-green' : 'text-warning'}`}>
          ({status})
        </span>
      </div>
      {status === 'complete' ? (
        <Check className="w-5 h-5 text-accent-green" />
      ) : (
        <ChevronDown className="w-5 h-5 text-text-muted" />
      )}
    </div>
  );
}
