/**
 * ANSI color codes for terminal output
 */
export const ANSI = {
  // Reset
  RESET: '\x1b[0m',

  // Regular colors
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',

  // Bright colors
  BRIGHT_BLACK: '\x1b[90m',
  BRIGHT_RED: '\x1b[91m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_YELLOW: '\x1b[93m',
  BRIGHT_BLUE: '\x1b[94m',
  BRIGHT_MAGENTA: '\x1b[95m',
  BRIGHT_CYAN: '\x1b[96m',
  BRIGHT_WHITE: '\x1b[97m',

  // Styles
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  ITALIC: '\x1b[3m',
  UNDERLINE: '\x1b[4m',
} as const;

/**
 * Wraps text with ANSI color code
 */
export function colorize(text: string, color: string): string {
  return `${color}${text}${ANSI.RESET}`;
}

/**
 * Converts \n to \r\n for terminal display
 */
export function format(text: string): string {
  return text.replace(/\n/g, '\r\n');
}

/**
 * Helper functions for common color patterns
 */
export const ansi = {
  red: (text: string) => colorize(text, ANSI.RED),
  green: (text: string) => colorize(text, ANSI.GREEN),
  yellow: (text: string) => colorize(text, ANSI.YELLOW),
  blue: (text: string) => colorize(text, ANSI.BLUE),
  cyan: (text: string) => colorize(text, ANSI.CYAN),
  magenta: (text: string) => colorize(text, ANSI.MAGENTA),
  gray: (text: string) => colorize(text, ANSI.BRIGHT_BLACK),
  bold: (text: string) => colorize(text, ANSI.BOLD),
  dim: (text: string) => colorize(text, ANSI.DIM),
};
