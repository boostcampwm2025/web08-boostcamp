import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type CodeExecutionStartedPayload,
  type CodeExecutionStagePayload,
  type CodeExecutionDataPayload,
  type CodeExecutionCompletedPayload,
  type CodeExecutionResultPayload,
  type CodeExecutionErrorPayload,
} from '@codejam/common';
import { useCodeExecutionStore } from '../code-execution';

export const setupCodeExecutionEventHandlers = () => {
  // Streaming events
  const onCodeExecutionStarted = (data: CodeExecutionStartedPayload) => {
    console.log(`🚀 [CODE_EXECUTION_STARTED]`, data);
    const { setRuntime } = useCodeExecutionStore.getState();
    setRuntime(data);
  };

  const onCodeExecutionStage = (data: CodeExecutionStagePayload) => {
    console.log(`🔄 [CODE_EXECUTION_STAGE]`, data);
    const { setStage } = useCodeExecutionStore.getState();
    setStage(data);
  };

  const onCodeExecutionData = (data: CodeExecutionDataPayload) => {
    console.log(`📊 [CODE_EXECUTION_DATA]`, data.stream, data.data);
    const { setData } = useCodeExecutionStore.getState();
    setData(data);
  };

  const onCodeExecutionCompleted = (data: CodeExecutionCompletedPayload) => {
    console.log(`✅ [CODE_EXECUTION_COMPLETED]`, data);
    const { setExit } = useCodeExecutionStore.getState();
    setExit(data);
  };

  // Non-streaming events
  const onCodeExecutionResult = (data: CodeExecutionResultPayload) => {
    console.log(`✅ [CODE_EXECUTION_RESULT]`, data);
    const { setResult } = useCodeExecutionStore.getState();
    setResult(data);
  };

  // Execution Error
  const onCodeExecutionError = (data: CodeExecutionErrorPayload) => {
    console.log(`❌ [CODE_EXECUTION_ERROR]`, data);
    const { setError } = useCodeExecutionStore.getState();
    setError(data);
  };

  // Register streaming event handlers
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_STARTED, onCodeExecutionStarted);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_STAGE, onCodeExecutionStage);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_DATA, onCodeExecutionData);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_COMPLETED, onCodeExecutionCompleted);

  // Register fallback event handlers
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_RESULT, onCodeExecutionResult);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_ERROR, onCodeExecutionError);

  return () => {
    // Cleanup event handlers
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_STARTED, onCodeExecutionStarted);
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_STAGE, onCodeExecutionStage);
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_DATA, onCodeExecutionData);
    socket.off(
      SOCKET_EVENTS.CODE_EXECUTION_COMPLETED,
      onCodeExecutionCompleted,
    );
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_RESULT, onCodeExecutionResult);
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_ERROR, onCodeExecutionError);
  };
};

export const emitExecuteCode = (
  fileId: string,
  language: string,
  interactive = false,
) => {
  if (!socket.connected) return;

  // Set executing state when emitting
  useCodeExecutionStore.getState().setExecuting(fileId);

  socket.emit(SOCKET_EVENTS.EXECUTE_CODE, { fileId, language, interactive });
};
