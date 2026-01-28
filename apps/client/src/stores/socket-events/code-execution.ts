import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type CodeExecutionResultPayload,
  type CodeExecutionErrorPayload,
} from '@codejam/common';
import { useCodeExecutionStore } from '../code-execution';

export const setupCodeExecutionEventHandlers = () => {
  const onCodeExecutionResult = (data: CodeExecutionResultPayload) => {
    console.log(`✅ [CODE_EXECUTION_RESULT]`, data);
    useCodeExecutionStore.getState().setResult(data);
  };

  const onCodeExecutionError = (data: CodeExecutionErrorPayload) => {
    console.log(`❌ [CODE_EXECUTION_ERROR]`, data);
    useCodeExecutionStore.getState().setError(data);
  };

  socket.on(SOCKET_EVENTS.CODE_EXECUTION_RESULT, onCodeExecutionResult);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_ERROR, onCodeExecutionError);

  return () => {
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_RESULT, onCodeExecutionResult);
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_ERROR, onCodeExecutionError);
  };
};

export const emitExecuteCode = (fileId: string, language: string) => {
  if (!socket.connected) return;

  // Set executing state when emitting
  useCodeExecutionStore.getState().setExecuting(fileId);

  socket.emit(SOCKET_EVENTS.EXECUTE_CODE, { fileId, language });
};
