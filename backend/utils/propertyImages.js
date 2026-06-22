import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');
export const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads', 'properties');

export function ensurePropertyUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

export function persistPropertyImage(imageUrl, propertyId) {
  if (!imageUrl) return null;
  if (!isDataUrl(imageUrl)) return imageUrl;

  const match = imageUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/s);
  if (!match) throw new Error('Invalid image data.');

  const mime = match[1].toLowerCase();
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const buffer = Buffer.from(match[2], 'base64');

  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Image file is too large. Please use a smaller picture (under 8 MB).');
  }

  ensurePropertyUploadsDir();
  const filename = `property-${propertyId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/properties/${filename}`;
}

export function deletePropertyImageFile(url) {
  if (!url || isDataUrl(url) || !String(url).startsWith('/uploads/properties/')) return;

  const filePath = path.join(PROJECT_ROOT, url.replace(/^\//, ''));
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Ignore missing or locked files.
  }
}
