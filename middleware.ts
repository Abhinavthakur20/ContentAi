import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

const PROTECTED_PATHS = ['/generator', '/dashboard', '/ideas', '/scripts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check protected routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const user = await getUserFromRequest(request);

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/generator/:path*', '/dashboard/:path*', '/ideas/:path*', '/scripts/:path*'],
};
