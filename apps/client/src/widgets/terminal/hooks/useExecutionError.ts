import { useEffect } from 'react';
import type { Terminal as XTerm } from 'xterm';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { ansi } from '../utils/ansi';

/**
 * Handle execution errors
 */
export function useExecutionError(xterm: XTerm | null) {
  const error = useCodeExecutionStore((state) => state.error);

  useEffect(() => {
    if (!xterm || !error) return;

    const msg = ansi.red(`Error: ${error.message}`) + '\r\n\r\n';
    xterm.write(msg);
  }, [xterm, error]);
}
