import { create } from "zustand";
import { Doc } from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import { SOCKET_EVENTS } from "@codejam/common";
import { createDecoder } from "lib0/decoding";
import { createEncoder, toUint8Array } from "lib0/encoding";
import { readSyncMessage, writeUpdate } from "y-protocols/sync";
import { useSocketStore } from "./socket";
import { emitAwarenessUpdate, emitFileUpdate } from "./socket-events";

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

  // Actions
  initialize: (roomId: string) => number;
  destroy: () => void;
  setActiveFile: (fileId: string) => void;
  applyRemoteDocUpdate: (message: Uint8Array) => void;
  applyRemoteAwarenessUpdate: (message: Uint8Array) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  yDoc: null,
  awareness: null,
  activeFileId: null,
  isInitialized: false,

  initialize: (roomId: string) => {
    const state = get();
    if (state.isInitialized) {
      return state.yDoc!.clientID;
    }

    // Create Y.Doc and Awareness

    const yDoc = new Doc();
    const awareness = new Awareness(yDoc);

    // Setup YDoc update listener

    const onYDocUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;

      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const data = toUint8Array(encoder);

      const { isConnected, roomId } = useSocketStore.getState();
      if (!isConnected || !roomId) return;

      emitFileUpdate(roomId, data);
    };

    yDoc.on("update", onYDocUpdate);

    // Setup awareness update listener

    const onAwarenessUpdate = (changes: AwarenessChanges, origin: unknown) => {
      if (origin === "remote") return;

      const changed = changes.added.concat(changes.updated, changes.removed);
      if (changed.length === 0) return;

      const message = encodeAwarenessUpdate(awareness, changed);

      const { isConnected, roomId } = useSocketStore.getState();
      if (!isConnected || !roomId) return;

      emitAwarenessUpdate(roomId, message);
    };

    awareness.on("update", onAwarenessUpdate);

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
      state.awareness.setLocalStateField("user", {
        ...currentState?.user,
        currentFileId: fileId,
      });
    }
  },

  applyRemoteDocUpdate: (message: Uint8Array) => {
    const state = get();
    if (!state.yDoc) return;

    const update =
      message instanceof Uint8Array ? message : new Uint8Array(message);

    const decoder = createDecoder(update);
    const encoder = createEncoder();

    readSyncMessage(decoder, encoder, state.yDoc, "remote");

    // Send reply if needed (sync protocol)
    const reply = toUint8Array(encoder);
    if (reply.byteLength > 0) {
      const { roomId } = useSocketStore.getState();
      if (roomId) emitFileUpdate(roomId, reply);
    }
  },

  applyRemoteAwarenessUpdate: (message: Uint8Array) => {
    const state = get();
    if (!state.awareness) return;

    const update =
      message instanceof Uint8Array ? message : new Uint8Array(message);

    applyAwarenessUpdate(state.awareness, update, "remote");
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
}));
