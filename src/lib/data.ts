// Mock data for the Polskie Pogrzeby marketplace

export type Company = {
  slug: string;
  name: string;
  city: string;
  citySlug: string;
  district: string;
  address: string;
  phone: string;
  phone24h: boolean;
  rating: number;
  reviewsCount: number;
  verifiedYear: number;
  yearsActive: number;
  description: string;
  image: string;
  bannerImage: string;
  services: { name: string; from: number; description?: string }[];
  features: string[];
  category: 'pogrzeby' | 'kremacja' | 'kwiaciarnie' | 'kamieniarze' | 'transport';
  isVerified: boolean;
  plan: 'free' | 'standard' | 'pro' | 'premium';
};

export const cities = [
  { slug: 'warszawa', name: 'Warszawa', voivodeship: 'mazowieckie', companies: 247 },
  { slug: 'krakow', name: 'Kraków', voivodeship: 'małopolskie', companies: 156 },
  { slug: 'wroclaw', name: 'Wrocław', voivodeship: 'dolnośląskie', companies: 134 },
  { slug: 'lodz', name: 'Łódź', voivodeship: 'łódzkie', companies: 98 },
  { slug: 'lublin', name: 'Lublin', voivodeship: 'lubelskie', companies: 72 },
  { slug: 'poznan', name: 'Poznań', voivodeship: 'wielkopolskie', companies: 89 },
  { slug: 'gdansk', name: 'Gdańsk', voivodeship: 'pomorskie', companies: 51 },
];

export const categories = [
  { slug: 'zaklady-pogrzebowe', name: 'Zakłady pogrzebowe', icon: 'building', priceFrom: 3800 },
  { slug: 'kremacja', name: 'Kremacja', icon: 'flame', priceFrom: 800 },
  { slug: 'kwiaciarnie-pogrzebowe', name: 'Kwiaciarnie pogrzebowe', icon: 'flower', priceFrom: 150 },
  { slug: 'kamieniarze', name: 'Kamieniarze', icon: 'square', priceFrom: 2500 },
  { slug: 'transport-zwlok', name: 'Transport zwłok', icon: 'truck', priceFrom: 500 },
  { slug: 'transmisje-online', name: 'Transmisje online', icon: 'video', priceFrom: 400 },
  { slug: 'mistrzowie-ceremonii', name: 'Mistrzowie ceremonii', icon: 'mic', priceFrom: 700 },
  { slug: 'nekrologi', name: 'Nekrologi', icon: 'newspaper', priceFrom: 0 },
];

export const companies: Company[] = [
  {
    slug: 'zaklad-pogrzebowy-kalla',
    name: 'Zakład Pogrzebowy Kalla',
    city: 'Warszawa',
    citySlug: 'warszawa',
    district: 'Mokotów',
    address: 'ul. Puławska 123, Warszawa',
    phone: '+48 22 123 45 67',
    phone24h: true,
    rating: 4.8,
    reviewsCount: 147,
    verifiedYear: 2026,
    yearsActive: 34,
    description: 'Działamy od 1992 roku. Specjalizujemy się w organizacji ceremonii pogrzebowych — od pogrzebów tradycyjnych po kremacje. Nasi doświadczeni pracownicy zapewniają godne pożegnanie z pełną dyskrecją i empatią.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80&auto=format',
    bannerImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=80&auto=format',
    services: [
      { name: 'Pogrzeb tradycyjny', from: 4200, description: 'Trumna dębowa lub sosnowa, obsługa ceremonii, przygotowanie ciała, komplet dokumentów' },
      { name: 'Kremacja', from: 3800, description: 'Urna standardowa, kremacja, przygotowanie ciała, formalności pogrzebowe' },
      { name: 'Transport zwłok', from: 500, description: 'Transport krajowy i międzynarodowy, specjalistyczny samochód, doświadczeni kierowcy' },
    ],
    features: ['chłodnia', 'kaplica', '24/7', 'transport-miedzynarodowy'],
    category: 'pogrzeby',
    isVerified: true,
    plan: 'premium',
  },
  {
    slug: 'pogrzebowy-zaklad-wiecznosc',
    name: 'Pogrzebowy Zakład „Wieczność"',
    city: 'Warszawa',
    citySlug: 'warszawa',
    district: 'Mokotów',
    address: 'ul. Puławska 123, Mokotów, Warszawa',
    phone: '+48 22 234 56 78',
    phone24h: true,
    rating: 4.7,
    reviewsCount: 127,
    verifiedYear: 2026,
    yearsActive: 28,
    description: 'Pełna obsługa ceremonii pogrzebowych z międzynarodowym transportem zwłok.',
    image: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=600&q=80&auto=format',
    bannerImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=80&auto=format',
    services: [
      { name: 'Pogrzeb tradycyjny', from: 4500 },
      { name: 'Kremacja z ceremonią', from: 3800 },
      { name: 'Transport międzynarodowy', from: 1500 },
    ],
    features: ['chłodnia', '24/7'],
    category: 'pogrzeby',
    isVerified: true,
    plan: 'pro',
  },
  {
    slug: 'spokojna-przystan',
    name: 'Spokojna Przystań',
    city: 'Warszawa',
    citySlug: 'warszawa',
    district: 'Mokotów',
    address: 'al. Niepodległości 56, Mokotów, Warszawa',
    phone: '+48 22 345 67 89',
    phone24h: false,
    rating: 4.8,
    reviewsCount: 214,
    verifiedYear: 2026,
    yearsActive: 21,
    description: 'Specjalizujemy się w pogrzebach kremacyjnych oraz organizacji styp.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80&auto=format',
    bannerImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=80&auto=format',
    services: [
      { name: 'Pogrzeb kremacyjny', from: 3500 },
      { name: 'Organizacja stypy', from: 120 },
      { name: 'Opieka nad grobem', from: 250 },
    ],
    features: ['kaplica'],
    category: 'pogrzeby',
    isVerified: true,
    plan: 'standard',
  },
  {
    slug: 'memento-mori',
    name: 'Memento Mori — Usługi Pogrzebowe',
    city: 'Warszawa',
    citySlug: 'warszawa',
    district: 'Mokotów',
    address: 'ul. Woronicza 17, Mokotów, Warszawa',
    phone: '+48 22 456 78 90',
    phone24h: true,
    rating: 4.6,
    reviewsCount: 98,
    verifiedYear: 2026,
    yearsActive: 15,
    description: 'Pogrzeb z trumną dębową, formalności urzędowe w cenie, kwiaty i wieńce.',
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80&auto=format',
    bannerImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=80&auto=format',
    services: [
      { name: 'Pogrzeb z trumną dębową', from: 5200 },
      { name: 'Formalności urzędowe', from: 0, description: 'w cenie' },
      { name: 'Kwiaty i wieńce', from: 200 },
    ],
    features: ['chłodnia', '24/7'],
    category: 'pogrzeby',
    isVerified: true,
    plan: 'standard',
  },
  {
    slug: 'godne-pozegnanie',
    name: 'Godne Pożegnanie',
    city: 'Warszawa',
    citySlug: 'warszawa',
    district: 'Mokotów',
    address: 'ul. Cybernetyki 7, Mokotów, Warszawa',
    phone: '+48 22 567 89 01',
    phone24h: true,
    rating: 4.9,
    reviewsCount: 305,
    verifiedYear: 2026,
    yearsActive: 19,
    description: 'Kompleksowa organizacja ceremonii z transmisją online i mistrzem ceremonii.',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80&auto=format',
    bannerImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=80&auto=format',
    services: [
      { name: 'Kompleksowa organizacja', from: 4000 },
      { name: 'Mistrz ceremonii', from: 800 },
      { name: 'Transmisja online', from: 500 },
    ],
    features: ['chłodnia', 'kaplica', '24/7', 'transmisja'],
    category: 'pogrzeby',
    isVerified: true,
    plan: 'premium',
  },
  {
    slug: 'dom-pogrzebowy-memoria',
    name: 'Dom Pogrzebowy Memoria',
    city: 'Warszawa',
    citySlug: 'warszawa',
    district: 'Śródmieście',
    address: 'ul. Marszałkowska 84, Warszawa',
    phone: '+48 22 678 90 12',
    phone24h: true,
    rating: 4.9,
    reviewsCount: 412,
    verifiedYear: 2026,
    yearsActive: 42,
    description: 'Najstarszy zakład pogrzebowy w centrum Warszawy. Tradycja od 1984 roku.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format',
    bannerImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1400&q=80&auto=format',
    services: [
      { name: 'Pogrzeb tradycyjny', from: 3800 },
      { name: 'Kremacja', from: 3200 },
      { name: 'Transport', from: 400 },
    ],
    features: ['chłodnia', 'kaplica', '24/7'],
    category: 'pogrzeby',
    isVerified: true,
    plan: 'premium',
  },
];

export const obituaries = [
  { slug: 'jan-kowalski', name: 'Jan Kowalski', birth: 1942, death: 2026, role: 'Ukochany ojciec i dziadek', city: 'Warszawa', ceremonyDate: '22 maja 2026, 11:00', isPremium: false },
  { slug: 'anna-nowak', name: 'Anna Nowak', birth: 1955, death: 2026, role: 'Matka, żona i przyjaciółka', city: 'Kraków', ceremonyDate: '22 maja 2026, 13:00', isPremium: false },
  { slug: 'piotr-wisniewski', name: 'Piotr Wiśniewski', birth: 1938, death: 2026, role: 'Zasłużony dla miasta, kochający mąż', city: 'Poznań', ceremonyDate: '21 maja 2026, 10:30', isPremium: false },
  { slug: 'maria-lewandowska', name: 'Maria Lewandowska', birth: 1960, death: 2026, role: 'Artystka, nauczycielka i mentor', city: 'Wrocław', ceremonyDate: '23 maja 2026, 12:00, Kościół Św. Anny', isPremium: true },
  { slug: 'tadeusz-kaminski', name: 'Tadeusz Kamiński', birth: 1945, death: 2026, role: 'Człowiek o wielkim sercu', city: 'Gdańsk', ceremonyDate: '25 maja 2026, 14:00', isPremium: false },
  { slug: 'zofia-zielinska', name: 'Zofia Zielińska', birth: 1930, death: 2026, role: 'Nestorka rodu, niezapomniana babcia', city: 'Szczecin', ceremonyDate: '26 maja 2026, 15:00', isPremium: false },
];

export const testimonials = [
  {
    author: 'Anna K., Warszawa',
    quote: 'Po raz pierwszy nikt nie naciskał. Dostałam 3 oferty z cenami, mogłam spokojnie wybrać.',
  },
  {
    author: 'Marek W., Kraków',
    quote: 'Transparentność cen i brak presji. To dokładnie tego potrzebowałem w tym trudnym czasie.',
  },
  {
    author: 'Joanna S., Wrocław',
    quote: 'Kalkulator pokazał mi realny budżet. Wiedziałam, czego się spodziewać przed rozmową.',
  },
];

export const stats = {
  verifiedCompanies: 847,
  familiesHelped: 12350,
  averageRating: 4.8,
  priceTransparency: 100,
};

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}

export function getCompaniesByCity(citySlug: string): Company[] {
  return companies.filter((c) => c.citySlug === citySlug);
}

export const articles = [
  {
    slug: 'ile-kosztuje-pogrzeb-w-polsce-2026',
    title: 'Ile naprawdę kosztuje pogrzeb w Polsce w 2026 roku?',
    excerpt: 'Pełne rozbicie kosztów: kremacja vs pogrzeb tradycyjny, ukryte opłaty, zasiłek ZUS i przykładowy budżet 12 000 zł.',
    readTime: '8 min',
    category: 'Koszty',
    date: '2026-05-15',
  },
  {
    slug: 'zasilek-pogrzebowy-zus-2026',
    title: 'Zasiłek pogrzebowy ZUS w 2026 roku — kwoty, dokumenty, krok po kroku',
    excerpt: 'Aktualna kwota zasiłku, komu przysługuje, dokumenty potrzebne i częste błędy przy składaniu wniosku.',
    readTime: '6 min',
    category: 'Formalności',
    date: '2026-05-10',
  },
  {
    slug: 'jak-wybrac-zaklad-pogrzebowy',
    title: 'Jak wybrać zakład pogrzebowy — 7 kryteriów których nikt nie pisze',
    excerpt: 'Pułapki w szpitalu, jak rozpoznać nieuczciwą firmę i lista pytań, które warto zadać przed podpisaniem umowy.',
    readTime: '7 min',
    category: 'Poradnik',
    date: '2026-05-05',
  },
  {
    slug: 'co-zrobic-gdy-smierc-w-szpitalu',
    title: 'Co zrobić, gdy śmierć nastąpiła w szpitalu? Krok po kroku',
    excerpt: 'Pierwsze 24 godziny, dokumenty z prosektorium, prawa rodziny i czy trzeba podpisać umowę z polecaną firmą.',
    readTime: '6 min',
    category: 'Formalności',
    date: '2026-04-28',
  },
  {
    slug: 'sprowadzenie-zwlok-z-zagranicy',
    title: 'Sprowadzenie zwłok z zagranicy do Polski — koszty i procedura',
    excerpt: 'Pełna procedura sprowadzania zwłok z UE i poza UE: dokumenty, transport drogowy/lotniczy, realne koszty 8 000–35 000 zł.',
    readTime: '8 min',
    category: 'Procedura',
    date: '2026-01-25',
  },
  {
    slug: 'pogrzeb-swiecki-humanistyczny',
    title: 'Pogrzeb świecki / humanistyczny — jak go zorganizować',
    excerpt: 'Ceremonia bez udziału duchownego, wybór mistrza ceremonii, scenariusz pożegnania i realne koszty 9 000–14 000 zł.',
    readTime: '7 min',
    category: 'Ceremonie',
    date: '2026-02-01',
  },
  {
    slug: 'kremacja-w-polsce-koszty',
    title: 'Kremacja w Polsce — koszty, procedura i co warto wiedzieć',
    excerpt: 'Pełny rozkład cen kremacji (6 200–9 800 zł), 24 krematoria w Polsce, gdzie pochować urnę, mit a fakt.',
    readTime: '7 min',
    category: 'Kremacja',
    date: '2026-02-04',
  },
  {
    slug: 'lista-dokumentow-do-pogrzebu',
    title: 'Lista dokumentów do pogrzebu — checklista 2026',
    excerpt: 'Pełna lista 26 dokumentów: USC, ZUS, bank, pracodawca, sprawy spadkowe. Drukuj i odhaczaj.',
    readTime: '6 min',
    category: 'Dokumenty',
    date: '2026-02-08',
  },
];
