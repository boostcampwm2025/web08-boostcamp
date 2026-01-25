import { create } from 'zustand';
import type { PtId, Nickname } from '@codejam/common';

interface HostClaimState {
  // 호스트에게 표시할 요청 모달 상태
  isRequestModalOpen: boolean;
  requesterPtId: PtId | null;
  requesterNickname: Nickname | null;

  // 모달 열기 (요청 수신 시)
  openRequestModal: (requesterPtId: PtId, requesterNickname: Nickname) => void;
  // 모달 닫기 (수락/거절/취소 시)
  closeRequestModal: () => void;
}

export const useHostClaimStore = create<HostClaimState>((set) => ({
  isRequestModalOpen: false,
  requesterPtId: null,
  requesterNickname: null,

  openRequestModal: (requesterPtId, requesterNickname) =>
    set({
      isRequestModalOpen: true,
      requesterPtId,
      requesterNickname,
    }),

  closeRequestModal: () =>
    set({
      isRequestModalOpen: false,
      requesterPtId: null,
      requesterNickname: null,
    }),
}));
