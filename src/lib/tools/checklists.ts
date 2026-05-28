/**
 * Checklists + document generators for funeral organization.
 * Data based on Polish legal/administrative reality 2026.
 */

export type ChecklistItem = {
  id: string;
  title: string;
  description?: string;
  category: 'first-day' | 'paperwork' | 'organization' | 'ceremony' | 'after';
  priority: 'critical' | 'high' | 'normal';
  estimatedTime?: string;
  links?: { label: string; href: string }[];
};

export const FUNERAL_CHECKLIST: ChecklistItem[] = [
  // First day — pierwsze 24h
  {
    id: 'doctor',
    title: 'Wezwij lekarza, który stwierdzi zgon',
    description:
      'Jeśli śmierć nastąpiła w domu — POZ lub karetka (999/112). W szpitalu zajmuje się tym personel.',
    category: 'first-day',
    priority: 'critical',
    estimatedTime: 'natychmiast',
  },
  {
    id: 'karta-zgonu',
    title: 'Odbierz kartę zgonu od lekarza',
    description:
      'Karta zgonu jest niezbędna do dalszych formalności. Wystawia ją lekarz, który stwierdził zgon.',
    category: 'first-day',
    priority: 'critical',
  },
  {
    id: 'zaklad',
    title: 'Skontaktuj się z zakładem pogrzebowym',
    description:
      'Wybierz firmę — możesz porównać oferty na PolskiePogrzeby.pl. Firma odbierze ciało i pomoże w formalnościach.',
    category: 'first-day',
    priority: 'critical',
    estimatedTime: 'tego samego dnia',
    links: [{ label: 'Porównaj zakłady', href: '/firmy' }],
  },
  // Paperwork
  {
    id: 'akt-zgonu',
    title: 'Zarejestruj zgon w USC',
    description:
      'W ciągu 3 dni od zgonu. Wymagane: karta zgonu, dowód osobisty zmarłego, dowód osoby zgłaszającej.',
    category: 'paperwork',
    priority: 'critical',
    estimatedTime: '1–2 godz.',
  },
  {
    id: 'odpisy',
    title: 'Pobierz odpisy aktu zgonu',
    description:
      'Co najmniej 3–5 sztuk. Potrzebne do ZUS, banku, urzędu pracy, notariusza, spadku.',
    category: 'paperwork',
    priority: 'critical',
  },
  {
    id: 'zus',
    title: 'Złóż wniosek o zasiłek pogrzebowy',
    description:
      'ZUS lub KRUS — do 12 miesięcy od dnia śmierci. Kwota: 4 000 zł dla członków rodziny.',
    category: 'paperwork',
    priority: 'high',
    estimatedTime: '~30 min',
    links: [{ label: 'Kalkulator zasiłku', href: '/narzedzia/zasilek-pogrzebowy' }],
  },
  {
    id: 'praca',
    title: 'Powiadom pracodawcę zmarłego',
    description: 'Pracodawca wypłaca odprawę pośmiertną oraz ekwiwalent za niewykorzystany urlop.',
    category: 'paperwork',
    priority: 'normal',
  },
  {
    id: 'bank',
    title: 'Zgłoś zgon w banku zmarłego',
    description:
      'Bank zablokuje rachunki, ale opłaci koszty pogrzebu z konta zmarłego (do wysokości środków).',
    category: 'paperwork',
    priority: 'normal',
  },
  // Organization
  {
    id: 'cmentarz',
    title: 'Wybierz cmentarz i ustal termin',
    description:
      'Cmentarz komunalny lub parafialny. Sprawdź dostępność grobu lub niszy w kolumbarium.',
    category: 'organization',
    priority: 'critical',
  },
  {
    id: 'duchowny',
    title: 'Umów księdza / celebranta',
    description: 'Dla pogrzebu wyznaniowego — kontakt z parafią. Świecki — z firmą pogrzebową.',
    category: 'organization',
    priority: 'high',
  },
  {
    id: 'nekrolog',
    title: 'Opublikuj nekrolog',
    description:
      'Online (bezpłatnie na PolskiePogrzeby.pl) i/lub w prasie lokalnej.',
    category: 'organization',
    priority: 'normal',
    links: [{ label: 'Dodaj nekrolog', href: '/nekrologi/nowy' }],
  },
  {
    id: 'kwiaty',
    title: 'Zamów kwiaty i wieńce',
    description: 'Bezpośrednio u kwiaciarni pogrzebowej lub przez zakład pogrzebowy.',
    category: 'organization',
    priority: 'normal',
    links: [{ label: 'Kwiaciarnie pogrzebowe', href: '/firmy?kategoria=kwiaciarnie-pogrzebowe' }],
  },
  {
    id: 'stypa',
    title: 'Zorganizuj stypę',
    description:
      'Restauracja, lokal parafialny lub catering. Średnio 50–100 zł na osobę.',
    category: 'organization',
    priority: 'normal',
  },
  // Ceremony day
  {
    id: 'mowa',
    title: 'Przygotuj mowę pożegnalną',
    description:
      'Jeśli zdecydujesz się przemówić — możesz skorzystać z naszego generatora mowy.',
    category: 'ceremony',
    priority: 'normal',
    links: [{ label: 'Generator mowy', href: '/narzedzia/mowa-pogrzebowa' }],
  },
  {
    id: 'transport',
    title: 'Organizacja transportu dla rodziny',
    description: 'Wynajem busa lub samochodów. Zakład pogrzebowy może pomóc.',
    category: 'ceremony',
    priority: 'normal',
  },
  // After
  {
    id: 'spadek',
    title: 'Sprawy spadkowe u notariusza',
    description:
      'Akt poświadczenia dziedziczenia lub postępowanie sądowe. W ciągu 6 miesięcy zgłosić w US (SD-Z2).',
    category: 'after',
    priority: 'high',
  },
  {
    id: 'rachunki',
    title: 'Zamknij umowy zmarłego',
    description: 'Telefon, internet, prąd, gaz, ubezpieczenia, abonamenty.',
    category: 'after',
    priority: 'normal',
  },
  {
    id: 'pomnik',
    title: 'Zamów pomnik / nagrobek',
    description: 'Najczęściej 6–12 miesięcy po pogrzebie (musi osiąść ziemia).',
    category: 'after',
    priority: 'normal',
    links: [{ label: 'Kamieniarze', href: '/firmy?kategoria=kamieniarze' }],
  },
];

export const CHECKLIST_CATEGORIES: Record<
  ChecklistItem['category'],
  { label: string; description: string; color: string }
> = {
  'first-day': {
    label: 'Pierwsze 24 godziny',
    description: 'Najpilniejsze działania w dniu zgonu',
    color: 'error',
  },
  paperwork: {
    label: 'Formalności urzędowe',
    description: 'USC, ZUS, akt zgonu, dokumenty',
    color: 'warning',
  },
  organization: {
    label: 'Organizacja pogrzebu',
    description: 'Cmentarz, kwiaty, ceremonia, nekrolog',
    color: 'accent-green',
  },
  ceremony: {
    label: 'Dzień ceremonii',
    description: 'Co warto przygotować na sam pogrzeb',
    color: 'navy',
  },
  after: {
    label: 'Po pogrzebie',
    description: 'Spadek, umowy, pomnik',
    color: 'text-secondary',
  },
};

// --- Document templates ------------------------------------------------------

export type DocTemplate = {
  id: string;
  title: string;
  description: string;
  category: 'zus' | 'praca' | 'usc' | 'bank' | 'spadek';
  fields: { name: string; label: string; placeholder?: string; type?: 'text' | 'date' | 'textarea' }[];
  template: string; // with {{field}} placeholders
};

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: 'wniosek-odprawa',
    title: 'Wniosek o odprawę pośmiertną',
    description: 'Pismo do pracodawcy zmarłego o wypłatę odprawy pośmiertnej.',
    category: 'praca',
    fields: [
      { name: 'miejscowosc', label: 'Miejscowość' },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'imie', label: 'Imię i nazwisko wnioskodawcy' },
      { name: 'adres', label: 'Adres wnioskodawcy', type: 'textarea' },
      { name: 'pesel', label: 'PESEL wnioskodawcy' },
      { name: 'pracodawca', label: 'Nazwa i adres pracodawcy', type: 'textarea' },
      { name: 'zmarly', label: 'Imię i nazwisko zmarłego pracownika' },
      { name: 'dataZgonu', label: 'Data zgonu', type: 'date' },
      { name: 'pokrewienstwo', label: 'Pokrewieństwo (np. małżonka, syn)' },
    ],
    template: `{{miejscowosc}}, {{data}}

{{imie}}
{{adres}}
PESEL: {{pesel}}

                                                                {{pracodawca}}

                          WNIOSEK O WYPŁATĘ ODPRAWY POŚMIERTNEJ

Działając na podstawie art. 93 Kodeksu pracy, jako {{pokrewienstwo}} zmarłego pracownika
{{zmarly}}, który zmarł w dniu {{dataZgonu}}, wnoszę o wypłatę odprawy pośmiertnej
oraz ekwiwalentu pieniężnego za niewykorzystany urlop wypoczynkowy.

Do wniosku załączam:
1. Skrócony odpis aktu zgonu zmarłego pracownika.
2. Dokumenty potwierdzające pokrewieństwo.
3. Dane do przelewu (rachunek bankowy).

Z poważaniem,

........................................
{{imie}}
`,
  },
  {
    id: 'wniosek-zus',
    title: 'Wniosek o zasiłek pogrzebowy (Z-12)',
    description: 'Informacyjna wersja wniosku do ZUS — oryginał formularza pobierz w ZUS.',
    category: 'zus',
    fields: [
      { name: 'miejscowosc', label: 'Miejscowość' },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'imie', label: 'Imię i nazwisko wnioskodawcy' },
      { name: 'pesel', label: 'PESEL wnioskodawcy' },
      { name: 'adres', label: 'Adres', type: 'textarea' },
      { name: 'zmarly', label: 'Imię i nazwisko zmarłego' },
      { name: 'peselZmarlego', label: 'PESEL zmarłego' },
      { name: 'dataZgonu', label: 'Data zgonu', type: 'date' },
      { name: 'pokrewienstwo', label: 'Pokrewieństwo' },
      { name: 'kwota', label: 'Suma poniesionych kosztów (zł)' },
    ],
    template: `{{miejscowosc}}, {{data}}

WNIOSEK O WYPŁATĘ ZASIŁKU POGRZEBOWEGO (Z-12)
— informacyjna treść uzupełniająca oryginał formularza ZUS Z-12 —

Wnioskodawca:
  {{imie}}
  PESEL: {{pesel}}
  Adres: {{adres}}

Dane zmarłego:
  {{zmarly}}
  PESEL: {{peselZmarlego}}
  Data zgonu: {{dataZgonu}}
  Pokrewieństwo: {{pokrewienstwo}}

Wnoszę o wypłatę zasiłku pogrzebowego w związku ze śmiercią ww. osoby
oraz pokrytymi przeze mnie kosztami pogrzebu w łącznej wysokości
{{kwota}} zł.

Załączniki:
  1. Skrócony odpis aktu zgonu.
  2. Oryginały faktur dokumentujących koszty pogrzebu.
  3. Dokumenty potwierdzające pokrewieństwo (akt urodzenia/małżeństwa).
  4. Zaświadczenie płatnika składek lub legitymacja emeryta/rencisty.

........................................
{{imie}}
`,
  },
  {
    id: 'oswiadczenie-spadek',
    title: 'Oświadczenie o przyjęciu spadku',
    description: 'Wzór oświadczenia składanego u notariusza lub w sądzie.',
    category: 'spadek',
    fields: [
      { name: 'miejscowosc', label: 'Miejscowość' },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'imie', label: 'Imię i nazwisko spadkobiercy' },
      { name: 'pesel', label: 'PESEL spadkobiercy' },
      { name: 'spadkodawca', label: 'Imię i nazwisko spadkodawcy' },
      { name: 'dataZgonu', label: 'Data zgonu spadkodawcy', type: 'date' },
      { name: 'pokrewienstwo', label: 'Pokrewieństwo' },
      { name: 'sposob', label: 'Sposób przyjęcia (wprost / z dobrodziejstwem inwentarza)' },
    ],
    template: `{{miejscowosc}}, {{data}}

OŚWIADCZENIE O PRZYJĘCIU SPADKU

Ja, niżej podpisany/a {{imie}}, PESEL {{pesel}}, jako {{pokrewienstwo}} zmarłego
{{spadkodawca}} (zm. {{dataZgonu}}), działając na podstawie art. 1012 i nast.
Kodeksu cywilnego, oświadczam, że przyjmuję spadek po {{spadkodawca}}
{{sposob}}.

........................................
{{imie}}
`,
  },
];

export function fillTemplate(tmpl: string, values: Record<string, string>): string {
  return tmpl.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `[${key}]`);
}

// --- Generator mowy pogrzebowej --------------------------------------------

export type SpeechInput = {
  personName: string;
  relation: string; // np. "ojciec", "babcia"
  age?: number;
  traits: string; // cechy charakteru, kilka słów
  memory?: string; // jedno wspomnienie
  passion?: string; // pasja / praca
  tone: 'religijny' | 'swiecki' | 'osobisty';
  authorName: string;
};

export function generateSpeech(input: SpeechInput): string {
  const opening =
    input.tone === 'religijny'
      ? 'Drodzy Zebrani, gromadzimy się dziś w bólu, ale i w nadziei wiary.'
      : input.tone === 'swiecki'
      ? 'Drodzy Zebrani, gromadzimy się dziś, by wspólnie pożegnać kogoś, kto był dla nas ważny.'
      : 'Drogie osoby, które przyszły dziś tutaj — dziękuję, że jesteście.';

  const intro = `Dziś żegnamy ${input.personName}${
    input.age ? `, który/a żył(a) wśród nas ${input.age} lat` : ''
  } — mojego/ą ${input.relation}.`;

  const traits = input.traits
    ? `Pamiętamy ${input.personName.split(' ')[0]} jako osobę ${input.traits}. To właśnie te cechy budowały to, kim był(a) dla każdego z nas.`
    : '';

  const passion = input.passion
    ? `Pasją ${input.personName.split(' ')[0]} było ${input.passion}. Wkładał(a) w to całą siebie/siebie samego i to było widać.`
    : '';

  const memory = input.memory
    ? `Wspomnienie, które chcę dziś przywołać: ${input.memory} Pozostanie ze mną na zawsze.`
    : '';

  const closing =
    input.tone === 'religijny'
      ? `Wierzymy, że ${input.personName.split(' ')[0]} znajduje teraz pokój w Bożej obecności.\nNiech odpoczywa w pokoju wiecznym.`
      : input.tone === 'swiecki'
      ? `Dziękujemy, ${input.personName.split(' ')[0]}, za wszystko. Będziesz żyć w nas — w naszych wspomnieniach, gestach i wartościach, które od Ciebie otrzymaliśmy.`
      : `${input.personName.split(' ')[0]}, dziękuję. Po prostu — dziękuję.`;

  return [
    opening,
    '',
    intro,
    '',
    traits,
    passion,
    memory,
    '',
    closing,
    '',
    `— ${input.authorName}`,
  ]
    .filter((line) => line !== '' || true) // keep blanks for structure
    .join('\n');
}
