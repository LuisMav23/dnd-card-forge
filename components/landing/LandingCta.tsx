'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export default function LandingCta() {
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

  if (!ready) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="h-11 w-full max-w-xs animate-pulse rounded-md bg-mid/80 sm:max-w-[11rem]" />
        <div className="h-11 w-full max-w-xs animate-pulse rounded-md bg-mid/60 sm:max-w-[11rem]" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/home" className="panel-btn min-w-[11rem] justify-center text-gold">
          Open Card Forge
        </Link>
        <Link
          href="/explore"
          className="panel-btn min-w-[11rem] justify-center border-bdr bg-transparent text-gold-dark hover:bg-input hover:text-gold"
        >
          Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Link href="/signup" className="panel-btn min-w-[11rem] justify-center text-gold">
        Create your account
      </Link>
      <Link
        href="/login"
        className="panel-btn min-w-[11rem] justify-center border-bdr bg-transparent text-gold-dark hover:bg-input hover:text-gold"
      >
        Sign in
      </Link>
    </div>
  );
}
