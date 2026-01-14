import { create } from 'zustand';

interface RoomState {
  roomCode: string | null;
  myPtId: string | null;

  setRoomCode: (roomCode: string | null) => void;
  setMyPtId: (myPtId: string | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  myPtId: null,

  setRoomCode: (roomCode) => set({ roomCode }),
  setMyPtId: (myPtId) => {
    set({ myPtId });
  },
}));
