import Header from '@/components/Header';
import LibraryView from '@/components/LibraryView';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const [foldersRes, cardsRes] = await Promise.all([
    supabase.from('folders').select('*').order('created_at', { ascending: false }),
    supabase.from('cards').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <div className="page-radial-soft flex min-h-screen flex-col bg-bg">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <header className="mb-8 max-w-4xl">
          <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
            Collection
          </p>
          <h1 className="mt-2 font-[var(--font-cinzel),serif] text-3xl font-black tracking-wide text-gold [text-shadow:0_0_20px_rgba(201,168,76,0.2)]">
            My Library
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-bronze">
            Organize saves into folders, drag items to move them, and open anything in the forge with one click.
          </p>
        </header>
        <LibraryView initialFolders={foldersRes.data || []} initialCards={cardsRes.data || []} />
      </main>
    </div>
  );
}
