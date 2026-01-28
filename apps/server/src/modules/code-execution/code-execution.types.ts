import {
  type CodeExecutionStartedPayload,
  type CodeExecutionStagePayload,
  type CodeExecutionDataPayload,
  type CodeExecutionCompletedPayload,
  type CodeExecutionErrorPayload,
} from '@codejam/common';

/**
 * Context for WebSocket event handlers
 */
export interface WebSocketHandlerContext {
  ws: WebSocket;
  connectionTimeout: NodeJS.Timeout;
  callbacks: ExecutionEventCallbacks;
  resolve: () => void;
  reject: (reason?: Error) => void;
  language: string;
  version: string;
  files: Array<{ name?: string; content: string }>;
  args?: string[];
}

/**
 * Callback interface for streaming execution events
 */
export interface CodeExecutionEventCallbacks {
  onStarted: (data: CodeExecutionStartedPayload) => void;
  onStage: (data: CodeExecutionStagePayload) => void;
  onData: (data: CodeExecutionDataPayload) => void;
  onCompleted: (data: CodeExecutionCompletedPayload) => void;
  onError: (data: CodeExecutionErrorPayload) => void;
}
