import type { FileType } from '@codejam/common';

interface UploadFileResult {
  content: string;
  type: FileType;
}

export async function uploadFile(file: File): Promise<UploadFileResult> {
  const content = await uploadTextFile(file);
  return { content, type: 'text' };
}

/**
 * Read text content from a file
 * @param file - The file to read
 */
export async function uploadTextFile(file: File): Promise<string> {
  return await file.text();
}
