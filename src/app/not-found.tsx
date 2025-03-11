import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The resource you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}