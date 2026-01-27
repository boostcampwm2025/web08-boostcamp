import { setupRoomEventHandlers, emitJoinRoom } from './room';
import { setupPtsEventHandlers } from './pts';
import {
  setupFileEventHandlers,
  emitFileUpdate,
  emitAwarenessUpdate,
} from './file';
import {
  setupCodeExecutionEventHandlers,
  emitExecuteCode,
} from './code-execution';

export { emitJoinRoom, emitFileUpdate, emitAwarenessUpdate, emitExecuteCode };

/**
 * Setup all domain-specific event handlers
 * @param roomCode - The room code to join
 * @returns Cleanup function that removes all event listeners
 */
export const setupDomainEventHandlers = () => {
  const cleanupRoom = setupRoomEventHandlers();
  const cleanupPts = setupPtsEventHandlers();
  const cleanupFile = setupFileEventHandlers();
  const cleanupCodeExecution = setupCodeExecutionEventHandlers();

  return () => {
    cleanupRoom();
    cleanupPts();
    cleanupFile();
    cleanupCodeExecution();
  };
};
