import { createZodDto } from 'nestjs-zod';
import { createCustomRoomRequestSchema } from '@codejam/common';

export class CreateCustomRoomRequestDto extends createZodDto(
  createCustomRoomRequestSchema,
) {}
