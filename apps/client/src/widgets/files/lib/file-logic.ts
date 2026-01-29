import type { FileSortKey } from './types';

/** 파일 이름 기준 필터링 */
export const filterFiles = (
  entries: [string, string][],
  searchQuery: string,
) => {
  if (!searchQuery) return entries;
  return entries.filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
};

/** 정렬 로직 */
export const sortFiles = (
  entries: [string, string][],
  sortKey: FileSortKey,
) => {
  const sorted = [...entries];

  sorted.sort((a, b) => {
    const nameA = a[0].toLowerCase();
    const nameB = b[0].toLowerCase();

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
