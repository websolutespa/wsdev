import chalk from 'chalk';
import checkForUpdate from 'update-check';
import { getPackage } from './package.js';
import { getName } from './utils/logger.js';

const packageJson = getPackage();

const promise = (checkForUpdate as unknown as (json: any) => Promise<{
  latest?: string
}>)(packageJson).catch(() => null);

export async function checkUpdate(): Promise<void> {
  // Logger.log('checking for updates...');
  // await sleep();
  try {
    const response = await promise;
    if (response?.latest) {
      console.log();
      console.log(chalk.gray('A new version of ') + getName() + chalk.gray(' is available!'));
      console.log(chalk.gray('Update by running ') + 'npm i -g @websolutespa/ws-cli');
      console.log();
    }
    // process.exit();
  } catch (error) {
    // ignore error
  }
}

function timeout(ms: number = 3000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleep(ms: number = 3000, fn: (...args: unknown[]) => void = () => { }, ...args: unknown[]) {
  await timeout(ms);
  return await fn(...args);
}
