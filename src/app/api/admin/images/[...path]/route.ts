import { NextRequest, NextResponse } from 'next/server';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getUploadDir } from '@/lib/upload-dir';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const segments = (await params).path;
  const relativePath = segments.join('/');

  // Sanitize
  if (relativePath.includes('..') || relativePath.includes('\\')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const uploadPath = path.join(getUploadDir(), relativePath);

  if (!existsSync(uploadPath)) {
    return NextResponse.json({ error: 'No custom upload found' }, { status: 404 });
  }

  try {
    unlinkSync(uploadPath);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
