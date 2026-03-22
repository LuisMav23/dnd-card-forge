import { createClient } from '@/lib/supabase/server';
import { CARD_ASSETS_BUCKET } from '@/lib/storage/constants';

export async function removeStorageObjectsServer(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(CARD_ASSETS_BUCKET).remove(paths);
  if (error) console.warn('Storage cleanup on delete:', error.message);
}
