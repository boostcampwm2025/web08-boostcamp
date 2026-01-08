import { create } from "zustand";

interface RoomState {
  roomCode: string | null;
  myPtId: string | null;

  setRoomCode: (roomCode: string | undefined) => void;
  setMyPtId: (myPtId: string | undefined) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: '',
  myPtId: null,

  setRoomCode: (roomCode) => set({ roomCode }),
  setMyPtId: (myPtId) => set({ myPtId }),
}));
