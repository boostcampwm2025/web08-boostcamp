import type { FileType } from '@codejam/common';

export async function downloadFile(
  name: string,
  content: string,
  type: FileType,
): Promise<void> {
  switch (type) {
    case 'text':
      return downloadTextFile(name, content);
    case 'image':
      return downloadImageFile(name, content);
    default:
      return downloadTextFile(name, content);
  }
}

function downloadTextFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadImageFile(name: string, url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;
  link.click();
  URL.revokeObjectURL(blobUrl);
}
