export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  expirationDate: Date;
  shareId: string;
  isPasswordProtected: boolean;
  downloadCount: number;
  maxDownloads?: number;
}

export interface ShareSettings {
  expirationDays: number;
  password?: string;
  maxDownloads?: number;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
}

export interface ShareLink {
  url: string;
  shareId: string;
  expirationDate: Date;
  isPasswordProtected: boolean;
}

export interface FileMetadata {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  expirationDate: string;
  isPasswordProtected: boolean;
  downloadCount: number;
  isImage: boolean;
}