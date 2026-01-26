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

// Default execution configuration
export const CODE_EXECUTION_CONFIG = {
  DEFAULT_COMPILE_TIMEOUT: 10000, // 10 seconds
  DEFAULT_RUN_TIMEOUT: 3000, // 3 seconds
  DEFAULT_COMPILE_CPU_TIME: 10000, // 10 seconds
  DEFAULT_RUN_CPU_TIME: 3000, // 3 seconds
  DEFAULT_COMPILE_MEMORY_LIMIT: -1, // no limit
  DEFAULT_RUN_MEMORY_LIMIT: -1, // no limit
} as const;

// Maximum allowed values
export const CODE_EXECUTION_LIMITS = {
  MAX_COMPILE_TIMEOUT: 60000, // 60 seconds
  MAX_RUN_TIMEOUT: 30000, // 30 seconds
  MAX_COMPILE_CPU_TIME: 60000, // 60 seconds
  MAX_RUN_CPU_TIME: 30000, // 30 seconds
  MAX_FILES: 10,
  MAX_ARGS: 50,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
} as const;
