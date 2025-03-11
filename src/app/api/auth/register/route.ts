import { NextResponse } from 'next/server';
import { z } from 'zod';
import { registerUser } from '~/lib/auth';

// Input validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parsedBody = registerSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.errors[0].message }, { status: 400 });
    }
    
    const { email, password } = parsedBody.data;
    
    // Register the user
    const user = await registerUser(email, password);
    
    return NextResponse.json({ message: 'User registered successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: 'This email is already registered' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}