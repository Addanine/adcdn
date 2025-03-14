import { NextResponse } from 'next/server';
import { createUser } from '~/lib/db';
import { generateToken } from '~/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    // Create user in database
    const user = await createUser(email, password);
    
    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });
    
    // Set the cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'auth',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error: any) {
    // Check for duplicate email
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}