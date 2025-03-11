import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function GET() {
  // Clear the auth cookie
  cookies().set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Expire immediately
  });
  
  // Redirect to home page
  return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
}