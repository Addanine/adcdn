import fs from 'fs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFileMetadata } from '~/lib/storage';

interface FileViewParams {
  params: {
    publicId: string;
  };
}

export default async function FileView({ params }: FileViewParams) {
  const publicId = params.publicId;

  // Fetch file metadata
  const fileMetadata = await getFileMetadata(publicId);

  if (!fileMetadata) {
    notFound();
  }

  // Helper to format file size
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // Determine if file is an image for preview
  const isImage = fileMetadata.mime_type.startsWith('image/');
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                ADCDN
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h1 className="text-lg leading-6 font-medium text-gray-900 break-all">
                  {fileMetadata.original_filename}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Shared by {fileMetadata.username || 'Anonymous User'}
                </p>
              </div>
              
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">File type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {fileMetadata.mime_type}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Size</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatFileSize(fileMetadata.file_size)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(fileMetadata.created_at).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {isImage && (
                <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Preview</h3>
                  <div className="flex justify-center">
                    <img 
                      src={`/api/files/${publicId}/content`} 
                      alt={fileMetadata.original_filename}
                      className="max-w-full h-auto max-h-96 rounded-lg shadow-lg" 
                    />
                  </div>
                </div>
              )}
              
              <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                <div className="flex justify-center">
                  <a
                    href={`/api/files/${publicId}/content?download=true`}
                    download={fileMetadata.original_filename}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Download File
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ADCDN - Simple and secure content sharing
          </div>
        </div>
      </footer>
    </div>
  );
}