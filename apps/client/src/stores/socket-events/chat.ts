import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS, type ChatSystemPayload } from '@codejam/common';
import { useChatStore } from '../chat';

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

  socket.on(SOCKET_EVENTS.CHAT_SYSTEM, onChatSystem);

  return () => {
    socket.off(SOCKET_EVENTS.CHAT_SYSTEM, onChatSystem);
  };
};
