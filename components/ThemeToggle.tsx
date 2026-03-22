'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent"
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-bdr bg-panel/80 text-lg text-gold transition-colors hover:border-gold-dark hover:bg-mid hover:text-gold-light"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
