import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  MAX_CAN_EDIT_COUNT,
  type Pt,
  type PtJoinedPayload,
  type PtDisconnectPayload,
  type PtLeftPayload,
  type RoomPtsPayload,
  type PtUpdatePayload,
  type HostTransferredPayload,
  type HostClaimRequestPayload,
} from '@codejam/common';
import { usePtsStore } from '../pts';
import { useRoomStore } from '../room';
import { useHostClaimStore } from '../hostClaim';
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
        const canEditCount = Object.values(usePtsStore.getState().pts).filter(
          (p) => p.role === 'editor' || p.role === 'host',
        ).length;

        if (canEditCount >= MAX_CAN_EDIT_COUNT) {
          toast.success('편집 권한이 부여되었습니다.', {
            description: `현재 에디터가 ${canEditCount}명입니다. ${MAX_CAN_EDIT_COUNT}명 이상 동시 편집 시 작성 내역이 소실되거나 충돌이 발생할 수 있습니다.`,
            duration: 5000,
          });
        } else {
          toast.success('편집 권한이 부여되었습니다.');
        }
      } else if (data.pt.role === 'viewer') {
        toast.info('뷰어로 변경되었습니다.');
      }
    }

    // 호스트와 에디터에게 다른 사람이 에디터로 승격될 때 경고 표시
    if (
      !isMe &&
      pt.role !== data.pt.role &&
      data.pt.role === 'editor' &&
      myPtId
    ) {
      const myPt = usePtsStore.getState().pts[myPtId];
      const canEdit = myPt && (myPt.role === 'host' || myPt.role === 'editor');

      if (canEdit) {
        const canEditCount = Object.values(usePtsStore.getState().pts).filter(
          (p) => p.role === 'editor' || p.role === 'host',
        ).length;

        if (canEditCount >= MAX_CAN_EDIT_COUNT) {
          toast.warning(`현재 에디터가 ${canEditCount}명입니다.`, {
            description: `${MAX_CAN_EDIT_COUNT}명 이상 동시 편집 시 작성 내역이 소실되거나 충돌이 발생할 수 있습니다.`,
            duration: 5000,
          });
        }
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

    // 기존 호스트 화면의 요청 모달 닫기
    // - 수락 버튼 클릭 시: 이미 닫혀있으므로 무시됨
    // - 타임아웃 자동 수락 시: 모달이 열려있으므로 여기서 닫음
    useHostClaimStore.getState().closeRequestModal();

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

  // 호스트에게: 권한 요청 알림 (모달 표시)
  const onHostClaimRequest = (data: HostClaimRequestPayload) => {
    console.log(`🙋 [HOST_CLAIM_REQUEST] From: ${data.requesterNickname}`);
    useHostClaimStore
      .getState()
      .openRequestModal(data.requesterPtId, data.requesterNickname);
  };

  // 요청자에게: 요청 거절 알림
  const onHostClaimRejected = () => {
    console.log(`❌ [HOST_CLAIM_REJECTED]`);
    toast.error('호스트가 요청을 거절했습니다.');
  };

  // 호스트에게: 요청 취소 알림 (요청자 퇴장)
  const onHostClaimCancelled = () => {
    console.log(`🚪 [HOST_CLAIM_CANCELLED]`);
    useHostClaimStore.getState().closeRequestModal();
    toast.info('요청자가 퇴장했습니다.');
  };

  socket.on(SOCKET_EVENTS.PT_JOINED, onPtJoined);
  socket.on(SOCKET_EVENTS.PT_DISCONNECT, onPtDisconnect);
  socket.on(SOCKET_EVENTS.PT_LEFT, onPtLeft);
  socket.on(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
  socket.on(SOCKET_EVENTS.UPDATE_PT, onUpdatePt);
  socket.on(SOCKET_EVENTS.HOST_TRANSFERRED, onHostTransferred);
  socket.on(SOCKET_EVENTS.HOST_CLAIM_REQUEST, onHostClaimRequest);
  socket.on(SOCKET_EVENTS.HOST_CLAIM_REJECTED, onHostClaimRejected);
  socket.on(SOCKET_EVENTS.HOST_CLAIM_CANCELLED, onHostClaimCancelled);

  return () => {
    socket.off(SOCKET_EVENTS.PT_JOINED, onPtJoined);
    socket.off(SOCKET_EVENTS.PT_DISCONNECT, onPtDisconnect);
    socket.off(SOCKET_EVENTS.PT_LEFT, onPtLeft);
    socket.off(SOCKET_EVENTS.ROOM_PTS, onRoomPts);
    socket.off(SOCKET_EVENTS.UPDATE_PT, onUpdatePt);
    socket.off(SOCKET_EVENTS.HOST_TRANSFERRED, onHostTransferred);
    socket.off(SOCKET_EVENTS.HOST_CLAIM_REQUEST, onHostClaimRequest);
    socket.off(SOCKET_EVENTS.HOST_CLAIM_REJECTED, onHostClaimRejected);
    socket.off(SOCKET_EVENTS.HOST_CLAIM_CANCELLED, onHostClaimCancelled);
  };
};
