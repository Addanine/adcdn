import { NextResponse } from 'next/server';
import { getUserFromCookies } from '~/lib/auth';
import { canUserUploadFile, getUserStorageUsed, saveFile, saveFileMetadata, ensureUploadDir } from '~/lib/storage';
import { env } from '~/env';

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Make sure the upload directory exists
    await ensureUploadDir();
    
    // Check if it's a multipart/form-data request
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid request format. Please use multipart/form-data.' }, { status: 400 });
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get file details
    const fileSize = file.size;
    const originalFilename = file.name;
    const mimeType = file.type || 'application/octet-stream';
    
    // Check if user has enough storage space
    const canUpload = await canUserUploadFile(user.id, fileSize, user.is_admin);
    if (!canUpload) {
      return NextResponse.json({ 
        error: 'Storage limit exceeded. Please delete some files or upgrade your account.' 
      }, { status: 400 });
    }
    
    // Convert File to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Save the file to the file system
    const { publicId, filePath } = await saveFile(
      user.id,
      fileBuffer,
      originalFilename,
      mimeType,
      fileSize
    );
    
    // Save file metadata to database
    const fileMetadata = await saveFileMetadata(
      user.id,
      filePath,
      publicId,
      originalFilename,
      fileSize,
      mimeType
    );
    
    // Get updated storage used
    const storageUsed = await getUserStorageUsed(user.id);
    
    // Return the file metadata and updated storage info
    return NextResponse.json({
      message: 'File uploaded successfully',
      file: fileMetadata,
      publicLink: `/files/${publicId}`,
      storageUsed,
      storageLimit: user.is_admin ? Infinity : env.MAX_STORAGE_SIZE_MB * 1024 * 1024
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}