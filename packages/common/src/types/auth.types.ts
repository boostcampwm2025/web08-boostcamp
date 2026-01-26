import type { z } from 'zod';
import { roomTokenPayloadSchema } from '../schemas/auth.schema.js';
import { roomTokenSchema } from '../schemas/room.schema.js';

export type RoomToken = z.infer<typeof roomTokenSchema>;

export type RoomTokenPayload = z.infer<typeof roomTokenPayloadSchema>;
