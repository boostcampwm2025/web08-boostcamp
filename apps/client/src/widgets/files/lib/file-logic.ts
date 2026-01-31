import type { FileMetadata } from '@/shared/lib/collaboration';
import type { FileSortKey } from './types';

/** 파일 이름 기준 필터링 */
export const filterFiles = (
  files: FileMetadata[],
  searchQuery: string,
): FileMetadata[] => {
  if (!searchQuery) return files;
  return files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
};

/** 정렬 로직 */
export const sortFiles = (
  files: FileMetadata[],
  sortKey: FileSortKey,
): FileMetadata[] => {
  const sorted = [...files];

  sorted.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (sortKey === 'name-asc') return nameA.localeCompare(nameB);
    if (sortKey === 'name-desc') return nameB.localeCompare(nameA);
    if (sortKey === 'ext') {
      const extA = nameA.split('.').pop() || '';
      const extB = nameB.split('.').pop() || '';
      return extA.localeCompare(extB) || nameA.localeCompare(nameB);
    }
    return 0;
  });

  return sorted;
};
