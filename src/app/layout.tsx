import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FileShare - Secure File Sharing',
  description: 'Upload and share files securely with expiring links',
  keywords: ['file sharing', 'secure upload', 'file transfer', 'document sharing'],
  authors: [{ name: 'FileShare' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0066cc" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}