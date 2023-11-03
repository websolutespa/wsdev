import * as fs from 'fs';
import * as path from 'path';

export function getPackagePath() {
  const packagePath = new URL('../package.json', import.meta.url);
  return packagePath;
}

// import packageJson from '../package.json' assert { type: 'json' };
export function getPackage() {
  const packagePath = getPackagePath();
  // const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson;
}

export function isTest() {
  const cwd = process.cwd();
  const packagePath = getPackagePath();
  // eslint-disable-next-line no-useless-escape
  const packagePathname = packagePath.pathname.replace(/^\/(\w\:\/)/, (a, b) => b);
  const dirname = path.dirname(packagePathname);
  const equals = pathsAreEqual(cwd, dirname);
  // console.log('isTest', path.normalize(cwd), path.normalize(dirname), equals);
  return equals;
}

export function pathsAreEqual(path1: string, path2: string) {
  path1 = path.normalize(path.resolve(path1));
  path2 = path.normalize(path.resolve(path2));
  if (process.platform == 'win32') {
    return path1.toLowerCase() === path2.toLowerCase();
  }
  return path1 === path2;
}

export function getPath(...paths: string[]) {
  return path.join(isTest() ? './.ws' : '', ...paths);
}

export function getAbsolutePath(...paths: string[]) {
  return path.join(process.cwd(), getPath(...paths));
}

export function getRelativePath(...paths: string[]) {
  return path.join(__dirname, getPath(...paths));
}
