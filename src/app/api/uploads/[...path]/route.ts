import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { getUploadDir } from '@/lib/upload-dir';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  const relativePath = segments.join('/');

  // Sanitize: reject path traversal
  if (relativePath.includes('..') || relativePath.includes('\\')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const ext = path.extname(relativePath).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  // Check uploaded override first
  const uploadedPath = path.join(getUploadDir(), relativePath);
  if (existsSync(uploadedPath)) {
    const data = readFileSync(uploadedPath);
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }

  // Fall back to public/icons/
  const publicPath = path.join(process.cwd(), 'public', 'icons', relativePath);
  if (existsSync(publicPath)) {
    const data = readFileSync(publicPath);
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
