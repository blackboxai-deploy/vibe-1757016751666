'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileMetadata } from '@/types/file';
import { formatFileSize, getFileIcon } from '@/lib/fileTypes';

interface FileViewerProps {
  file: FileMetadata;
  shareId: string;
  requiresPassword: boolean;
}

export function FileViewer({ file, shareId, requiresPassword }: FileViewerProps) {
  const [password, setPassword] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(requiresPassword);

  const downloadFile = async () => {
    setIsDownloading(true);
    setError('');

    try {
      const url = new URL(`/api/files/${shareId}`, window.location.origin);
      if (requiresPassword && password) {
        url.searchParams.set('password', password);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Incorrect password. Please try again.');
          setIsDownloading(false);
          return;
        } else if (response.status === 404) {
          setError('File not found or has expired.');
          setIsDownloading(false);
          return;
        } else {
          throw new Error(`Download failed: ${response.statusText}`);
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      if (requiresPassword) {
        setShowPasswordForm(false);
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      downloadFile();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = new Date() > new Date(file.expirationDate);

  if (isExpired) {
    return (
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">File Expired</h2>
        <p className="text-gray-600 mb-4">
          This file expired on {formatDate(file.expirationDate)} and is no longer available for download.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {getFileIcon(file.mimeType)}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {file.originalName}
          </h1>
          <p className="text-gray-600">
            {formatFileSize(file.fileSize)} • Uploaded {formatDate(file.uploadDate)}
          </p>
        </div>

        {/* File Preview for Images */}
        {file.isImage && (
          <div className="mb-8">
            <img 
              src={`https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d1c99e03-4f26-480f-beda-de80208ffb6b.png`}
              alt={`Preview of ${file.originalName}`}
              className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* File Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">File Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">File Size:</span>
              <span className="ml-2 font-medium">{formatFileSize(file.fileSize)}</span>
            </div>
            <div>
              <span className="text-gray-600">Downloads:</span>
              <span className="ml-2 font-medium">{file.downloadCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Uploaded:</span>
              <span className="ml-2 font-medium">{formatDate(file.uploadDate)}</span>
            </div>
            <div>
              <span className="text-gray-600">Expires:</span>
              <span className="ml-2 font-medium">{formatDate(file.expirationDate)}</span>
            </div>
          </div>
        </div>

        {/* Password Form */}
        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                🔒 This file is password protected
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password to download"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              disabled={isDownloading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDownloading ? 'Downloading...' : 'Download File'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}
            <Button 
              onClick={downloadFile}
              disabled={isDownloading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
            >
              {isDownloading ? 'Downloading...' : '⬇️ Download File'}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              By downloading this file, you acknowledge that you have permission to access it.
            </p>
          </div>
        )}
      </Card>

      {/* Security Notice */}
      <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">🔒 Security Notice</h4>
        <p className="text-sm text-yellow-700">
          This file will be automatically deleted after it expires. Please download it now if you need it.
          Always verify the source of shared files before opening them.
        </p>
      </Card>
    </div>
  );
}