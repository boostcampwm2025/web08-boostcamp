import { ROLE } from '../constants/pt.js';
import { ROOM_TYPE } from '../constants/room.js';
import type { PtRole, RoomType } from '../types/index.js';
import {
  PERMISSION,
  VIEWER_PERMISSIONS,
  EDITOR_PERMISSIONS,
  HOST_PERMISSIONS,
} from './constants.js';

/**
 * 역할과 방 타입에 따라 권한 값을 반환
 * @param role 사용자 역할
 * @param roomType 방 타입
 * @returns 권한 비트 값
 */
export function getPermissions(
  role: PtRole | undefined,
  roomType: RoomType | undefined | null,
): number {
  if (!role) return PERMISSION.NONE;

  switch (role) {
    case ROLE.HOST:
      return HOST_PERMISSIONS;

    case ROLE.EDITOR:
      // quick 방에서는 EDITOR도 DESTROY_ROOM 권한 보유
      if (roomType === ROOM_TYPE.QUICK) {
        return EDITOR_PERMISSIONS | PERMISSION.DESTROY_ROOM;
      }
      return EDITOR_PERMISSIONS;

    case ROLE.VIEWER:
      return VIEWER_PERMISSIONS;

    default:
      return PERMISSION.NONE;
  }
}
