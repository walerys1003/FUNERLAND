/**
 * Programmatic content engine for /narzedzia/[tool]/[city] pages.
 *
 * Generates SEO-rich, unique-feeling content per tool×city combination
 * by composing modular fragments. Total surface: 7 tools × 7 cities = 49 routes.
 *
 * IMPORTANT: every fragment must reference the city by name to avoid
 * "thin content" penalties — never reuse identical paragraphs across cities.
 */

import { calcZasilek, calcFuneralCost, fmtPLN } from '@/lib/tools/calculators';

// ──────────────────────────────────────────────────────────────────────────
// CITY METADATA — anchors all per-city content
// ──────────────────────────────────────────────────────────────────────────
export type CityMeta = {
  slug: string;
  name: string;
  /** Polish locative case (in NAME) — used in copy "w Warszawie" */
  locative: string;
  /** Adjective form used in headers ("warszawski", "krakowski") */
  adjective: string;
  voivodeship: string;
  /** Approx. cost multiplier vs national average (matches calculators.ts CITY_MULT) */
  costMultiplier: number;
  /** Approximate companies on the platform */
  companiesCount: number;
  /** Notable cemeteries (3–5) — used in trust copy */
  cemeteries: string[];
  /** Population, used in itemList descriptions */
  population: number;
  /** Average response time hint (in hours) */
  responseHours: number;
};

export const CITY_META: CityMeta[] = [
  {
    slug: 'warszawa',
    name: 'Warszawa',
    locative: 'Warszawie',
    adjective: 'warszawski',
    voivodeship: 'mazowieckie',
    costMultiplier: 1.25,
    companiesCount: 247,
    cemeteries: ['Cmentarz Powązkowski', 'Cmentarz Bródnowski', 'Cmentarz Północny', 'Cmentarz Wojskowy na Powązkach'],
    population: 1_860_000,
    responseHours: 2,
  },
  {
    slug: 'krakow',
    name: 'Kraków',
    locative: 'Krakowie',
    adjective: 'krakowski',
    voivodeship: 'małopolskie',
    costMultiplier: 1.15,
    companiesCount: 156,
    cemeteries: ['Cmentarz Rakowicki', 'Cmentarz Salwatorski', 'Cmentarz Batowicki', 'Cmentarz Podgórski'],
    population: 803_000,
    responseHours: 3,
  },
  {
    slug: 'wroclaw',
    name: 'Wrocław',
    locative: 'Wrocławiu',
    adjective: 'wrocławski',
    voivodeship: 'dolnośląskie',
    costMultiplier: 1.1,
    companiesCount: 134,
    cemeteries: ['Cmentarz Osobowicki', 'Cmentarz Grabiszyński', 'Cmentarz Św. Wawrzyńca', 'Cmentarz Pawłowicki'],
    population: 674_000,
    responseHours: 3,
  },
  {
    slug: 'lodz',
    name: 'Łódź',
    locative: 'Łodzi',
    adjective: 'łódzki',
    voivodeship: 'łódzkie',
    costMultiplier: 1.0,
    companiesCount: 98,
    cemeteries: ['Cmentarz Stary przy ul. Ogrodowej', 'Cmentarz na Dołach', 'Cmentarz Zarzew', 'Cmentarz Szczeciński'],
    population: 670_000,
    responseHours: 4,
  },
  {
    slug: 'lublin',
    name: 'Lublin',
    locative: 'Lublinie',
    adjective: 'lubelski',
    voivodeship: 'lubelskie',
    costMultiplier: 0.95,
    companiesCount: 72,
    cemeteries: ['Cmentarz przy ul. Lipowej', 'Cmentarz na Majdanku', 'Cmentarz Unicki przy ul. Lipowej'],
    population: 339_000,
    responseHours: 4,
  },
  {
    slug: 'poznan',
    name: 'Poznań',
    locative: 'Poznaniu',
    adjective: 'poznański',
    voivodeship: 'wielkopolskie',
    costMultiplier: 1.05,
    companiesCount: 89,
    cemeteries: ['Cmentarz Junikowo', 'Cmentarz Górczyński', 'Cmentarz Miłostowo', 'Cmentarz Św. Wojciecha'],
    population: 530_000,
    responseHours: 3,
  },
  {
    slug: 'gdansk',
    name: 'Gdańsk',
    locative: 'Gdańsku',
    adjective: 'gdański',
    voivodeship: 'pomorskie',
    costMultiplier: 1.1,
    companiesCount: 51,
    cemeteries: ['Cmentarz Łostowicki', 'Cmentarz Srebrzysko', 'Cmentarz Centralny', 'Cmentarz Garnizonowy'],
    population: 471_000,
    responseHours: 3,
  },
];

export function getCityMeta(slug: string): CityMeta | null {
  return CITY_META.find((c) => c.slug === slug) || null;
}

export const CITY_SLUGS = CITY_META.map((c) => c.slug);

// ──────────────────────────────────────────────────────────────────────────
// TOOL METADATA — config per tool
// ──────────────────────────────────────────────────────────────────────────
export type ToolKey =
  | 'koszt-pogrzebu'
  | 'zasilek-pogrzebowy'
  | 'kredyt-pogrzebowy'
  | 'porownaj-oferty'
  | 'checklista'
  | 'dokumenty'
  | 'mowa-pogrzebowa';

export type ToolMeta = {
  slug: ToolKey;
  /** Human-friendly tool name (nominative) */
  name: string;
  /** Genitive case used in headlines: "koszt pogrzebu w …" */
  headline: string;
  /** Short tagline */
  tagline: string;
  /** Application category for SoftwareApplication schema */
  category: string;
  /** Localized H1 template: `${tool} ${locative}` */
  h1: (loc: string) => string;
  /** Description for metadata */
  desc: (city: CityMeta) => string;
};

export const TOOL_META: Record<ToolKey, ToolMeta> = {
  'koszt-pogrzebu': {
    slug: 'koszt-pogrzebu',
    name: 'Kalkulator kosztu pogrzebu',
    headline: 'Koszt pogrzebu',
    tagline: 'Sprawdź realny koszt pogrzebu w Twoim mieście',
    category: 'FinanceApplication',
    h1: (loc) => `Koszt pogrzebu w ${loc} — kalkulator 2026`,
    desc: (c) =>
      `Sprawdź ile kosztuje pogrzeb w ${c.locative} w 2026. Pełne rozbicie: kremacja vs tradycyjny, opłaty cmentarne, ZUS. ${c.companiesCount} zweryfikowanych firm.`,
  },
  'zasilek-pogrzebowy': {
    slug: 'zasilek-pogrzebowy',
    name: 'Zasiłek pogrzebowy ZUS',
    headline: 'Zasiłek pogrzebowy ZUS',
    tagline: '4 000 zł z ZUS — sprawdź, czy Ci przysługuje',
    category: 'FinanceApplication',
    h1: (loc) => `Zasiłek pogrzebowy ZUS w ${loc}`,
    desc: (c) =>
      `Zasiłek pogrzebowy ZUS (4 000 zł) w ${c.locative}: gdzie złożyć wniosek, jakie dokumenty, terminy. Aktualne procedury 2026.`,
  },
  'kredyt-pogrzebowy': {
    slug: 'kredyt-pogrzebowy',
    name: 'Kredyt na pogrzeb',
    headline: 'Kredyt pogrzebowy',
    tagline: 'Oblicz miesięczną ratę kredytu na pogrzeb',
    category: 'FinanceApplication',
    h1: (loc) => `Kredyt pogrzebowy w ${loc} — kalkulator rat`,
    desc: (c) =>
      `Kalkulator kredytu pogrzebowego dla mieszkańców ${c.locative}. Oblicz miesięczną ratę, RRSO, banki finansujące koszty pogrzebu w 2026.`,
  },
  'porownaj-oferty': {
    slug: 'porownaj-oferty',
    name: 'Porównywarka ofert pogrzebowych',
    headline: 'Porównaj oferty',
    tagline: 'Wybierz najlepszą firmę pogrzebową w mieście',
    category: 'BusinessApplication',
    h1: (loc) => `Porównanie ofert zakładów pogrzebowych w ${loc}`,
    desc: (c) =>
      `Porównaj 2–3 oferty zakładów pogrzebowych w ${c.locative} — automatyczny ranking jakości i ceny. ${c.companiesCount} zweryfikowanych firm.`,
  },
  checklista: {
    slug: 'checklista',
    name: 'Checklista pogrzebowa',
    headline: 'Checklista pogrzebowa',
    tagline: 'Krok po kroku co robić po śmierci bliskiego',
    category: 'UtilityApplication',
    h1: (loc) => `Checklista pogrzebowa w ${loc} — krok po kroku`,
    desc: (c) =>
      `Checklista organizacji pogrzebu w ${c.locative}: pierwsze 24h, urząd, ZUS, ceremonia. Lokalne USC, cmentarze, terminy.`,
  },
  dokumenty: {
    slug: 'dokumenty',
    name: 'Generator dokumentów pogrzebowych',
    headline: 'Dokumenty pogrzebowe',
    tagline: 'Gotowe wzory: ZUS, odprawa, spadek',
    category: 'UtilityApplication',
    h1: (loc) => `Dokumenty pogrzebowe w ${loc} — wzory i wnioski`,
    desc: (c) =>
      `Wzory wniosków pogrzebowych dla ${c.locative}: ZUS Z-12, odprawa pośmiertna, oświadczenie spadkowe. Wypełnij online.`,
  },
  'mowa-pogrzebowa': {
    slug: 'mowa-pogrzebowa',
    name: 'Generator mowy pogrzebowej',
    headline: 'Mowa pogrzebowa',
    tagline: 'Szablony pożegnań — religijne, świeckie, osobiste',
    category: 'UtilityApplication',
    h1: (loc) => `Mowa pogrzebowa w ${loc} — wzory i szablony`,
    desc: (c) =>
      `Wzory mów pogrzebowych dostosowanych do ceremonii w ${c.locative}. Religijne, świeckie i osobiste — gotowe do edycji.`,
  },
};

export const TOOL_SLUGS = Object.keys(TOOL_META) as ToolKey[];

// ──────────────────────────────────────────────────────────────────────────
// CONTENT FRAGMENTS — assembled into unique copy per (tool, city)
// ──────────────────────────────────────────────────────────────────────────

export type ContentBlock = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

/** Estimated funeral cost line for a city, using calculator engine. */
export function estimatedCostForCity(c: CityMeta): {
  traditional: number;
  cremation: number;
  netAfterZus: number;
} {
  const trad = calcFuneralCost({
    city: c.slug,
    type: 'tradycyjny',
    coffin: 'standard',
    flowers: true,
    transport: true,
    stipa: true,
    ceremony: true,
    cemetery: true,
  });
  const crem = calcFuneralCost({
    city: c.slug,
    type: 'kremacja',
    coffin: 'standard',
    flowers: true,
    transport: true,
    stipa: true,
    ceremony: true,
    cemetery: true,
  });
  return {
    traditional: Math.round(trad.total / 100) * 100,
    cremation: Math.round(crem.total / 100) * 100,
    netAfterZus: Math.round(trad.outOfPocket / 100) * 100,
  };
}

// ── Per-tool content builders ──────────────────────────────────────────────

export function buildKosztPogrzebuContent(c: CityMeta): ContentBlock[] {
  const est = estimatedCostForCity(c);
  const mult = c.costMultiplier;
  const multPct = Math.round((mult - 1) * 100);
  const multLabel =
    multPct > 5
      ? `o ok. ${multPct}% wyższe od średniej krajowej`
      : multPct < -5
        ? `o ok. ${Math.abs(multPct)}% niższe od średniej krajowej`
        : 'zbliżone do średniej krajowej';

  return [
    {
      heading: `Ile kosztuje pogrzeb w ${c.locative} w 2026?`,
      paragraphs: [
        `Średni koszt pogrzebu w ${c.locative} mieści się obecnie w przedziale ${fmtPLN(est.cremation)}–${fmtPLN(est.traditional)}, w zależności od formy ceremonii i wybranego standardu usług. Ceny w ${c.locative} są ${multLabel}, co wynika z miejskich opłat cmentarnych, dostępności usługodawców i kosztów pracy.`,
        `Po odliczeniu zasiłku pogrzebowego z ZUS (4 000 zł) realny koszt obciążający rodzinę spada do ok. ${fmtPLN(est.netAfterZus)} dla pochówku tradycyjnego — to kwota, która powinna stanowić punkt odniesienia przy negocjacjach z zakładem pogrzebowym.`,
      ],
      list: [
        `Pochówek tradycyjny: ${fmtPLN(est.traditional)} (przeciętna ceremonia)`,
        `Kremacja: ${fmtPLN(est.cremation)} (oszczędność ${fmtPLN(est.traditional - est.cremation)} vs tradycyjny)`,
        `Zasiłek ZUS do odliczenia: 4 000 zł`,
        `Realny koszt netto: od ${fmtPLN(est.netAfterZus)}`,
      ],
    },
    {
      heading: `Co wpływa na koszt pogrzebu w ${c.locative}?`,
      paragraphs: [
        `Kluczowe pozycje budżetowe to: trumna lub urna (1 200–6 000 zł), opłaty cmentarne (różnią się znacząco pomiędzy cmentarzami w ${c.locative}), usługa pogrzebowa firmy, transport, oprawa kwiatowa, muzyka oraz stypa.`,
        `W ${c.locative} największe cmentarze (${c.cemeteries.slice(0, 2).join(' i ')}) mają zazwyczaj wyższe opłaty za miejsce, ale lepszą dostępność komunikacyjną — warto uwzględnić ten aspekt przy wyborze.`,
      ],
    },
    {
      heading: 'Co można zoptymalizować bez utraty godności?',
      paragraphs: [
        `Trzy najczęstsze obszary oszczędności bez kompromisu na jakości: (1) wybór trumny w standardzie zamiast premium (różnica 1 500–3 000 zł), (2) skromna oprawa kwiatowa zamiast bogatych wieńców, (3) stypa w domowym kręgu zamiast zewnętrznego cateringu.`,
        `Z drugiej strony — nie warto oszczędzać na transporcie ani na samym zakładzie. ${c.companiesCount} firm działa na terenie ${c.locative}; po wprowadzeniu danych do kalkulatora powyżej zobaczysz szacunek dopasowany do Twoich wyborów.`,
      ],
    },
  ];
}

export function buildZasilekContent(c: CityMeta): ContentBlock[] {
  return [
    {
      heading: `Zasiłek pogrzebowy ZUS w ${c.locative} — gdzie i jak złożyć wniosek`,
      paragraphs: [
        `Zasiłek pogrzebowy w 2026 roku wynosi 4 000 zł i jest to kwota ryczałtowa niezależna od miasta. Mieszkańcy ${c.locative} składają wniosek w lokalnym oddziale ZUS (województwo ${c.voivodeship}) lub elektronicznie przez PUE ZUS — to drugie rozwiązanie jest najszybsze.`,
        `Wniosek ZUS Z-12 może złożyć członek rodziny zmarłego lub zakład pogrzebowy działający w jej imieniu. Większość zakładów w ${c.locative} oferuje tę usługę bezpłatnie w ramach pakietu pogrzebowego — wówczas zasiłek trafia bezpośrednio na konto firmy, a rodzina nie wykłada pieniędzy z góry.`,
      ],
      list: [
        'Skrócony odpis aktu zgonu (USC) — oryginał',
        'Wniosek ZUS Z-12 (dostępny w naszym generatorze dokumentów)',
        'Oryginały rachunków/faktur potwierdzających koszty',
        'Dokument tożsamości wnioskodawcy',
        'Dokument potwierdzający pokrewieństwo (np. odpis aktu małżeństwa)',
      ],
    },
    {
      heading: `Terminy i czas wypłaty w ${c.locative}`,
      paragraphs: [
        `ZUS ma ustawowo 30 dni na rozpatrzenie wniosku, ale w praktyce ${c.adjective} oddział wypłaca zasiłek w ciągu 7–14 dni roboczych od kompletnego złożenia dokumentów — pod warunkiem, że wszystkie rachunki są imienne i opiewają na osobę składającą wniosek.`,
        `Najszybciej i najmniej stresująco — pozwól, by formalności załatwił zakład pogrzebowy. Lista zweryfikowanych firm w ${c.locative} dostępna jest w naszej porównywarce. Czas reakcji na zapytanie: zwykle ${c.responseHours} godziny w godzinach roboczych.`,
      ],
    },
  ];
}

export function buildKredytContent(c: CityMeta): ContentBlock[] {
  const est = estimatedCostForCity(c);
  return [
    {
      heading: `Finansowanie pogrzebu w ${c.locative} — opcje 2026`,
      paragraphs: [
        `Realny koszt netto pogrzebu w ${c.locative} (po odliczeniu zasiłku ZUS 4 000 zł) to obecnie ok. ${fmtPLN(est.netAfterZus)}. Dla wielu rodzin oznacza to konieczność rozłożenia płatności w czasie.`,
        `Trzy główne opcje finansowania dostępne mieszkańcom ${c.locative}: (1) pożyczka gotówkowa w banku (RRSO 9–15%), (2) zaliczka od zakładu pogrzebowego rozliczana z zasiłku ZUS (najczęściej bez odsetek), (3) rata 0% w wybranych zakładach współpracujących z firmami pożyczkowymi.`,
      ],
      list: [
        'Pożyczka gotówkowa — szybka, ale z odsetkami',
        'Zaliczka od zakładu — najtańsza, bezpośrednio z zasiłku ZUS',
        'Rata 0% — wybrane zakłady w ${c.name}',
        'Wypłata pieniędzy z konta zmarłego — wymaga aktu poświadczenia dziedziczenia',
      ],
    },
    {
      heading: 'Jak korzystać z kalkulatora rat?',
      paragraphs: [
        `Wprowadź docelową kwotę finansowania (sugerowany punkt startu dla ${c.locative}: ${fmtPLN(est.netAfterZus)}), wybierz okres spłaty i oprocentowanie. Kalkulator pokaże ratę miesięczną oraz całkowity koszt kredytu — sprawdź czy mieści się w domowym budżecie.`,
        `W ${c.locative} typowy okres spłaty wynosi 12–24 miesięcy — dłuższe okresy znacząco zwiększają całkowity koszt, krótsze obciążają miesięczny budżet.`,
      ],
    },
  ];
}

export function buildPorownajContent(c: CityMeta): ContentBlock[] {
  return [
    {
      heading: `Jak wybrać zakład pogrzebowy w ${c.locative}?`,
      paragraphs: [
        `Na terenie ${c.locative} działa ok. ${c.companiesCount} zakładów pogrzebowych — od dużych sieci po lokalne, rodzinne firmy. Wybór ma kluczowe znaczenie nie tylko dla kosztu, ale przede wszystkim dla godności ceremonii i komfortu rodziny w trudnym czasie.`,
        `Nasza porównywarka stosuje algorytm 40% cena + 40% jakość (opinie + weryfikacja) + 20% szybkość reakcji. Średni czas odpowiedzi zakładów ${c.adjective}ch wynosi ${c.responseHours}h — to ważny parametr, gdy formalności trzeba załatwić w 24–48h.`,
      ],
    },
    {
      heading: `Lokalne cmentarze i ich specyfika`,
      paragraphs: [
        `Najważniejsze cmentarze w ${c.locative}, na których realizowane są pochówki:`,
      ],
      list: c.cemeteries.map((cm) => `${cm} — sprawdź dostępność miejsca przed wizytą w zakładzie`),
    },
    {
      heading: 'Czerwone flagi — czego unikać',
      paragraphs: [
        `Trzy sygnały, że warto poszukać innej firmy: (1) nacisk na natychmiastową decyzję bez pisemnej wyceny, (2) brak transparentnej listy kosztów składowych, (3) odmowa pomocy w wypełnieniu wniosku do ZUS. Każdy z tych elementów obniża ocenę w naszym rankingu.`,
        `Zweryfikowane zakłady na platformie ${c.locative} przeszły kontrolę dokumentów i opinii — odznaka "Zweryfikowany Partner" oznacza spełnienie wszystkich powyższych kryteriów.`,
      ],
    },
  ];
}

export function buildChecklistContent(c: CityMeta): ContentBlock[] {
  return [
    {
      heading: `Pierwsze 24 godziny w ${c.locative}`,
      paragraphs: [
        `Procedura w ${c.locative} jest jednolita w skali kraju, ale lokalne USC i szpitale mają swoje rytmy pracy. W tym mieście pełna procedura "od zgonu do pochówku" zajmuje przeciętnie 3–5 dni — wymaga to skoordynowanego działania.`,
      ],
      list: [
        'Stwierdzenie zgonu przez lekarza i wystawienie karty zgonu',
        'Telefon do zakładu pogrzebowego (transport ciała)',
        'Kontakt z najbliższą rodziną',
        'Zabezpieczenie dokumentów zmarłego (dowód, PESEL)',
        'Decyzja o formie pochówku (tradycyjny / kremacja)',
      ],
    },
    {
      heading: `Formalności urzędowe w ${c.locative}`,
      paragraphs: [
        `USC właściwy ze względu na miejsce zgonu wystawia akt zgonu — w ${c.locative} pierwszy odpis jest bezpłatny, kolejne kosztują 22 zł. Akt zgonu jest niezbędny do wszystkich dalszych formalności: ZUS, banki, dziedziczenie.`,
        `Wniosek o zasiłek pogrzebowy ZUS (4 000 zł) złóż w ${c.adjective}m oddziale lub elektronicznie. Większość zakładów w ${c.locative} odbiera to zadanie z barków rodziny.`,
      ],
    },
    {
      heading: `Po pogrzebie — sprawy spadkowe w ${c.locative}`,
      paragraphs: [
        `Po pogrzebie rodzina ma 6 miesięcy na złożenie oświadczenia spadkowego (przyjęcie / odrzucenie). W ${c.locative} dostępne są dwie ścieżki: notariusz (akt poświadczenia dziedziczenia, szybkie) lub sąd rejonowy (postanowienie o stwierdzeniu nabycia spadku, dłuższe ale tańsze).`,
        `Pamiętaj o zamknięciu rachunków bankowych, ZUS, ubezpieczeń, abonamentów — pełną listę znajdziesz w naszej rozszerzonej checkliście powyżej.`,
      ],
    },
  ];
}

export function buildDokumentyContent(c: CityMeta): ContentBlock[] {
  return [
    {
      heading: `Najważniejsze dokumenty pogrzebowe w ${c.locative}`,
      paragraphs: [
        `Niezależnie od miasta, polskie prawo wymaga tych samych dokumentów — ale lokalne USC i oddziały ZUS w ${c.locative} mogą mieć drobne preferencje formalne (np. preferowany format daty, sposób kompletowania załączników).`,
      ],
      list: [
        'ZUS Z-12 — wniosek o zasiłek pogrzebowy (4 000 zł)',
        'Wniosek o odprawę pośmiertną — do pracodawcy zmarłego',
        'Oświadczenie spadkowe — do notariusza lub sądu',
        'Wniosek o akt zgonu — do USC',
      ],
    },
    {
      heading: `Gdzie złożyć dokumenty w ${c.locative}?`,
      paragraphs: [
        `USC w ${c.locative} przyjmuje wnioski osobiście i przez ePUAP. ZUS — osobiście w ${c.adjective}m oddziale lub przez Platformę Usług Elektronicznych (PUE ZUS). Notariusze działają na umówione wizyty.`,
        `Korzystając z naszego generatora powyżej otrzymasz gotowy dokument w formacie tekstowym — do uzupełnienia, wydruku lub przesłania elektronicznego.`,
      ],
    },
  ];
}

export function buildMowaContent(c: CityMeta): ContentBlock[] {
  return [
    {
      heading: `Mowa pogrzebowa w ${c.locative} — co warto wiedzieć`,
      paragraphs: [
        `Ceremonie pogrzebowe w ${c.locative} odbywają się zarówno w formie religijnej (katolickiej dominującej), jak i świeckiej. Cmentarze takie jak ${c.cemeteries[0]} obsługują obie formy — wybór należy do rodziny.`,
        `Mowa pogrzebowa — religijna czy świecka — powinna trwać 3–5 minut. To krótko, ale wystarczająco, by godnie pożegnać bliską osobę. Generator powyżej pomoże stworzyć szkielet wystąpienia w wybranym tonie.`,
      ],
    },
    {
      heading: 'Trzy najczęstsze pułapki',
      paragraphs: [
        `(1) Zbyt długa mowa — uwaga słuchaczy maleje po 5 minutach. (2) Skupienie się na sobie — mowa to pożegnanie zmarłego, nie autobiografia mówcy. (3) Niewczesny humor — anegdota tak, ale dobrana z wyczuciem.`,
        `Po napisaniu — przeczytaj na głos kilkukrotnie. Idealnie z osobą zaufaną, która oceni rytm i emocje. Miej kopię papierową na ceremonii — emocje potrafią zatrzeć pamięć.`,
      ],
    },
  ];
}

/** Master dispatcher — returns content blocks for a (tool, city). */
export function buildLocalContent(tool: ToolKey, c: CityMeta): ContentBlock[] {
  switch (tool) {
    case 'koszt-pogrzebu':
      return buildKosztPogrzebuContent(c);
    case 'zasilek-pogrzebowy':
      return buildZasilekContent(c);
    case 'kredyt-pogrzebowy':
      return buildKredytContent(c);
    case 'porownaj-oferty':
      return buildPorownajContent(c);
    case 'checklista':
      return buildChecklistContent(c);
    case 'dokumenty':
      return buildDokumentyContent(c);
    case 'mowa-pogrzebowa':
      return buildMowaContent(c);
  }
}

/** Build the canonical URL for tool/city. */
export function localToolPath(tool: ToolKey, citySlug: string) {
  return `/narzedzia/${tool}/${citySlug}`;
}
