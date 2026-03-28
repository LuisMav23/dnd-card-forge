'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EncounterBuilderForm from '@/components/encounters/EncounterBuilderForm';

export default function NewEncounterPage() {
  const router = useRouter();

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto mb-8 w-full max-w-2xl">
          <Link
            href="/encounters"
            className="font-[var(--font-cinzel),serif] text-xs font-semibold uppercase tracking-wider text-gold-dark hover:text-gold"
          >
            ← Encounters
          </Link>
          <h1 className="mt-4 font-[var(--font-cinzel),serif] text-2xl font-bold text-gold">New encounter</h1>
          <p className="mt-2 text-sm text-bronze">Add stat blocks from your library and how many of each appear in this encounter.</p>
        </div>

        <EncounterBuilderForm
          initialTitle=""
          initialRows={[]}
          submitLabel="Create encounter"
          cancelHref="/encounters"
          onSubmit={async payload => {
            const res = await fetch('/api/encounters', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: payload.title,
                entries: payload.entries,
                thumbnailUrl: payload.thumbnailUrl,
                playerDescription: payload.playerDescription || null,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not create');
            router.push(`/encounters/${data.id}`);
            router.refresh();
          }}
        />
      </main>
    </div>
  );
}
