/**
 * Schema.org JSON-LD generators for SEO.
 * All functions return plain objects ready for <script type="application/ld+json">.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';
const BRAND_NAME = 'PolskiePogrzeby.pl';

// ===================== Organization =====================
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    description:
      'Pożegnaj godnie. Marketplace usług pogrzebowych — porównaj ceny, sprawdź opinie, otrzymaj transparentną wycenę.',
    sameAs: [
      'https://www.facebook.com/polskiepogrzeby',
      'https://www.linkedin.com/company/polskiepogrzeby',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+48 22 100 00 00',
      contactType: 'customer service',
      availableLanguage: ['Polish', 'English'],
      areaServed: 'PL',
    },
  };
}

// ===================== WebSite + SearchAction =====================
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: BASE_URL,
    inLanguage: 'pl-PL',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/szukaj?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// ===================== LocalBusiness (FuneralHome) =====================
export type CompanyLDInput = {
  name: string;
  slug: string;
  description?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  rating?: number;
  reviewsCount?: number;
  priceFrom?: number;
  priceTo?: number;
  image?: string;
  lat?: number;
  lng?: number;
};

export function localBusinessJsonLd(c: CompanyLDInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FuneralHome',
    '@id': `${BASE_URL}/firma/${c.slug}#business`,
    name: c.name,
    description: c.description,
    url: `${BASE_URL}/firma/${c.slug}`,
    image: c.image,
    telephone: c.phone,
    email: c.email,
    address: c.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: c.address,
          addressLocality: c.city,
          addressCountry: 'PL',
        }
      : undefined,
    geo:
      c.lat && c.lng
        ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng }
        : undefined,
    priceRange: c.priceFrom
      ? c.priceTo
        ? `${c.priceFrom} - ${c.priceTo} PLN`
        : `od ${c.priceFrom} PLN`
      : undefined,
    aggregateRating:
      c.rating && c.reviewsCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: c.rating.toFixed(1),
            reviewCount: c.reviewsCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

// ===================== BreadcrumbList =====================
export type Crumb = { name: string; url: string };

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// ===================== FAQPage =====================
export type FAQItem = { question: string; answer: string };

export function faqJsonLd(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

// ===================== Article =====================
export type ArticleLDInput = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorRole?: string;
  image?: string;
  readingTime?: number;
};

export function articleJsonLd(a: ArticleLDInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    image: a.image || `${BASE_URL}/og/${a.slug}.png`,
    datePublished: a.date,
    dateModified: a.date,
    author: {
      '@type': 'Person',
      name: a.author,
      jobTitle: a.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/poradnik/${a.slug}` },
    timeRequired: a.readingTime ? `PT${a.readingTime}M` : undefined,
    inLanguage: 'pl-PL',
  };
}

// ===================== Service =====================
export function serviceJsonLd(opts: {
  name: string;
  description: string;
  provider: string;
  area?: string;
  priceFrom?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    provider: { '@type': 'Organization', name: opts.provider },
    areaServed: opts.area || 'Polska',
    offers: opts.priceFrom
      ? { '@type': 'Offer', price: opts.priceFrom, priceCurrency: 'PLN' }
      : undefined,
  };
}

// ===================== Review =====================
export function reviewJsonLd(opts: {
  author: string;
  rating: number;
  body: string;
  date: string;
  itemName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: { '@type': 'Person', name: opts.author },
    reviewRating: { '@type': 'Rating', ratingValue: opts.rating, bestRating: 5 },
    reviewBody: opts.body,
    datePublished: opts.date,
    itemReviewed: { '@type': 'LocalBusiness', name: opts.itemName },
  };
}

// ===================== HowTo =====================
export type HowToStep = {
  name: string;
  text: string;
  url?: string;
  image?: string;
};

export function howToJsonLd(opts: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration e.g. "PT5M"
  estimatedCost?: { value: number; currency?: string };
  supply?: string[];
  tool?: string[];
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    totalTime: opts.totalTime,
    estimatedCost: opts.estimatedCost
      ? {
          '@type': 'MonetaryAmount',
          currency: opts.estimatedCost.currency || 'PLN',
          value: opts.estimatedCost.value,
        }
      : undefined,
    supply: opts.supply?.map((s) => ({ '@type': 'HowToSupply', name: s })),
    tool: opts.tool?.map((t) => ({ '@type': 'HowToTool', name: t })),
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: s.url ? (s.url.startsWith('http') ? s.url : `${BASE_URL}${s.url}`) : undefined,
      image: s.image,
    })),
    inLanguage: 'pl-PL',
    url: opts.url ? (opts.url.startsWith('http') ? opts.url : `${BASE_URL}${opts.url}`) : undefined,
  };
}

// ===================== SoftwareApplication (calculators) =====================
export function softwareApplicationJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  rating?: { value: number; count: number };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${BASE_URL}${opts.url}`,
    applicationCategory: opts.applicationCategory || 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PLN',
    },
    inLanguage: 'pl-PL',
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: BASE_URL,
    },
    aggregateRating: opts.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: opts.rating.value,
          ratingCount: opts.rating.count,
          bestRating: 5,
        }
      : undefined,
  };
}

// ===================== WebPage (generic) =====================
export function webPageJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumb?: Crumb[];
  primaryImage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${BASE_URL}${opts.url}`,
    inLanguage: 'pl-PL',
    isPartOf: { '@type': 'WebSite', name: BRAND_NAME, url: BASE_URL },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    primaryImageOfPage: opts.primaryImage
      ? { '@type': 'ImageObject', url: opts.primaryImage }
      : undefined,
    breadcrumb: opts.breadcrumb ? breadcrumbJsonLd(opts.breadcrumb) : undefined,
  };
}

// ===================== Place (city landing) =====================
export function placeJsonLd(opts: {
  name: string;
  region: string;
  description?: string;
  populationCount?: number;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${BASE_URL}${opts.url}`,
    containedInPlace: { '@type': 'AdministrativeArea', name: opts.region },
    additionalProperty: opts.populationCount
      ? { '@type': 'PropertyValue', name: 'population', value: opts.populationCount }
      : undefined,
  };
}

// ===================== ItemList (collection pages) =====================
export function itemListJsonLd(opts: {
  name: string;
  items: Array<{ name: string; url: string; description?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url.startsWith('http') ? it.url : `${BASE_URL}${it.url}`,
      description: it.description,
    })),
  };
}

// ===================== Helper: render JSON-LD script tag content =====================
export function jsonLdScript(data: any): string {
  return JSON.stringify(data, (_, v) => (v === undefined ? undefined : v));
}

/** Combined <script> renderer — accepts one or many JSON-LD objects. */
export function combineJsonLd(...items: any[]) {
  if (items.length === 1) return items[0];
  return items.filter(Boolean);
}
