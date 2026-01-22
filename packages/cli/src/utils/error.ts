import chalk from 'chalk';
import ora from 'ora';

export function handleError(message: string, error: unknown): never {
  const spinner = ora();
  spinner.fail(chalk.red(message));

  if (error instanceof Error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }

  process.exit(1);
}
