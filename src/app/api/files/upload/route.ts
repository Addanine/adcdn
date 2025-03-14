import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '~/lib/auth';
import { saveFile, createShareableLink } from '~/lib/db';

export async function POST(request: NextRequest) {
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
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Get file metadata
    const originalFilename = file.name;
    const mimeType = file.type;
    const sizeBytes = file.size;
    
    // File size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Save file to database
    const fileId = await saveFile(user.id, originalFilename, mimeType, fileBuffer, sizeBytes);
    
    // Create shareable link
    const link = await createShareableLink(fileId);
    
    return NextResponse.json({ 
      success: true,
      fileId,
      fileName: originalFilename,
      shareCode: link.share_code,
      shareLink: `/share/${link.share_code}`
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Set larger request body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};