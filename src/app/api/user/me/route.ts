import { NextResponse } from 'next/server';
import { getUserFromCookies } from '~/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
  }
}