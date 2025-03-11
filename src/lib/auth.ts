import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { env } from '../env';
import { query } from './db';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// JWT token handling
export function generateToken(payload: object): string {
  return sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): any {
  try {
    return verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// User authentication
export async function registerUser(email: string, password: string) {
  try {
    const hashedPassword = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword],
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const result = await query(
      'SELECT id, email, password, username, is_admin FROM users WHERE email = $1',
      [email],
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const passwordValid = await comparePassword(password, user.password);
    
    if (!passwordValid) {
      return null;
    }
    
    // Don't include password in the returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

export async function updateUsername(userId: number, username: string) {
  try {
    const result = await query(
      'UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, username, is_admin',
      [username, userId],
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
}

// Server-side auth
export function getAuthFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

export async function getUserFromCookies() {
  const decoded = getAuthFromCookies();
  
  if (!decoded || !decoded.userId) {
    return null;
  }
  
  try {
    const result = await query(
      'SELECT id, email, username, is_admin FROM users WHERE id = $1',
      [decoded.userId],
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user from cookies:', error);
    return null;
  }
}