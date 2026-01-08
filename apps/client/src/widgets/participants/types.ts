import type { Pt } from "@codejam/common";

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
 * 역할별 텍스트 색상 매핑
 */
export const ROLE_TEXT_COLORS: Record<Pt["role"], string> = {
  host: "orangered",
  editor: "royalblue",
  viewer: "gray",
};

/**
 * 역할을 표시용 텍스트로 변환
 */
export function getRoleDisplayText(role: Pt["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
