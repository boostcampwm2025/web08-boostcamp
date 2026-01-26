import { create } from 'zustand';
import type {
  RoomType,
  WhoCanDestroyRoom,
  RoomCode,
  PtId,
} from '@codejam/common';

interface RoomState {
  roomCode: RoomCode | null;
  myPtId: PtId | null;
  roomType: RoomType | null;
  whoCanDestroyRoom: WhoCanDestroyRoom | null;
  hasHostPassword: boolean | null;

  setRoomCode: (roomCode: RoomCode | null) => void;
  setMyPtId: (myPtId: PtId | null) => void;
  setRoomType: (roomType: RoomType | null) => void;
  setWhoCanDestroyRoom: (whoCanDestroyRoom: WhoCanDestroyRoom | null) => void;
  setHasHostPassword: (hasHostPassword: boolean | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  myPtId: null,
  roomType: null,
  whoCanDestroyRoom: null,
  hasHostPassword: null,

  setRoomCode: (roomCode) => set({ roomCode }),
  setMyPtId: (myPtId) => set({ myPtId }),
  setRoomType: (roomType) => set({ roomType }),
  setWhoCanDestroyRoom: (whoCanDestroyRoom) => set({ whoCanDestroyRoom }),
  setHasHostPassword: (hasHostPassword) => set({ hasHostPassword }),
}));
