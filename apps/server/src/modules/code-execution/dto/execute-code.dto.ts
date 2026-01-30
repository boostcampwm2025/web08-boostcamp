import { createZodDto } from 'nestjs-zod';
import {
  executeCodeRequestSchema,
  executeCodeResponseSchema,
  runtimeSchema,
  getRuntimesResponseSchema,
} from '@codejam/common';

export class ExecuteCodeRequestDto extends createZodDto(
  executeCodeRequestSchema,
) {}

export class ExecuteCodeResponseDto extends createZodDto(
  executeCodeResponseSchema,
) {}

export class RuntimeDto extends createZodDto(runtimeSchema) {}

export class GetRuntimesResponseDto extends createZodDto(
  getRuntimesResponseSchema,
) {}
