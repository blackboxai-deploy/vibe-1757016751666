'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { FileUploadProgress, ShareLink } from '@/types/file';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, formatFileSize } from '@/lib/fileTypes';

interface FileUploaderProps {
  onUploadComplete?: (shareLinks: ShareLink[]) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return `File type not supported: ${file.type}`;
    }
    
    return null;
  };

  const uploadFiles = useCallback(async (files: FileList) => {
    if (files.length > MAX_FILES_PER_UPLOAD) {
      alert(`Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`);
      return;
    }

    setIsUploading(true);
    const fileArray = Array.from(files);
    const progressArray: FileUploadProgress[] = fileArray.map(file => ({
      fileId: Math.random().toString(36).substring(7),
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(progressArray);
    const shareLinks: ShareLink[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const progressItem = progressArray[i];
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        progressArray[i] = {
          ...progressItem,
          status: 'error',
          error: validationError,
          progress: 100
        };
        setUploadProgress([...progressArray]);
        continue;
      }

      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expirationDays', '7');

        // Upload with progress tracking
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            progressArray[i] = { ...progressItem, progress };
            setUploadProgress([...progressArray]);
          }
        };

        const uploadPromise = new Promise<ShareLink>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.shareLink);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);

        const shareLink = await uploadPromise;
        
        progressArray[i] = {
          ...progressItem,
          status: 'completed',
          progress: 100
        };
        setUploadProgress([...progressArray]);
        shareLinks.push(shareLink);

      } catch (error) {
        progressArray[i] = {
          ...progressItem,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
          progress: 100
        };
        setUploadProgress([...progressArray]);
      }
    }

    setIsUploading(false);
    if (shareLinks.length > 0 && onUploadComplete) {
      onUploadComplete(shareLinks);
    }
  }, [onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  }, [uploadFiles]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card 
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-70' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-blue-600">📁</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Support for images, documents, archives, and media files
            </p>
            <p className="text-xs text-gray-500">
              Maximum {formatFileSize(MAX_FILE_SIZE)} per file • Up to {MAX_FILES_PER_UPLOAD} files at once
            </p>
          </div>
          
          <Button 
            onClick={openFileDialog}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept={Object.keys(ALLOWED_FILE_TYPES).join(',')}
        className="hidden"
      />

      {uploadProgress.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h4>
          {uploadProgress.map((progress) => (
            <ProgressBar key={progress.fileId} progress={progress} />
          ))}
        </div>
      )}
    </div>
  );
}