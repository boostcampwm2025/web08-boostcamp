// 참가자 role
export const ROLE = {
  HOST: 'host',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

// 참가자 role 타입
export const PT_ROLES = Object.values(ROLE);

// 변경 가능한 참가자 role (host 제외)
export const UPDATABLE_PT_ROLES = [ROLE.EDITOR, ROLE.VIEWER] as const;

// 파일 편집 가능한 role (host, editor만 가능)
export const EDITABLE_PT_ROLES = [ROLE.HOST, ROLE.EDITOR] as const;

// 참가자 상태
export const PRESENCE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

// 참가자 presence 타입
export const PT_PRESENCES = Object.values(PRESENCE);

// 참가자 색상 (HEX 코드)
export const PT_COLORS = [
  '#ef4444',
  '#22c55e',
  '#3b82f6',
  '#eab308',
  '#a855f7',
  '#ec4899',
] as const;
