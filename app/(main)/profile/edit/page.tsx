'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProfilePageSkeleton from '@/components/ui/skeletons/ProfilePageSkeleton';
import { createClient } from '@/lib/supabase/client';
import { notifyProfileChanged } from '@/lib/profileChangedEvent';
import { uploadUserAsset, removeUserAssetByPublicUrl } from '@/lib/storage/uploadUserAsset';

const BIO_MAX = 500;
const AVATAR_SIZE = 400;

type ProfileRow = {
  full_name: string | null;
  birth_date: string | null;
  gender: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string | null;
  favorites_public?: boolean | null;
};

type RecentCreation = {
  id: string;
  title: string;
  item_type: string;
  created_at: string;
  updated_at: string;
};

function fileToSquareJpegBlob(file: File, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unsupported'));
          return;
        }
        const ar = img.width / img.height;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;
        if (ar > 1) {
          sw = img.height;
          sx = (img.width - sw) / 2;
        } else if (ar < 1) {
          sh = img.width;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        cv.toBlob(
          b => {
            if (b) resolve(b);
            else reject(new Error('Could not encode image'));
          },
          'image/jpeg',
          0.88
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favoritesPublic, setFavoritesPublic] = useState(false);
  const [recentCreations, setRecentCreations] = useState<RecentCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState('Save profile');
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace('/login');
        return;
      }
      setMyUserId(user.id);
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile');
        setEmail(data.email ?? user.email ?? null);
        const p = data.profile as ProfileRow;
        if (p) {
          setFullName(p.full_name ?? '');
          setBirthDate(p.birth_date ? String(p.birth_date).slice(0, 10) : '');
          setGender(p.gender ?? '');
          setCountry(p.country ?? '');
          setBio(p.bio ?? '');
          setAvatarUrl(p.avatar_url ?? null);
          setFavoritesPublic(Boolean(p.favorites_public));
        }
        setRecentCreations(Array.isArray(data.recentCreations) ? data.recentCreations : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const persistAvatarUrl = async (url: string | null, previousUrl: string | null) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save avatar');
    const p = data.profile as ProfileRow;
    if (p?.avatar_url !== undefined) setAvatarUrl(p.avatar_url);
    if (previousUrl && previousUrl !== url) await removeUserAssetByPublicUrl(previousUrl);
    notifyProfileChanged();
  };

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    const previousUrl = avatarUrl;
    try {
      const blob = await fileToSquareJpegBlob(file, AVATAR_SIZE);
      const url = await uploadUserAsset(blob, 'profile-avatar');
      setAvatarUrl(url);
      await persistAvatarUrl(url, previousUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Avatar upload failed');
      setAvatarUrl(previousUrl);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  }

  async function handleAvatarRemove() {
    const previousUrl = avatarUrl;
    setAvatarUrl(null);
    setAvatarUploading(true);
    setError(null);
    try {
      await persistAvatarUrl(null, previousUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove avatar');
      setAvatarUrl(previousUrl);
    } finally {
      setAvatarUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bio.length > BIO_MAX) {
      setError(`Bio must be ${BIO_MAX} characters or fewer`);
      return;
    }
    setSaving(true);
    setSaveLabel('Saving…');
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim() || null,
          birth_date: birthDate || null,
          gender: gender.trim() || null,
          country: country.trim() || null,
          bio: bio.trim() || null,
          favorites_public: favoritesPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      notifyProfileChanged();
      setSaveLabel('Saved');
      setTimeout(() => setSaveLabel('Save profile'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaveLabel('Save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
        <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10" role="status" aria-label="Loading profile">
          <span className="sr-only">Loading profile</span>
          <ProfilePageSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:gap-12">
        <div className="min-w-0 flex-1">
          <header className="mb-8">
            <Link
              href={myUserId ? `/users/${myUserId}` : '/home'}
              className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
            >
              ← Public profile
            </Link>
            <p className="mt-4 font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
              Account
            </p>
            <h1 className="mt-2 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold [text-shadow:0_0_20px_rgba(201,168,76,0.2)] sm:text-3xl">
              Edit profile
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-bronze">
              Photo saves when you pick a file. Other details use Save profile.
            </p>
            {myUserId && (
              <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link
                  href={`/users/${myUserId}/followers`}
                  className="text-bronze underline-offset-2 hover:text-gold hover:underline"
                >
                  Followers
                </Link>
                <Link
                  href={`/users/${myUserId}/following`}
                  className="text-bronze underline-offset-2 hover:text-gold hover:underline"
                >
                  Following
                </Link>
                <Link
                  href="/profile/favorites"
                  className="text-bronze underline-offset-2 hover:text-gold hover:underline"
                >
                  Favorites
                </Link>
              </nav>
            )}
          </header>

          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div
              className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-bdr bg-mid shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              style={{ opacity: avatarUploading ? 0.65 : 1 }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-[var(--font-cinzel),serif] text-3xl text-gold-dark/50">
                  ?
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <label className="panel-btn cursor-pointer px-4 py-2 text-xs disabled:opacity-50">
                {avatarUploading ? 'Working…' : 'Change photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={avatarUploading}
                  onChange={e => void handleAvatarFile(e)}
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  className="text-xs text-bronze underline-offset-2 hover:text-red-400 hover:underline"
                  disabled={avatarUploading}
                  onClick={() => void handleAvatarRemove()}
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={e => void handleSubmit(e)}
            className="rounded-xl border border-bdr bg-panel/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] sm:p-8"
          >
            <div className="mb-6 border-b border-bdr/80 pb-6">
              <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                Email
              </label>
              <p className="mt-2 text-sm text-parch">{email ?? '—'}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
                  rows={4}
                  maxLength={BIO_MAX}
                  className="w-full resize-y rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="A few words about you…"
                />
                <p className="text-right text-xs text-muted">
                  {bio.length}/{BIO_MAX}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                  Display name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                  Gender
                </label>
                <input
                  type="text"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="Optional"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full rounded-md border border-bdr bg-mid px-3 py-2 text-sm text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
                  placeholder="Optional"
                  autoComplete="country-name"
                />
              </div>
              <div className="flex items-start gap-3 rounded-md border border-bdr/80 bg-mid/50 px-3 py-3">
                <input
                  id="favorites-public"
                  type="checkbox"
                  checked={favoritesPublic}
                  onChange={e => setFavoritesPublic(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-bdr text-gold focus:ring-gold/30"
                />
                <label htmlFor="favorites-public" className="cursor-pointer text-sm leading-snug text-parch">
                  <span className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.12em] text-gold-dark">
                    Public favorites
                  </span>
                  <span className="mt-1 block text-bronze">
                    When enabled, visitors to your public profile can see Explore items you saved (♥). You always see
                    your own favorites.
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`btn-finish mt-6 w-full ${saving ? 'btn-loading' : ''}`}
            >
              {saveLabel}
            </button>
          </form>
        </div>

        <aside className="w-full shrink-0 lg:max-w-sm">
          <h2 className="font-[var(--font-cinzel),serif] text-lg font-semibold tracking-wide text-gold">
            Recent creations
          </h2>
          <p className="mt-1 text-sm text-bronze">Latest updates from your library.</p>
          {recentCreations.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-bdr/80 bg-panel/40 p-6 text-center">
              <p className="text-sm text-bronze">No saves yet.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/create"
                  className="panel-btn border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
                >
                  Create
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-3">
              {recentCreations.map(c => {
                const href =
                  c.item_type === 'card'
                    ? `/card/${c.id}`
                    : `/statblocks/${c.id}`;
                const label = c.item_type === 'card' ? 'Card' : 'Stat block';
                return (
                  <li key={c.id}>
                    <Link
                      href={href}
                      className="flex flex-col rounded-lg border border-bdr bg-gradient-to-b from-panel to-mid/90 p-4 transition-colors hover:border-gold/35"
                    >
                      <span className="font-[var(--font-cinzel),serif] text-sm font-semibold text-gold">
                        {c.title || 'Untitled'}
                      </span>
                      <span className="mt-1 text-xs text-muted">
                        {label}
                        {' · '}
                        {new Date(c.updated_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}
