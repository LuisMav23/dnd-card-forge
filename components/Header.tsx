'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/card', label: 'Card Forge' },
    { href: '/statblocks', label: 'Stat Blocks' },
    { href: '/library', label: 'My Library' },
  ];

  return (
    <header className="sticky top-0 z-50 flex flex-shrink-0 items-center justify-between border-b-2 border-gold-dark bg-gradient-to-b from-bg to-mid px-3 py-[9px] sm:px-[22px] sm:py-[11px]">
      <Link
        href="/home"
        className="font-[var(--font-cinzel),serif] text-[1rem] font-black tracking-[.12em] text-gold [text-shadow:0_0_18px_rgba(201,168,76,.4)] transition-colors hover:text-gold-light sm:text-[1.25rem]"
      >
        ⚔ <em className="not-italic text-gold-light">Card Forge</em>
      </Link>
      <nav className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4 md:gap-6">
        <div className="flex max-w-[min(100%,calc(100vw-8rem))] flex-wrap items-center justify-end gap-x-2 gap-y-1 border-r border-bdr pr-2 sm:max-w-none sm:flex-nowrap sm:gap-x-4 sm:pr-6 md:gap-x-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap font-[var(--font-cinzel),serif] text-xs tracking-[.06em] uppercase transition-colors sm:text-[0.8rem] ${
                pathname === l.href
                  ? 'text-gold [text-shadow:0_0_10px_rgba(201,168,76,.3)]'
                  : 'text-bronze hover:text-gold'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
        <AuthButton />
      </nav>
    </header>
  );
}
