import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, User, ArrowLeft, Calendar } from 'lucide-react';
import { getArticle, getArticleSlugs, renderMarkdown } from '@/lib/articles';

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Polskie Pogrzeby`,
    description: article.metaDescription,
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const tldrItems = article.tldr
    ? article.tldr.split('\n').filter((l) => l.trim().startsWith('-'))
    : [];

  return (
    <article className="bg-cream">
      {/* Hero */}
      <header className="border-b border-border-soft bg-white/40">
        <div className="container-page py-12">
          <Link
            href="/poradnik"
            className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-navy mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Wszystkie poradniki
          </Link>

          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium mb-4">
              {article.category}
            </div>
            <h1 className="font-heading text-3xl md:text-5xl text-navy leading-tight mb-6">
              {article.title}
            </h1>
            <p className="text-lg text-navy/70 mb-6">{article.metaDescription}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy/60">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author} · {article.authorRole}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readingTime} min czytania
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-12">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          {/* Main content */}
          <div>
            {/* TL;DR box */}
            {tldrItems.length > 0 && (
              <div className="card mb-10 bg-accent-green/5 border-accent-green/30">
                <div className="text-sm font-semibold text-accent-green mb-3 tracking-wide uppercase">
                  TL;DR — najważniejsze w skrócie
                </div>
                <ul className="space-y-2 text-navy/80">
                  {tldrItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2"
                      dangerouslySetInnerHTML={{
                        __html: `<span class="text-accent-green">✓</span><span>${item
                          .replace(/^-\s+/, '')
                          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</span>`,
                      }}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Article body */}
            <div
              className="article-content prose-funeral max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
            />

            {/* CTA on bottom */}
            <div className="card mt-12 bg-navy text-cream">
              <h3 className="font-heading text-2xl mb-3">Potrzebujesz pomocy teraz?</h3>
              <p className="text-cream/80 mb-6">
                Zostaw zapytanie — w ciągu 24 godzin otrzymasz 3 oferty od zweryfikowanych firm
                pogrzebowych w Twoim mieście.
              </p>
              <Link
                href="/zapytanie"
                className="inline-block bg-accent-green hover:bg-accent-green-hover text-white px-6 py-3 rounded-btn font-medium transition"
              >
                Otrzymaj 3 oferty →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card sticky top-24">
              <h4 className="text-xs uppercase tracking-wide text-navy/50 font-medium mb-3">
                Spis treści
              </h4>
              <TocFromMarkdown content={article.content} />
            </div>

            <div className="card">
              <h4 className="font-heading text-lg text-navy mb-3">Inne poradniki</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/poradnik/ile-kosztuje-pogrzeb-w-polsce-2026" className="text-navy/80 hover:text-accent-green">
                    Ile kosztuje pogrzeb w 2026?
                  </Link>
                </li>
                <li>
                  <Link href="/poradnik/zasilek-pogrzebowy-zus-2026" className="text-navy/80 hover:text-accent-green">
                    Zasiłek pogrzebowy ZUS 2026
                  </Link>
                </li>
                <li>
                  <Link href="/poradnik/kremacja-w-polsce-koszty" className="text-navy/80 hover:text-accent-green">
                    Kremacja w Polsce — koszty
                  </Link>
                </li>
                <li>
                  <Link href="/poradnik/lista-dokumentow-do-pogrzebu" className="text-navy/80 hover:text-accent-green">
                    Lista dokumentów do pogrzebu
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function TocFromMarkdown({ content }: { content: string }) {
  const headings = content
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => l.replace(/^##\s+/, ''))
    .slice(0, 12);
  return (
    <ol className="space-y-1.5 text-sm text-navy/70">
      {headings.map((h, i) => (
        <li key={i} className="hover:text-navy">
          <span className="text-navy/40 mr-2 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
          {h.replace(/\*\*/g, '')}
        </li>
      ))}
    </ol>
  );
}
