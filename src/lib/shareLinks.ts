import { ShareLink, ShareSettings } from '@/types/file';
import { hashPassword } from './fileStorage';

export function createShareLink(baseUrl: string, shareId: string): string {
  return `${baseUrl}/shared/${shareId}`;
}

export function generateShareSettings(settings: Partial<ShareSettings>): ShareSettings {
  return {
    expirationDays: settings.expirationDays || 7,
    password: settings.password,
    maxDownloads: settings.maxDownloads
  };
}

export function calculateExpirationDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function validatePassword(inputPassword: string, hashedPassword: string): boolean {
  return hashPassword(inputPassword) === hashedPassword;
}

export function createShareLinkData(shareId: string, expirationDate: Date, isPasswordProtected: boolean): ShareLink {
  // In production, this would use the actual domain
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000';
  
  return {
    url: createShareLink(baseUrl, shareId),
    shareId,
    expirationDate,
    isPasswordProtected
  };
}