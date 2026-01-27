import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { type TerminalVariant, getTheme } from './theme';
import { Terminal as TerminalIcon, Eraser } from 'lucide-react';
import 'xterm/css/xterm.css';

export interface TerminalProps {
  variant: TerminalVariant;
}

export function Terminal({ variant }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Theme configuration
    const theme = getTheme(variant);

    // Initialize terminal
    const xterm = new XTerm({
      fontSize: 14,
      fontFamily: "'Roboto Mono', 'Space Mono', monospace",
      theme,
    });

    // Load Addons
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    // Open terminal
    xterm.open(terminalRef.current);

    // Fit terminal
    try {
      fitAddon.fit();
    } catch (e) {
      console.warn('Failed to fit terminal', e);
    }

    // Store references
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Handle resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('Failed to fit terminal on resize', e);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, [variant]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  };

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
        <button
          onClick={handleClear}
          className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-800"
          title="Clear terminal"
        >
          <Eraser size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-hidden p-2" />
    </div>
  );
}
