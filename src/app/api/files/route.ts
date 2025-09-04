import { NextResponse } from 'next/server';
import { getAllUserFiles } from '@/lib/fileStorage';

export async function GET() {
  try {
    const files = await getAllUserFiles();
    
    return NextResponse.json({
      success: true,
      files
    });

  } catch (error) {
    console.error('Failed to get files:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' }, 
      { status: 500 }
    );
  }
}