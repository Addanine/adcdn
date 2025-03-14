import { NextResponse } from 'next/server';
import { getFileByShareCode } from '~/lib/db';

export async function POST(request: Request) {
  try {
    // Get share code from request
    const { shareCode } = await request.json();
    
    if (!shareCode) {
      return NextResponse.json({ error: 'Share code is required' }, { status: 400 });
    }
    
    // Get file by share code
    const file = await getFileByShareCode(shareCode);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Create response with file data
    const response = new NextResponse(file.file_data);
    
    // Set appropriate headers
    response.headers.set('Content-Type', file.mime_type);
    response.headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_filename)}"`);
    response.headers.set('Content-Length', file.size_bytes.toString());
    
    return response;
  } catch (error) {
    console.error('Error retrieving shared file:', error);
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}

// For file info without downloading
export async function OPTIONS(request: Request) {
  try {
    // Get share code from request
    const body = await request.json();
    const { shareCode } = body;
    
    if (!shareCode) {
      return NextResponse.json({ error: 'Share code is required' }, { status: 400 });
    }
    
    // Get file by share code (without returning the actual file data)
    const file = await getFileByShareCode(shareCode);
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Return file metadata
    return NextResponse.json({
      fileName: file.original_filename,
      mimeType: file.mime_type,
      sizeBytes: file.size_bytes
    });
  } catch (error) {
    console.error('Error retrieving file info:', error);
    return NextResponse.json({ error: 'Failed to retrieve file info' }, { status: 500 });
  }
}