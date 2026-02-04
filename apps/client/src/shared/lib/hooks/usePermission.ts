import { useMemo, useCallback } from 'react';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { getPermissions, has, type Permission } from '@codejam/common';

/**
 * 현재 사용자의 권한을 관리하는 훅
 * @returns can 함수와 권한 값
 */
export function usePermission() {
  const myPtId = useRoomStore((state) => state.myPtId);
  const roomType = useRoomStore((state) => state.roomType);
  const myPt = usePt(myPtId || '');

  const permissions = useMemo(() => {
    return getPermissions(myPt?.role, roomType);
  }, [myPt?.role, roomType]);

  const can = useCallback(
    (permission: Permission) => {
      return has(permissions, permission);
    },
    [permissions],
  );

  return {
    can,
    permissions,
    role: myPt?.role,
    roomType,
  };
}
