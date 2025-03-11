import { initializeDatabase } from '../src/lib/db';

async function main() {
  console.log('Initializing database...');
  
  try {
    const success = await initializeDatabase();
    
    if (success) {
      console.log('Database initialized successfully!');
      console.log('Created tables:');
      console.log('  - users: Stores user accounts and authentication information');
      console.log('  - files: Stores file metadata and references to file system storage');
    } else {
      console.error('Failed to initialize database.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();