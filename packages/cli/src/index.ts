#!/usr/bin/env node

import { Command } from 'commander';
import { startCommand, healthCommand } from './commands/index.js';

const program = new Command();

program
  .name('codejam')
  .description('CodeJam CLI - Create and manage collaborative coding rooms')
  .version('1.0.0');

program.addCommand(startCommand);
program.addCommand(healthCommand);

program.parse();
