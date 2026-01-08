import { create } from "zustand";
import { saveRoomPtId } from "@/shared/lib/storage";

interface RoomState {
  roomCode: string | null;
  myPtId: string | null;

  setRoomCode: (roomCode: string | null) => void;
  setMyPtId: (myPtId: string | null) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomCode: null,
  myPtId: null,

  setRoomCode: (roomCode) => set({ roomCode }),
  setMyPtId: (myPtId) => {
    const { roomCode } = get();
    set({ myPtId });

    if (!roomCode || !myPtId) return;
    saveRoomPtId(roomCode, myPtId);
  },
}));
