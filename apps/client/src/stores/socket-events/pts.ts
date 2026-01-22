import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type Pt,
  type PtJoinedPayload,
  type PtDisconnectPayload,
  type PtLeftPayload,
  type RoomPtsPayload,
  type PtUpdatePayload,
  type HostTransferredPayload,
} from '@codejam/common';
import { usePtsStore } from '../pts';
import { useRoomStore } from '../room';
import { toast } from 'sonner';

export const setupPtsEventHandlers = () => {
  const onPtJoined = (data: PtJoinedPayload) => {
    console.log(`👋 [PT_JOINED] ${data.pt.nickname}`);
    usePtsStore.getState().setPt(data.pt.ptId, data.pt);
  };

  const onPtDisconnect = (data: PtDisconnectPayload) => {
    console.log(`👋 [PT_DISCONNECT] PtId: ${data.ptId}`);
    const pt = usePtsStore.getState().pts[data.ptId];
    if (!pt) return;
    usePtsStore.getState().setPt(pt.ptId, { ...pt, presence: 'offline' });
  };

  const onPtLeft = (data: PtLeftPayload) => {
    console.log(`⏰ [PT_LEFT] PtId: ${data.ptId} removed by TTL expiration`);
    usePtsStore.getState().removePt(data.ptId);
  };

  const onRoomPts = (data: RoomPtsPayload) => {
    console.log(`👥 [ROOM_PTS]`, data.pts);
    const pts: Pt[] = data.pts;
    const newPts: Record<string, Pt> = pts.reduce(
      (acc, pt) => {
        acc[pt.ptId] = pt;
        return acc;
      },
      {} as Record<string, Pt>,
    );
    usePtsStore.getState().setPts(newPts);
  };

  const onUpdatePt = (data: PtUpdatePayload) => {
    console.log(
      `🔄 [UPDATE_PT] PtId: ${data.pt.ptId} Nickname: ${data.pt.nickname}`,
    );
    const pt = usePtsStore.getState().pts[data.pt.ptId];
    if (!pt) return;

    const myPtId = useRoomStore.getState().myPtId;
    const isMe = data.pt.ptId === myPtId;

    if (isMe && pt.role !== data.pt.role) {
      if (data.pt.role === 'editor') {
        toast.success('편집 권한이 부여되었습니다.');
      } else if (data.pt.role === 'viewer') {
        toast.info('뷰어로 변경되었습니다.');
      }
    }

    const newPt = { ...pt, ...data.pt };
    usePtsStore.getState().setPt(data.pt.ptId, newPt);
  };

  const onHostTransferred = (data: HostTransferredPayload) => {
    console.log(`👑 [HOST_TRANSFERRED] New host: ${data.newHostPtId}`);

    const myPtId = useRoomStore.getState().myPtId;
    const isMe = data.newHostPtId === myPtId;
    const newHostPt = usePtsStore.getState().pts[data.newHostPtId];

    if (isMe) {
      // 새 호스트 본인에게
      toast.success('호스트 권한이 부여되었습니다.');
    } else {
      // 다른 참가자들에게
      toast.info(
        `${newHostPt?.nickname ?? '알 수 없음'}님이 새 호스트가 되었습니다.`,
      );
    }
  };

  socket.on(SOCKET_EVENTS.PT_JOINED, onPtJoined);
  socket.on(SOCKET_EVENTS.PT_DISCONNECT, onPtDisconnect);
  socket.on(SOCKET_EVENTS.PT_LEFT, onPtLeft);
  socket.on(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
  socket.on(SOCKET_EVENTS.UPDATE_PT, onUpdatePt);
  socket.on(SOCKET_EVENTS.HOST_TRANSFERRED, onHostTransferred);

  return () => {
    socket.off(SOCKET_EVENTS.PT_JOINED, onPtJoined);
    socket.off(SOCKET_EVENTS.PT_DISCONNECT, onPtDisconnect);
    socket.off(SOCKET_EVENTS.PT_LEFT, onPtLeft);
    socket.off(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
    socket.off(SOCKET_EVENTS.UPDATE_PT, onUpdatePt);
    socket.off(SOCKET_EVENTS.HOST_TRANSFERRED, onHostTransferred);
  };
};
