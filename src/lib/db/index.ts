import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { hash, compare } from 'bcrypt';
import { env } from '~/env';

// Database connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// User management
export async function createUser(email: string, password: string) {
  const passwordHash = await hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
}

export async function verifyUser(email: string, password: string) {
  const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) return null;
  
  const user = result.rows[0];
  const passwordValid = await compare(password, user.password_hash);
  if (!passwordValid) return null;
  
  return { id: user.id, email: user.email };
}

// File management
export async function saveFile(userId: string, filename: string, mimeType: string, data: Buffer, sizeBytes: number) {
  const result = await pool.query(
    'INSERT INTO files (user_id, original_filename, mime_type, file_data, size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [userId, filename, mimeType, data, sizeBytes]
  );
  return result.rows[0].id;
}

export async function getUserFiles(userId: string) {
  const result = await pool.query(
    `SELECT f.id, f.original_filename, f.mime_type, f.size_bytes, f.upload_timestamp, 
     l.share_code, l.id as link_id
     FROM files f
     LEFT JOIN links l ON f.id = l.file_id
     WHERE f.user_id = $1
     ORDER BY f.upload_timestamp DESC`,
    [userId]
  );
  return result.rows;
}

export async function deleteFile(fileId: string, userId: string) {
  const result = await pool.query(
    'DELETE FROM files WHERE id = $1 AND user_id = $2 RETURNING id',
    [fileId, userId]
  );
  return result.rows.length > 0;
}

// Link management
export async function createShareableLink(fileId: string) {
  // Generate a short, unique code (first 8 chars of a UUID, should be unique enough for this purpose)
  const shareCode = randomUUID().replace(/-/g, '').substring(0, 8);
  
  const result = await pool.query(
    'INSERT INTO links (file_id, share_code) VALUES ($1, $2) RETURNING id, share_code',
    [fileId, shareCode]
  );
  return result.rows[0];
}

// Get a file by ID
export async function getFileById(fileId: string) {
  const result = await pool.query(
    'SELECT id, original_filename, mime_type, file_data, size_bytes FROM files WHERE id = $1',
    [fileId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getFileByShareCode(shareCode: string) {
  const result = await pool.query(
    `SELECT f.id, f.original_filename, f.mime_type, f.file_data, f.size_bytes 
     FROM files f
     JOIN links l ON f.id = l.file_id
     WHERE l.share_code = $1`,
    [shareCode]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}