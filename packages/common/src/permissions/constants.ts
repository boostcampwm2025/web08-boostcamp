/**
 * 비트마스킹 기반 권한 상수
 * 각 권한은 고유한 비트 값을 가짐
 */
export const PERMISSION = {
  NONE: 0,

  // VIEWER (Level 3) - 기본 권한
  READ_DOCS: 1 << 0, // 문서 열람
  SEND_CHAT: 1 << 1, // 채팅 가능
  EXECUTE_CODE: 1 << 2, // 코드 실행
  REQUEST_HOST: 1 << 3, // 호스트 권한 요청
  UPDATE_PROFILE: 1 << 4, // 닉네임 설정

  // EDITOR (Level 2) - 편집 권한
  EDIT_DOCS: 1 << 5, // 문서 편집
  CREATE_DOCS: 1 << 6, // 문서 추가
  DELETE_DOCS: 1 << 7, // 문서 삭제

  // HOST (Level 1) - 관리 권한
  MANAGE_ROLE: 1 << 8, // 권한 부여/회수
  HANDLE_HOST_REQ: 1 << 9, // 호스트 요청 수락/거부

  // 특수 권한
  DESTROY_ROOM: 1 << 10, // 방 폭파 (조건부)
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];

// 역할별 기본 권한 그룹
export const VIEWER_PERMISSIONS =
  PERMISSION.READ_DOCS |
  PERMISSION.SEND_CHAT |
  PERMISSION.EXECUTE_CODE |
  PERMISSION.REQUEST_HOST |
  PERMISSION.UPDATE_PROFILE;

export const EDITOR_PERMISSIONS =
  VIEWER_PERMISSIONS |
  PERMISSION.EDIT_DOCS |
  PERMISSION.CREATE_DOCS |
  PERMISSION.DELETE_DOCS;

export const HOST_PERMISSIONS =
  EDITOR_PERMISSIONS |
  PERMISSION.MANAGE_ROLE |
  PERMISSION.HANDLE_HOST_REQ |
  PERMISSION.DESTROY_ROOM;
