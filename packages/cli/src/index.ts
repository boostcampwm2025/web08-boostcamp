#!/usr/bin/env node

import { Command } from 'commander';
import {
  startCommand,
  healthCommand,
  enterCommand,
  updateCommand,
} from './commands/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('codejam')
  .description('CodeJam CLI - Real-time code collaboration tool')
  .version(packageJson.version);

program.addCommand(startCommand);
program.addCommand(enterCommand);
program.addCommand(healthCommand);
program.addCommand(updateCommand);

program.parse();
