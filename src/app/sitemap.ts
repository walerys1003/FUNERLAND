import type { MetadataRoute } from 'next';
import { cities, categories, companies, articles, obituaries } from '@/lib/data';
import { getAllArticles } from '@/lib/articles';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://polskiepogrzeby.pl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/dla-firm`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/kalkulator`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/poradnik`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/nekrologi`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/zapytanie`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/panel-rodziny`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/panel-firmy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/design-system`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // City pages
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/${city.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // City + category combos (long-tail SEO)
  const cityCategoryPages: MetadataRoute.Sitemap = cities.flatMap((city) =>
    categories.map((category) => ({
      url: `${BASE_URL}/${city.slug}/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  // Company pages
  const companyPages: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${BASE_URL}/firma/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Article pages (from data.ts + filesystem)
  const articleSlugs = new Set<string>();
  articles.forEach((a: any) => articleSlugs.add(a.slug));
  try {
    const fsArticles = await getAllArticles();
    fsArticles.forEach((a) => articleSlugs.add(a.slug));
  } catch {
    // ignore fs errors in case of edge runtime
  }
  const articlePages: MetadataRoute.Sitemap = Array.from(articleSlugs).map((slug) => ({
    url: `${BASE_URL}/poradnik/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Obituary pages
  const obituaryPages: MetadataRoute.Sitemap = obituaries.map((o: any) => ({
    url: `${BASE_URL}/nekrologi/${o.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...cityPages,
    ...cityCategoryPages,
    ...companyPages,
    ...articlePages,
    ...obituaryPages,
  ];
}
