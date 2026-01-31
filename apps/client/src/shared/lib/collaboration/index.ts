import { Doc } from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { YDocManager } from './ydoc-manager';
import { AwarenessManager } from './awareness-manager';
import { FileManager } from './file-manager';

/**
 * Collaboration context containing all real-time collaboration instances
 * Provides Y.js document, awareness, and managers for collaborative editing
 */
export interface CollaborationContext {
  yDoc: Doc;
  awareness: Awareness;
  yDocManager: YDocManager;
  awarenessManager: AwarenessManager;
  fileManager: FileManager;
}

/**
 * Factory function to create a complete collaboration context
 * Creates Y.Doc, Awareness, and all managers for real-time collaboration
 *
 * @returns CollaborationContext with all collaboration instances and managers
 *
 * @example
 * ```typescript
 * const { yDoc, awareness, yDocManager, awarenessManager, fileManager } = createCollaborationContext();
 *
 * // Setup listeners
 * yDocManager.onUpdate((update) => { ... });
 * awarenessManager.onUpdate((update) => { ... });
 * fileManager.onFilesUpdate(() => { ... });
 * ```
 */
export function createCollaborationContext(): CollaborationContext {
  // Create Y.Doc
  const yDoc = new Doc();

  // Create Awareness
  const awareness = new Awareness(yDoc);

  // Create managers
  const yDocManager = new YDocManager(yDoc);
  const awarenessManager = new AwarenessManager(awareness);
  const fileManager = new FileManager(yDoc);

  return {
    yDoc,
    awareness,
    yDocManager,
    awarenessManager,
    fileManager,
  };
}

// Re-export managers for direct imports if needed
export { YDocManager } from './ydoc-manager';
export { AwarenessManager } from './awareness-manager';
export { FileManager, type FileMetadata } from './file-manager';
export { FileNode } from './file-node';
