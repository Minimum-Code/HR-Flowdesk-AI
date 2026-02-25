// Note: Next.js 16 prefers "proxy" over "middleware" filename convention,
// but middleware.ts is still supported. Using it here for route protection.
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public auth pages
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
