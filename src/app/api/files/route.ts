import { NextResponse } from 'next/server';
import { getUserFromCookies } from '~/lib/auth';
import { getUserFiles, getUserStorageUsed } from '~/lib/storage';
import { env } from '~/env';

export async function GET() {
  try {
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user's files
    const files = await getUserFiles(user.id);
    
    // Get total storage used
    const storageUsed = await getUserStorageUsed(user.id);
    
    // Get storage limit (unlimited for admin)
    const storageLimit = user.is_admin ? Infinity : env.MAX_STORAGE_SIZE_MB * 1024 * 1024;
    
    return NextResponse.json({ 
      files, 
      storageUsed, 
      storageLimit,
      isAdmin: user.is_admin 
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Error fetching files' }, { status: 500 });
  }
}