'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShareLink } from '@/types/file';

interface ShareModalProps {
  shareLinks: ShareLink[];
  onClose: () => void;
}

export function ShareModal({ shareLinks, onClose }: ShareModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const formatExpirationDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Files Uploaded Successfully! 🎉
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Your files have been uploaded and are ready to share. Copy the links below to share with others:
            </p>

            {shareLinks.map((shareLink, index) => (
              <div key={shareLink.shareId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Share Link #{index + 1}
                  </Label>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {shareLink.isPasswordProtected && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        🔒 Password Protected
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Expires: {formatExpirationDate(shareLink.expirationDate)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Input
                    value={shareLink.url}
                    readOnly
                    className="flex-1 font-mono text-sm bg-white"
                  />
                  <Button
                    onClick={() => copyToClipboard(shareLink.url, index)}
                    className={`px-4 ${
                      copiedIndex === index 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {copiedIndex === index ? '✓ Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Sharing Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share these links with anyone you want to give access to your files</li>
                <li>• Recipients can download files directly without creating an account</li>
                <li>• Links will automatically expire on the date shown above</li>
                <li>• Password-protected files will require the password you set</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upload More Files
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}