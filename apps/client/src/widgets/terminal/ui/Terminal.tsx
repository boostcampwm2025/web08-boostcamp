import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { type TerminalVariant, getTheme } from '../styles/theme';
import { Terminal as TerminalIcon } from 'lucide-react';
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

    // Initialize terminal
    const xterm = new XTerm({
      fontSize: 14,
      fontFamily: "'Roboto Mono', 'Space Mono', monospace",
      theme,
      cursorBlink: false,
      disableStdin: true, // Read-only
    });

    // Load Addons
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    // Open terminal
    xterm.open(terminalRef.current);

    // Store references first
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Fit terminal
    const fit = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Failed to fit terminal', e);
      }
    };

    // Handle resize
    const handleResize = () => fit();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
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
    <div className={`flex h-full w-full flex-col`}>
      <div className="border-border flex items-center justify-between border-b bg-white px-4 py-2 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <TerminalIcon
            size={16}
            className="text-gray-600 dark:text-gray-400"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Terminal
          </span>
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-hidden p-2" />
    </div>
  );
}
