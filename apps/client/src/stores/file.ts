import { create } from 'zustand';
import { Doc, Map as YMap, Text as YText } from 'yjs';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import { SOCKET_EVENTS } from '@codejam/common';
import { v7 as uuidv7 } from 'uuid';
import { createDecoder } from 'lib0/decoding';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { readSyncMessage, writeUpdate } from 'y-protocols/sync';
import { useSocketStore } from './socket';
import { emitAwarenessUpdate, emitFileUpdate } from './socket-events';

type AwarenessChanges = {
  added: number[];
  updated: number[];
  removed: number[];
};

interface FileState {
  yDoc: Doc | null;
  awareness: Awareness | null;
  activeFileId: string | null;
  isInitialized: boolean;

  // Capacity State (용량 측정)
  capacityBytes: number;
  capacityPercentage: number;
  isOverLimit: boolean;

  // Remote update lock - IME composition
  isRemoteUpdateLocked: boolean;
  pendingRemoteDocUpdates: Uint8Array[];
  pendingRemoteAwarenessUpdates: Uint8Array[];

  // Actions
  initialize: (roomCode: string) => number;
  destroy: () => void;
  setActiveFile: (fileId: string) => void;
  setRemoteUpdateLock: (locked: boolean) => void;
  applyRemoteDocUpdate: (message: Uint8Array) => void;
  applyRemoteAwarenessUpdate: (message: Uint8Array) => void;
  flushPendingRemoteUpdates: () => void;
  measureCapacity: () => number;

  // CRUD Actions
  createFile: (name: string, content?: string) => string;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  overwriteFile: (fileId: string, content?: string) => void;
  getFileId: (name: string) => string | undefined;
  getFilesMap: () => YMap<YMap<unknown>> | null;
  getFileIdMap: () => YMap<string> | null;
}

export const useFileStore = create<FileState>((set, get) => ({
  yDoc: null,
  awareness: null,
  activeFileId: null,
  isInitialized: false,

  // Capacity State 초기값
  capacityBytes: 0,
  capacityPercentage: 0,
  isOverLimit: false,

  // Remote update lock 초기값
  isRemoteUpdateLocked: false,
  pendingRemoteDocUpdates: [],
  pendingRemoteAwarenessUpdates: [],

  initialize: (roomCode: string) => {
    const state = get();
    if (state.isInitialized) {
      return state.yDoc!.clientID;
    }

    // Create Y.Doc and Awareness

    const yDoc = new Doc();
    const awareness = new Awareness(yDoc);

    // Setup YDoc update listener

    const onYDocUpdate = (update: Uint8Array, origin: unknown) => {
      // 용량 측정 (로컬/리모트 모두)
      get().measureCapacity();

      if (origin === 'remote') return;

      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const data = toUint8Array(encoder);

      const { isConnected } = useSocketStore.getState();
      if (!isConnected || !roomCode) return;

      emitFileUpdate(roomCode, data);
    };

    yDoc.on('update', onYDocUpdate);

    // Setup awareness update listener

    const onAwarenessUpdate = (changes: AwarenessChanges, origin: unknown) => {
      if (origin === 'remote') return;

      const changed = changes.added.concat(changes.updated, changes.removed);
      if (changed.length === 0) return;

      const message = encodeAwarenessUpdate(awareness, changed);

      const { isConnected, roomCode } = useSocketStore.getState();
      if (!isConnected || !roomCode) return;

      emitAwarenessUpdate(roomCode, message);
    };

    awareness.on('update', onAwarenessUpdate);

    // Save YDoc and awareness

    set({
      yDoc,
      awareness,
      isInitialized: true,
    });

    // Request initial state from server

    const { send, isConnected } = useSocketStore.getState();

    if (isConnected) {
      send(SOCKET_EVENTS.REQUEST_DOC);
      send(SOCKET_EVENTS.REQUEST_AWARENESS);
    }

    return yDoc.clientID;
  },

  setActiveFile: (fileId: string) => {
    set({ activeFileId: fileId });

    // Update awareness with current file
    const state = get();
    if (state.awareness) {
      const currentState = state.awareness.getLocalState();
      state.awareness.setLocalStateField('user', {
        ...currentState?.user,
        currentFileId: fileId,
      });
    }
  },

  setRemoteUpdateLock: (locked: boolean) => {
    // Prevent redundant operations
    if (locked === get().isRemoteUpdateLocked) return;

    // Flush before unlocking
    // This prevents new updates from being processed while flushing
    if (!locked) get().flushPendingRemoteUpdates();

    set({ isRemoteUpdateLocked: locked });
    console.log('[Remote update lock]', locked);
  },

  applyRemoteDocUpdate: (message: Uint8Array) => {
    const { yDoc, isRemoteUpdateLocked } = get();
    if (!yDoc) return;

    // Queue update if locked
    if (isRemoteUpdateLocked) {
      set((state) => {
        const updates = [...state.pendingRemoteDocUpdates, message];
        return { pendingRemoteDocUpdates: updates };
      });
      return;
    }

    // Apply remote update immediately
    applyRemoteDocUpdate(yDoc, message);
  },

  flushPendingRemoteUpdates: () => {
    const {
      yDoc,
      awareness,
      pendingRemoteDocUpdates,
      pendingRemoteAwarenessUpdates,
    } = get();

    if (
      !yDoc ||
      (pendingRemoteDocUpdates.length === 0 &&
        pendingRemoteAwarenessUpdates.length === 0)
    )
      return;

    // Clear the queues first to prevent re-entrancy issues
    set({ pendingRemoteDocUpdates: [], pendingRemoteAwarenessUpdates: [] });

    // Apply each queued doc update
    pendingRemoteDocUpdates.forEach((message) => {
      applyRemoteDocUpdate(yDoc, message);
    });

    // Apply each queued awareness update
    if (awareness) {
      pendingRemoteAwarenessUpdates.forEach((message) => {
        applyRemoteAwarenessUpdate(awareness, message);
      });
    }
  },

  applyRemoteAwarenessUpdate: (message: Uint8Array) => {
    const { awareness, isRemoteUpdateLocked } = get();
    if (!awareness) return;

    // Queue update if locked

    if (isRemoteUpdateLocked) {
      set((state) => {
        const updates = [...state.pendingRemoteAwarenessUpdates, message];
        return { pendingRemoteAwarenessUpdates: updates };
      });
      return;
    }

    applyRemoteAwarenessUpdate(awareness, message);
  },

  destroy: () => {
    const { yDoc, awareness } = get();
    yDoc?.destroy();
    awareness?.destroy();

    set({
      yDoc: null,
      awareness: null,
      activeFileId: null,
      isInitialized: false,
    });
  },

  // CRUD: 파일 생성
  createFile: (name: string, content?: string) => {
    const { yDoc } = get();
    if (!yDoc) return '';

    const fileId = uuidv7();
    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    const fileIdMap = yDoc.getMap('map') as YMap<string>;

    yDoc.transact(() => {
      const fileMap = new YMap<unknown>();
      const yText = new YText();

      fileMap.set('name', name);
      fileMap.set('content', yText);

      if (content) {
        yText.insert(0, content);
      }

      filesMap.set(fileId, fileMap);
      fileIdMap.set(name, fileId);
    });

    return fileId;
  },

  // CRUD: 파일 삭제
  deleteFile: (fileId: string) => {
    const { yDoc } = get();
    if (!yDoc) return;

    const filesMap = yDoc.getMap('files');
    filesMap.delete(fileId);
  },

  // CRUD: 파일 이름 변경
  renameFile: (fileId: string, newName: string) => {
    const { yDoc } = get();
    if (!yDoc) return;

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    const fileMap = filesMap.get(fileId);

    if (fileMap) {
      fileMap.set('name', newName);
    }
  },

  // CRUD: fileId 얻어오기
  getFileId: (name: string): string | undefined => {
    const { yDoc } = get();
    if (!yDoc) return;

    const fileIdMap = yDoc.getMap('map') as YMap<string>;
    if (!fileIdMap) {
      return undefined;
    }

    return fileIdMap.get(name);
  },

  // CRUD: 파일 덮어쓰기
  overwriteFile(fileId: string, content?: string) {
    const { yDoc } = get();
    if (!yDoc) return;

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    const fileMap = filesMap.get(fileId);

    if (fileMap) {
      yDoc.transact(() => {
        const yText = new YText();
        fileMap.set('content', yText);

        if (content) {
          yText.insert(0, content);
        }
      });
    }
  },

  // CRUD: filesMap 반환 (Observer 등록용)
  getFilesMap: () => {
    const { yDoc } = get();
    if (!yDoc) return null;

    return yDoc.getMap('files') as YMap<YMap<unknown>>;
  },

  // CRUD: 파일 목록
  getFileIdMap: (): YMap<string> | null => {
    const { yDoc } = get();
    if (!yDoc) {
      return null;
    }

    return yDoc.getMap('map') as YMap<string>;
  },

  // 용량 측정: 전체 파일의 텍스트 길이 합산
  measureCapacity: () => {
    const { yDoc } = get();
    if (!yDoc) return 0;

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    let total = 0;

    filesMap.forEach((fileMap) => {
      const content = fileMap.get('content') as YText;
      if (content) {
        total += content.toString().length;
      }
    });

    const percentage = Math.min((total / 1_000_000) * 100, 100);

    set({
      capacityBytes: total,
      capacityPercentage: percentage,
      isOverLimit: total >= 1_000_000,
    });

    return total;
  },
}));

/**
 * Apply remote doc update to Y.Doc (internal helper)
 */
const applyRemoteDocUpdate = (yDoc: Doc, message: Uint8Array) => {
  const update =
    message instanceof Uint8Array ? message : new Uint8Array(message);

  const decoder = createDecoder(update);
  const encoder = createEncoder();

  readSyncMessage(decoder, encoder, yDoc, 'remote');

  // Send reply if needed (sync protocol)
  const reply = toUint8Array(encoder);
  if (reply.byteLength > 0) {
    const { roomCode } = useSocketStore.getState();
    if (roomCode) emitFileUpdate(roomCode, reply);
  }
};

/**
 * Apply remote awareness update (internal helper)
 */
const applyRemoteAwarenessUpdate = (
  awareness: Awareness,
  message: Uint8Array,
) => {
  const update =
    message instanceof Uint8Array ? message : new Uint8Array(message);

  applyAwarenessUpdate(awareness, update, 'remote');
};
