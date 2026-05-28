import Link from 'next/link';
import { articles } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export default function PoradnikPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="font-heading text-[40px] md:text-[52px] leading-tight">Poradnik dla rodzin</h1>
        <p className="mt-4 text-text-secondary">
          Konkretne odpowiedzi na trudne pytania. Bez patosu, bez sprzedaży.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((a) => (
          <Link key={a.slug} href={`/poradnik/${a.slug}`} className="card card-hover p-7 block group">
            <div className="text-[12px] text-accent-green font-medium uppercase tracking-wider">
              {a.category}
            </div>
            <h3 className="font-heading text-[20px] leading-snug mt-3 group-hover:text-accent-green transition">
              {a.title}
            </h3>
            <p className="text-[14px] text-text-secondary mt-3 line-clamp-4">{a.excerpt}</p>
            <div className="mt-5 flex items-center justify-between text-[12px] text-text-muted">
              <span>{a.readTime} • {a.date}</span>
              <ArrowRight className="w-4 h-4 text-accent-green group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
