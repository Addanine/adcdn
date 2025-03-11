import { NextResponse } from 'next/server';
import { getUserFromCookies } from '~/lib/auth';
import { getFileMetadata, deleteFileMetadata, deleteFile, getUserStorageUsed } from '~/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { publicId: string } }
) {
  try {
    const publicId = params.publicId;
    
    // Get file metadata
    const fileMetadata = await getFileMetadata(publicId);
    
    if (!fileMetadata) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    return NextResponse.json({ file: fileMetadata });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Error fetching file' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { publicId: string } }
) {
  try {
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const publicId = params.publicId;
    
    // Delete file metadata and get file path
    const filePath = await deleteFileMetadata(publicId, user.id);
    
    if (!filePath) {
      return NextResponse.json({ 
        error: 'File not found or you do not have permission to delete it' 
      }, { status: 404 });
    }
    
    // Delete the actual file
    await deleteFile(filePath);
    
    // Get updated storage used
    const storageUsed = await getUserStorageUsed(user.id);
    
    return NextResponse.json({ 
      message: 'File deleted successfully',
      storageUsed
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Error deleting file' }, { status: 500 });
  }
}