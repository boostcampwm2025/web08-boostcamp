import chalk from 'chalk';
import ora from 'ora';
import open from 'open';

export async function openRoomInBrowser(
  roomUrl: string,
  shouldOpenBrowser: boolean,
): Promise<void> {
  if (shouldOpenBrowser) {
    const spinner = ora(`Opening ${roomUrl}...`).start();
    await open(roomUrl);
    spinner.succeed(chalk.green('Browser opened!'));
  } else {
    console.log(chalk.gray(`\nRoom URL: ${roomUrl}`));
  }
}
