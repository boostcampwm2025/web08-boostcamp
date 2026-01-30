import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  LIMITS,
  type ChatSystemPayload,
  type ChatMessagePayload,
} from '@codejam/common';
import { v7 as uuidv7 } from 'uuid';
import { useChatStore } from '../chat';
import { useRoomStore } from '../room';
import { usePtsStore } from '../pts';

/** 메시지 전송 타임아웃 (ms) */
const EMIT_TIMEOUT = 5000;

/**
 * Chat 관련 소켓 이벤트 핸들러 설정
 * @returns Cleanup function that removes event listeners
 */
export const setupChatEventHandlers = () => {
  const onChatSystem = (data: ChatSystemPayload) => {
    console.log(`💬 [CHAT_SYSTEM] ${data.type}: ${data.pt.nickname}`);
    // store에 메시지 추가 (클라이언트 메모리에만 저장)
    useChatStore.getState().addSystemMessage(data);
  };

  const onChatMessage = (data: ChatMessagePayload) => {
    console.log(`💬 [CHAT_MESSAGE] ${data.pt.nickname}: ${data.content}`);
    // store에 메시지 추가 (중복 방지 로직은 store 내부에서 처리)
    useChatStore.getState().addUserMessage(data, 'sent');
  };

  socket.on(SOCKET_EVENTS.CHAT_SYSTEM, onChatSystem);
  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);

  return () => {
    socket.off(SOCKET_EVENTS.CHAT_SYSTEM, onChatSystem);
    socket.off(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
  };
};

/**
 * 채팅 메시지 전송
 * - 낙관적 업데이트: 전송 전 'sending' 상태로 store에 추가
 * - ACK callback으로 성공/실패 처리
 * @param content 메시지 내용
 * @returns 생성된 메시지 id (실패 시 재전송/삭제에 사용)
 */
export const emitChatMessage = (content: string): string | null => {
  const trimmedContent = content.trim();

  // 길이 유효성 검사
  if (
    trimmedContent.length < LIMITS.CHAT_MESSAGE_MIN ||
    trimmedContent.length > LIMITS.CHAT_MESSAGE_MAX
  ) {
    console.warn('[CHAT] Invalid message length');
    return null;
  }

  // 현재 사용자 pt 정보 가져오기
  const myPtId = useRoomStore.getState().myPtId;
  if (!myPtId) {
    console.warn('[CHAT] Not joined to room');
    return null;
  }

  const myPt = usePtsStore.getState().pts[myPtId];
  if (!myPt) {
    console.warn('[CHAT] Pt info not found');
    return null;
  }

  // 낙관적 메시지 생성
  const messageId = uuidv7();
  const optimisticPayload: ChatMessagePayload = {
    id: messageId,
    pt: myPt,
    content: trimmedContent,
    createdAt: new Date().toISOString(),
  };

  // 'sending' 상태로 store에 추가 (낙관적 업데이트)
  useChatStore.getState().addUserMessage(optimisticPayload, 'sending');

  // 서버로 전송 (ACK callback 사용)
  socket
    .timeout(EMIT_TIMEOUT)
    .emit(
      SOCKET_EVENTS.CHAT_MESSAGE,
      { content: trimmedContent },
      (err: Error | null, response: { success: boolean } | undefined) => {
        if (err || !response?.success) {
          console.error('[CHAT] Message send failed:', err);
          useChatStore.getState().updateMessageStatus(messageId, 'failed');
        } else {
          // 서버에서 브로드캐스트가 오면 중복 방지로 무시됨
          // 여기서는 낙관적 메시지 상태만 업데이트
          useChatStore.getState().updateMessageStatus(messageId, 'sent');
        }
      },
    );

  return messageId;
};
