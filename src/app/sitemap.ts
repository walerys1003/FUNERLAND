import type { MetadataRoute } from 'next';
import { cities, categories, companies, articles, obituaries } from '@/lib/data';
import { getAllArticles } from '@/lib/articles';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

/**
 * Multi-namespace sitemap covering ALL public, indexable URLs.
 *
 * Excludes:
 *  - /admin, /panel-*, /api/*  (logged-in panels)
 *  - /logowanie, /rejestracja  (auth — duplicates of public landing)
 *  - /design-system, /orchestrator (internal tools)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ---- Static / top-level pages ----
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/dla-firm`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/poradnik`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/nekrologi`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/zapytanie`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/szukaj`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/asystent`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // ---- Tools (high SEO ROI — kalkulatory, generatory) ----
  const TOOLS: Array<{ slug: string; priority: number }> = [
    { slug: '', priority: 0.9 }, // hub
    { slug: '/koszt-pogrzebu', priority: 0.95 },
    { slug: '/zasilek-pogrzebowy', priority: 0.95 },
    { slug: '/kredyt-pogrzebowy', priority: 0.85 },
    { slug: '/porownaj-oferty', priority: 0.85 },
    { slug: '/checklista', priority: 0.9 },
    { slug: '/dokumenty', priority: 0.85 },
    { slug: '/mowa-pogrzebowa', priority: 0.8 },
  ];
  const toolsPages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${BASE_URL}/narzedzia${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: t.priority,
  }));

  // Old /kalkulator stays in sitemap as legacy
  staticPages.push({
    url: `${BASE_URL}/kalkulator`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  });

  // ---- City pages ----
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/${city.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // ---- City + category combos (long-tail) ----
  const cityCategoryPages: MetadataRoute.Sitemap = cities.flatMap((city) =>
    categories.map((category) => ({
      url: `${BASE_URL}/${city.slug}/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  );

  // ---- Standalone category landing (/firmy?kategoria=…) ----
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/rezerwacja/${category.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // ---- Company pages ----
  const companyPages: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${BASE_URL}/firma/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // ---- Articles (data.ts + filesystem) ----
  const articleSlugs = new Set<string>();
  articles.forEach((a: any) => articleSlugs.add(a.slug));
  try {
    const fsArticles = await getAllArticles();
    fsArticles.forEach((a) => articleSlugs.add(a.slug));
  } catch {
    /* ignore */
  }
  const articlePages: MetadataRoute.Sitemap = Array.from(articleSlugs).map((slug) => ({
    url: `${BASE_URL}/poradnik/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // ---- Obituaries ----
  const obituaryPages: MetadataRoute.Sitemap = obituaries.map((o: any) => ({
    url: `${BASE_URL}/nekrologi/${o.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...toolsPages,
    ...cityPages,
    ...cityCategoryPages,
    ...categoryPages,
    ...companyPages,
    ...articlePages,
    ...obituaryPages,
  ];
}
