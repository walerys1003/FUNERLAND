import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Route protection middleware.
 *
 * - `/panel-firmy/*`   → requires authenticated user with role 'company' or 'admin'
 * - `/panel-rodziny/*` → requires authenticated user (any role)
 * - `/admin/*`         → requires role 'admin'
 *
 * Refreshes Supabase session cookies on every matched request.
 * When Supabase env vars are missing the middleware is a no-op (demo mode).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PROTECTED = [
  { prefix: '/panel-firmy', roles: ['company', 'admin'] },
  { prefix: '/panel-rodziny', roles: ['family', 'company', 'admin'] },
  { prefix: '/admin', roles: ['admin'] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matched = PROTECTED.find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + '/'));
  if (!matched) return NextResponse.next();

  // Demo mode: no Supabase → allow access (so portal still works without auth)
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = new URL('/logowanie', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile?.role as string) || 'family';
  if (!matched.roles.includes(role)) {
    const url = new URL('/logowanie', request.url);
    url.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/panel-firmy/:path*', '/panel-rodziny/:path*', '/admin/:path*'],
};
