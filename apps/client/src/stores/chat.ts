import { create } from 'zustand';
import {
  LIMITS,
  type ChatSystemPayload,
  type ChatMessagePayload,
  type Pt,
} from '@codejam/common';

// ==================== Message Types ====================

/** 메시지 전송 상태 */
export type MessageStatus = 'sending' | 'sent' | 'failed';

/** 시스템 메시지 (입장/퇴장 알림) */
export interface SystemMessage {
  id: string;
  type: 'system';
  message: string;
}

/** 사용자 채팅 메시지 */
export interface UserMessage {
  id: string;
  type: 'user';
  pt: Pt;
  content: string;
  createdAt: string;
  status: MessageStatus;
}

/** 채팅 메시지 통합 타입 */
export type ChatMessage = SystemMessage | UserMessage;

// ==================== Chat State ====================

/**
 * Chat 상태 관리
 * - 클라이언트 메모리에만 저장 (서버/DB 저장 안 함)
 * - 입장한 순간부터 받은 메시지가 계속 쌓임
 * - 채팅창이 닫혔다가 다시 열려도 메시지 유지
 * - 최대 300개 메시지 유지 (오래된 것부터 삭제)
 */
interface ChatState {
  messages: ChatMessage[];
  isChatOpen: boolean;
  unreadCount: number;

  panelPosition: { x: number; y: number } | null;
  panelSize: { width: number; height: number } | null;

  // Actions
  addSystemMessage: (payload: ChatSystemPayload) => void;
  addUserMessage: (payload: ChatMessagePayload, status?: MessageStatus) => void;
  updateMessageStatus: (id: string, status: MessageStatus) => void;
  removeMessage: (id: string) => void;
  setChatOpen: (isOpen: boolean) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  setPanelPosition: (position: { x: number; y: number }) => void;
  setPanelSize: (size: { width: number; height: number }) => void;
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
  panelPosition: null,
  panelSize: null,

  addSystemMessage: (payload: ChatSystemPayload) => {
    set((state) => {
      // 중복 방지: 같은 id의 메시지가 이미 있으면 무시
      if (state.messages.some((m) => m.id === payload.id)) {
        return state;
      }

      const message: SystemMessage = {
        id: payload.id,
        type: 'system',
        message: getSystemMessageText(payload.type, payload.pt),
      };

      // 메시지 수 제한 적용 (오래된 것부터 삭제)
      const newMessages = [...state.messages, message].slice(
        -LIMITS.CHAT_MESSAGES_LIMIT,
      );

      // 시스템 메시지는 unreadCount에 영향 없음
      return { messages: newMessages };
    });
  },

  addUserMessage: (
    payload: ChatMessagePayload,
    status: MessageStatus = 'sent',
  ) => {
    set((state) => {
      // 중복 방지: 같은 id의 메시지가 이미 있으면 무시
      if (state.messages.some((m) => m.id === payload.id)) {
        return state;
      }

      const message: UserMessage = {
        id: payload.id,
        type: 'user',
        pt: payload.pt,
        content: payload.content,
        createdAt: payload.createdAt,
        status,
      };

      // 메시지 수 제한 적용 (오래된 것부터 삭제)
      const newMessages = [...state.messages, message].slice(
        -LIMITS.CHAT_MESSAGES_LIMIT,
      );

      // 채팅창이 닫혀있을 때만 unreadCount 증가 (사용자 메시지만)
      const newUnreadCount = state.isChatOpen
        ? state.unreadCount
        : state.unreadCount + 1;

      return { messages: newMessages, unreadCount: newUnreadCount };
    });
  },

  updateMessageStatus: (id: string, status: MessageStatus) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id && m.type === 'user' ? { ...m, status } : m,
      ),
    }));
  },

  removeMessage: (id: string) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
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

  setPanelPosition: (position: { x: number; y: number }) => {
    set({ panelPosition: position });
  },

  setPanelSize: (size: { width: number; height: number }) => {
    set({ panelSize: size });
  },
}));
