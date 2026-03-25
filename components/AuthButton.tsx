'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { PROFILE_CHANGED_EVENT } from '@/lib/profileChangedEvent';

function getDisplayNameFromAuth(user: User): string {
  const meta = user.user_metadata;
  if (typeof meta?.full_name === 'string' && meta.full_name.trim()) return meta.full_name.trim();
  if (typeof meta?.name === 'string' && meta.name.trim()) return meta.name.trim();
  const email = user.email || '';
  const local = email.split('@')[0];
  return local || 'Account';
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || '?';
}

function avatarUrlFromUser(user: User): string | null {
  const meta = user.user_metadata;
  const fromMeta =
    (typeof meta?.avatar_url === 'string' && meta.avatar_url.trim()) ||
    (typeof meta?.picture === 'string' && meta.picture.trim());
  if (fromMeta) return fromMeta;

  const idData = user.identities?.[0]?.identity_data;
  if (idData && typeof idData === 'object') {
    const d = idData as Record<string, unknown>;
    const a = d.avatar_url ?? d.picture;
    if (typeof a === 'string' && a.trim()) return a.trim();
  }
  return null;
}

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileFullName, setProfileFullName] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      setProfileAvatarUrl(null);
      setProfileFullName(null);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          profile?: { avatar_url?: string | null; full_name?: string | null };
        };
        const p = data.profile;
        if (cancelled) return;
        const av = p?.avatar_url;
        setProfileAvatarUrl(typeof av === 'string' && av.trim() ? av.trim() : null);
        const fn = p?.full_name;
        setProfileFullName(typeof fn === 'string' && fn.trim() ? fn.trim() : null);
      } catch {
        if (!cancelled) {
          setProfileAvatarUrl(null);
          setProfileFullName(null);
        }
      }
    };

    void loadProfile();

    const onProfileChanged = () => {
      void loadProfile();
    };
    window.addEventListener(PROFILE_CHANGED_EVENT, onProfileChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_CHANGED_EVENT, onProfileChanged);
    };
  }, [user]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user, profileAvatarUrl]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (user) {
    const displayName = profileFullName || getDisplayNameFromAuth(user);
    const initials = getInitials(displayName);
    const profileAv = profileAvatarUrl?.trim();
    const avatarUrl = profileAv || avatarUrlFromUser(user);

    return (
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          className="flex max-w-[min(100vw-8rem,14rem)] items-center gap-2 rounded-lg border border-bdr bg-panel/80 py-1 pl-1 pr-2.5 transition-colors hover:border-gold-dark/60 hover:bg-mid sm:max-w-[16rem] sm:pr-3"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-controls="user-account-menu"
          id="user-account-trigger"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-bdr bg-mid">
            {avatarUrl && !avatarLoadFailed ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-[var(--font-cinzel),serif] text-xs font-bold text-gold">
                {initials}
              </span>
            )}
          </span>
          <span className="min-w-0 truncate text-left font-[var(--font-cinzel),serif] text-[0.7rem] font-semibold tracking-wide text-bronze sm:text-xs">
            {displayName}
          </span>
          <span className="shrink-0 text-[0.6rem] text-muted" aria-hidden>
            {menuOpen ? '▲' : '▼'}
          </span>
        </button>

        {menuOpen ? (
          <div
            id="user-account-menu"
            role="menu"
            aria-labelledby="user-account-trigger"
            className="absolute right-0 z-[60] mt-1.5 min-w-[12rem] max-w-[min(calc(100vw-1.5rem),18rem)] rounded-lg border border-bdr bg-panel py-1 shadow-lg"
          >
            {user.email ? (
              <p className="border-b border-bdr/80 px-3 py-2 font-[Georgia,serif] text-[0.7rem] leading-snug text-muted">
                {user.email}
              </p>
            ) : null}
            <Link
              href="/profile"
              role="menuitem"
              className="block px-3 py-2.5 font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-bronze transition-colors hover:bg-mid hover:text-gold"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2.5 text-left font-[var(--font-cinzel),serif] text-xs tracking-[.08em] uppercase text-bronze transition-colors hover:bg-mid hover:text-red-400"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        ) : null}
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
