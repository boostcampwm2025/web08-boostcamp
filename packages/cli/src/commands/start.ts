import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { getConfig } from '../config/index.js';
import { ApiClient } from '../api/index.js';
import { openRoomInBrowser, handleError } from '../utils/index.js';

interface StartOptions {
  env?: string;
  custom?: boolean;
  password?: string;
  hostPassword?: string;
  max?: string;
  browser?: boolean;
}

function validateMaxParticipants(maxStr: string): number {
  const maxPts = parseInt(maxStr, 10);

  if (isNaN(maxPts) || maxPts < 1 || maxPts > 150) {
    console.error(chalk.red('Max participants must be between 1 and 150'));
    process.exit(1);
  }

  return maxPts;
}

async function createRoom(
  client: ApiClient,
  options: StartOptions,
): Promise<{ roomCode: string; token: string }> {
  const spinner = ora('Creating room...').start();

  if (options.custom) {
    const maxPts = validateMaxParticipants(options.max || '6');

    const response = await client.createCustomRoom({
      maxPts,
      roomPassword: options.password,
      hostPassword: options.hostPassword,
    });

    spinner.succeed(chalk.green('Custom room created!'));
    return { roomCode: response.roomCode, token: response.token };
  } else {
    const response = await client.createQuickRoom();
    spinner.succeed(chalk.green('Quick room created!'));
    return { roomCode: response.roomCode, token: response.token };
  }
}

function displayRoomInfo(roomCode: string, options: StartOptions): void {
  const headers = [chalk.cyan.bold('Room Code')];
  const values = [chalk.blue.bold(roomCode)];

  if (options.custom) {
    headers.push(chalk.cyan.bold('Max Participants'));
    values.push(chalk.white(options.max || '6'));

    if (options.password) {
      headers.push(chalk.cyan.bold('Room Password'));
      values.push(chalk.white(options.password));
    }

    if (options.hostPassword) {
      headers.push(chalk.cyan.bold('Host Password'));
      values.push(chalk.white(options.hostPassword));
    }
  }

  const table = new Table({
    head: headers,
  });

  table.push(values);

  console.log('\n' + table.toString());
}

export const startCommand = new Command('start')
  .description('Create and open a CodeJam room')
  .option(
    '-e, --env <environment>',
    'Environment (local|staging|production)',
    'production',
  )
  .option('-c, --custom', 'Create custom room instead of quick room')
  .option('-p, --password <password>', 'Room password (custom room only)')
  .option('--host-password <password>', 'Host password (custom room only)')
  .option('-m, --max <number>', 'Max participants (custom room only)')
  .option('--no-browser', 'Do not open browser automatically')
  .action(async (options: StartOptions) => {
    try {
      // Validate that custom options are only used with --custom flag
      if (!options.custom) {
        if (options.password || options.hostPassword || options.max) {
          console.error(
            chalk.red(
              'Error: --password, --host-password, and --max options require --custom flag',
            ),
          );
          console.log(
            chalk.yellow(
              '\nTo create a custom room, use: codejam start --custom [options]',
            ),
          );
          process.exit(1);
        }
      }

      const config = getConfig(options.env);
      const client = new ApiClient(config.serverUrl);
      const { roomCode, token } = await createRoom(client, options);
      displayRoomInfo(roomCode, options);
      const roomUrl = `${config.clientUrl}/join/${roomCode}?token=${token}`;
      await openRoomInBrowser(roomUrl, options.browser !== false);
    } catch (error) {
      handleError('Failed to create room', error);
    }
  });
