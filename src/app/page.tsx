'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { ShareModal } from '@/components/ShareModal';
import { FileList } from '@/components/FileList';
import { Button } from '@/components/ui/button';
import { ShareLink } from '@/types/file';

export default function HomePage() {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFileList, setShowFileList] = useState(false);

  const handleUploadComplete = (links: ShareLink[]) => {
    setShareLinks(links);
    setShowShareModal(true);
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
    setShareLinks([]);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📁</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">FileShare</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button 
                variant={!showFileList ? "default" : "outline"}
                onClick={() => setShowFileList(false)}
              >
                Upload
              </Button>
              <Button 
                variant={showFileList ? "default" : "outline"}
                onClick={() => setShowFileList(true)}
              >
                My Files
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showFileList ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Share Files Securely
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Upload your files and get shareable links that expire automatically. 
                No account required, just drag, drop, and share.
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Auto-Expiring Links</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>No Registration</span>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <FileUploader onUploadComplete={handleUploadComplete} />

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 pt-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Sharing</h3>
                <p className="text-gray-600">
                  Files are secured with unique links and optional password protection. 
                  Only people with the link can access your files.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Auto-Expiring</h3>
                <p className="text-gray-600">
                  Set expiration dates for your shared files. Links automatically become 
                  inactive after the specified time period.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile Friendly</h3>
                <p className="text-gray-600">
                  Works perfectly on all devices. Upload from your phone, tablet, or desktop 
                  with the same great experience.
                </p>
              </div>
            </div>

            {/* Supported Files Section */}
            <div className="bg-white rounded-lg shadow-sm border p-8 mt-16">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Supported File Types
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">📸 Images</div>
                  <div>JPG, PNG, GIF, WebP, SVG</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">📄 Documents</div>
                  <div>PDF, DOC, DOCX, XLS, PPT</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">🎵 Media</div>
                  <div>MP3, MP4, MOV, AVI, WAV</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">🗜️ Archives</div>
                  <div>ZIP, RAR, 7Z and more</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <FileList />
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal shareLinks={shareLinks} onClose={handleCloseModal} />
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2024 FileShare. Secure file sharing made simple.</p>
        </div>
      </footer>
    </div>
  );
}