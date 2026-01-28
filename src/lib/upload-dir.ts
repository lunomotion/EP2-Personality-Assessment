import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const DEFAULT_UPLOAD_DIR = '/var/uploads/praxia';

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;
}

export function getUploadedFilePath(relativePath: string): string | null {
  const fullPath = path.join(getUploadDir(), relativePath);
  if (existsSync(fullPath)) {
    return fullPath;
  }
  return null;
}

export function ensureUploadSubdir(subdir: string): string {
  const dirPath = path.join(getUploadDir(), subdir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}
