import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
];

// Paths that start with these prefixes are also public
const publicPathPrefixes = [
  '/files/',
  '/api/files/',
  '/_next/',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is public
  if (
    publicPaths.includes(pathname) ||
    publicPathPrefixes.some(prefix => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }
  
  // Check authentication
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify JWT token
  const decoded = verifyToken(token);
  
  if (!decoded) {
    // Redirect to login if token is invalid
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};