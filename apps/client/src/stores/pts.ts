import { create } from 'zustand';
import { ROLE, type Pt } from '@codejam/common';

interface PtsState {
  pts: Record<string, Pt>;

  setPts: (pts: Record<string, Pt>) => void;
  setPt: (ptId: string, pt: Pt) => void;
  removePt: (ptId: string) => void;

  updatePtPresence: (ptId: string, presence: Pt['presence']) => void;
}

export const usePtsStore = create<PtsState>((set) => ({
  pts: {},

  setPts: (newPts) => set({ pts: newPts }),
  setPt: (ptId, pt) => set((state) => ({ pts: { ...state.pts, [ptId]: pt } })),

  removePt: (ptId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [ptId]: _, ...rest } = state.pts;
      return { pts: rest };
    }),

  updatePtPresence: (ptId, presence) =>
    set((state) => {
      const pt = state.pts[ptId];
      if (!pt) return state;
      return { pts: { ...state.pts, [ptId]: { ...pt, presence } } };
    }),
}));

export const usePts = () => {
  return usePtsStore((state) => state.pts);
};

export const usePt = (ptId: string | null | undefined) => {
  return usePtsStore((state) => (ptId ? state.pts[ptId] : undefined));
};

export const useCanEditCount = () => {
  return usePtsStore(
    (state) =>
      Object.values(state.pts).filter(
        (pt) => pt.role === ROLE.EDITOR || pt.role === ROLE.HOST,
      ).length,
  );
};
