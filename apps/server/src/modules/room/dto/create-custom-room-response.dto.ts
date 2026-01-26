import { createZodDto } from 'nestjs-zod';
import { createCustomRoomResponseSchema } from '@codejam/common';

export class CreateCustomRoomResponseDto extends createZodDto(
  createCustomRoomResponseSchema,
) {}
