import { FileViewer } from '@/components/FileViewer';
import { getFileMetadataByShareId } from '@/lib/fileStorage';
import { notFound } from 'next/navigation';

interface SharedFilePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharedFilePage({ params }: SharedFilePageProps) {
  const resolvedParams = await params;
  const file = await getFileMetadataByShareId(resolvedParams.id);

  if (!file) {
    notFound();
  }

  // Check if file is expired
  if (new Date() > new Date(file.expirationDate)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">File Expired</h1>
          <p className="text-gray-600">
            This file has expired and is no longer available for download.
          </p>
        </div>
      </div>
    );
  }

  const fileMetadata = {
    id: file.id,
    originalName: file.originalName,
    fileSize: file.fileSize,
    mimeType: file.mimeType,
    uploadDate: file.uploadDate.toString(),
    expirationDate: file.expirationDate.toString(),
    isPasswordProtected: file.isPasswordProtected,
    downloadCount: file.downloadCount,
    isImage: file.mimeType.startsWith('image/')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📁</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FileShare</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FileViewer 
          file={fileMetadata}
          shareId={resolvedParams.id}
          requiresPassword={file.isPasswordProtected}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2024 FileShare. Secure file sharing made simple.</p>
          <p className="mt-2 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-700">
              Upload your own files →
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}