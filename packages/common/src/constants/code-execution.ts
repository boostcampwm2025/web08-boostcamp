/**
 * Code Execution Constants
 * Configuration and enums for code execution
 */

// File encoding types
export const FILE_ENCODING = {
  UTF8: 'utf8',
  BASE64: 'base64',
  HEX: 'hex',
} as const;

// Execution status codes
export const EXECUTION_STATUS = {
  RUNTIME_ERROR: 'RE',
  SIGNAL: 'SG',
  TIMEOUT: 'TO',
  OUTPUT_LIMIT_EXCEEDED: 'OL',
  ERROR_LIMIT_EXCEEDED: 'EL',
  INTERNAL_ERROR: 'XX',
} as const;

// Code execution limits
export const CODE_EXECUTION_LIMITS = {
  COMPILE_TIMEOUT: 20000, // 20 seconds
  RUN_TIMEOUT: 10000, // 10 seconds
  COMPILE_CPU_TIME: 20000, // 20 seconds
  RUN_CPU_TIME: 10000, // 10 seconds
  COMPILE_MEMORY_LIMIT: 256 * 1024 * 1024, // 256 MB
  RUN_MEMORY_LIMIT: 256 * 1024 * 1024, // 256 MB
  FILES: 5,
  ARGS: 10,
  FILE_SIZE: 1024 * 1024, // 1 MB
} as const;
