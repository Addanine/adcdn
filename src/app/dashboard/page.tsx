'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '~/components/layout';
import { FileUpload } from '~/components/file-upload';
import { FileList, type FileItem } from '~/components/file-list';

export default function DashboardPage() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    username: string | null;
    is_admin: boolean;
  } | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(100 * 1024 * 1024); // 100MB default
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // Get user data
        const userResponse = await fetch('/api/user/me');
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUser(userData.user);

        // Get user files
        const filesResponse = await fetch('/api/files');
        if (!filesResponse.ok) {
          throw new Error('Failed to fetch files');
        }
        const filesData = await filesResponse.json();
        setFiles(filesData.files);
        setStorageUsed(filesData.storageUsed || 0);
        setStorageLimit(filesData.storageLimit || 100 * 1024 * 1024);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  async function handleUpload(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const data = await response.json();
      
      // Add the new file to the list and update storage used
      setFiles([data.file, ...files]);
      setStorageUsed(data.storageUsed || storageUsed + file.size);
    } catch (err) {
      throw err;
    }
  }

  async function handleDeleteFile(publicId: string) {
    try {
      const response = await fetch(`/api/files/${publicId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete file');
      }

      const data = await response.json();
      
      // Remove the deleted file from the list and update storage used
      setFiles(files.filter(file => file.public_id !== publicId));
      setStorageUsed(data.storageUsed || storageUsed);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }

  const isStorageFull = !user?.is_admin && storageUsed >= storageLimit;
  const storagePercentage = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Your Files
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center">Loading...</div>
        ) : error ? (
          <div className="mt-8 text-red-500">{error}</div>
        ) : (
          <div className="mt-8">
            {!user?.is_admin && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Storage used: {(storageUsed / (1024 * 1024)).toFixed(2)} MB of {(storageLimit / (1024 * 1024)).toFixed(0)} MB
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {storagePercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      storagePercentage > 90 ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${storagePercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New File</h3>
                <FileUpload 
                  onUpload={handleUpload} 
                  storageFull={isStorageFull} 
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Uploaded Files</h3>
                <FileList files={files} onDelete={handleDeleteFile} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}