import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import path from 'path';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ensureUploadSubdir } from '@/lib/upload-dir';

const ALLOWED_CATEGORIES = ['animals', 'risk-reward', 'drivers', 'aoi', 'logo', 'form', 'form-backgrounds'];
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const category = formData.get('category') as string | null;
  const filename = formData.get('filename') as string | null;

  if (!file || !category || !filename) {
    return NextResponse.json({ error: 'Missing file, category, or filename' }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only PNG, JPG, and WebP files are allowed' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  // Sanitize filename
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  try {
    const dirPath = category === 'logo'
      ? ensureUploadSubdir('')
      : ensureUploadSubdir(category);

    const filePath = path.join(dirPath, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: `${category}/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
