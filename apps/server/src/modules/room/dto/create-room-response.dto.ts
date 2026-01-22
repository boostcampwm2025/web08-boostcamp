import { createZodDto } from 'nestjs-zod';
import { createRoomResponseSchema } from '@codejam/common';

export class CreateRoomResponseDto extends createZodDto(
  createRoomResponseSchema,
) {}
