import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Building2,
  Users,
  UsersRound,
  Banknote,
  Settings2,
  Flame,
} from 'lucide-react';
import { AUTH_CONFIGURED, getServerUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = AUTH_CONFIGURED ? await getServerUser() : null;

  const nav = [
    { href: '/admin', label: 'Przegląd', icon: LayoutDashboard },
    { href: '/admin/nekrologi', label: 'Moderacja nekrologów', icon: Flame },
    { href: '/admin/opinie', label: 'Opinie firm', icon: MessageSquare },
    { href: '/admin/firmy', label: 'Firmy', icon: Building2 },
    { href: '/admin/leady', label: 'Leady', icon: Users },
    { href: '/admin/uzytkownicy', label: 'Użytkownicy', icon: UsersRound },
    { href: '/admin/finanse', label: 'Finanse', icon: Banknote },
    { href: '/admin/ustawienia', label: 'Ustawienia', icon: Settings2 },
  ];

  return (
    <div className="min-h-[calc(100vh-68px)] grid lg:grid-cols-[260px_1fr] bg-cream">
      <aside className="bg-cream-dark/40 border-r border-border-soft lg:min-h-[calc(100vh-68px)] py-6">
        <div className="px-5 mb-6">
          <div className="font-heading text-[15px] leading-tight">
            <div>Polskie Pogrzeby —</div>
            <div className="text-text-secondary">Panel Administratora</div>
          </div>
          {!AUTH_CONFIGURED && (
            <span className="mt-2 inline-block text-[10.5px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              tryb demo
            </span>
          )}
          {user && (
            <div className="mt-2 text-[11.5px] text-text-secondary truncate" title={user.email}>
              {user.email}
            </div>
          )}
        </div>
        <nav className="px-3 space-y-0.5">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-navy/80 hover:bg-white"
            >
              <n.icon className="w-4 h-4" />
              <span className="flex-1">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-5 mt-8 text-[10.5px] text-text-muted">
          <Link href="/" className="hover:underline">← Powrót do strony</Link>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
