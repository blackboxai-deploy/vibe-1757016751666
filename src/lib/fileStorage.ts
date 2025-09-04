import { promises as fs } from 'fs';
import { join } from 'path';
import { randomBytes, createHash } from 'crypto';
import { UploadedFile, FileMetadata } from '@/types/file';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const METADATA_DIR = join(process.cwd(), 'metadata');

// Ensure directories exist
export async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(METADATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create directories:', error);
  }
}

export function generateFileId(): string {
  return randomBytes(16).toString('hex');
}

export function generateShareId(): string {
  return randomBytes(20).toString('base64url');
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function saveFile(file: File, fileId: string): Promise<string> {
  await ensureDirectories();
  
  const fileName = `${fileId}_${file.name}`;
  const filePath = join(UPLOAD_DIR, fileName);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  
  return fileName;
}

export async function saveFileMetadata(fileData: UploadedFile): Promise<void> {
  await ensureDirectories();
  
  const metadataPath = join(METADATA_DIR, `${fileData.id}.json`);
  await fs.writeFile(metadataPath, JSON.stringify(fileData, null, 2));
}

export async function getFileMetadata(fileId: string): Promise<UploadedFile | null> {
  try {
    const metadataPath = join(METADATA_DIR, `${fileId}.json`);
    const data = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function getFileMetadataByShareId(shareId: string): Promise<UploadedFile | null> {
  try {
    const files = await fs.readdir(METADATA_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadataPath = join(METADATA_DIR, file);
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(data);
        
        if (metadata.shareId === shareId) {
          return metadata;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function getFileBuffer(fileName: string): Promise<Buffer> {
  const filePath = join(UPLOAD_DIR, fileName);
  return await fs.readFile(filePath);
}

export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const metadata = await getFileMetadata(fileId);
    if (!metadata) return false;
    
    // Delete the actual file
    const filePath = join(UPLOAD_DIR, metadata.fileName);
    await fs.unlink(filePath);
    
    // Delete metadata
    const metadataPath = join(METADATA_DIR, `${fileId}.json`);
    await fs.unlink(metadataPath);
    
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

export async function incrementDownloadCount(fileId: string): Promise<void> {
  const metadata = await getFileMetadata(fileId);
  if (metadata) {
    metadata.downloadCount += 1;
    await saveFileMetadata(metadata);
  }
}

export async function getAllUserFiles(): Promise<FileMetadata[]> {
  try {
    await ensureDirectories();
    const files = await fs.readdir(METADATA_DIR);
    const fileList: FileMetadata[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadataPath = join(METADATA_DIR, file);
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata: UploadedFile = JSON.parse(data);
        
        // Check if file is expired
        if (new Date() > new Date(metadata.expirationDate)) {
          // Delete expired file
          await deleteFile(metadata.id);
          continue;
        }
        
        fileList.push({
          id: metadata.id,
          originalName: metadata.originalName,
          fileSize: metadata.fileSize,
          mimeType: metadata.mimeType,
          uploadDate: metadata.uploadDate.toString(),
          expirationDate: metadata.expirationDate.toString(),
          isPasswordProtected: metadata.isPasswordProtected,
          downloadCount: metadata.downloadCount,
          isImage: metadata.mimeType.startsWith('image/')
        });
      }
    }
    
    // Sort by upload date (newest first)
    return fileList.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  } catch (error) {
    console.error('Failed to get user files:', error);
    return [];
  }
}

export function isFileExpired(file: UploadedFile): boolean {
  return new Date() > new Date(file.expirationDate);
}

export function canDownloadFile(file: UploadedFile): boolean {
  if (isFileExpired(file)) return false;
  if (file.maxDownloads && file.downloadCount >= file.maxDownloads) return false;
  return true;
}