'use client';
/* eslint-disable */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isViewableInBrowser } from '~/lib/utils';

export default function SharePage({ params }: any) {
  const { shareCode } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchFileInfo() {
      try {
        // First get file metadata
        const response = await fetch('/api/file-share', {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shareCode }),
        });

        if (!response.ok) {
          throw new Error('File not found or no longer available');
        }

        const data = await response.json();
        
        setFileInfo({
          fileName: data.fileName,
          contentType: data.mimeType,
          sizeBytes: data.sizeBytes
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFileInfo();
  }, [shareCode]);

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/file-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareCode }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-catppuccin-base p-4">
      <div className="w-full max-w-md border-2 border-catppuccin-mauve bg-catppuccin-mantle p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-black text-catppuccin-mauve tracking-tight">adcdn</h1>
        <h2 className="mb-6 text-center text-xl font-bold text-catppuccin-text">Shared File</h2>

        {loading ? (
          <div className="text-center">
            <p className="text-catppuccin-subtext1">Loading file information...</p>
          </div>
        ) : error ? (
          <div className="border-2 border-catppuccin-red bg-catppuccin-surface0 p-4 text-center text-catppuccin-red">
            <p>{error}</p>
            <Link href="/" className="mt-4 inline-block text-catppuccin-blue hover:text-catppuccin-lavender">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-1 text-lg font-medium text-catppuccin-text">{fileInfo.fileName}</p>
            <p className="mb-4 text-sm text-catppuccin-subtext1">
              {fileInfo.contentType} · {formatFileSize(fileInfo.sizeBytes)}
            </p>

            <div className="mb-6 flex h-40 items-center justify-center border-2 border-catppuccin-surface2 bg-catppuccin-surface0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-catppuccin-overlay0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <button
              onClick={handleDownload}
              className="inline-block border-2 border-catppuccin-lavender bg-catppuccin-surface0 px-6 py-2 text-catppuccin-text transition hover:bg-catppuccin-surface1"
            >
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}