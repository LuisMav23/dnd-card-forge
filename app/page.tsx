'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LogoMark from '@/components/LogoMark';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/home');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-hero-gradient relative flex min-h-screen flex-col overflow-y-auto bg-bg px-4 py-10 sm:py-14">
      <div className="auth-page-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-xl border border-bdr bg-panel/95 p-8 shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex justify-center text-gold-dark dark:text-gold">
              <LogoMark className="h-14 w-14 sm:h-16 sm:w-16" />
            </div>
            <p className="mb-2 font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.35em] text-gold-dark">
              Welcome back
            </p>
            <h1 className="font-[var(--font-cinzel),serif] text-2xl font-black tracking-[0.12em] text-gold [text-shadow:0_0_24px_rgba(201,168,76,0.35)] sm:text-3xl">
              Card Forge
            </h1>
            <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent opacity-80" />
            <p className="mt-4 font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.2em] text-gold-dark">
              Sign in to continue
            </p>
          </div>

          <div className="flex flex-col gap-4 text-parch">
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
            <div className="relative">
              <input
                id="password"
                className="w-full rounded-md border border-bdr bg-mid py-3 pl-4 pr-[4.5rem] text-parch placeholder:text-placeholder/90 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/20"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 font-[var(--font-cinzel),serif] text-[0.65rem] font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:bg-bdr/40 hover:text-gold"
                onClick={() => setShowPassword(v => !v)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAuth}
                disabled={loading}
                className="panel-btn w-full justify-center disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? 'Processing…' : 'Sign In'}
              </button>

              <Link
                href="/signup"
                className="panel-btn w-full justify-center border-bdr bg-transparent text-gold-dark hover:bg-input hover:text-gold"
              >
                Need an account? Sign Up
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
          </div>
        </div>
      </div>
    </div>
  );
}
