import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from '../config/index.js';
import { ApiClient } from '../api/index.js';
import { openRoomInBrowser, handleError } from '../utils/index.js';
import type { RoomJoinStatus } from '../api/types.js';

interface EnterOptions {
  env?: string;
  browser?: boolean;
}

function validateRoomCode(roomCode: string): void {
  if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
    console.error(
      chalk.red(
        'Invalid room code format. Room code must be 6 alphanumeric characters.',
      ),
    );
    process.exit(1);
  }
}

async function checkRoomStatus(
  client: ApiClient,
  roomCode: string,
): Promise<void> {
  const spinner = ora('Checking room status...').start();
  const status: RoomJoinStatus = await client.checkJoinable(roomCode);

  if (status === 'NOT_FOUND') {
    spinner.fail(chalk.red('Room not found'));
    console.error(chalk.gray(`The room code "${roomCode}" does not exist.`));
    process.exit(1);
  }

  if (status === 'FULL') {
    spinner.fail(chalk.red('Room is full'));
    console.error(
      chalk.gray(`The room "${roomCode}" has reached its maximum capacity.`),
    );
    process.exit(1);
  }

  spinner.succeed(chalk.green('Room is available!'));
}

export const enterCommand = new Command('enter')
  .description('Enter a CodeJam room with room code')
  .argument('<room-code>', 'Room code to enter')
  .option(
    '-e, --env <environment>',
    'Environment (local|staging|production)',
    'production',
  )
  .option('--no-browser', 'Do not open browser automatically')
  .action(async (roomCode: string, options: EnterOptions) => {
    try {
      validateRoomCode(roomCode);

      const config = getConfig(options.env);
      const client = new ApiClient(config.serverUrl);

      await checkRoomStatus(client, roomCode);

      console.log(chalk.blue.bold(`\nRoom Code: ${roomCode}`));

      const roomUrl = `${config.clientUrl}/rooms/${roomCode}`;
      await openRoomInBrowser(roomUrl, options.browser !== false);
    } catch (error) {
      handleError('Failed to enter room', error);
    }
  });
