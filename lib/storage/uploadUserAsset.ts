'use client';

import { createClient } from '@/lib/supabase/client';
import { CARD_ASSETS_BUCKET } from '@/lib/storage/constants';
import { pathFromCardAssetPublicUrl } from '@/lib/storage/paths';

export type UserAssetKind = 'card-art' | 'card-texture' | 'statblock-art' | 'profile-avatar';

function extForBlob(blob: Blob): string {
  const t = blob.type || 'image/png';
  if (t.includes('png')) return 'png';
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
  if (t.includes('webp')) return 'webp';
  if (t.includes('gif')) return 'gif';
  return 'png';
}

export async function uploadUserAsset(blob: Blob, kind: UserAssetKind): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Sign in to upload images to storage');

  const ext = extForBlob(blob);
  const path = `${user.id}/${crypto.randomUUID()}-${kind}.${ext}`;
  const contentType = blob.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  const { error } = await supabase.storage.from(CARD_ASSETS_BUCKET).upload(path, blob, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(CARD_ASSETS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Remove object if URL points at our bucket (no-op for data URLs or external URLs). */
export async function removeUserAssetByPublicUrl(url: string | null | undefined): Promise<void> {
  const path = pathFromCardAssetPublicUrl(url);
  if (!path) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  if (path.split('/')[0] !== user.id) return;
  const { error } = await supabase.storage.from(CARD_ASSETS_BUCKET).remove([path]);
  if (error) console.warn('Storage remove failed', error.message);
}
