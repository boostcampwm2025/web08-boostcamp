import { memo } from 'react';
import { usePt } from '@/stores/pts';
import { ParticipantAvatar } from '../ui';
import { ParticipantInfo } from './ParticipantInfo';
import type { ParticipantProps, PermissionPtProps } from '../lib/types';
import { useRoomStore } from '@/stores/room';
import { useSocketStore } from '@/stores/socket';
import { SOCKET_EVENTS } from '@codejam/common';

/**
 * 참가자 정보를 표시하는 컴포넌트
 * - 아바타, 닉네임, 역할(role) 정보 표시
 * - 호스트 권한이 있는 경우 역할 변경 가능 (Editor ↔ Viewer)
 * - 온라인/오프라인 상태에 따라 불투명도 조절
 */
export const Participant = memo(
  ({ ptId, hasPermission = false }: ParticipantProps & PermissionPtProps) => {
    const pt = usePt(ptId);
    const { myPtId, roomCode } = useRoomStore();
    const { socket } = useSocketStore();

    if (!pt) return null;

    const isOnline = pt.presence === 'online';
    const opacity = isOnline ? 'opacity-100' : 'opacity-40';
    const isMe = ptId === myPtId;

    const isTargetHost = pt.role === 'host';
    const canToggle = hasPermission && !isMe && !isTargetHost;

    const handleToggleRole = () => {
      if (!socket || !socket.connected) {
        return;
      }

      socket.emit(SOCKET_EVENTS.UPDATE_PT, {
        roomCode,
        ptId: pt.ptId,
        role: pt.role === 'editor' ? 'viewer' : 'editor',
      });
    };

    return (
      <div
        className="flex items-center justify-between p-2 transition-colors
        select-none group hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className={`flex items-center space-x-3 ${opacity}`}>
          <ParticipantAvatar ptId={ptId} />
          <ParticipantInfo
            ptId={ptId}
            canToggle={canToggle}
            onToggleRole={handleToggleRole}
          />
        </div>
      </div>
    );
  },
);

Participant.displayName = 'Participant';
