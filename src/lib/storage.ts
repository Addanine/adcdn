import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../env';
import { query } from './db';

// Create upload directory if it doesn't exist
export async function ensureUploadDir() {
  await fs.ensureDir(env.UPLOAD_DIR);
}

// Get total storage used by a user
export async function getUserStorageUsed(userId: number): Promise<number> {
  try {
    const result = await query(
      'SELECT SUM(file_size) as total_size FROM files WHERE user_id = $1',
      [userId],
    );
    
    return parseInt(result.rows[0]?.total_size || '0', 10);
  } catch (error) {
    console.error('Error getting user storage:', error);
    throw error;
  }
}

// Check if user can upload a file
export async function canUserUploadFile(
  userId: number,
  fileSize: number,
  isAdmin: boolean,
): Promise<boolean> {
  // Admin users have unlimited storage
  if (isAdmin) {
    return true;
  }
  
  // Check against storage limit
  const currentUsage = await getUserStorageUsed(userId);
  const maxSizeBytes = env.MAX_STORAGE_SIZE_MB * 1024 * 1024;
  
  return currentUsage + fileSize <= maxSizeBytes;
}

// Save a file to the storage
export async function saveFile(
  userId: number,
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  fileSize: number,
): Promise<{ publicId: string; filePath: string }> {
  // Generate a unique ID and file path
  const publicId = uuidv4();
  const userDir = path.join(env.UPLOAD_DIR, userId.toString());
  const filePath = path.join(userDir, publicId);
  
  // Create user directory if it doesn't exist
  await fs.ensureDir(userDir);
  
  // Write the file
  await fs.writeFile(filePath, fileBuffer);
  
  // Return metadata
  return { publicId, filePath };
}

// Delete a file from storage
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.remove(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Get file metadata
export async function getFileMetadata(publicId: string) {
  try {
    const result = await query(
      `SELECT f.*, u.username 
       FROM files f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.public_id = $1`,
      [publicId],
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

// Save file metadata to database
export async function saveFileMetadata(
  userId: number,
  filePath: string,
  publicId: string,
  originalFilename: string,
  fileSize: number,
  mimeType: string,
) {
  try {
    const result = await query(
      `INSERT INTO files 
       (user_id, file_path, public_id, original_filename, file_size, mime_type) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, public_id, original_filename, file_size, mime_type, created_at`,
      [userId, filePath, publicId, originalFilename, fileSize, mimeType],
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving file metadata:', error);
    throw error;
  }
}

// Delete file metadata from database
export async function deleteFileMetadata(publicId: string, userId: number) {
  try {
    const result = await query(
      'DELETE FROM files WHERE public_id = $1 AND user_id = $2 RETURNING file_path',
      [publicId, userId],
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].file_path;
  } catch (error) {
    console.error('Error deleting file metadata:', error);
    throw error;
  }
}

// Get all files for a user
export async function getUserFiles(userId: number) {
  try {
    const result = await query(
      `SELECT id, public_id, original_filename, file_size, mime_type, created_at
       FROM files
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting user files:', error);
    throw error;
  }
}