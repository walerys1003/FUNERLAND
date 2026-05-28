import { Phone, NotepadText, Check } from 'lucide-react';

const leads = Array.from({ length: 7 }).map((_, i) => ({
  time: '23 min temu',
  name: 'Pani Kowalska',
  phone: '+48 ••• ••• 234',
  city: 'Warszawa - Mokotów',
  category: 'Pogrzeb tradycyjny',
  preview: 'Mama zmarła wczoraj, szukamy...',
  status: i < 3 ? 'NOWY' : i < 5 ? 'OTWARTY' : i === 5 ? 'WYGRANY' : 'PRZEGRANY',
}));

export default function LeadsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[34px]">Leady</h1>
        <div className="card !p-3 flex items-center gap-3">
          <div className="text-[13px]">
            Twój kredyt: <span className="font-semibold">247 zł</span>
          </div>
          <button className="btn-primary !py-2 !px-4 text-[13px]">Doładuj</button>
        </div>
      </div>

      <div className="mt-7 card p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-[14px]">
            <Tab active>Wszystkie</Tab>
            <Tab>Nowe (3)</Tab>
            <Tab>Otwarte</Tab>
            <Tab>Wygrane</Tab>
            <Tab>Przegrane</Tab>
          </div>
          <input
            className="input w-72"
            placeholder="Szukaj po imieniu lub telefonie"
          />
        </div>

        <table className="mt-5 w-full text-[13.5px]">
          <tbody className="divide-y divide-border-soft">
            {leads.map((l, i) => (
              <tr key={i} className="hover:bg-cream/40">
                <td className="py-3 pr-4 text-text-muted whitespace-nowrap">{l.time}</td>
                <td className="py-3 pr-4 font-medium">{l.name}</td>
                <td className="py-3 pr-3 text-text-secondary">{l.phone}</td>
                <td className="py-3 pr-3">
                  <button className="px-3 py-1.5 rounded-md bg-accent-green text-white text-[12px]">
                    Pokaż numer (15 zł)
                  </button>
                </td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">{l.city}</td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">{l.category}</td>
                <td className="py-3 pr-4 text-text-muted truncate max-w-[150px]">{l.preview}</td>
                <td className="py-3 pr-4">
                  <StatusBadge status={l.status as any} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3 text-text-secondary">
                    <button className="hover:text-navy inline-flex flex-col items-center text-[10px]">
                      <Phone className="w-4 h-4" /> Oznacz jako kontakt
                    </button>
                    <button className="hover:text-navy inline-flex flex-col items-center text-[10px]">
                      <NotepadText className="w-4 h-4" /> Notatka
                    </button>
                    <button className="hover:text-navy inline-flex flex-col items-center text-[10px]">
                      <Check className="w-4 h-4" /> Wygrany
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-md ${
        active ? 'bg-navy text-white' : 'text-text-secondary hover:text-navy'
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: 'NOWY' | 'OTWARTY' | 'WYGRANY' | 'PRZEGRANY' }) {
  const map = {
    NOWY: 'bg-accent-green text-white',
    OTWARTY: 'bg-warning/15 text-warning',
    WYGRANY: 'bg-accent-green-light text-accent-green',
    PRZEGRANY: 'bg-border-soft text-text-muted',
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-md text-[10.5px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}
