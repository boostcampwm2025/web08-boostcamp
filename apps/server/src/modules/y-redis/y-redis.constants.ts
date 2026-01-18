import { readFileSync } from 'fs';
import { join } from 'path';

// Load Lua script once

export const COMPACT_SCRIPT = readFileSync(
  join(__dirname, 'scripts', 'compact.lua'),
  'utf-8',
);
