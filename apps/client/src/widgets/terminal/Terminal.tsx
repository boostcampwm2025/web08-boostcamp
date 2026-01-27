import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Trash2, Terminal as TerminalIcon } from 'lucide-react';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import 'xterm/css/xterm.css';

export interface TerminalProps {
  className?: string;
}

export function Terminal({ className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    if (!terminalRef.current) return;

    // Theme configuration
    const theme = isDark
      ? {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#ffffff',
        }
      : {
          background: '#ffffff',
          foreground: '#383a42',
          cursor: '#383a42',
          black: '#000000',
          red: '#e45649',
          green: '#50a14f',
          yellow: '#c18401',
          blue: '#0184bc',
          magenta: '#a626a4',
          cyan: '#0997b3',
          white: '#fafafa',
          brightBlack: '#4f525e',
          brightRed: '#e06c75',
          brightGreen: '#98c379',
          brightYellow: '#e5c07b',
          brightBlue: '#61afef',
          brightMagenta: '#c678dd',
          brightCyan: '#56b6c2',
          brightWhite: '#ffffff',
        };

    // Initialize terminal
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
  }, [isDark]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  };

  return (
    <div className={`flex h-full w-full flex-col ${className}`}>
      <div className="border-border flex items-center justify-between border-b bg-white px-4 py-2 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Terminal
          </span>
        </div>
        <button
          onClick={handleClear}
          className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-800"
          title="Clear terminal"
        >
          <Trash2 size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 overflow-hidden p-2" />
    </div>
  );
}
