import type { Metadata } from 'next';
import ObituaryForm from '@/components/obituaries/form';

export const metadata: Metadata = {
  title: 'Dodaj nekrolog · Polskie Pogrzeby',
  description:
    'Opublikuj nekrolog bezpłatnie lub w pakiecie premium z transmisją online i powiadomieniami SMS.',
};

export default function NewObituaryPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-[#0F1B2D] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-3xl md:text-4xl font-medium mb-3"
            style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}
          >
            Dodaj nekrolog
          </h1>
          <p className="text-white/80">
            Pożegnaj bliską osobę w godny sposób. Publikacja jest bezpłatna. Pakiet premium
            (49 zł) dodaje transmisję online ceremonii oraz powiadomienia SMS dla rodziny.
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ObituaryForm />
      </div>
    </div>
  );
}
