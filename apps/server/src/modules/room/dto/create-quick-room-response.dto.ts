import { createZodDto } from 'nestjs-zod';
import { createQuickRoomResponseSchema } from '@codejam/common';

export class CreateQuickRoomResponseDto extends createZodDto(
  createQuickRoomResponseSchema,
) {}
