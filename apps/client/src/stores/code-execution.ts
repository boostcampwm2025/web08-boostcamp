import { create } from 'zustand';
import type {
  CodeExecutionResultPayload,
  CodeExecutionErrorPayload,
} from '@codejam/common';

interface CodeExecutionState {
  // Current execution state
  isExecuting: boolean;
  currentFileId: string | null;

  // Result and error
  result: CodeExecutionResultPayload | null;
  error: CodeExecutionErrorPayload | null;

  // Actions
  setExecuting: (fileId: string) => void;
  setResult: (data: CodeExecutionResultPayload) => void;
  setError: (data: CodeExecutionErrorPayload) => void;
}

export const useCodeExecutionStore = create<CodeExecutionState>((set) => ({
  isExecuting: false,
  currentFileId: null,
  result: null,
  error: null,

  setExecuting: (fileId: string) => {
    set({
      isExecuting: true,
      currentFileId: fileId,
      result: null,
      error: null,
    });
  },

  setResult: (data: CodeExecutionResultPayload) => {
    set({
      isExecuting: false,
      result: data,
      error: null,
    });
  },

  setError: (data: CodeExecutionErrorPayload) => {
    set({
      isExecuting: false,
      result: null,
      error: data,
    });
  },
}));
