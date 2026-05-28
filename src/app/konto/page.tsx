import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Mail, Phone, MapPin, User as UserIcon, Shield, LogOut } from 'lucide-react';
import { getServerUser, AUTH_CONFIGURED } from '@/lib/auth/session';
import AccountActions from './account-actions';
import TwoFactor from './two-factor';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Moje konto — Polskie Pogrzeby',
  robots: { index: false, follow: false },
};

export default async function KontoPage() {
  if (!AUTH_CONFIGURED) {
    // Demo mode: render a friendly placeholder
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-cream">
        <div className="bg-white border border-border-soft rounded-2xl p-8 max-w-lg text-center shadow-sm">
          <UserIcon className="w-10 h-10 mx-auto text-text-muted" />
          <h1 className="mt-3 font-heading text-[22px] text-navy">Konto użytkownika</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Logowanie jest aktualnie w trybie demo (brak konfiguracji Supabase). Po podłączeniu auth zobaczysz tu
            swój profil, możliwość eksportu danych (RODO) i usunięcia konta.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:opacity-90"
          >
            Strona główna
          </Link>
        </div>
      </div>
    );
  }

  const user = await getServerUser();
  if (!user) {
    redirect('/logowanie?next=/konto');
  }

  const roleLabel =
    user.role === 'admin' ? 'Administrator' : user.role === 'company' ? 'Firma' : 'Rodzina';

  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-[28px] text-navy">Moje konto</h1>
            <p className="text-text-secondary text-[13.5px] mt-1">
              Twój profil, dane kontaktowe i ustawienia prywatności (RODO).
            </p>
          </div>
          <Link href="/api/auth/signout" className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-navy">
            <LogOut className="w-4 h-4" />
            Wyloguj się
          </Link>
        </div>

        {/* Profile */}
        <section className="mt-6 bg-white border border-border-soft rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center text-navy font-heading text-[20px] flex-shrink-0">
              {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-[18px] text-navy">
                {user.fullName || <span className="text-text-muted italic">bez imienia</span>}
              </h2>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                <div className="inline-flex items-center gap-2 text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="inline-flex items-center gap-2 text-text-secondary">
                  <Shield className="w-3.5 h-3.5 text-text-muted" />
                  <span>Rola: <strong className="text-navy">{roleLabel}</strong></span>
                </div>
                {user.phone && (
                  <div className="inline-flex items-center gap-2 text-text-secondary">
                    <Phone className="w-3.5 h-3.5 text-text-muted" />
                    {user.phone}
                  </div>
                )}
                {user.city && (
                  <div className="inline-flex items-center gap-2 text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    {user.city}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick links per role */}
        <section className="mt-4 bg-white border border-border-soft rounded-2xl p-6">
          <h3 className="font-heading text-[16px] text-navy">Skróty</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.role === 'family' && (
              <>
                <Quick href="/panel-rodziny" label="Panel rodziny" />
                <Quick href="/panel-rodziny/wiadomosci" label="Wiadomości" />
              </>
            )}
            {user.role === 'company' && (
              <>
                <Quick href="/panel-firmy" label="Panel firmy" />
                <Quick href="/panel-firmy/leady" label="Leady" />
              </>
            )}
            {user.role === 'admin' && <Quick href="/admin" label="Panel admina" />}
            <Quick href="/" label="Strona główna" />
          </div>
        </section>

        {/* 2FA */}
        <section className="mt-4 bg-white border border-border-soft rounded-2xl p-6">
          <h3 className="font-heading text-[16px] text-navy">Bezpieczeństwo</h3>
          <TwoFactor />
        </section>

        {/* RODO */}
        <section className="mt-4 bg-white border border-border-soft rounded-2xl p-6">
          <h3 className="font-heading text-[16px] text-navy">Prywatność i dane (RODO)</h3>
          <p className="text-[13.5px] text-text-secondary mt-2">
            Zgodnie z art. 15 i 20 RODO masz prawo do dostępu do swoich danych oraz do ich przeniesienia.
            Zgodnie z art. 17 RODO masz prawo zażądać usunięcia konta wraz z danymi osobowymi.
          </p>
          <AccountActions email={user.email} />
        </section>
      </div>
    </div>
  );
}

function Quick({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg border border-stone-300 text-[13px] text-navy hover:bg-stone-50"
    >
      {label}
    </Link>
  );
}
