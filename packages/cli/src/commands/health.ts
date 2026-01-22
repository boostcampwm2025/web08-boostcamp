import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from '../config/index.js';
import { ApiClient } from '../api/index.js';

interface HealthOptions {
  env?: string;
}

export const healthCommand = new Command('health')
  .description('Check server health status')
  .option('-e, --env <environment>', 'Environment (local|staging|production)', 'production')
  .action(async (options: HealthOptions) => {
    try {
      const config = getConfig(options.env);
      const client = new ApiClient(config.serverUrl);

      const spinner = ora('Checking server health...').start();

      const isHealthy = await client.checkHealth();

      if (isHealthy) {
        spinner.succeed(chalk.green('Server is healthy!'));
        console.log(chalk.gray(`Environment: ${options.env || 'production'}`));
        console.log(chalk.gray(`Server URL: ${config.serverUrl}`));
        process.exit(0);
      } else {
        spinner.fail(chalk.red('Server is not responding'));
        console.log(chalk.gray(`Environment: ${options.env || 'production'}`));
        console.log(chalk.gray(`Server URL: ${config.serverUrl}`));
        process.exit(1);
      }
    } catch (error) {
      const spinner = ora();
      spinner.fail(chalk.red('Failed to check server health'));

      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }

      process.exit(1);
    }
  });
