'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/card', label: 'Card Forge' },
    { href: '/statblocks', label: 'Stat Blocks' },
  ];

  return (
    <header className="bg-gradient-to-b from-[#040300] to-mid border-b-2 border-gold-dark px-3 sm:px-[22px] py-[9px] sm:py-[11px] flex items-center justify-between flex-shrink-0 z-50">
      <Link href="/" className="font-[var(--font-cinzel),serif] text-[1rem] sm:text-[1.25rem] font-black text-gold tracking-[.12em] [text-shadow:0_0_18px_rgba(201,168,76,.4)] hover:text-gold-light transition-colors">
        ⚔ D&D <em className="text-gold-light not-italic">Card Forge</em>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`font-[var(--font-cinzel),serif] text-[.58rem] sm:text-[.68rem] tracking-[.08em] uppercase transition-colors ${
              pathname === l.href
                ? 'text-gold [text-shadow:0_0_10px_rgba(201,168,76,.3)]'
                : 'text-gold-dark hover:text-gold'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
