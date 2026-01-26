import { z } from 'zod';
import {
  FILE_ENCODING,
  EXECUTION_STATUS,
  CODE_EXECUTION_CONFIG,
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
  encoding: z.enum(fileEncodingValues).optional().default(FILE_ENCODING.UTF8),
});

// Execute code request schema
export const executeCodeRequestSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  version: z.string().min(1, 'Version is required'),
  files: z
    .array(codeFileSchema)
    .min(1, 'At least one file is required')
    .max(CODE_EXECUTION_LIMITS.MAX_FILES),
  stdin: z.string().optional().default(''),
  args: z
    .array(z.string())
    .max(CODE_EXECUTION_LIMITS.MAX_ARGS)
    .optional()
    .default([]),
  compile_timeout: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_COMPILE_TIMEOUT)
    .optional()
    .default(CODE_EXECUTION_CONFIG.DEFAULT_COMPILE_TIMEOUT),
  run_timeout: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_RUN_TIMEOUT)
    .optional()
    .default(CODE_EXECUTION_CONFIG.DEFAULT_RUN_TIMEOUT),
  compile_cpu_time: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_COMPILE_CPU_TIME)
    .optional()
    .default(CODE_EXECUTION_CONFIG.DEFAULT_COMPILE_CPU_TIME),
  run_cpu_time: z
    .number()
    .int()
    .positive()
    .max(CODE_EXECUTION_LIMITS.MAX_RUN_CPU_TIME)
    .optional()
    .default(CODE_EXECUTION_CONFIG.DEFAULT_RUN_CPU_TIME),
  compile_memory_limit: z
    .number()
    .int()
    .optional()
    .default(CODE_EXECUTION_CONFIG.DEFAULT_COMPILE_MEMORY_LIMIT),
  run_memory_limit: z
    .number()
    .int()
    .optional()
    .default(CODE_EXECUTION_CONFIG.DEFAULT_RUN_MEMORY_LIMIT),
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
