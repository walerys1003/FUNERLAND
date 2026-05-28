import Link from 'next/link';
import { Flame, MessageSquare, ImageIcon, BookOpen, Quote } from 'lucide-react';
import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { condolenceStore, memoryStore } from '@/lib/marketplace/store';
import ModerationRow from '@/components/admin/moderation-row';

export const dynamic = 'force-dynamic';

function fmtDate(s?: string) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return s;
  }
}

export default async function AdminNekrologiPage() {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  const condolences = condolenceStore.listPending();
  const memories = memoryStore.listPending();

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-heading text-[28px] md:text-[32px] flex items-center gap-2">
            <Flame className="w-6 h-6 text-[#C9A65F]" />
            Moderacja nekrologów
          </h1>
          <p className="text-[13.5px] text-text-secondary mt-1">
            Kondolencje i wspomnienia oczekujące na akceptację.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Stat label="Kondolencje" count={condolences.length} icon={Quote} />
          <Stat label="Wspomnienia" count={memories.length} icon={BookOpen} />
        </div>
      </div>

      {/* Kondolencje */}
      <section className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-[18px] inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Kondolencje ({condolences.length})
          </h2>
        </div>

        {condolences.length === 0 ? (
          <div className="rounded-xl border border-border-soft p-8 text-center text-text-muted text-sm">
            ✓ Brak kondolencji do moderacji.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wider text-text-secondary text-left">
                  <th className="py-2 font-medium">Nekrolog</th>
                  <th className="py-2 font-medium">Autor</th>
                  <th className="py-2 font-medium">Treść</th>
                  <th className="py-2 font-medium">Czas</th>
                  <th className="py-2 font-medium text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {condolences.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="py-3 pr-3">
                      {c.obituarySlug ? (
                        <Link
                          href={`/nekrologi/${c.obituarySlug}`}
                          className="text-[#2E4F3E] hover:underline font-medium"
                          target="_blank"
                        >
                          {c.obituaryName || c.obituarySlug}
                        </Link>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="font-medium">{c.authorName}</div>
                      {c.relation && (
                        <div className="text-[11px] text-text-muted">{c.relation}</div>
                      )}
                    </td>
                    <td className="py-3 pr-3 max-w-[420px]">
                      <p className="line-clamp-3 text-text-secondary whitespace-pre-line">
                        {c.text}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-[11.5px] text-text-muted whitespace-nowrap">
                      {fmtDate(c.createdAt)}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <ModerationRow id={c.id} endpoint="/api/admin/condolences" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Wspomnienia */}
      <section className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-[18px] inline-flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Wspomnienia / Ściana pamięci ({memories.length})
          </h2>
        </div>

        {memories.length === 0 ? (
          <div className="rounded-xl border border-border-soft p-8 text-center text-text-muted text-sm">
            ✓ Brak wspomnień do moderacji.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories.map((m) => (
              <article
                key={m.id}
                className="rounded-xl border border-border-soft overflow-hidden bg-white"
              >
                {m.type === 'photo' && m.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-stone-100 flex items-center justify-center text-stone-300">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-[11px] uppercase tracking-wider text-text-muted">
                    {m.type === 'photo' ? 'Zdjęcie' : 'Historia'}
                  </div>
                  <h3 className="font-medium text-[14px] truncate">{m.title}</h3>
                  {m.description && (
                    <p className="mt-1 text-[12.5px] text-text-secondary line-clamp-3">
                      {m.description}
                    </p>
                  )}
                  <div className="mt-2 text-[11px] text-text-muted">
                    {m.authorName}
                    {m.obituarySlug && (
                      <>
                        {' · '}
                        <Link
                          href={`/nekrologi/${m.obituarySlug}`}
                          className="text-[#2E4F3E] hover:underline"
                          target="_blank"
                        >
                          {m.obituaryName || m.obituarySlug}
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-border-soft">
                    <ModerationRow id={m.id} endpoint="/api/admin/memories" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  count,
  icon: Icon,
}: {
  label: string;
  count: number;
  icon: any;
}) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white border border-border-soft text-center">
      <div className="text-[11px] uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="font-heading text-[18px] inline-flex items-center gap-1">
        <Icon className="w-4 h-4 text-[#C9A65F]" />
        {count}
      </div>
    </div>
  );
}
