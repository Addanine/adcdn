import { initializeDatabase } from './db';
import { ensureUploadDir } from './storage';

export async function initializeApp() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    
    // Create upload directory if it doesn't exist
    console.log('Ensuring upload directory exists...');
    await ensureUploadDir();
    
    console.log('Application initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing application:', error);
    return false;
  }
}