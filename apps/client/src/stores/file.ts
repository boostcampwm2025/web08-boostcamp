import { create } from 'zustand';
import { Doc, Map as YMap, Text as YText } from 'yjs';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import { SOCKET_EVENTS, LIMITS, type AwarenessUpdate } from '@codejam/common';
import { v7 as uuidv7 } from 'uuid';
import { createDecoder } from 'lib0/decoding';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { readSyncMessage, writeUpdate } from 'y-protocols/sync';
import { useSocketStore } from './socket';
import { emitAwarenessUpdate, emitFileUpdate } from './socket-events';

interface FileState {
  yDoc: Doc | null;
  awareness: Awareness | null;
  activeFileId: string | null;
  viewerFileId: string | null;
  isInitialized: boolean;
  isInitialDocLoaded: boolean;

  // 업로드 파일
  tempFiles: File[];

  // Capacity State (용량 측정)
  capacityBytes: number;
  capacityPercentage: number;
  isOverLimit: boolean;

  // Actions
  initialize: (roomCode: string) => number;
  destroy: () => void;
  setActiveFile: (fileId: string) => void;
  setViewerFile: (fileId: string) => void;
  initializeActiveFile: () => void;
  applyRemoteDocUpdate: (message: Uint8Array) => void;
  applyRemoteAwarenessUpdate: (message: Uint8Array) => void;
  measureCapacity: () => number;

  // CRUD Actions
  addTempFile: (file: File) => void;
  shiftTempFile: () => void;
  clearTempFile: () => void;
  createFile: (name: string, content?: string) => string;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  overwriteFile: (fileId: string, content?: string) => void;
  getFileId: (name: string) => string | undefined;
  getTempFiles: () => File[];
  getFilesMap: () => YMap<YMap<unknown>> | null;
  getFileIdMap: () => YMap<string> | null;

  getFileName: (fileId: string | null) => string | null;
  getFileContent: (fileId: string) => string | null;
  getActiveFileContent: () => string | null;
}

export const useFileStore = create<FileState>((set, get) => ({
  yDoc: null,
  awareness: null,
  activeFileId: null,
  viewerFileId: null,
  isInitialized: false,
  isInitialDocLoaded: false,

  tempFiles: [],

  // Capacity State 초기값
  capacityBytes: 0,
  capacityPercentage: 0,
  isOverLimit: false,

  initialize: (roomCode: string) => {
    const state = get();
    if (state.isInitialized) {
      return state.yDoc!.clientID;
    }

    // Create Y.Doc and Awareness

    const yDoc = new Doc();
    const awareness = new Awareness(yDoc);

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;

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

    const onAwarenessUpdate = (changes: AwarenessUpdate, origin: unknown) => {
      if (origin === 'remote') return;

      const changed = changes.added.concat(changes.updated, changes.removed);
      if (changed.length === 0) return;

      const message = encodeAwarenessUpdate(awareness, changed);

      const { isConnected, roomCode } = useSocketStore.getState();
      if (!isConnected || !roomCode) return;

      emitAwarenessUpdate(roomCode, message);
    };

    awareness.on('update', onAwarenessUpdate);

    // Detect file changes

    const onFilesMapUpdate = () => {
      const { activeFileId } = get();
      if (!activeFileId) return;

      // Check if active file still exists
      if (!filesMap.has(activeFileId)) {
        set({ activeFileId: null });
      }
    };

    filesMap.observe(onFilesMapUpdate);

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

  setViewerFile: (fileId: string | null) => {
    set({ viewerFileId: fileId });
  },

  applyRemoteDocUpdate: (message: Uint8Array) => {
    const { yDoc, isInitialDocLoaded } = get();
    if (!yDoc) return;

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

    // Flag Y.Doc as initialized
    if (!isInitialDocLoaded) {
      set({ isInitialDocLoaded: true });
    }
  },

  initializeActiveFile: () => {
    const { yDoc, activeFileId, setActiveFile } = get();
    if (!yDoc || activeFileId) return;

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    const firstFileId = Array.from(filesMap.keys())[0];
    if (!firstFileId) return;

    setActiveFile(firstFileId);
  },

  applyRemoteAwarenessUpdate: (message: Uint8Array) => {
    const state = get();
    if (!state.awareness) return;

    const update =
      message instanceof Uint8Array ? message : new Uint8Array(message);

    applyAwarenessUpdate(state.awareness, update, 'remote');
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

  getTempFiles: () => {
    return get().tempFiles;
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

    const percentage = Math.min(
      (total / LIMITS.MAX_DOC_SIZE_CLIENT) * 100,
      100,
    );

    set({
      capacityBytes: total,
      capacityPercentage: percentage,
      isOverLimit: total >= LIMITS.MAX_DOC_SIZE_CLIENT,
    });

    return total;
  },

  addTempFile: (file) => {
    const target = get().tempFiles;
    target.push(file);

    set({ tempFiles: target });
  },

  shiftTempFile: () => {
    const target = get().tempFiles;
    target.shift();

    set({ tempFiles: target });
  },

  clearTempFile: () => {
    set({ tempFiles: [] });
  },

  // 파일 이름 가져오기
  getFileName: (fileId: string | null) => {
    if (!fileId) {
      return null;
    }
    const { yDoc } = get();
    if (!yDoc) return null;

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    const fileMap = filesMap.get(fileId);
    if (!fileMap) return null;

    const name = fileMap.get('name') as string;
    return name || null;
  },

  // 파일 내용 가져오기
  getFileContent: (fileId: string) => {
    const { yDoc } = get();
    if (!yDoc) return null;

    const filesMap = yDoc.getMap('files') as YMap<YMap<unknown>>;
    const fileMap = filesMap.get(fileId);
    if (!fileMap) return null;

    const content = fileMap.get('content') as YText;
    if (!content) return '';

    return content.toString();
  },

  // 현재 활성 파일 내용 가져오기
  getActiveFileContent: () => {
    const { activeFileId, getFileContent } = get();
    if (!activeFileId) return null;

    return getFileContent(activeFileId);
  },
}));
