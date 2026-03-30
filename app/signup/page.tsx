'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LogoMark from '@/components/LogoMark';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !birthDate || !gender || !country) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          birthDate,
          gender,
          country,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // If email confirmation is required, Supabase returns no session—onboarding needs an authenticated session.
      if (!data.session) {
        setError(
          'Check your email to confirm your account, then sign in. You can complete preferences in onboarding after your first login.'
        );
        return;
      }

      router.push('/onboarding');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-hero-gradient relative flex min-h-screen flex-col overflow-y-auto bg-bg px-3 py-8 sm:px-4 sm:py-14">
      <div className="auth-page-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4">
        <div className="rounded-xl border border-bdr bg-panel/95 p-5 shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex justify-center text-gold-dark dark:text-gold">
              <LogoMark className="h-14 w-14 sm:h-16 sm:w-16" />
            </div>
            <p className="mb-2 font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.35em] text-gold-dark">
              Begin your journey
            </p>
            <h1 className="font-[var(--font-cinzel),serif] text-2xl font-black tracking-[0.12em] text-gold [text-shadow:0_0_24px_rgba(201,168,76,0.35)] sm:text-3xl">
              Join the Forge
            </h1>
            <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
            <p className="mt-4 font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark">
              Create your account
            </p>
          </div>

          <div className="mb-4 flex flex-col gap-4 text-parch">
            <GoogleSignInButton />
            <div className="relative my-1 flex items-center gap-3">
              <div className="h-px flex-1 bg-bdr/60" aria-hidden />
              <span className="shrink-0 font-[var(--font-cinzel),serif] text-[0.65rem] uppercase tracking-[0.2em] text-gold-dark">
                Or continue with email
              </span>
              <div className="h-px flex-1 bg-bdr/60" aria-hidden />
            </div>
          </div>
          <form onSubmit={handleSignup} className="flex flex-col gap-4 text-parch">
            <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="rounded-md border border-bdr bg-mid px-4 py-3 text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="rounded-md border border-bdr bg-mid px-4 py-3 text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <div className="my-2 border-t border-bdr pt-2">
              <p className="text-xs italic text-gold-dark">Profile information</p>
            </div>

            <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark" htmlFor="fullName">
              Full name / alias
            </label>
            <input
              id="fullName"
              className="rounded-md border border-bdr bg-mid px-4 py-3 text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              type="text"
              name="fullName"
              placeholder="Drizzt Do'Urden"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />

            <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark" htmlFor="birthDate">
              Birth date
            </label>
            <input
              id="birthDate"
              className="rounded-md border border-bdr bg-mid px-4 py-3 text-parch focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              type="date"
              name="birthDate"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              required
            />

            <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark" htmlFor="gender">
              Gender / pronouns
            </label>
            <select
              id="gender"
              className="rounded-md border border-bdr bg-mid px-4 py-3 text-parch focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              name="gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              required
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="They/Them">They/Them</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </select>

            <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark" htmlFor="country">
              Country
            </label>
            <input
              id="country"
              className="rounded-md border border-bdr bg-mid px-4 py-3 text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
              type="text"
              name="country"
              placeholder="e.g. United States"
              value={country}
              onChange={e => setCountry(e.target.value)}
              required
            />

            <div className="mt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="panel-btn w-full justify-center disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Sign Up'}
              </button>

              <Link
                href="/login"
                className="panel-btn w-full justify-center border-bdr bg-transparent text-gold-dark hover:bg-input hover:text-gold"
              >
                Back to login
              </Link>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-2 rounded-md border border-red-800/80 bg-red-950/50 p-3 text-center text-sm text-red-200"
              >
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
