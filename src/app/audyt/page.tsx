import type { Metadata } from 'next';
import AuditChecklist from '@/components/audit/checklist';
import { AUDIT_DATA } from '@/lib/audit/data';
import { ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Audyt produkcyjny · Polskie Pogrzeby',
  description:
    'Pełny audyt projektu PolskiePogrzeby.pl — checklista wszystkich elementów koniecznych do uruchomienia na produkcji. Stan: Phase 3, 1000 tasków.',
};

export default function AudytPage() {
  const totalDone = AUDIT_DATA.sections.reduce(
    (a, s) => a + s.items.filter((i) => i.done).length,
    0,
  );
  const totalAll = AUDIT_DATA.sections.reduce((a, s) => a + s.items.length, 0);
  const pct = Math.round((totalDone / totalAll) * 100);

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0F1B2D] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A65F]/20 text-[#C9A65F] text-sm mb-4">
            <ShieldCheck className="h-4 w-4" /> Audyt produkcyjny
          </div>
          <h1
            className="text-4xl md:text-5xl font-medium mb-3"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Co jeszcze trzeba zakodować, żeby ruszyć
          </h1>
          <p className="text-white/80 max-w-3xl mb-6">
            Pełna lista kontrolna podzielona na priorytety P0/P1/P2. Phase 1 + Phase 2 są
            zamknięte — Phase 3 (1000 tasków × 11 agentów) zaczyna teraz.
          </p>

          {/* Progress bar */}
          <div className="bg-white/10 rounded-full h-3 max-w-2xl overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C9A65F] to-[#2E4F3E] h-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#C9A65F]" />
              {totalDone}/{totalAll} ({pct}%) zrobione
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-300" />
              {totalAll - totalDone} do zrobienia
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#C9A65F]" />
              {AUDIT_DATA.sections.length} obszarów
            </span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <AuditChecklist data={AUDIT_DATA} />
      </div>
    </div>
  );
}
