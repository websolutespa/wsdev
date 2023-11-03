// import boxen from 'boxen';
import chalk from 'chalk';
import * as fs from 'fs';
import gradient from 'gradient-string';
import { getAbsolutePath } from '../package.js';

const DEBUG = false;

const green = '#17F112';
const blue = '#0099F7';
const yellow = '#f7cc66'; // '#f7dd00';
const red = '#ed6c6c';

const mixerGradient = gradient(blue, green);

export function log(...args: unknown[]) {
  console.log(chalk.hex(green)(...args));
  // console.log(chalk.green(...args));
}

export function info(...args: unknown[]) {
  console.info(chalk.hex(blue)(...args));
  // console.info(chalk.blue(...args));
}

export function warn(...args: unknown[]) {
  console.warn(chalk.hex(yellow)(...args));
  // console.warn(chalk.yellow(...args));
}

export function error(...args: unknown[]) {
  console.error(chalk.hex(red)(...args));
  // console.error(chalk.red(...args));
}

export function greenTask(name: string, ...args: unknown[]) {
  console.log(chalk.bgHex(green).white(name), chalk.hex(green)(...args));
}

export function blueTask(taskName: string, ...args: unknown[]) {
  console.log(chalk.bgHex(blue).white(taskName), chalk.hex(blue)(...args));
}

export function redTask(taskName: string, ...args: unknown[]) {
  console.log(chalk.bgHex(red).white(taskName), chalk.hex(red)(...args));
}

export function name() {
  console.log(getName() + '\n');
}

export function getName() {
  return chalk.bold(mixerGradient('WS cli'));
}

export function debug(name: string, data: {}) {
  // console.log('debug', data);
  if (DEBUG) {
    const timeStamp = new Date().getTime();
    name = name.replace('$timeStamp', String(timeStamp));
    // console.log('debug', name, data);
    const pathname = getAbsolutePath(name);
    fs.writeFileSync(pathname, JSON.stringify(data, replaceCircularReference(), 2), { encoding: 'utf8' });
  }
}

function replaceCircularReference() {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}


/*
export function box(...args) {
  console.log(
    boxen(chalk.green(...args), {
      padding: 1,
      borderColor: 'green',
      dimBorder: true
    })
  );
}
*/

export const Logger = {
  log,
  info,
  warn,
  error,
  debug,
  name,
  greenTask,
  blueTask,
  redTask,
  // box
};
