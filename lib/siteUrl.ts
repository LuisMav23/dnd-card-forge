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

/**
 * OAuth return URL for Supabase `signInWithOAuth` `redirectTo`.
 * Prefer NEXT_PUBLIC_SITE_URL in production builds so redirects match your deployed origin
 * (avoids Supabase falling back to Dashboard "Site URL" when allowlists or proxies disagree).
 */
export function getOAuthCallbackUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) {
    try {
      return `${new URL(env).origin}/auth/callback`;
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'http://localhost:3000/auth/callback';
}
