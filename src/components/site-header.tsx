'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './logo';
import { Phone, Menu, X, User } from 'lucide-react';

const navItems = [
  { href: '/warszawa/zaklady-pogrzebowe', label: 'Znajdź firmę' },
  { href: '/kalkulator', label: 'Kalkulator kosztów' },
  { href: '/nekrologi', label: 'Nekrologi' },
  { href: '/poradnik', label: 'Poradnik' },
  { href: '/dla-firm', label: 'Dla firm' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-border-soft">
      <div className="container-page flex items-center justify-between h-[68px]">
        <Logo />
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[14.5px] text-navy/85 hover:text-accent-green transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/konto"
            className="inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-navy"
            title="Moje konto"
          >
            <User className="w-4 h-4" />
            Moje konto
          </Link>
          <Link href="/logowanie" className="text-[14px] text-text-secondary hover:text-navy">
            Logowanie
          </Link>
          <a
            href="tel:+48800123456"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-btn border border-border-line text-[14px] text-navy hover:bg-white transition"
          >
            <Phone className="w-4 h-4" />
            800 123 456
          </a>
        </div>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border-soft bg-cream">
          <div className="container-page py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2.5 text-navy/85"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="divider-soft my-2" />
            <Link href="/konto" className="py-2.5 text-text-secondary inline-flex items-center gap-2" onClick={() => setOpen(false)}>
              <User className="w-4 h-4" />
              Moje konto
            </Link>
            <Link href="/logowanie" className="py-2.5 text-text-secondary" onClick={() => setOpen(false)}>
              Logowanie
            </Link>
            <a href="tel:+48800123456" className="py-2.5 flex items-center gap-2 text-navy">
              <Phone className="w-4 h-4" /> 800 123 456
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
