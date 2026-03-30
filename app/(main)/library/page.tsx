import LibraryView from '@/components/LibraryView';
import { ensureLibrarySystemFolders } from '@/lib/ensureLibrarySystemFolders';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  await ensureLibrarySystemFolders(supabase, user.id);

  const [foldersRes, cardsRes, encountersRes] = await Promise.all([
    supabase.from('folders').select('*').order('created_at', { ascending: false }),
    supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('encounters')
      .select('id, title, created_at, updated_at, folder_id, thumbnail_url, encounter_entries ( id )')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ]);

  const initialEncounters = (encountersRes.data ?? []).map(
    (r: {
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      folder_id: string | null;
      thumbnail_url: string | null;
      encounter_entries: { id: string }[] | null;
    }) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      updated_at: r.updated_at,
      folder_id: r.folder_id,
      thumbnail_url: r.thumbnail_url?.trim() ? r.thumbnail_url.trim() : null,
      entry_count: Array.isArray(r.encounter_entries) ? r.encounter_entries.length : 0,
    })
  );

  return (
    <div className="page-radial-soft flex min-h-0 flex-1 flex-col bg-bg">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8 sm:py-10">
        <header className="mb-8 max-w-4xl">
          <p className="font-[var(--font-cinzel),serif] text-xs uppercase tracking-[0.28em] text-gold-dark">
            Collection
          </p>
          <h1 className="mt-2 font-[var(--font-cinzel),serif] text-2xl font-black tracking-wide text-gold [text-shadow:0_0_20px_rgba(201,168,76,0.2)] sm:text-3xl">
            My Library
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-bronze">
            Organize cards, stat blocks, and encounters into folders. Drag items to move them, or use the menu on each tile for edit, move, or delete.
          </p>
        </header>
        <LibraryView
          initialFolders={foldersRes.data || []}
          initialCards={cardsRes.data || []}
          initialEncounters={initialEncounters}
        />
      </main>
    </div>
  );
}
