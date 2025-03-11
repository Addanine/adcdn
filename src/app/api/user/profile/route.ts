import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromCookies, updateUsername } from '~/lib/auth';

// Input validation schema
const profileSchema = z.object({
  username: z.string().min(1, 'Username is required').max(255, 'Username is too long'),
});

export async function PUT(request: Request) {
  try {
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const parsedBody = profileSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.errors[0].message }, { status: 400 });
    }
    
    const { username } = parsedBody.data;
    
    // Update username
    const updatedUser = await updateUsername(user.id, username);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle duplicate username
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: 'This username is already taken' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}