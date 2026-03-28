/**
 * Remote http(s) images need crossOrigin="anonymous" so canvas / html2canvas can read pixels for PNG export.
 * Omit for data:, blob:, and relative URLs (same origin as the app).
 */
export function crossOriginForImgSrc(src: string | null | undefined): 'anonymous' | undefined {
  if (src == null) return undefined;
  const s = src.trim();
  if (!s) return undefined;
  if (s.startsWith('data:') || s.startsWith('blob:')) return undefined;
  if (s.startsWith('http://') || s.startsWith('https://')) return 'anonymous';
  return undefined;
}
