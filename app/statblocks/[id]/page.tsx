'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { parseStatBlockFromLibraryRow, type LibraryStatBlockRow } from '@/lib/statBlockLoad';
import type { StatBlockState } from '@/lib/statblockTypes';
import Header from '@/components/Header';
import StatBlockWikiView from '@/components/statblocks/StatBlockWikiView';
import RouteSuspenseFallback from '@/components/ui/RouteSuspenseFallback';

function StatBlockDetailInner() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unauthorized'>('loading');
  const [state, setState] = useState<StatBlockState | null>(null);
  const [savedTitle, setSavedTitle] = useState<string>('');

  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const res = await fetch(`/api/cards/${id}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 401) {
          setStatus('unauthorized');
          return;
        }
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const row = (await res.json()) as LibraryStatBlockRow;
        const parsed = parseStatBlockFromLibraryRow(row);
        if (!parsed) {
          setStatus('error');
          return;
        }
        setState(parsed);
        setSavedTitle(row.title || '');
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="page-radial-soft flex min-h-[100dvh] flex-col overflow-x-hidden bg-bg">
      <Header />
      <div className="border-b border-bdr bg-panel/80 px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/library"
            className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark transition-colors hover:text-gold"
          >
            ← Library
          </Link>
          {status === 'ready' && id ? (
            <Link href={`/statblocks?library=${id}`} className="panel-btn text-gold">
              Edit stat block
            </Link>
          ) : null}
        </div>
      </div>

      {status === 'loading' && (
        <p className="py-16 text-center font-[var(--font-cinzel),serif] text-sm text-muted">
          Loading stat block…
        </p>
      )}

      {status === 'unauthorized' && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-parch">Sign in to view this stat block.</p>
          <Link href="/" className="mt-4 inline-block panel-btn">
            Sign in
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-parch">This stat block could not be loaded or is not a valid stat block.</p>
          <Link href="/library" className="mt-4 inline-block panel-btn">
            Back to library
          </Link>
        </div>
      )}

      {status === 'ready' && state && <StatBlockWikiView state={state} savedTitle={savedTitle} />}

      <footer className="mt-auto flex-shrink-0 border-t border-bdr px-3 py-2 text-center font-[var(--font-cinzel),serif] text-[0.7rem] italic leading-snug tracking-wide text-muted sm:text-xs">
        Created by Kurt Andrei Gabriel
      </footer>
    </div>
  );
}

export default function StatBlockDetailPage() {
  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      <StatBlockDetailInner />
    </Suspense>
  );
}
