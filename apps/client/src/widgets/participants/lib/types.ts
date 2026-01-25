import type { RoomType, PtId, PtRole } from '@codejam/common';

// 정렬 모드 키
export type SortKey = 'name' | 'time';

// 정렬 순서
export type SortOrder = 'asc' | 'desc';

// 정렬 상태 통합 인터페이스
export interface SortState {
  key: SortKey;
  order: SortOrder;
}

// 참가자 컴포넌트의 공통 Props 타입
export interface ParticipantProps {
  ptId: PtId;
  roomType?: RoomType | null;
  canToggle?: boolean;
  onToggleRole?: () => void;
}

// 닉네임 수정 Props 타입
export interface EditableProps {
  editable: boolean;
  onEditable: (value: boolean) => void;
}

// 권한을 수정할 수 있는지 확인하는 타입
export interface PermissionPtProps {
  hasPermission: boolean;
}

// 역할별 뱃지 스타일
export const ROLE_BADGE_STYLES = {
  host: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  editor:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  viewer:
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

// 역할을 표시용 텍스트로 변환
export function getRoleDisplayText(role: PtRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
