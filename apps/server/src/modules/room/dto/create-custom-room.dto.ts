import { createZodDto } from 'nestjs-zod';
import { createCustomRoomSchema } from '@codejam/common';

export class CreateCustomRoomDto extends createZodDto(createCustomRoomSchema) {}
