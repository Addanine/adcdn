import { ChangeEvent, FormEvent, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSize?: number;
  storageFull?: boolean;
}

export function FileUpload({ onUpload, maxSize = 100 * 1024 * 1024, storageFull = false }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size
      if (file.size > maxSize) {
        setError(`File is too large. Maximum file size is ${Math.floor(maxSize / (1024 * 1024))}MB.`);
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Select a file to upload
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading || storageFull}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
          {storageFull && (
            <p className="mt-1 text-sm text-red-500">
              Your storage is full. Delete some files to upload more.
            </p>
          )}
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-500">
            Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </div>
        )}

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={!selectedFile || isUploading || storageFull}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </div>
  );
}