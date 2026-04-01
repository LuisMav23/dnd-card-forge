/**
 * Builds Supabase OAuth `redirectTo` from the actual HTTP request.
 * Vercel sets x-forwarded-host / x-forwarded-proto at runtime (not build time), so this fixes
 * redirects to localhost when NEXT_PUBLIC_SITE_URL was missing at `next build`.
 */
export function resolveOAuthCallbackUrlFromRequest(request: Request): string {
  const hostHeader =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.trim();

  if (hostHeader) {
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const isLocalHost =
      hostHeader.startsWith('localhost') || hostHeader.startsWith('127.0.0.1');
    const proto = forwardedProto || (isLocalHost ? 'http' : 'https');
    return `${proto}://${hostHeader}/auth/callback`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}/auth/callback`;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      return `${new URL(site).origin}/auth/callback`;
    } catch {
      /* fall through */
    }
  }

  return 'http://localhost:3000/auth/callback';
}
