import { useState } from 'react';

export interface FileItem {
  id: number;
  public_id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface FileListProps {
  files: FileItem[];
  onDelete: (publicId: string) => Promise<void>;
}

export function FileList({ files, onDelete }: FileListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function handleDelete(publicId: string) {
    if (confirmDelete !== publicId) {
      setConfirmDelete(publicId);
      return;
    }

    setIsDeleting(publicId);
    try {
      await onDelete(publicId);
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsDeleting(null);
      setConfirmDelete(null);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  if (files.length === 0) {
    return <p className="text-gray-500">You haven't uploaded any files yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.public_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                <a
                  href={`/files/${file.public_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {file.original_filename}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.mime_type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatFileSize(file.file_size)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(file.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleDelete(file.public_id)}
                  disabled={isDeleting !== null}
                  className={`text-red-600 hover:text-red-900 ${isDeleting === file.public_id ? 'opacity-50' : ''}`}
                >
                  {isDeleting === file.public_id
                    ? 'Deleting...'
                    : confirmDelete === file.public_id
                    ? 'Confirm?'
                    : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}