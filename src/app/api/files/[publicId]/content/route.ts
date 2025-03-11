import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { getFileMetadata } from '~/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const publicId = params.publicId;
    const download = request.nextUrl.searchParams.get('download') === 'true';
    
    // Get file metadata
    const fileMetadata = await getFileMetadata(publicId);
    
    if (!fileMetadata) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read the file from the file system
    const fileBuffer = await fs.readFile(fileMetadata.file_path);
    
    // Set the appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileMetadata.mime_type);
    
    // Set Content-Disposition header depending on if it's a download or not
    if (download) {
      headers.set(
        'Content-Disposition', 
        `attachment; filename="${encodeURIComponent(fileMetadata.original_filename)}"`
      );
    } else {
      headers.set(
        'Content-Disposition', 
        `inline; filename="${encodeURIComponent(fileMetadata.original_filename)}"`
      );
    }
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Error serving file' }, { status: 500 });
  }
}