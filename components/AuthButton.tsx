'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (user) {
    return (
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link
          href="/profile"
          className="whitespace-nowrap font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-bronze transition-colors hover:text-gold sm:text-sm"
        >
          Profile
        </Link>
        <span className="hidden max-w-[140px] truncate text-xs text-bronze sm:inline-block md:max-w-[220px]">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="whitespace-nowrap font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-bronze transition-colors hover:text-red-400 sm:text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/"
      className="whitespace-nowrap font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-gold transition-colors hover:text-gold-light sm:text-sm"
    >
      Sign in
    </Link>
  );
}
