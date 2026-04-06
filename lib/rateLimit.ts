/**
 * Sliding-window in-memory rate limiter for Next.js Edge middleware.
 * Keyed by `${ip}:${routeGroup}`. Works per-edge-region on Vercel.
 * For multi-region production scale, swap the store for Upstash Redis.
 */

interface RateLimitStore {
  timestamps: number[];
}

const store = new Map<string, RateLimitStore>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest request in the window expires. */
  retryAfter: number;
}

/**
 * @param key      Unique key (e.g. `${ip}:login`)
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    store.set(key, entry);
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true, retryAfter: 0 };
}

export function extractIp(request: { headers: { get: (name: string) => string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
