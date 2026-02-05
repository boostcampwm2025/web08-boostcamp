import { Terminal as XTerm } from 'xterm';

// Main keyboard event handler dispatcher
// Returns true to process the event normally, false to prevent default handling
export function handleKeyDown(event: KeyboardEvent, xterm: XTerm): boolean {
  const ctrlOrCmd = event.ctrlKey || event.metaKey;
  if (!ctrlOrCmd) return true;

  switch (event.key) {
    case 'a':
      return handleSelectAll(event, xterm);
    case 'c':
      return handleCopy(event, xterm);
    default:
      return true;
  }
}

// Handle select all
function handleSelectAll(event: KeyboardEvent, xterm: XTerm): boolean {
  event.preventDefault();

  // Start from the cursor line
  const buffer = xterm.buffer.active;
  let endLine = buffer.cursorY + buffer.baseY;

  // Walk backwards to find last non-empty line
  while (endLine >= 0) {
    const line = buffer.getLine(endLine);

    const stop = !line || line.translateToString(true).trim().length > 0;
    if (stop) break;

    endLine--;
  }

  // Select lines
  if (endLine >= 0) {
    xterm.selectLines(0, endLine);
  }

  return false;
}

// Handle copy to clipboard
function handleCopy(event: KeyboardEvent, xterm: XTerm): boolean {
  const selection = xterm.getSelection();
  if (!selection) return true;

  event.preventDefault();

  try {
    navigator.clipboard.writeText(selection);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }

  return false;
}
