import type { FileType } from '@codejam/common';

interface UploadFileResult {
  content: string;
  type: FileType;
}

export function getType(file: File): string {
  if (!file.type) return 'unknown';
  const type = file.type.split('/')[0];
  return type;
}

export async function uploadFile(file: File): Promise<UploadFileResult> {
  const type = getType(file);

  switch (type) {
    case 'text': {
      const content = await uploadTextFile(file);
      return { content, type: 'text' };
    }
    case 'image': {
      const url = await uploadImageFile(file);
      return { content: url, type: 'image' };
    }
    default: {
      const content = await uploadTextFile(file);
      return { content, type: 'text' };
    }
  }
}

/**
 * Read text content from a file
 * @param file - The file to read
 */
export async function uploadTextFile(file: File): Promise<string> {
  const content = await file.text();
  return content;
}

/**
 * Reads the content of a file and returns it as a URL string
 */
export async function uploadImageFile(file: File): Promise<string> {
  const url = await file.text();
  return url;
}
