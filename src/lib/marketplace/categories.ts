/**
 * 5 głównych kategorii marketplace + ich konfiguracja: pola profilu, etapy bookingu, ikony.
 */

import {
  CoffinIcon,
  FlowerIcon,
  GravestoneIcon,
  UrnIcon,
  TransportIcon,
} from '@/components/icons';

export type CategoryConfig = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: any;
  color: string; // bg accent color
  profileFields: string[]; // które pola pokazywać w profilu firmy
  bookingSteps: BookingStep[];
  priceUnit: string;
  searchableFilters: { key: string; label: string; type: 'select' | 'checkbox' | 'range'; options?: string[] }[];
};

export type BookingStep = {
  id: string;
  title: string;
  description: string;
  required: boolean;
};

// ============== ZAKŁADY POGRZEBOWE ==============
export const FUNERAL_HOMES: CategoryConfig = {
  slug: 'zaklady-pogrzebowe',
  name: 'Zakłady pogrzebowe',
  shortDescription: 'Kompleksowa organizacja pogrzebu — od formalności po ceremonię.',
  icon: CoffinIcon,
  color: '#2E4F3E',
  profileFields: [
    'name',
    'description',
    'address',
    'phone',
    'email',
    'services',
    'priceList',
    'gallery',
    'reviews',
    'certifications',
    'availability24h',
    'languages',
    'paymentMethods',
  ],
  bookingSteps: [
    { id: 'ceremony-type', title: 'Typ ceremonii', description: 'Tradycyjny / kremacja / świecki / kościelny', required: true },
    { id: 'date-time', title: 'Termin', description: 'Data i godzina ceremonii', required: true },
    { id: 'location', title: 'Miejsce', description: 'Kościół, kaplica, sala pożegnań, cmentarz', required: true },
    { id: 'services', title: 'Usługi dodatkowe', description: 'Transport, kwiaty, nekrolog, transmisja', required: false },
    { id: 'contact', title: 'Dane kontaktowe', description: 'Imię, telefon, e-mail osoby zamawiającej', required: true },
    { id: 'review', title: 'Podsumowanie', description: 'Sprawdź i potwierdź zamówienie', required: true },
  ],
  priceUnit: 'zł / pogrzeb',
  searchableFilters: [
    { key: 'ceremony', label: 'Typ ceremonii', type: 'select', options: ['Tradycyjny', 'Kremacja', 'Świecki', 'Kościelny'] },
    { key: 'availability24h', label: 'Dostępność 24h', type: 'checkbox' },
    { key: 'eco', label: 'Eco funeral', type: 'checkbox' },
    { key: 'vip', label: 'VIP', type: 'checkbox' },
    { key: 'language', label: 'Język obsługi', type: 'select', options: ['Polski', 'Angielski', 'Niemiecki', 'Ukraiński'] },
    { key: 'price', label: 'Budżet', type: 'range' },
  ],
};

// ============== KWIACIARNIE ==============
export const FLORISTS: CategoryConfig = {
  slug: 'kwiaciarnie-pogrzebowe',
  name: 'Kwiaciarnie pogrzebowe',
  shortDescription: 'Wieńce, wiązanki, bukiety i dekoracje pogrzebowe.',
  icon: FlowerIcon,
  color: '#C9A65F',
  profileFields: ['name', 'description', 'gallery', 'priceList', 'deliveryArea', 'phone', 'email', 'reviews'],
  bookingSteps: [
    { id: 'product-type', title: 'Rodzaj kwiatów', description: 'Wieniec / wiązanka / bukiet / kompozycja', required: true },
    { id: 'date-delivery', title: 'Termin dostawy', description: 'Data i godzina', required: true },
    { id: 'location', title: 'Adres dostawy', description: 'Cmentarz, dom rodziny lub zakład pogrzebowy', required: true },
    { id: 'ribbon', title: 'Szarfa (opcjonalnie)', description: 'Treść szarfy z napisem', required: false },
    { id: 'contact', title: 'Dane kontaktowe', description: 'Imię, telefon, e-mail', required: true },
    { id: 'review', title: 'Podsumowanie', description: 'Sprawdź i zamów', required: true },
  ],
  priceUnit: 'zł',
  searchableFilters: [
    { key: 'product', label: 'Rodzaj', type: 'select', options: ['Wieńce', 'Wiązanki', 'Bukiety', 'Kompozycje'] },
    { key: 'delivery', label: 'Dostawa express (2h)', type: 'checkbox' },
    { key: 'custom', label: 'Realizacje na zamówienie', type: 'checkbox' },
    { key: 'price', label: 'Budżet', type: 'range' },
  ],
};

// ============== KAMIENIARZE ==============
export const STONEMASONS: CategoryConfig = {
  slug: 'kamieniarze',
  name: 'Kamieniarze',
  shortDescription: 'Nagrobki, renowacje, liternictwo, premium kamień.',
  icon: GravestoneIcon,
  color: '#0F1B2D',
  profileFields: ['name', 'description', 'gallery', 'priceList', 'completedProjects', 'materials', 'warranty', 'reviews'],
  bookingSteps: [
    { id: 'service', title: 'Rodzaj usługi', description: 'Nowy nagrobek / renowacja / liternictwo / dodatki', required: true },
    { id: 'cemetery', title: 'Cmentarz', description: 'Adres cmentarza i numer kwatery', required: true },
    { id: 'design', title: 'Projekt', description: 'Wybierz wzór lub poproś o indywidualny projekt', required: true },
    { id: 'material', title: 'Materiał', description: 'Granit / marmur / piaskowiec / mieszany', required: true },
    { id: 'contact', title: 'Dane kontaktowe', description: 'Imię, telefon, e-mail', required: true },
    { id: 'review', title: 'Podsumowanie', description: 'Otrzymasz wycenę indywidualną w 48h', required: true },
  ],
  priceUnit: 'zł / nagrobek',
  searchableFilters: [
    { key: 'service', label: 'Rodzaj usługi', type: 'select', options: ['Nowe nagrobki', 'Renowacje', 'Liternictwo'] },
    { key: 'material', label: 'Materiał', type: 'select', options: ['Granit', 'Marmur', 'Piaskowiec'] },
    { key: 'warranty', label: 'Gwarancja 10+ lat', type: 'checkbox' },
    { key: 'price', label: 'Budżet', type: 'range' },
  ],
};

// ============== KREMATORIA ==============
export const CREMATORIA: CategoryConfig = {
  slug: 'kremacja',
  name: 'Krematoria',
  shortDescription: 'Usługi kremacji + urny + ceremonie pożegnania.',
  icon: UrnIcon,
  color: '#8B5CF6',
  profileFields: ['name', 'description', 'address', 'priceList', 'urns', 'ceremonies', 'phone', 'reviews'],
  bookingSteps: [
    { id: 'urn-type', title: 'Wybór urny', description: 'Standardowa / drewniana / ceramiczna / biodegradowalna', required: true },
    { id: 'date', title: 'Termin kremacji', description: 'Data preferowana (3-5 dni od formalności)', required: true },
    { id: 'ceremony', title: 'Ceremonia pożegnania', description: 'Sala / brak / online', required: false },
    { id: 'transport', title: 'Transport zwłok', description: 'Czy potrzebujecie transportu do krematorium?', required: false },
    { id: 'contact', title: 'Dane kontaktowe', description: 'Imię, telefon, e-mail', required: true },
    { id: 'review', title: 'Podsumowanie', description: 'Sprawdź i potwierdź', required: true },
  ],
  priceUnit: 'zł / kremacja',
  searchableFilters: [
    { key: 'ceremony-room', label: 'Z salą pożegnań', type: 'checkbox' },
    { key: 'urn-type', label: 'Typ urny', type: 'select', options: ['Standardowa', 'Drewniana', 'Ceramiczna', 'Bio'] },
    { key: 'price', label: 'Budżet', type: 'range' },
  ],
};

// ============== TRANSPORT ZWŁOK ==============
export const TRANSPORT: CategoryConfig = {
  slug: 'transport-zwlok',
  name: 'Transport zwłok',
  shortDescription: 'Krajowy i międzynarodowy transport zwłok i prochów.',
  icon: TransportIcon,
  color: '#EC4899',
  profileFields: ['name', 'description', 'fleet', 'coverageArea', 'internationalTransport', 'priceList', 'phone', 'reviews'],
  bookingSteps: [
    { id: 'route', title: 'Trasa', description: 'Skąd → dokąd (miasto/kraj)', required: true },
    { id: 'date', title: 'Termin', description: 'Data preferowana', required: true },
    { id: 'cargo', title: 'Rodzaj transportu', description: 'Trumna / urna / prochy', required: true },
    { id: 'documents', title: 'Dokumenty', description: 'Czy pomóc w formalnościach (akt zgonu, glejt)?', required: false },
    { id: 'contact', title: 'Dane kontaktowe', description: 'Imię, telefon, e-mail', required: true },
    { id: 'review', title: 'Podsumowanie', description: 'Otrzymasz wycenę w 24h', required: true },
  ],
  priceUnit: 'zł / km lub stała stawka',
  searchableFilters: [
    { key: 'international', label: 'Transport międzynarodowy', type: 'checkbox' },
    { key: 'urgent24h', label: 'Realizacja 24h', type: 'checkbox' },
    { key: 'formalities', label: 'Pomoc w formalnościach', type: 'checkbox' },
    { key: 'price', label: 'Budżet', type: 'range' },
  ],
};

export const ALL_CATEGORIES: CategoryConfig[] = [FUNERAL_HOMES, FLORISTS, STONEMASONS, CREMATORIA, TRANSPORT];

export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return ALL_CATEGORIES.find((c) => c.slug === slug);
}
