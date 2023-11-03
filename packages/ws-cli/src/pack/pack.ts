import * as fs from 'fs';
import { getAbsolutePath } from '../package.js';
import { Logger } from '../utils/logger.js';

const BYPASS_WRITE = false;

type IPackage = {
  prepack?: any;
  postpack?: any;
};

function readPackage(): IPackage | null {
  let item = null;
  try {
    const packagePath = getAbsolutePath('./package.json');
    const data = fs.readFileSync(packagePath, 'utf8');
    item = JSON.parse(data);
  } catch (error) {
    Logger.error(error);
  }
  return item;
}

function writePackageSync(item: IPackage) {
  if (item) {
    const packagePath = getAbsolutePath('./package.json');
    try {
      if (!BYPASS_WRITE) {
        fs.writeFileSync(packagePath, JSON.stringify(item, null, 2));
      }
      Logger.info('writed package', packagePath);
    } catch (error) {
      Logger.error(error);
    }
  }
}

function diffMerge(object: IPackage, from: IPackage, to: IPackage): IPackage {
  object = { ...object };
  Object.keys(from).forEach((key) => {
    delete object[key as keyof typeof from];
    Logger.warn('removed key', key);
  });
  Object.entries(to).forEach(([key, value]) => {
    object[key as keyof typeof to] = value;
    Logger.log('added key', key, value);
  });
  return object;
}

export function doPrepack() {
  let item = readPackage();
  if (item && item.prepack && item.postpack) {
    item = diffMerge(item, item.postpack, item.prepack);
    // Logger.log(item);
    writePackageSync(item);
  }
}

export function doPostpack() {
  let item = readPackage();
  if (item && item.prepack && item.postpack) {
    item = diffMerge(item, item.prepack, item.postpack);
    // Logger.log(item);
    writePackageSync(item);
  }
}

export function simulateError() {
  Logger.error('simulated error');
  process.exit(1);
}
