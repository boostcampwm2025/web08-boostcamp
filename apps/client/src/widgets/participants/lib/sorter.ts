import type { Pt } from '@codejam/common';
import type { SortOrder } from './types';

/**
 * 닉네임 정렬 가중치 계산
 * 0: 특수문자, 1: 영문, 2: 한글, 3: 기타
 */
const getCharWeight = (char: string) => {
  const code = char.charCodeAt(0);
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return 1;
  if ((code >= 0xac00 && code <= 0xd7a3) || (code >= 0x3131 && code <= 0x318e))
    return 2;
  return 0;
};

export const sortByTime = (a: Pt, b: Pt, order: SortOrder) => {
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  const diff = timeA - timeB;

  return order === 'asc' ? diff : -diff;
};

export const sortByNickname = (a: Pt, b: Pt, order: SortOrder) => {
  const charA = a.nickname.charAt(0);
  const charB = b.nickname.charAt(0);
  const weightA = getCharWeight(charA);
  const weightB = getCharWeight(charB);

  let result = 0;
  if (weightA !== weightB) {
    result = weightA - weightB;
  } else {
    result = a.nickname.localeCompare(b.nickname, undefined, {
      sensitivity: 'base',
    });
  }

  return order === 'asc' ? result : -result;
};
