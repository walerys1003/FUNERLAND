import Link from 'next/link';
import {
  FileText,
  Bookmark,
  Calculator,
  Bell,
  Settings2,
  ChevronRight,
  User,
  Heart,
  MessageCircle,
  CalendarCheck,
} from 'lucide-react';
import { getServerUser, AUTH_CONFIGURED } from '@/lib/auth/session';
import { bookingRepo, messagingRepo } from '@/lib/marketplace/repo';
import { companies as ALL_COMPANIES } from '@/lib/data';

export const dynamic = 'force-dynamic';

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function statusLabel(s: string): { label: string; tone: 'success' | 'warning' | 'muted' | 'error' } {
  switch (s) {
    case 'new':
      return { label: 'Nowa', tone: 'warning' };
    case 'confirmed':
      return { label: 'Potwierdzona', tone: 'success' };
    case 'completed':
      return { label: 'Zakończona', tone: 'success' };
    case 'cancelled':
      return { label: 'Anulowana', tone: 'error' };
    default:
      return { label: s, tone: 'muted' };
  }
}

export default async function PanelRodzinyPage() {
  const user = AUTH_CONFIGURED ? await getServerUser() : null;

  // Live data via repo when authenticated; empty/demo otherwise
  const bookings = user ? await bookingRepo.listForUser(user.id) : [];
  const threads = user?.email ? await messagingRepo.threadsForCustomer(user.email) : [];

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');
  const unreadCount = threads.reduce((a, t) => a + (t.unreadForCustomer || 0), 0);

  const displayName = user?.fullName || 'Pani Anno';

  return (
    <div className="bg-cream min-h-[calc(100vh-68px)]">
      <div className="bg-navy h-32" />
      <div className="container-page -mt-20 pb-16">
        <div className="card p-7 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="font-heading text-[36px]">
              Witaj, <span>{displayName}</span>
            </h1>
            <div className="flex items-center gap-3">
              {!AUTH_CONFIGURED && (
                <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                  tryb demo
                </span>
              )}
              <Link
                href="/panel-rodziny/wiadomosci"
                className="relative w-10 h-10 rounded-full bg-cream border border-border-soft flex items-center justify-center"
                aria-label="Wiadomości"
              >
                <MessageCircle className="w-4 h-4 text-text-secondary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <button className="w-10 h-10 rounded-full bg-cream border border-border-soft flex items-center justify-center">
                <Bell className="w-4 h-4 text-text-secondary" />
              </button>
              <button className="w-10 h-10 rounded-full bg-cream border border-border-soft flex items-center justify-center">
                <User className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid md:grid-cols-4 gap-3">
            <StatCard
              icon={CalendarCheck}
              label="Aktywne rezerwacje"
              value={String(activeBookings.length)}
            />
            <StatCard icon={FileText} label="Historia rezerwacji" value={String(pastBookings.length)} />
            <StatCard
              icon={MessageCircle}
              label="Wiadomości od firm"
              value={String(threads.length)}
              accent={unreadCount > 0}
              hint={unreadCount > 0 ? `${unreadCount} nieprzeczyt.` : ''}
            />
            <StatCard icon={Bookmark} label="Zapisane firmy" value="—" />
          </div>

          <div className="mt-8 grid lg:grid-cols-[220px_1fr] gap-8">
            <aside className="space-y-1">
              <NavItem icon={FileText} active>
                Moje rezerwacje
              </NavItem>
              <NavItem icon={MessageCircle} href="/panel-rodziny/wiadomosci">
                Wiadomości{unreadCount > 0 ? ` (${unreadCount})` : ''}
              </NavItem>
              <NavItem icon={Bookmark}>Zapisane firmy</NavItem>
              <NavItem icon={Calculator} href="/kalkulator">
                Kalkulator
              </NavItem>
              <NavItem icon={Bell}>Powiadomienia</NavItem>
              <NavItem icon={Settings2}>Ustawienia konta</NavItem>
            </aside>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[24px]">Moje rezerwacje</h2>
                <Link href="/firmy" className="text-[13px] text-accent-green hover:underline">
                  + Nowe zapytanie
                </Link>
              </div>

              {/* Active bookings */}
              {activeBookings.length === 0 && (
                <div className="mt-5 card p-8 text-center">
                  <CalendarCheck className="w-10 h-10 mx-auto text-text-muted" />
                  <p className="mt-3 font-semibold text-[15px]">
                    {user
                      ? 'Nie masz jeszcze rezerwacji'
                      : 'Zaloguj się, aby zobaczyć swoje rezerwacje'}
                  </p>
                  <p className="mt-1 text-[13px] text-text-secondary max-w-md mx-auto">
                    {user
                      ? 'Znajdź zakład pogrzebowy w Twoim mieście i zarezerwuj termin online — proces zajmie kilka minut.'
                      : 'Po zalogowaniu zobaczysz tutaj historię swoich rezerwacji oraz aktywne sprawy.'}
                  </p>
                  <div className="mt-5 flex gap-3 justify-center">
                    <Link href="/firmy" className="btn-primary !py-2.5">
                      Znajdź firmę
                    </Link>
                    <Link href="/asystent" className="btn-secondary !py-2.5">
                      Asystent AI
                    </Link>
                  </div>
                  {!user && AUTH_CONFIGURED && (
                    <div className="mt-4 text-[12.5px]">
                      <Link href="/logowanie" className="text-accent-green hover:underline">
                        Zaloguj się
                      </Link>{' '}
                      lub{' '}
                      <Link href="/rejestracja" className="text-accent-green hover:underline">
                        załóż konto
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeBookings.length > 0 && (
                <div className="mt-5 space-y-4">
                  {activeBookings.map((b) => {
                    const company =
                      ALL_COMPANIES.find((c) => c.slug === b.companySlug) || null;
                    const st = statusLabel(b.status);
                    return (
                      <div key={b.number} className="card p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <div className="text-[12.5px] text-text-secondary">
                              Rezerwacja #{b.number} · {fmtDate(b.createdAt)}
                            </div>
                            <h3 className="font-heading text-[19px] mt-1">
                              {b.category || 'Usługa pogrzebowa'}{' '}
                              <span className="text-text-secondary">
                                · {company?.name || b.companyName || 'Zakład pogrzebowy'}
                              </span>
                            </h3>
                            {b.slotStart && (
                              <p className="mt-2 text-[13.5px] text-text-secondary">
                                Termin: {fmtDate(b.slotStart)} · {fmtTime(b.slotStart)}
                                {b.slotEnd ? ` – ${fmtTime(b.slotEnd)}` : ''}
                              </p>
                            )}
                          </div>
                          <StatusPill label={st.label} tone={st.tone} />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Link
                            href={`/rezerwacja/potwierdzenie/${b.number}`}
                            className="btn-secondary !py-2 text-[13px]"
                          >
                            Szczegóły
                          </Link>
                          <Link
                            href="/panel-rodziny/wiadomosci"
                            className="btn-secondary !py-2 text-[13px] inline-flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Napisz do firmy
                          </Link>
                          {company && (
                            <Link
                              href={`/firmy/${company.slug}`}
                              className="text-[13px] text-accent-green hover:underline inline-flex items-center gap-1"
                            >
                              Profil firmy <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Past bookings */}
              {pastBookings.length > 0 && (
                <>
                  <h3 className="mt-8 font-heading text-[18px]">Historia</h3>
                  <div className="mt-3 space-y-3">
                    {pastBookings.slice(0, 5).map((b) => {
                      const company = ALL_COMPANIES.find((c) => c.slug === b.companySlug);
                      const st = statusLabel(b.status);
                      return (
                        <div
                          key={b.number}
                          className="card p-5 flex items-center justify-between flex-wrap gap-3 bg-cream/50"
                        >
                          <div>
                            <div className="text-[12.5px] text-text-muted">
                              {fmtDate(b.createdAt)} · #{b.number}
                            </div>
                            <h4 className="font-heading text-[16px] mt-1">
                              {b.category} ·{' '}
                              <span className="text-text-secondary">
                                {company?.name || b.companyName || '—'}
                              </span>
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusPill label={st.label} tone={st.tone} />
                            {b.status === 'completed' && (
                              <Link
                                href={`/opinie/dodaj?company=${b.companySlug}&booking=${b.number}`}
                                className="btn-secondary !py-1.5 text-[12.5px] inline-flex items-center gap-1"
                              >
                                <Heart className="w-3.5 h-3.5" />
                                Wystaw opinię
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* CTA bottom */}
              {pastBookings.some((b) => b.status === 'completed') && (
                <Link
                  href={`/opinie/dodaj?company=${pastBookings.find((b) => b.status === 'completed')?.companySlug}`}
                  className="mt-6 w-full btn-primary !py-4 flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Wystaw opinię po zakończonym pogrzebie – pomóż innym rodzinom
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[12.5px] text-text-muted flex justify-center gap-6">
          <Link href="/regulamin">Regulamin</Link>
          <Link href="/prywatnosc">Polityka Prywatności</Link>
          <Link href="/kontakt">Kontakt</Link>
        </div>
      </div>
    </div>
  );
}

/* ----- helpers ----- */

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`card p-4 ${accent ? 'border-accent-green/40 bg-accent-green-light/40' : ''}`}>
      <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-text-secondary">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="mt-1 font-heading text-[22px]">{value}</div>
      {hint && <div className="text-[11.5px] text-text-secondary mt-0.5">{hint}</div>}
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'muted' | 'error';
}) {
  const cls =
    tone === 'success'
      ? 'bg-accent-green-light text-accent-green'
      : tone === 'warning'
      ? 'bg-warning/15 text-warning'
      : tone === 'error'
      ? 'bg-error/15 text-error'
      : 'bg-border-soft text-text-muted';
  return (
    <span
      className={`px-3 py-1 rounded-md ${cls} text-[12px] font-semibold whitespace-nowrap`}
    >
      {label}
    </span>
  );
}

function NavItem({
  icon: Icon,
  children,
  active,
  href,
}: {
  icon: any;
  children: React.ReactNode;
  active?: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] cursor-pointer ${
        active ? 'bg-accent-green text-white' : 'text-navy/85 hover:bg-cream'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
