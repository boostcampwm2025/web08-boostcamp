import { useEffect, useRef } from 'react';
import type { Terminal as XTerm } from 'xterm';
import type {
  CodeExecutionRuntime,
  CodeExecutionStage,
  CodeExecutionData,
  CodeExecutionExit,
} from '@/stores/code-execution';
import { ansi, format } from '@/widgets/terminal/utils/ansi';

/**
 * Parameters for streaming execution display
 */
export interface ExecutionStreamParams {
  xterm: XTerm | null;
  runtime: CodeExecutionRuntime | null;
  stage: CodeExecutionStage | null;
  data: CodeExecutionData | null;
  exit: CodeExecutionExit | null;
  isExecuting: boolean;
}

/**
 * Handle runtime info display
 */
export function useRuntimeDisplay(
  xterm: XTerm | null,
  runtime: CodeExecutionRuntime | null,
) {
  useEffect(() => {
    if (!xterm || !runtime) return;
    const { language, version } = runtime;
    const msg = ansi.dim(`Runtime: ${language} ${version}`) + '\r\n\r\n';
    xterm.write(msg);
  }, [xterm, runtime]);
}

/**
 * Handle stage change display
 */
export function useStageDisplay(
  xterm: XTerm | null,
  stage: CodeExecutionStage | null,
) {
  useEffect(() => {
    if (!xterm || !stage) return;

    const label = stage.stage === 'compile' ? 'Compiling' : 'Running';
    const msg = ansi.cyan(`${label}...`) + '\r\n';
    xterm.write(msg);
  }, [xterm, stage]);
}

/**
 * Handle streaming data chunks
 */
export function useDataStream(
  xterm: XTerm | null,
  data: CodeExecutionData | null,
) {
  useEffect(() => {
    if (!xterm || !data) return;

    const output = format(data.data);

    if (data.stream === 'stderr') {
      xterm.write(ansi.red(output));
    } else {
      xterm.write(output);
    }
  }, [xterm, data]);
}

/**
 * Handle execution completion
 */
export function useExecutionCompletion(
  xterm: XTerm | null,
  exit: CodeExecutionExit | null,
  isExecuting: boolean,
) {
  const prevIsExecutingRef = useRef(false);

  useEffect(() => {
    // Always update the ref to track isExecuting state
    const wasExecuting = prevIsExecutingRef.current;
    prevIsExecutingRef.current = isExecuting;

    // Show completion message when we have exit data
    if (!xterm || !exit) return;

    const { stage, code, signal } = exit;
    if (code === null && signal === null) return;

    let msg = '';

    // Handle compile stage completion
    if (stage === 'compile') {
      if (signal) {
        msg = ansi.yellow(`Compilation terminated by signal: ${signal}`);
      } else if (code === 0) {
        msg = ansi.green('Compilation successful');
      } else {
        msg = ansi.red(`Compilation failed with code ${code}`);
      }
      xterm.write(msg + '\r\n\r\n');
      return;
    }

    // Handle run stage completion
    // Show when execution fully completes
    if (stage === 'run') {
      if (!wasExecuting || isExecuting) return;

      if (signal) {
        msg = ansi.yellow(`Terminated by signal: ${signal}`);
      } else if (code === 0) {
        msg = ansi.green(`Process exited with code ${code}`);
      } else {
        msg = ansi.red(`Process exited with code ${code}`);
      }
      xterm.write(msg + '\r\n\r\n');
    }
  }, [xterm, exit, isExecuting]);
}

/**
 * Composite hook: Handle all streaming execution display
 */
export function useExecutionStream({
  xterm,
  runtime,
  stage,
  data,
  exit,
  isExecuting,
}: ExecutionStreamParams) {
  useRuntimeDisplay(xterm, runtime);
  useStageDisplay(xterm, stage);
  useDataStream(xterm, data);
  useExecutionCompletion(xterm, exit, isExecuting);
}
