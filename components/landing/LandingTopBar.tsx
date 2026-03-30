'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

const linkBtnClass =
  'whitespace-nowrap rounded-md border border-bdr bg-panel/80 px-3 py-2 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold-dark transition-colors hover:border-gold/40 hover:bg-input hover:text-gold sm:text-xs dark:text-bronze dark:hover:text-gold';

export default function LandingTopBar() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!cancelled) {
        setUser(u);
        setReady(true);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <div className="absolute right-4 top-4 z-20 flex flex-wrap items-center justify-end gap-2 sm:right-6 sm:top-6 sm:gap-3">
      <ThemeToggle />
      {!ready ? (
        <span className="h-9 w-20 shrink-0 rounded-md border border-transparent bg-transparent sm:w-24" aria-hidden />
      ) : user ? (
        <Link href="/home" className={linkBtnClass}>
          Home
        </Link>
      ) : (
        <>
          <Link href="/login" className={linkBtnClass}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-gold-dark/70 bg-gold-dark/15 px-3 py-2 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:border-gold hover:bg-gold/10 sm:text-xs"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  );
}
