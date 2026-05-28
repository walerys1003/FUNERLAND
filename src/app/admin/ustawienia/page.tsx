import { checkAdminAccess } from '@/lib/auth/admin-guard';
import { AUTH_CONFIGURED } from '@/lib/auth/session';
import { Settings2, Database, Shield, Bell, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ustawienia — Admin' };

export default async function AdminUstawieniaPage() {
  const access = await checkAdminAccess();
  if (!access.allowed) return access.node;

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-[28px] text-navy">Ustawienia</h1>
          <p className="text-text-secondary text-[13.5px] mt-1">
            Konfiguracja platformy, role, integracje, powiadomienia.
          </p>
        </div>
        {access.demo && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            tryb demo
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Section
          icon={Database}
          title="Status bazy danych"
          desc={
            AUTH_CONFIGURED
              ? 'Supabase: skonfigurowane (NEXT_PUBLIC_SUPABASE_URL ustawione).'
              : 'Supabase: brak konfiguracji — używamy in-memory store. Aplikacja działa, ale dane nie są trwałe.'
          }
          status={AUTH_CONFIGURED ? 'ok' : 'warn'}
        />
        <Section
          icon={Shield}
          title="RBAC — kontrola dostępu"
          desc="Role: family (rodzina), company (firma), admin. Panel admina chroniony przez checkAdminAccess(). W trybie demo (bez auth) panel otwarty dla każdego."
          status="ok"
        />
        <Section
          icon={Bell}
          title="Powiadomienia"
          desc="E-mail do firm o nowych leadach, do rodzin o akceptacji opinii. Integracja Resend / SendGrid w fazie 4."
          status="pending"
        />
        <Section
          icon={Mail}
          title="Logowanie społecznościowe"
          desc="Magic link (e-mail) — aktywny. Google OAuth — aktywny (wymaga skonfigurowania providera w Supabase Dashboard → Authentication → Providers)."
          status="ok"
        />
      </div>

      <div className="mt-8 bg-white border border-border-soft rounded-2xl p-6">
        <h2 className="font-heading text-[18px] text-navy flex items-center gap-2">
          <Settings2 className="w-5 h-5" /> Zarządzanie rolami użytkowników
        </h2>
        <p className="text-[13.5px] text-text-secondary mt-2 max-w-2xl">
          Promowanie użytkownika do roli <code className="px-1 bg-stone-100 rounded">admin</code> /{' '}
          <code className="px-1 bg-stone-100 rounded">company</code> wykonuje się aktualnie przez Supabase Dashboard
          (tabela <code className="px-1 bg-stone-100 rounded">profiles</code>, kolumna{' '}
          <code className="px-1 bg-stone-100 rounded">role</code>). Interfejs zarządzania rolami pojawi się w
          następnej iteracji.
        </p>
      </div>

      <div className="mt-4 bg-white border border-border-soft rounded-2xl p-6">
        <h2 className="font-heading text-[18px] text-navy">Wersja aplikacji</h2>
        <div className="mt-3 text-[13px] text-text-secondary grid grid-cols-2 gap-y-1 max-w-md">
          <div className="text-text-muted">Build</div>
          <div className="font-mono">phase-3 / agents-5-11-2</div>
          <div className="text-text-muted">Framework</div>
          <div className="font-mono">Next.js 15 (App Router)</div>
          <div className="text-text-muted">Backend</div>
          <div className="font-mono">{AUTH_CONFIGURED ? 'Supabase' : 'In-memory store'}</div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  status: 'ok' | 'warn' | 'pending';
}) {
  const badge =
    status === 'ok'
      ? { label: 'Aktywne', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
      : status === 'warn'
        ? { label: 'Uwaga', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
        : { label: 'Wkrótce', cls: 'bg-stone-100 text-stone-700 border-stone-200' };
  return (
    <div className="bg-white border border-border-soft rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-[15px] text-navy flex items-center gap-2">
          <Icon className="w-4 h-4 text-text-muted" /> {title}
        </h3>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
      </div>
      <p className="text-[13px] text-text-secondary mt-2">{desc}</p>
    </div>
  );
}
