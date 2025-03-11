import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { loginUser, generateToken } from '~/lib/auth';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parsedBody = loginSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.errors[0].message }, { status: 400 });
    }
    
    const { email, password } = parsedBody.data;
    
    // Authenticate user
    const user = await loginUser(email, password);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Generate JWT token
    const token = generateToken({ userId: user.id });
    
    // Set JWT in HTTP-only cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return NextResponse.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}