import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/employee', '/hr', '/admin', '/super-admin']
const TOKEN_KEY = 'hr_flowdesk_token'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected) return NextResponse.next()

  const hasSession = request.cookies.has(TOKEN_KEY)
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/employee/:path*', '/hr/:path*', '/admin/:path*', '/super-admin/:path*'],
}
