import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { type TerminalVariant, getTheme } from '../styles/theme';
import { useCodeExecutionStore } from '@/stores/code-execution';
import {
  useExecutionStream,
  useExecutionResult,
  useExecutionError,
} from '../hooks';
import 'xterm/css/xterm.css';

export interface TerminalProps {
  variant: TerminalVariant;
}

export function Terminal({ variant }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const { isExecuting, runtime, stage, data, exit, error, result } =
    useCodeExecutionStore();

  // Initialization
  useEffect(() => {
    if (!terminalRef.current) return;

    // Theme configuration
    const theme = getTheme(variant);

    // Terminal configuration
    const xterm = new XTerm({
      fontSize: 14,
      fontFamily: "'Roboto Mono', 'Space Mono', monospace",
      theme,
      convertEol: true,
      cursorBlink: true,
      disableStdin: true, // Read-only
    });

    // Create and load FitAddon
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    // Store references
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Open terminal
    const openTerminal = () => {
      if (!terminalRef.current) return;

      xterm.open(terminalRef.current);
      fitTerminal();
    };

    // Fit terminal
    const fitTerminal = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Failed to fit terminal:', e);
      }
    };

    // Initialize terminal
    const frame = requestAnimationFrame(openTerminal);

    // Setup resize observer
    let resizeTimeout: number | null = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => fitTerminal(), 0);
    });
    if (terminalRef.current) observer.observe(terminalRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(frame);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      observer.disconnect();
      xterm.dispose();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme when variant changes
  useEffect(() => {
    if (!xtermRef.current) return;

    const theme = getTheme(variant);
    xtermRef.current.options.theme = theme;
  }, [variant]);

  // Control cursor based on execution state
  useEffect(() => {
    if (!xtermRef.current) return;

    xtermRef.current.options.cursorBlink = !isExecuting;
    xtermRef.current.options.cursorStyle = isExecuting ? 'bar' : 'block';
  }, [isExecuting]);

  // Clear terminal when new execution starts
  useEffect(() => {
    if (!xtermRef.current) return;
    if (isExecuting) xtermRef.current.clear();
  }, [isExecuting]);

  // Use custom hooks for handling code execution output
  useExecutionStream({
    xterm: xtermRef.current,
    runtime,
    stage,
    data,
    exit,
    isExecuting,
  });
  useExecutionResult(xtermRef.current, result);
  useExecutionError(xtermRef.current, error);

  return (
    <div ref={terminalRef} className="h-full w-full overflow-hidden p-2" />
  );
}
