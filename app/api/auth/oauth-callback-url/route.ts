import { NextResponse } from 'next/server';
import { resolveOAuthCallbackUrlFromRequest } from '@/lib/auth/oauthCallbackUrl';

/**
 * Returns the OAuth redirect URL for the current deployment / request host.
 * Client uses this so redirectTo matches production even when NEXT_PUBLIC_SITE_URL
 * was not set at build time (e.g. only in local .env).
 */
export async function GET(request: Request) {
  const callbackUrl = resolveOAuthCallbackUrlFromRequest(request);
  return NextResponse.json({ callbackUrl });
}
