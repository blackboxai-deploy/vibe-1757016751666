import { NextRequest, NextResponse } from 'next/server';
import { 
  generateFileId, 
  generateShareId, 
  saveFile, 
  saveFileMetadata,
  hashPassword 
} from '@/lib/fileStorage';
import { createShareLinkData, calculateExpirationDate } from '@/lib/shareLinks';
import { isFileTypeAllowed, MAX_FILE_SIZE } from '@/lib/fileTypes';
import { UploadedFile } from '@/types/file';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const expirationDays = parseInt(formData.get('expirationDays') as string) || 7;
    const password = formData.get('password') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Validate file type
    if (!isFileTypeAllowed(file.type)) {
      return NextResponse.json({ 
        error: `File type not supported: ${file.type}` 
      }, { status: 400 });
    }

    // Generate unique IDs
    const fileId = generateFileId();
    const shareId = generateShareId();

    // Save file to disk
    const fileName = await saveFile(file, fileId);

    // Create file metadata
    const expirationDate = calculateExpirationDate(expirationDays);
    const uploadDate = new Date();

    const fileData: UploadedFile = {
      id: fileId,
      originalName: file.name,
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      uploadDate,
      expirationDate,
      shareId,
      isPasswordProtected: !!password,
      downloadCount: 0,
    };

    // Hash password if provided
    if (password) {
      // Store hashed password in a separate metadata field
      const hashedPassword = hashPassword(password);
      (fileData as any).hashedPassword = hashedPassword;
    }

    // Save metadata
    await saveFileMetadata(fileData);

    // Create share link
    const shareLink = createShareLinkData(shareId, expirationDate, !!password);

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type
      },
      shareLink
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' }, 
      { status: 500 }
    );
  }
}