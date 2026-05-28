import { Search, ArrowRight } from 'lucide-react';
import { obituaries } from '@/lib/data';

export default function NekrologiPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-heading text-[40px] md:text-[52px] leading-tight">Nekrologi i wspomnienia</h1>
        <p className="mt-4 text-text-secondary">
          Pożegnaj bliskich godnie. Bezpłatna publikacja, wsparcie rodziny
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex items-center gap-2 mb-12">
        <div className="card !p-1 flex items-center flex-1">
          <div className="pl-3 pr-2 text-text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input className="flex-1 h-11 bg-transparent focus:outline-none text-[14px]" placeholder="Szukaj po imieniu..." />
        </div>
        <select className="h-13 px-4 py-3 rounded-2xl border border-border-soft bg-white text-[14px]">
          <option>Miejscowość</option>
          <option>Warszawa</option>
          <option>Kraków</option>
        </select>
        <button className="btn-primary !rounded-2xl">Szukaj ↗</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {obituaries.slice(0, 6).map((o) => (
          <div
            key={o.slug}
            className={`card p-6 text-center ${o.isPremium ? 'border-gold/60 bg-[#FAF6EC]' : ''}`}
          >
            {o.isPremium && (
              <div className="text-[10.5px] text-gold font-semibold tracking-wider uppercase mb-2">
                Premium · z transmisją online
              </div>
            )}
            <div className="h-20 mb-3 flex items-center justify-center text-border-line">
              <svg viewBox="0 0 80 60" className="h-full">
                <path d="M10 50 Q 20 20 30 50 M 40 50 Q 50 25 60 50 M 65 50 Q 70 30 75 50" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>
            <h3 className="font-heading text-[19px]">{o.name}</h3>
            <p className="text-[13px] text-text-secondary mt-1">{o.birth} – {o.death}</p>
            <p className="text-[12.5px] italic text-text-secondary mt-1.5">{o.role}</p>
            <p className="text-[12.5px] text-navy mt-2.5">{o.city}</p>
            <p className="text-[12px] text-text-muted">{o.ceremonyDate}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <button className="btn-primary !py-2 !px-3 text-[12px]">Złóż kondolencje</button>
              <button className="btn-secondary !py-2 !px-3 text-[12px]">Udostępnij</button>
            </div>
          </div>
        ))}

        <div className="card p-7 text-center">
          <h3 className="font-heading text-[20px]">Dodaj nekrolog bezpłatnie</h3>
          <p className="text-[13px] text-text-secondary mt-3">
            Opublikuj bezpłatnie podstawowy nekrolog i powiadom rodzinę oraz znajomych.
          </p>
          <button className="btn-primary mt-5">
            Dodaj nekrolog <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[12px] text-text-muted mt-3">Zajmuje mniej niż 5 minut</p>
        </div>

        <div className="card p-7 bg-cream-dark/40">
          <h3 className="font-heading text-[20px]">Pakiet premium 49 zł</h3>
          <ul className="mt-4 space-y-1.5 text-[13.5px] text-text-secondary">
            <li>• Większa widoczność na stronie</li>
            <li>• Transmisja online ceremonii</li>
            <li>• Powiadomienia SMS do rodziny</li>
            <li>• Dłuższy czas publikacji (30 dni)</li>
          </ul>
          <p className="mt-4 text-[13px] font-semibold">Już od 49 zł jednorazowo</p>
          <button className="btn-primary mt-4 w-full">Wybierz Pakiet Premium</button>
        </div>
      </div>
    </div>
  );
}
