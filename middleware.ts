import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

const GUARDED = ['/dashboard', '/projects'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsSession = GUARDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsSession) return NextResponse.next();

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/projects/:path*'] };
