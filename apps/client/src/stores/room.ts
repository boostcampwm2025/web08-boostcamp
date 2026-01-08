import { create } from "zustand";

const roomCode = "prototype";

interface RoomState {
  roomCode: string | null;
  myPtId: string | null;

  setroomCode: (roomCode: string | null) => void;
  setMyPtId: (myPtId: string | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: roomCode,
  myPtId: null,

  setroomCode: (roomCode) => set({ roomCode }),
  setMyPtId: (myPtId) => set({ myPtId }),
}));
