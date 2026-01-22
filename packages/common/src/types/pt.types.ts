export interface Pt {
  ptId: string;
  ptHash: string;
  nickname: string;
  role: "host" | "editor" | "viewer";
  color: string;
  presence: "online" | "offline";
  createdAt: string;
}

/** 새 참가자 입장 알림 (S -> C) */
export interface PtJoinedPayload {
  pt: Pt;
}

/** 참가자 연결 끊김 알림 (S -> C) */
export interface PtDisconnectPayload {
  ptId: string;
}

/** 참가자 퇴장 알림 (S -> C) */
export interface PtLeftPayload {
  ptId: string;
}

/** 참가자 정보 변경 (S -> C) */
export interface PtUpdatePayload {
  pt: Pt;
}

/** 참가자 권한 업데이트 (C <-> S) */
export interface PtUpdateRolePayload {
  ptId: string;
  role: "editor" | "viewer";
}

/** 참가자 닉네임 업데이트 (C <-> S) */
export interface PtUpdateNamePayload {
  ptId: string;
  nickname: string;
}

/** 호스트 변경 알림 (S -> C) */
export interface HostTransferredPayload {
  newHostPtId: string;
}

/** 호스트 권한 요청 (C -> S) */
export interface ClaimHostPayload {
  hostPassword: string;
}

/** 호스트에게 권한 요청 알림 (S -> C) */
export interface HostClaimRequestPayload {
  requesterPtId: string;
  requesterNickname: string;
}
