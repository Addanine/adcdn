# ADCDN - Content Delivery Network

A simple and secure platform for content delivery and file sharing built with Next.js and PostgreSQL.

## Features

- **User Authentication**: Custom email/password authentication system
- **File Management**: Upload, view, and delete files with shareable public links
- **Storage Limits**: 100MB storage per user (unlimited for admin users)
- **Profile Customization**: Set a username that will be displayed when others view your shared files
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## System Requirements

- Node.js 18.x or later
- PostgreSQL 14.x or later
- At least 500MB of free disk space for file storage

## Server Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/adcdn.git
cd adcdn
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit the `.env` file and set the following variables:

```
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgres://username:password@24.5.227.118:5432/adcdn"

# Auth - Set a strong secret for JWT
JWT_SECRET="your_secure_random_string_here"

# File Storage - Set the absolute path to your storage directory
UPLOAD_DIR="/absolute/path/to/file/storage"
MAX_STORAGE_SIZE_MB="100"

# Next Auth - Set a strong random string
NEXTAUTH_SECRET="your_secure_random_string_here"
NEXTAUTH_URL="http://your-domain.com"  # Use http://localhost:3000 for local development
```

### 4. Setting Up File Storage

Create a directory for file storage and set appropriate permissions:

```bash
# Create directory (use your preferred location)
sudo mkdir -p /var/www/adcdn/uploads

# Set proper ownership (replace www-data with appropriate web server user)
sudo chown -R www-data:www-data /var/www/adcdn/uploads

# Set proper permissions
sudo chmod -R 755 /var/www/adcdn/uploads
```

Make sure the directory path matches the `UPLOAD_DIR` in your `.env` file.

## Database Setup

### 1. Create PostgreSQL Database

Connect to your PostgreSQL server:

```bash
psql -h 24.5.227.118 -U postgres
```

Create a new database:

```sql
CREATE DATABASE adcdn;
CREATE USER adcdn_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE adcdn TO adcdn_user;
```

### 2. Initialize Database Schema

The application will automatically create the necessary tables on first run, but you can also initialize them manually by running:

```bash
npx tsx scripts/init-db.ts
```

The schema includes:

- `users` table: Stores user accounts with email, hashed password, username, and admin status
- `files` table: Stores file metadata including path, public ID, file size, and mime type

## Starting the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Usage Guide

### 1. User Registration and Login

- Navigate to `/register` to create a new account
- After registering, log in at `/login`

### 2. Setting Up Your Profile

- Go to `/profile` to set your username
- This username will be visible to others when they view your shared files

### 3. Uploading Files

- From the dashboard, use the file upload form to select and upload a file
- Files are subject to the 100MB storage limit (unless you're an admin)
- After upload, a shareable public link will be generated

### 4. Managing Files

- View all your uploaded files on the dashboard
- Click on a filename to view its public page
- Use the delete button to remove files you no longer need

### 5. Sharing Files

- Each file has a unique public link in the format `/files/[publicId]`
- Share these links with anyone to give them access to view and download your file
- Links remain active until you delete the file

## Admin User Setup

To create an admin user with unlimited storage:

1. Register a regular user account through the application
2. Connect to your PostgreSQL database
3. Execute the following SQL command:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
```

Replace `admin@example.com` with the email address of the user you want to promote.

## Troubleshooting

### File Upload Issues

- Ensure the `UPLOAD_DIR` exists and has proper write permissions
- Check the file size is within the allowed limit (100MB for regular users)
- Verify the PostgreSQL connection is working properly

### Storage Space Running Out

- Admin users can upload unlimited files, but your server still has physical limits
- Regularly monitor disk usage to ensure sufficient space
- Consider implementing a cleanup policy for old files

## Security Notes

- All passwords are hashed using bcrypt before storage
- JWTs are used for authentication and stored in HTTP-only cookies
- File access is secured through random UUIDs, making it difficult to guess file URLs
- File validation is performed before storage to prevent malicious uploads

## License

[MIT License](LICENSE)
