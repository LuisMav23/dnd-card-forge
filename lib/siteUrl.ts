/**
 * Public site origin for metadata, Open Graph, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://cardforge.example.com).
 */
export function getSiteUrlString(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fall through */
    }
  }
  return 'http://localhost:3000';
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrlString());
}
