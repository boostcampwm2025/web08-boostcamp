import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { getConfig } from '../config/index.js';
import { ApiClient } from '../api/index.js';

interface StartOptions {
  env?: string;
  custom?: boolean;
  password?: string;
  hostPassword?: string;
  max?: string;
  noBrowser?: boolean;
}

export const startCommand = new Command('start')
  .description('Create and open a CodeJam room')
  .option('-e, --env <environment>', 'Environment (local|staging|production)', 'production')
  .option('-c, --custom', 'Create custom room instead of quick room')
  .option('-p, --password <password>', 'Room password (custom room only)')
  .option('-h, --host-password <password>', 'Host password (custom room only)')
  .option('-m, --max <number>', 'Max participants (custom room only)', '6')
  .option('--no-browser', 'Do not open browser automatically')
  .action(async (options: StartOptions) => {
    try {
      // Get environment config
      const config = getConfig(options.env);
      const client = new ApiClient(config.serverUrl);

      // Create room
      const spinner = ora('Creating room...').start();

      let roomCode: string;

      if (options.custom) {
        // Custom room
        const maxPts = parseInt(options.max || '6', 10);

        if (isNaN(maxPts) || maxPts < 1 || maxPts > 150) {
          spinner.fail(chalk.red('Max participants must be between 1 and 150'));
          process.exit(1);
        }

        const response = await client.createCustomRoom({
          maxPts,
          roomPassword: options.password,
          hostPassword: options.hostPassword,
        });

        roomCode = response.roomCode;
        spinner.succeed(chalk.green('Custom room created!'));
      } else {
        // Quick room
        const response = await client.createQuickRoom();
        roomCode = response.roomCode;
        spinner.succeed(chalk.green('Quick room created!'));
      }

      // Display room info
      console.log(chalk.blue.bold(`\nRoom Code: ${roomCode}`));
      console.log(chalk.gray(`Environment: ${options.env || 'production'}`));

      if (options.custom) {
        console.log(chalk.gray(`Max participants: ${options.max || '6'}`));
        if (options.password) {
          console.log(chalk.gray(`Room password: ${options.password}`));
        }
        if (options.hostPassword) {
          console.log(chalk.gray(`Host password: ${options.hostPassword}`));
        }
      }

      // Open browser
      if (options.noBrowser === false) {
        const roomUrl = `${config.clientUrl}/room/${roomCode}`;
        console.log(chalk.gray(`\nOpening ${roomUrl}...`));
        await open(roomUrl);
      } else {
        const roomUrl = `${config.clientUrl}/room/${roomCode}`;
        console.log(chalk.gray(`\nRoom URL: ${roomUrl}`));
      }
    } catch (error) {
      const spinner = ora();
      spinner.fail(chalk.red('Failed to create room'));

      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }

      process.exit(1);
    }
  });
