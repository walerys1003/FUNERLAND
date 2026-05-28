import Link from 'next/link';
import { Star, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react';
import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { reviewStore } from '@/lib/marketplace/store';
import { reasonLabel } from '@/lib/moderation/heuristics';
import ModerationActions from '../moderation-actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Moderacja opinii — Admin' };

export default async function AdminOpiniePage() {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  const pending = reviewStore.pending(50);
  const flaggedOnly = pending.filter((r) => r.status === 'flagged');

  const total = pending.length;
  const flaggedCount = flaggedOnly.length;

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Moderacja opinii</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Opinie oczekujące na publikację. Zatwierdź lub odrzuć każdą z osobna.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {access.demo && (
            <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
              tryb demo
            </span>
          )}
          <div className="text-[12.5px] text-text-secondary">
            <span className="font-semibold text-navy">{total}</span> w kolejce
            {flaggedCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                <ShieldAlert className="w-3 h-3" />
                {flaggedCount} auto-flag
              </span>
            )}
          </div>
        </div>
      </div>

      {flaggedCount > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-medium text-red-900 text-[14px]">
              {flaggedCount} {flaggedCount === 1 ? 'opinia oflagowana' : 'opinii oflagowanych'} przez moderację AI
            </h2>
            <p className="text-[12.5px] text-red-700 mt-0.5">
              Heurystyki wykryły potencjalne problemy (wulgaryzmy, spam, dane osobowe, off-topic). Sprawdź najpierw te wpisy — są na górze listy.
            </p>
          </div>
        </div>
      )}

      {pending.length === 0 ? (
        <div className="mt-8 bg-white border border-border-soft rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 mx-auto text-emerald-500/60 mb-3" />
          <h2 className="font-heading text-[18px] text-navy">Pusta kolejka</h2>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Brak opinii oczekujących na moderację. Wszystko czysto.
          </p>
          <Link
            href="/admin"
            className="inline-block mt-4 px-4 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-50"
          >
            ← Przegląd
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {pending.map((r) => (
            <article
              key={r.id}
              className={`bg-white border rounded-2xl p-5 flex flex-col md:flex-row gap-4 ${
                r.status === 'flagged' ? 'border-red-300 ring-1 ring-red-100' : 'border-border-soft'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-amber-600 text-[13px] font-medium">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
                      />
                    ))}
                  </span>
                  <span className="text-text-muted text-[12px]">·</span>
                  <Link
                    href={`/firma/${r.companySlug}`}
                    className="text-[12.5px] text-navy hover:underline"
                  >
                    {r.companySlug}
                  </Link>
                  <span className="text-text-muted text-[12px]">·</span>
                  <span className="text-[11.5px] text-text-secondary">
                    {formatDate(r.createdAt)}
                  </span>
                  {r.verified && (
                    <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      zweryfikowany
                    </span>
                  )}
                  {r.status === 'flagged' && (
                    <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      auto-flag · {Math.round((r.moderation?.topScore || 0) * 100)}%
                    </span>
                  )}
                </div>

                {r.status === 'flagged' && r.moderation?.flags && r.moderation.flags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.moderation.flags.map((f, idx) => (
                      <span
                        key={idx}
                        className="text-[10.5px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200"
                        title={
                          f.matchedTerms && f.matchedTerms.length
                            ? `Wykryte: ${f.matchedTerms.join(', ')}`
                            : undefined
                        }
                      >
                        {reasonLabel(f.reason as any)} · {Math.round(f.score * 100)}%
                      </span>
                    ))}
                  </div>
                )}
                <h3 className="font-heading text-[16px] text-navy mt-2">{r.title}</h3>
                <p className="text-[13.5px] text-text-secondary mt-1 whitespace-pre-line line-clamp-4">
                  {r.body}
                </p>
                <div className="text-[11.5px] text-text-muted mt-2">
                  Autor: <span className="text-text-secondary">{r.authorName}</span>
                  {' · '}
                  <span className="text-text-secondary">{r.authorEmail}</span>
                  {r.bookingNumber && (
                    <>
                      {' · '}rezerwacja:&nbsp;
                      <span className="text-text-secondary">{r.bookingNumber}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="md:w-44 md:flex-shrink-0 flex md:flex-col items-start md:items-end justify-start gap-2">
                <ModerationActions reviewId={r.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
