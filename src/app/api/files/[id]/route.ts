import { NextRequest, NextResponse } from 'next/server';
import { 
  getFileMetadata, 
  getFileMetadataByShareId,
  getFileBuffer, 
  deleteFile, 
  incrementDownloadCount,
  canDownloadFile,
  hashPassword 
} from '@/lib/fileStorage';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    
    // Try to get file by shareId first (for public sharing), then by fileId
    let file = await getFileMetadataByShareId(params.id);
    if (!file) {
      file = await getFileMetadata(params.id);
    }

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if file can be downloaded
    if (!canDownloadFile(file)) {
      return NextResponse.json({ error: 'File expired or download limit exceeded' }, { status: 410 });
    }

    // Check password if file is protected
    if (file.isPasswordProtected) {
      const fileWithPassword = file as any;
      if (!password || !fileWithPassword.hashedPassword) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }

      const isValidPassword = hashPassword(password) === fileWithPassword.hashedPassword;
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Get file buffer
    const fileBuffer = await getFileBuffer(file.fileName);
    
    // Increment download count
    await incrementDownloadCount(file.id);

    // Return file with appropriate headers - convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(fileBuffer);
    
    const response = new NextResponse(uint8Array, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': file.fileSize.toString(),
      }
    });
    return response;

  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const success = await deleteFile(params.id);
    
    if (!success) {
      return NextResponse.json({ error: 'File not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}