import type { Pt } from '@codejam/common';

/**
 * 정렬 모드 타입
 */
export type SortMode = 'name' | 'time';

/**
 * 참가자 컴포넌트의 공통 Props 타입
 */
export interface ParticipantProps {
  /**
   * 참가자 고유 ID
   */
  ptId: string;
}

/**
 * 권한을 수정할 수 있는지 확인하는 타입
 */
export interface PermissionPtProps {
  /**
   * 수정할 수 있는 권한인지 확인
   */
  hasPermission: boolean;
}

/**
 * 역할별 텍스트 색상 매핑
 */
export const ROLE_TEXT_COLORS: Record<Pt['role'], string> = {
  host: 'orangered',
  editor: 'royalblue',
  viewer: 'gray',
};

/**
 * 역할을 표시용 텍스트로 변환
 */
export function getRoleDisplayText(role: Pt['role']): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
