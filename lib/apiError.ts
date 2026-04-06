import { NextResponse } from 'next/server';

/**
 * Returns a generic 500 JSON response and logs the real error server-side only.
 * Never exposes internal error details (e.g. Supabase schema) to clients.
 */
export function internalError(err: unknown, context: string): NextResponse {
  console.error(`[${context}]`, err);
  return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
}
