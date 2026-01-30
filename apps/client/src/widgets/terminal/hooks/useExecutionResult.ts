import { useEffect } from 'react';
import type { Terminal as XTerm } from 'xterm';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { ansi } from '../utils/ansi';

/**
 * Helper: Write runtime info
 */
function writeRuntimeInfo(xterm: XTerm, language: string, version: string) {
  const msg = ansi.dim(`Runtime: ${language} ${version}`) + '\r\n\r\n';
  xterm.write(msg);
}

/**
 * Helper: Write stage output (stdout/stderr)
 */
function writeStageOutput(xterm: XTerm, stdout?: string, stderr?: string) {
  if (stdout) xterm.write(stdout);
  if (stderr) xterm.write(ansi.red(stderr));
}

/**
 * Helper: Write exit status message
 */
function writeExitStatus(
  xterm: XTerm,
  code: number | null,
  signal: string | null,
) {
  let msg = '';
  if (signal) {
    msg = ansi.yellow(`Terminated by signal: ${signal}`);
  } else if (code === 0) {
    msg = ansi.green(`Process exited with code ${code}`);
  } else if (code !== null) {
    msg = ansi.red(`Process exited with code ${code}`);
  }
  if (msg) {
    xterm.write(msg + '\r\n');
  }
}

/**
 * Helper: Write compilation status
 * @returns true if compilation succeeded, false otherwise
 */
function writeCompilationStatus(xterm: XTerm, code: number): boolean {
  const success = code === 0;

  const output = success
    ? ansi.green('Compilation successful')
    : ansi.red(`Compilation failed with code ${code}`);

  xterm.write(output + '\r\n\r\n');
  return success;
}

/**
 * Helper: Write compile stage
 * @returns true if compilation succeeded, false otherwise
 */
function writeCompileStage(
  xterm: XTerm,
  compile: {
    stdout?: string;
    stderr?: string;
    code: number | null;
    message?: string | null;
  },
): boolean {
  xterm.write(ansi.cyan('Compiling...') + '\r\n');

  const { stdout, stderr, code } = compile;
  writeStageOutput(xterm, stdout, stderr);

  if (code === null) return true;
  return writeCompilationStatus(xterm, code);
}

/**
 * Helper: Write execution metrics
 */
function writeMetrics(
  xterm: XTerm,
  cpuTime?: number,
  wallTime?: number,
  memory?: number,
) {
  if (cpuTime === undefined && wallTime === undefined && memory === undefined) {
    return;
  }

  const metrics = [];
  if (cpuTime !== undefined) {
    metrics.push(`CPU: ${cpuTime}ms`);
  }
  if (wallTime !== undefined) {
    metrics.push(`Wall: ${wallTime}ms`);
  }
  if (memory !== undefined) {
    metrics.push(`Memory: ${(memory / (1024 * 1024)).toFixed(2)}MB`);
  }

  if (metrics.length > 0) {
    const output = ansi.dim(`[${metrics.join(', ')}]`);
    xterm.write(output + '\r\n');
  }
}

/**
 * Helper: Write run stage output
 */
function writeRunStage(
  xterm: XTerm,
  run: { stdout?: string; stderr?: string },
) {
  xterm.write(ansi.cyan('Running...') + '\r\n');

  const { stdout, stderr } = run;
  writeStageOutput(xterm, stdout, stderr);
}

/**
 * Handle non-streaming execution result
 */
export function useExecutionResult(xterm: XTerm | null) {
  const result = useCodeExecutionStore((state) => state.result);

  useEffect(() => {
    if (!xterm || !result) return;

    const { language, version, compile, run } = result;

    // Runtime info
    writeRuntimeInfo(xterm, language, version);

    // Compile stage (if exists)
    // Don't show run stage if compilation failed
    if (compile && !writeCompileStage(xterm, compile)) return;

    // Run stage
    const { code, signal, cpu_time, wall_time, memory } = run;

    writeRunStage(xterm, run);
    writeExitStatus(xterm, code, signal);
    writeMetrics(xterm, cpu_time, wall_time, memory);

    xterm.write('\r\n');
  }, [xterm, result]);
}
