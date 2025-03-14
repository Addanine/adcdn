import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '~/lib/auth';
import { getUserFiles } from '~/lib/db';

export async function GET(request: NextRequest) {
  // Check authentication
  const token = request.cookies.get('auth')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get user's files
    const files = await getUserFiles(user.id);
    
    // Format file data (omit file binary data)
    const formattedFiles = files.map(file => ({
      id: file.id,
      fileName: file.original_filename,
      mimeType: file.mime_type,
      sizeBytes: file.size_bytes,
      uploadTimestamp: file.upload_timestamp,
      shareCode: file.share_code || null,
      shareLink: file.share_code ? `/share/${file.share_code}` : null
    }));
    
    return NextResponse.json({ 
      files: formattedFiles,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}