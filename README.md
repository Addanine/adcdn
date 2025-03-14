# Minimalist File CDN

A simple, secure file hosting service with user authentication and shareable links.

## Features

- **User Authentication:** Register and log in securely
- **File Management:** Upload, view, and delete your files
- **Shareable Links:** Generate unique links to share files with anyone
- **Secure Storage:** Files are securely stored in the PostgreSQL database
- **Responsive UI:** Works on desktop and mobile devices

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (stores user data, file content, and shareable links)
- **Authentication:** Custom JWT-based auth with HttpOnly cookies

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/adcdn
   JWT_SECRET=your-secret-key
   ```
4. Set up the database:
   ```
   psql -U postgres -f src/lib/db/schema.sql
   ```
5. Run the development server:
   ```
   npm run dev
   ```

## Deployment

1. Build the application:
   ```
   npm run build
   ```
2. Start the production server:
   ```
   npm start
   ```

## License

MIT
