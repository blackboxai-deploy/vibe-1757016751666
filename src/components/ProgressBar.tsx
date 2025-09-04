'use client';

import { FileUploadProgress } from '@/types/file';

interface ProgressBarProps {
  progress: FileUploadProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      case 'cancelled':
        return '○';
      default:
        return '';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
          {progress.fileName}
        </span>
        <div className="flex items-center space-x-2">
          {progress.status !== 'uploading' && (
            <span className="text-sm font-semibold">
              {getStatusIcon()}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {progress.progress}%
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      
      {progress.error && (
        <p className="text-red-500 text-xs mt-2">{progress.error}</p>
      )}
      
      {progress.status === 'completed' && (
        <p className="text-green-600 text-xs mt-2">Upload completed successfully</p>
      )}
    </div>
  );
}