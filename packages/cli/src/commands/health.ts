import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from '../config/index.js';
import { ApiClient } from '../api/index.js';
import { handleError } from '../utils/index.js';

interface HealthOptions {
  env?: string;
}

async function checkServerHealth(
  client: ApiClient,
  serverUrl: string,
): Promise<void> {
  const spinner = ora('Checking server health...').start();
  const isHealthy = await client.checkHealth();

  if (isHealthy) {
    spinner.succeed(chalk.green('All Systems Operational'));
    console.log(
      chalk.gray("We're fully operational and ready to code together!"),
    );
    process.exit(0);
  } else {
    spinner.fail(chalk.red('System Unavailable'));
    console.log(chalk.gray('We are experiencing issues with our systems.'));
    process.exit(1);
  }
}

export const healthCommand = new Command('health')
  .description('Check server health status')
  .option(
    '-e, --env <environment>',
    'Environment (local|staging|production)',
    'production',
  )
  .action(async (options: HealthOptions) => {
    try {
      const config = getConfig(options.env);
      const client = new ApiClient(config.serverUrl);

      await checkServerHealth(client, config.serverUrl);
    } catch (error) {
      handleError('Failed to check server health', error);
    }
  });
