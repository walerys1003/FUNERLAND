import Link from 'next/link';
import Image from 'next/image';
import type { Company } from '@/lib/data';
import { Stars } from './stars';
import { VerifiedBadge } from './verified-badge';
import { MapPin } from 'lucide-react';

export function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="card card-hover p-5 md:p-6">
      <div className="grid md:grid-cols-[180px_1fr_auto] gap-5 items-start">
        <div className="relative w-full md:w-[180px] h-[140px] rounded-2xl overflow-hidden bg-cream-dark">
          <Image
            src={company.image}
            alt={company.name}
            fill
            sizes="(min-width:768px) 180px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-[20px] leading-tight text-navy">
            <Link href={`/firma/${company.slug}`} className="hover:text-accent-green transition">
              {company.name}
            </Link>
          </h3>
          <p className="mt-1 text-[13.5px] text-text-secondary inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {company.address}
          </p>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {company.isVerified && <VerifiedBadge year={company.verifiedYear} />}
            <span className="inline-flex items-center gap-1.5 text-[13px]">
              <Stars value={company.rating} />
              <span className="font-medium text-navy">{company.rating.toFixed(1)}</span>
              <span className="text-text-muted">({company.reviewsCount} opinii)</span>
            </span>
          </div>
        </div>
        <div className="md:text-right space-y-1.5 min-w-[200px]">
          {company.services.slice(0, 3).map((s) => (
            <div key={s.name} className="flex md:flex-row md:justify-end gap-2 text-[14px]">
              <span className="text-text-secondary">{s.name}</span>
              <span className="font-medium text-navy whitespace-nowrap">
                {s.from > 0 ? `od ${s.from.toLocaleString('pl-PL')} zł` : s.description || ''}
              </span>
            </div>
          ))}
          <div className="pt-3 flex md:justify-end gap-2">
            <button className="btn-primary !py-2 !px-4 text-[13.5px]">Wyślij zapytanie</button>
            <Link
              href={`/firma/${company.slug}`}
              className="btn-secondary !py-2 !px-4 text-[13.5px]"
            >
              Zobacz profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
