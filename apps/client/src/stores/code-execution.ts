import { create } from 'zustand';
import type {
  CodeExecutionResultPayload,
  CodeExecutionErrorPayload,
  CodeExecutionStartedPayload,
  CodeExecutionStagePayload,
  CodeExecutionDataPayload,
  CodeExecutionCompletedPayload,
} from '@codejam/common';

export type CodeExecutionResult = CodeExecutionResultPayload;
export type CodeExecutionError = CodeExecutionErrorPayload;
export type CodeExecutionRuntime = CodeExecutionStartedPayload;
export type CodeExecutionData = CodeExecutionDataPayload;
export type CodeExecutionStage = CodeExecutionStagePayload;
export type CodeExecutionExit = CodeExecutionCompletedPayload;

interface CodeExecutionState {
  // Current execution state
  isExecuting: boolean;
  currentFileId: string | null;

  // Streaming state (latest chunks)
  runtime: CodeExecutionRuntime | null;
  stage: CodeExecutionStage | null;
  data: CodeExecutionData | null;
  exit: CodeExecutionExit | null;

  // Result and error
  result: CodeExecutionResult | null;
  error: CodeExecutionError | null;

  // Actions
  setExecuting: (fileId: string) => void;
  setRuntime: (data: CodeExecutionRuntime) => void;
  setStage: (data: CodeExecutionStage) => void;
  setData: (data: CodeExecutionData) => void;
  setExit: (data: CodeExecutionExit) => void;
  setResult: (data: CodeExecutionResult) => void;
  setError: (data: CodeExecutionError) => void;
  reset: () => void;
}

const initialState = {
  isExecuting: false,
  currentFileId: null,
  runtime: null,
  stage: null,
  data: null,
  exit: null,
  result: null,
  error: null,
};

export const useCodeExecutionStore = create<CodeExecutionState>((set) => ({
  ...initialState,

  setExecuting: (fileId: string) => {
    set({
      ...initialState,
      isExecuting: true,
      currentFileId: fileId,
    });
  },

  setRuntime: (data: CodeExecutionRuntime) => {
    set({ runtime: data });
  },

  setStage: (data: CodeExecutionStage) => {
    set({ stage: data });
  },

  setData: (data: CodeExecutionData) => {
    set({ data });
  },

  setExit: (data: CodeExecutionExit) => {
    set({
      isExecuting: false,
      exit: data,
    });
  },

  setResult: (data: CodeExecutionResult) => {
    set({
      isExecuting: false,
      result: data,
      error: null,
    });
  },

  setError: (data: CodeExecutionError) => {
    set({
      isExecuting: false,
      result: null,
      error: data,
    });
  },

  reset: () => {
    set(initialState);
  },
}));
