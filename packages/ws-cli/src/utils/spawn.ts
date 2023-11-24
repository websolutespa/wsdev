import spawn from 'cross-spawn';
import { parse } from 'shell-quote';
import { Logger } from './logger.js';

export function changeCwd(folder: string) {
  try {
    process.chdir(folder);
  } catch (error) {
    Logger.log('changeCwd', error);
  }
}

export function doSpawn(command: string, silent: boolean = false, options = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = command.split(' ');
    const name = args.shift() as string;
    const child = spawn(name, parse(args.join(' ')) as string[], {
      stdio: silent ? 'pipe' : 'inherit',
      // stdio: [process.stdin, process.stdout, 'pipe']
      ...options,
    });
    let result = '';
    if (silent) {
      child.stdout?.on('data', function (data) {
        result += data.toString();
      });
    }
    /*
    let errorBuffer = '';
    child.stderr.on('data', function(data) {
      errorBuffer += data;
    });
    */
    child.on('close', (code) => {
      if (code !== 0) {
        // console.log(`ps process exited with code ${code}`);
        reject(code);
      } else {
        resolve(result);
      }
    });
    child.on('error', (error: any) => {
      reject(`Failed to spawn command ${command}`);
    });
  });
}
