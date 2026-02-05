import type { FileType } from '@codejam/common';

/**
 * Copy file content to clipboard
 * @param content - File content
 * @param type - File type
 */
export async function copyFile(content: string, type: FileType): Promise<void> {
  switch (type) {
    case 'text':
      return copyTextFile(content);
    case 'image':
      return copyImageFile(content);
    default:
      return copyTextFile(content);
  }
}

async function copyTextFile(content: string) {
  await navigator.clipboard.writeText(content);
}

async function copyImageFile(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  const item = new ClipboardItem({ [blob.type]: blob });
  const data = [item];

  await navigator.clipboard.write(data);
}
