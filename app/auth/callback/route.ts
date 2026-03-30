import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { bootstrapOAuthProfile } from '@/lib/auth/bootstrapOAuthProfile';

function safeRedirectPath(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith('/') || nextParam.startsWith('//')) {
    return '/home';
  }
  if (nextParam.includes('://') || nextParam.includes('\\')) {
    return '/home';
  }
  return nextParam;
}

function redirectWithCookies(
  origin: string,
  path: string,
  cookies: { name: string; value: string; options?: CookieOptions }[]
): NextResponse {
  const res = NextResponse.redirect(`${origin}${path}`);
  cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
  return res;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const pendingCookies: { name: string; value: string; options?: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  await bootstrapOAuthProfile(supabase, data.user);

  const { data: prof } = await supabase
    .from('user_profiles')
    .select('onboarding_completed_at')
    .eq('id', data.user.id)
    .maybeSingle();

  const path = !prof?.onboarding_completed_at
    ? '/onboarding'
    : safeRedirectPath(nextParam);

  return redirectWithCookies(origin, path, pendingCookies);
}
