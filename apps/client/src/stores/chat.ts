import { create } from 'zustand';
import type { ChatSystemPayload, Pt } from '@codejam/common';

// 시스템 메시지와 사용자 채팅을 통합 관리하는 타입
export type ChatMessage =
  | { id: string; type: 'system'; message: string }
  | { id: string; type: 'user'; nickname: string; content: string }; // 추후 추가

/**
 * Chat 상태 관리
 * - 클라이언트 메모리에만 저장 (서버/DB 저장 안 함)
 * - 입장한 순간부터 받은 메시지가 계속 쌓임
 * - 채팅창이 닫혔다가 다시 열려도 메시지 유지
 */
interface ChatState {
  messages: ChatMessage[];
  isChatOpen: boolean;
  unreadCount: number;

  // Actions
  addSystemMessage: (payload: ChatSystemPayload) => void;
  setChatOpen: (isOpen: boolean) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

/**
 * 시스템 메시지 텍스트 생성
 * 형식: "[닉네임#해시]님이 입장/퇴장하셨습니다"
 */
function getSystemMessageText(type: 'join' | 'leave', pt: Pt): string {
  const displayName = `${pt.nickname}#${pt.ptHash}`;
  switch (type) {
    case 'join':
      return `${displayName}님이 입장하셨습니다`;
    case 'leave':
      return `${displayName}님이 퇴장하셨습니다`;
    default:
      return '';
  }
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isChatOpen: false,
  unreadCount: 0,

  addSystemMessage: (payload: ChatSystemPayload) => {
    const message: ChatMessage = {
      id: payload.id,
      type: 'system',
      message: getSystemMessageText(payload.type, payload.pt),
    };

    set((state) => ({
      messages: [...state.messages, message],
      // 채팅창이 열려있으면 unreadCount 증가 안 함, 닫혀있으면 증가
      unreadCount: state.isChatOpen ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  setChatOpen: (isOpen: boolean) => {
    set({ isChatOpen: isOpen });
    if (isOpen) {
      // 채팅창이 열리면 읽지 않은 메시지 카운트 초기화
      set({ unreadCount: 0 });
    }
  },

  incrementUnreadCount: () => {
    set((state) => ({
      unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
    }));
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },
}));
