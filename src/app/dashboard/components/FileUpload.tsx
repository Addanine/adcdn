'use client';

import { useState } from 'react';

interface FileUploadProps {
  onFileUploaded: (file: any) => void;
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0] as File);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    
    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }
      
      // Clear selected file
      setSelectedFile(null);
      if (e.target instanceof HTMLFormElement) {
        e.target.reset();
      }
      
      // Notify parent component
      onFileUploaded({
        id: data.fileId,
        fileName: data.fileName,
        mimeType: selectedFile.type,
        sizeBytes: selectedFile.size,
        uploadTimestamp: new Date().toISOString(),
        shareCode: data.shareCode,
        shareLink: data.shareLink
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 border-2 border-catppuccin-red bg-catppuccin-surface0 p-3 text-catppuccin-red">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="file" 
            className="mb-2 block text-sm font-medium text-catppuccin-subtext0"
          >
            Select file (max 10MB)
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full cursor-pointer border-2 border-catppuccin-surface2 bg-catppuccin-base p-2 text-sm text-catppuccin-text focus:border-catppuccin-mauve focus:outline-none"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="border-2 border-catppuccin-mauve bg-catppuccin-surface0 px-4 py-2 text-catppuccin-text transition hover:bg-catppuccin-surface1 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
      
      {selectedFile && (
        <div className="mt-4">
          <p className="text-sm text-catppuccin-subtext1">
            Selected file: <span className="font-medium text-catppuccin-text">{selectedFile.name}</span> 
            ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        </div>
      )}
    </div>
  );
}