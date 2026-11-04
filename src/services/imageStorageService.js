import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import env from '../config/env.js';
import { detectImageExtension } from '../utils/imageType.js';

export const UPLOAD_DIRECTORY = path.resolve('uploads');

export async function saveImage(file) {
  const fileName = `${randomUUID()}.${detectImageExtension(file.buffer)}`;

  await mkdir(UPLOAD_DIRECTORY, { recursive: true });
  await writeFile(path.join(UPLOAD_DIRECTORY, fileName), file.buffer);

  return `${env.publicUrl}/uploads/${fileName}`;
}
