import { Injectable } from '@nestjs/common';
import { Doc } from 'yjs';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { writeUpdate } from 'y-protocols/sync';
import { Socket } from 'socket.io';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import {} from 'lib0/decoding';
import { Pt, SOCKET_EVENTS } from '@codejam/common';

type RoomId = string;
type AwarenessUpdate = {
  added: number[];
  updated: number[];
  removed: number[];
};
export type RoomState = {
  roomId: RoomId;
  doc: Doc;
  awareness: Awareness;
  pts: { [x: number]: Pt };
  clients: Socket[];
};

@Injectable()
export class RoomService {
  private rooms: Map<RoomId, RoomState> = new Map();

  constructor() {}

  room(roomId: RoomId): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  safeRoom(roomId: RoomId): RoomState {
    const room = this.room(roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  join(roomId: RoomId, clientId: number, pt: Pt, client: Socket) {
    const room = this.room(roomId);

    if (!room) {
      return;
    }

    room.clients.push(client);
    room.pts = { ...room.pts, [clientId]: pt };
  }

  /**
   * 현재 방을 생성할 때 기본적인 문자열만 전달합니다.
   */
  createRoom(
    roomId: RoomId,
    key: string,
    firstId: number,
    firstPt: Pt,
    firstClient: Socket,
  ): RoomState {
    const doc = new Doc();
    const yText = doc.getText(key);

    if (yText.length === 0) {
      doc.transact(() => {
        yText.insert(
          0,
          `// Write your code here\n\nfunction hello() {\n  console.log('Hello, CodeJam!');\n}\n`,
        );
      }, firstClient);
    }

    const awareness = new Awareness(doc);
    const roomState: RoomState = {
      roomId,
      awareness,
      doc,
      pts: { [firstId]: firstPt },
      clients: [firstClient],
    };
    this.rooms.set(roomId, roomState);

    this.registerDocListener(doc, roomId);
    this.registerAwarenessListener(awareness, roomId);

    return roomState;
  }

  removeRoom(roomId: RoomId) {
    this.rooms.delete(roomId);
  }

  leave(roomId: RoomId, socketId: string) {
    const room = this.room(roomId);
    if (!room) {
      return;
    }

    room.clients = room.clients.filter((client) => client.id !== socketId);
  }

  extractPts(roomId: RoomId, clientIds: number[]): Pt[] {
    const room = this.room(roomId);
    if (!room) {
      return [];
    }

    return Object.entries(room.pts)
      .filter(([clientId]) => clientIds.includes(parseInt(clientId)))
      .map(([, pt]) => pt);
  }

  private registerDocListener(doc: Doc, roomId: RoomId) {
    doc.on('update', (update: Uint8Array, origin: unknown) => {
      const encoder = createEncoder();
      const room = this.safeRoom(roomId);
      writeUpdate(encoder, update);
      const code = toUint8Array(encoder);
      room.clients.forEach((client) => {
        if (client === origin) {
          return;
        }

        client.emit(SOCKET_EVENTS.UPDATE_FILE, { roomId, code });
      });
    });
  }

  private registerAwarenessListener(awareness: Awareness, roomId: RoomId) {
    awareness.on(
      'update',
      ({ added, updated, removed }: AwarenessUpdate, origin: Socket) => {
        const room = this.safeRoom(roomId);
        const changed = added.concat(updated, removed);
        const message = encodeAwarenessUpdate(awareness, changed);
        room.clients.forEach((client) => {
          if (client === origin) {
            return;
          }

          client.emit(SOCKET_EVENTS.ROOM_PTS, {
            roomId,
            pts: this.extractPts(roomId, changed),
            message,
          });
        });
      },
    );
  }
}
