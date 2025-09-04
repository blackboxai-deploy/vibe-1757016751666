'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileMetadata } from '@/types/file';
import { formatFileSize, getFileIcon } from '@/lib/fileTypes';

export function FileList() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const filtered = files.filter(file =>
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(files.filter(file => file.id !== fileId));
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const copyShareLink = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const shareUrl = `${window.location.origin}/shared/${fileId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
      console.log('Share link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading your files...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Your Files</h2>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none border-0"
            >
              ⊞ Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-0 border-l"
            >
              ☰ List
            </Button>
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No files found' : 'No files uploaded yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No files match "${searchTerm}"`
              : 'Upload your first file to get started!'}
          </p>
        </Card>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredFiles.map((file) => (
            <Card key={file.id} className={`p-4 hover:shadow-md transition-shadow ${
              viewMode === 'list' ? 'flex items-center space-x-4' : ''
            }`}>
              <div className={`${viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : ''}`}>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'text-center mb-4' 
                    : 'flex-shrink-0'
                }`}>
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'text-4xl mb-2' 
                      : 'text-2xl'
                  }`}>
                    {getFileIcon(file.mimeType)}
                  </div>
                  {viewMode === 'list' && (
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.fileSize)}
                    </div>
                  )}
                </div>

                <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                  <h4 className={`font-medium text-gray-900 ${
                    viewMode === 'list' ? 'truncate' : 'mb-2'
                  }`}>
                    {file.originalName}
                  </h4>
                  
                  {viewMode === 'grid' && (
                    <p className="text-sm text-gray-600 mb-2">
                      {formatFileSize(file.fileSize)}
                    </p>
                  )}
                  
                  <div className={`text-xs text-gray-500 ${
                    viewMode === 'list' ? 'flex space-x-4' : 'space-y-1'
                  }`}>
                    <div>Uploaded: {formatDate(file.uploadDate)}</div>
                    <div>Expires: {formatDate(file.expirationDate)}</div>
                    <div>Downloads: {file.downloadCount}</div>
                    {file.isPasswordProtected && <div className="text-yellow-600">🔒 Protected</div>}
                  </div>
                </div>
              </div>

              <div className={`flex space-x-2 ${
                viewMode === 'grid' ? 'mt-4' : 'flex-shrink-0'
              }`}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyShareLink(file.id)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  📋 Copy Link
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteFile(file.id)}
                >
                  🗑️ Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}