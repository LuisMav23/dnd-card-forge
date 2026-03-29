import { CARD_ASSETS_BUCKET } from '@/lib/storage/constants';

/** Extract storage object path from a public URL, or null if not our bucket / data URL. */
export function pathFromCardAssetPublicUrl(url: string | null | undefined): string | null {
  if (!url || url.startsWith('data:')) return null;
  const marker = `/object/public/${CARD_ASSETS_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  try {
    return decodeURIComponent(url.slice(i + marker.length));
  } catch {
    return null;
  }
}

/** Collect removable storage paths from saved card JSON (card forge). */
export function storagePathsFromCardData(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  const paths: string[] = [];
  for (const key of ['image', 'backgroundTexture', 'backImage'] as const) {
    const p = pathFromCardAssetPublicUrl(typeof d[key] === 'string' ? (d[key] as string) : null);
    if (p) paths.push(p);
  }
  return paths;
}

/** Stat block JSON uses `image` only. */
export function storagePathsFromStatblockData(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;
  const p = pathFromCardAssetPublicUrl(typeof d.image === 'string' ? d.image : null);
  return p ? [p] : [];
}

export function storagePathsFromLibraryCardRow(itemType: string, data: unknown): string[] {
  if (itemType === 'statblock') return storagePathsFromStatblockData(data);
  return storagePathsFromCardData(data);
}

/** Storage path only if URL is in our bucket under the given user prefix. */
export function ownedCardAssetStoragePath(url: string | null | undefined, userId: string): string | null {
  const p = pathFromCardAssetPublicUrl(url);
  if (!p) return null;
  const prefix = `${userId}/`;
  return p.startsWith(prefix) ? p : null;
}
