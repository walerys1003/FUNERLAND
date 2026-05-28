import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  Calendar,
  Receipt,
  BarChart3,
  Settings2,
  HelpCircle,
  UserCog,
} from 'lucide-react';

const nav = [
  { href: '/panel-firmy', label: 'Pulpit', icon: LayoutDashboard },
  { href: '/panel-firmy/wiadomosci', label: 'Wiadomości', icon: MessageSquare },
  { href: '/panel-firmy/leady', label: 'Leady', icon: ClipboardList, badge: '3 nowe' },
  { href: '/panel-firmy/kalendarz', label: 'Kalendarz', icon: Calendar },
  { href: '/panel-firmy/faktury', label: 'Faktury', icon: Receipt },
  { href: '/panel-firmy/rankingi', label: 'Rankingi', icon: BarChart3 },
  { href: '/panel-firmy/profil', label: 'Edycja profilu firmy', icon: UserCog },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-68px)] grid lg:grid-cols-[260px_1fr] bg-cream">
      <aside className="bg-navy-deep text-white/85 lg:min-h-[calc(100vh-68px)] flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/30">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 3c-2.5 3 -4 6 -4 9a4 4 0 0 0 8 0c0 -3 -1.5 -6 -4 -9z" />
                <path d="M12 14v7" />
                <path d="M9 21h6" />
              </svg>
            </span>
            <div className="font-heading leading-tight">
              <div className="font-semibold">Polskie</div>
              <div className="font-semibold -mt-1">Pogrzeby</div>
            </div>
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-0.5">
          {nav.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] ${
                i === 0
                  ? 'bg-accent-green text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              <n.icon className="w-4 h-4" />
              <span className="flex-1">{n.label}</span>
              {n.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error/90 text-white">
                  {n.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 mt-4 space-y-0.5">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/75 hover:bg-white/5"
          >
            <HelpCircle className="w-4 h-4" /> Pomoc
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-white/75 hover:bg-white/5"
          >
            <Settings2 className="w-4 h-4" /> Ustawienia
          </Link>
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-white/15" />
            <div className="text-[12.5px] leading-tight">
              <div className="text-white">Zakład Pogrzebowy</div>
              <div className="text-white/65">Kalla</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="p-6 md:p-10 overflow-x-auto">{children}</div>
    </div>
  );
}
