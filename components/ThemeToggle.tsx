'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';

type ThemeToggleProps = {
  /** Icon button (header) vs full-width account menu row */
  variant?: 'icon' | 'menuitem';
  /** Called after theme change (e.g. close account menu) */
  onMenuThemeChange?: () => void;
};

export default function ThemeToggle({ variant = 'icon', onMenuThemeChange }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === 'menuitem') {
      return (
        <div
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5"
          aria-hidden
        >
          <span className="font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-muted/60">
            Dark mode
          </span>
          <span className="inline-flex h-6 w-11 shrink-0 rounded-full bg-bdr/50 px-0.5 opacity-60" />
        </div>
      );
    }
    return (
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const next = () => {
    setTheme(isDark ? 'light' : 'dark');
    onMenuThemeChange?.();
  };

  if (variant === 'menuitem') {
    return (
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={isDark}
        aria-label={label}
        onClick={next}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-ink transition-colors hover:bg-mid hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel dark:text-bronze dark:hover:text-gold"
      >
        <span>Dark mode</span>
        <span
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
            isDark
              ? 'justify-end border-gold-dark/60 bg-gold/25'
              : 'justify-start border-bdr bg-mid/90'
          }`}
          aria-hidden
        >
          <span className="pointer-events-none block h-[1.125rem] w-[1.125rem] rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.35)] ring-1 ring-gold-dark/40" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={next}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-bdr-2 bg-panel/90 text-lg text-gold-dark transition-colors hover:border-gold-dark hover:bg-mid hover:text-gold dark:border-bdr dark:text-gold dark:hover:text-gold-light"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
