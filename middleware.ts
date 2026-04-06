import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit, extractIp } from '@/lib/rateLimit';

const PROTECTED_PREFIXES = [
  '/home',
  '/create',
  '/card',
  '/statblocks',
  '/library',
  '/profile',
  '/encounters',
] as const;
/** Logged-in users are redirected away from these (login/signup flows). */
const AUTH_ONLY_PATHS = ['/login', '/signup'] as const;

interface RateLimitRule {
  match: (method: string, pathname: string) => boolean;
  key: string;
  limit: number;
  windowMs: number;
}

const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    match: (method, path) => method === 'POST' && path === '/api/auth/login',
    key: 'login',
    limit: 10,
    windowMs: 15 * 60 * 1000,
  },
  {
    match: (method, path) => method === 'POST' && path === '/api/auth/signup',
    key: 'signup',
    limit: 5,
    windowMs: 60 * 60 * 1000,
  },
  {
    match: (method, path) => method === 'POST' && /^\/api\/explore\/[^/]+\/comments$/.test(path),
    key: 'comments',
    limit: 20,
    windowMs: 60 * 1000,
  },
  {
    match: (method, path) => method === 'POST' && /^\/api\/explore\/[^/]+\/view$/.test(path),
    key: 'view',
    limit: 5,
    windowMs: 10 * 60 * 1000,
  },
  {
    match: (method, path) => method === 'POST' && /^\/api\/explore\/[^/]+\/fork$/.test(path),
    key: 'fork',
    limit: 10,
    windowMs: 60 * 1000,
  },
  {
    match: (method, path) => method === 'PATCH' && /^\/api\/explore\/[^/]+\/reactions$/.test(path),
    key: 'reactions',
    limit: 30,
    windowMs: 60 * 1000,
  },
  {
    match: (method, path) => method === 'POST' && /^\/api\/[^/]+\/[^/]+\/duplicate$/.test(path),
    key: 'duplicate',
    limit: 15,
    windowMs: 60 * 1000,
  },
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((p) => pathname === p);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = extractIp(request);

  // Apply rate limiting rules before session checks
  for (const rule of RATE_LIMIT_RULES) {
    if (rule.match(method, pathname)) {
      const result = rateLimit(`${ip}:${rule.key}`, rule.limit, rule.windowMs);
      if (!result.allowed) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfter),
          },
        });
      }
      break;
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnlyPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
