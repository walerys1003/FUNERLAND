import type { Metadata } from 'next';
import AssistantPanel from '@/components/ai/assistant-panel';

export const metadata: Metadata = {
  title: 'Asystent AI · Polskie Pogrzeby',
  description:
    'Asystent AI dopasuje 3 sprawdzone firmy pogrzebowe do Państwa potrzeb. Bez presji, bez ukrytych kosztów. Otrzymają Państwo wyjaśnienie, dlaczego polecamy każdą firmę.',
};

export default function AsystentPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-[#0F1B2D] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-[#C9A65F]/20 text-[#C9A65F] text-xs font-medium uppercase tracking-wide mb-3">
            Asystent AI · Bez presji
          </div>
          <h1
            className="text-3xl md:text-4xl font-medium mb-3"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Pomożemy Państwu wybrać godnie
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Odpowiedz na kilka pytań — dopasujemy 3 firmy, w pełni przejrzyste, z opiniami
            i widełkami cenowymi. Bez zapisu, bez telefonów, dopóki sam tego nie zechcesz.
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <AssistantPanel />
      </div>
    </div>
  );
}
