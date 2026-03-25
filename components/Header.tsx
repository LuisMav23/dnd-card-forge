'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthButton from './AuthButton';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/card', label: 'Card Forge' },
    { href: '/statblocks', label: 'Stat Blocks' },
    { href: '/library', label: 'My Library' },
    { href: '/encounters', label: 'Encounters' },
  ];

  const linkClass = (href: string) =>
    `block min-h-[44px] w-full px-3 py-3 font-[var(--font-cinzel),serif] text-sm tracking-[.06em] uppercase transition-colors sm:min-h-0 sm:py-2.5 sm:text-[0.8rem] ${
      pathname === href
        ? 'text-gold [text-shadow:0_0_10px_rgba(201,168,76,.3)]'
        : 'text-bronze hover:bg-mid/80 hover:text-gold'
    }`;

  const linkClassDesktop = (href: string) =>
    `whitespace-nowrap font-[var(--font-cinzel),serif] text-xs tracking-[.06em] uppercase transition-colors sm:text-[0.8rem] ${
      pathname === href
        ? 'text-gold [text-shadow:0_0_10px_rgba(201,168,76,.3)]'
        : 'text-bronze hover:text-gold'
    }`;

  return (
    <header className="sticky top-0 z-50 flex flex-shrink-0 flex-col border-b-2 border-gold-dark bg-gradient-to-b from-bg to-mid px-3 py-[9px] sm:px-[22px] sm:py-[11px]">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/home"
          className="min-w-0 max-w-[min(100%,11rem)] shrink font-[var(--font-cinzel),serif] text-[0.95rem] font-black tracking-[.1em] text-gold [text-shadow:0_0_18px_rgba(201,168,76,.4)] transition-colors hover:text-gold-light sm:max-w-none sm:text-[1.25rem] sm:tracking-[.12em]"
        >
          <span className="truncate block">
            ⚔ <em className="not-italic text-gold-light">Card Forge</em>
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-4 xl:gap-6 lg:flex"
          aria-label="Main"
        >
          {links.map(l => (
            <Link key={l.href} href={l.href} className={linkClassDesktop(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <AuthButton />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-bdr bg-panel/80 font-[var(--font-cinzel),serif] text-lg text-gold transition-colors hover:border-gold-dark hover:bg-mid hover:text-gold-light lg:hidden"
            aria-expanded={navOpen}
            aria-controls="mobile-main-nav"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setNavOpen(o => !o)}
          >
            {navOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      <nav
        id="mobile-main-nav"
        className={`border-t border-bdr/70 bg-mid/95 lg:hidden ${navOpen ? 'block' : 'hidden'}`}
        aria-hidden={!navOpen}
      >
        <ul className="flex flex-col py-1">
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={linkClass(l.href)} onClick={() => setNavOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
