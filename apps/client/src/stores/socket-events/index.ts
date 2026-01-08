import { setupRoomEventHandlers, emitJoinRoom } from "./room";
import { setupPtsEventHandlers } from "./pts";
import {
  setupFileEventHandlers,
  emitFileUpdate,
  emitAwarenessUpdate,
} from "./file";

export { emitJoinRoom, emitFileUpdate, emitAwarenessUpdate };

/**
 * Setup all domain-specific event handlers
 * @param roomCode - The room code to join
 * @returns Cleanup function that removes all event listeners
 */
export const setupDomainEventHandlers = () => {
  const cleanupRoom = setupRoomEventHandlers();
  const cleanupPts = setupPtsEventHandlers();
  const cleanupFile = setupFileEventHandlers();

  return () => {
    cleanupRoom();
    cleanupPts();
    cleanupFile();
  };
};
