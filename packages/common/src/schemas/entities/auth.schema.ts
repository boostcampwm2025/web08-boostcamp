import { z } from 'zod';
import { roomCodeSchema } from './room.schema.js';
import { ptIdSchema } from './pt.schema.js';

// RoomToken 페이로드 스키마
export const roomTokenPayloadSchema = z.object({
  roomCode: roomCodeSchema,
  ptId: ptIdSchema,
});
