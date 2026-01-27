import { z } from 'zod';
import {
  FILE_ENCODING,
  EXECUTION_STATUS,
  CODE_EXECUTION_LIMITS,
} from '../../constants/code-execution.js';

// Extract enum values for zod validation
const fileEncodingValues = Object.values(FILE_ENCODING) as [
  string,
  ...string[],
];
const executionStatusValues = Object.values(EXECUTION_STATUS) as [
  string,
  ...string[],
];

// File schema
export const codeFileSchema = z.object({
  name: z.string().optional(),
  content: z.string().max(CODE_EXECUTION_LIMITS.MAX_FILE_SIZE),
  encoding: z.enum(fileEncodingValues).optional(),
});

// Execute code request schema
export const executeCodeRequestSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  version: z.string().min(1, 'Version is required'),
  files: z
    .array(codeFileSchema)
    .min(1, 'At least one file is required')
    .max(CODE_EXECUTION_LIMITS.MAX_FILES),
  stdin: z.string().optional(),
  args: z.array(z.string()).max(CODE_EXECUTION_LIMITS.MAX_ARGS).optional(),
  compile_timeout: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_COMPILE_TIMEOUT)
    .optional(),
  run_timeout: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_RUN_TIMEOUT)
    .optional(),
  compile_cpu_time: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_COMPILE_CPU_TIME)
    .optional(),
  run_cpu_time: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_RUN_CPU_TIME)
    .optional(),
  compile_memory_limit: z.number().int().optional(),
  run_memory_limit: z.number().int().optional(),
});

// Stage result schema (compile or run)
export const stageResultSchema = z.object({
  stdout: z.string(),
  stderr: z.string(),
  output: z.string(),
  code: z.number().nullable(),
  signal: z.string().nullable(),
  message: z.string().nullable(),
  status: z.enum(executionStatusValues).nullable(),
  cpu_time: z.number().optional(),
  wall_time: z.number().optional(),
  memory: z.number().optional(),
});

// Execute code response schema
export const executeCodeResponseSchema = z.object({
  language: z.string(),
  version: z.string(),
  run: stageResultSchema,
  compile: stageResultSchema.optional(),
});

// Runtime info schema
export const runtimeSchema = z.object({
  language: z.string(),
  version: z.string(),
  aliases: z.array(z.string()),
});

// Get runtimes response schema
export const getRuntimesResponseSchema = z.array(runtimeSchema);

// Inferred types
export type CodeFile = z.input<typeof codeFileSchema>;
export type ExecuteCodeRequest = z.input<typeof executeCodeRequestSchema>;
export type StageResult = z.infer<typeof stageResultSchema>;
export type ExecuteCodeResponse = z.infer<typeof executeCodeResponseSchema>;
export type Runtime = z.infer<typeof runtimeSchema>;
