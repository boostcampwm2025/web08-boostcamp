import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TempState {
  tempRoomPassword: string | null;

  setTempRoomPassword: (tempRoomPassword?: string | undefined) => void;
  clear: () => void;
}

export const useTempStore = create<TempState>()(
  persist(
    (set) => ({
      tempRoomPassword: null,
      setTempRoomPassword: (tempRoomPassword) => set({ tempRoomPassword }),
      clear: () => set({ tempRoomPassword: null }),
    }),
    {
      name: 'temp-value',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useTempValue = () => {
  const store = useTempStore();

  return {
    tempRoomPassword: store.tempRoomPassword,
    setTempRoomPassword: store.setTempRoomPassword,
    clear: store.clear,
  };
};
