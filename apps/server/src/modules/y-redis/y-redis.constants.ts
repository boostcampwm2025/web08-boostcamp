import { readFileSync } from 'fs';
import { join } from 'path';

// Redis key TTL

export const REDIS_KEY_TTL = 24 * 60 * 60 + 60 * 60; // 24H + 1H

// Load Lua scripts

export const COMPACT_SCRIPT = readFileSync(
  join(__dirname, 'scripts', 'compact.lua'),
  'utf-8',
);

export const PUSH_UPDATE_SCRIPT = readFileSync(
  join(__dirname, 'scripts', 'push-update.lua'),
  'utf-8',
);

export const FETCH_UPDATES_SCRIPT = readFileSync(
  join(__dirname, 'scripts', 'fetch-updates.lua'),
  'utf-8',
);
