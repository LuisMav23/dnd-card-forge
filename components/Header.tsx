'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthButton from './AuthButton';
import LogoMark from './LogoMark';
import NotificationBell from './NotificationBell';

export default function Header() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [mobileAuthMount, setMobileAuthMount] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/create', label: 'Create' },
    { href: '/library', label: 'My Library' },
    { href: '/explore', label: 'Explore' },
  ] as const;

  const navIsActive = (href: string) => {
    if (href === '/create') {
      return pathname === '/create' || pathname.startsWith('/create/');
    }
    if (href === '/explore') {
      return pathname === '/explore' || pathname.startsWith('/explore/');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    `block min-h-[44px] w-full px-3 py-3 font-[var(--font-cinzel),serif] text-sm font-semibold tracking-[.06em] uppercase transition-colors sm:min-h-0 sm:py-2.5 sm:text-[0.8rem] dark:font-normal ${
      navIsActive(href)
        ? 'text-gold-dark [text-shadow:none] dark:text-gold dark:[text-shadow:0_0_10px_rgba(201,168,76,.3)]'
        : 'text-ink hover:bg-mid/80 hover:text-gold-dark dark:text-bronze dark:hover:text-gold'
    }`;

  const linkClassDesktop = (href: string) =>
    `whitespace-nowrap font-[var(--font-cinzel),serif] text-xs font-semibold tracking-[.06em] uppercase transition-colors sm:text-[0.8rem] dark:font-normal ${
      navIsActive(href)
        ? 'text-gold-dark [text-shadow:none] dark:text-gold dark:[text-shadow:0_0_10px_rgba(201,168,76,.3)]'
        : 'text-ink hover:text-gold-dark dark:text-bronze dark:hover:text-gold'
    }`;

  return (
    <header className="sticky top-0 z-50 flex flex-shrink-0 flex-col border-b-2 border-gold-dark/90 bg-gradient-to-b from-bg to-mid shadow-[0_1px_0_rgb(0_0_0/0.06)] dark:shadow-none px-3 py-[9px] sm:px-[22px] sm:py-[11px]">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/home"
          className="flex min-w-0 max-w-[min(100%,14rem)] shrink items-center gap-2 rounded-md px-2 py-1.5 font-[var(--font-cinzel),serif] text-[0.95rem] font-black tracking-[.1em] text-gold-dark [text-shadow:none] transition-colors hover:text-gold sm:max-w-none sm:gap-2.5 sm:px-2.5 sm:py-2 sm:text-[1.25rem] sm:tracking-[.12em] dark:text-gold dark:[text-shadow:0_0_18px_rgba(201,168,76,.4)] dark:hover:text-gold-light"
        >
          <LogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
          <span className="truncate">
            <em className="not-italic text-gold dark:text-gold-light">Card Forge</em>
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
          <NotificationBell />
          <AuthButton
            mobileAccountMount={mobileAuthMount}
            onCloseMobileNav={() => setNavOpen(false)}
          />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-bdr-2 bg-panel/90 font-[var(--font-cinzel),serif] text-lg text-gold-dark transition-colors hover:border-gold-dark hover:bg-mid hover:text-gold dark:text-gold dark:hover:text-gold-light lg:hidden"
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
        <div ref={setMobileAuthMount} className="lg:hidden" />
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
